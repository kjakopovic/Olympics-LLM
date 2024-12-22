from base_test_setups import BaseTestSetup
from moto import mock_aws

import json
import jwt

import sys
import os

if 'validation_schema' in sys.modules:
    del sys.modules['validation_schema']

new_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'UpdateNews'))
sys.path.append(new_path)

from UpdateNews.lambda_handler import lambda_handler

@mock_aws
class TestUpdateNewsLambda(BaseTestSetup):
    def setUp(self):
        super().setUp()

    def test_when_user_unauthorized(self):
        """
        Test response when user is unauthorized.
        """
        
        # Arrange
        event = {
            'headers': {}
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 401)
        self.assertEqual(body['message'], "Invalid token, please login again")

    def test_when_request_body_is_empty(self):
        """
        Test response when request body for updating news is empty.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "test@mail.com", "role": 1}, "value", algorithm="HS256")

        event = {
            'headers': {
                'Authorization': jwt_token
            },
            "body": json.dumps({})
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(body['message'], "Nothing to update, your request body is empty")

    def test_when_news_id_is_not_sent(self):
        """
        Test response when news id is not sent in the parameters.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "test@mail.com", "role": 1}, "value", algorithm="HS256")

        event = {
            'headers': {
                'Authorization': jwt_token
            },
            "body": json.dumps({
                "title": "title"
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(body['message'], "News id is required")

    def test_when_user_permission_is_low(self):
        """
        Test response when users permission is not valid for news update.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "test@mail.com", "role": 1}, "value", algorithm="HS256")

        event = {
            'headers': {
                'Authorization': jwt_token
            },
            "pathParameters": {
                "news_id": "news_id"
            },
            "body": json.dumps({
                "title": "title"
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 403)
        self.assertEqual(body['message'], "You do not have permission to create news")

    def test_validation_schema(self):
        """
        Test response when validation schema is not satisfied.
        """

        jwt_token = jwt.encode({"email": "test@mail.com", "role": 100}, "value", algorithm="HS256")

        test_cases = [
            {
                "request_body": {
                    "new_field": "new_field"
                },
                "expected_validation_message": "data must not contain {'new_field'} properties"
            },
            {
                "request_body": {
                    "title": 1,
                },
                "expected_validation_message": "title must be string"
            },
            {
                "request_body": {
                    "title": "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890",
                },
                "expected_validation_message": "data.title must be shorter than or equal to 255 characters"
            },
            {
                "request_body": {
                    "description": 1,
                },
                "expected_validation_message": "description must be string"
            },
            {
                "request_body": {
                    "description": "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890",
                },
                "expected_validation_message": "data.description must be shorter than or equal to 255 characters"
            },
            {
                "request_body": {
                    "new_pictures_count": -1,
                },
                "expected_validation_message": "data.new_pictures_count must be bigger than or equal to 0"
            },
            {
                "request_body": {
                    "tags": [
                        1,
                        "tag1"
                    ]
                },
                "expected_validation_message": "must be string"
            },
            {
                "request_body": {
                    "tags": [
                        "tag1",
                        "tag1",
                        "tag1",
                    ]
                },
                "expected_validation_message": "data.tags must contain unique items"
            },
            {
                "request_body": {
                    "tags": [
                        "tag1",
                        "tag2",
                        "tag3",
                        "tag4",
                    ]
                },
                "expected_validation_message": "data.tags must contain less than or equal to 3 items"
            },
            {
                "request_body": {
                    "pictures_to_delete": [
                        1,
                        "pic1"
                    ]
                },
                "expected_validation_message": "must be string"
            },
            {
                "request_body": {
                    "pictures_to_delete": [
                        "pic1",
                        "pic1"
                    ]
                },
                "expected_validation_message": "data.pictures_to_delete must contain unique items"
            },
        ]
        
        for case in test_cases:
            with self.subTest(request_body=case["request_body"], expected_validation_message=case["expected_validation_message"]):
                # Arrange
                event = {
                    'headers': {
                        'Authorization': jwt_token
                    },
                    "pathParameters": {
                        "news_id": "news_id"
                    },
                    "body": json.dumps(case["request_body"])
                }

                # Act
                response = lambda_handler(event, {})
                body = json.loads(response['body'])
                
                self.assertEqual(response['statusCode'], 400)
                self.assertIn(case["expected_validation_message"], body['message'])

    def test_when_news_not_found(self):
        """
        Test response when news with provided id is not found.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "test@mail.com", "role": 100}, "value", algorithm="HS256")

        event = {
            'headers': {
                'Authorization': jwt_token
            },
            "pathParameters": {
                "news_id": "news_id"
            },
            "body": json.dumps({
                "title": "title"
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 404)
        self.assertEqual(body['message'], "News not found")

    def test_success(self):
        """
        Test response when news is updated successfully.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "test@mail.com", "role": 100}, "value", algorithm="HS256")

        event = {
            'headers': {
                'Authorization': jwt_token
            },
            "pathParameters": {
                "news_id": "my_uid"
            },
            "body": json.dumps({
                "title": "title"
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 200)
        self.assertIn("Successfully updated news with id", body['message'])
        self.assertIn("urls", body)

sys.path.remove(new_path)
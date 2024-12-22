from base_test_setups import BaseTestSetup
from moto import mock_aws

import json
import jwt

import sys
import os

if 'validation_schema' in sys.modules:
    del sys.modules['validation_schema']

new_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'CreateNews'))
sys.path.append(new_path)

from CreateNews.lambda_handler import lambda_handler

@mock_aws
class TestCreateNewsLambda(BaseTestSetup):
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

    def test_when_user_permission_is_low(self):
        """
        Test response when users permission is not valid for news creation.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "test@mail.com", "role": 1}, "value", algorithm="HS256")

        event = {
            'headers': {
                'Authorization': jwt_token
            }
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
                },
                "expected_validation_message": "data must contain ['description', 'picture_count', 'tags', 'title'] properties"
            },
            {
                "request_body": {
                    "title": "title",
                    "description": "description",
                    "picture_count": 1,
                    "tags": ["tag1"],
                    "new_field": "new_field"
                },
                "expected_validation_message": "data must not contain {'new_field'} properties"
            },
            {
                "request_body": {
                    "title": 1,
                    "description": "description",
                    "picture_count": 1,
                    "tags": ["tag1"]
                },
                "expected_validation_message": "title must be string"
            },
            {
                "request_body": {
                    "title": "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890",
                    "description": "description",
                    "picture_count": 1,
                    "tags": ["tag1"]
                },
                "expected_validation_message": "data.title must be shorter than or equal to 255 characters"
            },
            {
                "request_body": {
                    "title": "title",
                    "description": 1,
                    "picture_count": 1,
                    "tags": ["tag1"]
                },
                "expected_validation_message": "description must be string"
            },
            {
                "request_body": {
                    "title": "title",
                    "description": "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890",
                    "picture_count": 1,
                    "tags": ["tag1"]
                },
                "expected_validation_message": "data.description must be shorter than or equal to 255 characters"
            },
            {
                "request_body": {
                    "title": "title",
                    "description": "description",
                    "picture_count": 0,
                    "tags": ["tag1"]
                },
                "expected_validation_message": "data.picture_count must be bigger than or equal to 1"
            },
            {
                "request_body": {
                    "title": "title",
                    "description": "description",
                    "picture_count": 1,
                    "tags": [
                        1,
                        "tag1"
                    ]
                },
                "expected_validation_message": "must be string"
            },
            {
                "request_body": {
                    "title": "title",
                    "description": "description",
                    "picture_count": 1,
                    "tags": [
                    ]
                },
                "expected_validation_message": "data.tags must contain at least 1 items"
            },
            {
                "request_body": {
                    "title": "title",
                    "description": "description",
                    "picture_count": 1,
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
                    "title": "title",
                    "description": "description",
                    "picture_count": 1,
                    "tags": [
                        "tag1",
                        "tag2",
                        "tag3",
                        "tag4",
                    ]
                },
                "expected_validation_message": "data.tags must contain less than or equal to 3 items"
            },
        ]
        
        for case in test_cases:
            with self.subTest(request_body=case["request_body"], expected_validation_message=case["expected_validation_message"]):
                # Arrange
                event = {
                    'headers': {
                        'Authorization': jwt_token
                    },
                    "body": json.dumps(case["request_body"])
                }

                # Act
                response = lambda_handler(event, {})
                body = json.loads(response['body'])
                
                self.assertEqual(response['statusCode'], 400)
                self.assertIn(case["expected_validation_message"], body['message'])

    def test_success(self):
        """
        Test response when news is created successfully.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "test@mail.com", "role": 100}, "value", algorithm="HS256")

        event = {
            'headers': {
                'Authorization': jwt_token
            },
            "body": json.dumps({
                "title": "title",
                "description": "description",
                "picture_count": 1,
                "tags": ["tag1"]
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(body['message'], "News created successfully")
        self.assertIsNotNone(body['id'])
        self.assertIsNotNone(body['picture_urls'])

sys.path.remove(new_path)
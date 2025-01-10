from base_test_setups import BaseTestSetup
from moto import mock_aws

import json
import jwt

import sys
import os

if 'validation_schema' in sys.modules:
    del sys.modules['validation_schema']

new_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'UpdateUserInfo'))
sys.path.append(new_path)

from UpdateUserInfo.lambda_handler import lambda_handler

@mock_aws
class TestUpdateUserInfoLambda(BaseTestSetup):
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

    def test_when_invalid_email_in_token(self):
        """
        Test response when invalid email is in token. Probably because of malicious user.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": None, "role": 1}, "value", algorithm="HS256")
        
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
        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(body['message'], "Invalid email in jwt token")

    def test_validation_schema(self):
        """
        Test response when validation schema is not satisfied.
        """

        test_cases = [
            {
                "request_body": {
                    "new_field": "password123"
                },
                "expected_validation_message": "data must not contain {'new_field'} properties"
            },
            {
                "request_body": {
                    "first_name": ""
                },
                "expected_validation_message": "data.first_name must be longer than or equal to 1 characters"
            },
            {
                "request_body": {
                    "last_name": ""
                },
                "expected_validation_message": "data.last_name must be longer than or equal to 1 characters"
            },
            {
                "request_body": {
                    "first_name": "JohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohn"
                },
                "expected_validation_message": "data.first_name must be shorter than or equal to 50 characters"
            },
            {
                "request_body": {
                    "last_name": "DoeJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohn"
                },
                "expected_validation_message": "data.last_name must be shorter than or equal to 50 characters"
            },
            {
                "request_body": {
                    "phone_number": "385999999"
                },
                "expected_validation_message": "data.phone_number must match pattern"
            },
            {
                "request_body": {
                    "phone_number": "+385"
                },
                "expected_validation_message": "data.phone_number must be longer than or equal to 8 characters"
            },
            {
                "request_body": {
                    "phone_number": "+385testest"
                },
                "expected_validation_message": "data.phone_number must match pattern"
            },
            {
                "request_body": {
                    "phone_number": "+385993325806777"
                },
                "expected_validation_message": "data.phone_number must be shorter than or equal to 15 characters"
            },
            {
                "request_body": {
                    "tags": [
                        1,
                        "tag1",
                        "tag2"
                    ]
                },
                "expected_validation_message": "must be string"
            },
            {
                "request_body": {
                    "tags": [
                        "tag1",
                        "tag1",
                        "tag2"
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
                        "tag4"
                    ]
                },
                "expected_validation_message": "data.tags must contain less than or equal to 3 items"
            }
        ]
        
        for case in test_cases:
            with self.subTest(request_body=case["request_body"], expected_validation_message=case["expected_validation_message"]):
                # Arrange
                jwt_token = jwt.encode({"email": "test@mail.com", "role": 1}, "value", algorithm="HS256")

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

    def test_when_user_not_found(self):
        """
        Test response when user is not found with the given email from jwt token.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "notexist@mail.com", "role": 1}, "value", algorithm="HS256")
        
        event = {
            'headers': {
                'Authorization': jwt_token
            },
            "body": json.dumps({
                "first_name": "John"
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 404)
        self.assertEqual(body['message'], "User not found")

    def test_success(self):
        """
        Test response when user update is successfull.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "test@mail.com", "role": 1}, "value", algorithm="HS256")
        
        event = {
            'headers': {
                'Authorization': jwt_token
            },
            "body": json.dumps({
                "first_name": "John"
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(body['message'], "User has been updated")

sys.path.remove(new_path)
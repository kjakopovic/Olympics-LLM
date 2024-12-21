from base_test_setups import BaseUsersTest
from moto import mock_aws

import json

import sys
import os

new_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'LoginUser'))
sys.path.append(new_path)

from LoginUser.lambda_handler import lambda_handler

@mock_aws
class TestLoginUserLambda(BaseUsersTest):
    def setUp(self):
        super().setUp()

    def test_validation_schema(self):
        """Test response when validation schema is not satisfied."""
        test_cases = [
            {
                "request_body": {
                    "email": "test@mail.com"
                },
                "expected_validation_message": "data must contain ['password'] properties"
            },
            {
                "request_body": {
                    "email": "test@mail.com",
                    "password": "password123",
                    "new_field": "password123"
                },
                "expected_validation_message": "data must not contain {'new_field'} properties"
            },
            {
                "request_body": {
                    "email": "test",
                    "password": "password123"
                },
                "expected_validation_message": "data.email must be email"
            },
            {
                "request_body": {
                    "email": "test@mail.com",
                    "password": "pass"
                },
                "expected_validation_message": "data.password must be longer than or equal to 7 characters"
            }
        ]
        
        for case in test_cases:
            with self.subTest(request_body=case["request_body"], expected_validation_message=case["expected_validation_message"]):
                # Arrange
                event = {
                    "body": json.dumps(case["request_body"])
                }

                # Act
                response = lambda_handler(event, {})
                body = json.loads(response['body'])
                
                self.assertEqual(response['statusCode'], 400)
                self.assertIn(case["expected_validation_message"], body['message'])

    def test_when_user_not_found(self):
        """Test response when user email is not found."""
        
        # Arrange
        event = {
            "body": json.dumps({
                "email": "test2@mail.com",
                "password": "password123"
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(body['message'], "Wrong email or password. Please try again.")

    def test_when_user_password_incorrect(self):
        """Test response when user password is incorrect."""
        
        # Arrange
        event = {
            "body": json.dumps({
                "email": "test@mail.com",
                "password": "password123!!!"
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(body['message'], "Wrong email or password. Please try again.")

    def test_success(self):
        """Test response when user login is successfull."""
        
        # Arrange
        event = {
            "body": json.dumps({
                "email": "test@mail.com",
                "password": "password123"
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(body['message'], "User has been successfully logged in")
        self.assertIn("token", body)
        self.assertIn("refresh_token", body)

sys.path.remove(new_path)
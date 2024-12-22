from base_test_setups import BaseTestSetup
from moto import mock_aws

import json

import sys
import os

if 'validation_schema' in sys.modules:
    del sys.modules['validation_schema']

new_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ChangePassword'))
sys.path.append(new_path)

from ChangePassword.lambda_handler import lambda_handler

@mock_aws
class TestChangePasswordLambda(BaseTestSetup):
    def setUp(self):
        super().setUp()

    def test_validation_schema(self):
        """
        Test response when validation schema is not satisfied.
        """

        test_cases = [
            {
                "request_body": {
                    "email": "test2@mail.com",
                    "password": "password123"
                },
                "expected_validation_message": "data must contain ['new_password'] properties"
            },
            {
                "request_body": {
                    "email": "test2@mail.com",
                    "password": "password123",
                    "new_password": "password123!",
                    "new_field": "password123"
                },
                "expected_validation_message": "data must not contain {'new_field'} properties"
            },
            {
                "request_body": {
                    "email": "test",
                    "password": "password123",
                    "new_password": "password123!"
                },
                "expected_validation_message": "data.email must be email"
            },
            {
                "request_body": {
                    "email": "test2@mail.com",
                    "password": "pass",
                    "new_password": "password123!"
                },
                "expected_validation_message": "data.password must be longer than or equal to 7 characters"
            },
            {
                "request_body": {
                    "email": "test2@mail.com",
                    "password": "password123",
                    "new_password": "pass"
                },
                "expected_validation_message": "data.new_password must be longer than or equal to 7 characters"
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

    def test_when_user_doesnt_exists(self):
        """
        Test response when user doesn't exist.
        """
        
        # Arrange
        event = {
            "body": json.dumps({
                "email": "test2@mail.com",
                "password": "password123",
                "new_password": "password123!"
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(body['message'], "User with this email does not exist. Do you want to register instead?")

    def test_when_incorrect_password(self):
        """
        Test response when user enters incorrect current password.
        """
        
        # Arrange
        event = {
            "body": json.dumps({
                "email": "test@mail.com",
                "password": "password777",
                "new_password": "password123!"
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(body['message'], "Password is incorrect")

    def test_success(self):
        """
        Test response when user changes password successfully.
        """
        
        # Arrange
        event = {
            "body": json.dumps({
                "email": "test@mail.com",
                "password": "password123",
                "new_password": "password123!"
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(body['message'], "Password has been successfully changed")

sys.path.remove(new_path)
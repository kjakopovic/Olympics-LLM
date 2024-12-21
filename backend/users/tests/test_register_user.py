from base_test_setups import BaseUsersTest
from moto import mock_aws

import json

import sys
import os

if 'validation_schema' in sys.modules:
    del sys.modules['validation_schema']

new_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'RegisterUser'))
sys.path.append(new_path)

from RegisterUser.lambda_handler import lambda_handler

@mock_aws
class TestRegisterUserLambda(BaseUsersTest):
    def setUp(self):
        super().setUp()

    def test_validation_schema(self):
        """Test response when validation schema is not satisfied."""
        test_cases = [
            {
                "request_body": {
                    "email": "test2@mail.com",
                    "password": "password123",
                    "first_name": "John"
                },
                "expected_validation_message": "data must contain ['last_name'] properties"
            },
            {
                "request_body": {
                    "email": "test2@mail.com",
                    "password": "password123",
                    "first_name": "John",
                    "last_name": "Doe",
                    "new_field": "password123"
                },
                "expected_validation_message": "data must not contain {'new_field'} properties"
            },
            {
                "request_body": {
                    "email": "test",
                    "password": "password123",
                    "first_name": "John",
                    "last_name": "Doe"
                },
                "expected_validation_message": "data.email must be email"
            },
            {
                "request_body": {
                    "email": "test2@mail.com",
                    "password": "pass",
                    "first_name": "John",
                    "last_name": "Doe"
                },
                "expected_validation_message": "data.password must be longer than or equal to 7 characters"
            },
            {
                "request_body": {
                    "email": "test2@mail.com",
                    "password": "password123",
                    "first_name": "",
                    "last_name": "Doe"
                },
                "expected_validation_message": "data.first_name must be longer than or equal to 1 characters"
            },
            {
                "request_body": {
                    "email": "test2@mail.com",
                    "password": "password123",
                    "first_name": "John",
                    "last_name": ""
                },
                "expected_validation_message": "data.last_name must be longer than or equal to 1 characters"
            },
            {
                "request_body": {
                    "email": "test2@mail.com",
                    "password": "password123",
                    "first_name": "JohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohn",
                    "last_name": "Doe"
                },
                "expected_validation_message": "data.first_name must be shorter than or equal to 50 characters"
            },
            {
                "request_body": {
                    "email": "test2@mail.com",
                    "password": "password123",
                    "first_name": "John",
                    "last_name": "DoeJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohn"
                },
                "expected_validation_message": "data.last_name must be shorter than or equal to 50 characters"
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

    def test_when_user_already_exists(self):
        """Test response when user already exists, shouldn't be able to register the same user."""
        
        # Arrange
        event = {
            "body": json.dumps({
                "email": "test@mail.com",
                "password": "password123",
                "first_name": "John",
                "last_name": "Doe"
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(body['message'], "User with this email already exists. Do you want to login instead?")

    def test_success(self):
        """Test response when user registers successfully."""
        
        # Arrange
        event = {
            "body": json.dumps({
                "email": "test2@mail.com",
                "password": "password123",
                "first_name": "John",
                "last_name": "Doe"
            })
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(body['message'], "User has been successfully registered")

sys.path.remove(new_path)
from base_test_setups import BaseTestSetup
from moto import mock_aws

import json
import jwt

from DeleteUser.lambda_handler import lambda_handler

@mock_aws
class TestDeleteUserLambda(BaseTestSetup):
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
            }
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(body['message'], "Invalid email in jwt token")

    def test_when_user_not_found(self):
        """
        Test response when user is not found with the given email from jwt token.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "test2@mail.com", "role": 1}, "value", algorithm="HS256")
        
        event = {
            'headers': {
                'Authorization': jwt_token
            }
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(body['message'], "We could not delete your account. Please try again or contact support.")

    def test_success(self):
        """
        Test response when user is deleted successfully.
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
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(body['message'], "Deleted profile successfully.")
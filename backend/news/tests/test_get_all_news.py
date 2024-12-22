from base_test_setups import BaseTestSetup
from moto import mock_aws

import json
import jwt

from GetAllNews.lambda_handler import lambda_handler

@mock_aws
class TestGetAllNewsLambda(BaseTestSetup):
    def setUp(self):
        super().setUp()

    def test_success_unauthorized(self):
        """
        Test response for get all news when user is unauthorized.
        """
        
        # Arrange
        event = {
            "headers": {}
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(body['message'], "Fetched news successfully")
        self.assertEqual(body['item_count'], 1)
        self.assertIn('total_records_found', body)
        self.assertIn('items', body)

    def test_success_authorized_with_tags(self):
        """
        Test response for get all news when user is authorized and has tags, if no news are in those tags empty list is returned.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "test@mail.com", "role": 100}, "value", algorithm="HS256")

        event = {
            'headers': {
                'Authorization': jwt_token
            },
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(body['message'], "Fetched news successfully")
        self.assertEqual(body['item_count'], 0)
        self.assertIn('total_records_found', body)
        self.assertIn('items', body)

    def test_success_authorized_no_tags(self):
        """
        Test response for get all news when user is authorized but has no tags it should return all news.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "test2@mail.com", "role": 100}, "value", algorithm="HS256")

        event = {
            'headers': {
                'Authorization': jwt_token
            },
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(body['message'], "Fetched news successfully")
        self.assertEqual(body['item_count'], 1)
        self.assertIn('total_records_found', body)
        self.assertIn('items', body)

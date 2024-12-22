from base_test_setups import BaseTestSetup
from moto import mock_aws

import json

from GetNewsById.lambda_handler import lambda_handler

@mock_aws
class TestGetNewsByIdLambda(BaseTestSetup):
    def setUp(self):
        super().setUp()

    def test_when_news_id_not_found(self):
        """
        Test response when news id is not provided in path.
        """
        
        # Arrange
        event = {
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(body['message'], "News id is required")

    def test_when_news_not_found(self):
        """
        Test response when news by the provided news id are not found.
        """
        
        # Arrange
        event = {
            'pathParameters': {
                'news_id': 'news_id'
            }
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 404)
        self.assertEqual(body['message'], "News not found")

    def test_success(self):
        """
        Test response when news retrieved successfully.
        """
        
        # Arrange
        event = {
            'pathParameters': {
                'news_id': 'my_uid'
            }
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(body['message'], "Retrieved news successfully")
        self.assertIn('info', body)

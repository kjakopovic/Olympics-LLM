from base_test_setups import BaseTestSetup
from moto import mock_aws

import json
import jwt

from DeleteNews.lambda_handler import lambda_handler

@mock_aws
class TestDeleteNewsLambda(BaseTestSetup):
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

    def test_when_news_id_not_found(self):
        """
        Test response when news id is not provided in path.
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
        self.assertEqual(response['statusCode'], 400)
        self.assertEqual(body['message'], "News id is required")

    def test_when_user_permission_is_low(self):
        """
        Test response when users permission is not valid for news creation.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "test@mail.com", "role": 1}, "value", algorithm="HS256")

        event = {
            'headers': {
                'Authorization': jwt_token
            },
            'pathParameters': {
                'news_id': 'news_id'
            }
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 403)
        self.assertEqual(body['message'], "You do not have permission to delete news")

    def test_when_news_not_found(self):
        """
        Test response when news by the provided news id are not found.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "test@mail.com", "role": 100}, "value", algorithm="HS256")

        event = {
            'headers': {
                'Authorization': jwt_token
            },
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
        Test response when news deleted successfully.
        """
        
        # Arrange
        jwt_token = jwt.encode({"email": "test@mail.com", "role": 100}, "value", algorithm="HS256")

        event = {
            'headers': {
                'Authorization': jwt_token
            },
            'pathParameters': {
                'news_id': 'my_uid'
            }
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 200)
        self.assertIn("News deleted successfully alongside related pictures", body['message'])
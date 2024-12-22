from base_test_setups import BaseTestSetup
from moto import mock_aws

import json
import jwt

import sys
import os

if 'validation_schema' in sys.modules:
    del sys.modules['validation_schema']

new_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'GetAllSportsAchievements'))
sys.path.append(new_path)

from GetAllSportsAchievements.lambda_handler import lambda_handler

@mock_aws
class TestGetAllSportsAchievementsLambda(BaseTestSetup):
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

    def test_validation_schema(self):
        """
        Test response when validation schema is not satisfied.
        """

        test_cases = [
            {
                "request_query": {
                    "page": "1"
                },
                "expected_validation_message": "data must contain ['limit'] properties"
            },
            {
                "request_query": {
                    "limit": "1"
                },
                "expected_validation_message": "data must contain ['page'] properties"
            },
            {
                "request_query": {
                    "page": "test",
                    "limit": "1"
                },
                "expected_validation_message": "data.page must match pattern"
            },
            {
                "request_query": {
                    "page": "1",
                    "limit": "test"
                },
                "expected_validation_message": "data.limit must match pattern"
            },
            {
                "request_query": {
                    "page": "1",
                    "limit": "1",
                    "additional_field": 1
                },
                "expected_validation_message": "data must not contain {'additional_field'} properties"
            },
            {
                "request_query": {
                    "page": "1",
                    "limit": "1",
                    "medal": 1
                },
                "expected_validation_message": "medal must be string"
            },
            {
                "request_query": {
                    "page": "1",
                    "limit": "1",
                    "medal": ""
                },
                "expected_validation_message": "data.medal must be longer than or equal to 1 characters"
            },
            {
                "request_query": {
                    "page": "1",
                    "limit": "1",
                    "sportsman_name": 1
                },
                "expected_validation_message": "sportsman_name must be string"
            },
            {
                "request_query": {
                    "page": "1",
                    "limit": "1",
                    "sportsman_name": ""
                },
                "expected_validation_message": "data.sportsman_name must be longer than or equal to 1 characters"
            },
            {
                "request_query": {
                    "page": "1",
                    "limit": "1",
                    "sex": 1
                },
                "expected_validation_message": "sex must be string"
            },
            {
                "request_query": {
                    "page": "1",
                    "limit": "1",
                    "sex": "NOT_VALID"
                },
                "expected_validation_message": "sex must be one of ['M', 'F']"
            },
            {
                "request_query": {
                    "page": "1",
                    "limit": "1",
                    "sport": 1
                },
                "expected_validation_message": "sport must be string"
            },
            {
                "request_query": {
                    "page": "1",
                    "limit": "1",
                    "sport": ""
                },
                "expected_validation_message": "data.sport must be longer than or equal to 1 characters"
            },
            {
                "request_query": {
                    "page": "1",
                    "limit": "1",
                    "event": 1
                },
                "expected_validation_message": "event must be string"
            },
            {
                "request_query": {
                    "page": "1",
                    "limit": "1",
                    "event": ""
                },
                "expected_validation_message": "data.event must be longer than or equal to 1 characters"
            },
            {
                "request_query": {
                    "page": "1",
                    "limit": "1",
                    "country": 1
                },
                "expected_validation_message": "country must be string"
            },
            {
                "request_query": {
                    "page": "1",
                    "limit": "1",
                    "country": ""
                },
                "expected_validation_message": "data.country must be longer than or equal to 1 characters"
            },
        ]

        jwt_token = jwt.encode({"email": "test@mail.com", "role": 1}, "value", algorithm="HS256")
        
        for case in test_cases:
            with self.subTest(request_query=case["request_query"], expected_validation_message=case["expected_validation_message"]):
                # Arrange
                event = {
                    'headers': {
                        'Authorization': jwt_token
                    },
                    "queryStringParameters": case["request_query"]
                }

                # Act
                response = lambda_handler(event, {})
                body = json.loads(response['body'])
                
                self.assertEqual(response['statusCode'], 400)
                self.assertIn(case["expected_validation_message"], body['message'])

    def test_invalid_page_and_limit(self):
        """
        Test response when page and limit are invalid, less than 1.
        """

        test_cases = [
            {
                "request_query": {
                    "page": "1",
                    "limit": "0"
                }
            },
            {
                "request_query": {
                    "page": "0",
                    "limit": "1"
                }
            }
        ]

        jwt_token = jwt.encode({"email": "test@mail.com", "role": 1}, "value", algorithm="HS256")
        
        for case in test_cases:
            with self.subTest(request_query=case["request_query"]):
                # Arrange
                event = {
                    'headers': {
                        'Authorization': jwt_token
                    },
                    "queryStringParameters": case["request_query"]
                }

                # Act
                response = lambda_handler(event, {})
                body = json.loads(response['body'])
                
                self.assertEqual(response['statusCode'], 400)
                self.assertEqual(body['message'], "Page and limit should be greater than 0.")

    def test_success(self):
        """
        Test response when successfully get all sportsmen details.
        """

        # Arrange
        jwt_token = jwt.encode({"email": "test@mail.com", "role": 1}, "value", algorithm="HS256")
        
        event = {
            'headers': {
                'Authorization': jwt_token
            },
            "queryStringParameters": {
                "page": "1",
                "limit": "20"
            }
        }

        # Act
        response = lambda_handler(event, {})
        body = json.loads(response['body'])
        
        # Assert
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(body['message'], "List of sportsmen returned successfully")
        self.assertEqual(body['page'], 1)
        self.assertEqual(body['item_count'], 20)
        self.assertIn("total_records_found", body)
        self.assertIn("items", body)

sys.path.remove(new_path)
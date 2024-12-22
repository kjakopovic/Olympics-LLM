import unittest
import os
import bcrypt
import json
import datetime
from moto import mock_aws
from boto3 import resource, client

class LambdaS3Class:
    """
    AWS S3 Resource Class
    """
    def __init__(self, lambda_s3_client):
        """
        Initialize an S3 Resource
        """
        self.client = lambda_s3_client["client"]
        self.bucket_name = lambda_s3_client["bucket_name"]

class LambdaDynamoDBClass:
    """
    AWS DynamoDB Resource Class
    """
    def __init__(self, lambda_dynamodb_resource):
        """
        Initialize a DynamoDB Resource
        """
        self.resource = lambda_dynamodb_resource["resource"]
        self.table_name = lambda_dynamodb_resource["table_name"]
        self.table = self.resource.Table(self.table_name)

@mock_aws
class BaseTestSetup(unittest.TestCase):
    def setUp(self):
        # Environment variables
        os.environ["USERS_TABLE_NAME"] = "test_users_table"
        os.environ["NEWS_TABLE_NAME"] = "test_news_table"
        os.environ["JWT_SECRET_NAME"] = "secret"
        os.environ["SECRETS_REGION_NAME"] = "eu-central-1"
        os.environ["AWS_REGION"] = "eu-central-1"
        os.environ["NEWS_PICTURES_BUCKET"] = "test_bucket"

        # Mocked Secrets Manager
        self.secrets_manager = client('secretsmanager', region_name='eu-central-1')

        self.secrets_manager.create_secret(
            Name = os.environ["JWT_SECRET_NAME"],
            SecretString = json.dumps(
                {
                    "jwt_secret": "value",
                    "refresh_secret": "value2",
                })
        )
        
        self.secrets_manager.get_secret_value = {
            'SecretString': json.dumps({
                'jwt_secret': 'value',
                'refresh_secret': 'value2'
            })
        }

        # Mocked DynamoDB
        self.dynamodb = resource('dynamodb', region_name='eu-central-1')
        self.table = self.dynamodb.create_table(
            TableName=os.environ["USERS_TABLE_NAME"],
            KeySchema=[{"AttributeName": "email", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "email", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST"
        )
        self.table.meta.client.get_waiter('table_exists').wait(TableName=os.environ["USERS_TABLE_NAME"])

        self.news_table = self.dynamodb.create_table(
            TableName=os.environ["NEWS_TABLE_NAME"],
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST"
        )
        self.news_table.meta.client.get_waiter('table_exists').wait(TableName=os.environ["NEWS_TABLE_NAME"])

        # Sample data
        self.sample_user_raw_pass = "password123"

        self.sample_user = {
            "email": "test@mail.com",
            "first_name": "Test",
            "last_name": "User",
            "tags": [
                "notExistingTag"
            ],
            "password": bcrypt.hashpw(self.sample_user_raw_pass.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        }

        self.sample_user_no_tags = {
            "email": "test2@mail.com",
            "first_name": "Test",
            "last_name": "User",
            "password": bcrypt.hashpw(self.sample_user_raw_pass.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        }

        self.table.put_item(Item=self.sample_user)
        self.table.put_item(Item=self.sample_user_no_tags)

        self.sample_news = {
            "id": "my_uid",
            "published_at": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
            "title": "Test",
            "description": "kidajkfjadekijgfeakfjafjdauhfdjdA",
            "tags": ["tag1", "tag2"]
        }

        self.news_table.put_item(Item=self.sample_news)

        # Mocked S3
        self.s3_client = client('s3', region_name='eu-central-1')

        self.s3_client.create_bucket(
            Bucket=os.environ["NEWS_PICTURES_BUCKET"],
            CreateBucketConfiguration={
                'LocationConstraint': 'eu-central-1'
            }
        )
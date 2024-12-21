import unittest
import os
import bcrypt
import json
from moto import mock_aws
from boto3 import resource, client

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
class BaseUsersTest(unittest.TestCase):
    def setUp(self):
        # Environment variables
        os.environ["USERS_TABLE_NAME"] = "test_table"
        os.environ["JWT_SECRET_NAME"] = "secret"
        os.environ["SECRETS_REGION_NAME"] = "eu-central-1"

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

        # Sample user data
        self.sample_user_raw_pass = "password123"

        self.sample_user = {
            "email": "test@mail.com",
            "password": bcrypt.hashpw(self.sample_user_raw_pass.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        }

        self.table.put_item(Item=self.sample_user)
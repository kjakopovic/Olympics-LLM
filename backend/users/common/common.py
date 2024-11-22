from datetime import datetime, timezone, timedelta
from boto3 import client, resource
from os import environ
import jwt
import logging
import bcrypt
import boto3
import logging
import json

from aws_lambda_powertools.middleware_factory import lambda_handler_decorator

logger = logging.getLogger("UserCommon")
logger.setLevel(logging.INFO)

_LAMBDA_USERS_TABLE_RESOURCE = {
    "resource": resource("dynamodb"),
    "table_name": environ.get("USERS_TABLE_NAME", "test_table")
}


class LambdaS3Class:
    """
    AWS S3 Resource Class
    """
    def __init__(self):
        """
        Initialize an S3 Resource
        """
        self.client = lambda_s3_resource["client"]
        self.bucket_name = lambda_s3_resource["bucket_name"]
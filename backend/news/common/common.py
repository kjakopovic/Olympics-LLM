from boto3 import client, resource
from os import environ
import jwt
import logging
import boto3
import json

from aws_lambda_powertools.middleware_factory import lambda_handler_decorator

logger = logging.getLogger("NewsCommon")
logger.setLevel(logging.DEBUG)

_LAMBDA_NEWS_TABLE_RESOURCE = {
    "resource": resource("dynamodb"),
    "table_name": environ.get("NEWS_TABLE_NAME", "test_news_table")
}

_LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES = {
    "client": client("s3", region_name=environ.get("AWS_REGION", "eu-central-1")),
    "bucket_name": environ.get("NEWS_PICTURES_BUCKET", "iolap-project")
}

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


@lambda_handler_decorator
def lambda_middleware(handler, event, context):
    event_headers = event.get("headers")
    logger.info(f"Received Event Headers in middleware: {event_headers}")

    result = validate_jwt_token(event_headers)

    if result['statusCode'] != 200:
        logger.info(f"JWT Token validation failed")

        return result

    logger.info(f"JWT Token validation successful, proceeding with the request to the handler")

    try:
        authorization = event_headers.get("Authorization") or event_headers.get("authorization")

        if authorization:
            access_token = authorization.split(' ')[1] if ' ' in authorization else authorization
            event['headers']['x-access-token'] = access_token

            event['headers'].pop('Authorization', None)
            event['headers'].pop('authorization', None)

        return handler(event, context)
    except Exception as e:
        logger.error(f"{e}")

        return build_response(
            500,
            {
                "message": f"{e}"
            }
        )


def validate_jwt_token(event_headers):
    authorization = event_headers.get('Authorization') or event_headers.get('authorization')

    access_token = authorization.split(' ')[1] if ' ' in authorization else authorization
    refresh_token = event_headers.get('x-refresh-token')

    logger.info(f"Validating JWT token: {access_token}")

    secrets = get_secrets_from_aws_secrets_manager(
        environ.get('JWT_SECRET_NAME'),
        environ.get('SECRETS_REGION_NAME')
    )

    try:
        jwt.decode(access_token, secrets['jwt_secret'], algorithms=["HS256"])

        logger.info("JWT Token verified successfully")

        return { 'statusCode': 200}

    except jwt.ExpiredSignatureError:
        logger.info("JWT Token has expired, trying to refresh the token")
        return validate_refresh_token(refresh_token, secrets['refresh_secret'], secrets['jwt_secret'])

    except Exception as e:
        logger.error(f"Error in validating JWT token: {e}")
        return build_response(
            401,
            {
                "error": "Invalid JWT Token, please login again"
             }
        )


def validate_refresh_token(refresh_token, refresh_secret, jwt_secret):
    logger.info(f"Validating Refresh Token: {refresh_token}")

    try:
        jwt.decode(refresh_token, refresh_secret, algorithms=["HS256"])

        logger.info("Refresh token verified successfully, creating new JWT token")

        user_email = get_email_from_jwt_token(refresh_token)
        new_access_token = jwt.encode(
            {"email": user_email},
            jwt_secret,
            algorithm='HS256'
        )

        return build_response(
            200,
            {
                "message": "JWT token verified successfully"
            },
            {
                'x-access-token': new_access_token,
                'Content-Type': 'application/json'
            }
        )

    except jwt.ExpiredSignatureError:
        return build_response(
            401,
            {
                "error": "Refresh Token has expired, please login again"
            }
        )

    except Exception as e:
        logger.error(f"Error in validating Refresh Token: {e}")
        return build_response(
            401,
            {
                "error": "Invalid Refresh Token, please login again"
            }
        )


def get_email_from_jwt_token(token):
    secrets = get_secrets_from_aws_secrets_manager(
        environ.get('JWT_SECRET_NAME'),
        environ.get('SECRETS_REGION_NAME')
    )

    decoded_jwt = jwt.decode(token.encode('utf-8'), secrets["jwt_secret"], algorithms=["HS256"])

    return decoded_jwt.get('email')


def build_response(status_code, body, headers=None):
    return {
        'statusCode': status_code,
        headers if headers else 'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body)
    }


def get_secrets_from_aws_secrets_manager(secret_name, region_name):
    try:
        secrets_manager = boto3.client(
            service_name='secretsmanager',
            region_name=region_name
        )

        secret_string = secrets_manager.get_secret_value(SecretId=secret_name)
        return json.loads(secret_string['SecretString'])
    except Exception as e:
        logger.error(f"Error in getting secrets from AWS Secrets Manager: {e}")
        return None


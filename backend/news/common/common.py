from datetime import datetime, timezone, timedelta
from boto3 import client, resource
from os import environ
import jwt
import bcrypt
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

_LAMBDA_USERS_TABLE_RESOURCE = {
    "resource": resource("dynamodb"),
    "table_name": environ.get("USERS_TABLE_NAME", "test_users_table")
}

_LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES = {
    "client": client("s3", region_name=environ.get("AWS_REGION", "eu-central-1")),
    "bucket_name": environ.get("NEWS_PICTURES_BUCKET", "test_bucket")
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

def generate_jwt_token(email, user_permissions=1):
    secrets = get_secrets_from_aws_secrets_manager(
        environ.get('JWT_SECRET_NAME'),
        environ.get('SECRETS_REGION_NAME')
    )

    expiration_time = int((datetime.now(timezone.utc) + timedelta(hours=1)).timestamp())

    logger.debug(f"Generating JWT token for email: {email}")

    return jwt.encode({"email": email, "role": user_permissions, "exp": expiration_time}, secrets['jwt_secret'], algorithm="HS256")

def generate_refresh_token(email, user_permissions=1):
    secrets = get_secrets_from_aws_secrets_manager(
        environ.get('JWT_SECRET_NAME'),
        environ.get('SECRETS_REGION_NAME')
    )

    logger.debug(f"Generating refresh token for email: {email}")

    expiration_time = int((datetime.now(timezone.utc) + timedelta(days=1)).timestamp())

    return jwt.encode({"email": email, "role": user_permissions, "exp": expiration_time}, secrets['refresh_secret'], algorithm="HS256")

@lambda_handler_decorator
def lambda_middleware(handler, event, context):
    event_headers = event.get("headers")
    logger.info(f"Received Event Headers in middleware: {event_headers}")

    result = validate_jwt_token(event_headers)

    if result['statusCode'] != 200:
        logger.info(f"JWT Token validation failed, returning to the client")

        return result

    logger.info("JWT token validation passed, continuing to the handler")

    try:
        authorization = event_headers.get("Authorization") or event_headers.get("authorization")

        logger.debug(f"Authorization header: {authorization}")

        if authorization:
            access_token = authorization.split(' ')[1] if ' ' in authorization else authorization
            event['headers']['x-access-token'] = access_token

            event['headers'].pop('Authorization', None)
            event['headers'].pop('authorization', None)

        return handler(event, context)
    except Exception as e:
        logger.error(f"Error in the handler: {e}")

        return build_response(
            500,
            {
                "message": "Internal server error"
            }
        )

def validate_jwt_token(event_headers):
    logger.debug("Getting authorization from the headers")
    authorization = event_headers.get('Authorization') or event_headers.get('authorization')

    logger.debug("Fetching tokens from the authorization")
    access_token = authorization.split(' ')[1] if authorization and ' ' in authorization else authorization
    refresh_token = event_headers.get('x-refresh-token')

    logger.info(f"Validating JWT token: {access_token}")

    secrets = get_secrets_from_aws_secrets_manager(
        environ.get('JWT_SECRET_NAME'),
        environ.get('SECRETS_REGION_NAME')
    )

    try:
        logger.debug("Verifying JWT token")
        jwt.decode(access_token, secrets['jwt_secret'], algorithms=["HS256"])

        logger.info("JWT token verified successfully, continuing to the handler")

        return { 'statusCode': 200}

    except jwt.ExpiredSignatureError:
        logger.info("JWT token expired, verifying refresh token")
        return validate_refresh_token(refresh_token, secrets['refresh_secret'], secrets['jwt_secret'])

    except Exception as e:
        logger.error(f"Error verifying JWT token: {e}")

        return build_response(
            401,
            {
                "message": "Invalid token, please login again"
            }
        )

def validate_refresh_token(refresh_token, refresh_secret, jwt_secret):
    try:
        logger.debug("Verifying refresh token")
        jwt.decode(refresh_token, refresh_secret, algorithms=["HS256"])

        logger.info("Refresh token verified successfully, creating new JWT token")

        expiration_time = int((datetime.now(timezone.utc) + timedelta(hours=1)).timestamp())
        user_email = get_email_from_jwt_token(refresh_token)
        user_permissions = get_role_from_jwt_token(refresh_token)
        new_jwt_token = jwt.encode({"email": user_email, "role": user_permissions, "exp": expiration_time}, jwt_secret, algorithm="HS256")

        logger.info(f"New JWT token created successfully for email: {user_email}")

        return build_response(
            200,
            {
                "message": "JWT token verified successfully"
            },
            {
                'x-access-token': new_jwt_token,
                'Content-Type': 'application/json'
            }
        )
    except Exception as e:
        logger.error(f"Error verifying refresh token: {e}")

        return build_response(
            401,
            {
                "message": "Token expired"
            }
        )

def get_email_from_jwt_token(token):
    if not token:
        logger.warning("No token provided")
        return None

    secrets = get_secrets_from_aws_secrets_manager(
        environ.get('JWT_SECRET_NAME'),
        environ.get('SECRETS_REGION_NAME')
    )

    try:
        logger.debug("Decoding JWT token")
        decoded_jwt = jwt.decode(token.encode('utf-8'), secrets["jwt_secret"], algorithms=["HS256"])
    except Exception as e:
        logger.error(f"Error decoding JWT token {e}")
        return None

    email = decoded_jwt.get('email')

    logger.debug(f"Returning email from the JWT token: {email}")
    return email

def get_role_from_jwt_token(token):
    if not token:
        logger.warning("No token provided")
        return None

    secrets = get_secrets_from_aws_secrets_manager(
        environ.get('JWT_SECRET_NAME'),
        environ.get('SECRETS_REGION_NAME')
    )

    try:
        logger.debug("Decoding JWT token")
        decoded_jwt = jwt.decode(token.encode('utf-8'), secrets["jwt_secret"], algorithms=["HS256"])
    except Exception as e:
        logger.error(f"Error decoding JWT token {e}")
        return None

    return decoded_jwt.get('role')

def get_user_permissions_for_role(user_role):
    logger.info(f"Getting permissions for role: {user_role}")
    
    if user_role == 'admin':
        return 100
    
    return 1

def get_secrets_from_aws_secrets_manager(secret_id, region_name):
    try:
        secrets_manager = boto3.client(
            service_name='secretsmanager',
            region_name=region_name
        )

        secret_string = secrets_manager.get_secret_value(
            SecretId=secret_id
        )

        return json.loads(secret_string['SecretString'])
    except Exception as e:
        logger.error(f'Failed to retrieve secrets: {str(e)}')
        return None

def build_response(status_code, body, headers=None):
    return {
        'statusCode': status_code,
        headers if headers else 'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body)
    }

def hash_password(password, salt_rounds=5):
    salt = bcrypt.gensalt(rounds=salt_rounds)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

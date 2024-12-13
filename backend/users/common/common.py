from datetime import datetime, timezone, timedelta
from boto3 import resource
from os import environ
import jwt
import logging
import bcrypt
import boto3
import logging
import json

from aws_lambda_powertools.middleware_factory import lambda_handler_decorator

logger = logging.getLogger("UserCommon")
logger.setLevel(logging.DEBUG)

_LAMBDA_USERS_TABLE_RESOURCE = {
    "resource" : resource('dynamodb'),
    "table_name" : environ.get("USERS_TABLE_NAME", "test_table")
}

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

def generate_jwt_token(email):
    secrets = get_secrets_from_aws_secrets_manager(
        environ.get('JWT_SECRET_NAME'),
        environ.get('SECRETS_REGION_NAME')
    )

    expiration_time = int((datetime.now(timezone.utc) + timedelta(hours=1)).timestamp())

    return jwt.encode({"email": email, "exp": expiration_time}, secrets['jwt_secret'], algorithm="HS256")

def generate_refresh_token(email):
    secrets = get_secrets_from_aws_secrets_manager(
        environ.get('JWT_SECRET_NAME'),
        environ.get('SECRETS_REGION_NAME')
    )

    expiration_time = int((datetime.now(timezone.utc) + timedelta(days=1)).timestamp())

    return jwt.encode({"email": email, "exp": expiration_time}, secrets['refresh_secret'], algorithm="HS256")

@lambda_handler_decorator
def lambda_middleware(handler, event, context):
    event_headers = event.get('headers')
    logger.info(f"Received event in the middleware: {event_headers}")

    result = validate_jwt_token(event_headers)

    if result['statusCode'] != 200:
        logger.info("JWT token validation failed, returning to the client")

        return result

    logger.info("JWT token validation passed, continuing to the handler")

    try:
        authorization = event_headers.get('Authorization') or event_headers.get('authorization')

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
                "error": "Internal server error"
            }
        )

def validate_jwt_token(event_headers):
    authorization = event_headers.get('Authorization') or event_headers.get('authorization')

    access_token = authorization.split(' ')[1] if authorization and ' ' in authorization else authorization
    refresh_token = event_headers.get('x-refresh-token')

    logger.info(f"Validating JWT token: {access_token}")

    secrets = get_secrets_from_aws_secrets_manager(
        environ.get('JWT_SECRET_NAME'),
        environ.get('SECRETS_REGION_NAME')
    )

    try:
        jwt.decode(access_token.encode('utf-8'), secrets["jwt_secret"], algorithms=["HS256"])

        logger.info("JWT token verified successfully, continuing to the handler")

        return {
            'statusCode': 200
        }

    except jwt.ExpiredSignatureError:
        return validate_refresh_token(refresh_token, secrets["refresh_secret"], secrets["jwt_secret"])

    except Exception as e:
        logger.error(f"Error verifying JWT token: {e}")

        return build_response(
            401,
            {
                "error": "Invalid token, please login again"
            }
        )

def validate_refresh_token(refresh_token, refresh_secret, jwt_secret):
    try:
        jwt.decode(refresh_token, refresh_secret, algorithms=["HS256"])

        logger.info("Refresh token verified successfully, creating new JWT token")

        user_email = get_email_from_jwt_token(refresh_token)
        new_jwt_token = jwt.encode({"email": user_email}, jwt_secret, algorithm="HS256")

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
                "error": "Token expired"
            }
        )

def get_email_from_jwt_token(token):
    if not token:
        return None

    secrets = get_secrets_from_aws_secrets_manager(
        environ.get('JWT_SECRET_NAME'),
        environ.get('SECRETS_REGION_NAME')
    )

    try:
        decoded_jwt = jwt.decode(token.encode('utf-8'), secrets["jwt_secret"], algorithms=["HS256"])
    except Exception:
        return None

    return decoded_jwt.get('email')

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

from datetime import datetime, timezone, timedelta
from os import environ
import jwt
import logging
import bcrypt
import boto3
import logging
import json

from aws_lambda_powertools.middleware_factory import lambda_handler_decorator

logger = logging.getLogger("SportsCommon")
logger.setLevel(logging.INFO)

class ValidationError(Exception):
    """An error that should be thrown when validation on the request fails."""
    def __init__(self, message="Invalid request data"):
        super().__init__(message)

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

    expiration_time = int((datetime.now(timezone.utc) + timedelta(days=1)).timestamp())

    logger.debug(f"Generating refresh token for email: {email}")

    return jwt.encode({"email": email, "role": user_permissions, "exp": expiration_time}, secrets['refresh_secret'], algorithm="HS256")

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

        logger.debug(f"Authorization header: {authorization}")

        if authorization:
            access_token = authorization.split(' ')[1] if ' ' in authorization else authorization
            event['headers']['x-access-token'] = access_token

            event['headers'].pop('Authorization', None)
            event['headers'].pop('authorization', None)

        return handler(event, context)
    except ValidationError as e:
        logger.error(f"Error in the handler: {e}")

        return build_response(
            400,
            {
                "message": str(e)
            }
        )
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

    secrets = get_secrets_from_aws_secrets_manager(
        environ.get('JWT_SECRET_NAME'),
        environ.get('SECRETS_REGION_NAME')
    )

    try:
        logger.debug("Verifying JWT token")
        jwt.decode(access_token.encode('utf-8'), secrets["jwt_secret"], algorithms=["HS256"])

        logger.info("JWT token verified successfully, continuing to the handler")

        return {
            'statusCode': 200
        }

    except jwt.ExpiredSignatureError:
        logger.info("JWT token expired, verifying refresh token")
        return validate_refresh_token(refresh_token, secrets["refresh_secret"], secrets["jwt_secret"])

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

        logger.info("New JWT token created successfully")

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
    except Exception:
        logger.error("Error decoding JWT token")
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
    except Exception:
        logger.error("Error decoding JWT token")
        return None

    role = decoded_jwt.get('role')

    logger.debug(f"Returning role from the JWT token: {role}")
    return role

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

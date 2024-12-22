import json
import bcrypt
import logging

from validation_schema import schema
from dataclasses import dataclass
from aws_lambda_powertools.utilities.validation import SchemaValidationError, validate

logger = logging.getLogger("LoginUser")
logger.setLevel(logging.DEBUG)

from common.common import (
    _LAMBDA_USERS_TABLE_RESOURCE,
    generate_jwt_token,
    generate_refresh_token,
    build_response,
    get_user_permissions_for_role,
    LambdaDynamoDBClass
)

@dataclass
class Request:
    email: str
    password: str

def lambda_handler(event, context):
    logger.debug(f"Received event {event}")
    request_body = json.loads(event.get('body')) if 'body' in event else event

    try:
        logger.debug(f"Validating request {request_body}")
        validate(event=request_body, schema=schema)
    except SchemaValidationError as e:
        logger.error(f"Validation failed: {e}")
        return build_response(400, {'message': str(e)})
    
    logger.info("Parsing request body")
    request = Request(**request_body)

    global _LAMBDA_USERS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_USERS_TABLE_RESOURCE)

    return login_user(dynamodb, request.email, request.password)

def login_user(dynamodb, email, password):
    user = get_user_by_email(dynamodb, email)

    if not user or not verify_password(password, user.get("password", "")):
        logger.debug(f"User with email {email} does not exist or password is incorrect")
        return build_response(
            400,
            {
                'message': 'Wrong email or password. Please try again.'
            }
        )
    
    user_role = user.get('role', 'user')
    user_permissions = get_user_permissions_for_role(user_role)

    access_token = generate_jwt_token(email, user_permissions)
    refresh_token = generate_refresh_token(email, user_permissions)

    if not access_token or not refresh_token:
        logger.error(f"Unable to generate tokens for user {email}")
        return build_response(
            500,
            {
                'message': "Unable to generate tokens. Please contact support."
            }
        )

    return build_response(
        200,
        {
            'message': 'User has been successfully logged in',
            'token': access_token,
            'refresh_token': refresh_token
        }
    )

def get_user_by_email(dynamodb, email):
    logger.info(f'Getting user by email {email}')
    user = dynamodb.table.get_item(
        Key={
            'email': email
        }
    )

    return user.get('Item')

def verify_password(user_password, stored_password):
    logger.info('Verifying password')
    return bcrypt.checkpw(user_password.encode('utf-8'), stored_password.encode('utf-8'))

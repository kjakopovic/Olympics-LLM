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
    LambdaDynamoDBClass
)

@dataclass
class Request:
    email: str
    password: str

def lambda_handler(event, context):
    request_body = json.loads(event.get('body')) if 'body' in event else event

    logger.info(f'Checking if every required attribute is found in body: {request_body}')

    try:
        validate(event=request_body, schema=schema)
    except SchemaValidationError as e:
        return build_response(400, {'message': str(e)})

    email = request_body.get('email')
    password = request_body.get('password')

    global _LAMBDA_USERS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_USERS_TABLE_RESOURCE)

    return login_user(dynamodb, email, password)

def login_user(dynamodb, email, password):
    user = get_user_by_email(dynamodb, email)

    if not user or not verify_password(password, user.get("password", "")):
        return build_response(
            400,
            {
                'message': 'Wrong email or password. Please try again.'
            }
        )

    access_token = generate_jwt_token(email)
    refresh_token = generate_refresh_token(email)

    if not access_token or not refresh_token:
        return build_response(
            500,
            {
                'message': f"Unable to generate tokens. Please contact support."
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

def update_refresh_token(dynamodb, email, refresh_token):
    logger.info('Updating refresh token in the database')

    dynamodb.table.update_item(
        Key={
            'email': email
        },
        UpdateExpression='SET refresh_token = :refreshToken',
        ExpressionAttributeValues={
            ':refreshToken': refresh_token
        }
    )

def get_user_by_email(dynamodb, email):
    logger.info('Getting user by email')

    user = dynamodb.table.get_item(
        Key={
            'email': email
        }
    )

    return user.get('Item')

def verify_password(user_password, stored_password):
    logger.info('Verifying password')

    return bcrypt.checkpw(user_password.encode('utf-8'), stored_password.encode('utf-8'))

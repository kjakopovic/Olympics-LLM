import json
import logging

from validation_schema import schema
from dataclasses import dataclass
from aws_lambda_powertools.utilities.validation import SchemaValidationError, validate

logger = logging.getLogger("RegisterUser")
logger.setLevel(logging.DEBUG)

from common.common import (
    _LAMBDA_USERS_TABLE_RESOURCE,
    build_response,
    hash_password,
    LambdaDynamoDBClass
)

@dataclass
class Request:
    email: str
    password: str
    first_name: str
    last_name: str

def lambda_handler(event, context):
    request_body = json.loads(event.get('body')) if 'body' in event else event

    logger.info(f"Checking if every required attribute is found: {request_body}")

    try:
        validate(event=request_body, schema=schema)
    except SchemaValidationError as e:
        return build_response(400, {'message': str(e)})

    email = request_body.get('email')
    password = request_body.get('password')
    first_name = request_body.get('first_name')
    last_name = request_body.get('last_name')

    global _LAMBDA_USERS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_USERS_TABLE_RESOURCE)

    return register_user(dynamodb, email, password, first_name, last_name)

def register_user(dynamodb, email, password, first_name, last_name):
    is_user_found = check_if_user_exists(dynamodb, email)

    if is_user_found:
        return build_response(
            400,
            {
                'message': 'User with this email already exists. Do you want to login instead?'
            }
        )

    hashed_password = hash_password(password)

    add_user_to_the_table(dynamodb, {
        'email': email,
        'password': hashed_password,
        'first_name': first_name,
        'last_name': last_name
    })

    logger.info(f"User {email} has been successfully registered")

    return build_response(200, {'message': 'User has been successfully registered'})

def check_if_user_exists(dynamodb, email):
    logger.info(f"Checking if user with email {email} exists")

    response = dynamodb.table.get_item(Key={'email': email})

    return 'Item' in response

def add_user_to_the_table(dynamodb, user):
    logger.info(f"Adding user {user['email']} to the table")

    dynamodb.table.put_item(Item=user)

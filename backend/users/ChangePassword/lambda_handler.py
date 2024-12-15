import json
import logging
import bcrypt

from validation_schema import schema
from dataclasses import dataclass
from aws_lambda_powertools.utilities.validation import SchemaValidationError, validate

logger = logging.getLogger("ChangePassword")
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
    new_password: str

def lambda_handler(event, context):
    request_body = json.loads(event.get('body')) if 'body' in event else event

    logger.info(f"Checking if every required attribute is found: {request_body}")

    try:
        validate(event=request_body, schema=schema)
    except SchemaValidationError as e:
        return build_response(400, {'message': str(e)})

    email = request_body.get('email')
    password = request_body.get('password')
    new_password = request_body.get('new_password')

    global _LAMBDA_USERS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_USERS_TABLE_RESOURCE)

    return change_password(dynamodb, email, password, new_password)

def change_password(dynamodb, email, old_password, new_password):

    try:
        user = check_if_user_exists(dynamodb, email)
        if not user:
            return build_response(
                400,
                {
                    'message': 'User with this email does not exist. Do you want to register instead?'
                }
            )

        verified_password = verify_password(old_password, user['password'])
        if not verified_password:
            return build_response(
                400,
                {
                    'message': 'Password is incorrect'
                }
            )

        update_password(dynamodb, email, new_password)
        return build_response(
            200,
            {
                'message': 'Password has been successfully changed'
            }
        )
    except Exception as e:
        logger.error(f"Error changing password for user {email}: {e}")
        return build_response(500, {'message': 'Error changing password'})

def check_if_user_exists(dynamodb, email):
    logger.info(f"Checking if user with email {email} exists")
    response = dynamodb.table.get_item(Key={'email': email})

    return response.get('Item')

def verify_password(password, saved_password):
    logger.info(f"Verifying password")
    return bcrypt.checkpw(password.encode('utf-8'), saved_password.encode('utf-8'))

def update_password(dynamodb, email, new_password):
    logger.info(f"Updating password for user {email}")
    try:
        hashed_password = hash_password(new_password)

        dynamodb.table.update_item(
            Key={'email': email},
            UpdateExpression="set password = :p",
            ExpressionAttributeValues={
                ':p': hashed_password
            }
        )

        logger.info(f"Password for user {email} has been successfully updated")
    except Exception as e:
        logger.error(f"Error updating password for user {email}: {e}")
        return build_response(500, {'message': 'Error updating password'})

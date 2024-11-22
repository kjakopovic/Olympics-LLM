import json
import logging

logger = logging.getLogger("RegisterUser")
logger.setLevel(logging.INFO)

from common.common import (
    _LAMBDA_USERS_TABLE_RESOURCE,
    build_response,
    hash_password,
    LambdaDynamoDBClass
)


# TODO: Check if this for required and missing params is needed and if it is implemented correctly
def lambda_handler(event, context):
    event = json.loads(event.get('body')) if 'body' in event else event

    logger.info(f"Checking if every required attribute is found: {event}")

    try:
        email = event['email']
        password = event['password']
        username = event['username']
    except Exception as e:
        return build_response(
            400,
            {
                'message': f'{e} is missing, please check and try again'
            }
        )

    global _LAMBDA_USERS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_USERS_TABLE_RESOURCE)

    return register_user(dynamodb, email, password, username)


def register_user(dynamodb, email, password, username):
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
        'username': username
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

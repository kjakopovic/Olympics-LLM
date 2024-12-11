import json
import logging

from validation_schema import schema
from dataclasses import dataclass
from aws_lambda_powertools.utilities.validation import SchemaValidationError, validate

logger = logging.getLogger("UpdateUserInfo")
logger.setLevel(logging.DEBUG)

from common.common import (
    _LAMBDA_USERS_TABLE_RESOURCE,
    lambda_middleware,
    build_response,
    get_email_from_jwt_token,
    LambdaDynamoDBClass
)

@dataclass
class Request:
    email: str
    password: str
    first_name: str
    last_name: str
    phone_number: str
    tags: list


@lambda_middleware
def lambda_handler(event, context):
    """
    Lambda handler for updating user info
    """
    jwt_token = event.get('headers').get('x-access-token')
    email = get_email_from_jwt_token(jwt_token)

    if not email:
        return build_response(
            400,
            {
                'message': 'Unable to get email from jwt token'
            }
        )

    global _LAMBDA_USERS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_USERS_TABLE_RESOURCE)

    request_body = json.loads(event.get('body', '{}'))

    try:
        validate(event=request_body, schema=schema)
    except SchemaValidationError as e:
        return build_response(400, {'message': str(e)})

    password = request_body.get('password') or None
    first_name = request_body.get('first_name') or None
    last_name = request_body.get('last_name') or None
    phone_number = request_body.get('phone_number') or None
    tags = request_body.get('tags') or None

    logger.info(f'Updating user with email: {email}')
    update_user(dynamodb, email, password, first_name, last_name, phone_number, tags)

    return build_response(
        200,
        {
            'message': f'User with email: {email} has been updated'
        }
    )

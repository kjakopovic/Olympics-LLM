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
    first_name: str | None = None
    last_name: str | None = None
    phone_number: str | None = None
    tags: list | None = None

@lambda_middleware
def lambda_handler(event, context):
    logger.debug(f"Received event {event}")
    jwt_token = event.get('headers').get('x-access-token')
    email = get_email_from_jwt_token(jwt_token)

    if not email:
        return build_response(
            400,
            {
                'message': 'Invalid email in jwt token'
            }
        )
    
    request_body = json.loads(event.get('body'))

    try:
        logger.debug(f"Validating request body {request_body}")
        validate(event=request_body, schema=schema)
    except SchemaValidationError as e:
        logger.error(f"Invalid request: {str(e)}")
        return build_response(400, {'message': str(e)})
    
    logger.debug("Parsing request body")
    request = Request(**request_body)

    global _LAMBDA_USERS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_USERS_TABLE_RESOURCE)

    user = check_if_user_exists(dynamodb, email)

    if not user:
        logger.error(f"User with email {email} does not exist")
        return build_response(
            404,
            {
                'message': 'User not found'
            }
        )

    update_user(dynamodb, email, request.first_name, request.last_name, request.phone_number, request.tags)

    return build_response(
        200,
        {
            'message': 'User has been updated'
        }
    )

def update_user(dynamodb, email, first_name, last_name, phone_number, tags):
    logger.info(f'Updating user with email: {email}')

    update_expression = 'SET '
    expression_attribute_values = {}

    if first_name:
        logger.debug(f"Updating first name to {first_name}")
        update_expression += 'first_name = :first_name, '
        expression_attribute_values[':first_name'] = first_name
    if last_name:
        logger.debug(f"Updating last name to {last_name}")
        update_expression += 'last_name = :last_name, '
        expression_attribute_values[':last_name'] = last_name
    if phone_number:
        logger.debug(f"Updating phone number to {phone_number}")
        update_expression += 'phone_number = :phone_number, '
        expression_attribute_values[':phone_number'] = phone_number
    if tags:
        logger.debug(f"Updating tags to {tags}")
        tags = move_tags_to_lowercase(tags)
    
    update_expression += 'tags = :tags, '
    expression_attribute_values[':tags'] = tags

    dynamodb.table.update_item(
        Key={'email': email},
        UpdateExpression=update_expression.rstrip(', '),
        ExpressionAttributeValues=expression_attribute_values
    )

def move_tags_to_lowercase(tags):
    return [tag.lower() for tag in tags]

def check_if_user_exists(dynamodb, email):
    logger.info(f'Checking if user with email: {email} exists')
    response = dynamodb.table.get_item(
        Key={
            'email': email
        }
    )

    return response.get('Item')
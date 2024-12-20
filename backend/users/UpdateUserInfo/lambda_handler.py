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
    request_body = json.loads(event.get('body')) if 'body' in event else event

    jwt_token = event.get('headers').get('x-access-token')
    email = get_email_from_jwt_token(jwt_token)

    if not email:
        return build_response(
            400,
            {
                'message': 'Unable to get email from jwt token'
            }
        )

    try:
        validate(event=request_body, schema=schema)
    except SchemaValidationError as e:
        return build_response(400, {'message': str(e)})
    
    try:
        request = Request(**request_body)
    except TypeError as e:
        return build_response(400, {'message': f"Invalid request: {str(e)}"})

    global _LAMBDA_USERS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_USERS_TABLE_RESOURCE)

    user = dynamodb.table.get_item(Key={'email': email})
    if not user:
        return build_response(
            400,
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
        update_expression += 'first_name = :first_name, '
        expression_attribute_values[':first_name'] = first_name
    if last_name:
        update_expression += 'last_name = :last_name, '
        expression_attribute_values[':last_name'] = last_name
    if phone_number:
        update_expression += 'phone_number = :phone_number, '
        expression_attribute_values[':phone_number'] = phone_number
    if tags:
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
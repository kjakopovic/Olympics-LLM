import json
import logging
import phonenumbers
from phonenumbers import NumberParseException

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

    # TODO: Check if this is needed since not all fields are required
    try:
        validate(event=request_body, schema=schema)
    except SchemaValidationError as e:
        return build_response(400, {'message': str(e)})

    user = dynamodb.table.get_item(Key={'email': email})
    if not user:
        return build_response(
            400,
            {
                'message': 'User not found'
            }
        )

    first_name = request_body.get('first_name')
    last_name = request_body.get('last_name')
    phone_number = request_body.get('phone_number')
    tags = request_body.get('tags')

    valid_phone_number = validate_phone_number(phone_number)

    if not valid_phone_number.get('valid'):
        return build_response(
            400,
            {
                'message': 'Invalid phone number'
            }
        )

    formatted_phone_number = valid_phone_number.get('formatted')

    update_user(dynamodb, email, first_name, last_name, formatted_phone_number, tags)

    return build_response(
        200,
        {
            'message': f'User with email: {email} has been updated'
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
        update_expression += 'tags = :tags, '
        expression_attribute_values[':tags'] = tags

    dynamodb.table.update_item(
        Key={'email': email},
        UpdateExpression=update_expression.rstrip(', '),
        ExpressionAttributeValues=expression_attribute_values
    )


# TODO: Check if phone number needs to be both valid and possible
def validate_phone_number(phone_number):
    """
    Function that checks if phone number is valid and possible
    """
    try:
        # Parse phone number without a default region
        parsed_number = phonenumbers.parse(phone_number, None)

        # Check if phone number is valid globally
        is_valid = phonenumbers.is_valid_number(parsed_number)

        # Check if phone number is possible globally
        is_possible = phonenumbers.is_possible_number(parsed_number)

        if not is_valid:
            return {
                "valid": False,
                "possible": is_possible
            }

        # Format phone number in international format
        formatted = phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.INTERNATIONAL)

        return {
            "valid": True,
            "possible": is_possible,
            "formatted": formatted
        }
    except Exception as e:
        logger.error(f"Error parsing phone number: {e}")
        return {"valid": False, "possible": False}

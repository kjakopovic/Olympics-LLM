import logging
import json

from validation_schema import schema
from dataclasses import dataclass
from aws_lambda_powertools.utilities.validation import SchemaValidationError, validate

logger = logging.getLogger("GetAllSportsAchievements")
logger.setLevel(logging.INFO)

from common.common import (
    _LAMBDA_ACHIEVEMENTS_TABLE_RESOURCE,
    lambda_middleware,
    get_email_from_jwt_token,
    build_response,
    LambdaDynamoDBClass
)

@dataclass
class Request:
    email: str
    password: str
    first_name: str
    last_name: str

@lambda_middleware
def lambda_handler(event, context):
    # Getting email from JWT token
    jwt_token = event.get('headers').get('x-access-token')
    email = get_email_from_jwt_token(jwt_token)
    
    # Setting up table
    global _LAMBDA_ACHIEVEMENTS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_ACHIEVEMENTS_TABLE_RESOURCE)

    # Fetch and validate request body
    request_body = json.loads(event.get('body')) if 'body' in event else event

    try:
        validate(event=request_body, schema=schema)
    except SchemaValidationError as e:
        return build_response(400, {'message': str(e)})
    
    # Get items from the request body here
    
    return build_response(
        404,
        {
            'message': "To be implemented."
        }
    )

import json
import logging

logger = logging.getLogger("GetUserTags")
logger.setLevel(logging.DEBUG)

from common.common import (
    _LAMBDA_USERS_TABLE_RESOURCE,
    lambda_middleware,
    build_response,
    get_email_from_jwt_token,
    LambdaDynamoDBClass
)


@lambda_middleware
def lambda_handler(event, context):
    """
    Lambda handler for fetching user tags
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

    user = dynamodb.table.get_item(Key={'email': email})
    if not user:
        return build_response(
            400,
            {
                'message': 'User not found'
            }
        )

    logger.info(f'Fetching tags for user with email: {email}')
    tags = user.get('Item', {}).get('tags', [])
    return build_response(200, {'tags': tags})

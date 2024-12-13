import logging

logger = logging.getLogger("GetUserInfo")
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
    Lambda handler for getting user by email
    """
    jwt_token = event.get('headers').get('x-access-token')
    email = get_email_from_jwt_token(jwt_token)

    if not email:
        return build_response(
            400,
            {
                'message': 'Invalid email in jwt token'
            }
        )

    global _LAMBDA_USERS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_USERS_TABLE_RESOURCE)

    user = dynamodb.table.get_item(Key={'email': email}).get('Item')

    if not user:
        return build_response(
            404,
            {
                'message': 'User not found'
            }
        )

    legal_name = user.get('first_name') + ' ' + user.get('last_name')
    phone_number = user.get('phone_number') or 'N/A'

    return build_response(
        200,
        {
            'message': 'Info retrieved successfully',
            'user_data': {
                'legal_name': legal_name,
                'email': user.get('email'),
                'phone_number': phone_number,
                'tags': user.get('tags', [])
            }
        }
    )

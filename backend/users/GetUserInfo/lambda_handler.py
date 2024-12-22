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
    logger.debug(f"Received event {event}")

    jwt_token = event.get('headers').get('x-access-token')
    email = get_email_from_jwt_token(jwt_token)

    if not email:
        logger.error(f"Invalid email in jwt token {email}")
        return build_response(
            400,
            {
                'message': 'Invalid email in jwt token'
            }
        )

    global _LAMBDA_USERS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_USERS_TABLE_RESOURCE)

    user = get_user_by_email(dynamodb, email)
    if not user:
        logger.error(f"User with email {email} does not exist")
        return build_response(
            404,
            {
                'message': 'User not found'
            }
        )

    legal_name = user.get('first_name') + ' ' + user.get('last_name')
    phone_number = user.get('phone_number', 'N/A')

    return build_response(
        200,
        {
            'message': 'Info retrieved successfully',
            'info': {
                'legal_name': legal_name,
                'email': user.get('email'),
                'phone_number': phone_number,
                'tags': user.get('tags', [])
            }
        }
    )

def get_user_by_email(dynamodb, email):
    logger.info(f'Getting user by email {email}')
    user = dynamodb.table.get_item(
        Key={
            'email': email
        }
    )

    return user.get('Item')
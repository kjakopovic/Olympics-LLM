import logging

logger = logging.getLogger("DeleteProfile")
logger.setLevel(logging.INFO)

from common.common import (
    _LAMBDA_USERS_TABLE_RESOURCE,
    lambda_middleware,
    get_email_from_jwt_token,
    build_response,
    LambdaDynamoDBClass
)


@lambda_middleware
def lambda_handler(event, context):
    # Getting email from JWT token
    jwt_token = event.get('headers').get('x-access-token')
    email = get_email_from_jwt_token(jwt_token)
    
    # Setting up table for users
    global _LAMBDA_USERS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_USERS_TABLE_RESOURCE)

    # Delete user from the database
    is_user_deleted = delete_user_from_db(dynamodb, email)

    if not is_user_deleted:
        return build_response(
            400,
            {
                'message': 'We could not delete your account. Please try again or contact support.'
            }
        )
    
    return build_response(
        200,
        {
            'message': "Deleted profile successfully."
        }
    )


def delete_user_from_db(dynamodb, user_email):
    try:
        user_exists = check_if_user_exists(dynamodb, user_email)
        if not user_exists:
            return False
        
        logger.info("User exists, deleting user profile.")

        # Delete user from the database
        dynamodb.table.delete_item(
            Key={
                'email': user_email
            }
        )

        return True
    except Exception as e:
        logger.error(f"Couldn't delete user profile: {str(e)}")
        
        return False


def check_if_user_exists(dynamodb, email):
    logger.info('Checking if user exists.')

    response = dynamodb.table.get_item(
        Key={
            'email': email
        }
    )

    return response.get('Item')
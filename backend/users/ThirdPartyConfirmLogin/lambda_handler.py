import os
import requests
import logging

logger = logging.getLogger("ConfirmThirdPartyLogin")
logger.setLevel(logging.INFO)

from constants import (
    GOOGLE_TOKEN_URL,
    GOOGLE_USER_INFO_URL,
    GITHUB_TOKEN_URL,
    GITHUB_USER_INFO_URL,
    GITHUB_USER_EMAIL_URL,
    FACEBOOK_TOKEN_URL,
    FACEBOOK_USER_INFO_URL
)

from common.common import (
    generate_jwt_token,
    generate_refresh_token,
    _LAMBDA_USERS_TABLE_RESOURCE,
    get_secrets_from_aws_secrets_manager,
    build_response,
    LambdaDynamoDBClass
)

def lambda_handler(event, context):
    try:
        # Extract the code and state parameters from the query string
        query_params = event.get('queryStringParameters', {})
        code = query_params.get('code')
        state = query_params.get('state')

        logger.info(f'Checking if code and state parameters are present: {code}, {state}')

        if not code or not state:
            return build_response(
                400,
                {
                    'message': 'Missing code or state parameter'
                }
            )
        
        # Setting up table for users
        global _LAMBDA_USERS_TABLE_RESOURCE
        dynamodb = LambdaDynamoDBClass(_LAMBDA_USERS_TABLE_RESOURCE)
        
        logger.info('Retrieving secrets from AWS Secrets Manager')

        # Retrieve secret string from AWS Secrets Manager
        secrets = get_secrets_from_aws_secrets_manager(
            os.getenv('THIRD_PARTY_CLIENTS_SECRET_NAME'),
            os.getenv('SECRETS_REGION_NAME')
        )

        logger.info(f'Determining URLs and parameters based on state: {state}')
        
        token_url = user_info_url = None
        client_id_key = client_secret_key = None
        headers = {'Accept': 'application/json'}

        if state == 'google':
            token_url = GOOGLE_TOKEN_URL
            user_info_url = GOOGLE_USER_INFO_URL
            client_id_key = secrets['google_client_id']
            client_secret_key = secrets['google_client_secret']
        elif state == 'facebook':
            token_url = FACEBOOK_TOKEN_URL
            user_info_url = FACEBOOK_USER_INFO_URL
            client_id_key = secrets['facebook_client_id']
            client_secret_key = secrets['facebook_client_secret']
        elif state == 'github':
            token_url = GITHUB_TOKEN_URL
            user_info_url = GITHUB_USER_INFO_URL
            client_id_key = secrets['github_client_id']
            client_secret_key = secrets['github_client_secret']
        else:
            return build_response(
                400,
                {
                    'message': 'Unsupported state parameter'
                }
            )
        
        logger.info('Requesting access token from third party service')

        payload = {
            'code': code,
            'client_id': client_id_key,
            'client_secret': client_secret_key,
            'redirect_uri': secrets['callback_uri'],
            'grant_type': 'authorization_code'
        }

        token_response = requests.post(token_url, data=payload, headers=headers)
        token_response.raise_for_status()
        access_token = token_response.json().get('access_token')

        if not access_token:
            return build_response(
                400,
                {
                    'message': 'Failed to obtain access token'
                }
            )
        
        logger.info('Fetching user information')

        headers = {'Authorization': f'Bearer {access_token}'}
        user_info_response = requests.get(user_info_url, headers=headers)
        user_info_response.raise_for_status()
        user_info = user_info_response.json()

        logger.info('Extracting user information')

        user_name = user_info.get('name').split(' ')
        user_email = user_info.get('email')
        
        logger.info('Checking if email is empty and state is github')

        # In github if email field is empty call the email endpoint
        if (user_email == '' or user_email is None) and state == 'github':
            user_email_response = requests.get(GITHUB_USER_EMAIL_URL, headers=headers)
            user_email_response.raise_for_status()
            temporary_user_email = user_email_response.json()

            user_email = temporary_user_email[0].get('email')

        # If user doesn't exist, register him and login, else just login
        is_user_found = check_if_user_exists(dynamodb, user_email)

        if not is_user_found:
            logger.info('User does not exist, creating a new user')

            add_user_to_the_table(dynamodb, {
                'email': user_email,
                'first_name': user_name[0],
                'last_name': user_name[1],
            })

            logger.info('Storing profile picture if found')

        logger.info('Generating tokens')

        # Generating tokens
        token = generate_jwt_token(user_email)
        refresh_token = generate_refresh_token(user_email)

        return build_response(
            200,
            {
                'message': "You're logged in successfully!",
                'token': token,
                'refresh_token': refresh_token
            }
        )
    except requests.RequestException as e:
        logger.error(f'Request error: {str(e)}')

        return build_response(
            500,
            {
                'message': f'Request error: {str(e)}'
            }
        )
    
def check_if_user_exists(dynamodb, email):
    logger.info('Checking if user exists.')

    response = dynamodb.table.get_item(
        Key={
            'email': email
        }
    )

    return response.get('Item')

def add_user_to_the_table(dynamodb, user_item):
    logger.info('Adding user to the table.')

    dynamodb.table.put_item(
        Item=user_item
    )
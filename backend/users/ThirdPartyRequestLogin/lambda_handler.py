import os
import logging

logger = logging.getLogger("RequestThirdPartyLogin")
logger.setLevel(logging.INFO)

from constants import (
    GOOGLE_AUTHENTICATION_URL,
    GOOGLE_SCOPE,
    GITHUB_AUTHENTICATION_URL,
    GITHUB_SCOPE,
    FACEBOOK_AUTHENTICATION_URL,
    FACEBOOK_SCOPE,
    VALID_SERVICE_TYPES
)

from common.common import (
    get_secrets_from_aws_secrets_manager,
    build_response
)

def lambda_handler(event, context):
    # Extract the type of service from the query parameters
    type_of_service = event.get('queryStringParameters', {}).get('type_of_service')

    logger.info(f'Checking if the service type is valid: {type_of_service}')

    # Check if the service type is valid
    if type_of_service not in VALID_SERVICE_TYPES:
        return build_response(
            400,
            {
                'message': 'Unsupported or missing service type'
            }
        )
    
    logger.info('Retrieving secrets from AWS Secrets Manager')
    
    # Retrieve secret string from AWS Secrets Manager
    secrets = get_secrets_from_aws_secrets_manager(
        os.getenv('THIRD_PARTY_CLIENTS_SECRET_NAME'),
        os.getenv('SECRETS_REGION_NAME')
    )
    
    logger.info(f'Constructing authorization URL for {type_of_service}')

    # Determine the authorization URL based on the service type
    try:
        redirect_uri = secrets['callback_uri']

        if type_of_service == 'google':
            authorization_url = (
                f"{GOOGLE_AUTHENTICATION_URL}?client_id={secrets['google_client_id']}&redirect_uri={redirect_uri}"
                f"&response_type=code&scope={GOOGLE_SCOPE}&state={type_of_service}"
            )
        elif type_of_service == 'facebook':
            authorization_url = (
                f"{FACEBOOK_AUTHENTICATION_URL}?client_id={secrets['facebook_client_id']}&redirect_uri={redirect_uri}"
                f"&scope={FACEBOOK_SCOPE}&state={type_of_service}"
            )
        elif type_of_service == 'github':
            authorization_url = (
                f"{GITHUB_AUTHENTICATION_URL}?client_id={secrets['github_client_id']}&redirect_uri={redirect_uri}"
                f"&scope={GITHUB_SCOPE}&state={type_of_service}"
            )
    except Exception as e:
        logger.error(f'Failed to construct authorization URL: {str(e)}')
        
        return build_response(
            500,
            {
                'message': f'Failed to construct authorization URL: {str(e)}'
            }
        )

    # Redirect the user to the authorization URL
    return {
        'statusCode': 302,
        'headers': {
            'Location': authorization_url
        }
    }
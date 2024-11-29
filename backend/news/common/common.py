from boto3 import client, resource
from os import environ
import jwt
import logging
import boto3
import json
import requests

from aws_lambda_powertools.middleware_factory import lambda_handler_decorator

logger = logging.getLogger("NewsCommon")
logger.setLevel(logging.INFO)

_LAMBDA_NEWS_TABLE_RESOURCE = {
    "resource": resource("dynamodb"),
    "table_name": environ.get("NEWS_TABLE_NAME", "test_news_table")
}

_LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES = {
    "client": client("s3", region_name=environ.get("AWS_REGION", "eu-central-1")),
    "bucket_name": environ.get("NEWS_PICTURES_BUCKET_NAME", "iolap-project")
}


class LambdaS3Class:
    """
    AWS S3 Resource Class
    """
    def __init__(self, lambda_s3_client):
        """
        Initialize an S3 Resource
        """
        self.client = lambda_s3_client["client"]
        self.bucket_name = lambda_s3_client["bucket_name"]


class LambdaDynamoDBClass:
    """
    AWS DynamoDB Resource Class
    """
    def __init__(self, lambda_dynamodb_resource):
        """
        Initialize a DynamoDB Resource
        """
        self.resource = lambda_dynamodb_resource["resource"]
        self.table_name = lambda_dynamodb_resource["table_name"]
        self.table = self.resource.Table(self.table_name)


# TODO: Test all picture related functions in order to see if the multipart form data is being passed correctly
# TODO: Change maybe name of saved images so it is like {news_id}_{picture_id}.{extension}
# Picture functions for news
def save_news_pictures(pictures, news_id):
    s3_client = _LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES["client"]
    bucket_name = _LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES["bucket_name"]

    for picture in pictures:
        file_name = f"{news_id}/{picture['name']}"
        try:
            s3_client.upload_fileobj(
                picture,
                bucket_name,
                file_name,
                ExtraArgs={"ContentType": picture.content_type}
            )
            logger.info(f"Successfully saved news picture: {file_name}")
        except Exception as e:
            logger.error(f"Error in saving news picture as file {file_name}; {e}")
            return {
                "statusCode": 500,
                "body": json.dumps({"message": "Failed to save news picture"})
            }

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "News picture saved successfully"})
    }


def get_news_pictures(news_id):
    s3_class = LambdaS3Class(_LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES)
    s3_client = s3_class.client
    bucket_name = s3_class.bucket_name

    prefix = f"{news_id}/"

    try:
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=prefix
        )
        if 'Contents' not in response:
            return {
                "statusCode": 404,
                "body": json.dumps({"message": "News pictures not found"})
            }

        picture_urls = []
        for obj in response['Contents']:
            picture_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket_name, 'Key': obj['Key']},
                ExpiresIn=3600
            )
            picture_urls.append(picture_url)

        return {
            "statusCode": 200,
            "body": json.dumps({"picture_urls": picture_urls})
        }

    except Exception as e:
        logger.error(f"Error in getting news pictures from S3 for news_id {news_id}; {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Failed to get news pictures"})
        }


def delete_news_pictures(news_id):
    s3_class = LambdaS3Class(_LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES)
    s3_client = s3_class.client
    bucket_name = s3_class.bucket_name

    prefix = f"{news_id}/"

    try:
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=prefix
        )
        if 'Contents' not in response:
            return {
                "statusCode": 404,
                "body": json.dumps({"message": "News pictures not found"})
            }

        for obj in response['Contents']:
            s3_client.delete_object(
                Bucket=bucket_name,
                Key=obj['Key']
            )
            logger.info(f"Successfully deleted news picture: {obj['Key']}")

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "News pictures deleted successfully"})
        }
    except Exception as e:
        logger.error(f"Error in deleting news pictures from S3 for news_id {news_id}; {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Failed to delete news pictures"})
        }


@lambda_handler_decorator
def lambda_middlewares(handler, event, context):
    event_headers = event.get("headers")
    logger.info(f"Received Event Headers in middleware: {event_headers}")

    result = validate_jwt_token(event_headers)

    if result['statusCode'] != 200:
        logger.info(f"JWT Token validation failed")

        return result

    logger.info(f"JWT Token validation successful, proceeding with the request to the handler")

    try:
        authorization = event_headers.get("Authorization") or event_headers.get("authorization")

        if authorization:
            access_token = authorization.split(' ')[1] if ' ' in authorization else authorization
            event['headers']['x-access-token'] = access_token

            event['headers'].pop('Authorization', None)
            event['headers'].pop('authorization', None)

        return handler(event, context)
    except Exception as e:
        logger.error(f"Error in middleware: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Internal Server Error"})
        }


def validate_jwt_token(event_headers):
    authorization = event_headers.get('Authorization') or event_headers.get('authorization')

    access_token = authorization.split(' ')[1] if ' ' in authorization else authorization
    refresh_token = event_headers.get('x-refresh-token')

    logger.info(f"Validating JWT token: {access_token}")

    secrets = get_secrets_from_aws_secrets_manager(
        environ.get('JWT_SECRET_NAME'),
        environ.get('SECRETS_REGION_NAME')
    )

    try:
        jwt.decode(access_token.encode('utf-8'), secrets['jwt_secret'], algorithms=["HS256"])

        logger.info("JWT Token verified successfully")

        return { 'statusCode': 200}

    except jwt.ExpiredSignatureError:
        logger.info("JWT Token has expired, trying to refresh the token")
        return validate_refresh_token(refresh_token, secrets['refresh_secret'], secrets['jwt_secret'])

    except Exception as e:
        logger.error(f"Error in validating JWT token: {e}")
        return build_response(
            401,
            {
                "error": "Invalid JWT Token, please login again"
             }
        )


def validate_refresh_token(refresh_token, refresh_secret, jwt_secret):
    logger.info(f"Validating Refresh Token: {refresh_token}")

    try:
        user_email = get_email_from_jwt_token(refresh_token)
        new_access_token = jwt.encode(
            {"email": user_email},
            jwt_secret,
            algorithm='HS256'
        )

        return build_response(
            200,
            {
                "message": "JWT token verified successfully"
            },
            {
                'x-access-token': new_access_token,
                'Content-Type': 'application/json'
            }
        )

    except jwt.ExpiredSignatureError:
        return build_response(
            401,
            {
                "error": "Refresh Token has expired, please login again"
            }
        )

    except Exception as e:
        logger.error(f"Error in validating Refresh Token: {e}")
        return build_response(
            401,
            {
                "error": "Invalid Refresh Token, please login again"
            }
        )


def get_email_from_jwt_token(token):
    secrets = get_secrets_from_aws_secrets_manager(
        environ.get('JWT_SECRET_NAME'),
        environ.get('SECRETS_REGION_NAME')
    )

    decoded_jwt = jwt.decode(token.encode('utf-8'), secrets["jwt_secret"], algorithms=["HS256"])

    return decoded_jwt.get('email')


def build_response(status_code, body, headers=None):
    return{
        'statusCode': status_code,
        headers if headers else 'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body)
    }


def get_secrets_from_aws_secrets_manager(secret_name, region_name):
    try:
        secrets_manager = boto3.client(
            service_name='secretsmanager',
            region_name=region_name
        )

        secret_string = secrets_manager.get_secret_value(SecretId=secret_name)
        return json.loads(secret_string['SecretString'])
    except Exception as e:
        logger.error(f"Error in getting secrets from AWS Secrets Manager: {e}")
        return None


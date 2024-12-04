import logging
import json

from validation_schema import schema
from dataclasses import dataclass
from aws_lambda_powertools.utilities.validation import validator

logger = logging.getLogger("UpdateNews")
logger.setLevel(logging.INFO)

from common.common import (
    _LAMBDA_NEWS_TABLE_RESOURCE,
    lambda_middleware,
    build_response,
    LambdaDynamoDBClass,
    _LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES,
    LambdaS3Class
)

@dataclass
class Request:
    title: str
    description: str
    new_pictures_count: int
    pictures_to_delete: list

@lambda_middleware
@validator(inbound_schema=schema)
def lambda_handler(event, context):
    """
    Lambda handler for updating news
    """
    news_id = event.get('pathParameters', {}).get('news_id')

    if not news_id:
        return build_response(
            400,
            {
                'message': 'News id is required'
            }
        )

    global _LAMBDA_NEWS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_NEWS_TABLE_RESOURCE)

    body = json.loads(event.get('body', '{}'))

    title = body.get('title')
    description = body.get('description')

    logger.info(f'Updating news with id: {news_id}')

    update_news(dynamodb, news_id, title, description)

    logger.info(f'Checking if pictures need to be updated')

    new_pictures_count = body.get('new_pictures_count')
    if new_pictures_count:
        logger.info(f'Updating news pictures with for news with id: {news_id}')

        pictures_to_delete = body.get('pictures_to_delete')
        resigned_urls = update_news_pictures(news_id, new_pictures_count, pictures_to_delete)

    return build_response(
        200,
        {
            'message': f'Successfully updated news with id: {news_id}',
            'urls': resigned_urls
        }
    )


def update_news(dynamodb, news_id, title, description):
    # Update user's public info
    update_expression = "SET "
    expression_attribute_values = {}

    if title is not None:
        update_expression += "title = :title, "
        expression_attribute_values[':title'] = title

    if description is not None:
        update_expression += "description = :description, "
        expression_attribute_values[':description'] = description

    if expression_attribute_values:
        update_expression = update_expression.rstrip(', ')

        dynamodb.table.update_item(
            Key={'id': news_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )


def update_news_pictures(news_id, new_pictures_count, pictures_to_delete):
    try:
        for key in pictures_to_delete:
            if delete_news_pictures(key):
                logger.info(f"Deleted picture with key: {key}")

        return save_news_pictures(new_pictures_count, news_id)

    except Exception as e:
        logger.error(f"Error in deleting news pictures from S3: {e}")
        return False


def delete_news_pictures(key):
    s3_class = LambdaS3Class(_LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES)
    s3_client = s3_class.client
    bucket_name = s3_class.bucket_name

    try:
        response = s3_client.delete_object(
            Bucket=bucket_name,
            Key=key
        )

        return True
    except Exception as e:
        logger.error(f"Error in deleting news pictures from S3 for key {key}: {e}")
        return False


def save_news_pictures(picture_count, news_id):
    s3_class = LambdaS3Class(_LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES)
    s3_client = s3_class.client
    bucket_name = s3_class.bucket_name

    existing_keys = []
    try:
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=f"{news_id}/"
        )

        if 'Contents' in response:
            existing_keys = [obj['Key'] for obj in response['Contents']]

        max_number = 0
        for key in existing_keys:
            try:
                number = int(key.spliut('/')[-1])
                if number > max_number:
                    max_number = number
            except ValueError:
                continue

        pre_signed_urls = []
        for i in range(max_number + 1, max_number + picture_count + 1):
            key = f"{news_id}/{i}"
            if key in existing_keys:
                logger.info(f"Skipping existing picture with key: {key}")
                continue

            pre_signed_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': key
                },
                ExpiresIn=3600
            )
            pre_signed_urls.append(pre_signed_url)

        logger.info(f"Pre-signed URLs generated successfully for news with id: {news_id}")
        return pre_signed_urls

    except Exception as e:
        logger.error(f"Error in generating picture urls for news {news_id}; {e}")
        return []

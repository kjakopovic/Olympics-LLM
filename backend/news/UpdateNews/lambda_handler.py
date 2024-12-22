import logging
import json

from validation_schema import schema
from dataclasses import dataclass, field
from aws_lambda_powertools.utilities.validation import SchemaValidationError, validate

logger = logging.getLogger("UpdateNews")
logger.setLevel(logging.DEBUG)

from common.common import (
    _LAMBDA_NEWS_TABLE_RESOURCE,
    lambda_middleware,
    build_response,
    get_role_from_jwt_token,
    LambdaDynamoDBClass,
    _LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES,
    LambdaS3Class
)

@dataclass
class Request:
    title: str = None
    description: str = None
    new_pictures_count: int = 0
    pictures_to_delete: list = field(default_factory=list)
    tags: list = None

@lambda_middleware
def lambda_handler(event, context):
    logger.debug(f"Received event: {event}")
    request_body = json.loads(event.get('body'))

    if not request_body:
        logger.error('Nothing to update, your request body is empty')

        return build_response(
            200,
            {
                'message': 'Nothing to update, your request body is empty'
            }
        )
    
    news_id = event.get('pathParameters', {}).get('news_id')

    if not news_id:
        logger.error('News id is required')
        return build_response(
            400,
            {
                'message': 'News id is required'
            }
        )
    
    token = event.get("headers", {}).get("x-access-token")
    user_permissions = get_role_from_jwt_token(token)

    if user_permissions < 100:
        logger.error('You do not have permission to update news')
        return build_response(
            403,
            {
                "message": "You do not have permission to update news"
            }
        )

    try:
        logger.debug(f"Validating request body: {request_body}")
        validate(event=request_body, schema=schema)
    except SchemaValidationError as e:
        return build_response(400, {'message': str(e)})
    
    logger.info(f"Parsing request body for {news_id}")
    request = Request(**request_body)

    global _LAMBDA_NEWS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_NEWS_TABLE_RESOURCE)

    if not check_if_news_exist(dynamodb, news_id):
        logger.error(f'News with id {news_id} not found')

        return build_response(
            404,
            {
                'message': 'News not found'
            }
        )

    logger.info(f'Updating news with id: {news_id}')
    update_news(dynamodb, news_id, request.title, request.description, request.tags)

    resigned_urls = []
    
    logger.info(f'Checking if pictures need to be added')
    if request.new_pictures_count > 0:
        logger.info(f'Adding pictures to news')
        resigned_urls = save_news_pictures(request.new_pictures_count, news_id)

    logger.info(f'Checking if pictures need to be deleted')
    if len(request.pictures_to_delete) > 0:
        logger.info(f'Deleting pictures from news')

        for key in request.pictures_to_delete:
            if delete_news_pictures(key):
                logger.info(f"Deleted picture with key: {key}")

    return build_response(
        200,
        {
            'message': f'Successfully updated news with id: {news_id}',
            'urls': resigned_urls
        }
    )

def update_news(dynamodb, news_id, title, description, tags):
    # Update news info
    update_expression = "SET "
    expression_attribute_values = {}

    if title:
        logger.debug(f"Updating title to {title}")
        update_expression += "title = :title, "
        expression_attribute_values[':title'] = title

    if description:
        logger.debug(f"Updating description to {description}")
        update_expression += "description = :description, "
        expression_attribute_values[':description'] = description

    if tags:
        logger.debug(f"Updating tags to {tags}")
        tags = move_tags_to_lowercase(tags)
        update_expression += "tags = :tags, "
        expression_attribute_values[':tags'] = tags

    if expression_attribute_values:
        logger.debug(f"UpdateExpression: {update_expression}")
        update_expression = update_expression.rstrip(', ')

        dynamodb.table.update_item(
            Key={'id': news_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )

def delete_news_pictures(key):
    s3_class = LambdaS3Class(_LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES)
    s3_client = s3_class.client
    bucket_name = s3_class.bucket_name

    try:
        s3_client.delete_object(
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

def check_if_news_exist(dynamodb, news_id):
    news = dynamodb.table.get_item(
        Key={'id': news_id}
    ).get('Item')

    logger.debug(f'Found news: {news}')

    if not news:
        return False

    return True

def move_tags_to_lowercase(tags):
    return [tag.lower() for tag in tags]
import logging
import json
import uuid
import datetime

from validation_schema import schema
from dataclasses import dataclass
from aws_lambda_powertools.utilities.validation import validate

logger = logging.getLogger("CreateNews")
logger.setLevel(logging.DEBUG)

from common.common import (
    _LAMBDA_NEWS_TABLE_RESOURCE,
    lambda_middleware,
    build_response,
    get_role_from_jwt_token,
    LambdaDynamoDBClass,
    _LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES,
    LambdaS3Class,
    ValidationError
)

@dataclass
class Request:
    title: str
    description: str
    picture_count: int
    tags: list

@lambda_middleware
def lambda_handler(event, context):
    request_body = json.loads(event.get('body')) if 'body' in event else event
    logger.info("Received event: %s", event)

    token = event.get("headers", {}).get("x-access-token")
    user_permissions = get_role_from_jwt_token(token)

    if user_permissions < 100:
        return build_response(
            403,
            {
                "message": "You do not have permission to create news"
            }
        )

    global _LAMBDA_NEWS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_NEWS_TABLE_RESOURCE)

    try:
        validate(event=request_body, schema=schema)
    except Exception as e:
        raise ValidationError(str(e))
    
    request = Request(**request_body)

    news_id = str(uuid.uuid4())
    news_date = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

    if len(request.tags) > 0:
        request.tags = move_tags_to_lowercase(request.tags)

    news_item = {
        "id": news_id,
        "title": request.title,
        "description": request.description,
        "published_at": news_date,
        "tags": request.tags
    }

    try:
        dynamodb.table.put_item(Item=news_item)
    except Exception as e:
        logger.error("Error saving news to DynamoDB: %s", e)
        return build_response(500, {"message": "Error saving news to DynamoDB"})

    urls = save_news_pictures(request.picture_count, news_id)

    return build_response(
        200,
        {
            "message": "News created successfully",
            "id": news_id,
            "picture_urls": urls
        }
    )

def save_news_pictures(picture_count, news_id):
    """
    Generate pre-signed URLs for saving news pictures
    """
    s3_class = LambdaS3Class(_LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES)
    s3_client = s3_class.client
    bucket_name = s3_class.bucket_name

    pre_signed_urls = []

    try:
        for i in range(1, picture_count + 1):
            pre_signed_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': f"{news_id}/{i}"
                },
                ExpiresIn=3600
            )
            pre_signed_urls.append(pre_signed_url)

        logger.info(f"Pre-signed URLs generated successfully for news with id: {news_id}")
        return pre_signed_urls

    except Exception as e:
        logger.error(f"Error in generating picture urls for news {news_id}; {e}")
        return []

def move_tags_to_lowercase(tags):
    return [tag.lower() for tag in tags]
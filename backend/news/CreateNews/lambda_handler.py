import logging
import json
import uuid
import datetime

from validation_schema import schema
from dataclasses import dataclass
from aws_lambda_powertools.utilities.validation import SchemaValidationError, validate

logger = logging.getLogger("CreateNews")
logger.setLevel(logging.DEBUG)

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
    picture_count: int
    tags: list


@lambda_middleware
def lambda_handler(event, context):
    """
    Lambda handler for creating news
    """
    logger.info("Received event: %s", event)

    try:
        request_body = json.loads(event["body"])
    except json.JSONDecodeError as e:
        logger.error("Error decoding JSON: %s", e)
        return build_response(400, {"message": "Error decoding JSON"})

    global _LAMBDA_NEWS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_NEWS_TABLE_RESOURCE)

    try:
        validate(event=request_body, schema=schema)
    except SchemaValidationError as e:
        return build_response(400, {'message': str(e)})

    news_id = str(uuid.uuid4())
    news_title = request_body.get("title")
    news_content = request_body.get("description")
    picture_count = request_body.get("picture_count")
    news_date = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    tags = request_body.get("tags") or []

    if not tags:
        return build_response(
            400,
            {
                "message": "At least 1 tag is required to create news"
            }
        )

    if len(tags) > 3:
        return build_response(
            400,
            {
                "message": "Maximum of 3 tags are allowed per news"
            }
        )

    news_item = {
        "id": news_id,
        "title": news_title,
        "description": news_content,
        "published_at": news_date,
        "tags": tags
    }

    try:
        dynamodb.table.put_item(Item=news_item)
    except Exception as e:
        logger.error("Error saving news to DynamoDB: %s", e)
        return build_response(500, {"message": "Error saving news to DynamoDB"})

    urls = save_news_pictures(picture_count, news_id)

    return build_response(
        200,
        {
            "message": "News created successfully",
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

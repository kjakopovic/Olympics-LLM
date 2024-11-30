import logging
import json
import uuid
import datetime

logger = logging.getLogger("CreateNews")
logger.setLevel(logging.INFO)

from common.common import (
    _LAMBDA_NEWS_TABLE_RESOURCE,
    lambda_middleware,
    build_response,
    LambdaDynamoDBClass,
    save_news_pictures
)


@lambda_middleware
def lambda_handler (event, context):
    """
    Lambda handler for creating news
    """
    logger.info("Received event: %s", event)

    try:
        request_body = json.loads(event["body"])
    except json.JSONDecodeError as e:
        logger.error("Error decoding JSON: %s", e)
        return build_response(400, {"message": "Error decoding JSON"})

    if "title" not in request_body or "content" not in request_body:
        return build_response(400, {"message": "Title and content are required"})

    global _LAMBDA_NEWS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_NEWS_TABLE_RESOURCE)

    news_id = str(uuid.uuid4())
    news_title = request_body["title"]
    news_content = request_body["content"]
    news_date = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")

    news_item = {
        "news_id": news_id,
        "title": news_title,
        "content": news_content,
        "published_at": news_date
    }

    try:
        dynamodb.put_item(Item=news_item)
    except Exception as e:
        logger.error("Error saving news to DynamoDB: %s", e)
        return build_response(500, {"message": "Error saving news to DynamoDB"})

    urls = []
    if "pictures" in request_body:
        pictures = request_body["pictures"]
        urls = save_news_pictures(pictures, news_id)

    return build_response(
        200,
        {"message": "News created successfully",
         "picture_urls": urls
         })


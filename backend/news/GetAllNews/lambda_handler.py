import logging
import datetime
from boto3.dynamodb.conditions import Attr

logger = logging.getLogger("GetAllNews")
logger.setLevel(logging.INFO)

from common.common import (
    _LAMBDA_NEWS_TABLE_RESOURCE,
    lambda_middleware,
    build_response,
    LambdaDynamoDBClass,
    get_news_pictures
)


# TODO: Check if only image with id 1 is enough to be returned for each news, or all images need to be
@lambda_middleware
def lambda_handler(event, context):
    """
    Lambda handler for getting all news
    """
    global _LAMBDA_NEWS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_NEWS_TABLE_RESOURCE)

    news = dynamodb.table.scan().get('Items', [])

    logger.info(f'Found {len(news)} news')

    sorted_news = sort_news(news)

    for item in sorted_news:
        news_id = item.get('news_id')
        if news_id:
            item['pictures_urls'] = fetch_pictures(news_id)
        else:
            item['pictures_urls'] = []

    logger.info(f"Returning news and pictures")

    return build_response(
        200,
        {
            'message': f'Fetched all news',
            'news': sorted_news
        }
    )


def sort_news(news):
    """
    Sort news by published date in descending order
    """
    logger.info(f"Sorting news")
    sorted_news = sorted(
        news,
        key=lambda x: datetime.datetime.strptime(x['published_at'],"%d-%m-%Y %H:%M:%S"),
        reverse=True)

    return sorted_news


def fetch_pictures(news_id):
    """
    Fetch pictures for news
    """
    try:
        response = get_news_pictures(news_id)
        if response["statusCode"] == 200:
            picture_urls = response["picture_urls"]
            return picture_urls
        else:
            logger.error(f"Error fetching pictures: {response}")
            return []
    except Exception as e:
        logger.error(f"Error fetching pictures: {e}")
        return []

import logging
import datetime
from boto3 import client
from os import environ

logger = logging.getLogger("GetAllNews")
logger.setLevel(logging.INFO)

from common.common import (
    _LAMBDA_NEWS_TABLE_RESOURCE,
    lambda_middleware,
    build_response,
    LambdaDynamoDBClass
)


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

    logger.info(f"Fetching pictures for news")
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
            logger.info(f"No pictures found for news with id: {news_id}")
            return []

        picture_urls = []
        for obj in response['Contents']:
            picture_url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': obj['Key']},
                ExpiresIn=3600
            )
            picture_urls.append({
                "file_name": obj['Key'],
                "url": picture_url
            })

        logger.info(f"Found {len(picture_urls)} pictures for news with id: {news_id}")
        return picture_urls

    except Exception as e:
        logger.error(f"Error fetching pictures for news {news_id}: {e}")
        return []



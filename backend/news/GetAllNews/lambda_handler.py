import logging
import datetime

logger = logging.getLogger("GetAllNews")
logger.setLevel(logging.DEBUG)

from common.common import (
    _LAMBDA_NEWS_TABLE_RESOURCE,
    lambda_middleware,
    build_response,
    get_email_from_jwt_token,
    LambdaDynamoDBClass,
    _LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES,
    LambdaS3Class
)


# TODO: Check if only image with id 1 is enough to be returned for each news, or all images need to be
@lambda_middleware
def lambda_handler(event, context):
    """
    Lambda handler for getting all news
    """
    jwt_token = event.get('headers').get('x-access-token')
    email = get_email_from_jwt_token(jwt_token)

    if not email:
        return build_response(
            400,
            {
                'message': 'Invalid email in jwt token'
            }
        )

    global _LAMBDA_NEWS_TABLE_RESOURCE
    dynamodb = LambdaDynamoDBClass(_LAMBDA_NEWS_TABLE_RESOURCE)

    tags = fetch_user_tags(dynamodb, email)

    news = dynamodb.table.scan().get('Items', [])

    logger.info(f'Found {len(news)} news')

    logger.info("Sorting and filtering news by tags")
    sorted_news = sort_news(news)
    filtered_news = filter_news(sorted_news, tags)

    logger.info(f"Fetching pictures for news")
    for item in filtered_news:
        news_id = item.get('id')
        if news_id:
            item['pictures_urls'] = fetch_pictures(news_id)
        else:
            item['pictures_urls'] = []

    logger.info(f"Returning filtered news and pictures")

    return build_response(
        200,
        {
            'message': f'Fetched all news',
            'news': filtered_news
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


def filter_news(news, tags):
    """
    Filter news by tags
    """
    logger.info(f"Filtering news")
    filtered_news = []
    for item in news:
        news_tags = item.get('tags', [])
        if not news_tags:
            continue

        if any(tag in news_tags for tag in tags):
            filtered_news.append(item)

    return filtered_news


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


def fetch_user_tags(dynamodb, email):
    """
    Fetch user tags
    """
    user = dynamodb.table.get_item(Key={'email': email})
    if not user:
        return []

    logger.info(f'Fetching tags for user with email: {email}')
    tags = user.get('Item', {}).get('tags', [])
    return tags

import logging

logger = logging.getLogger("GetNewsById")
logger.setLevel(logging.DEBUG)

from common.common import (
    _LAMBDA_NEWS_TABLE_RESOURCE,
    lambda_middleware,
    build_response,
    LambdaDynamoDBClass,
    _LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES,
    LambdaS3Class
)


@lambda_middleware
def lambda_handler(event, context):
    """
    Lambda handler for getting news by id
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

    news = dynamodb.table.get_item(
        Key={'id': news_id}
    ).get('Item')

    logger.info(f'Found {news}')

    news['pictures_url'] = get_news_pictures(news['id'])

    logger.info(f"Returning news and it's pictures")

    return build_response(
        200,
        {
            'message': f'Getting news for id: {news_id}',
            'news': news
        }
    )


def get_news_pictures(news_id):
    """
    Get news picture urls
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
            logger.info(f"No pictures found for news id: {news_id}")
            return []

        picture_urls = []
        for obj in response['Contents']:
            picture_url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': obj['Key']
                },
                ExpiresIn=3600
            )
            picture_urls.append({
                "key": obj['Key'],
                "url": picture_url
            })

        logger.info(f"Found pictures for news id: {news_id}")
        return picture_urls

    except Exception as e:
        logger.error(f"Error fetching pictures for news id: {news_id}")
        return []

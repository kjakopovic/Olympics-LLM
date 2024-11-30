import logging

logger = logging.getLogger("GetNewById")
logger.setLevel(logging.INFO)

from common.common import (
    _LAMBDA_NEWS_TABLE_RESOURCE,
    lambda_middleware,
    build_response,
    LambdaDynamoDBClass,
    get_news_pictures
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

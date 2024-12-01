import logging

logger = logging.getLogger("DeleteNews")
logger.setLevel(logging.INFO)

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
    Lambda handler for deleting news
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

    logger.info(f'Deleting news with id: {news_id}')
    dynamodb.table.delete_item(
        Key={'news_id': news_id}
    )

    logger.info(f'Deleting pictures related to the news with id: {news_id}')
    result = delete_news_pictures(news_id)

    if not result:
        return build_response(
            500,
            {
                'message': f'Error in deleting news pictures for news_id: {news_id}'
            }
        )
    else:
        return build_response(
            200,
            {
                'message': f'News deleted successfully alongside related pictures: {news_id}'
            }
        )


def delete_news_pictures(news_id):
    """
    Delete all pictures associated with a given news ID from S3.
    """
    s3_class = LambdaS3Class(_LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES)
    s3_client = s3_class.client
    bucket_name = s3_class.bucket_name

    prefix = f"{news_id}/"

    try:
        # List all objects with the specified prefix (news_id/)
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=prefix
        )

        # If no pictures exist for the given news_id
        if 'Contents' not in response:
            logger.info(f"No pictures found for news ID: {news_id}")
            return True

        # Delete each picture in the bucket for the given news_id
        for obj in response['Contents']:
            s3_client.delete_object(
                Bucket=bucket_name,
                Key=obj['Key']
            )
            logger.info(f"Successfully deleted news picture: {obj['Key']}")

        return True
    except Exception as e:
        logger.error(f"Error in deleting news pictures from S3 for news_id {news_id}: {e}")
        return False

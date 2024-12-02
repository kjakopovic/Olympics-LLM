import logging
import json

logger = logging.getLogger("UpdateNews")
logger.setLevel(logging.INFO)

from common.common import (
    _LAMBDA_NEWS_TABLE_RESOURCE,
    lambda_middleware,
    build_response,
    LambdaDynamoDBClass
)


@lambda_middleware
def lambda_handler(event, context):
    """
    Lambda handler for updating news
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

    body = json.loads(event.get('body', '{}'))

    title = body.get('title')
    description = body.get('description')

    logger.info(f'Updating news with id: {news_id}')

    update_news(dynamodb, news_id, title, description)

    return build_response(
        200,
        {
            'message': f'Successfully updated news with id: {news_id}'
        }
    )


def update_news(dynamodb, news_id, title, description):
    # Update user's public info
    update_expression = "SET "
    expression_attribute_values = {}

    if title is not None:
        update_expression += "title = :title, "
        expression_attribute_values[':title'] = title

    if description is not None:
        update_expression += "description = :description, "
        expression_attribute_values[':description'] = description

    if expression_attribute_values:
        # update_expression = update_expression[:-2]
        update_expression = update_expression.rstrip(', ')

        dynamodb.table.update_item(
            Key={'id': news_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )

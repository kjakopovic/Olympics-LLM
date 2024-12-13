import logging
import datetime

logger = logging.getLogger("GetAllNews")
logger.setLevel(logging.DEBUG)

from common.common import (
    _LAMBDA_NEWS_TABLE_RESOURCE,
    _LAMBDA_USERS_TABLE_RESOURCE,
    build_response,
    get_email_from_jwt_token,
    validate_jwt_token,
    LambdaDynamoDBClass,
    _LAMBDA_S3_CLIENT_FOR_NEWS_PICTURES,
    LambdaS3Class
)

# TODO: Check if only image with id 1 is enough to be returned for each news, or all images need to be
def lambda_handler(event, context):
    headers = event.get("headers")
    logger.debug(f"Received Event Headers: {headers}")

    jwt_auth = headers.get('Authorization') or headers.get('authorization')
    jwt_token = None

    if jwt_auth:
        jwt_token = jwt_auth.split(' ')[1] if ' ' in jwt_auth else jwt_auth

        response = validate_jwt_token(jwt_token)

        if response['statusCode'] != 200:
            return response

    email = get_email_from_jwt_token(jwt_token)

    global _LAMBDA_NEWS_TABLE_RESOURCE
    global _LAMBDA_USERS_TABLE_RESOURCE
    news_table = LambdaDynamoDBClass(_LAMBDA_NEWS_TABLE_RESOURCE)
    users_table = LambdaDynamoDBClass(_LAMBDA_USERS_TABLE_RESOURCE)

    query_params = event.get("queryStringParameters", {})
    page = int(query_params.get("page", 1))
    limit = int(query_params.get("limit", 10))

    if email:
        logger.info("Querying news by tags")

        user_tags = fetch_user_tags(users_table, email)
        if len(user_tags) <= 0:
            news = get_all_news(news_table)
        else:
            news = get_news_by_tags(news_table, user_tags)
    else:
        logger.info(f"Querying all news")
        news = get_all_news(news_table)

    logger.debug(f'Found {len(news)} news')

    sorted_news = sort_news(news)

    logger.info("Fetching pictures for news")
    for item in sorted_news:
        news_id = item.get('id')
        if news_id:
            item['pictures_urls'] = fetch_pictures(news_id)
        else:
            item['pictures_urls'] = []

    logger.info("Paginating news")
    paginated_news = paginate_list(sorted_news, page, limit)

    logger.info("Returning filtered news and pictures")
    return build_response(
        200,
        {
            'message': 'Fetched news successfully',
            'total_records_found': len(sorted_news),
            'item_count': len(paginated_news),
            'items': paginated_news
        }
    )

def sort_news(news):
    """
    Sort news by published date in descending order
    """
    logger.info("Sorting news")

    sorted_news = sorted(
        news,
        key=lambda x: datetime.datetime.strptime(x['published_at'], "%d-%m-%Y %H:%M:%S"),
        reverse=True
    )

    return sorted_news

def get_news_by_tags(news_table, tags):
    try:
        filter_expressions = [f"contains(tags, :tag{i})" for i in range(len(tags))]
        filter_expression = " OR ".join(filter_expressions)

        # Construct ExpressionAttributeValues dynamically
        expression_attribute_values = {f":tag{i}": tag for i, tag in enumerate(tags)}

        logger.info(f"FilterExpression: {filter_expression}")
        logger.info(f"ExpressionAttributeValues: {expression_attribute_values}")

        # Query the DynamoDB table with the constructed filter
        response = news_table.table.scan(
            FilterExpression=filter_expression,
            ExpressionAttributeValues=expression_attribute_values
        )

        # Return the items from the response
        return response.get('Items', [])
    except Exception as e:
        logger.error(f"Error fetching news by tags: {e}")
        return []

def fetch_pictures(news_id):
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

def fetch_user_tags(users_table, email):
    user = users_table.table.get_item(Key={'email': email})
    if not user:
        return []

    logger.info(f'Fetching tags for user with email: {email}')

    tags = user.get('Item', {}).get('tags', [])
    return tags

def paginate_list(data, page, limit):
    start = (page - 1) * limit
    end = page * limit

    if len(data) < start or len(data) < end:
        return data[-limit:]

    page_data = data[start:end]
    return page_data

def get_all_news(news_table):
    return news_table.table.scan().get('Items', [])
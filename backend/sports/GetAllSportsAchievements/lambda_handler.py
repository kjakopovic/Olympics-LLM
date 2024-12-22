import logging
import pandas as pd

from validation_schema import schema
from aws_lambda_powertools.utilities.validation import validate

logger = logging.getLogger("GetAllSportsAchievements")
logger.setLevel(logging.DEBUG)

from common.common import (
    lambda_middleware,
    build_response,
    ValidationError
)

@lambda_middleware
def lambda_handler(event, context):
    query_params = event.get("queryStringParameters", {})

    try:
        logger.debug(f"Validating query params: {query_params}")

        validate(event=query_params, schema=schema)
    except Exception as e:
        raise ValidationError(str(e))
    
    page = int(query_params.get("page", 1))
    limit = int(query_params.get("limit", 50))
    medal = query_params.get("medal", None)
    name = query_params.get("sportsman_name", None)
    sex = query_params.get("sex", None)
    sport = query_params.get("sport", None)
    event_name = query_params.get("event", None)
    country = query_params.get("country", None)

    if page < 1 or limit < 1:
        logger.error("Page and limit should be greater than 0.")

        return build_response(
            400,
            {
                'message': "Page and limit should be greater than 0."
            }
        )

    sorted_list = get_sorted_list_of_sportsmen(
        medal,
        name,
        sex,
        sport,
        event_name,
        country
    )
    
    paginated_list = paginate_list(sorted_list, page, limit)

    return build_response(
        200,
        {
            'message': "List of sportsmen returned successfully",
            'page': page,
            'total_records_found': len(sorted_list),
            'item_count': len(paginated_list),
            'items': paginated_list
        }
    )

def get_sorted_list_of_sportsmen(medal, name, sex, sport, event_name, country):
    logger.info("Sorting list of sportsmen")

    dataset = pd.read_csv("common/dataset.csv")

    logger.info("Applying filters to dataset columns")

    dataset = dataset[['Name', 'Sex', 'Sport', 'Event', 'Medal', 'Team', 'Year']]
    medal_order = {'Gold': 1, 'Silver': 2, 'Bronze': 3}

    dataset.columns = dataset.columns.str.lower()

    filtered_df = apply_filters_to_dataset(dataset, medal, name, sex, sport, event_name, country)

    # Add a temporary column for sorting
    filtered_df['Medal_Order'] = filtered_df['medal'].map(medal_order)

    # Sort by the 'Medal_Order' column and then drop the temporary column
    sorted_df = filtered_df.sort_values(by='Medal_Order').drop(columns=['Medal_Order'])

    # Convert the sorted DataFrame into a list of dictionaries
    return sorted_df.to_dict(orient='records')

def apply_filters_to_dataset(dataset, medal, name, sex, sport, event_name, country):
    if medal:
        logger.debug(f"Filtering by medal: {medal}")
        dataset = dataset[dataset['medal'].str.lower() == medal.lower()]
    
    if name:
        logger.debug(f"Filtering by name: {name}")
        dataset = dataset[dataset['name'].str.lower() == name.lower()]

    if sex:
        logger.debug(f"Filtering by sex: {sex}")
        dataset = dataset[dataset['sex'] == sex]

    if sport:
        logger.debug(f"Filtering by sport: {sport}")
        dataset = dataset[dataset['sport'].str.lower() == sport.lower()]

    if event_name:
        logger.debug(f"Filtering by event: {event_name}")
        dataset = dataset[dataset['event'].str.lower() == event_name.lower()]

    if country:
        logger.debug(f"Filtering by country: {country}")
        dataset = dataset[dataset['team'].str.lower() == country.lower()]

    logger.info(f"Dataset length: {len(dataset)}")

    return dataset

def paginate_list(data, page_number, limit_per_page):
    # It's page_number - 1 because the minimum page is 1 not 0
    start_index = (page_number - 1) * limit_per_page
    end_index = page_number * limit_per_page

    logger.debug(f"start index: {start_index} end index: {end_index}")

    if len(data) < start_index or len(data) < end_index:
        return data[-limit_per_page:]

    # Slice the list to get the items for the current page
    page_data = data[start_index:end_index]
    return page_data

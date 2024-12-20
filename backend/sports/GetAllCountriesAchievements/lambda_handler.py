import logging
import pandas as pd

from validation_schema import schema
from aws_lambda_powertools.utilities.validation import validate

logger = logging.getLogger("GetAllCountriesAchievements")
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
        validate(event=query_params, schema=schema)
    except Exception as e:
        raise ValidationError(str(e))
    
    page = int(query_params.get("page", "1"))
    limit = int(query_params.get("limit", "50"))
    min_year = int(query_params.get("min_year", "1800"))
    max_year = int(query_params.get("max_year", "9999"))
    list_of_sports = query_params.get("list_of_sports", "").split(",")

    if page < 1 or limit < 1:
        return build_response(
            400,
            {
                'message': "Page and limit should be greater than 0."
            }
        )
    
    if min_year < 1800 or max_year > 9999:
        return build_response(
            400,
            {
                'message': "min_year should be greater than 1800 and max_year should be less than 9999."
            }
        )

    if min_year > max_year:
        return build_response(
            400,
            {
                'message': "min_year should be less than max_year."
            }
        )

    sorted_list = get_sorted_list_of_countries_with_medals(min_year, max_year, list_of_sports)
    
    paginated_list = paginate_list(sorted_list, page, limit)

    return build_response(
        200,
        {
            'message': "List of countries with medals returned successfully",
            'page': page,
            'total_records_found': len(sorted_list),
            'item_count': len(paginated_list),
            'items': paginated_list
        }
    )

def get_sorted_list_of_countries_with_medals(min_year, max_year, list_of_sports):
    dataset = pd.read_csv("common/dataset.csv")
    
    logger.debug(f"Dataset length: {len(dataset)}")

    dataset = dataset[dataset['Medal'] != 'No medal']

    logger.debug(f"Dataset length: {len(dataset)}")
    
    filtered_dataset = apply_filters_to_dataset(dataset, min_year, max_year, list_of_sports)

    logger.debug(f"Dataset length: {len(filtered_dataset)}")

    # Group by "Team" and count the medals
    team_medals = filtered_dataset.groupby('Team')['Medal'].value_counts().unstack(fill_value=0)

    # Reset index to include the team in the result
    team_medals = team_medals.reset_index()

    logger.debug(f"Dataset length: {len(team_medals)}")

    # Convert the result into a list of objects (dictionaries)
    result = []
    for _, row in team_medals.iterrows():
        team_info = {
            'country': row.get('Team', 'N/A'),
            'gold': row.get('Gold', 0),
            'silver': row.get('Silver', 0),
            'bronze': row.get('Bronze', 0)
        }
        result.append(team_info)

    logger.debug(f"Dataset length: {len(result)}")

    return sorted(result, key=lambda x: (-x['gold'], -x['silver'], -x['bronze']))

def apply_filters_to_dataset(dataset, min_year, max_year, list_of_sports):
    logger.debug(f"min year and max year: {min_year} {max_year}")
    
    if min_year > 1800:
        dataset = dataset[dataset['Year'] >= min_year]

    if max_year < 9999:
        dataset = dataset[dataset['Year'] <= max_year]

    logger.debug(f"list of sports count and shape: {len(list_of_sports)} {list_of_sports}")

    if list_of_sports and len(list_of_sports) > 0 and list_of_sports[0] != '':
        dataset = dataset[dataset['Sport'].isin(list_of_sports)]

    return dataset

def paginate_list(data, page_number, limit_per_page):
    # It's page_number - 1 because the minimum page is 1 not 0
    start_index = (page_number - 1) * limit_per_page
    end_index = page_number * limit_per_page

    if len(data) < start_index or len(data) < end_index:
        return data[-limit_per_page:]

    # Slice the list to get the items for the current page
    page_data = data[start_index:end_index]
    return page_data
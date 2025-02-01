import logging
import pandas as pd

from validation_schema import schema
from aws_lambda_powertools.utilities.validation import validate

logger = logging.getLogger("GetAllMedalsPerSportsman")
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
        logger.error(f"Validation error: {str(e)}")

        raise ValidationError(str(e))
    
    min_year = int(query_params.get("min_year", "2000"))
    max_year = int(query_params.get("max_year", "2024"))
    list_of_sports = query_params.get("list_of_sports", "").split(",")

    if min_year > max_year:
        logger.error("min_year should be less than max_year.")

        return build_response(
            400,
            {
                'message': "min_year should be less than max_year."
            }
        )

    data = get_medals_per_sportsmen(min_year, max_year, list_of_sports)
    
    return build_response(
        200,
        {
            'message': "List of medals per sportsmen returned successfully",
            'data': data
        }
    )

def get_medals_per_sportsmen(min_year, max_year, list_of_sports):
    dataset = pd.read_csv("common/dataset.csv")

    filtered_dataset = apply_filters_to_dataset(dataset, min_year, max_year, list_of_sports)

    medal_counts = filtered_dataset.pivot_table(index='Name', columns='Medal', aggfunc='size', fill_value=0)

    # Ensure all medal types are present (even if some are missing in dataset)
    medal_types = ['No medal', 'Gold', 'Bronze', 'Silver']
    for medal in medal_types:
        if medal not in medal_counts.columns:
            medal_counts[medal] = 0  # Add missing medal type with count 0

    # Calculate total appearances (sum of all medals)
    medal_counts['Total_Appearances'] = medal_counts.sum(axis=1)

    # Sort by total medals (gold first, then silver, then bronze)
    medal_counts = medal_counts.sort_values(by=['Gold', 'Silver', 'Bronze', 'Total_Appearances'], ascending=False)

    # Get top 5 sportsmen
    top_5 = medal_counts.head(5)

    top_5 = top_5.reset_index()

    # Convert the sorted DataFrame into a list of dictionaries
    return top_5.to_dict(orient='records')

def apply_filters_to_dataset(dataset, min_year, max_year, list_of_sports):
    logger.debug(f"min year and max year: {min_year} {max_year}")
    
    if min_year > 1800:
        dataset = dataset[dataset['Year'] >= min_year]

    if max_year < 9999:
        dataset = dataset[dataset['Year'] <= max_year]

    logger.debug(f"list of sports count and shape: {len(list_of_sports)} {list_of_sports} for min_year: {min_year} and max_year: {max_year}")

    if list_of_sports and len(list_of_sports) > 0 and list_of_sports[0] != '':
        dataset = dataset[dataset['Sport'].isin(list_of_sports)]

    return dataset
import logging
import pandas as pd

# from validation_schema import schema
# from aws_lambda_powertools.utilities.validation import validate

logger = logging.getLogger("GetAllMedalsPerSportsman")
logger.setLevel(logging.DEBUG)

from common.common import (
    lambda_middleware,
    build_response,
    # ValidationError
)

@lambda_middleware
def lambda_handler(event, context):
    data = get_medals_per_sportsmen()
    
    return build_response(
        200,
        {
            'message': "List of medals per sportsmen returned successfully",
            'data': data
        }
    )

def get_medals_per_sportsmen():
    dataset = pd.read_csv("common/dataset.csv")

    medal_counts = dataset.pivot_table(index='Name', columns='Medal', aggfunc='size', fill_value=0)

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

    # Convert the sorted DataFrame into a list of dictionaries
    return top_5.to_dict(orient='records')

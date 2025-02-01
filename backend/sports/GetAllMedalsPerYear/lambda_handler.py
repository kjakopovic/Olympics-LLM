import logging
import pandas as pd

# from validation_schema import schema
# from aws_lambda_powertools.utilities.validation import validate

logger = logging.getLogger("GetAllMedalsPerYear")
logger.setLevel(logging.DEBUG)

from common.common import (
    lambda_middleware,
    build_response,
    # ValidationError
)

@lambda_middleware
def lambda_handler(event, context):
    data = get_medals_per_year()
    
    return build_response(
        200,
        {
            'message': "List of medals per year returned successfully",
            'data': data
        }
    )

def get_medals_per_year():
    dataset = pd.read_csv("common/dataset.csv")

    medal_counts_per_year = dataset.pivot_table(index='Year', columns='Medal', aggfunc='size', fill_value=0)

    # Calculate total medals per year
    medal_counts_per_year['total'] = medal_counts_per_year[['Gold', 'Silver', 'Bronze']].sum(axis=1)

    medal_counts_per_year = medal_counts_per_year[['total']]
    medal_counts_per_year = medal_counts_per_year.reset_index()

    # Rename columns for consistency
    medal_counts_per_year = medal_counts_per_year.rename(columns={
        'Year': 'year'
    })

    # Convert the sorted DataFrame into a list of dictionaries
    return medal_counts_per_year.to_dict(orient='records')

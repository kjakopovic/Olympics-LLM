import logging
import pandas as pd

logger = logging.getLogger("GetAllMedalsPerContinent")
logger.setLevel(logging.DEBUG)

from common.common import (
    lambda_middleware,
    build_response,
)

@lambda_middleware
def lambda_handler(event, context):
    return build_response(
        200,
        {
            'message': "Not implemented yet"
        }
    )

schema = {
    "type": "object",
    "properties": {
        "page": {
            "type": "string",
            "pattern": "^[0-9]+$"
        },
        "limit": {
            "type": "string",
            "pattern": "^[0-9]+$"
        },
        "min_year": {
            "type": "string",
            "pattern": "^[0-9]+$"
        },
        "max_year": {
            "type": "string",
            "pattern": "^[0-9]+$"
        },
        "list_of_sports": {
            "type": "string"
        }
    },
    "required": ["page", "limit"],
    "additionalProperties": False
}

# TODO: also check if the page * limit is greater than size of the list, if so return last limit items
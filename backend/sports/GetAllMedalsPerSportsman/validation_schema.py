schema = {
    "type": "object",
    "properties": {
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
    "required": [],
    "additionalProperties": False
}
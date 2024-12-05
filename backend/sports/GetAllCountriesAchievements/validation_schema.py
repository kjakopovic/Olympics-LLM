schema = {
    "type": "object",
    "properties": {
        "page": {
            "type": "number",
            "minimum": 1
        },
        "limit": {
            "type": "number",
            "minimum": 5,
            "maximum": 50
        },
        "min_year": {
            "type": "number",
            "minimum": 1800,
            "maximum": 9999
        },
        "max_year": {
            "type": "number",
            "minimum": 1800,
            "maximum": 9999
        },
        "list_of_sports": {
            "type": "string"
        }
    },
    "required": ["page", "limit"],
    "additionalProperties": False
}
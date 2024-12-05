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
        "medal": {
            "type": "string",
            "minLength": 1
        },
        "sportsman_name": {
            "type": "string",
            "minLength": 1
        },
        "sex": {
            "type": "string",
            "enum": ["M", "F"]
        },
        "sport": {
            "type": "string",
            "minLength": 1
        },
        "event": {
            "type": "string",
            "minLength": 1
        },
        "country": {
            "type": "string",
            "minLength": 1
        }
    },
    "required": ["page", "limit"],
    "additionalProperties": False
}
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
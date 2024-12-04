schema = {
    "type": "object",
    "properties": {
        "title": {
            "type": "string",
            "maxLength": 255
        },
        "description": {
            "type": "string",
            "maxLength": 255
        },
        "picture_count": {
            "type": "integer",
            "minimum": 1
        }
    },
    "required": ["title", "description", "picture_count"],
    "additionalProperties": False
}
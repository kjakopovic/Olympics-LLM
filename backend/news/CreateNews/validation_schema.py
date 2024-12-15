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
        },
        "tags": {
            "type": "array",
            "items": {
                "type": "string",
                "maxLength": 255
            },
            "uniqueItems": True,
            "minItems": 1,
            "maxItems": 3
        }
    },
    "required": ["title", "description", "picture_count", "tags"],
    "additionalProperties": False
}

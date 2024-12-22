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
        "new_pictures_count": {
            "type": "integer",
            "minimum": 0
        },
        "pictures_to_delete": {
            "type": "array",
            "items": {
                "type": "string"
            },
            "uniqueItems": True
        },
        "tags": {
            "type": "array",
            "items": {
                "type": "string",
                "maxLength": 255
            },
            "uniqueItems": True,
            "maxItems": 3
        }
    },
    "additionalProperties": False
}
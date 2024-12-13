schema = {
    "type": "object",
    "properties": {
        "first_name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 50
        },
        "last_name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 50
        },
        "phone_number": {
            "type": "string",
            "minLength": 8,
            "maxLength": 15,
            "pattern": r"^\+?[1-9]\d{1,14}$"
        },
        "tags": {
            "type": "array",
            "items": {
                "type": "string",
                "maxLength": 255
            },
            "uniqueItems": True,
            "minimum": 1,
            "maximum": 3
        }
    },
    "additionalProperties": False
}

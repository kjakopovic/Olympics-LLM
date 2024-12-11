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
            "minLength": 1,
            "maxLength": 50
        },
        "tags": {
            "type": "array",
            "items": {
                "type": "string"
            },
            "uniqueItems": True
        }
    },
    "additionalProperties": False
}
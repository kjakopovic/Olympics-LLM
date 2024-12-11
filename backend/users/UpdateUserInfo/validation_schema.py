schema = {
    "type": "object",
    "properties": {
        "email": {
            "type": "string",
            "format": "email"
        },
        "password": {
            "type": "string",
            "minLength": 7
        },
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
    "required": ["email", "first_name", "last_name"],
    "additionalProperties": False
}
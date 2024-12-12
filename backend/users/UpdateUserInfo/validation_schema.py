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
            "maxLength": 50,
            "pattern": r"^\+?[1-9]\d{1,14}$"     # E.164 format regex for phone numbers
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

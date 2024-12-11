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
        "new_password": {
            "type": "string",
            "minLength": 7
        }
    },
    "required": ["email", "password", "new_password"],
    "additionalProperties": False
}
import boto3
import json
import jwt
from os import environ

def get_secret(secret_name: str, region_name: str = "us-east-1") -> str:
    """
    Fetch a secret from AWS Secrets Manager.
    :param secret_name: Name of the secret.
    :param region_name: AWS region where the secret is stored.
    :return: The secret value as a string.
    """
    # Create a Secrets Manager client
    client = boto3.client("secretsmanager", region_name=region_name)

    # Retrieve the secret value
    response = client.get_secret_value(SecretId=secret_name)

    # Secrets Manager returns a JSON string; parse if necessary
    if "SecretString" in response:
        return json.loads(response["SecretString"])
    else:
        raise ValueError("SecretString not found in response.")

def get_jwt_secret():
    """
    Retrieve the JWT token from AWS Secrets Manager.
    """
    secret_name = environ.get("JWT_SECRET_NAME")
    region_name = environ.get("SECRETS_REGION_NAME", "eu-central-1")
    try:
        secret = get_secret(secret_name, region_name)
        return secret.get("jwt_secret")
    except Exception as e:
        raise RuntimeError(f"Error fetching secret: {e}")
    
def validate_jwt_token(access_token: str):
    """
    Validate jwt token to see if it is expired or invalid.
    """
    jwt_secret = get_jwt_secret()

    try:
        jwt.decode(access_token.encode('utf-8'), jwt_secret, algorithms=["HS256"])
    except Exception:
        return False

    return True
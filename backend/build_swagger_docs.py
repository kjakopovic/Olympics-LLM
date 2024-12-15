import yaml

# Base apis for each service
users_base_api = {
    "url": "https://ewq9oc1sb4.execute-api.eu-central-1.amazonaws.com",
    "description": "Users service base api"
}
sports_base_api = {
    "url": "https://1sccfx41r1.execute-api.eu-central-1.amazonaws.com",
    "description": "Sports service base api"
}
news_base_api = {
    "url": "https://5lnspigo1g.execute-api.eu-central-1.amazonaws.com",
    "description": "News service base api"
}

# List of services and list of lambdas that don't require authentication
list_of_services = [
    "news",
    "users",
    "sports"
]
list_of_unauthorized_lambdas = [
    "RegisterUserFunction",
    "LoginUserFunction",
    "ThirdPartyLoginRequestFunction",
    "ThirdPartyLoginValidateFunction"
]

# OpenAPI documentation starting point
openapi_doc = {
    "openapi": "3.0.0",
    "info": {
        "title": "Olympus API docs",
        "version": "1.0.0"
    },
    "servers": [
        users_base_api,
        sports_base_api,
        news_base_api
    ],
    "components": {
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "Use Bearer token for authentication, dont write Bearer in front, just send the token"
            }
        }
    },
    "paths": {},
    "tags": []
}

def get_url_for_service(service):
    if service == "users":
        return users_base_api
    elif service == "sports":
        return sports_base_api
    elif service == "news":
        return news_base_api
    else:
        return "default URL"

def save_openapi_doc(openapi_doc, output_path):
    with open(output_path, "w") as f:
        yaml.dump(openapi_doc, f, sort_keys=False)
    print(f"OpenAPI documentation saved to {output_path}")

def extract_swagger_from_template(list_of_services, list_of_unauthorized_lambdas):
    for service in list_of_services:
        # Load the template.yaml file for each service and open it
        template_path = f"./{service}/template_docs.yaml"
        current_url = get_url_for_service(service)
        
        with open(template_path, "r") as f:
            template = yaml.load(f, Loader=yaml.FullLoader)

        # Adding tags for each service so we have a structured swagger docs
        if service not in openapi_doc["tags"]:
            openapi_doc["tags"].append({
                "name": service,
                "description": f"Operations related to {service}"
            })

        # Read lambdas and events from the template.yaml file
        resources = template.get("Resources", {})
        for resource_name, resource_details in resources.items():
            metadata = resource_details.get("Metadata", {}).get("Swagger", {})
            events = resource_details.get("Properties", {})

            if not metadata or not events:
                print(f"Warning: No Swagger metadata found for resource '{resource_name}'")
                continue
            
            print(f"Processing event '{events}'")

            api_path = events.get("Path", {})
            # Making sure paths are not conflicting
            api_path = f"/v1-{service}{api_path}"

            api_method = events.get("Method", {}).lower()

            if not api_method or not api_path:
                print(f"Warning: No ApiEvent found in event for resource '{resource_name}'")
                continue

            if api_path not in openapi_doc["paths"]:
                openapi_doc["paths"][api_path] = {}

            # Add the Swagger metadata with the tag for grouping
            openapi_doc["paths"][api_path][api_method] = {
                **metadata,
                "tags": [service],
                "servers": [current_url],
                "security": [{"BearerAuth": []}] if resource_name not in list_of_unauthorized_lambdas else [],
            }
                    
    return openapi_doc

# Build swagger docs for sports service
openapi_doc = extract_swagger_from_template(list_of_services, list_of_unauthorized_lambdas)
save_openapi_doc(openapi_doc, "./swagger/openapi.yaml")

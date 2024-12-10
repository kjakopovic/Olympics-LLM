from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from endpoints import chat_bot
from utils.auth import validate_jwt_token

PROTECTED_PATHS = ["/api/v1/chat-bot"]

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    """
    Middleware to check for JWT token if the route is in the protected paths list.
    """
    if request.url.path in PROTECTED_PATHS:
        # Retrieve token from request headers
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                {
                    "message": "Authorization header is missing or invalid."
                },
                status_code=401
            )

        token = auth_header.split("Bearer ")[1]

        try:
            is_valid = validate_jwt_token(token)
            if not is_valid:
                return JSONResponse({
                    "message": "Invalid or expired token."
                }, 
                status_code=403
            )
        except Exception as e:
            return JSONResponse(
                {
                    "message": f"Authentication error: {str(e)}"
                }, 
                status_code=500
            )

    # Proceed to the next middleware or endpoint
    response = await call_next(request)
    return response

# Include routes from other files
app.include_router(chat_bot.router, prefix="/api/v1/chat-bot")

@app.get("/")
def healthcheck():
    return {
        "message": "Backend is running!"
    }
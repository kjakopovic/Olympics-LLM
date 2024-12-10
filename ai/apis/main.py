from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints import chat_bot

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes from other files
app.include_router(chat_bot.router, prefix="/api/v1/chat-bot")

# TODO:
# kada budem radio dockerfile, moram runnat prvo pip install requirementsa
# pip install -r requirements.txt
from fastapi import APIRouter, Query
from transformers import pipeline
from transformers import AutoTokenizer, AutoModelForCausalLM
from huggingface_hub import login
from dotenv import load_dotenv

import os

router = APIRouter()

output_dir = os.path.join(os.path.dirname(__file__), "..", "model", "gpt-v1")

@router.get("/")
def generate_chatbot_response(question: str = Query(...)):
    load_dotenv()
    token = os.getenv("HUGGINGFACE_API_TOKEN")
    login(token)

    model = AutoModelForCausalLM.from_pretrained(output_dir)
    tokenizer = AutoTokenizer.from_pretrained(output_dir)

    pipe = pipeline(
        "text-generation", 
        model=model,
        tokenizer=tokenizer,
        max_length=100
    )

    response = pipe(question)

    # Removing question from the response
    generated_text = response[0].get("generated_text")
    generated_text = generated_text.replace(question + " ", "").strip()

    return {
        "generated_text": generated_text
    }
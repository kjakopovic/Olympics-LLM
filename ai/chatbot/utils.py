import torch
import os

from huggingface_hub import login
from transformers import pipeline
from transformers import AutoTokenizer, AutoModelForCausalLM

def get_cuda_device() -> torch.device:
    print("Listing all available CUDA devices:")

    for i in range(torch.cuda.device_count()):
        print(f"Device {i}: {torch.cuda.get_device_name(i)}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print(device)

    return device

def login_to_huggingface():
    token = os.getenv("HUGGINGFACE_API_TOKEN")

    login(token)

def ask_ai(question: str, model_id, tokenizer, device: torch.device) -> str:
    pipe = pipeline(
        "text-generation",
        model=model_id,
        tokenizer=tokenizer,
        torch_dtype=torch.bfloat16,
        device=device
    )

    response = pipe(question)

    return response[0]["generated_text"]

def load_model_to_backend_api(model_path: str, api_path: str):
    print(f"Getting model and token from path: {model_path}")
    model = AutoModelForCausalLM.from_pretrained(model_path)
    tokenizer = AutoTokenizer.from_pretrained(model_path)

    print(f"Saving model and tokenizer to backend api path: {api_path}")
    model.save_pretrained(api_path)
    tokenizer.save_pretrained(api_path)

import torch
import data_utils

from transformers import Trainer, TrainingArguments

def train_model(model_to_train, tokenizer_for_model, dataset_sentences: list, save_model_dir: str, device: torch.device):
    print("Preparing dataset")
    train_dataset = data_utils.TextGenerationDataset(dataset_sentences, tokenizer_for_model, device)

    print("Setting training arguments")
    training_args = TrainingArguments(
        output_dir="trainer",               # Output directory
        learning_rate=5e-5,                 # Learning rate
        per_device_train_batch_size=2,      # Batch size
        weight_decay=0.01,                  # Weight decay
        save_strategy="no",                 # No saving on checkpoints
        logging_dir="logs",                 # Log directory
        logging_steps=10,                   # Log every 10 steps
        fp16=True,                          # Enable mixed precision (if supported)
    )

    print("Initializing trainer")
    trainer = Trainer(
        model=model_to_train,
        args=training_args,
        train_dataset=train_dataset,
        tokenizer=tokenizer_for_model,
    )

    print("Model finetune started...")
    trainer.train()

    print(f"Saving model and it's tokenizer to dir: {save_model_dir}")
    model_to_train.save_pretrained(save_model_dir)
    tokenizer_for_model.save_pretrained(save_model_dir)
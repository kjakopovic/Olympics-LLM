import pandas as pd

from charset_normalizer import detect
from torch.utils.data import Dataset

def return_dataset_encoding(dataset_path: str) -> str:
    print(f"Reading file from {dataset_path}")
    with open(dataset_path, 'rb') as file:
        raw_data = file.read()

    print("Detecting encoding of the dataset")
    result = detect(raw_data)

    encoding = result['encoding']
    
    print(f"Detected encoding: {encoding}")
    return encoding

def transform_dataset_into_sentences(dataset_path: str) -> list:
    sentences = []

    dish = pd.read_csv(dataset_path)
    dish['english_name'] = dish['english_name'].fillna(dish['local_name'])

    unique_countries = dish['countries'].unique()
    list_of_foods = []
    for country in unique_countries:
        country_data = dish[dish['countries'] == country]

        country_regions = country_data['regions'].unique()

        for region in country_regions:
            region_data = country_data[country_data['regions'] == region]

            if len(region_data['english_name'].values) == 0:
                continue
            
            sentences.append(f"What is the most eaten food in {country}, {region}? In {country}, {region} the most eaten food is {region_data['english_name'].values[0]}")
            sentences.append(f"What is the most eaten food in {region}? In {country}, {region} the most eaten food is {region_data['english_name'].values[0]}")
            sentences.append(f"What do people in {region} eat? In {country}, {region} the most eaten food is {region_data['english_name'].values[0]}")
            sentences.append(f"What do people in {country}, {region} eat? In {country}, {region} the most eaten food is {region_data['english_name'].values[0]}")
            list_of_foods.append(f"{region_data['english_name'].values[0]}")

        sentences.append(f"What is the most eaten food in {country}? The most common eaten foods in {country}: {', '.join(list_of_foods).rstrip()}")
        sentences.append(f"What is the most eaten food in {country}? The most eaten foods in {country}: {', '.join(list_of_foods).rstrip()}")
        sentences.append(f"What do people in {country} eat? The most eaten foods in {country}: {', '.join(list_of_foods).rstrip()}")
        list_of_foods = []

    return sentences

class TextGenerationDataset(Dataset):
    def __init__(self, texts, tokenizer, device, max_length=512):
        self.tokenizer = tokenizer
        self.texts = texts
        self.max_length = max_length
        self.device = device

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        # Tokenize the text with padding and truncation
        encoding = self.tokenizer(
            self.texts[idx],
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
            return_tensors="pt",
        ).to(self.device)
        
        # Labels are the same as input_ids for causal language modeling
        encoding["labels"] = encoding["input_ids"]
        return {key: val.squeeze(0) for key, val in encoding.items()}
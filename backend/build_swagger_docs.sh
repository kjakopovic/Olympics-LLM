#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Install dependencies from requirements.txt
echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt

# Run the Python script to build Swagger docs
echo "Running build_swagger_docs.py..."
python build_swagger_docs.py

echo "Process completed successfully!"

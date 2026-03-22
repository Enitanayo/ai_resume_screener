import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

def test_model(model_name):
    print(f"\n--- Testing Model: {model_name} ---")
    prompt = "Return 'OK' in JSON."
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        print(f"Success: {response.text}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    models_to_test = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
    ]
    for m in models_to_test:
        test_model(m)

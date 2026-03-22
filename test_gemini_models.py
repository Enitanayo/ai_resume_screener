from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

def test_model(model_name):
    print(f"Testing model: {model_name}")
    try:
        response = client.models.generate_content(
            model=model_name,
            contents="Hello, identify yourself and return 'OK' in JSON.",
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            ),
        )
        print(f"Success with {model_name}: {response.text}")
    except Exception as e:
        print(f"Failed with {model_name}: {e}")

test_model("gemini-2.5-flash")
test_model("models/gemini-2.5-flash")
test_model("gemini-1.5-flash")
test_model("models/gemini-1.5-flash")
test_model("gemini-2.0-flash")
test_model("models/gemini-2.0-flash")

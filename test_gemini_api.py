import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

print("Initializing Gemini Client...")
try:
    client = genai.Client(api_key=api_key)
    
    print("Making a small test request to Gemini API (gemini-1.5-flash)...")
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents="Say 'Hello, API is working!'",
    )
    print("\nSUCCESS! Response from Google Gemini API:")
    print("-----------------------------------------")
    print(response.text)
    print("-----------------------------------------")
except Exception as e:
    print("\nFAILED! Error connecting to Gemini API:")
    import traceback
    traceback.print_exc()

import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("GEMINI_API_KEY")
print(f"Using API Key ending in: ...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("NO API KEY FOUND in .env!")
    exit(1)

client = genai.Client(api_key=api_key)

try:
    print("Testing Parser Model (gemini-2.5-flash)...")
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Say 'Hello, test!'",
    )
    print("PASSED. Response:", response.text)
except Exception as e:
    print("FAILED on Parser Model.")
    print(str(e))

try:
    print("\nTesting Embedding Model (models/gemini-embedding-001)...")
    response = client.models.embed_content(
        model="models/gemini-embedding-001",
        contents="Say 'Hello, test!'",
    )
    print("PASSED. Embeddings length:", len(response.embeddings[0].values))
except Exception as e:
    print("FAILED on Embedding Model.")
    print(str(e))

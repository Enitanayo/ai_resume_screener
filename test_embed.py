import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

print("Testing embedding API call...")
try:
    result = client.models.embed_content(
        model="models/gemini-embedding-001",
        contents="Hello world"
    )
    print("SUCCESS! Dimension:", len(result.embeddings[0].values))
except Exception as e:
    print("FAILED!")
    import traceback
    traceback.print_exc()

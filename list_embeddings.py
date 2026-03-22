import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

print("Listing supported embedding models:")
for m in client.models.list():
    if "embed" in m.name.lower():
        print(m.name)

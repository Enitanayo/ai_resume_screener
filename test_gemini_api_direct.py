import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERROR: GEMINI_API_KEY not found in .env file")
    exit(1)

client = genai.Client(api_key=api_key)

def test_parsing():
    print("\n--- Testing Resume Parsing (LLM) ---")
    model_name = "gemini-2.5-flash" # Current model in parser.py
    prompt = """
    You are an expert HR Resume Parser.
    Return ONLY valid JSON.
    Required keys:
    - skills: list[str]
    - experience_years: float
    - education: list[str]

    Resume Text:
    John Doe
    Software Engineer at Google
    Skills: Python, React, SQL
    Experience: 5 years
    Education: BS in Computer Science
    """
    
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            ),
        )
        print(f"Parsing Success!")
        print(f"Response: {response.text}")
        # Verify JSON
        data = json.loads(response.text)
        print("Validated JSON Output:", data)
    except Exception as e:
        print(f"Parsing Failed: {e}")

def test_embedding():
    print("\n--- Testing Embedding Generation ---")
    model_name = "models/gemini-embedding-001"
    text = "This is a test sentence for embedding generation."
    
    try:
        result = client.models.embed_content(
            model=model_name,
            contents=text
        )
        print(f"Embedding Success!")
        print(f"Vector length: {len(result.embeddings[0].values)}")
        print(f"First 5 values: {result.embeddings[0].values[:5]}")
    except Exception as e:
        print(f"Embedding Failed: {e}")

if __name__ == "__main__":
    print(f"Using API Key: {api_key[:10]}...{api_key[-5:]}")
    test_parsing()
    test_embedding()

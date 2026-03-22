from backend.config import settings
from dotenv import load_dotenv
import os

print("Settings key:   ..." + (settings.gemini_api_key[-5:] if settings.gemini_api_key else "None"))

load_dotenv(override=True)
env_key = os.getenv("GEMINI_API_KEY")
print(".env File key:  ..." + (env_key[-5:] if env_key else "None"))

if settings.gemini_api_key != env_key:
    print("\n[!] WARNING: The API key in backend.settings DOES NOT MATCH the .env file!!!")
    print("This means Windows is caching an old system variable that overrides your .env file!")
else:
    print("\nThe keys match. The issue lies elsewhere.")

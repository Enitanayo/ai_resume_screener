import requests

print("Testing OPTIONS /auth/register...")
try:
    response = requests.options(
        "http://127.0.0.1:8000/auth/register",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
        timeout=5
    )
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {response.headers}")
except requests.exceptions.Timeout:
    print("CRITICAL: The OPTIONS request timed out!")
except Exception as e:
    print(f"Error: {e}")

import requests

print("Testing /auth/register...")
try:
    response = requests.post(
        "http://127.0.0.1:8000/auth/register",
        json={
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "password": "password123!"
        },
        timeout=5
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except requests.exceptions.Timeout:
    print("CRITICAL: The request timed out! The backend is deadlocking.")
except Exception as e:
    print(f"Error: {e}")

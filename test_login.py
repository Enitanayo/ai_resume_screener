import requests

print("Testing /auth/login...")
try:
    response = requests.post(
        "http://127.0.0.1:8000/auth/login",
        data={
            "username": "test@example.com",
            "password": "password123!"
        },
        timeout=5
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    token = response.json().get("access_token")
    if token:
        print("\nTesting /auth/me...")
        me_resp = requests.get(
            "http://127.0.0.1:8000/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5
        )
        print(f"Me Status Code: {me_resp.status_code}")
        print(f"Me Response: {me_resp.text}")

except requests.exceptions.Timeout:
    print("CRITICAL: The request timed out!")
except Exception as e:
    print(f"Error: {e}")

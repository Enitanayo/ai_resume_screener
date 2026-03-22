import json
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal
from backend.models import Recruiter
from backend.auth import get_current_recruiter

client = TestClient(app)

db = SessionLocal()
recruiter = db.query(Recruiter).first()
db.close()

if not recruiter:
    print("Error: No recruiter found in DB to test with.")
    exit(1)

app.dependency_overrides[get_current_recruiter] = lambda: recruiter

response = client.get("/api/jobs")
with open("api_response.json", "w") as f:
    json.dump(response.json(), f, indent=2)

print(f"Status: {response.status_code}")
print("Response saved to api_response.json")

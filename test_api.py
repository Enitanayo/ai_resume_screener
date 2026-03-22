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

def override_get_current_recruiter():
    return recruiter

app.dependency_overrides[get_current_recruiter] = override_get_current_recruiter

response = client.get("/api/jobs")
print(f"Status: {response.status_code}")
print(f"Response Body: {response.json()}")

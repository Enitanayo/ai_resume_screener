import requests
import os
import time
import json

BASE_URL = 'http://127.0.0.1:8000'

def verify_fix():
    print(f"Connecting to {BASE_URL}...")
    try:
        # 1. Register a test recruiter
        recruiter_payload = {
            'email': 'verify@test.com',
            'password': 'Password123!',
            'first_name': 'Verify',
            'last_name': 'User'
        }
        print("Registering recruiter...")
        resp = requests.post(f'{BASE_URL}/auth/register', json=recruiter_payload)
        if resp.status_code != 200:
            print(f"Registration status: {resp.status_code}, content: {resp.text}")
        
        # 2. Login
        print("Logging in...")
        login_resp = requests.post(f'{BASE_URL}/auth/login', data={'username': 'verify@test.com', 'password': 'Password123!'})
        if login_resp.status_code != 200:
            print(f"Login failed: {login_resp.text}")
            return
            
        token = login_resp.json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}

        # 3. Create a test job
        print("Creating test job...")
        job_payload = {
            'job_title': 'Avionics Technician',
            'job_description': 'Maintenance and repair of aircraft electronics.',
            'required_skills': ['Avionics', 'Troubleshooting']
        }
        job_resp = requests.post(f'{BASE_URL}/api/jobs/', json=job_payload, headers=headers)
        if job_resp.status_code != 200:
            print(f"Job creation failed: {job_resp.text}")
            return
            
        job_id = job_resp.json()['id']
        print(f'Test Job Created (ID: {job_id})')

        # 4. Apply for job
        resume_path = r'c:\Users\OS\Documents\Final year project\test_datasets\Resume_1_Adeola_Williams.txt'
        print(f"Applying with resume: {resume_path}...")
        with open(resume_path, 'rb') as f:
            files = {'resume': ('Resume_1.txt', f, 'text/plain')}
            data = {
                'first_name': 'Test',
                'last_name': 'Candidate',
                'email': 'cand@test.com'
            }
            app_resp = requests.post(f'{BASE_URL}/application/apply/{job_id}', data=data, files=files)
            print(f'Application Submitted: {app_resp.status_code}')

        print('Waiting 15 seconds for worker to process...')
        time.sleep(15)

        # 5. Check status
        print("Checking application status...")
        status_resp = requests.get(f'{BASE_URL}/api/jobs/{job_id}/candidates', headers=headers)
        candidates = status_resp.json()
        print(f"Found {len(candidates)} candidates.")
        
        for cand in candidates:
            print(f"Candidate {cand['id']} ({cand['email']})")
            print(f"  Status: {cand['processing_status']}")
            if cand['processing_status'] == 'failed':
                print(f"  Error: {cand.get('processing_error')}")
            else:
                print(f"  Score: {cand.get('total_weighted_score')}")

    except Exception as e:
        print(f"Verification script error: {e}")

if __name__ == "__main__":
    verify_fix()

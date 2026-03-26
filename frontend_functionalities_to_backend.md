# Frontend vs Backend Functional Analysis

After reviewing the frontend API and authentication services, I've identified several pieces of functionality that the frontend is currently "hacking" or implementing on its own because the corresponding backend endpoints or logic are missing. 

Here is the list of functionalities and the probable backend solutions:

### 1. Candidate Authentication & Roles
- **Current Frontend Implementation:** The backend currently only supports registering "Recruiters". To work around this, the frontend fakes candidate roles by storing a `frontend_role_<email>` flag in the browser's `localStorage` (`authService.js`). 
- **Backend Solution:** Implement proper Role-Based Access Control (RBAC). 
  - Update `POST /auth/register` to accept a role parameter (e.g., `recruiter` vs `candidate`).
  - Ensure the JWT token includes the user's role so it can be verified on protected endpoints.
  - The `GET /auth/me` endpoint should return the correct role.

### 2. Candidate Application Tracking (My Applications)
- **Current Frontend Implementation:** Because there is no endpoint to fetch the jobs a candidate has applied to, `applyToJob` manually saves the application data into `localStorage` (`candidate_apps_<email>`). Later, `getMyApplications` reads this local storage list and makes individual API calls for each application to "hydrate" them with the live status (`api.js`).
- **Backend Solution:** 
  - **Endpoint:** Create a `GET /api/candidates/me/applications` endpoint.
  - **Logic:** Link candidate application records in the database to the authenticated User ID (not just their email). This allows the database to instantly query all applications belonging to the logged-in candidate.

### 3. Batch Resume Uploads
- **Current Frontend Implementation:** `batchUpload` loops over an array of files in the frontend and sends individual `POST /application/apply/{jobId}` requests. Worse, it fabricates fake candidate names and emails (e.g., `candidate_{Date.now()}_{i}@batch.upload`) just to pass the backend's required form fields (`api.js`).
- **Backend Solution:** 
  - **Endpoint:** Create a `POST /api/jobs/{jobId}/batch-upload` endpoint that accepts an array of files (`List[UploadFile]`).
  - **Logic:** The backend should process all files, dynamically generate or extract the candidates' real names/emails from the resume parsing step (or use temporary placeholders server-side), and immediately queue the batch process.

### 4. Candidate Matching, Filtering, and Ranking
- **Current Frontend Implementation:** `matchCandidates` fetches *every single candidate* for a job from the backend, and then uses JavaScript array methods to filter out pending candidates and mathematically sort them by their match score (`api.js`). This is terrible for performance if there are thousands of applicants.
- **Backend Solution:** 
  - **Endpoint:** Update `GET /api/jobs/{jobId}/candidates` to accept query parameters like `?status=ready&sort_by=score&order=desc`, or create a dedicated `GET /api/jobs/{jobId}/matches` endpoint.
  - **Logic:** The database should perform the sorting and filtering natively (using SQL `ORDER BY` and `WHERE` clauses) and return paginated results to the frontend.

### 5. Analytics (Dashboard and Candidate)
- **Current Frontend Implementation:** `getCandidateAnalytics` is currently calculating stats by reading the `localStorage` applications list. `getDashboardAnalytics` is a complete stub that just outputs a console warning because no backend endpoint exists (`api.js`).
- **Backend Solution:** 
  - **Endpoint:** Create `GET /api/analytics/dashboard` (for recruiters) and `GET /api/analytics/candidate` (for candidates).
  - **Logic:** The backend leverages SQL aggregations (e.g., `COUNT`, `GROUP BY` status/month) to return pre-calculated statistics for the charts and metrics.

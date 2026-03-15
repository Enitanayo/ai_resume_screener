# Resume Screener

An AI-powered resume screening backend that automatically parses resumes, generates embeddings, and scores candidates against job postings using semantic similarity and keyword matching.

## Features

- **Recruiter portal** — post jobs, view ranked candidates, and analytics
- **Candidate applications** — upload resumes (PDF / DOCX / DOC)
- **Background processing** — resume parsing and scoring handled asynchronously via Redis Queue
- **AI-powered parsing** — resume text extracted using Google Gemini (`gemini-2.5-flash`)
- **Semantic scoring** — embeddings generated with `sentence-transformers` (or OpenAI) and compared via cosine similarity

---

## Tech Stack

| Layer | Technology |
|---|---|
| API framework | FastAPI |
| Database | PostgreSQL 16 via SQLAlchemy + pgvector (vector storage) |
| Auth | JWT (PyJWT + Argon2 password hashing) |
| Background jobs | Redis + RQ (`rq==1.15.1`, `rq-win` for Windows) |
| Resume parsing | Google Gemini API (`google-genai`) |
| Embeddings | `sentence-transformers` (`all-MiniLM-L6-v2`) or OpenAI |
| PDF parsing | `pypdf` |
| DOCX parsing | `python-docx` |

---

## Project Structure

```
ai_resume_screener/
├── backend/             # FastAPI backend (Python)
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── database.py          # DB engine, session, Base
│   ├── config.py            # Settings loaded from .env
│   ├── auth.py              # JWT auth and password utils
│   ├── queue_client.py      # Redis + RQ Queue setup
│   ├── worker.py            # Background job functions
│   ├── requirements.txt
│   ├── routers/
│   │   ├── auth_routes.py   # /auth endpoints (register, login)
│   │   ├── recruiter.py     # /api/jobs endpoints
│   │   └── application.py   # /application endpoints
│   └── services/
│       ├── embedding.py     # Embedding generation
│       ├── parser.py        # Resume text extraction + Gemini LLM parsing
│       ├── scorer.py        # Match score calculation
│       └── util.py          # Cosine similarity helper
├── frontend/            # React frontend (Vite/JS)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── run_worker.py        # Windows-compatible RQ worker launcher
├── docker-compose.yml   # Redis + PostgreSQL/pgvector services
├── storage/             # Uploaded resumes (auto-created)
└── .gitignore           # Monorepo git rules
```

---

## Setup

### 1. Backend venv set up

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/macOS
pip install -r requirements.txt
```

### 2. Frontend set up

```bash
cd frontend
npm install
```

### 3. Configure environment variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://{PUT_USERNAME_HERE}:{PUT_PASSWORD_HERE}@localhost:5432/{PUT_DATABASE_NAME_HERE}
SECRET_KEY=your_secret_key_here
EMBEDDING_PROVIDER=          # leave empty to use sentence-transformers (local), or set to "openai"
OPENAI_API_KEY=              # required only if EMBEDDING_PROVIDER=openai
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Start services (Redis + PostgreSQL)

**Option A — Docker (recommended):**
```bash
docker-compose up -d
```

This starts:
- **Redis** on port `6379` (used by the RQ job queue)
- **PostgreSQL 16 with pgvector** on port `5432` (the main database)

> Data is persisted in a Docker volume (`pgdata`) so it survives container restarts.

**Option B — Run Redis and PostgreSQL separately (without Docker):**

Start a PostgreSQL instance with the `pgvector` extension installed, and a Redis server, then point the `DATABASE_URL` and `REDIS_URL` in `.env` at them.

### 5. Initialize the database

Tables and the `pgvector` extension are created automatically on first startup — no manual migration step is needed.

---

## Running the Application

You need **four terminals** running concurrently (all from the root folder):

### Terminal 1 — Backend API
```bash
.\venv\Scripts\activate
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### Terminal 2 — Worker
```bash
.\venv\Scripts\activate
python run_worker.py
```

### Terminal 3 — Frontend
```bash
cd frontend
npm run dev
```

### Terminal 4 — Redis
```bash
docker start redis-resume-screener
```

---

## API Endpoints

### Auth — `/auth`
| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new recruiter |
| `POST` | `/auth/login` | Login and receive a JWT token |

### Jobs (Recruiter) — `/api/jobs`
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/jobs` | Create a job posting (triggers background embedding) |
| `GET` | `/api/jobs` | List all jobs for the authenticated recruiter |
| `GET` | `/api/jobs/{job_id}` | Get a specific job posting |
| `PATCH` | `/api/jobs/{job_id}` | Update a job posting |
| `DELETE` | `/api/jobs/{job_id}` | Delete a job posting |
| `GET` | `/api/jobs/{job_id}/candidates` | List ranked candidates for a job |
| `GET` | `/api/jobs/{job_id}/candidate/{candidate_id}` | Get a specific candidate's details |
| `GET` | `/api/jobs/{job_id}/analytics` | Get analytics for a job |

### Applications — `/application`
| Method | Path | Description |
|---|---|---|
| `POST` | `/application/apply/{job_id}` | Submit a job application with resume upload |

---

## Background Processing

When a job is posted or a candidate applies, a job is enqueued in Redis and processed by the worker:

**Job posted** → `process_job(job_id)`:
1. Generates embedding for `job_description` → stored as `job_vector`
2. Generates embedding for `required_skills` → stored as `skills_vector`
3. Sets `processing_status = "ready"`

**Candidate applies** → `process_application(candidate_id)`:
1. Parses resume (PDF/DOCX) with Gemini → extracts `skills`, `raw_text`
2. Generates embeddings for raw text and skills
3. Scores candidate against the job using semantic + keyword matching
4. Sets `processing_status = "ready"` with scores stored in DB

---

## Windows Notes

The standard `rq worker` command uses `os.fork()` which does not exist on Windows. This project uses `rq-win`'s `WindowsWorker` via `run_worker.py` to work around this limitation.

> **Note:** Job timeouts are not enforced on Windows (no `SIGALRM`). For production, run the worker on Linux or WSL2.

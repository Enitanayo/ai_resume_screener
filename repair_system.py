from redis import Redis
from rq import Queue
from backend.database import SessionLocal
from backend import models
from sqlalchemy import select, update

# 1. Clear Redis
try:
    redis_conn = Redis(host="localhost", port=6379, db=0)
    queue = Queue("resumes", connection=redis_conn)
    queue.empty()
    from rq.registry import FailedJobRegistry, StartedJobRegistry
    FailedJobRegistry(queue=queue).active_job_ids() # just to load
    for job_id in FailedJobRegistry(queue=queue).get_job_ids():
        queue.fetch_job(job_id).delete()
    print("✓ Redis Queue Cleared")
except Exception as e:
    print(f"✗ Redis Error: {e}")

# 2. Reset Pending Candidates
try:
    with SessionLocal() as db:
        # Reset any candidates that are 'processing' back to 'pending'
        db.execute(
            update(models.CandidateApplication)
            .where(models.CandidateApplication.processing_status == "processing")
            .values(processing_status="pending")
        )
        db.commit()
        
        # Get all pending candidates
        stmt = select(models.CandidateApplication).where(models.CandidateApplication.processing_status == "pending")
        pending = db.execute(stmt).scalars().all()
        print(f"✓ Found {len(pending)} pending resumes. Re-enqueuing...")
        
        # Re-enqueue them
        from backend.queue_client import queue as backend_queue
        for c in pending:
            backend_queue.enqueue("backend.worker.process_application", c.id)
            
    print("✓ All jobs re-enqueued sequentially.")
except Exception as e:
    print(f"✗ DB Error: {e}")

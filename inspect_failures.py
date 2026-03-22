from redis import Redis
from rq import Queue
from rq.registry import FailedJobRegistry
import sys

try:
    redis_conn = Redis(host="localhost", port=6379, db=0)
    queue = Queue("resumes", connection=redis_conn)
    failed = FailedJobRegistry(queue=queue)
    
    print(f"Total failed jobs: {len(failed)}")
    
    job_ids = failed.get_job_ids()
    if job_ids:
        # Check the last 3 failures
        for job_id in job_ids[-3:]:
            job = queue.fetch_job(job_id)
            if job:
                print(f"\n--- Job {job_id} ---")
                print(f"Function: {job.func_name}")
                print(f"Args: {job.args}")
                print(f"Exc Info: {job.exc_info}")

except Exception as e:
    print(f"Error: {e}")

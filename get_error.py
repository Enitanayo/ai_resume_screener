from redis import Redis
from rq import Queue
from rq.registry import FailedJobRegistry
import sys

try:
    redis_conn = Redis(host="localhost", port=6379, db=0)
    queue = Queue("resumes", connection=redis_conn)
    failed = FailedJobRegistry(queue=queue)
    
    job_ids = failed.get_job_ids()
    if job_ids:
        # Get the very last failure
        job_id = job_ids[-1]
        job = queue.fetch_job(job_id)
        if job:
            print(f"ERROR FOR JOB {job_id}:")
            print(job.exc_info)

except Exception as e:
    print(f"Error: {e}")

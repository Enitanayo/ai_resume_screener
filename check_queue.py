from redis import Redis
from rq import Queue
import sys

try:
    redis_conn = Redis(host="localhost", port=6379, db=0)
    queue = Queue("resumes", connection=redis_conn)
    print(f"Jobs in queue 'resumes': {len(queue.jobs)}")
    
    # Check for failed jobs too
    from rq.registry import FailedJobRegistry
    failed = FailedJobRegistry(queue=queue)
    print(f"Failed jobs: {len(failed)}")
    
    # Check for started jobs
    from rq.registry import StartedJobRegistry
    started = StartedJobRegistry(queue=queue)
    print(f"Started/Processing jobs: {len(started)}")

except Exception as e:
    print(f"Error connecting to Redis: {e}")

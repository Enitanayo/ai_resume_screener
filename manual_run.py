import redis
from rq import Queue
from backend.worker import process_application

r = redis.Redis(host="localhost", port=6379, db=0)
q = Queue("resumes", connection=r)

jobs = q.get_jobs()
if jobs:
    job = jobs[0]
    print(f"Working on job {job.id} | Function: {job.func_name} | Args: {job.args}")
    try:
        process_application(*job.args)
        print("Success!")
        job.delete() # Remove it so we don't pick it up again
    except Exception as e:
        print(f"Failed with error: {e}")
        import traceback
        traceback.print_exc()
else:
    print("No jobs in queue.")

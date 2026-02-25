"""
Windows-compatible RQ worker startup script.
Run from the project root: python run_worker.py
"""
from rq_win import WindowsWorker
from rq import Queue
from redis import Redis

redis_conn = Redis(host="localhost", port=6379, db=0)
queue = Queue("resumes", connection=redis_conn)

worker = WindowsWorker([queue], connection=redis_conn)
worker.work()


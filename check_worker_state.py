import redis
from rq import Worker, Queue

r = redis.from_url("redis://localhost:6379/0")
workers = Worker.all(connection=r)
queues = Queue.all(connection=r)

print(f"Workers: {len(workers)}")
for w in workers:
    print(f"Worker {w.name} | Queues: {w.queue_names()} | State: {w.get_state()}")

print(f"\nQueues: {len(queues)}")
for q in queues:
    print(f"Queue {q.name} | Jobs: {q.count}")

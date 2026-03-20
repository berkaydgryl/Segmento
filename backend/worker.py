import sys
import multiprocessing
import os

# Windows compatibility monkey-patch for RQ
if sys.platform == 'win32':
    _get_context = multiprocessing.get_context
    def patched_get_context(method=None):
        if method == 'fork':
            return _get_context('spawn')
        return _get_context(method)
    multiprocessing.get_context = patched_get_context

from redis import Redis
from rq import SimpleWorker, Queue

listen = ['default']
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_conn = Redis.from_url(REDIS_URL)

if __name__ == '__main__':
    # Pass connection directly to Queue and Worker
    q = Queue('default', connection=redis_conn)
    worker = SimpleWorker([q], connection=redis_conn)
    worker.work()

import sys
import multiprocessing

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
redis_conn = Redis(host='localhost', port=6379)

if __name__ == '__main__':
    # Pass connection directly to Queue and Worker
    q = Queue('default', connection=redis_conn)
    worker = SimpleWorker([q], connection=redis_conn)
    worker.work()

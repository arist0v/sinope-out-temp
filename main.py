import sys
from os import path
import functools
import signal
import time
from pkg.sinopeApiHandler import SinopeAPIHandler

sys.path.append(path.join(path.dirname(path.abspath(__file__)), 'lib'))

_HANDLER = None

print = functools.partial(print, flush=True)

def cleanup(signum, frame):
    if _HANDLER is not None:
        _HANDLER.close_proxy()
    sys.exit(0)

if __name__ == '__main__':
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)
    _HANDLER = SinopeAPIHandler(verbose=True)

    while _HANDLER.proxy_running():
        time.sleep(2)
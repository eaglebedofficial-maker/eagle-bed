"""Redis cache + rate limiting with an in-process fallback when Redis is unavailable."""
import json
import threading
import time

import redis

from .config import get_settings

_client = None
_mem: dict[str, tuple[float, str]] = {}
_lock = threading.Lock()


def client():
    global _client
    if _client is None:
        try:
            c = redis.Redis.from_url(get_settings().redis_url, decode_responses=True, socket_timeout=1, socket_connect_timeout=1)
            c.ping()
            _client = c
        except Exception:
            _client = False
    return _client or None


def get_json(key: str):
    c = client()
    if c:
        try:
            v = c.get(key)
            return json.loads(v) if v else None
        except Exception:
            return None
    with _lock:
        item = _mem.get(key)
        if item and item[0] > time.time():
            return json.loads(item[1])
    return None


def set_json(key: str, value, ttl: int):
    raw = json.dumps(value, default=str)
    c = client()
    if c:
        try:
            c.setex(key, ttl, raw)
            return
        except Exception:
            pass
    with _lock:
        _mem[key] = (time.time() + ttl, raw)


def hit(key: str, limit: int, window: int) -> bool:
    """Fixed-window counter. Returns True if allowed."""
    bucket = f"rl:{key}:{int(time.time() // window)}"
    c = client()
    if c:
        try:
            n = c.incr(bucket)
            if n == 1:
                c.expire(bucket, window + 1)
            return n <= limit
        except Exception:
            return True
    with _lock:
        exp, raw = _mem.get(bucket, (time.time() + window, "0"))
        n = int(raw) + 1
        _mem[bucket] = (exp, str(n))
        return n <= limit

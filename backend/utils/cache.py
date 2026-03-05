from __future__ import annotations

import threading
import time
from typing import Any


class TTLCache:
    def __init__(self, ttl_seconds: int = 600) -> None:
        self.ttl_seconds = ttl_seconds
        self._store: dict[str, tuple[float, Any]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Any:
        now = time.time()
        with self._lock:
            item = self._store.get(key)
            if not item:
                return None
            expires_at, value = item
            if now >= expires_at:
                self._store.pop(key, None)
                return None
            return value

    def set(self, key: str, value: Any, ttl_seconds: int | None = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self.ttl_seconds
        expires_at = time.time() + max(ttl, 1)
        with self._lock:
            self._store[key] = (expires_at, value)

    def delete(self, key: str) -> None:
        with self._lock:
            self._store.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

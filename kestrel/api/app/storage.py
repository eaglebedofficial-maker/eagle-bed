"""Object storage: local disk by default (S3-compatible adapter can replace these two functions)."""
import os
import uuid

from .config import get_settings


def put(org_id: int, data: bytes, ext: str) -> str:
    key = f"org{org_id}/{uuid.uuid4().hex}{ext}"
    path = os.path.join(get_settings().storage_dir, key)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)
    return key


def get(key: str) -> bytes:
    with open(os.path.join(get_settings().storage_dir, key), "rb") as f:
        return f.read()


def delete(key: str):
    try:
        os.remove(os.path.join(get_settings().storage_dir, key))
    except FileNotFoundError:
        pass

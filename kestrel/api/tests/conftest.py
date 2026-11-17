import os
import warnings

warnings.filterwarnings("ignore")
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://postgres@localhost:5432/kestrel_test")
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("STORAGE_DIR", "/tmp/kestrel-test-storage")
os.environ.setdefault("RATE_LIMIT_PER_MINUTE", "100000")
os.environ.setdefault("AUTH_ATTEMPTS_PER_5MIN", "100000")

import pytest
from fastapi.testclient import TestClient

from app.config import get_settings

get_settings.cache_clear()
from app import db as dbm  # noqa: E402
from app.db import Base  # noqa: E402
import app.models  # noqa: E402,F401


@pytest.fixture(scope="session", autouse=True)
def database():
    eng = dbm.reset_engine(os.environ["DATABASE_URL"])
    Base.metadata.drop_all(eng)
    Base.metadata.create_all(eng)
    from app.seed import seed
    seed()
    yield eng


@pytest.fixture()
def db(database):
    s = dbm.SessionLocal()
    yield s
    s.close()


def _client():
    from app.main import app
    return TestClient(app)


@pytest.fixture()
def client():
    return _client()


_n = {"i": 0}


def register(c, org="Test Org"):
    _n["i"] += 1
    import uuid
    email = f"user{uuid.uuid4().hex[:10]}@example.com"
    r = c.post("/api/auth/register", json={"email": email, "password": "correct-horse-1", "name": "T", "organisation": org})
    assert r.status_code == 200, r.text
    return email, r.json()


@pytest.fixture()
def authed():
    c = _client()
    email, data = register(c)
    c.email = email
    c.org_id = data["active_org"]["id"]
    return c

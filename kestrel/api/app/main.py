import json
import logging
import sys
import time
import uuid

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import cache
from .config import get_settings
from .providers import ProviderError
from .routers import ROUTERS


class JsonFormatter(logging.Formatter):
    def format(self, r):
        d = {"ts": self.formatTime(r), "level": r.levelname, "logger": r.name, "msg": r.getMessage()}
        for k in ("request_id", "path", "status", "ms", "org_id"):
            if hasattr(r, k):
                d[k] = getattr(r, k)
        if r.exc_info:
            d["exc"] = self.formatException(r.exc_info)
        return json.dumps(d)


def setup_logging():
    h = logging.StreamHandler(sys.stdout)
    h.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers[:] = [h]
    root.setLevel(get_settings().log_level)


setup_logging()
log = logging.getLogger("kestrel")
settings = get_settings()
app = FastAPI(title=f"{settings.app_name} API", version="1.0.0", docs_url="/api/docs", openapi_url="/api/openapi.json")
app.add_middleware(CORSMiddleware, allow_origins=[settings.web_origin], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.middleware("http")
async def request_mw(request: Request, call_next):
    rid = request.headers.get("x-request-id") or uuid.uuid4().hex[:12]
    ip = (request.headers.get("x-forwarded-for") or (request.client.host if request.client else "")).split(",")[0].strip()
    if request.url.path.startswith("/api/") and not cache.hit(f"ip:{ip}", settings.rate_limit_per_minute, 60):
        return JSONResponse({"error": {"code": "rate_limited", "message": "Too many requests — slow down for a minute."}}, status_code=429)
    t0 = time.time()
    try:
        resp = await call_next(request)
    except Exception:
        log.exception("unhandled", extra={"request_id": rid, "path": request.url.path})
        resp = JSONResponse({"error": {"code": "server_error", "message": "Something went wrong on our side. The error has been logged.", "request_id": rid}}, status_code=500)
    resp.headers["x-request-id"] = rid
    resp.headers["x-content-type-options"] = "nosniff"
    resp.headers["referrer-policy"] = "strict-origin-when-cross-origin"
    log.info("request", extra={"request_id": rid, "path": request.url.path, "status": resp.status_code, "ms": int((time.time() - t0) * 1000)})
    return resp


@app.exception_handler(HTTPException)
async def http_exc(request: Request, exc: HTTPException):
    code = {400: "bad_request", 401: "unauthorised", 403: "forbidden", 404: "not_found", 409: "conflict", 422: "invalid", 429: "rate_limited"}.get(exc.status_code, "error")
    return JSONResponse({"error": {"code": code, "message": exc.detail}}, status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_exc(request: Request, exc: RequestValidationError):
    errs = [{"field": ".".join(str(x) for x in e["loc"][1:]), "message": e["msg"]} for e in exc.errors()]
    msg = "; ".join(f"{e['field']}: {e['message']}" for e in errs[:3])
    return JSONResponse({"error": {"code": "invalid", "message": msg or "Invalid input", "fields": errs}}, status_code=422)


@app.exception_handler(ProviderError)
async def provider_exc(request: Request, exc: ProviderError):
    status = {"not_configured": 424, "auth_failed": 424, "rate_limited": 429, "not_found": 404, "invalid_input": 400}.get(exc.code, 502)
    return JSONResponse({"error": {**exc.as_dict(), "kind": "provider"}}, status_code=status)


@app.get("/api/health")
def health():
    from sqlalchemy import text
    from .db import engine
    with engine().connect() as c:
        c.execute(text("select 1"))
    return {"ok": True, "redis": bool(cache.client()), "app": settings.app_name}


for r in ROUTERS:
    app.include_router(r, prefix="/api")

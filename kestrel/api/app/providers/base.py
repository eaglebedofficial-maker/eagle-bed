"""Provider framework: every external data source implements Provider.

A provider declares its configuration fields, capabilities, data classification and limits.
Calls go through `request()`, which applies caching, rate limiting, timeouts, error mapping and
usage accounting, and returns the payload plus a Provenance block.
"""
from __future__ import annotations

import hashlib
import json
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, ClassVar

import httpx

from .. import cache

CLASSIFICATIONS = ("official_api", "official_supplier", "public_registry", "licensed", "estimated", "ai", "user", "demo")


class ProviderError(Exception):
    def __init__(self, code: str, message: str, provider: str = "", retry_after: int | None = None):
        super().__init__(message)
        self.code = code  # not_configured | auth_failed | rate_limited | upstream | bad_response | timeout | not_found | invalid_input
        self.message = message
        self.provider = provider
        self.retry_after = retry_after

    def as_dict(self):
        return {"code": self.code, "message": self.message, "provider": self.provider, "retry_after": self.retry_after}


@dataclass
class Provenance:
    provider: str
    classification: str
    retrieved_at: str
    cached: bool = False
    period_from: str | None = None
    period_to: str | None = None
    note: str = ""

    def dict(self):
        return asdict(self)


@dataclass
class ConfigField:
    name: str
    label: str
    secret: bool = False
    required: bool = True
    help: str = ""
    placeholder: str = ""


@dataclass
class Result:
    data: Any
    provenance: Provenance
    usage: dict = field(default_factory=dict)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Provider:
    key: ClassVar[str] = ""
    name: ClassVar[str] = ""
    category: ClassVar[str] = ""  # amazon_data | keywords | registry | search | ai | finance | messaging
    description: ClassVar[str] = ""
    classification: ClassVar[str] = "official_api"
    docs_url: ClassVar[str] = ""
    signup_url: ClassVar[str] = ""
    cost: ClassVar[str] = ""
    capabilities: ClassVar[list[str]] = []
    fields: ClassVar[list[ConfigField]] = []
    requires_config: ClassVar[bool] = True
    rate_limit: ClassVar[tuple[int, int]] = (60, 60)  # calls, seconds
    timeout: ClassVar[float] = 30.0

    def __init__(self, config: dict | None = None, org_id: int | None = None, transport: httpx.BaseTransport | None = None):
        self.config = config or {}
        self.org_id = org_id
        self._transport = transport
        self.usage: dict = {}

    # ---------------------------------------------------------------- config
    def configured(self) -> bool:
        if not self.requires_config:
            return True
        return all(self.config.get(f.name) for f in self.fields if f.required)

    def ensure_configured(self):
        if not self.configured():
            missing = [f.label for f in self.fields if f.required and not self.config.get(f.name)]
            raise ProviderError("not_configured", f"{self.name} is not connected. Add {', '.join(missing)} in Settings → Integrations.", self.key)

    @classmethod
    def describe(cls) -> dict:
        return {"key": cls.key, "name": cls.name, "category": cls.category, "description": cls.description,
                "classification": cls.classification, "docs_url": cls.docs_url, "signup_url": cls.signup_url,
                "cost": cls.cost, "capabilities": cls.capabilities, "requires_config": cls.requires_config,
                "fields": [asdict(f) for f in cls.fields]}

    def health_check(self) -> dict:
        """Override with a cheap authenticated call."""
        self.ensure_configured()
        return {"ok": True}

    # ---------------------------------------------------------------- http
    def provenance(self, cached=False, **kw) -> Provenance:
        return Provenance(provider=self.key, classification=self.classification, retrieved_at=now_iso(), cached=cached, **kw)

    def _client(self) -> httpx.Client:
        return httpx.Client(timeout=self.timeout, transport=self._transport, headers={"user-agent": "Kestrel/1.0 (+data-integration)"})

    def request(self, method: str, url: str, *, params=None, json_body=None, data=None, headers=None, auth=None,
                cache_ttl: int = 0, cache_key_extra: str = "", expect_json: bool = True):
        """Returns (payload, cached: bool)."""
        ck = None
        if cache_ttl and method.upper() == "GET":
            raw = json.dumps([url, params, cache_key_extra, self.org_id], sort_keys=True, default=str)
            ck = f"pv:{self.key}:{hashlib.sha256(raw.encode()).hexdigest()}"
            hit = cache.get_json(ck)
            if hit is not None:
                return hit, True
        calls, window = self.rate_limit
        if not cache.hit(f"{self.key}:{self.org_id}", calls, window):
            raise ProviderError("rate_limited", f"{self.name} rate limit reached; try again shortly.", self.key, retry_after=window)
        t0 = time.time()
        try:
            with self._client() as c:
                r = c.request(method, url, params=params, json=json_body, data=data, headers=headers, auth=auth)
        except httpx.TimeoutException:
            raise ProviderError("timeout", f"{self.name} did not respond in time.", self.key)
        except httpx.HTTPError as e:
            raise ProviderError("upstream", f"Could not reach {self.name}: {e.__class__.__name__}", self.key)
        self.usage["calls"] = self.usage.get("calls", 0) + 1
        self.usage["ms"] = self.usage.get("ms", 0) + int((time.time() - t0) * 1000)
        if r.status_code in (401, 403):
            raise ProviderError("auth_failed", f"{self.name} rejected the credentials (HTTP {r.status_code}).", self.key)
        if r.status_code == 404:
            raise ProviderError("not_found", f"{self.name}: not found.", self.key)
        if r.status_code == 429:
            ra = r.headers.get("retry-after")
            raise ProviderError("rate_limited", f"{self.name} is rate limiting requests.", self.key, retry_after=int(ra) if ra and ra.isdigit() else 60)
        if r.status_code >= 400:
            raise ProviderError("upstream", f"{self.name} returned HTTP {r.status_code}: {r.text[:200]}", self.key)
        if not expect_json:
            return r.text, False
        try:
            payload = r.json()
        except ValueError:
            raise ProviderError("bad_response", f"{self.name} returned an unreadable response.", self.key)
        if ck:
            cache.set_json(ck, payload, cache_ttl)
        return payload, False

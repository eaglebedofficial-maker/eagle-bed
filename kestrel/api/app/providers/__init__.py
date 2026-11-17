from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Integration
from ..security import decrypt_json
from .ai import ClaudeProvider
from .amazon import AdsAPIProvider, PAAPIProvider, SPAPIProvider
from .base import Provider, ProviderError, Result
from .data import (BraveSearchProvider, CompaniesHouseProvider, DataForSEOProvider, FXProvider, HMRCVATProvider,
                   TradeTariffProvider, VIESProvider)
from .keepa import KeepaProvider

REGISTRY: dict[str, type[Provider]] = {p.key: p for p in [
    KeepaProvider, SPAPIProvider, PAAPIProvider, AdsAPIProvider, DataForSEOProvider, CompaniesHouseProvider,
    HMRCVATProvider, VIESProvider, TradeTariffProvider, FXProvider, BraveSearchProvider, ClaudeProvider,
]}

# Test hook: tests can inject an httpx transport per provider key.
TRANSPORTS: dict = {}


def get_provider(db: Session, org_id: int, key: str) -> Provider:
    cls = REGISTRY[key]
    integ = db.scalar(select(Integration).where(Integration.org_id == org_id, Integration.provider == key))
    cfg = decrypt_json(integ.config_encrypted) if integ else {}
    return cls(cfg, org_id=org_id, transport=TRANSPORTS.get(key))


def provider_status(db: Session, org_id: int, key: str) -> dict:
    p = get_provider(db, org_id, key)
    return {"key": key, "configured": p.configured()}

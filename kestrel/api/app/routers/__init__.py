import importlib

from . import auth, org

ROUTERS = [auth.router, org.router]

# Module routers are added as phases land; missing modules are skipped so the app always boots.
for _name in ["dashboard", "products", "history", "keywords", "listings", "suppliers", "invoices", "sourcing", "finance", "operations", "ai", "alerts", "reports"]:
    try:
        ROUTERS.append(importlib.import_module(f"{__name__}.{_name}").router)
    except ModuleNotFoundError as e:
        if e.name != f"{__name__}.{_name}":
            raise

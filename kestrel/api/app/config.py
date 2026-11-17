from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


_DEV_FERNET = "Wd3dV0B3Yq4ZJ3wS1F3nYwqfJt2iUqvQ9kXo2y8hFvQ="


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Kestrel"
    environment: str = "development"  # development | test | production
    database_url: str = "postgresql+psycopg://postgres@localhost:5432/kestrel"
    redis_url: str = "redis://localhost:6379/0"
    web_origin: str = "http://localhost:3000"

    jwt_secret: str = Field(default="dev-insecure-change-me-before-production-use", min_length=32)
    access_token_minutes: int = 15
    refresh_token_days: int = 30
    cookie_secure: bool = False
    # Fernet key (urlsafe base64, 32 bytes) for provider credentials at rest
    secret_encryption_key: str = _DEV_FERNET

    storage_dir: str = "./storage"
    max_upload_mb: int = 20

    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""

    # Platform-level fallbacks; organisations normally configure their own keys in Integrations.
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-opus-5-5"

    rate_limit_per_minute: int = 240
    auth_attempts_per_5min: int = 20
    demo_login_enabled: bool = True  # allows one-click sign-in to the clearly labelled demo workspace
    log_level: str = "INFO"

    @model_validator(mode="after")
    def _production_secrets(self):
        if self.environment == "production":
            if self.jwt_secret.startswith("dev-insecure") or self.secret_encryption_key == _DEV_FERNET:
                raise ValueError("Set JWT_SECRET and SECRET_ENCRYPTION_KEY before running in production (see .env.example).")
        return self

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()

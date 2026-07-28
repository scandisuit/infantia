"""Application configuration via environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Infantia configuration. All vars prefixed with INFANTIA_."""

    # Application
    app_name: str = "Infantia"
    app_version: str = "0.1.0"
    debug: bool = False
    port: int = 8001

    # Database
    database_url: str = "sqlite:///data/infantia.db"
    # For production: postgresql://infantia:changeme@db:5432/infantia

    # Security
    secret_key: str = "change-me-in-production-use-a-long-random-string"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    algorithm: str = "HS256"

    # CORS
    allowed_origins: str = "https://infantia.rsol.io,http://localhost:3000,http://127.0.0.1:3000"

    # Rate limiting
    redis_url: str = "redis://localhost:6379/1"
    rate_limit: str = "120/minute"

    # Encryption (for sensitive health data at rest)
    encryption_key: str = "change-me-32-bytes-key-for-aes256!!"

    model_config = {"env_prefix": "INFANTIA_"}


settings = Settings()
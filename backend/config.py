"""Configuration management for the Nigeria Music Analytics System (NMAS)."""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Server Configuration
    host: str = "127.0.0.1"
    port: int = 8000
    env: str = "development"
    debug: bool = True

    # Database Configuration
    database_url: str = "sqlite:///./data/engine.db"

    # Security
    secret_key: str = "dev-secret-key-change-in-production"
    jwt_secret_key: str = "dev-jwt-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # API Keys
    youtube_api_key: Optional[str] = None
    spotify_client_id: Optional[str] = None
    spotify_client_secret: Optional[str] = None
    gemini_api_key: Optional[str] = "AIzaSyBmFPthpIdrLptZCekTYyTNNscccF3tjCI"

    # CORS Configuration
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"

    # Rate Limiting
    rate_limit_per_minute: int = 60
    rate_limit_burst: int = 10

    # Logging
    log_level: str = "INFO"
    log_file: str = "logs/app.log"

    # External Services
    sentry_dsn: Optional[str] = None
    redis_url: Optional[str] = None

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.env.lower() == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.env.lower() == "development"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

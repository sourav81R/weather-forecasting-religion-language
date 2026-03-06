from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    secret_key: str
    database_path: str
    weather_timeout_seconds: int
    cache_ttl_seconds: int
    openweather_keys: tuple[str, ...]
    gemini_api_key: str
    gemini_model: str
    gemini_timeout_seconds: int
    smtp_host: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    smtp_from: str
    smtp_use_tls: bool


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    root_dir = Path(__file__).resolve().parent.parent
    default_keys = (
        "d7842c0b970d897c608c64e6b6cc0b8a",
        "48a90ac42caa09f90dcaeee4096b9e53",
    )

    key_list = [item.strip() for item in os.getenv("OPENWEATHER_API_KEYS", "").split(",") if item.strip()]
    single_key = os.getenv("OPENWEATHER_API_KEY", "").strip()
    if single_key:
        key_list.append(single_key)

    return Settings(
        secret_key=os.getenv("SECRET_KEY", "dev-weather-studio-secret"),
        database_path=os.getenv("DATABASE_PATH", str(root_dir / "weather_studio.db")),
        weather_timeout_seconds=int(os.getenv("WEATHER_TIMEOUT_SECONDS", "15")),
        cache_ttl_seconds=int(os.getenv("CACHE_TTL_SECONDS", "600")),
        openweather_keys=tuple(key_list) if key_list else default_keys,
        gemini_api_key=os.getenv("GEMINI_API_KEY", "AIzaSyD_98RIsX0diVgMQbKINK-zST4czaCodCI").strip(),
        gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip() or "gemini-2.5-flash",
        gemini_timeout_seconds=int(os.getenv("GEMINI_TIMEOUT_SECONDS", "30")),
        smtp_host=os.getenv("SMTP_HOST", ""),
        smtp_port=int(os.getenv("SMTP_PORT", "587")),
        smtp_username=os.getenv("SMTP_USERNAME", ""),
        smtp_password=os.getenv("SMTP_PASSWORD", ""),
        smtp_from=os.getenv("SMTP_FROM", os.getenv("SMTP_USERNAME", "")),
        smtp_use_tls=os.getenv("SMTP_USE_TLS", "true").lower() in {"1", "true", "yes"},
    )

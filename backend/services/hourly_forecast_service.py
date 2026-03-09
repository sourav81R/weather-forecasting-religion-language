from __future__ import annotations

import datetime as dt
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import requests

from backend.config import get_settings
from backend.utils.cache import TTLCache

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


class HourlyForecastService:
    """Fetch and cache the next 24 future hourly forecast points from Open-Meteo."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.cache = TTLCache(ttl_seconds=max(180, self.settings.cache_ttl_seconds // 2))

    def fetch_next_24_hours(self, latitude: float, longitude: float) -> dict[str, list[dict[str, Any]]]:
        safe_latitude = max(-90.0, min(90.0, float(latitude)))
        safe_longitude = ((float(longitude) + 180.0) % 360.0) - 180.0

        cache_key = f"hourly-forecast::{safe_latitude:.4f}:{safe_longitude:.4f}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        payload = self._get_json(
            OPEN_METEO_FORECAST_URL,
            {
                "latitude": safe_latitude,
                "longitude": safe_longitude,
                "hourly": "temperature_2m,precipitation_probability,wind_speed_10m,weather_code",
                "forecast_days": 2,
                "timezone": "auto",
            },
        )

        result = {"hours": self._normalize_next_24_hours(payload)}
        self.cache.set(cache_key, result)
        return result

    def _get_json(self, url: str, params: dict[str, Any]) -> dict[str, Any]:
        try:
            response = requests.get(url, params=params, timeout=self.settings.weather_timeout_seconds)
            response.raise_for_status()
            return response.json() if response.content else {}
        except requests.RequestException as exc:
            raise ValueError(f"Upstream API request failed: {exc}") from exc

    def _normalize_next_24_hours(self, payload: dict[str, Any]) -> list[dict[str, Any]]:
        hourly = payload.get("hourly") or {}
        times = hourly.get("time") or []
        temperatures = hourly.get("temperature_2m") or []
        rain_probabilities = hourly.get("precipitation_probability") or []
        wind_speeds = hourly.get("wind_speed_10m") or hourly.get("windspeed_10m") or []
        weather_codes = hourly.get("weather_code") or hourly.get("weathercode") or []

        count = min(len(times), len(temperatures), len(rain_probabilities), len(wind_speeds), len(weather_codes))
        if count == 0:
            raise ValueError("Upstream API request failed: missing hourly forecast data.")

        current_local_time = self._current_local_time(str(payload.get("timezone", "UTC")))
        hours: list[dict[str, Any]] = []
        for idx in range(count):
            parsed_time = self._parse_open_meteo_time(str(times[idx]))
            if parsed_time <= current_local_time:
                continue

            hours.append(
                {
                    "time": str(times[idx]),
                    "hour": parsed_time.strftime("%H"),
                    "temperature": round(float(temperatures[idx]), 1),
                    "rain_probability": int(round(float(rain_probabilities[idx] or 0))),
                    "wind_speed": round(float(wind_speeds[idx] or 0), 1),
                    "weather_code": int(weather_codes[idx]),
                }
            )
            if len(hours) >= 24:
                break

        if not hours:
            raise ValueError("Upstream API request failed: no future hourly forecast data available.")
        return hours

    @staticmethod
    def _parse_open_meteo_time(value: str) -> dt.datetime:
        text = str(value or "").strip()
        if not text:
            return dt.datetime.utcnow().replace(minute=0, second=0, microsecond=0)
        parsed = dt.datetime.fromisoformat(text.replace("Z", "+00:00"))
        if parsed.tzinfo is not None:
            return parsed.astimezone(dt.timezone.utc).replace(tzinfo=None)
        return parsed

    @staticmethod
    def _current_local_time(timezone_name: str) -> dt.datetime:
        try:
            timezone = ZoneInfo(timezone_name or "UTC")
        except ZoneInfoNotFoundError:
            timezone = dt.timezone.utc
        return dt.datetime.now(timezone).replace(tzinfo=None)


hourly_forecast_service = HourlyForecastService()

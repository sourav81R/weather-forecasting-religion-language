import datetime as dt
import os
from typing import Any

import requests
from flask import Flask, jsonify, render_template, request

API_URL = "https://api.openweathermap.org/data/2.5/weather"
REQUEST_TIMEOUT_SECONDS = 12

# Inbuilt API keys with failover sequence.
BUILTIN_API_KEYS = (
    "d7842c0b970d897c608c64e6b6cc0b8a",
    "48a90ac42caa09f90dcaeee4096b9e53",
)

LANGUAGE_PACKS = {
    "English": {"code": "en"},
    "Bengali": {"code": "bn"},
    "Hindi": {"code": "hi"},
    "Tamil": {"code": "ta"},
}

WEATHER_SYMBOLS = {
    "Thunderstorm": "⛈",
    "Drizzle": "🌦",
    "Rain": "🌧",
    "Snow": "🌨",
    "Mist": "🌫",
    "Smoke": "🌫",
    "Haze": "🌫",
    "Dust": "🌫",
    "Fog": "🌫",
    "Sand": "🌫",
    "Ash": "🌫",
    "Squall": "💨",
    "Tornado": "🌪",
    "Clear": "☀",
    "Clouds": "☁",
}


def create_app() -> Flask:
    app = Flask(__name__)

    @app.get("/")
    def index() -> str:
        return render_template("index.html")

    @app.get("/api/config")
    def api_config() -> Any:
        return jsonify(
            {
                "languages": list(LANGUAGE_PACKS.keys()),
                "defaultLanguage": "English",
                "defaultUnits": "metric",
                "hasBuiltInKeys": bool(BUILTIN_API_KEYS),
            }
        )

    @app.post("/api/weather")
    def api_weather() -> Any:
        payload = request.get_json(silent=True) or {}
        city = str(payload.get("city", "")).strip()
        language = str(payload.get("language", "English")).strip()
        units = str(payload.get("units", "metric")).strip()
        custom_key = str(payload.get("apiKey", "")).strip()

        if not city:
            return jsonify({"error": "City is required."}), 400
        if language not in LANGUAGE_PACKS:
            language = "English"
        if units not in ("metric", "imperial"):
            units = "metric"

        keys = _candidate_api_keys(custom_key)
        if not keys:
            return jsonify({"error": "No API keys configured."}), 500

        params_base = {
            "q": city,
            "units": units,
            "lang": LANGUAGE_PACKS[language]["code"],
        }
        attempts: list[str] = []

        for key, source in keys:
            params = dict(params_base)
            params["appid"] = key
            try:
                response = requests.get(API_URL, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
            except requests.RequestException as exc:
                attempts.append(str(exc))
                continue

            try:
                data = response.json() if response.content else {}
            except ValueError:
                data = {}
            if response.status_code == 200:
                return jsonify(_normalize_weather(data, units, source))

            message = data.get("message", "Unknown API error")
            if response.status_code == 404:
                return jsonify({"error": "City not found. Check spelling and try again."}), 404
            if response.status_code in (401, 429):
                attempts.append(message)
                continue
            return jsonify({"error": f"Weather API error: {message}"}), response.status_code

        details = f" Last attempt: {attempts[-1]}" if attempts else ""
        return jsonify({"error": f"All inbuilt API keys failed.{details}"}), 502

    return app


def _candidate_api_keys(custom_key: str) -> list[tuple[str, str]]:
    candidates: list[tuple[str, str]] = []
    if custom_key:
        candidates.append((custom_key, "custom"))

    env_key = os.getenv("OPENWEATHER_API_KEY", "").strip()
    if env_key:
        candidates.append((env_key, "env"))

    for index, key in enumerate(BUILTIN_API_KEYS, start=1):
        candidates.append((key, f"builtin_{index}"))

    unique: list[tuple[str, str]] = []
    seen = set()
    for key, source in candidates:
        if key and key not in seen:
            unique.append((key, source))
            seen.add(key)
    return unique


def _normalize_weather(data: dict[str, Any], units: str, source: str) -> dict[str, Any]:
    weather = (data.get("weather") or [{}])[0]
    main = data.get("main") or {}
    wind = data.get("wind") or {}
    sys_info = data.get("sys") or {}
    clouds = data.get("clouds") or {}
    timezone_offset = int(data.get("timezone", 0))

    city = data.get("name", "")
    country = sys_info.get("country", "")
    location = f"{city}, {country}" if country else city

    condition_main = weather.get("main", "")
    temp_unit = "°C" if units == "metric" else "°F"
    wind_unit = "m/s" if units == "metric" else "mph"

    return {
        "location": location,
        "temperature": main.get("temp"),
        "temperatureUnit": temp_unit,
        "description": weather.get("description", ""),
        "condition": condition_main,
        "symbol": WEATHER_SYMBOLS.get(condition_main, "🌤"),
        "feelsLike": main.get("feels_like"),
        "humidity": main.get("humidity"),
        "windSpeed": wind.get("speed"),
        "windUnit": wind_unit,
        "pressure": main.get("pressure"),
        "clouds": clouds.get("all"),
        "sunrise": _format_local_time(sys_info.get("sunrise"), timezone_offset),
        "sunset": _format_local_time(sys_info.get("sunset"), timezone_offset),
        "source": _source_label(source),
        "updatedAtUtc": dt.datetime.utcnow().isoformat(timespec="seconds") + "Z",
    }


def _source_label(source: str) -> str:
    if source == "custom":
        return "custom key"
    if source == "env":
        return "environment key"
    if source.startswith("builtin_"):
        key_num = source.split("_")[-1]
        return f"inbuilt key #{key_num}"
    return source


def _format_local_time(unix_ts: int | None, timezone_offset: int) -> str:
    if not unix_ts:
        return "--"
    local_timestamp = int(unix_ts) + int(timezone_offset)
    return dt.datetime.utcfromtimestamp(local_timestamp).strftime("%H:%M")

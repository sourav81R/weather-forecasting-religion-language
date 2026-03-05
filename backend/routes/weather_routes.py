from __future__ import annotations

from flask import Blueprint, jsonify, request

from backend.services.analytics_service import build_analytics
from backend.services.weather_service import LANGUAGE_CODES, weather_service

bp = Blueprint("weather_api", __name__, url_prefix="/api")


@bp.get("/config")
def config():
    return jsonify(
        {
            "languages": list(LANGUAGE_CODES.keys()),
            "defaultLanguage": "English",
            "defaultUnits": "metric",
            "hasBuiltInKeys": bool(weather_service.settings.openweather_keys),
            "sections": ["Dashboard", "Forecast", "Analytics", "Planner", "Alerts", "Maps", "Settings"],
        }
    )


@bp.post("/weather")
def weather_by_city():
    payload = request.get_json(silent=True) or {}
    city = str(payload.get("city", "")).strip()
    units = "imperial" if str(payload.get("units", "metric")) == "imperial" else "metric"
    language = str(payload.get("language", "English"))
    custom_key = str(payload.get("apiKey", "")).strip()

    if not city:
        return jsonify({"error": "City is required."}), 400

    try:
        data = weather_service.fetch_current_by_city(city=city, units=units, language=language, custom_key=custom_key)
        return jsonify(data)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


@bp.post("/weather/coords")
def weather_by_coords():
    payload = request.get_json(silent=True) or {}
    units = "imperial" if str(payload.get("units", "metric")) == "imperial" else "metric"
    language = str(payload.get("language", "English"))
    custom_key = str(payload.get("apiKey", "")).strip()

    try:
        latitude = float(payload.get("latitude"))
        longitude = float(payload.get("longitude"))
    except (TypeError, ValueError):
        return jsonify({"error": "Valid latitude and longitude are required."}), 400

    try:
        data = weather_service.fetch_current_by_coords(
            latitude=latitude,
            longitude=longitude,
            units=units,
            language=language,
            custom_key=custom_key,
        )
        return jsonify(data)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


@bp.get("/forecast")
def forecast():
    units = "imperial" if request.args.get("units") == "imperial" else "metric"
    days = int(request.args.get("days", "15"))

    try:
        latitude = float(request.args.get("latitude"))
        longitude = float(request.args.get("longitude"))
    except (TypeError, ValueError):
        return jsonify({"error": "Valid latitude and longitude are required."}), 400

    try:
        data = weather_service.fetch_forecast(latitude=latitude, longitude=longitude, units=units, days=days)
        return jsonify(data)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 502


@bp.get("/dashboard")
def dashboard():
    units = "imperial" if request.args.get("units") == "imperial" else "metric"
    language = request.args.get("language", "English")
    custom_key = request.args.get("apiKey", "")
    city = (request.args.get("city") or "").strip()

    try:
        if city:
            current = weather_service.fetch_current_by_city(city=city, units=units, language=language, custom_key=custom_key)
            latitude = float(current.get("latitude"))
            longitude = float(current.get("longitude"))
        else:
            latitude = float(request.args.get("latitude"))
            longitude = float(request.args.get("longitude"))
            current = weather_service.fetch_current_by_coords(
                latitude=latitude,
                longitude=longitude,
                units=units,
                language=language,
                custom_key=custom_key,
            )

        forecast_data = weather_service.fetch_forecast(latitude=latitude, longitude=longitude, units=units, days=15)
        analytics = build_analytics(forecast_data)
        return jsonify({"current": current, "forecast": forecast_data, "analytics": analytics})
    except (TypeError, ValueError) as exc:
        return jsonify({"error": str(exc)}), 400


@bp.get("/map/layers")
def map_layers():
    api_key = request.args.get("apiKey", "")
    return jsonify({"layers": weather_service.get_map_layers(api_key=api_key)})

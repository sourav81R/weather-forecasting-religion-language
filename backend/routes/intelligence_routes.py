from __future__ import annotations

import datetime as dt
from typing import Any

from flask import Blueprint, jsonify, request
from flask_login import current_user

from backend.models.user import get_user_settings, list_alert_rules
from backend.services.activity_service import activity_scores
from backend.services.agriculture_service import agriculture_advice
from backend.services.ai_service import generate_weather_summary
from backend.services.alert_service import evaluate_alerts
from backend.services.analytics_service import build_analytics
from backend.services.chatbot_service import chatbot_response
from backend.services.climate_service import climate_insights_from_archive
from backend.services.email_service import send_email_alert
from backend.services.travel_service import evaluate_travel_window
from backend.services.weather_service import weather_service

bp = Blueprint("intelligence_api", __name__, url_prefix="/api")


@bp.post("/insights")
def insights():
    payload = request.get_json(silent=True) or {}
    try:
        current, forecast = _weather_context(payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    today = (forecast.get("daily") or [{}])[0]
    summary = generate_weather_summary(
        {
            "temperatureC": current.get("tempC"),
            "humidity": current.get("humidity"),
            "windKmh": current.get("windKmh"),
            "rainProbability": today.get("rainProbability", 0),
            "uvIndex": today.get("uvIndex", 0),
            "condition": current.get("condition", ""),
        }
    )
    return jsonify({"summary": summary})


@bp.post("/analytics")
def analytics():
    payload = request.get_json(silent=True) or {}
    try:
        _, forecast = _weather_context(payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify(build_analytics(forecast))


@bp.post("/alerts/evaluate")
def alerts_evaluate():
    payload = request.get_json(silent=True) or {}
    try:
        current, forecast = _weather_context(payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    rules = payload.get("rules") if isinstance(payload.get("rules"), list) else None
    if rules is None and current_user.is_authenticated:
        rules = list_alert_rules(int(current_user.id))

    alerts = evaluate_alerts(current, forecast.get("daily") or [], rules)
    response: dict[str, Any] = {"alerts": alerts}

    should_email = bool(payload.get("sendEmail", False))
    if should_email and alerts:
        recipient = str(payload.get("email", "")).strip()
        if not recipient and current_user.is_authenticated:
            settings = get_user_settings(int(current_user.id))
            recipient = str(settings.get("notificationEmail", "")).strip()
        if recipient:
            body = "\n".join(f"- {item['message']}" for item in alerts)
            ok, detail = send_email_alert(recipient, "Regional Weather Studio Alert", body)
            response["email"] = {"sent": ok, "detail": detail, "recipient": recipient}
        else:
            response["email"] = {"sent": False, "detail": "No recipient email configured."}

    return jsonify(response)


@bp.post("/travel-planner")
def travel_planner():
    payload = request.get_json(silent=True) or {}
    destination = str(payload.get("destination", "")).strip()
    start_date = str(payload.get("startDate", "")).strip()
    end_date = str(payload.get("endDate", "")).strip()
    units = "imperial" if str(payload.get("units", "metric")) == "imperial" else "metric"

    if not destination or not start_date or not end_date:
        return jsonify({"error": "Destination, startDate, and endDate are required."}), 400

    try:
        geo = weather_service.geocode_city(destination)
        forecast = weather_service.fetch_forecast(geo["latitude"], geo["longitude"], units=units, days=16)
        result = evaluate_travel_window(destination, start_date, end_date, forecast.get("daily") or [])
        result["coordinates"] = {"latitude": geo["latitude"], "longitude": geo["longitude"]}
        return jsonify(result)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400


@bp.post("/agriculture-advisor")
def agriculture():
    payload = request.get_json(silent=True) or {}
    crop_type = str(payload.get("cropType", "rice")).strip() or "rice"

    try:
        current, forecast = _weather_context(payload)
        result = agriculture_advice(
            crop_type=crop_type,
            location=str(current.get("location", "Unknown")),
            forecast_daily=forecast.get("daily") or [],
        )
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


@bp.post("/activity-recommendations")
def activity():
    payload = request.get_json(silent=True) or {}
    try:
        current, forecast = _weather_context(payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    today = (forecast.get("daily") or [{}])[0]
    response = activity_scores(
        {
            "temperatureC": current.get("tempC"),
            "humidity": current.get("humidity"),
            "uvIndex": today.get("uvIndex", 0),
            "windKmh": current.get("windKmh"),
            "rainProbability": today.get("rainProbability", 0),
        }
    )
    return jsonify(response)


@bp.post("/chatbot")
def chatbot():
    payload = request.get_json(silent=True) or {}
    question = str(payload.get("question", "")).strip()

    try:
        current, forecast = _weather_context(payload)
        today = (forecast.get("daily") or [{}])[0]
        activity_payload = activity_scores(
            {
                "temperatureC": current.get("tempC"),
                "humidity": current.get("humidity"),
                "uvIndex": today.get("uvIndex", 0),
                "windKmh": current.get("windKmh"),
                "rainProbability": today.get("rainProbability", 0),
            }
        )
        answer = chatbot_response(question, current, forecast, activity_payload)
        return jsonify({"answer": answer})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


@bp.post("/climate-insights")
def climate_insights():
    payload = request.get_json(silent=True) or {}
    try:
        coords = _extract_coordinates(payload)
        latitude = float(coords["latitude"])
        longitude = float(coords["longitude"])
    except (TypeError, ValueError) as exc:
        return jsonify({"error": f"Invalid coordinates: {exc}"}), 400

    days = int(payload.get("days", 90))
    safe_days = max(30, min(days, 365))
    end_date = dt.date.today()
    start_date = end_date - dt.timedelta(days=safe_days)

    try:
        archive = weather_service.fetch_archive(
            latitude=latitude,
            longitude=longitude,
            start_date=start_date.isoformat(),
            end_date=end_date.isoformat(),
        )
        return jsonify(climate_insights_from_archive(archive))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 502


@bp.post("/platform-bundle")
def platform_bundle():
    payload = request.get_json(silent=True) or {}
    try:
        current, forecast = _weather_context(payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    today = (forecast.get("daily") or [{}])[0]
    activity_payload = activity_scores(
        {
            "temperatureC": current.get("tempC"),
            "humidity": current.get("humidity"),
            "uvIndex": today.get("uvIndex", 0),
            "windKmh": current.get("windKmh"),
            "rainProbability": today.get("rainProbability", 0),
        }
    )

    alerts = evaluate_alerts(current, forecast.get("daily") or [], list_alert_rules(int(current_user.id)) if current_user.is_authenticated else None)
    analytics = build_analytics(forecast)
    summary = generate_weather_summary(
        {
            "temperatureC": current.get("tempC"),
            "humidity": current.get("humidity"),
            "windKmh": current.get("windKmh"),
            "rainProbability": today.get("rainProbability", 0),
            "uvIndex": today.get("uvIndex", 0),
            "condition": current.get("condition", ""),
        }
    )

    return jsonify(
        {
            "current": current,
            "forecast": forecast,
            "analytics": analytics,
            "alerts": alerts,
            "activity": activity_payload,
            "aiSummary": summary,
        }
    )


def _extract_coordinates(payload: dict[str, Any]) -> dict[str, float]:
    if payload.get("latitude") is not None and payload.get("longitude") is not None:
        return {"latitude": float(payload["latitude"]), "longitude": float(payload["longitude"])}

    city = str(payload.get("city", "")).strip()
    if not city:
        raise ValueError("Provide city or coordinates.")
    geo = weather_service.geocode_city(city)
    return {"latitude": geo["latitude"], "longitude": geo["longitude"]}


def _weather_context(payload: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    units = "imperial" if str(payload.get("units", "metric")) == "imperial" else "metric"
    language = str(payload.get("language", "English"))
    custom_key = str(payload.get("apiKey", "")).strip()

    if payload.get("latitude") is not None and payload.get("longitude") is not None:
        latitude = float(payload.get("latitude"))
        longitude = float(payload.get("longitude"))
        current = weather_service.fetch_current_by_coords(
            latitude=latitude,
            longitude=longitude,
            units=units,
            language=language,
            custom_key=custom_key,
        )
    else:
        city = str(payload.get("city", "")).strip()
        if not city:
            raise ValueError("City or coordinates are required.")
        current = weather_service.fetch_current_by_city(city=city, units=units, language=language, custom_key=custom_key)

    latitude = float(current.get("latitude"))
    longitude = float(current.get("longitude"))
    forecast = weather_service.fetch_forecast(latitude=latitude, longitude=longitude, units=units, days=15)
    return current, forecast

from __future__ import annotations

from flask import Blueprint, jsonify, request

from backend.services.hourly_forecast_service import hourly_forecast_service

bp = Blueprint("hourly_api", __name__, url_prefix="/api")


@bp.post("/hourly-forecast")
def hourly_forecast():
    """Return the next 24 future forecast hours for a coordinate pair."""

    payload = request.get_json(silent=True) or {}
    try:
        latitude = float(payload.get("lat", payload.get("latitude")))
        longitude = float(payload.get("lon", payload.get("longitude")))
    except (TypeError, ValueError):
        return jsonify({"error": "Valid lat and lon are required."}), 400

    try:
        return jsonify(hourly_forecast_service.fetch_next_24_hours(latitude=latitude, longitude=longitude))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 502

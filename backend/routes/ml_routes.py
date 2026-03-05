from __future__ import annotations

from flask import Blueprint, jsonify, request

from backend.services.ml_prediction_service import ml_prediction_service

bp = Blueprint("ml_api", __name__, url_prefix="/api/ml")


@bp.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    city = str(payload.get("city", "")).strip()

    lat_raw = payload.get("lat", payload.get("latitude"))
    lon_raw = payload.get("lon", payload.get("longitude"))
    try:
        latitude = float(lat_raw)
        longitude = float(lon_raw)
    except (TypeError, ValueError):
        return jsonify({"error": "Valid lat and lon are required."}), 400

    try:
        result = ml_prediction_service.predict_weather(city=city, lat=latitude, lon=longitude)
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


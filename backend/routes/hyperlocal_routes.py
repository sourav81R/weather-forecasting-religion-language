from __future__ import annotations

from flask import Blueprint, jsonify, request

from backend.services.hyperlocal_prediction_service import hyperlocal_prediction_service

bp = Blueprint("hyperlocal_api", __name__, url_prefix="/api/hyperlocal")


@bp.post("/predict")
def predict_hyperlocal():
    payload = request.get_json(silent=True) or {}
    try:
        latitude = float(payload.get("lat", payload.get("latitude")))
        longitude = float(payload.get("lon", payload.get("longitude")))
    except (TypeError, ValueError):
        return jsonify({"error": "Valid lat and lon are required."}), 400

    sky_condition = str(payload.get("sky_condition", "clear_sky")).strip().lower() or "clear_sky"

    try:
        result = hyperlocal_prediction_service.predict(
            latitude=latitude,
            longitude=longitude,
            sky_condition=sky_condition,
        )
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Hyperlocal prediction failed: {exc}"}), 502

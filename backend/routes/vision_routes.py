from __future__ import annotations

from pathlib import Path

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from backend.services.sky_image_service import sky_image_service

bp = Blueprint("vision_api", __name__, url_prefix="/api/vision")


@bp.post("/sky-analysis")
def sky_analysis():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded. Provide multipart field 'image'."}), 400

    file = request.files["image"]
    if file.filename is None or not file.filename.strip():
        return jsonify({"error": "Invalid image filename."}), 400

    content_type = str(file.mimetype or "").lower()
    if not content_type.startswith("image/"):
        return jsonify({"error": "Uploaded file must be an image."}), 400

    lat_raw = request.form.get("lat", request.form.get("latitude"))
    lon_raw = request.form.get("lon", request.form.get("longitude"))
    latitude: float | None = None
    longitude: float | None = None
    if lat_raw is not None and lon_raw is not None:
        try:
            latitude = float(lat_raw)
            longitude = float(lon_raw)
        except (TypeError, ValueError):
            return jsonify({"error": "Latitude and longitude must be valid numbers."}), 400

    safe_name = secure_filename(file.filename)
    suffix = Path(safe_name).suffix or ".jpg"
    image_bytes = file.read()

    try:
        result = sky_image_service.predict_from_bytes(
            image_bytes=image_bytes,
            latitude=latitude,
            longitude=longitude,
            suffix=suffix,
        )
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except (FileNotFoundError, RuntimeError) as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception as exc:
        return jsonify({"error": f"Sky analysis failed: {exc}"}), 500

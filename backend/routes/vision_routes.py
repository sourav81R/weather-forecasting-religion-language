from __future__ import annotations

from pathlib import Path

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from backend.services.sky_image_service import sky_image_service

bp = Blueprint("vision_api", __name__, url_prefix="/api/vision")


@bp.post("/sky-analysis")
def sky_analysis():
    return _analyze_uploaded_image(input_source="upload")


@bp.post("/live-sky")
def live_sky():
    return _analyze_uploaded_image(input_source="live_camera")


def _analyze_uploaded_image(input_source: str):
    try:
        image_bytes, suffix = _extract_uploaded_image()
        latitude, longitude = _extract_optional_coordinates()
        result = sky_image_service.predict_from_bytes(
            image_bytes=image_bytes,
            latitude=latitude,
            longitude=longitude,
            suffix=suffix,
        )
        payload = dict(result)
        payload["input_source"] = input_source
        if "analysis_mode" not in payload:
            payload["analysis_mode"] = "cnn_live" if input_source == "live_camera" else "cnn_upload"
        return jsonify(payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except (FileNotFoundError, RuntimeError) as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception as exc:
        return jsonify({"error": f"Sky analysis failed: {exc}"}), 500


def _extract_uploaded_image() -> tuple[bytes, str]:
    if "image" not in request.files:
        raise ValueError("No image uploaded. Provide multipart field 'image'.")

    file = request.files["image"]
    if file.filename is None or not file.filename.strip():
        raise ValueError("Invalid image filename.")

    content_type = str(file.mimetype or "").lower()
    if not content_type.startswith("image/"):
        raise ValueError("Uploaded file must be an image.")

    safe_name = secure_filename(file.filename)
    suffix = Path(safe_name).suffix or ".jpg"
    image_bytes = file.read()
    if not image_bytes:
        raise ValueError("Uploaded image is empty.")
    return image_bytes, suffix


def _extract_optional_coordinates() -> tuple[float | None, float | None]:
    lat_raw = request.form.get("lat", request.form.get("latitude"))
    lon_raw = request.form.get("lon", request.form.get("longitude"))
    latitude: float | None = None
    longitude: float | None = None
    if lat_raw is not None and lon_raw is not None:
        try:
            latitude = float(lat_raw)
            longitude = float(lon_raw)
        except (TypeError, ValueError):
            raise ValueError("Latitude and longitude must be valid numbers.") from None
    return latitude, longitude

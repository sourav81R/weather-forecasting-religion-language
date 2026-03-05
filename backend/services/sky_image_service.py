from __future__ import annotations

import hashlib
from pathlib import Path
from tempfile import NamedTemporaryFile
from threading import Lock
from typing import Any

import numpy as np

from backend.services.weather_service import weather_service
from backend.utils.cache import TTLCache

try:
    import cv2
except Exception:  # pragma: no cover - optional dependency at runtime
    cv2 = None

try:
    import tensorflow as tf
except Exception:  # pragma: no cover - optional dependency at runtime
    tf = None

SKY_CLASSES = ["clear_sky", "rain_clouds", "storm_clouds", "overcast"]


class SkyImageService:
    """
    Sky image weather recognition service.

    Responsibilities:
    - load trained CNN model once
    - preprocess uploaded sky images
    - predict sky class and risk signals
    """

    def __init__(self) -> None:
        model_dir = Path(__file__).resolve().parent.parent / "models"
        self.model_path = model_dir / "sky_classifier.h5"
        self._model: Any = None
        self._model_lock = Lock()
        self.cache = TTLCache(ttl_seconds=3600)

    def predict_sky_weather(
        self,
        image_path: str,
        latitude: float | None = None,
        longitude: float | None = None,
    ) -> dict[str, Any]:
        """Predict sky condition and weather risks from a sky image."""
        image_file = Path(image_path)
        if not image_file.exists():
            raise ValueError("Uploaded image could not be found on disk.")

        raw_bytes = image_file.read_bytes()
        if not raw_bytes:
            raise ValueError("Uploaded image is empty.")

        cache_key = self._cache_key(raw_bytes, latitude, longitude)
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        model = self._load_model()
        image_tensor = self._preprocess_image(image_path)
        probs = model.predict(image_tensor, verbose=0)
        if probs is None or len(probs) == 0:
            raise ValueError("Unable to generate prediction from sky image.")

        result = self._interpret_probabilities(np.asarray(probs[0], dtype=np.float32))

        if latitude is not None and longitude is not None:
            try:
                result = self._blend_with_forecast(result, latitude=latitude, longitude=longitude)
            except Exception:
                # Keep image-only prediction when forecast blending is unavailable.
                pass

        self.cache.set(cache_key, result, ttl_seconds=3600)
        return result

    def predict_from_bytes(
        self,
        image_bytes: bytes,
        latitude: float | None = None,
        longitude: float | None = None,
        suffix: str = ".jpg",
    ) -> dict[str, Any]:
        """Utility path used by routes: stores bytes in a temp file and predicts."""
        if not image_bytes:
            raise ValueError("No image content received.")
        with NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(image_bytes)
            temp_path = tmp.name
        try:
            return self.predict_sky_weather(temp_path, latitude=latitude, longitude=longitude)
        finally:
            Path(temp_path).unlink(missing_ok=True)

    def _load_model(self) -> Any:
        if self._model is not None:
            return self._model
        with self._model_lock:
            if self._model is not None:
                return self._model
            if tf is None:
                raise RuntimeError("TensorFlow dependency is unavailable. Install tensorflow to enable sky recognition.")
            if not self.model_path.exists():
                raise FileNotFoundError("Sky classifier model is unavailable. Train it with backend/train_sky_model.py.")
            self._model = tf.keras.models.load_model(self.model_path)
            return self._model

    @staticmethod
    def _preprocess_image(image_path: str) -> np.ndarray:
        """
        Image preprocessing:
        1) resize to 224x224
        2) normalize pixels to [0, 1]
        3) convert to RGB
        4) convert to numpy batch
        """
        if cv2 is None:
            raise RuntimeError("OpenCV dependency is unavailable. Install opencv-python-headless.")

        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Invalid image file. Please upload a valid sky photo.")

        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        resized = cv2.resize(rgb, (224, 224), interpolation=cv2.INTER_AREA)
        normalized = resized.astype("float32") / 255.0
        batch = np.expand_dims(normalized, axis=0)
        return batch

    @staticmethod
    def _interpret_probabilities(probabilities: np.ndarray) -> dict[str, Any]:
        if probabilities.size < len(SKY_CLASSES):
            raise ValueError("Model output has invalid class probabilities.")

        probs = probabilities[: len(SKY_CLASSES)]
        probs = probs / np.sum(probs) if np.sum(probs) > 0 else np.array([1.0, 0.0, 0.0, 0.0], dtype=np.float32)
        clear, rain, storm, overcast = [float(x) for x in probs]

        rain_probability = min(1.0, rain + (0.9 * storm) + (0.45 * overcast))
        storm_risk = min(1.0, storm + (0.25 * rain))
        cloud_density = min(1.0, (0.15 * clear) + (0.7 * rain) + (0.9 * storm) + (0.85 * overcast))

        label_index = int(np.argmax(probs))
        return {
            "sky_condition": SKY_CLASSES[label_index],
            "rain_probability": round(rain_probability, 2),
            "storm_risk": round(storm_risk, 2),
            "cloud_density": round(cloud_density, 2),
            "confidence": round(float(np.max(probs)), 2),
        }

    @staticmethod
    def _cache_key(raw_bytes: bytes, latitude: float | None, longitude: float | None) -> str:
        digest = hashlib.sha256(raw_bytes).hexdigest()
        lat = "" if latitude is None else f"{latitude:.4f}"
        lon = "" if longitude is None else f"{longitude:.4f}"
        return f"sky::{digest}::{lat}:{lon}"

    def _blend_with_forecast(self, result: dict[str, Any], latitude: float, longitude: float) -> dict[str, Any]:
        """
        Optional enhancement:
        blend image-derived rain probability with forecast rain probability.
        """
        forecast = weather_service.fetch_forecast(latitude=latitude, longitude=longitude, units="metric", days=2)
        daily = forecast.get("daily") or []
        tomorrow = daily[1] if len(daily) > 1 else (daily[0] if daily else {})
        forecast_rain_probability = float(tomorrow.get("rainProbability", 0) or 0) / 100.0

        blended = dict(result)
        image_rain = float(result.get("rain_probability", 0) or 0)
        blended["rain_probability"] = round((0.7 * image_rain) + (0.3 * forecast_rain_probability), 2)
        blended["forecast_rain_probability"] = round(forecast_rain_probability, 2)
        return blended


sky_image_service = SkyImageService()

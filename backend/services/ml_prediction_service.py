from __future__ import annotations

import datetime as dt
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import requests
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from backend.config import get_settings
from backend.services.weather_service import OPEN_METEO_ARCHIVE_URL, weather_service
from backend.utils.cache import TTLCache

FEATURE_COLUMNS = [
    "day_of_year",
    "month",
    "temperature_lag1",
    "temperature_lag2",
    "humidity_lag1",
    "wind_lag1",
]


class MLPredictionService:
    """End-to-end weather ML pipeline: archive ingest, training, and inference."""

    def __init__(self) -> None:
        settings = get_settings()
        self.timeout_seconds = settings.weather_timeout_seconds
        self.prediction_cache = TTLCache(ttl_seconds=3600)

        project_root = Path(__file__).resolve().parents[2]
        self.model_dir = project_root / "models"
        self.temperature_model_path = self.model_dir / "weather_temperature_model.pkl"
        self.rain_model_path = self.model_dir / "weather_rain_model.pkl"

    def download_historical_weather(
        self,
        latitude: float,
        longitude: float,
        start_date: str,
        end_date: str,
    ) -> pd.DataFrame:
        """Download and normalize Open-Meteo archive data into daily features."""
        payload = self._fetch_archive_payload(latitude=latitude, longitude=longitude, start_date=start_date, end_date=end_date)
        hourly = payload.get("hourly") or {}
        timestamps = list(hourly.get("time") or [])
        row_count = len(timestamps)

        def aligned(values: Any) -> list[Any]:
            if values is None:
                return [np.nan] * row_count
            seq = list(values)
            if len(seq) < row_count:
                seq.extend([np.nan] * (row_count - len(seq)))
            return seq[:row_count]

        pressure_series = hourly.get("surface_pressure")
        if pressure_series is None:
            pressure_series = hourly.get("pressure_msl")

        raw = pd.DataFrame(
            {
                "timestamp": pd.to_datetime(aligned(timestamps), errors="coerce"),
                "temperature": pd.to_numeric(aligned(hourly.get("temperature_2m")), errors="coerce"),
                "humidity": pd.to_numeric(aligned(hourly.get("relative_humidity_2m")), errors="coerce"),
                "wind": pd.to_numeric(aligned(hourly.get("wind_speed_10m")), errors="coerce"),
                "pressure": pd.to_numeric(aligned(pressure_series), errors="coerce"),
                "precipitation": pd.to_numeric(aligned(hourly.get("precipitation")), errors="coerce"),
            }
        )
        raw = raw.dropna(subset=["timestamp"])
        if raw.empty:
            raise ValueError("Historical weather archive is empty for the selected range.")

        raw["date"] = raw["timestamp"].dt.date
        daily = (
            raw.groupby("date", as_index=False)
            .agg(
                temperature=("temperature", "mean"),
                humidity=("humidity", "mean"),
                wind=("wind", "mean"),
                pressure=("pressure", "mean"),
                rain_amount=("precipitation", "sum"),
            )
            .sort_values("date")
        )
        daily["rain"] = (daily["rain_amount"] > 0.1).astype(int)
        dataset = daily[["date", "temperature", "humidity", "wind", "pressure", "rain"]].copy()
        return dataset.dropna().reset_index(drop=True)

    def train_models_for_location(
        self,
        latitude: float,
        longitude: float,
        lookback_days: int = 540,
    ) -> dict[str, float]:
        """Train temperature and rain models, then persist them to disk."""
        end_date = dt.date.today() - dt.timedelta(days=1)
        start_date = end_date - dt.timedelta(days=max(lookback_days, 120))
        dataset = self.download_historical_weather(
            latitude=latitude,
            longitude=longitude,
            start_date=start_date.isoformat(),
            end_date=end_date.isoformat(),
        )
        feature_frame = self._build_feature_frame(dataset)
        training_frame = feature_frame.copy()
        training_frame["temperature_target"] = training_frame["temperature"].shift(-1)
        training_frame["rain_target"] = training_frame["rain"].shift(-1)
        training_frame = training_frame.dropna(subset=FEATURE_COLUMNS + ["temperature_target", "rain_target"])

        if len(training_frame) < 30:
            raise ValueError("Not enough historical data to train ML models.")

        x = training_frame[FEATURE_COLUMNS]
        y_temperature = training_frame["temperature_target"].astype(float)
        y_rain = training_frame["rain_target"].astype(int)

        if y_rain.nunique() < 2:
            raise ValueError("Training data does not contain enough rain/no-rain variation.")

        x_train_t, x_test_t, y_train_t, y_test_t = train_test_split(x, y_temperature, test_size=0.2, random_state=42)
        x_train_r, x_test_r, y_train_r, y_test_r = train_test_split(
            x,
            y_rain,
            test_size=0.2,
            random_state=42,
            stratify=y_rain if y_rain.nunique() > 1 else None,
        )

        temperature_model = Pipeline(
            [
                ("scaler", StandardScaler()),
                ("model", RandomForestRegressor(n_estimators=250, random_state=42)),
            ]
        )
        rain_model = Pipeline(
            [
                ("scaler", StandardScaler()),
                ("model", LogisticRegression(max_iter=1000, class_weight="balanced")),
            ]
        )

        temperature_model.fit(x_train_t, y_train_t)
        rain_model.fit(x_train_r, y_train_r)

        temp_pred = temperature_model.predict(x_test_t)
        rain_pred = rain_model.predict(x_test_r)

        metrics = {
            "mae": float(mean_absolute_error(y_test_t, temp_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_test_t, temp_pred))),
            "accuracy": float(accuracy_score(y_test_r, rain_pred)),
        }
        self._save_models(temperature_model=temperature_model, rain_model=rain_model, metrics=metrics)
        return metrics

    def predict_weather(self, city: str, lat: float, lon: float) -> dict[str, Any]:
        """
        Predict next-day weather using trained models.

        Falls back to API forecast if trained models are unavailable.
        """
        cache_key = f"ml::{lat:.4f}:{lon:.4f}:{city.strip().lower()}"
        cached = self.prediction_cache.get(cache_key)
        if cached is not None:
            return cached

        try:
            temperature_bundle, rain_bundle = self._load_models()
            today = dt.date.today()
            dataset = self.download_historical_weather(
                latitude=lat,
                longitude=lon,
                start_date=(today - dt.timedelta(days=180)).isoformat(),
                end_date=(today - dt.timedelta(days=1)).isoformat(),
            )

            prediction_row = self._build_prediction_row(dataset)
            x_pred = prediction_row[FEATURE_COLUMNS].to_frame().T
            temperature_prediction = float(temperature_bundle["model"].predict(x_pred)[0])

            rain_pipeline = rain_bundle["model"]
            if hasattr(rain_pipeline, "predict_proba"):
                rain_probability = float(rain_pipeline.predict_proba(x_pred)[0][1])
            else:
                rain_probability = float(rain_pipeline.predict(x_pred)[0])

            humidity_trend = self._humidity_trend(dataset)
            confidence_score = self._confidence_score(
                temperature_mae=float((temperature_bundle.get("metrics") or {}).get("mae", 3.0)),
                rain_accuracy=float((rain_bundle.get("metrics") or {}).get("accuracy", 0.6)),
                rain_probability=rain_probability,
            )

            result = {
                "temperature_prediction": round(temperature_prediction, 1),
                "rain_probability": round(min(max(rain_probability, 0.0), 1.0), 2),
                "humidity_trend": humidity_trend,
                "confidence_score": round(confidence_score, 2),
            }
        except Exception:
            try:
                result = self._forecast_fallback(lat=lat, lon=lon)
            except Exception:
                result = {
                    "temperature_prediction": 0.0,
                    "rain_probability": 0.0,
                    "humidity_trend": "stable",
                    "confidence_score": 0.0,
                }

        self.prediction_cache.set(cache_key, result, ttl_seconds=3600)
        return result

    def _fetch_archive_payload(self, latitude: float, longitude: float, start_date: str, end_date: str) -> dict[str, Any]:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date,
            "end_date": end_date,
            "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation",
            "timezone": "UTC",
        }
        try:
            response = requests.get(OPEN_METEO_ARCHIVE_URL, params=params, timeout=self.timeout_seconds)
            response.raise_for_status()
            return response.json() if response.content else {}
        except requests.RequestException:
            # Fallback pressure variable for regions/models that expose MSL pressure only.
            params["hourly"] = "temperature_2m,relative_humidity_2m,wind_speed_10m,pressure_msl,precipitation"
            response = requests.get(OPEN_METEO_ARCHIVE_URL, params=params, timeout=self.timeout_seconds)
            response.raise_for_status()
            return response.json() if response.content else {}

    @staticmethod
    def _build_feature_frame(dataset: pd.DataFrame) -> pd.DataFrame:
        frame = dataset.copy()
        frame["date"] = pd.to_datetime(frame["date"], errors="coerce")
        frame = frame.dropna(subset=["date"]).sort_values("date").reset_index(drop=True)

        frame["day_of_year"] = frame["date"].dt.dayofyear
        frame["month"] = frame["date"].dt.month
        frame["temperature_lag1"] = frame["temperature"].shift(1)
        frame["temperature_lag2"] = frame["temperature"].shift(2)
        frame["humidity_lag1"] = frame["humidity"].shift(1)
        frame["wind_lag1"] = frame["wind"].shift(1)
        return frame

    def _build_prediction_row(self, dataset: pd.DataFrame) -> pd.Series:
        frame = self._build_feature_frame(dataset)
        usable = frame.dropna(subset=FEATURE_COLUMNS).copy()
        if usable.empty:
            raise ValueError("Not enough feature history to compute prediction row.")

        latest = usable.iloc[-1].copy()
        tomorrow = pd.Timestamp(latest["date"]) + pd.Timedelta(days=1)
        latest["day_of_year"] = int(tomorrow.dayofyear)
        latest["month"] = int(tomorrow.month)
        return latest

    def _save_models(self, temperature_model: Pipeline, rain_model: Pipeline, metrics: dict[str, float]) -> None:
        self.model_dir.mkdir(parents=True, exist_ok=True)
        metadata = {"features": FEATURE_COLUMNS, "metrics": metrics, "trained_at_utc": dt.datetime.utcnow().isoformat()}
        joblib.dump({"model": temperature_model, **metadata}, self.temperature_model_path)
        joblib.dump({"model": rain_model, **metadata}, self.rain_model_path)

    def _load_models(self) -> tuple[dict[str, Any], dict[str, Any]]:
        if not self.temperature_model_path.exists() or not self.rain_model_path.exists():
            raise FileNotFoundError("Trained ML weather models are not available.")
        return joblib.load(self.temperature_model_path), joblib.load(self.rain_model_path)

    @staticmethod
    def _humidity_trend(dataset: pd.DataFrame) -> str:
        humidity = dataset["humidity"].dropna().to_numpy()
        if len(humidity) < 6:
            return "stable"
        recent = float(np.mean(humidity[-3:]))
        previous = float(np.mean(humidity[-6:-3]))
        delta = recent - previous
        if delta > 2.0:
            return "increasing"
        if delta < -2.0:
            return "decreasing"
        return "stable"

    @staticmethod
    def _confidence_score(temperature_mae: float, rain_accuracy: float, rain_probability: float) -> float:
        temp_conf = max(0.0, min(1.0, 1 - (temperature_mae / 10)))
        rain_conf = max(0.0, min(1.0, abs(rain_probability - 0.5) * 2))
        score = (0.4 * rain_accuracy) + (0.35 * temp_conf) + (0.25 * rain_conf)
        return max(0.0, min(1.0, score))

    def _forecast_fallback(self, lat: float, lon: float) -> dict[str, Any]:
        """Fallback path used when model files are missing/unusable."""
        forecast = weather_service.fetch_forecast(latitude=lat, longitude=lon, units="metric", days=3)
        daily = forecast.get("daily") or []
        hourly = forecast.get("hourly") or []
        tomorrow = daily[1] if len(daily) > 1 else (daily[0] if daily else {})

        min_temp = float(tomorrow.get("minTemp", 0) or 0)
        max_temp = float(tomorrow.get("maxTemp", 0) or 0)
        temp_prediction = (min_temp + max_temp) / 2 if tomorrow else 0.0
        rain_probability = float(tomorrow.get("rainProbability", 0) or 0) / 100.0

        humidity_next = [float(item.get("humidity", 0) or 0) for item in hourly[:24]]
        humidity_after = [float(item.get("humidity", 0) or 0) for item in hourly[24:48]]
        if humidity_next and humidity_after:
            humidity_trend = "increasing" if np.mean(humidity_after) > np.mean(humidity_next) else "decreasing"
        else:
            humidity_trend = "stable"

        return {
            "temperature_prediction": round(temp_prediction, 1),
            "rain_probability": round(min(max(rain_probability, 0.0), 1.0), 2),
            "humidity_trend": humidity_trend,
            "confidence_score": 0.55,
        }


ml_prediction_service = MLPredictionService()

from __future__ import annotations

import datetime as dt
from statistics import mean
from typing import Any

import requests

from backend.services.ml_prediction_service import ml_prediction_service
from backend.services.weather_service import weather_service
from backend.utils.cache import TTLCache

OPENWEATHER_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"

WEIGHT_API = 0.4
WEIGHT_ML = 0.3
WEIGHT_SKY = 0.2
WEIGHT_SATELLITE = 0.1

SKY_RAIN_PROBABILITY = {
    "clear_sky": 0.05,
    "overcast": 0.40,
    "rain_clouds": 0.65,
    "storm_clouds": 0.85,
}

SKY_STORM_FACTOR = {
    "clear_sky": 0.05,
    "overcast": 0.30,
    "rain_clouds": 0.62,
    "storm_clouds": 0.92,
}


class HyperlocalPredictionService:
    """
    Hyperlocal fusion engine.

    Model overview:
    - Data fusion uses weighted averaging across API, ML, sky vision, and satellite signals.
    - Sky classes are mapped to rain probabilities before fusion.
    - Confidence blends source agreement, data freshness, and model confidence.
    """

    def __init__(self) -> None:
        self.cache = TTLCache(ttl_seconds=600)
        self.timeout_seconds = weather_service.settings.weather_timeout_seconds

    def predict(self, latitude: float, longitude: float, sky_condition: str = "clear_sky") -> dict[str, Any]:
        safe_lat = max(-90.0, min(90.0, float(latitude)))
        safe_lon = ((float(longitude) + 180.0) % 360.0) - 180.0
        normalized_sky = self._normalize_sky_condition(sky_condition)

        cache_key = f"hyperlocal::{safe_lat:.4f}:{safe_lon:.4f}:{normalized_sky}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        api_signals = self._api_signals(safe_lat, safe_lon)
        ml_signals = self._ml_signals(safe_lat, safe_lon)
        satellite_signals = self._satellite_signals(safe_lat, safe_lon)

        sky_rain_estimate = SKY_RAIN_PROBABILITY.get(normalized_sky, 0.05)
        satellite_rain_probability = self._satellite_rain_probability(
            satellite_signals.get("satellite_rain_intensity"),
            satellite_signals.get("satellite_wind_speed"),
        )

        try:
            final_temperature = self._weighted_average(
                [(api_signals.get("api_temperature"), WEIGHT_API), (ml_signals.get("ml_temperature_prediction"), WEIGHT_ML)]
            )
        except ValueError:
            fallback_temp = satellite_signals.get("satellite_temperature")
            final_temperature = float(fallback_temp) if fallback_temp is not None else 0.0
        final_rain_probability = self._weighted_average(
            [
                (api_signals.get("api_rain_probability"), WEIGHT_API),
                (ml_signals.get("ml_rain_probability"), WEIGHT_ML),
                (sky_rain_estimate, WEIGHT_SKY),
                (satellite_rain_probability, WEIGHT_SATELLITE),
            ]
        )

        storm_risk = self._storm_risk(
            rain_probability=final_rain_probability,
            satellite_wind_speed=satellite_signals.get("satellite_wind_speed"),
            sky_condition=normalized_sky,
        )

        confidence_score = self._confidence_score(
            api_temp=api_signals.get("api_temperature"),
            ml_temp=ml_signals.get("ml_temperature_prediction"),
            api_rain=api_signals.get("api_rain_probability"),
            ml_rain=ml_signals.get("ml_rain_probability"),
            sky_rain=sky_rain_estimate,
            satellite_rain=satellite_rain_probability,
            api_timestamp=api_signals.get("timestamp_utc"),
            satellite_timestamp=satellite_signals.get("timestamp_utc"),
            ml_confidence=ml_signals.get("ml_confidence"),
            sky_condition=normalized_sky,
        )

        response = {
            "temperature_prediction": round(float(final_temperature), 1),
            "rain_probability": round(float(final_rain_probability), 2),
            "storm_risk": round(float(storm_risk), 2),
            "confidence_score": round(float(confidence_score), 2),
            "sources_used": self._sources_used(
                api_temperature=api_signals.get("api_temperature"),
                api_rain_probability=api_signals.get("api_rain_probability"),
                ml_temperature_prediction=ml_signals.get("ml_temperature_prediction"),
                ml_rain_probability=ml_signals.get("ml_rain_probability"),
                sky_rain_estimate=sky_rain_estimate,
                satellite_wind_speed=satellite_signals.get("satellite_wind_speed"),
                satellite_rain_intensity=satellite_signals.get("satellite_rain_intensity"),
            ),
            "input_signals": {
                "api_temperature": self._round_or_none(api_signals.get("api_temperature"), 2),
                "api_rain_probability": self._round_or_none(api_signals.get("api_rain_probability"), 4),
                "ml_temperature_prediction": self._round_or_none(ml_signals.get("ml_temperature_prediction"), 2),
                "ml_rain_probability": self._round_or_none(ml_signals.get("ml_rain_probability"), 4),
                "sky_cloud_classification": normalized_sky,
                "satellite_wind_speed": self._round_or_none(satellite_signals.get("satellite_wind_speed"), 2),
                "satellite_rain_intensity": self._round_or_none(satellite_signals.get("satellite_rain_intensity"), 3),
            },
        }
        self.cache.set(cache_key, response, ttl_seconds=600)
        return response

    def _api_signals(self, latitude: float, longitude: float) -> dict[str, Any]:
        open_meteo_temp: float | None = None
        open_meteo_rain: float | None = None
        open_meteo_ts: dt.datetime | None = None

        try:
            forecast = weather_service.fetch_forecast(latitude=latitude, longitude=longitude, units="metric", days=2)
            today = (forecast.get("daily") or [{}])[0]
            min_temp = today.get("minTemp")
            max_temp = today.get("maxTemp")
            rain_probability = today.get("rainProbability")
            if min_temp is not None and max_temp is not None:
                open_meteo_temp = (float(min_temp) + float(max_temp)) / 2
            if rain_probability is not None:
                open_meteo_rain = self._clamp01(float(rain_probability) / 100.0)
            open_meteo_ts = self._parse_datetime(forecast.get("generatedAtUtc"))
        except Exception:
            open_meteo_temp = None
            open_meteo_rain = None

        openweather_temp: float | None = None
        openweather_rain: float | None = None
        openweather_ts: dt.datetime | None = None
        try:
            openweather = self._openweather_forecast(latitude, longitude)
            openweather_temp = openweather.get("temperature")
            openweather_rain = openweather.get("rain_probability")
            openweather_ts = openweather.get("timestamp_utc")
        except Exception:
            openweather_temp = None
            openweather_rain = None

        api_temperature = self._average_optional([open_meteo_temp, openweather_temp])
        api_rain_probability = self._average_optional([open_meteo_rain, openweather_rain])

        return {
            "api_temperature": api_temperature,
            "api_rain_probability": api_rain_probability,
            "timestamp_utc": openweather_ts or open_meteo_ts,
        }

    def _openweather_forecast(self, latitude: float, longitude: float) -> dict[str, Any]:
        attempts: list[str] = []
        for key, _source in weather_service.candidate_api_keys():
            params = {
                "lat": str(latitude),
                "lon": str(longitude),
                "appid": key,
                "units": "metric",
                "cnt": 1,
            }
            try:
                response = requests.get(OPENWEATHER_FORECAST_URL, params=params, timeout=self.timeout_seconds)
            except requests.RequestException as exc:
                attempts.append(str(exc))
                continue

            payload = response.json() if response.content else {}
            if response.status_code != 200:
                attempts.append(str(payload.get("message", f"HTTP {response.status_code}")))
                continue

            first = (payload.get("list") or [None])[0]
            if not first:
                attempts.append("No OpenWeather forecast list entries.")
                continue

            main = first.get("main") or {}
            pop = first.get("pop")
            dt_utc = first.get("dt")
            if main.get("temp") is None:
                attempts.append("Missing OpenWeather forecast temperature.")
                continue

            timestamp_utc = (
                dt.datetime.fromtimestamp(int(dt_utc), tz=dt.timezone.utc).replace(tzinfo=None)
                if dt_utc is not None
                else dt.datetime.utcnow()
            )
            rain_probability = self._clamp01(float(pop or 0.0))
            return {
                "temperature": float(main.get("temp")),
                "rain_probability": rain_probability,
                "timestamp_utc": timestamp_utc,
            }

        tail = f" Last attempt: {attempts[-1]}" if attempts else ""
        raise ValueError(f"OpenWeather forecast unavailable.{tail}")

    def _ml_signals(self, latitude: float, longitude: float) -> dict[str, Any]:
        try:
            payload = ml_prediction_service.predict_weather(city="", lat=latitude, lon=longitude)
            ml_temp = payload.get("temperature_prediction")
            ml_rain = payload.get("rain_probability")
            ml_conf = payload.get("confidence_score")
            return {
                "ml_temperature_prediction": float(ml_temp) if ml_temp is not None else None,
                "ml_rain_probability": self._clamp01(float(ml_rain)) if ml_rain is not None else None,
                "ml_confidence": self._clamp01(float(ml_conf)) if ml_conf is not None else 0.45,
            }
        except Exception:
            return {
                "ml_temperature_prediction": None,
                "ml_rain_probability": None,
                "ml_confidence": 0.0,
            }

    def _satellite_signals(self, latitude: float, longitude: float) -> dict[str, Any]:
        try:
            payload = weather_service.fetch_map_weather_data(latitude=latitude, longitude=longitude, hour_offset=0)
            temperature = payload.get("temperature")
            wind_speed = payload.get("windSpeed")
            rain_intensity = payload.get("precipitation")
            timestamp_utc = self._parse_datetime(payload.get("timeUtc"))
            return {
                "satellite_temperature": float(temperature) if temperature is not None else None,
                "satellite_wind_speed": float(wind_speed) if wind_speed is not None else None,
                "satellite_rain_intensity": float(rain_intensity) if rain_intensity is not None else None,
                "timestamp_utc": timestamp_utc,
            }
        except Exception:
            return {
                "satellite_temperature": None,
                "satellite_wind_speed": None,
                "satellite_rain_intensity": None,
                "timestamp_utc": None,
            }

    @staticmethod
    def _normalize_sky_condition(value: str) -> str:
        text = str(value or "").strip().lower()
        if text in SKY_RAIN_PROBABILITY:
            return text
        return "clear_sky"

    def _satellite_rain_probability(self, rain_intensity: Any, wind_speed: Any) -> float:
        # Converts raw satellite rain intensity + wind speed into a probabilistic rain signal.
        rain = 0.0 if rain_intensity is None else float(rain_intensity)
        wind = 0.0 if wind_speed is None else float(wind_speed)
        rain_component = self._clamp01(rain / 6.0)
        wind_component = self._clamp01(wind / 90.0)
        return self._clamp01((0.82 * rain_component) + (0.18 * wind_component))

    def _storm_risk(self, rain_probability: Any, satellite_wind_speed: Any, sky_condition: str) -> float:
        rain = self._clamp01(float(rain_probability if rain_probability is not None else 0.0))
        wind = 0.0 if satellite_wind_speed is None else float(satellite_wind_speed)
        wind_factor = self._clamp01(wind / 70.0)
        sky_factor = SKY_STORM_FACTOR.get(sky_condition, 0.05)
        return self._clamp01((0.58 * rain) + (0.27 * wind_factor) + (0.15 * sky_factor))

    def _confidence_score(
        self,
        api_temp: Any,
        ml_temp: Any,
        api_rain: Any,
        ml_rain: Any,
        sky_rain: Any,
        satellite_rain: Any,
        api_timestamp: dt.datetime | None,
        satellite_timestamp: dt.datetime | None,
        ml_confidence: Any,
        sky_condition: str,
    ) -> float:
        # Agreement: lower spread between sources means better agreement.
        rain_sources = [value for value in [api_rain, ml_rain, sky_rain, satellite_rain] if value is not None]
        if len(rain_sources) >= 2:
            rain_spread = max(float(x) for x in rain_sources) - min(float(x) for x in rain_sources)
            rain_agreement = self._clamp01(1.0 - rain_spread)
        else:
            rain_agreement = 0.5

        if api_temp is not None and ml_temp is not None:
            temp_gap = abs(float(api_temp) - float(ml_temp))
            temp_agreement = self._clamp01(1.0 - (temp_gap / 8.0))
        else:
            temp_agreement = 0.5
        agreement_score = (0.6 * rain_agreement) + (0.4 * temp_agreement)

        # Freshness: newest source timestamps score higher than stale samples.
        freshness_values: list[float] = []
        now = dt.datetime.utcnow()
        for timestamp in [api_timestamp, satellite_timestamp]:
            if timestamp is None:
                continue
            age_hours = max(0.0, (now - timestamp).total_seconds() / 3600.0)
            freshness_values.append(self._clamp01(1.0 - (age_hours / 24.0)))
        freshness_score = mean(freshness_values) if freshness_values else 0.6

        sky_model_confidence = {
            "clear_sky": 0.82,
            "overcast": 0.76,
            "rain_clouds": 0.79,
            "storm_clouds": 0.84,
        }.get(sky_condition, 0.7)
        model_score = (0.65 * self._clamp01(float(ml_confidence or 0.0))) + (0.35 * sky_model_confidence)

        score = (0.45 * agreement_score) + (0.30 * freshness_score) + (0.25 * model_score)
        return self._clamp01(score)

    @staticmethod
    def _sources_used(
        api_temperature: Any,
        api_rain_probability: Any,
        ml_temperature_prediction: Any,
        ml_rain_probability: Any,
        sky_rain_estimate: Any,
        satellite_wind_speed: Any,
        satellite_rain_intensity: Any,
    ) -> list[str]:
        sources: list[str] = []
        if api_temperature is not None or api_rain_probability is not None:
            sources.append("api_forecast")
        if ml_temperature_prediction is not None or ml_rain_probability is not None:
            sources.append("ml_model")
        if sky_rain_estimate is not None:
            sources.append("sky_image")
        if satellite_wind_speed is not None or satellite_rain_intensity is not None:
            sources.append("satellite_data")
        return sources

    @staticmethod
    def _weighted_average(values: list[tuple[Any, float]]) -> float:
        numerator = 0.0
        denominator = 0.0
        for raw_value, weight in values:
            if raw_value is None:
                continue
            numerator += float(raw_value) * float(weight)
            denominator += float(weight)
        if denominator <= 0:
            raise ValueError("No valid signal values available for weighted averaging.")
        return numerator / denominator

    @staticmethod
    def _parse_datetime(value: Any) -> dt.datetime | None:
        text = str(value or "").strip()
        if not text:
            return None
        try:
            parsed = dt.datetime.fromisoformat(text.replace("Z", "+00:00"))
        except ValueError:
            return None
        if parsed.tzinfo is not None:
            return parsed.astimezone(dt.timezone.utc).replace(tzinfo=None)
        return parsed

    @staticmethod
    def _clamp01(value: float) -> float:
        return max(0.0, min(1.0, float(value)))

    @staticmethod
    def _round_or_none(value: Any, digits: int) -> float | None:
        if value is None:
            return None
        return round(float(value), digits)

    @staticmethod
    def _average_optional(values: list[Any]) -> float | None:
        valid = [float(item) for item in values if item is not None]
        if not valid:
            return None
        return sum(valid) / len(valid)


hyperlocal_prediction_service = HyperlocalPredictionService()

from __future__ import annotations

from typing import Any


def _phrase_temp(temp_c: float) -> str:
    if temp_c >= 37:
        return "very hot"
    if temp_c >= 31:
        return "hot"
    if temp_c >= 25:
        return "warm"
    if temp_c >= 18:
        return "mild"
    if temp_c >= 10:
        return "cool"
    return "cold"


def _phrase_humidity(humidity: float) -> str:
    if humidity >= 80:
        return "very humid"
    if humidity >= 65:
        return "humid"
    if humidity >= 45:
        return "moderately humid"
    return "dry"


def _outdoor_window(rain_probability: float, uv_index: float, wind_speed_kmh: float) -> str:
    if rain_probability > 70:
        return "Indoor plans are safer for most of the day"
    if uv_index > 8:
        return "Outdoor activities are best early morning or late evening"
    if wind_speed_kmh > 40:
        return "Choose sheltered locations due to strong winds"
    return "Outdoor activities are favorable through most daylight hours"


def generate_weather_summary(payload: dict[str, Any]) -> str:
    temp_c = float(payload.get("temperatureC", payload.get("temperature", 0)) or 0)
    humidity = float(payload.get("humidity", 0) or 0)
    wind_speed = float(payload.get("windKmh", payload.get("windSpeed", 0)) or 0)
    rain_probability = float(payload.get("rainProbability", 0) or 0)
    condition = str(payload.get("condition", "")).lower()

    condition_text = condition if condition else "mixed conditions"
    summary = (
        f"Today will be {_phrase_temp(temp_c)} and {_phrase_humidity(humidity)} with {condition_text}. "
        f"Rain chance is around {round(rain_probability)}% and wind is near {round(wind_speed)} km/h. "
        f"{_outdoor_window(rain_probability, float(payload.get('uvIndex', 0) or 0), wind_speed)}."
    )
    return summary

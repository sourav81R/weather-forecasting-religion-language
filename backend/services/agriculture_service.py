from __future__ import annotations

from typing import Any


CROP_PROFILES = {
    "rice": {"temp_min": 20, "temp_max": 35, "weekly_rain_mm": 35},
    "wheat": {"temp_min": 12, "temp_max": 25, "weekly_rain_mm": 20},
    "maize": {"temp_min": 18, "temp_max": 32, "weekly_rain_mm": 28},
    "potato": {"temp_min": 10, "temp_max": 24, "weekly_rain_mm": 18},
    "cotton": {"temp_min": 21, "temp_max": 34, "weekly_rain_mm": 22},
}


def agriculture_advice(crop_type: str, location: str, forecast_daily: list[dict[str, Any]]) -> dict[str, Any]:
    crop_key = crop_type.strip().lower()
    profile = CROP_PROFILES.get(crop_key, CROP_PROFILES["rice"])

    next_week = forecast_daily[:7]
    if not next_week:
        raise ValueError("Forecast data unavailable for agriculture advisor.")

    avg_temp = sum((item["maxTemp"] + item["minTemp"]) / 2 for item in next_week) / len(next_week)
    total_rain = sum(float(item["rainAmount"]) for item in next_week)
    max_rain_prob = max(float(item["rainProbability"]) for item in next_week)
    min_temp = min(float(item["minTemp"]) for item in next_week)

    planting_window = _planting_window(next_week, profile)
    irrigation = _irrigation_recommendation(total_rain, profile["weekly_rain_mm"])

    return {
        "cropType": crop_key,
        "location": location,
        "avgTemp": round(avg_temp, 1),
        "weeklyRainMm": round(total_rain, 1),
        "irrigationRecommendation": irrigation,
        "plantingWindow": planting_window,
        "rainAlert": max_rain_prob >= 70,
        "frostRisk": min_temp <= 2,
        "advice": _build_advice(avg_temp, total_rain, max_rain_prob, min_temp, profile),
    }


def _planting_window(days: list[dict[str, Any]], profile: dict[str, float]) -> str:
    windows = []
    for item in days:
        avg = (float(item["maxTemp"]) + float(item["minTemp"])) / 2
        rain_prob = float(item["rainProbability"])
        if profile["temp_min"] <= avg <= profile["temp_max"] and rain_prob < 65:
            windows.append(item["date"])
    if windows:
        return f"Suitable planting days: {', '.join(windows[:3])}."
    return "No strong planting window in the next 7 days."


def _irrigation_recommendation(total_rain: float, target_rain: float) -> str:
    if total_rain >= target_rain:
        return "Natural rainfall likely sufficient; reduce supplemental irrigation."
    gap = round(target_rain - total_rain, 1)
    return f"Plan supplemental irrigation of approximately {gap} mm this week."


def _build_advice(
    avg_temp: float,
    total_rain: float,
    max_rain_prob: float,
    min_temp: float,
    profile: dict[str, float],
) -> list[str]:
    notes = []
    if avg_temp < profile["temp_min"]:
        notes.append("Average temperature is below crop comfort range; growth may slow.")
    elif avg_temp > profile["temp_max"]:
        notes.append("Average temperature is above ideal range; monitor crop stress and soil moisture.")
    else:
        notes.append("Temperature profile is within the crop comfort range.")

    if max_rain_prob >= 70:
        notes.append("High rain probability detected; prepare drainage and disease protection.")
    else:
        notes.append("No severe rain spikes expected this week.")

    if min_temp <= 2:
        notes.append("Frost risk is present; use crop covers during night hours.")

    if total_rain < profile["weekly_rain_mm"]:
        notes.append("Rainfall may be insufficient; schedule irrigation cycles.")

    return notes

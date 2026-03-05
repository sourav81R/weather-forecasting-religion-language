from __future__ import annotations

from statistics import mean
from typing import Any


def build_analytics(forecast: dict[str, Any]) -> dict[str, Any]:
    daily = forecast.get("daily") or []
    labels = [item["date"] for item in daily]
    temperatures = [round((item["maxTemp"] + item["minTemp"]) / 2, 2) for item in daily]
    rain_probabilities = [round(item["rainProbability"], 2) for item in daily]
    wind_speeds = [round(item["windSpeed"], 2) for item in daily]
    humidity_series = _estimate_humidity_series(forecast)
    uv_series = [round(item["uvIndex"], 2) for item in daily]

    return {
        "labels": labels,
        "series": {
            "temperature": temperatures,
            "rainProbability": rain_probabilities,
            "windSpeed": wind_speeds,
            "humidity": humidity_series,
            "uvIndex": uv_series,
        },
        "summary": {
            "avgTemp": round(mean(temperatures), 2) if temperatures else None,
            "peakRainProbability": round(max(rain_probabilities), 2) if rain_probabilities else None,
            "avgWindSpeed": round(mean(wind_speeds), 2) if wind_speeds else None,
            "avgHumidity": round(mean(humidity_series), 2) if humidity_series else None,
            "peakUvIndex": round(max(uv_series), 2) if uv_series else None,
        },
    }


def _estimate_humidity_series(forecast: dict[str, Any]) -> list[float]:
    hourly = forecast.get("hourly") or []
    if not hourly:
        return []

    buckets: dict[str, list[float]] = {}
    for item in hourly:
        day = str(item.get("time", ""))[:10]
        if not day:
            continue
        buckets.setdefault(day, []).append(float(item.get("humidity", 0) or 0))

    output = []
    for day in sorted(buckets.keys()):
        output.append(round(mean(buckets[day]), 2))
    return output

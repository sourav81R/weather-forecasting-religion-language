from __future__ import annotations

from statistics import mean
from typing import Any


def climate_insights_from_archive(payload: dict[str, Any]) -> dict[str, Any]:
    daily = payload.get("daily") or {}
    dates = daily.get("time") or []
    temperatures = [float(item) for item in (daily.get("temperature_2m_mean") or [])]
    rain = [float(item) for item in (daily.get("precipitation_sum") or [])]
    wind = [float(item) for item in (daily.get("wind_speed_10m_max") or [])]

    if not dates or not temperatures:
        return {
            "status": "unavailable",
            "message": "Historical climate series unavailable for this location.",
        }

    split = max(1, len(temperatures) // 2)
    first_half_temp = mean(temperatures[:split])
    second_half_temp = mean(temperatures[split:]) if temperatures[split:] else first_half_temp

    first_half_rain = mean(rain[:split]) if rain else 0
    second_half_rain = mean(rain[split:]) if rain[split:] else first_half_rain

    hot_days = sum(1 for value in temperatures if value >= 35)
    heavy_rain_days = sum(1 for value in rain if value >= 20)
    high_wind_days = sum(1 for value in wind if value >= 40)

    return {
        "status": "ok",
        "daysAnalyzed": len(dates),
        "averageTemperatureChange": round(second_half_temp - first_half_temp, 2),
        "rainfallTrend": round(second_half_rain - first_half_rain, 2),
        "extremeWeatherFrequency": {
            "hotDays": hot_days,
            "heavyRainDays": heavy_rain_days,
            "highWindDays": high_wind_days,
        },
        "narrative": _narrative(second_half_temp - first_half_temp, second_half_rain - first_half_rain, hot_days, heavy_rain_days),
    }


def _narrative(temp_delta: float, rain_delta: float, hot_days: int, heavy_rain_days: int) -> str:
    temp_note = "warming" if temp_delta > 0.6 else "cooling" if temp_delta < -0.6 else "stable temperatures"
    rain_note = "wetter pattern" if rain_delta > 1 else "drier pattern" if rain_delta < -1 else "stable rainfall"
    return (
        f"Recent climate signal indicates {temp_note} with a {rain_note}. "
        f"Observed extremes include {hot_days} hot days and {heavy_rain_days} heavy-rain days."
    )

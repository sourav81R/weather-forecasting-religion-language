from __future__ import annotations

import datetime as dt
from typing import Any

from backend.services.ai_service import generate_weather_summary


def chatbot_response(question: str, current_weather: dict[str, Any], forecast: dict[str, Any], activity_payload: dict[str, Any]) -> str:
    text = question.strip().lower()
    daily = forecast.get("daily") or []

    if not text:
        return "Ask about rain, weekend heat, or best outdoor time."

    if "tomorrow" in text and "rain" in text:
        if len(daily) > 1:
            rain = round(float(daily[1].get("rainProbability", 0)), 1)
            return f"Tomorrow rain probability is around {rain}%."
        return "I do not have enough forecast data for tomorrow yet."

    if "weekend" in text or "this weekend" in text:
        weekend_days = _find_weekend_days(daily)
        if weekend_days:
            highs = [float(item.get("maxTemp", 0)) for item in weekend_days]
            return f"Weekend highs are expected between {round(min(highs), 1)} and {round(max(highs), 1)}."
        return "Weekend forecast is not available in the current range."

    if "outdoor" in text or "activity" in text or "best time" in text:
        best = activity_payload.get("bestActivity")
        if best:
            return f"Best current option is {best['activity']} (score {best['score']}/100)."
        return "Outdoor recommendation is not available right now."

    summary_payload = {
        "temperatureC": current_weather.get("tempC") or current_weather.get("temperatureC"),
        "humidity": current_weather.get("humidity"),
        "windKmh": current_weather.get("windKmh"),
        "rainProbability": (daily[0].get("rainProbability") if daily else 0),
        "uvIndex": (daily[0].get("uvIndex") if daily else 0),
        "condition": current_weather.get("condition", ""),
    }
    return generate_weather_summary(summary_payload)


def _find_weekend_days(days: list[dict[str, Any]]) -> list[dict[str, Any]]:
    output = []
    for day in days:
        try:
            current = dt.date.fromisoformat(day["date"])
        except Exception:
            continue
        if current.weekday() in (5, 6):
            output.append(day)
    return output

from __future__ import annotations

from typing import Any


ACTIVITY_WEIGHTS = {
    "running": {"temp": 0.3, "humidity": 0.2, "uv": 0.2, "wind": 0.1, "rain": 0.2},
    "cycling": {"temp": 0.25, "humidity": 0.15, "uv": 0.2, "wind": 0.2, "rain": 0.2},
    "trekking": {"temp": 0.25, "humidity": 0.15, "uv": 0.15, "wind": 0.15, "rain": 0.3},
    "photography": {"temp": 0.2, "humidity": 0.1, "uv": 0.1, "wind": 0.2, "rain": 0.4},
    "beach": {"temp": 0.35, "humidity": 0.1, "uv": 0.25, "wind": 0.1, "rain": 0.2},
}


def activity_scores(weather: dict[str, Any]) -> dict[str, Any]:
    temp = float(weather.get("temperatureC", 25) or 25)
    humidity = float(weather.get("humidity", 50) or 50)
    uv = float(weather.get("uvIndex", 5) or 5)
    wind = float(weather.get("windKmh", 12) or 12)
    rain = float(weather.get("rainProbability", 20) or 20)

    def temp_score() -> float:
        return max(0.0, 100 - abs(temp - 22) * 4)

    def humidity_score() -> float:
        return max(0.0, 100 - max(0, humidity - 55) * 1.4)

    def uv_score() -> float:
        return max(0.0, 100 - max(0, uv - 4) * 12)

    def wind_score() -> float:
        return max(0.0, 100 - max(0, wind - 18) * 2.8)

    def rain_score() -> float:
        return max(0.0, 100 - rain * 1.1)

    metric_scores = {
        "temp": temp_score(),
        "humidity": humidity_score(),
        "uv": uv_score(),
        "wind": wind_score(),
        "rain": rain_score(),
    }

    activities: list[dict[str, Any]] = []
    for activity, weights in ACTIVITY_WEIGHTS.items():
        score = sum(metric_scores[key] * weight for key, weight in weights.items())
        activities.append(
            {
                "activity": activity,
                "score": round(score, 1),
                "recommendation": _recommend_text(activity, score),
            }
        )

    activities.sort(key=lambda item: item["score"], reverse=True)
    return {
        "activities": activities,
        "bestActivity": activities[0] if activities else None,
        "input": {
            "temperatureC": temp,
            "humidity": humidity,
            "uvIndex": uv,
            "windKmh": wind,
            "rainProbability": rain,
        },
    }


def _recommend_text(activity: str, score: float) -> str:
    if score >= 75:
        return f"Excellent window for {activity}."
    if score >= 55:
        return f"Good conditions for {activity} with minor caution."
    if score >= 35:
        return f"Possible {activity}, but conditions are mixed."
    return f"Low suitability for {activity} right now."

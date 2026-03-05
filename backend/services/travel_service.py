from __future__ import annotations

import datetime as dt
from typing import Any


def evaluate_travel_window(destination: str, start_date: str, end_date: str, forecast_daily: list[dict[str, Any]]) -> dict[str, Any]:
    start = dt.date.fromisoformat(start_date)
    end = dt.date.fromisoformat(end_date)
    if end < start:
        raise ValueError("End date must be on or after start date.")

    days = [
        item
        for item in forecast_daily
        if start <= dt.date.fromisoformat(item["date"]) <= end
    ]
    if not days:
        raise ValueError("Requested dates are outside available forecast range.")

    scored_days = []
    for item in days:
        avg_temp = (float(item["maxTemp"]) + float(item["minTemp"])) / 2
        rain_prob = float(item["rainProbability"])
        wind = float(item["windSpeed"])
        uv = float(item.get("uvIndex", 0))

        score = 100
        score -= abs(avg_temp - 24) * 2.3
        score -= max(0, rain_prob - 20) * 0.6
        score -= max(0, wind - 24) * 0.9
        score -= max(0, uv - 6) * 2.5

        scored_days.append(
            {
                "date": item["date"],
                "score": round(max(score, 0), 1),
                "tempRange": [round(item["minTemp"], 1), round(item["maxTemp"], 1)],
                "rainRisk": round(rain_prob, 1),
                "condition": item["condition"],
            }
        )

    scored_days.sort(key=lambda item: item["score"], reverse=True)
    overall_score = round(sum(day["score"] for day in scored_days) / len(scored_days), 1)

    return {
        "destination": destination,
        "dateRange": {"start": start_date, "end": end_date},
        "weatherScore": overall_score,
        "bestTravelDays": scored_days[:3],
        "allDays": sorted(scored_days, key=lambda item: item["date"]),
        "recommendation": _build_recommendation(overall_score),
    }


def _build_recommendation(score: float) -> str:
    if score >= 75:
        return "Weather is favorable for travel in most of the selected window."
    if score >= 55:
        return "Travel is reasonable, but plan around rain and midday heat."
    if score >= 35:
        return "Weather is mixed. Keep flexible indoor alternatives."
    return "Travel risk is high due to unstable weather conditions."

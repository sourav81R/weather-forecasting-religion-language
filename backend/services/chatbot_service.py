from __future__ import annotations

import datetime as dt
import json
import re
from typing import Any

import requests

from backend.config import get_settings
from backend.services.ai_service import generate_weather_summary

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
GEMINI_SYSTEM_INSTRUCTION = (
    "You are the Regional Weather Studio chatbot. Answer any user question helpfully and directly. "
    "Use the provided weather context whenever the question is weather-related, and clearly separate facts from guesses. "
    "If the question is not about weather, still answer normally as a general assistant. "
    "Do not claim to have live browsing or tools beyond the provided weather context. "
    "Keep answers concise, practical, and safe."
)
CHAT_HISTORY_LIMIT = 12


def chatbot_response(
    question: str,
    current_weather: dict[str, Any],
    forecast: dict[str, Any],
    activity_payload: dict[str, Any],
    history: list[dict[str, Any]] | None = None,
) -> str:
    text = question.strip()
    if not text:
        return (
            "Ask anything. I can answer general questions and use your current weather data for rain, temperature, UV, wind, "
            "sunrise/sunset, weekend forecast, and outdoor planning."
        )

    fallback = _fallback_chatbot_response(text, current_weather, forecast, activity_payload)
    try:
        gemini_answer = _gemini_chatbot_response(text, current_weather, forecast, activity_payload, history or [])
        if gemini_answer:
            return gemini_answer
    except Exception:
        pass
    return fallback


def _gemini_chatbot_response(
    question: str,
    current_weather: dict[str, Any],
    forecast: dict[str, Any],
    activity_payload: dict[str, Any],
    history: list[dict[str, Any]],
) -> str:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise ValueError("Gemini API key is not configured.")

    weather_context = _build_weather_context(current_weather, forecast, activity_payload)
    contents = _build_gemini_contents(question, weather_context, history)
    response = requests.post(
        GEMINI_API_URL.format(model=settings.gemini_model),
        headers={"x-goog-api-key": settings.gemini_api_key, "Content-Type": "application/json"},
        json={
            "system_instruction": {
                "parts": [{"text": GEMINI_SYSTEM_INSTRUCTION}],
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.9,
                "maxOutputTokens": 700,
            },
        },
        timeout=settings.gemini_timeout_seconds,
    )
    response.raise_for_status()
    payload = response.json()
    answer = _extract_gemini_text(payload)
    if not answer:
        raise ValueError("Gemini returned an empty response.")
    return answer


def _build_gemini_contents(question: str, weather_context: str, history: list[dict[str, Any]]) -> list[dict[str, Any]]:
    contents: list[dict[str, Any]] = []
    for item in history[-CHAT_HISTORY_LIMIT:]:
        role = "model" if str(item.get("role", "")).lower() in {"assistant", "model", "bot"} else "user"
        text = str(item.get("text", "")).strip()
        if not text:
            continue
        contents.append({"role": role, "parts": [{"text": text}]})

    contents.append(
        {
            "role": "user",
            "parts": [
                {
                    "text": (
                        "Weather context for this conversation:\n"
                        f"{weather_context}\n\n"
                        f"User question: {question}"
                    )
                }
            ],
        }
    )
    return contents


def _extract_gemini_text(payload: dict[str, Any]) -> str:
    candidates = payload.get("candidates") or []
    for candidate in candidates:
        content = candidate.get("content") or {}
        parts = content.get("parts") or []
        chunks = [str(part.get("text", "")).strip() for part in parts if str(part.get("text", "")).strip()]
        if chunks:
            return "\n".join(chunks).strip()
    return ""


def _build_weather_context(current_weather: dict[str, Any], forecast: dict[str, Any], activity_payload: dict[str, Any]) -> str:
    daily = forecast.get("daily") or []
    hourly = forecast.get("hourly") or []
    best_activity = activity_payload.get("bestActivity") or {}

    compact_daily = [
        {
            "date": day.get("date"),
            "condition": day.get("condition"),
            "minTemp": day.get("minTemp"),
            "maxTemp": day.get("maxTemp"),
            "rainProbability": day.get("rainProbability"),
            "uvIndex": day.get("uvIndex"),
            "windSpeed": day.get("windSpeed"),
        }
        for day in daily[:5]
    ]
    compact_hourly = [
        {
            "time": hour.get("time"),
            "temperature": hour.get("temperature"),
            "rainProbability": hour.get("rainProbability"),
            "windSpeed": hour.get("windSpeed"),
            "humidity": hour.get("humidity"),
            "uvIndex": hour.get("uvIndex"),
        }
        for hour in hourly[:12]
    ]

    context = {
        "location": current_weather.get("location"),
        "current": {
            "condition": current_weather.get("condition"),
            "temperature": current_weather.get("temperature"),
            "temperatureUnit": current_weather.get("temperatureUnit"),
            "feelsLike": current_weather.get("feelsLike"),
            "humidity": current_weather.get("humidity"),
            "windSpeed": current_weather.get("windSpeed"),
            "windUnit": current_weather.get("windUnit"),
            "sunrise": current_weather.get("sunrise"),
            "sunset": current_weather.get("sunset"),
        },
        "forecastDailyTop5": compact_daily,
        "forecastHourlyTop12": compact_hourly,
        "bestActivity": {
            "activity": best_activity.get("activity"),
            "score": best_activity.get("score"),
            "recommendation": best_activity.get("recommendation"),
        },
    }
    return json.dumps(context, ensure_ascii=True, indent=2)


def _fallback_chatbot_response(
    question: str,
    current_weather: dict[str, Any],
    forecast: dict[str, Any],
    activity_payload: dict[str, Any],
) -> str:
    text = question.strip().lower()
    daily = forecast.get("daily") or []
    hourly = forecast.get("hourly") or []

    if not daily:
        return "Forecast data is not loaded yet. Try again after weather data refresh."

    target_day = _resolve_day_from_question(text, daily)
    target_label = _day_label(target_day) if target_day else "today"

    if _has_any(text, ["sunrise", "sunset", "daylight"]):
        sunrise = current_weather.get("sunrise") or "--"
        sunset = current_weather.get("sunset") or "--"
        return f"Sunrise is around {sunrise} and sunset is around {sunset}."

    if _has_any(text, ["humidity", "humid"]):
        humidity = _num(current_weather.get("humidity"))
        return f"Current humidity is around {round(humidity)}%."

    if _has_any(text, ["wind", "breeze", "gust"]):
        wind = _num(current_weather.get("windSpeed"))
        unit = str(current_weather.get("windUnit") or "m/s")
        return f"Current wind is about {round(wind, 1)} {unit}."

    if _has_any(text, ["uv", "sunburn", "sunscreen"]):
        uv = _num((target_day or daily[0]).get("uvIndex"))
        if uv >= 8:
            level = "very high"
        elif uv >= 6:
            level = "high"
        elif uv >= 3:
            level = "moderate"
        else:
            level = "low"
        return f"{target_label.capitalize()} UV index is about {round(uv, 1)} ({level})."

    if _has_any(text, ["rain", "umbrella", "precip", "drizzle", "shower"]):
        day = target_day or daily[0]
        rain = _num(day.get("rainProbability"))
        amount = _num(day.get("rainAmount"))
        advice = "Carry an umbrella." if rain >= 45 else "Umbrella is usually optional."
        return f"{target_label.capitalize()} rain chance is {round(rain)}% with about {round(amount, 1)} mm expected. {advice}"

    if _has_any(text, ["temperature", "temp", "hot", "cold", "feels like", "heat"]):
        if target_day:
            max_temp = _num(target_day.get("maxTemp"))
            min_temp = _num(target_day.get("minTemp"))
            unit = _temperature_unit(current_weather)
            return f"{target_label.capitalize()} temperature is expected around {round(min_temp)} to {round(max_temp)}{unit}."
        temp = _num(current_weather.get("temperature"))
        feels = _num(current_weather.get("feelsLike"))
        unit = _temperature_unit(current_weather)
        return f"Current temperature is {round(temp)}{unit} and feels like {round(feels)}{unit}."

    if _has_any(text, ["hottest", "warmest", "coldest", "coolest"]):
        if "cold" in text or "cool" in text:
            day = min(daily, key=lambda item: _num(item.get("minTemp")))
            value = round(_num(day.get("minTemp")))
            return f"Coldest day in the current forecast is {_day_label(day)} at about {value}{_temperature_unit(current_weather)}."
        day = max(daily, key=lambda item: _num(item.get("maxTemp")))
        value = round(_num(day.get("maxTemp")))
        return f"Hottest day in the current forecast is {_day_label(day)} at about {value}{_temperature_unit(current_weather)}."

    if _has_any(text, ["weekend"]):
        weekend_days = _find_weekend_days(daily)
        if not weekend_days:
            return "Weekend forecast is outside the available 15-day range."
        highs = [_num(item.get("maxTemp")) for item in weekend_days]
        lows = [_num(item.get("minTemp")) for item in weekend_days]
        max_rain = max(_num(item.get("rainProbability")) for item in weekend_days)
        return (
            f"Weekend temperatures are around {round(min(lows))}-{round(max(highs))}{_temperature_unit(current_weather)}. "
            f"Peak rain chance is about {round(max_rain)}%."
        )

    if _has_any(text, ["outdoor", "activity", "best time", "walk", "run", "jog", "picnic"]):
        hour_pick = _best_outdoor_hour(hourly)
        best = activity_payload.get("bestActivity")
        if hour_pick and best:
            return f"Best outdoor window is around {hour_pick}. Recommended activity now: {best['activity']} ({best['score']}/100)."
        if best:
            return f"Best current option is {best['activity']} ({best['score']}/100)."
        return "Outdoor recommendation is not available right now."

    if _has_any(text, ["forecast", "next", "upcoming", "weather"]):
        today = daily[0]
        tomorrow = daily[1] if len(daily) > 1 else None
        parts = [
            f"Today: {_condition(today)} with {round(_num(today.get('rainProbability')))}% rain chance.",
        ]
        if tomorrow:
            parts.append(
                f"Tomorrow: {_condition(tomorrow)}, {round(_num(tomorrow.get('minTemp')))}-{round(_num(tomorrow.get('maxTemp')))}{_temperature_unit(current_weather)}."
            )
        return " ".join(parts)

    summary_payload = {
        "temperatureC": current_weather.get("tempC") or current_weather.get("temperatureC"),
        "humidity": current_weather.get("humidity"),
        "windKmh": current_weather.get("windKmh"),
        "rainProbability": (daily[0].get("rainProbability") if daily else 0),
        "uvIndex": (daily[0].get("uvIndex") if daily else 0),
        "condition": current_weather.get("condition", ""),
    }
    return (
        generate_weather_summary(summary_payload)
        + " Ask anything else, or ask about rain, temperature, UV, sunrise/sunset, weekend, or best outdoor time."
    )


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


def _has_any(text: str, words: list[str]) -> bool:
    return any(word in text for word in words)


def _num(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _temperature_unit(current_weather: dict[str, Any]) -> str:
    unit = str(current_weather.get("temperatureUnit") or "°C").strip()
    return unit or "°C"


def _condition(day: dict[str, Any]) -> str:
    return str(day.get("condition") or "mixed conditions").lower()


def _day_label(day: dict[str, Any]) -> str:
    raw = str(day.get("date", "")).strip()
    try:
        parsed = dt.date.fromisoformat(raw)
        return parsed.strftime("%a, %d %b")
    except Exception:
        return raw or "selected day"


def _resolve_day_from_question(text: str, days: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not days:
        return None
    if "today" in text:
        return days[0]
    if "tomorrow" in text and len(days) > 1:
        return days[1]

    offset_match = re.search(r"\bin\s+(\d{1,2})\s+day", text)
    if offset_match:
        idx = int(offset_match.group(1))
        if 0 <= idx < len(days):
            return days[idx]

    weekday_map = {
        "monday": 0,
        "tuesday": 1,
        "wednesday": 2,
        "thursday": 3,
        "friday": 4,
        "saturday": 5,
        "sunday": 6,
    }
    for name, index in weekday_map.items():
        if name not in text:
            continue
        for day in days:
            try:
                parsed = dt.date.fromisoformat(str(day.get("date", "")))
            except Exception:
                continue
            if parsed.weekday() == index:
                return day
    return None


def _best_outdoor_hour(hourly: list[dict[str, Any]]) -> str | None:
    if not hourly:
        return None
    best: dict[str, Any] | None = None
    best_score = float("-inf")
    for hour in hourly[:48]:
        temp = _num(hour.get("temperature"), 24)
        uv = _num(hour.get("uvIndex"), 0)
        wind = _num(hour.get("windSpeed"), 0)
        rain = _num(hour.get("rainProbability"), 0)
        score = 100 - abs(temp - 24) * 2 - max(0, uv - 5) * 8 - max(0, wind - 20) * 1.2 - rain * 0.7
        if score > best_score:
            best_score = score
            best = hour
    if not best:
        return None
    time_raw = str(best.get("time", "")).strip()
    try:
        return dt.datetime.fromisoformat(time_raw).strftime("%a %I:%M %p")
    except Exception:
        return time_raw or None

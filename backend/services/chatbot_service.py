from __future__ import annotations

import datetime as dt
import json
import re
from typing import Any

import requests

from backend.config import get_settings
from backend.services.ai_service import generate_weather_summary
from backend.services.chat_tool_service import chat_tool_service
from backend.services.rag_service import rag_service

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
CHAT_HISTORY_LIMIT = 10
MAX_TOOL_ROUNDS = 3
WEATHER_TOPIC_HINTS = {
    "weather",
    "rain",
    "forecast",
    "storm",
    "temperature",
    "humidity",
    "wind",
    "uv",
    "cloud",
    "radar",
    "satellite",
    "climate",
    "agriculture",
    "farming",
    "travel",
    "sky",
    "monsoon",
    "cyclone",
    "thunderstorm",
    "overcast",
}
CONCEPT_HINTS = {
    "what is",
    "what does",
    "what do",
    "explain",
    "meaning",
    "mean",
    "how does",
    "how do",
    "why does",
    "why do",
    "difference",
    "compare",
    "thunderstorm",
    "overcast",
    "humidity",
    "radar",
    "satellite",
    "cloud",
    "climate",
}
MULTILINGUAL_HINTS = {
    "Bengali": ("bengali", r"[\u0980-\u09FF]"),
    "Hindi": ("hindi", r"[\u0900-\u097F]"),
    "Urdu": ("urdu", r"[\u0600-\u06FF]"),
    "Tamil": ("tamil", r"[\u0B80-\u0BFF]"),
    "Telugu": ("telugu", r"[\u0C00-\u0C7F]"),
    "Kannada": ("kannada", r"[\u0C80-\u0CFF]"),
    "Malayalam": ("malayalam", r"[\u0D00-\u0D7F]"),
    "Gujarati": ("gujarati", r"[\u0A80-\u0AFF]"),
    "Punjabi": ("punjabi", r"[\u0A00-\u0A7F]"),
    "Odia": ("odia", r"[\u0B00-\u0B7F]"),
}

GEMINI_SYSTEM_INSTRUCTION = """
You are the Regional Weather Studio AI Assistant.

Platform context:
You are part of the Regional Weather Studio platform which provides AI-powered weather insights, satellite maps, sky detection, hyperlocal predictions, and offline forecasts.

Primary behavior:
- answer general questions clearly and politely
- prioritize weather-specific intelligence whenever the question is about weather, maps, climate, farming, travel, alerts, sky conditions, or forecast reasoning
- use available tools when live weather data, climate data, or hyperlocal signals are needed
- use retrieved knowledge snippets for conceptual questions such as storms, clouds, humidity, radar, or climate terminology
- remember recent conversation context and location context when provided
- respond in the same language as the user when possible

Capabilities:
- answer general questions
- explain weather conditions
- provide travel advice based on weather
- explain storm warnings
- explain climate trends
- help farmers with weather insights
- interpret weather charts
- explain radar maps
- interpret sky image detection results
- explain satellite weather layers

Map integration:
If the user asks to show or highlight a map layer, answer naturally, but do not invent map state. The application may separately trigger map actions.

Tool behavior:
- use tools for live weather, forecast, alerts, hyperlocal prediction, and climate insights when needed
- if a live data tool fails, continue with general weather knowledge and clearly say live data could not be retrieved
- do not invent unsupported live readings, forecasts, or alerts

Response style:
- clear
- short
- friendly
- informative
- avoid unnecessary jargon unless the user asks for detail

Few-shot examples:
User: Will it rain tomorrow?
Assistant: Use forecast data for the relevant location, then explain rain probability and practical advice.

User: Is it good weather for travel?
Assistant: Check forecast conditions such as wind, rain probability, and temperature, then give practical travel advice.

User: What does overcast sky mean?
Assistant: Use retrieved weather knowledge and explain it simply.
""".strip()


def chatbot_response(
    question: str,
    current_weather: dict[str, Any] | None,
    forecast: dict[str, Any] | None,
    activity_payload: dict[str, Any] | None,
    history: list[dict[str, Any]] | None = None,
    assistant_context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    text = str(question or "").strip()
    safe_current = current_weather or {}
    safe_forecast = forecast or {}
    safe_activity = activity_payload or {}
    context = assistant_context or {}

    if not text:
        return {
            "reply": "Ask anything. I can answer general questions, explain weather, and use live weather tools when needed.",
            "map_action": None,
            "used_tools": [],
            "knowledge_hits": [],
            "language": _response_language_hint(text, context),
        }

    knowledge_hits = rag_service.retrieve(text, limit=3) if _should_use_rag(text) else []
    heuristic_tool_calls = _heuristic_tool_calls(text, context)
    tool_context = {
        "units": context.get("units", "metric"),
        "language": context.get("language", "English"),
    }
    heuristic_tool_results: list[dict[str, Any]] = []
    used_tools: list[str] = []
    for call in heuristic_tool_calls:
        try:
            result = chat_tool_service.execute(call["name"], call.get("arguments") or {}, tool_context)
            heuristic_tool_results.append(result)
            used_tools.append(str(call["name"]))
        except Exception as exc:
            heuristic_tool_results.append(
                {
                    "tool": call["name"],
                    "error": str(exc),
                }
            )

    fallback_reply = _fallback_reply(text, safe_current, safe_forecast, safe_activity)
    map_action = _infer_map_action(text, context)

    try:
        reply, auto_tools = _gemini_chatbot_response(
            question=text,
            current_weather=safe_current,
            forecast=safe_forecast,
            activity_payload=safe_activity,
            history=history or [],
            assistant_context=context,
            rag_hits=knowledge_hits,
            heuristic_tool_results=heuristic_tool_results,
        )
        used_tools.extend(auto_tools)
        if reply:
            return {
                "reply": reply,
                "map_action": map_action,
                "used_tools": _dedupe_strings(used_tools),
                "knowledge_hits": [item["title"] for item in knowledge_hits],
                "language": _response_language_hint(text, context),
            }
    except Exception:
        pass

    return {
        "reply": fallback_reply,
        "map_action": map_action,
        "used_tools": _dedupe_strings(used_tools),
        "knowledge_hits": [item["title"] for item in knowledge_hits],
        "language": _response_language_hint(text, context),
    }


def _gemini_chatbot_response(
    *,
    question: str,
    current_weather: dict[str, Any],
    forecast: dict[str, Any],
    activity_payload: dict[str, Any],
    history: list[dict[str, Any]],
    assistant_context: dict[str, Any],
    rag_hits: list[dict[str, Any]],
    heuristic_tool_results: list[dict[str, Any]],
) -> tuple[str, list[str]]:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise ValueError("Gemini API key is not configured.")

    used_tools: list[str] = []
    contents = _build_gemini_contents(
        question=question,
        weather_context=_build_weather_context(current_weather, forecast, activity_payload, assistant_context),
        history=history,
        assistant_context=assistant_context,
        rag_hits=rag_hits,
        heuristic_tool_results=heuristic_tool_results,
    )

    for _ in range(MAX_TOOL_ROUNDS):
        payload = _call_gemini_api(contents, settings)
        candidate_content = _extract_candidate_content(payload)
        if not candidate_content:
            break

        function_calls = _extract_function_calls(candidate_content)
        text_reply = _extract_text_from_content(candidate_content)

        if function_calls:
            contents.append(candidate_content)
            function_responses = []
            for call in function_calls:
                used_tools.append(call["name"])
                result = _execute_tool_call(call, assistant_context)
                function_responses.append(
                    {
                        "functionResponse": {
                            "name": call["name"],
                            "response": {
                                "result": result,
                            },
                        }
                    }
                )
            contents.append({"role": "user", "parts": function_responses})
            continue

        if text_reply:
            return text_reply, used_tools
        break

    return "", used_tools


def _call_gemini_api(contents: list[dict[str, Any]], settings: Any) -> dict[str, Any]:
    response = requests.post(
        GEMINI_API_URL.format(model=settings.gemini_model),
        headers={"x-goog-api-key": settings.gemini_api_key, "Content-Type": "application/json"},
        json={
            "system_instruction": {
                "parts": [{"text": GEMINI_SYSTEM_INSTRUCTION}],
            },
            "contents": contents,
            "tools": [
                {
                    "function_declarations": chat_tool_service.function_declarations(),
                }
            ],
            "generationConfig": {
                "temperature": 0.35,
                "topP": 0.8,
                "maxOutputTokens": 900,
            },
        },
        timeout=settings.gemini_timeout_seconds,
    )
    response.raise_for_status()
    return response.json()


def _build_gemini_contents(
    *,
    question: str,
    weather_context: str,
    history: list[dict[str, Any]],
    assistant_context: dict[str, Any],
    rag_hits: list[dict[str, Any]],
    heuristic_tool_results: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    contents: list[dict[str, Any]] = []
    for item in history[-CHAT_HISTORY_LIMIT:]:
        role = "model" if str(item.get("role", "")).lower() in {"assistant", "model", "bot"} else "user"
        text = str(item.get("text", "")).strip()
        if not text:
            continue
        contents.append({"role": role, "parts": [{"text": text}]})

    knowledge_context = {
        "retrievedKnowledge": rag_hits,
        "preloadedToolResults": heuristic_tool_results,
        "smartLocationMemory": assistant_context.get("resolvedLocation"),
        "uiLanguage": assistant_context.get("language", "English"),
        "responseLanguageHint": _response_language_hint(question, assistant_context),
        "mapCapabilities": [
            "show_wind_layer",
            "show_rain_layer",
            "show_cloud_layer",
            "show_temperature_layer",
            "highlight_storm",
        ],
    }
    contents.append(
        {
            "role": "user",
            "parts": [
                {
                    "text": (
                        f"Assistant context:\n{json.dumps(knowledge_context, ensure_ascii=True, indent=2)}\n\n"
                        f"Weather context:\n{weather_context}\n\n"
                        f"Current user question:\n{question}"
                    )
                }
            ],
        }
    )
    return contents


def _build_weather_context(
    current_weather: dict[str, Any],
    forecast: dict[str, Any],
    activity_payload: dict[str, Any],
    assistant_context: dict[str, Any],
) -> str:
    daily = forecast.get("daily") or []
    hourly = forecast.get("hourly") or []
    today = daily[0] if daily else {}
    best_activity = activity_payload.get("bestActivity") or {}
    summary_payload = {
        "temperatureC": current_weather.get("tempC") or current_weather.get("temperatureC"),
        "humidity": current_weather.get("humidity"),
        "windKmh": current_weather.get("windKmh"),
        "rainProbability": today.get("rainProbability", 0),
        "uvIndex": today.get("uvIndex", 0),
        "condition": current_weather.get("condition", ""),
    }

    compact_daily = [
        {
            "date": day.get("date"),
            "condition": day.get("condition"),
            "minTemp": day.get("minTemp"),
            "maxTemp": day.get("maxTemp"),
            "rainProbability": day.get("rainProbability"),
            "rainAmount": day.get("rainAmount"),
            "uvIndex": day.get("uvIndex"),
            "windSpeed": day.get("windSpeed"),
        }
        for day in daily[:7]
    ]
    compact_hourly = [
        {
            "time": hour.get("time"),
            "temperature": hour.get("temperature"),
            "rainProbability": hour.get("rainProbability"),
            "windSpeed": hour.get("windSpeed"),
            "humidity": hour.get("humidity"),
            "uvIndex": hour.get("uvIndex"),
            "cloudCover": hour.get("cloudCover"),
        }
        for hour in hourly[:18]
    ]

    context = {
        "currentDate": dt.date.today().isoformat(),
        "units": assistant_context.get("units", "metric"),
        "uiLanguage": assistant_context.get("language", "English"),
        "resolvedLocation": assistant_context.get("resolvedLocation"),
        "currentWeather": current_weather,
        "forecastDaily": compact_daily,
        "forecastHourly": compact_hourly,
        "bestActivity": {
            "activity": best_activity.get("activity"),
            "score": best_activity.get("score"),
            "recommendation": best_activity.get("recommendation"),
        },
        "weatherSummary": generate_weather_summary(summary_payload),
    }
    return json.dumps(context, ensure_ascii=True, indent=2)


def _extract_candidate_content(payload: dict[str, Any]) -> dict[str, Any] | None:
    candidates = payload.get("candidates") or []
    for candidate in candidates:
        content = candidate.get("content") or {}
        if content.get("parts"):
            return content
    return None


def _extract_text_from_content(content: dict[str, Any]) -> str:
    parts = content.get("parts") or []
    chunks = []
    for part in parts:
        text = str(part.get("text", "")).strip()
        if text:
            chunks.append(text)
    return "\n".join(chunks).strip()


def _extract_function_calls(content: dict[str, Any]) -> list[dict[str, Any]]:
    calls = []
    for part in content.get("parts") or []:
        raw_call = part.get("functionCall") or part.get("function_call")
        if not raw_call:
            continue
        name = str(raw_call.get("name", "")).strip()
        if not name:
            continue
        args = raw_call.get("args") or raw_call.get("arguments") or {}
        if isinstance(args, str):
            try:
                args = json.loads(args)
            except json.JSONDecodeError:
                args = {}
        if not isinstance(args, dict):
            args = {}
        calls.append({"name": name, "arguments": args})
    return calls


def _execute_tool_call(call: dict[str, Any], assistant_context: dict[str, Any]) -> dict[str, Any]:
    tool_context = {
        "units": assistant_context.get("units", "metric"),
        "language": assistant_context.get("language", "English"),
    }
    try:
        return chat_tool_service.execute(call["name"], call.get("arguments") or {}, tool_context)
    except Exception as exc:
        return {"tool": call["name"], "error": str(exc)}


def _heuristic_tool_calls(question: str, assistant_context: dict[str, Any]) -> list[dict[str, Any]]:
    text = str(question or "").lower()
    resolved_location = assistant_context.get("resolvedLocation") or {}
    city = str(resolved_location.get("city") or "").strip()
    lat = resolved_location.get("latitude")
    lon = resolved_location.get("longitude")
    calls: list[dict[str, Any]] = []

    if any(token in text for token in ["climate", "trend", "warming", "historical"]) and city:
        calls.append({"name": "getClimateInsights", "arguments": {"city": city}})
    if any(token in text for token in ["hyperlocal", "local prediction", "neighborhood"]) and lat is not None and lon is not None:
        calls.append({"name": "getHyperlocalPrediction", "arguments": {"lat": lat, "lon": lon}})
    if any(token in text for token in ["alert", "warning", "storm", "severe"]) and lat is not None and lon is not None:
        calls.append({"name": "getWeatherAlerts", "arguments": {"lat": lat, "lon": lon}})
    if any(token in text for token in ["tomorrow", "forecast", "rain", "travel", "weekend"]) and city:
        calls.append({"name": "getForecast", "arguments": {"city": city}})
    if any(token in text for token in ["current weather", "right now", "currently", "temperature now"]) and lat is not None and lon is not None:
        calls.append({"name": "getCurrentWeather", "arguments": {"lat": lat, "lon": lon}})

    deduped = []
    seen = set()
    for call in calls:
        key = json.dumps(call, sort_keys=True)
        if key in seen:
            continue
        deduped.append(call)
        seen.add(key)
    return deduped[:3]


def _infer_map_action(question: str, assistant_context: dict[str, Any]) -> dict[str, Any] | None:
    text = str(question or "").lower()
    resolved_location = assistant_context.get("resolvedLocation") or {}
    location_payload = None
    if resolved_location:
        location_payload = {
            "city": resolved_location.get("city"),
            "latitude": resolved_location.get("latitude"),
            "longitude": resolved_location.get("longitude"),
            "label": resolved_location.get("label") or resolved_location.get("city"),
        }

    if "wind map" in text or "wind layer" in text or "show wind" in text:
        return {"type": "show_wind_layer", "location": location_payload}
    if "rain radar" in text or "rain layer" in text or "show rain" in text or "radar map" in text:
        return {"type": "show_rain_layer", "location": location_payload}
    if "cloud layer" in text or "cloud map" in text or "show cloud" in text:
        return {"type": "show_cloud_layer", "location": location_payload}
    if "temperature layer" in text or "heat map" in text or "show temperature" in text:
        return {"type": "show_temperature_layer", "location": location_payload}
    if "highlight storm" in text or "show storms" in text or "storm near" in text:
        return {"type": "highlight_storm", "location": location_payload}
    return None


def _should_use_rag(question: str) -> bool:
    lowered = str(question or "").lower()
    return any(token in lowered for token in CONCEPT_HINTS)


def _fallback_reply(
    question: str,
    current_weather: dict[str, Any],
    forecast: dict[str, Any],
    activity_payload: dict[str, Any],
) -> str:
    text = str(question or "").strip()
    if _is_weather_question(text):
        return _fallback_weather_reply(text, current_weather, forecast, activity_payload)
    return "I cannot use the advanced assistant right now, but I can still help once the AI service is available again. Please try again shortly."


def _is_weather_question(question: str) -> bool:
    lowered = str(question or "").lower()
    return any(token in lowered for token in WEATHER_TOPIC_HINTS)


def _response_language_hint(question: str, assistant_context: dict[str, Any]) -> str:
    text = str(question or "")
    for language, (_label, pattern) in MULTILINGUAL_HINTS.items():
        if re.search(pattern, text):
            return language
    preferred = str(assistant_context.get("language", "")).strip()
    return preferred or "English"


def _dedupe_strings(items: list[str]) -> list[str]:
    output: list[str] = []
    seen = set()
    for item in items:
        clean = str(item or "").strip()
        if not clean or clean in seen:
            continue
        output.append(clean)
        seen.add(clean)
    return output


def _fallback_weather_reply(
    question: str,
    current_weather: dict[str, Any],
    forecast: dict[str, Any],
    activity_payload: dict[str, Any],
) -> str:
    text = question.strip().lower()
    daily = forecast.get("daily") or []
    hourly = forecast.get("hourly") or []

    if not daily:
        return "I cannot retrieve live weather data right now, but once forecast data is available I can answer rain, temperature, alerts, travel, and farming questions more precisely."

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
        level = "very high" if uv >= 8 else "high" if uv >= 6 else "moderate" if uv >= 3 else "low"
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
            return "Weekend forecast is outside the available forecast range."
        highs = [_num(item.get("maxTemp")) for item in weekend_days]
        lows = [_num(item.get("minTemp")) for item in weekend_days]
        max_rain = max(_num(item.get("rainProbability")) for item in weekend_days)
        return (
            f"Weekend temperatures are around {round(min(lows))}-{round(max(highs))}{_temperature_unit(current_weather)}. "
            f"Peak rain chance is about {round(max_rain)}%."
        )

    if _has_any(text, ["outdoor", "activity", "best time", "walk", "run", "jog", "picnic", "travel"]):
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
        parts = [f"Today: {_condition(today)} with {round(_num(today.get('rainProbability')))}% rain chance."]
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
        + " I cannot reach live AI tools right now, but I can still explain forecast basics and weather concepts."
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
    unit = str(current_weather.get("temperatureUnit") or "C").strip()
    return unit or "C"


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

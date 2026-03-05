from __future__ import annotations

from typing import Any


DEFAULT_RULES = {
    "rain_probability": 70.0,
    "temperature_c": 35.0,
    "wind_kmh": 40.0,
    "uv_index": 8.0,
}


def evaluate_alerts(current_weather: dict[str, Any], forecast_daily: list[dict[str, Any]], rules: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    enabled_rules = _normalize_rules(rules)
    alerts: list[dict[str, Any]] = []

    highest_rain = max((float(item.get("rainProbability", 0)) for item in forecast_daily), default=0)
    highest_temp = max((float(item.get("maxTemp", 0)) for item in forecast_daily), default=float(current_weather.get("tempC", 0) or 0))
    highest_wind = max((float(item.get("windSpeed", 0)) for item in forecast_daily), default=float(current_weather.get("windKmh", 0) or 0))
    highest_uv = max((float(item.get("uvIndex", 0)) for item in forecast_daily), default=0)

    if highest_rain > enabled_rules["rain_probability"]:
        alerts.append(_alert("rain_probability", highest_rain, enabled_rules["rain_probability"], "High rain probability expected"))
    if highest_temp > enabled_rules["temperature_c"]:
        alerts.append(_alert("temperature_c", highest_temp, enabled_rules["temperature_c"], "Heat alert"))
    if highest_wind > enabled_rules["wind_kmh"]:
        alerts.append(_alert("wind_kmh", highest_wind, enabled_rules["wind_kmh"], "Strong wind alert"))
    if highest_uv > enabled_rules["uv_index"]:
        alerts.append(_alert("uv_index", highest_uv, enabled_rules["uv_index"], "High UV alert"))

    return alerts


def _normalize_rules(rules: list[dict[str, Any]] | None) -> dict[str, float]:
    output = dict(DEFAULT_RULES)
    if not rules:
        return output
    for rule in rules:
        if not bool(rule.get("enabled", True)):
            continue
        key = str(rule.get("ruleType", "")).strip()
        if key not in output:
            continue
        output[key] = float(rule.get("threshold", output[key]))
    return output


def _alert(rule_type: str, actual: float, threshold: float, title: str) -> dict[str, Any]:
    return {
        "ruleType": rule_type,
        "title": title,
        "actual": round(actual, 1),
        "threshold": round(threshold, 1),
        "severity": "high" if actual > threshold * 1.2 else "medium",
        "message": f"{title}: {round(actual, 1)} exceeded threshold {round(threshold, 1)}.",
    }

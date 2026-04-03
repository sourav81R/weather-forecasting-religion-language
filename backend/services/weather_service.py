from __future__ import annotations

import datetime as dt
import re
from difflib import SequenceMatcher
from typing import Any

import requests

from backend.config import get_settings
from backend.utils.cache import TTLCache

OPENWEATHER_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"
OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
OPEN_METEO_REVERSE_GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/reverse"
OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
PHOTON_SEARCH_URL = "https://photon.komoot.io/api/"
GEOCODING_HEADERS = {"User-Agent": "RegionalWeatherStudio/1.0 (location-resolution)"}

LANGUAGE_CODES = {
    "English": "en",
    "Assamese": "as",
    "Bengali": "bn",
    "Bodo": "brx",
    "Dogri": "doi",
    "Gujarati": "gu",
    "Hindi": "hi",
    "Kannada": "kn",
    "Kashmiri": "ks",
    "Konkani": "gom",
    "Maithili": "mai",
    "Malayalam": "ml",
    "Manipuri": "mni",
    "Marathi": "mr",
    "Nepali": "ne",
    "Odia": "or",
    "Punjabi": "pa",
    "Sanskrit": "sa",
    "Santali": "sat",
    "Sindhi": "sd",
    "Tamil": "ta",
    "Telugu": "te",
    "Urdu": "ur",
}

WMO_TO_CONDITION = {
    0: "Clear",
    1: "Clouds",
    2: "Clouds",
    3: "Clouds",
    45: "Fog",
    48: "Fog",
    51: "Drizzle",
    53: "Drizzle",
    55: "Drizzle",
    56: "Drizzle",
    57: "Drizzle",
    61: "Rain",
    63: "Rain",
    65: "Rain",
    66: "Rain",
    67: "Rain",
    71: "Snow",
    73: "Snow",
    75: "Snow",
    77: "Snow",
    80: "Rain",
    81: "Rain",
    82: "Rain",
    85: "Snow",
    86: "Snow",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Thunderstorm",
}

WEATHER_SYMBOLS = {
    "Thunderstorm": "\u26C8",
    "Drizzle": "\U0001F326",
    "Rain": "\U0001F327",
    "Snow": "\U0001F328",
    "Mist": "\U0001F32B",
    "Smoke": "\U0001F32B",
    "Haze": "\U0001F32B",
    "Dust": "\U0001F32B",
    "Fog": "\U0001F32B",
    "Sand": "\U0001F32B",
    "Ash": "\U0001F32B",
    "Squall": "\U0001F4A8",
    "Tornado": "\U0001F32A",
    "Clear": "\u2600",
    "Clouds": "\u2601",
}


class WeatherService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.cache = TTLCache(ttl_seconds=self.settings.cache_ttl_seconds)

    def candidate_api_keys(self, custom_key: str = "") -> list[tuple[str, str]]:
        candidates: list[tuple[str, str]] = []
        if custom_key.strip():
            candidates.append((custom_key.strip(), "custom"))
        for idx, key in enumerate(self.settings.openweather_keys, start=1):
            if key.strip():
                candidates.append((key.strip(), f"builtin_{idx}"))

        unique: list[tuple[str, str]] = []
        seen = set()
        for key, source in candidates:
            if key in seen:
                continue
            unique.append((key, source))
            seen.add(key)
        return unique

    def geocode_city(self, city: str) -> dict[str, Any]:
        clean_city = city.strip()
        if not clean_city:
            raise ValueError("City is required.")

        coordinates = self._parse_coordinate_query(clean_city)
        if coordinates is not None:
            latitude, longitude = coordinates
            try:
                resolved = self.reverse_geocode(latitude=latitude, longitude=longitude)
                resolved["latitude"] = latitude
                resolved["longitude"] = longitude
                return resolved
            except ValueError:
                return {
                    "city": clean_city,
                    "country": "",
                    "latitude": latitude,
                    "longitude": longitude,
                    "timezone": "auto",
                    "label": f"{latitude:.4f}, {longitude:.4f}",
                    "source": "coordinates",
                }

        cache_key = f"geocode::{clean_city.lower()}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        candidates: list[dict[str, Any]] = []
        errors: list[str] = []
        for loader in (self._search_open_meteo_candidates, self._search_nominatim_candidates, self._search_photon_candidates):
            try:
                candidates.extend(loader(clean_city))
            except ValueError as exc:
                errors.append(str(exc))

        best_match = self._pick_best_location_candidate(clean_city, candidates)
        approximate_match = None if best_match else self._pick_approximate_location_candidate(clean_city, candidates)
        if not best_match:
            if not approximate_match:
                detail = f" {errors[-1]}" if errors else ""
                raise ValueError(f"Unable to locate that place.{detail}".strip())
            best_match = approximate_match

        output = {
            "city": str(best_match.get("city") or clean_city),
            "country": str(best_match.get("country", "")),
            "latitude": float(best_match.get("latitude")),
            "longitude": float(best_match.get("longitude")),
            "timezone": str(best_match.get("timezone", "auto")),
            "label": str(
                self._approximate_location_label(clean_city, best_match)
                if approximate_match
                else best_match.get("label") or best_match.get("city") or clean_city
            ),
            "source": str(best_match.get("source", "geocoder")),
            "approximate": bool(approximate_match),
        }
        self.cache.set(cache_key, output)
        return output

    def reverse_geocode(self, latitude: float, longitude: float) -> dict[str, Any]:
        safe_latitude = max(-90.0, min(90.0, float(latitude)))
        safe_longitude = ((float(longitude) + 180.0) % 360.0) - 180.0

        cache_key = f"reverse-geocode::{safe_latitude:.4f}:{safe_longitude:.4f}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        candidates: list[dict[str, Any]] = []
        errors: list[str] = []
        for loader in (self._reverse_nominatim_candidate, self._reverse_open_meteo_candidate):
            try:
                candidate = loader(safe_latitude, safe_longitude)
            except ValueError as exc:
                errors.append(str(exc))
                continue
            if candidate:
                candidates.append(candidate)

        best_match = self._pick_best_reverse_candidate(candidates)
        if not best_match:
            detail = f" {errors[-1]}" if errors else ""
            raise ValueError(f"Unable to reverse geocode location.{detail}".strip())

        output = {
            "city": str(best_match.get("city") or best_match.get("label") or f"{safe_latitude:.4f}, {safe_longitude:.4f}"),
            "country": str(best_match.get("country", "")),
            "latitude": safe_latitude,
            "longitude": safe_longitude,
            "timezone": str(best_match.get("timezone", "auto")),
            "label": str(best_match.get("label") or best_match.get("city") or f"{safe_latitude:.4f}, {safe_longitude:.4f}"),
            "source": str(best_match.get("source", "reverse-geocoder")),
        }
        self.cache.set(cache_key, output)
        return output

    def fetch_current_by_city(
        self,
        city: str,
        units: str = "metric",
        language: str = "English",
        custom_key: str = "",
    ) -> dict[str, Any]:
        resolved = self.geocode_city(city)
        current = self.fetch_current_by_coords(
            latitude=float(resolved["latitude"]),
            longitude=float(resolved["longitude"]),
            units=units,
            language=language,
            custom_key=custom_key,
            location_override=str(resolved.get("label") or resolved.get("city") or city.strip()),
        )
        if resolved.get("approximate"):
            current["approximateLocation"] = True
        return current

    def fetch_current_by_coords(
        self,
        latitude: float,
        longitude: float,
        units: str = "metric",
        language: str = "English",
        custom_key: str = "",
        location_override: str = "",
    ) -> dict[str, Any]:
        params = {
            "lat": str(latitude),
            "lon": str(longitude),
            "units": "imperial" if units == "imperial" else "metric",
            "lang": LANGUAGE_CODES.get(language, "en"),
        }
        resolved_label = location_override.strip()
        if not resolved_label:
            try:
                resolved_label = str(self.reverse_geocode(latitude=latitude, longitude=longitude).get("label", "")).strip()
            except ValueError:
                resolved_label = ""
        return self._fetch_current(params, units=units, custom_key=custom_key, location_override=resolved_label)

    def fetch_forecast(self, latitude: float, longitude: float, units: str = "metric", days: int = 15) -> dict[str, Any]:
        safe_days = max(1, min(int(days), 16))
        cache_key = f"forecast::{latitude:.4f}:{longitude:.4f}:{units}:{safe_days}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        temperature_unit = "fahrenheit" if units == "imperial" else "celsius"
        wind_speed_unit = "mph" if units == "imperial" else "kmh"
        precipitation_unit = "inch" if units == "imperial" else "mm"

        payload = self._get_json(
            OPEN_METEO_FORECAST_URL,
            {
                "latitude": latitude,
                "longitude": longitude,
                "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max,wind_speed_10m_max",
                "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,uv_index,cloud_cover,precipitation",
                "forecast_days": safe_days,
                "temperature_unit": temperature_unit,
                "wind_speed_unit": wind_speed_unit,
                "precipitation_unit": precipitation_unit,
                "timezone": "auto",
            },
        )

        daily = payload.get("daily") or {}
        hourly = payload.get("hourly") or {}
        output = {
            "units": {
                "temperature": "F" if units == "imperial" else "C",
                "wind": "mph" if units == "imperial" else "km/h",
                "precipitation": "in" if units == "imperial" else "mm",
            },
            "daily": self._normalize_daily(daily),
            "hourly": self._normalize_hourly(hourly),
            "timezone": str(payload.get("timezone", "UTC")),
            "generatedAtUtc": dt.datetime.utcnow().isoformat(timespec="seconds") + "Z",
        }

        self.cache.set(cache_key, output)
        return output

    def fetch_archive(self, latitude: float, longitude: float, start_date: str, end_date: str) -> dict[str, Any]:
        cache_key = f"archive::{latitude:.4f}:{longitude:.4f}:{start_date}:{end_date}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        payload = self._get_json(
            OPEN_METEO_ARCHIVE_URL,
            {
                "latitude": latitude,
                "longitude": longitude,
                "start_date": start_date,
                "end_date": end_date,
                "daily": "temperature_2m_mean,precipitation_sum,wind_speed_10m_max",
                "timezone": "auto",
            },
        )
        self.cache.set(cache_key, payload, ttl_seconds=max(self.settings.cache_ttl_seconds, 3600))
        return payload

    def get_map_layers(self, api_key: str = "") -> dict[str, str]:
        key = api_key.strip() or (self.settings.openweather_keys[0] if self.settings.openweather_keys else "")
        if not key:
            return {}
        return {
            "temperature": f"https://tile.openweathermap.org/map/temp_new/{{z}}/{{x}}/{{y}}.png?appid={key}",
            "rain": f"https://tile.openweathermap.org/map/precipitation_new/{{z}}/{{x}}/{{y}}.png?appid={key}",
            "wind": f"https://tile.openweathermap.org/map/wind_new/{{z}}/{{x}}/{{y}}.png?appid={key}",
            "clouds": f"https://tile.openweathermap.org/map/clouds_new/{{z}}/{{x}}/{{y}}.png?appid={key}",
        }

    def fetch_map_weather_data(self, latitude: float, longitude: float, hour_offset: int = 0) -> dict[str, Any]:
        safe_latitude = max(-90.0, min(90.0, float(latitude)))
        safe_longitude = ((float(longitude) + 180.0) % 360.0) - 180.0
        safe_hour_offset = max(0, min(int(hour_offset), 72))

        cache_key = f"map-weather::{safe_latitude:.3f}:{safe_longitude:.3f}:{safe_hour_offset}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        payload = self._get_json(
            OPEN_METEO_FORECAST_URL,
            {
                "latitude": safe_latitude,
                "longitude": safe_longitude,
                "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation_probability,cloud_cover,precipitation",
                "forecast_days": 4,
                "wind_speed_unit": "kmh",
                "timezone": "UTC",
            },
        )

        hourly = payload.get("hourly") or {}
        times = hourly.get("time") or []
        if not times:
            raise ValueError("Upstream API request failed: missing hourly weather map data.")

        idx = self._nearest_hour_index(times, safe_hour_offset)

        temperature = self._series_value(hourly.get("temperature_2m"), idx)
        humidity = self._series_value(hourly.get("relative_humidity_2m"), idx)
        wind_speed = self._series_value(hourly.get("wind_speed_10m"), idx)
        wind_direction = self._series_value(hourly.get("wind_direction_10m"), idx)
        rain_probability = self._series_value(hourly.get("precipitation_probability"), idx)
        cloud_cover = self._series_value(hourly.get("cloud_cover"), idx)
        precipitation = self._series_value(hourly.get("precipitation"), idx)

        is_storm = bool((wind_speed or 0) > 50 and (rain_probability or 0) > 70)
        if is_storm or (wind_speed or 0) > 65 or (rain_probability or 0) > 85:
            storm_risk = "high"
        elif (wind_speed or 0) > 40 or (rain_probability or 0) > 55:
            storm_risk = "medium"
        else:
            storm_risk = "low"

        output = {
            "latitude": safe_latitude,
            "longitude": safe_longitude,
            "forecastHourOffset": safe_hour_offset,
            "timeUtc": self._to_utc_iso(times[idx]),
            "temperature": temperature,
            "humidity": humidity,
            "windSpeed": wind_speed,
            "windDirection": wind_direction,
            "rainProbability": rain_probability,
            "cloudCoverage": cloud_cover,
            "precipitation": precipitation,
            "stormRisk": storm_risk,
            "isStorm": is_storm,
        }
        self.cache.set(cache_key, output, ttl_seconds=max(120, self.settings.cache_ttl_seconds // 2))
        return output

    def _fetch_current(
        self,
        params: dict[str, Any],
        units: str,
        custom_key: str = "",
        location_override: str = "",
    ) -> dict[str, Any]:
        attempts: list[str] = []
        keys = self.candidate_api_keys(custom_key)
        if not keys:
            raise ValueError("No OpenWeather API keys configured.")

        for key, source in keys:
            with_key = dict(params)
            with_key["appid"] = key
            try:
                response = requests.get(
                    OPENWEATHER_CURRENT_URL,
                    params=with_key,
                    timeout=self.settings.weather_timeout_seconds,
                )
            except requests.RequestException as exc:
                attempts.append(str(exc))
                continue

            payload = response.json() if response.content else {}
            if response.status_code == 200:
                return self._normalize_current(payload, units=units, source=source, location_override=location_override)

            if response.status_code in (401, 429):
                attempts.append(str(payload.get("message", "Unauthorized")))
                continue
            if response.status_code == 404:
                raise ValueError("City not found. Check spelling and try again.")
            raise ValueError(f"Weather API error: {payload.get('message', 'unknown error')}")

        tail = f" Last attempt: {attempts[-1]}" if attempts else ""
        raise ValueError(f"All inbuilt API keys failed.{tail}")

    def _get_json(self, url: str, params: dict[str, Any], headers: dict[str, str] | None = None) -> dict[str, Any]:
        try:
            response = requests.get(url, params=params, headers=headers, timeout=self.settings.weather_timeout_seconds)
            response.raise_for_status()
            return response.json() if response.content else {}
        except requests.RequestException as exc:
            raise ValueError(f"Upstream API request failed: {exc}") from exc

    def _normalize_current(self, payload: dict[str, Any], units: str, source: str, location_override: str = "") -> dict[str, Any]:
        weather = (payload.get("weather") or [{}])[0]
        main = payload.get("main") or {}
        wind = payload.get("wind") or {}
        sys_info = payload.get("sys") or {}
        clouds = payload.get("clouds") or {}
        coord = payload.get("coord") or {}
        timezone_offset = int(payload.get("timezone", 0))

        condition = str(weather.get("main", ""))
        icon_code = str(weather.get("icon", ""))
        is_day = True if icon_code.endswith("d") else False if icon_code.endswith("n") else None
        city = str(payload.get("name", ""))
        country = str(sys_info.get("country", ""))
        location = location_override.strip() or (f"{city}, {country}" if country else city)

        return {
            "location": location,
            "temperature": main.get("temp"),
            "temperatureUnit": "\u00B0F" if units == "imperial" else "\u00B0C",
            "description": weather.get("description", ""),
            "condition": condition,
            "symbol": WEATHER_SYMBOLS.get(condition, "\U0001F324"),
            "iconCode": icon_code,
            "isDay": is_day,
            "feelsLike": main.get("feels_like"),
            "humidity": main.get("humidity"),
            "windSpeed": wind.get("speed"),
            "windUnit": "mph" if units == "imperial" else "m/s",
            "pressure": main.get("pressure"),
            "clouds": clouds.get("all"),
            "sunrise": self._format_local_time(sys_info.get("sunrise"), timezone_offset),
            "sunset": self._format_local_time(sys_info.get("sunset"), timezone_offset),
            "timezoneOffsetSeconds": timezone_offset,
            "source": self._source_label(source),
            "latitude": coord.get("lat"),
            "longitude": coord.get("lon"),
            "updatedAtUtc": dt.datetime.utcnow().isoformat(timespec="seconds") + "Z",
            "tempC": self._temperature_to_celsius(main.get("temp"), units),
            "windKmh": self._wind_to_kmh(wind.get("speed"), units),
        }

    @staticmethod
    def _temperature_to_celsius(value: Any, units: str) -> float | None:
        if value is None:
            return None
        temp = float(value)
        if units == "imperial":
            return (temp - 32) * 5 / 9
        return temp

    @staticmethod
    def _wind_to_kmh(value: Any, units: str) -> float | None:
        if value is None:
            return None
        speed = float(value)
        if units == "imperial":
            return speed * 1.60934
        return speed * 3.6

    @staticmethod
    def _source_label(source: str) -> str:
        if source == "custom":
            return "custom key"
        if source.startswith("builtin_"):
            return f"inbuilt key #{source.split('_')[-1]}"
        return source

    @staticmethod
    def _format_local_time(unix_ts: int | None, timezone_offset: int) -> str:
        if not unix_ts:
            return "--"
        local_timestamp = int(unix_ts) + int(timezone_offset)
        return dt.datetime.utcfromtimestamp(local_timestamp).strftime("%H:%M")

    @staticmethod
    def _series_value(series: Any, index: int) -> float | None:
        if not isinstance(series, list) or not series:
            return None
        safe_index = max(0, min(index, len(series) - 1))
        value = series[safe_index]
        if value is None:
            return None
        return float(value)

    @staticmethod
    def _to_utc_iso(value: Any) -> str:
        text = str(value or "").strip()
        if not text:
            return dt.datetime.utcnow().isoformat(timespec="seconds") + "Z"
        parsed = WeatherService._parse_open_meteo_time(text)
        return parsed.isoformat(timespec="seconds") + "Z"

    @staticmethod
    def _nearest_hour_index(times: list[Any], hour_offset: int) -> int:
        if not times:
            return 0
        now_hour = dt.datetime.utcnow().replace(minute=0, second=0, microsecond=0)
        target = now_hour + dt.timedelta(hours=max(0, hour_offset))
        nearest_idx = 0
        nearest_delta = None
        for idx, item in enumerate(times):
            parsed = WeatherService._parse_open_meteo_time(str(item))
            delta = abs((parsed - target).total_seconds())
            if nearest_delta is None or delta < nearest_delta:
                nearest_delta = delta
                nearest_idx = idx
        return nearest_idx

    @staticmethod
    def _parse_open_meteo_time(value: str) -> dt.datetime:
        text = (value or "").strip()
        if not text:
            return dt.datetime.utcnow().replace(minute=0, second=0, microsecond=0)
        parsed = dt.datetime.fromisoformat(text.replace("Z", "+00:00"))
        if parsed.tzinfo is not None:
            return parsed.astimezone(dt.timezone.utc).replace(tzinfo=None)
        return parsed

    @staticmethod
    def _normalize_daily(daily: dict[str, Any]) -> list[dict[str, Any]]:
        time = daily.get("time") or []
        max_temp = daily.get("temperature_2m_max") or []
        min_temp = daily.get("temperature_2m_min") or []
        rain_prob = daily.get("precipitation_probability_max") or []
        rain_sum = daily.get("precipitation_sum") or []
        uv_index = daily.get("uv_index_max") or []
        wind_max = daily.get("wind_speed_10m_max") or []
        codes = daily.get("weather_code") or []

        count = min(len(time), len(max_temp), len(min_temp), len(rain_prob), len(rain_sum), len(uv_index), len(wind_max), len(codes))
        output: list[dict[str, Any]] = []
        for idx in range(count):
            code = int(codes[idx])
            output.append(
                {
                    "date": time[idx],
                    "maxTemp": float(max_temp[idx]),
                    "minTemp": float(min_temp[idx]),
                    "rainProbability": float(rain_prob[idx] or 0),
                    "rainAmount": float(rain_sum[idx] or 0),
                    "uvIndex": float(uv_index[idx] or 0),
                    "windSpeed": float(wind_max[idx] or 0),
                    "weatherCode": code,
                    "condition": WMO_TO_CONDITION.get(code, "Clouds"),
                }
            )
        return output

    @staticmethod
    def _normalize_hourly(hourly: dict[str, Any]) -> list[dict[str, Any]]:
        timestamps = hourly.get("time") or []
        temp = hourly.get("temperature_2m") or []
        humidity = hourly.get("relative_humidity_2m") or []
        rain_prob = hourly.get("precipitation_probability") or []
        wind = hourly.get("wind_speed_10m") or []
        uv = hourly.get("uv_index") or []
        cloud_cover = hourly.get("cloud_cover") or []
        precipitation = hourly.get("precipitation") or []

        count = min(
            len(timestamps),
            len(temp),
            len(humidity),
            len(rain_prob),
            len(wind),
            len(uv),
            len(cloud_cover),
            len(precipitation),
        )
        output: list[dict[str, Any]] = []
        for idx in range(count):
            output.append(
                {
                    "time": timestamps[idx],
                    "temperature": float(temp[idx]),
                    "humidity": float(humidity[idx]),
                    "rainProbability": float(rain_prob[idx] or 0),
                    "windSpeed": float(wind[idx] or 0),
                    "uvIndex": float(uv[idx] or 0),
                    "cloudCover": float(cloud_cover[idx] or 0),
                    "precipitation": float(precipitation[idx] or 0),
                }
            )
        return output

    @staticmethod
    def _parse_coordinate_query(text: str) -> tuple[float, float] | None:
        normalized = str(text or "").strip()
        if not normalized:
            return None
        match = re.fullmatch(r"(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)", normalized)
        if not match:
            return None
        latitude = float(match.group(1))
        longitude = float(match.group(2))
        if not (-90.0 <= latitude <= 90.0 and -180.0 <= longitude <= 180.0):
            return None
        return latitude, longitude

    def _search_open_meteo_candidates(self, query: str) -> list[dict[str, Any]]:
        candidates = []
        for variant in self._query_variants(query):
            payload = self._get_json(
                OPEN_METEO_GEOCODE_URL,
                {
                    "name": variant,
                    "count": 10,
                    "language": "en",
                    "format": "json",
                },
            )
            for result in payload.get("results") or []:
                try:
                    candidates.append(self._normalize_open_meteo_candidate(result))
                except (TypeError, ValueError):
                    continue
        return candidates

    def _search_nominatim_candidates(self, query: str) -> list[dict[str, Any]]:
        candidates = []
        for variant in self._query_variants(query):
            payload = self._get_json(
                NOMINATIM_SEARCH_URL,
                {
                    "q": variant,
                    "format": "jsonv2",
                    "limit": 10,
                    "addressdetails": 1,
                },
                headers=GEOCODING_HEADERS,
            )
            if not isinstance(payload, list):
                raise ValueError("Unexpected geocoder payload.")
            for result in payload:
                try:
                    candidates.append(self._normalize_nominatim_candidate(result))
                except (TypeError, ValueError):
                    continue
        return candidates

    def _search_photon_candidates(self, query: str) -> list[dict[str, Any]]:
        candidates = []
        for variant in self._query_variants(query):
            payload = self._get_json(
                PHOTON_SEARCH_URL,
                {
                    "q": variant,
                    "limit": 10,
                },
                headers=GEOCODING_HEADERS,
            )
            for result in payload.get("features") or []:
                try:
                    candidates.append(self._normalize_photon_candidate(result))
                except (TypeError, ValueError):
                    continue
        return candidates

    def _reverse_open_meteo_candidate(self, latitude: float, longitude: float) -> dict[str, Any]:
        payload = self._get_json(
            OPEN_METEO_REVERSE_GEOCODE_URL,
            {
                "latitude": latitude,
                "longitude": longitude,
                "count": 5,
                "language": "en",
                "format": "json",
            },
        )
        for result in payload.get("results") or []:
            try:
                return self._normalize_open_meteo_candidate(result)
            except (TypeError, ValueError):
                continue
        raise ValueError("Reverse geocoder returned no results.")

    def _reverse_nominatim_candidate(self, latitude: float, longitude: float) -> dict[str, Any]:
        payload = self._get_json(
            NOMINATIM_REVERSE_URL,
            {
                "lat": latitude,
                "lon": longitude,
                "format": "jsonv2",
                "zoom": 18,
                "addressdetails": 1,
            },
            headers=GEOCODING_HEADERS,
        )
        return self._normalize_nominatim_candidate(payload)

    def _pick_best_location_candidate(self, query: str, candidates: list[dict[str, Any]]) -> dict[str, Any] | None:
        unique_candidates = self._dedupe_location_candidates(candidates)
        if not unique_candidates:
            return None
        scored = sorted(unique_candidates, key=lambda item: self._score_location_candidate(query, item), reverse=True)
        for candidate in scored:
            if self._is_acceptable_location_candidate(query, candidate):
                return candidate
        return None

    def _pick_approximate_location_candidate(self, query: str, candidates: list[dict[str, Any]]) -> dict[str, Any] | None:
        unique_candidates = self._dedupe_location_candidates(candidates)
        if not unique_candidates:
            return None
        scored = sorted(unique_candidates, key=lambda item: self._score_location_candidate(query, item), reverse=True)
        for candidate in scored:
            if self._is_acceptable_approximate_candidate(query, candidate):
                return candidate
        return None

    @staticmethod
    def _pick_best_reverse_candidate(candidates: list[dict[str, Any]]) -> dict[str, Any] | None:
        if not candidates:
            return None
        specificity = {
            "hamlet": 5,
            "isolated_dwelling": 5,
            "neighbourhood": 4,
            "suburb": 4,
            "quarter": 4,
            "village": 4,
            "town": 3,
            "municipality": 3,
            "city": 2,
            "county": 1,
            "administrative": 0,
        }
        return max(
            candidates,
            key=lambda item: (
                specificity.get(str(item.get("placeType", "")).lower(), 0),
                float(item.get("importance") or 0),
                len(str(item.get("label") or "")),
            ),
        )

    @classmethod
    def _score_location_candidate(cls, query: str, candidate: dict[str, Any]) -> float:
        query_tokens = set(cls._place_tokens(query))
        primary_query = cls._primary_place_fragment(query)
        context_fragments = cls._context_place_fragments(query)
        name = str(candidate.get("city") or "")
        label = str(candidate.get("label") or "")
        name_tokens = set(cls._place_tokens(name))
        label_tokens = set(cls._place_tokens(label))
        all_tokens = name_tokens | label_tokens
        query_text = cls._normalize_place_text(query)
        name_text = cls._normalize_place_text(name)
        label_text = cls._normalize_place_text(label)

        score = 0.0
        if query_text and query_text == name_text:
            score += 120
        if query_text and query_text == label_text:
            score += 90
        if query_text and query_text in label_text:
            score += 40
        if query_tokens:
            score += len(query_tokens & all_tokens) * 16
            if query_tokens.issubset(all_tokens):
                score += 24
        primary_similarity = max(
            cls._text_similarity(primary_query, name),
            cls._text_similarity(primary_query, label),
        )
        score += primary_similarity * 55
        if primary_query and len(cls._normalize_place_text(primary_query)) >= 5 and primary_similarity < 0.34:
            score -= 34
        if context_fragments:
            context_score = 0.0
            matched_fragments = 0
            for fragment in context_fragments:
                fragment_similarity = max(
                    cls._text_similarity(fragment, label),
                    cls._fragment_token_overlap(fragment, label),
                )
                if fragment_similarity >= 0.6:
                    matched_fragments += 1
                    context_score += fragment_similarity * 28
                elif fragment_similarity >= 0.34:
                    context_score += fragment_similarity * 10
                else:
                    context_score -= 26
            score += context_score
            if matched_fragments == 0:
                score -= 70
        score += min(float(candidate.get("importance") or 0) * 20, 12)
        score += min(float(candidate.get("population") or 0) / 250000.0, 8)

        place_type = str(candidate.get("placeType", "")).lower()
        if place_type in {"village", "hamlet", "town", "municipality", "suburb"}:
            score += 4
        if candidate.get("source") == "open-meteo":
            score += 2
        if str(candidate.get("category", "")).lower() in {"railway", "amenity", "shop", "tourism", "building", "highway"}:
            score -= 8
        return score

    @classmethod
    def _is_acceptable_location_candidate(cls, query: str, candidate: dict[str, Any]) -> bool:
        primary_query = cls._primary_place_fragment(query)
        context_fragments = cls._context_place_fragments(query)
        label = str(candidate.get("label") or "")
        name = str(candidate.get("city") or "")
        primary_similarity = max(
            cls._text_similarity(primary_query, name),
            cls._text_similarity(primary_query, label),
            cls._fragment_token_overlap(primary_query, label),
        )
        if len(cls._normalize_place_text(primary_query)) >= 5 and primary_similarity < 0.45:
            return False

        if context_fragments:
            matched_context = any(
                max(
                    cls._text_similarity(fragment, label),
                    cls._fragment_token_overlap(fragment, label),
                )
                >= 0.6
                for fragment in context_fragments
            )
            if not matched_context:
                return False

        broad_place_types = {"state", "administrative", "county", "district", "region", "province"}
        broad_categories = {"boundary", "place"}
        if (
            str(candidate.get("placeType", "")).lower() in broad_place_types
            or str(candidate.get("category", "")).lower() in broad_categories
        ) and primary_similarity < 0.72:
            return False

        return True

    @classmethod
    def _is_acceptable_approximate_candidate(cls, query: str, candidate: dict[str, Any]) -> bool:
        context_fragments = cls._context_place_fragments(query)
        if not context_fragments:
            return False

        place_type = str(candidate.get("placeType", "")).lower()
        category = str(candidate.get("category", "")).lower()
        if place_type not in {"county", "district", "administrative", "municipality", "suburb", "city"} and category not in {"boundary", "place"}:
            return False
        if place_type in {"state", "province", "region"}:
            return False

        label = str(candidate.get("label") or "")
        matched_fragments = 0
        for fragment in context_fragments:
            similarity = max(
                cls._text_similarity(fragment, label),
                cls._fragment_token_overlap(fragment, label),
            )
            if similarity >= 0.6:
                matched_fragments += 1
        return matched_fragments >= 1

    @classmethod
    def _approximate_location_label(cls, query: str, candidate: dict[str, Any]) -> str:
        primary_query = cls._primary_place_fragment(query)
        context = str(candidate.get("label") or candidate.get("city") or "").strip()
        if not context:
            return f"{primary_query} (approx.)"
        return f"{primary_query}, near {context}"

    @staticmethod
    def _dedupe_location_candidates(candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
        unique: list[dict[str, Any]] = []
        seen: set[tuple[float, float, str]] = set()
        for candidate in candidates:
            try:
                key = (
                    round(float(candidate.get("latitude")), 4),
                    round(float(candidate.get("longitude")), 4),
                    str(candidate.get("city") or "").strip().lower(),
                )
            except (TypeError, ValueError):
                continue
            if key in seen:
                continue
            seen.add(key)
            unique.append(candidate)
        return unique

    @staticmethod
    def _normalize_open_meteo_candidate(result: dict[str, Any]) -> dict[str, Any]:
        city = str(result.get("name") or "").strip()
        if not city:
            raise ValueError("Missing location name.")
        admin1 = str(result.get("admin1") or "").strip()
        admin2 = str(result.get("admin2") or "").strip()
        country = str(result.get("country") or result.get("country_code") or "").strip()
        label = WeatherService._compose_location_label(city, admin2, admin1, country)
        return {
            "city": city,
            "country": country,
            "latitude": float(result.get("latitude")),
            "longitude": float(result.get("longitude")),
            "timezone": str(result.get("timezone") or "auto"),
            "label": label,
            "source": "open-meteo",
            "population": float(result.get("population") or 0),
            "importance": 0.55,
            "placeType": str(result.get("feature_code") or "").strip(),
            "category": "place",
        }

    @staticmethod
    def _normalize_nominatim_candidate(result: dict[str, Any]) -> dict[str, Any]:
        address = result.get("address") if isinstance(result.get("address"), dict) else {}
        city = str(
            result.get("name")
            or address.get("village")
            or address.get("town")
            or address.get("city")
            or address.get("municipality")
            or address.get("county")
            or address.get("state_district")
            or address.get("suburb")
            or address.get("hamlet")
            or ""
        ).strip()
        if not city:
            display_name = str(result.get("display_name") or "").strip()
            city = display_name.split(",")[0].strip() if display_name else ""
        if not city:
            raise ValueError("Missing location name.")
        admin1 = str(address.get("state") or "").strip()
        admin2 = str(address.get("county") or address.get("state_district") or address.get("district") or "").strip()
        country = str(address.get("country") or "").strip()
        label = WeatherService._compose_location_label(city, admin2, admin1, country)
        return {
            "city": city,
            "country": country,
            "latitude": float(result.get("lat")),
            "longitude": float(result.get("lon")),
            "timezone": "auto",
            "label": label,
            "source": "nominatim",
            "population": 0.0,
            "importance": float(result.get("importance") or 0),
            "placeType": str(result.get("type") or "").strip(),
            "category": str(result.get("category") or "").strip(),
        }

    @staticmethod
    def _normalize_photon_candidate(result: dict[str, Any]) -> dict[str, Any]:
        properties = result.get("properties") if isinstance(result.get("properties"), dict) else {}
        geometry = result.get("geometry") if isinstance(result.get("geometry"), dict) else {}
        coordinates = geometry.get("coordinates") if isinstance(geometry.get("coordinates"), list) else []
        if len(coordinates) < 2:
            raise ValueError("Missing coordinates.")
        city = str(
            properties.get("name")
            or properties.get("city")
            or properties.get("county")
            or ""
        ).strip()
        if not city:
            raise ValueError("Missing location name.")
        county = str(properties.get("county") or properties.get("district") or properties.get("city") or "").strip()
        state = str(properties.get("state") or "").strip()
        country = str(properties.get("country") or properties.get("countrycode") or "").strip()
        label = WeatherService._compose_location_label(city, county, state, country)
        return {
            "city": city,
            "country": country,
            "latitude": float(coordinates[1]),
            "longitude": float(coordinates[0]),
            "timezone": "auto",
            "label": label,
            "source": "photon",
            "population": 0.0,
            "importance": 0.35,
            "placeType": str(properties.get("osm_value") or properties.get("type") or "").strip(),
            "category": str(properties.get("osm_key") or properties.get("type") or "").strip(),
        }

    @staticmethod
    def _compose_location_label(*parts: str) -> str:
        compact = []
        seen = set()
        for raw in parts:
            value = str(raw or "").strip()
            if not value:
                continue
            lowered = value.lower()
            if lowered in seen:
                continue
            seen.add(lowered)
            compact.append(value)
        return ", ".join(compact)

    @staticmethod
    def _normalize_place_text(value: str) -> str:
        return re.sub(r"[^a-z0-9]+", " ", str(value or "").strip().lower()).strip()

    @classmethod
    def _place_tokens(cls, value: str) -> list[str]:
        return [token for token in cls._normalize_place_text(value).split() if token]

    @staticmethod
    def _query_variants(query: str) -> list[str]:
        parts = [part.strip() for part in str(query or "").split(",") if part.strip()]
        variants = [str(query or "").strip()]
        if parts:
            variants.append(" ".join(parts))
            variants.append(parts[0])
        if len(parts) >= 2:
            variants.append(f"{parts[0]} {parts[-1]}")

        unique: list[str] = []
        seen = set()
        for variant in variants:
            clean = re.sub(r"\s+", " ", variant).strip()
            lowered = clean.lower()
            if not clean or lowered in seen:
                continue
            seen.add(lowered)
            unique.append(clean)
        return unique

    @staticmethod
    def _primary_place_fragment(query: str) -> str:
        parts = [part.strip() for part in str(query or "").split(",") if part.strip()]
        return parts[0] if parts else str(query or "").strip()

    @classmethod
    def _text_similarity(cls, left: str, right: str) -> float:
        a = cls._normalize_place_text(left).replace(" ", "")
        b = cls._normalize_place_text(right).replace(" ", "")
        if not a or not b:
            return 0.0
        return SequenceMatcher(None, a, b).ratio()

    @staticmethod
    def _context_place_fragments(query: str) -> list[str]:
        return [part.strip() for part in str(query or "").split(",")[1:] if part.strip()]

    @classmethod
    def _fragment_token_overlap(cls, left: str, right: str) -> float:
        left_tokens = set(cls._place_tokens(left))
        right_tokens = set(cls._place_tokens(right))
        if not left_tokens or not right_tokens:
            return 0.0
        overlap = len(left_tokens & right_tokens)
        return overlap / max(len(left_tokens), 1)


weather_service = WeatherService()

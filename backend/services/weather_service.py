from __future__ import annotations

import datetime as dt
from typing import Any

import requests

from backend.config import get_settings
from backend.utils.cache import TTLCache

OPENWEATHER_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"
OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

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

        cache_key = f"geocode::{clean_city.lower()}"
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        payload = self._get_json(
            OPEN_METEO_GEOCODE_URL,
            {
                "name": clean_city,
                "count": 1,
                "language": "en",
                "format": "json",
            },
        )
        result = (payload.get("results") or [None])[0]
        if not result:
            raise ValueError("Unable to geocode city.")

        output = {
            "city": str(result.get("name", clean_city)),
            "country": str(result.get("country", "")),
            "latitude": float(result.get("latitude")),
            "longitude": float(result.get("longitude")),
            "timezone": str(result.get("timezone", "auto")),
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
        params = {
            "q": city.strip(),
            "units": "imperial" if units == "imperial" else "metric",
            "lang": LANGUAGE_CODES.get(language, "en"),
        }
        return self._fetch_current(params, units=units, custom_key=custom_key)

    def fetch_current_by_coords(
        self,
        latitude: float,
        longitude: float,
        units: str = "metric",
        language: str = "English",
        custom_key: str = "",
    ) -> dict[str, Any]:
        params = {
            "lat": str(latitude),
            "lon": str(longitude),
            "units": "imperial" if units == "imperial" else "metric",
            "lang": LANGUAGE_CODES.get(language, "en"),
        }
        return self._fetch_current(params, units=units, custom_key=custom_key)

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

    def _fetch_current(self, params: dict[str, Any], units: str, custom_key: str = "") -> dict[str, Any]:
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
                return self._normalize_current(payload, units=units, source=source)

            if response.status_code in (401, 429):
                attempts.append(str(payload.get("message", "Unauthorized")))
                continue
            if response.status_code == 404:
                raise ValueError("City not found. Check spelling and try again.")
            raise ValueError(f"Weather API error: {payload.get('message', 'unknown error')}")

        tail = f" Last attempt: {attempts[-1]}" if attempts else ""
        raise ValueError(f"All inbuilt API keys failed.{tail}")

    def _get_json(self, url: str, params: dict[str, Any]) -> dict[str, Any]:
        try:
            response = requests.get(url, params=params, timeout=self.settings.weather_timeout_seconds)
            response.raise_for_status()
            return response.json() if response.content else {}
        except requests.RequestException as exc:
            raise ValueError(f"Upstream API request failed: {exc}") from exc

    def _normalize_current(self, payload: dict[str, Any], units: str, source: str) -> dict[str, Any]:
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
        location = f"{city}, {country}" if country else city

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


weather_service = WeatherService()

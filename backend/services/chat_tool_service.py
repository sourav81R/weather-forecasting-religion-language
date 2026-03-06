from __future__ import annotations

import datetime as dt
from typing import Any

from backend.services.activity_service import activity_scores
from backend.services.alert_service import evaluate_alerts
from backend.services.climate_service import climate_insights_from_archive
from backend.services.weather_service import weather_service


class ChatToolService:
    def function_declarations(self) -> list[dict[str, Any]]:
        return [
            {
                "name": "getCurrentWeather",
                "description": "Get live current weather by latitude and longitude.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "lat": {"type": "number", "description": "Latitude"},
                        "lon": {"type": "number", "description": "Longitude"},
                    },
                    "required": ["lat", "lon"],
                },
            },
            {
                "name": "getForecast",
                "description": "Get a city forecast with daily and hourly weather data.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string", "description": "City name such as Kolkata or Mumbai"},
                    },
                    "required": ["city"],
                },
            },
            {
                "name": "getHyperlocalPrediction",
                "description": "Get hyperlocal AI weather prediction for coordinates.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "lat": {"type": "number", "description": "Latitude"},
                        "lon": {"type": "number", "description": "Longitude"},
                    },
                    "required": ["lat", "lon"],
                },
            },
            {
                "name": "getWeatherAlerts",
                "description": "Get weather alerts and risk signals for coordinates.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "lat": {"type": "number", "description": "Latitude"},
                        "lon": {"type": "number", "description": "Longitude"},
                    },
                    "required": ["lat", "lon"],
                },
            },
            {
                "name": "getClimateInsights",
                "description": "Get climate trend insights for a city.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string", "description": "City name"},
                    },
                    "required": ["city"],
                },
            },
        ]

    def execute(self, name: str, arguments: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        clean_name = str(name or "").strip()
        args = arguments if isinstance(arguments, dict) else {}

        if clean_name == "getCurrentWeather":
            return self.get_current_weather(float(args.get("lat")), float(args.get("lon")), context=context)
        if clean_name == "getForecast":
            return self.get_forecast(str(args.get("city", "")), context=context)
        if clean_name == "getHyperlocalPrediction":
            return self.get_hyperlocal_prediction(float(args.get("lat")), float(args.get("lon")), context=context)
        if clean_name == "getWeatherAlerts":
            return self.get_weather_alerts(float(args.get("lat")), float(args.get("lon")), context=context)
        if clean_name == "getClimateInsights":
            return self.get_climate_insights(str(args.get("city", "")), context=context)
        raise ValueError(f"Unsupported tool: {clean_name}")

    def get_current_weather(self, lat: float, lon: float, context: dict[str, Any]) -> dict[str, Any]:
        current = weather_service.fetch_current_by_coords(
            latitude=lat,
            longitude=lon,
            units=self._units(context),
            language=self._language(context),
        )
        return {
            "tool": "getCurrentWeather",
            "location": current.get("location"),
            "coordinates": {"lat": float(current.get("latitude") or lat), "lon": float(current.get("longitude") or lon)},
            "current": current,
        }

    def get_forecast(self, city: str, context: dict[str, Any]) -> dict[str, Any]:
        geo = weather_service.geocode_city(city)
        forecast = weather_service.fetch_forecast(
            latitude=float(geo["latitude"]),
            longitude=float(geo["longitude"]),
            units=self._units(context),
            days=15,
        )
        current = weather_service.fetch_current_by_city(
            city=str(geo["city"]),
            units=self._units(context),
            language=self._language(context),
        )
        return {
            "tool": "getForecast",
            "city": geo["city"],
            "coordinates": {"lat": float(geo["latitude"]), "lon": float(geo["longitude"])},
            "current": current,
            "forecast": forecast,
        }

    def get_hyperlocal_prediction(self, lat: float, lon: float, context: dict[str, Any]) -> dict[str, Any]:
        from backend.services.hyperlocal_prediction_service import hyperlocal_prediction_service

        prediction = hyperlocal_prediction_service.predict(latitude=lat, longitude=lon, sky_condition="clear_sky")
        return {
            "tool": "getHyperlocalPrediction",
            "coordinates": {"lat": float(lat), "lon": float(lon)},
            "prediction": prediction,
        }

    def get_weather_alerts(self, lat: float, lon: float, context: dict[str, Any]) -> dict[str, Any]:
        current = weather_service.fetch_current_by_coords(
            latitude=lat,
            longitude=lon,
            units=self._units(context),
            language=self._language(context),
        )
        forecast = weather_service.fetch_forecast(
            latitude=float(current["latitude"]),
            longitude=float(current["longitude"]),
            units=self._units(context),
            days=5,
        )
        alerts = evaluate_alerts(current, forecast.get("daily") or [], None)
        today = (forecast.get("daily") or [{}])[0]
        activity = activity_scores(
            {
                "temperatureC": current.get("tempC"),
                "humidity": current.get("humidity"),
                "uvIndex": today.get("uvIndex", 0),
                "windKmh": current.get("windKmh"),
                "rainProbability": today.get("rainProbability", 0),
            }
        )
        return {
            "tool": "getWeatherAlerts",
            "location": current.get("location"),
            "coordinates": {"lat": float(current["latitude"]), "lon": float(current["longitude"])},
            "alerts": alerts,
            "bestActivity": activity.get("bestActivity"),
        }

    def get_climate_insights(self, city: str, context: dict[str, Any]) -> dict[str, Any]:
        geo = weather_service.geocode_city(city)
        end_date = dt.date.today()
        start_date = end_date - dt.timedelta(days=90)
        archive = weather_service.fetch_archive(
            latitude=float(geo["latitude"]),
            longitude=float(geo["longitude"]),
            start_date=start_date.isoformat(),
            end_date=end_date.isoformat(),
        )
        return {
            "tool": "getClimateInsights",
            "city": geo["city"],
            "coordinates": {"lat": float(geo["latitude"]), "lon": float(geo["longitude"])},
            "insights": climate_insights_from_archive(archive),
        }

    @staticmethod
    def _units(context: dict[str, Any]) -> str:
        return "imperial" if str(context.get("units", "metric")) == "imperial" else "metric"

    @staticmethod
    def _language(context: dict[str, Any]) -> str:
        return str(context.get("language", "English") or "English")


chat_tool_service = ChatToolService()

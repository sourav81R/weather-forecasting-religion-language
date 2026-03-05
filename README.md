# Regional Weather Studio - AI Weather Intelligence Platform

Regional Weather Studio is now an advanced weather intelligence platform built with a modular Flask backend and a SaaS-style frontend.

## New Architecture

```text
weather-studio/
  backend/
    app.py
    config.py
    routes/
      auth_routes.py
      weather_routes.py
      intelligence_routes.py
    services/
      weather_service.py
      analytics_service.py
      ai_service.py
      alert_service.py
      travel_service.py
      agriculture_service.py
      activity_service.py
      chatbot_service.py
      climate_service.py
      email_service.py
    models/
      db.py
      user.py
    utils/
      cache.py
  frontend/
    index.html
    css/app.css
    js/app.js
    components/
    manifest.json
    service-worker.js
```

Compatibility wrappers are kept at root (`app.py`, `main.py`, `index.html`, `templates/index.html`, `static/`).

## Platform Modules

- Dashboard: live current weather cards and operational metrics.
- Forecast: 15-day daily forecast + best outdoor window from hourly scoring.
- Analytics: Chart.js visualizations for temperature, rain, wind, humidity, and UV.
- Maps: Leaflet map with OpenWeather temperature/rain/wind/cloud layers and click-to-fetch weather.
- Alerts: rule-based alerts with browser notifications and optional SMTP email dispatch.
- AI Insights: natural-language weather summary from weather factors.
- Travel Planner: destination/date scoring with best travel-day recommendations.
- Agriculture Advisor: crop-specific irrigation, planting window, rain and frost advisories.
- Activity Engine: running/cycling/trekking/photography/beach scoring.
- Chatbot: forecast-aware weather Q&A (rain, weekend heat, outdoor timing).
- Climate Insights: historical trend summary from Open-Meteo archive data.
- User Accounts: signup/login/logout, saved cities, settings, and alert thresholds using Flask-Login + SQLite.
- PWA: installable manifest + service worker offline caching.

## Backend API Overview

- `/api/weather`, `/api/weather/coords`, `/api/forecast`, `/api/dashboard`, `/api/map/layers`
- `/api/insights`, `/api/analytics`, `/api/alerts/evaluate`
- `/api/travel-planner`, `/api/agriculture-advisor`, `/api/activity-recommendations`
- `/api/chatbot`, `/api/climate-insights`, `/api/platform-bundle`
- `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- `/api/user/settings`, `/api/user/cities`, `/api/user/alert-rules`

## Run

```bash
pip install -r requirements.txt
python main.py
```

Open `http://127.0.0.1:5000`.

## Configuration

Optional environment variables:

- `OPENWEATHER_API_KEYS` (comma-separated)
- `OPENWEATHER_API_KEY` (single key)
- `SECRET_KEY`
- `DATABASE_PATH`
- `CACHE_TTL_SECONDS`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_USE_TLS`

## Notes

- Backend includes in-memory API caching and API key failover.
- Frontend includes localStorage caching and location fallback chain (geolocation -> cached coords -> IP providers).
- Legacy Tkinter/Kivy scripts are unchanged and remain for historical reference.

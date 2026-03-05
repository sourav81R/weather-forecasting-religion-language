# Regional Weather Studio

Regional Weather Studio is a Flask + JavaScript weather intelligence app with:
- live weather and 15-day forecast
- analytics charts
- machine-learning next-day weather prediction
- sky image weather detection (cloud classification from uploaded photos)
- alert evaluation + optional email
- travel and agriculture decision tools
- rule-based weather chatbot
- account/login support with SQLite persistence
- installable PWA behavior

## Current Runtime Modes

The frontend runs in one of two modes:

1. Backend mode (full platform)
- Uses Flask API endpoints under `/api/*`.
- Enables auth, saved settings/cities, server-side planners, and climate insights.

2. Static mode (automatic fallback)
- Activates when backend config/API cannot be reached.
- Uses OpenWeather/Open-Meteo directly from the browser.
- Disables server-backed auth persistence and email sending.

You can see current mode in the status text in the UI.

## Tech Stack

- Backend: Python, Flask, Flask-Login, SQLite, requests
- ML: pandas, numpy, scikit-learn, joblib
- Vision ML: OpenCV, TensorFlow/Keras
- Frontend: vanilla HTML/CSS/JS, Chart.js
- Weather providers:
  - OpenWeather (current conditions, map tiles)
  - Open-Meteo (forecast, geocoding, archive climate series)
- PWA: web manifest + service worker

## Project Layout

Active app code:

```text
backend/
  app.py
  config.py
  routes/
    weather_routes.py
    intelligence_routes.py
    auth_routes.py
    ml_routes.py
    vision_routes.py
  services/
    weather_service.py
    analytics_service.py
    ai_service.py
    alert_service.py
    activity_service.py
    travel_service.py
    agriculture_service.py
    chatbot_service.py
    climate_service.py
    email_service.py
    ml_prediction_service.py
    sky_image_service.py
  train_weather_model.py
  train_sky_model.py
  models/
    db.py
    user.py
  utils/
    cache.py

frontend/
  index.html
  css/app.css
  js/app.js
  manifest.json
  service-worker.js
  components/
```

Compatibility wrappers/mirrors:
- `main.py`, `app.py` (entry compatibility)
- `index.html`, `templates/index.html`, `static/` (legacy mirror assets)

Legacy/archived experiments (not part of the active web app):
- `weatherB/`, `rgh/`, `19.03/`, `main1.py`, `tathu.py`, `weather.kv`

## Quick Start

### 1) Install dependencies

```bash
pip install -r requirements.txt
```

### 2) Run the app

```bash
python main.py
```

### 3) Open in browser

`http://127.0.0.1:5000`

Health check:

`GET /health` -> `{"ok": true}`

## Configuration

Environment variables (all optional):

| Variable | Purpose | Default |
|---|---|---|
| `SECRET_KEY` | Flask session secret | `dev-weather-studio-secret` |
| `DATABASE_PATH` | SQLite database file path | `<repo>/weather_studio.db` |
| `WEATHER_TIMEOUT_SECONDS` | Upstream request timeout | `15` |
| `CACHE_TTL_SECONDS` | In-memory backend cache TTL | `600` |
| `OPENWEATHER_API_KEYS` | Comma-separated OpenWeather keys | built-in fallback keys |
| `OPENWEATHER_API_KEY` | Single OpenWeather key | empty |
| `SMTP_HOST` | SMTP host | empty |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USERNAME` | SMTP username | empty |
| `SMTP_PASSWORD` | SMTP password | empty |
| `SMTP_FROM` | Sender email | `SMTP_USERNAME` |
| `SMTP_USE_TLS` | TLS enabled (`true/false`) | `true` |

## API Reference (Current)

Weather and config:
- `GET /api/config`
- `POST /api/weather`
- `POST /api/weather/coords`
- `GET /api/forecast`
- `GET /api/dashboard`
- `GET /api/map/layers`
- `POST /api/ml/predict`
- `POST /api/vision/sky-analysis`

Intelligence and planners:
- `POST /api/platform-bundle`
- `POST /api/insights`
- `POST /api/analytics`
- `POST /api/alerts/evaluate`
- `POST /api/activity-recommendations`
- `POST /api/travel-planner`
- `POST /api/agriculture-advisor`
- `POST /api/chatbot`
- `POST /api/climate-insights`

Auth and user data:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/user/settings`
- `POST /api/user/settings`
- `GET /api/user/cities`
- `POST /api/user/cities`
- `DELETE /api/user/cities`
- `GET /api/user/alert-rules`
- `POST /api/user/alert-rules`

## Data Storage

SQLite tables created automatically on startup:
- `users`
- `user_settings`
- `saved_cities`
- `alert_rules`

ML model artifacts (created after training):
- `models/weather_temperature_model.pkl`
- `models/weather_rain_model.pkl`
- `backend/models/sky_classifier.h5`

## Frontend Behavior Notes

- Weather bundle responses are cached in `localStorage` for 30 minutes.
- Location detection fallback chain:
  - browser geolocation
  - cached last coordinates
  - IP lookup (`ipapi.co`, `ipwho.is`)
  - default coordinates
- Live text translation uses `translate.googleapis.com` in the client.
- PWA install prompt and service worker registration are enabled.

## Important Notes

- Map tile APIs and map logic exist in JS/routes, but the current `frontend/index.html` does not render a map section.
- Travel planner scores only within available forecast range (up to 15/16 days).
- In static mode, account features are unavailable and results are computed client-side.

## Troubleshooting

- "Backend API not found. Running in static mode."
  - Start Flask with `python main.py`, then reload.

- Login/signup not working
  - These require backend mode and working cookies/session.

- UI seems stale after updates
  - Hard refresh (`Ctrl+F5`) and, if needed, unregister the service worker in browser dev tools.

- Alert emails not sent
  - Configure SMTP env variables (`SMTP_HOST`, `SMTP_FROM`, optional auth fields).

- ML prediction keeps returning fallback confidence
  - Train models first:
    `python -m backend.train_weather_model --lat 22.57 --lon 88.36 --days 540`

- Sky image API returns "model unavailable"
  - Train the sky CNN model first:
    `python -m backend.train_sky_model --dataset-dir <path-to-sky-dataset> --epochs 12`

## Dependencies

From `requirements.txt`:
- `Flask>=3.0.0`
- `Flask-Login>=0.6.3`
- `requests>=2.31.0`
- `pandas>=2.2.0`
- `numpy>=1.26.0`
- `scikit-learn>=1.5.0`
- `joblib>=1.4.0`
- `opencv-python-headless>=4.10.0`
- `tensorflow>=2.16.0`

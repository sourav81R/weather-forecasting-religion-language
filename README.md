# Regional Weather Studio

Regional Weather Studio is a Flask + JavaScript weather intelligence platform that combines API weather data, ML forecasting, computer vision sky analysis, map intelligence, and decision-support tools in a single dashboard.

## What This Project Includes

- Current weather and multi-day forecast
- Weather analytics charts (temperature, rain, wind, humidity, UV)
- AI weather summary generation
- ML next-day weather prediction
- Sky image weather detection (upload and live camera)
- Hyperlocal AI forecast fusion engine
- Storm-aware weather map and map inspector
- Activity recommendations
- Travel weather planner
- Agriculture advisor
- Alert evaluation with optional email notifications
- Rule-based weather chatbot
- User auth, preferences, saved cities, and alert rules
- PWA install support + offline fallback forecast engine

## Runtime Modes

The frontend automatically runs in one of two modes:

1. Backend mode (full platform)
- Uses Flask APIs under `/api/*`
- Enables auth, persistent settings/cities/rules, server intelligence services, and email alert support

2. Static mode (automatic fallback)
- Activates when backend is unavailable
- Uses direct browser calls to OpenWeather and Open-Meteo
- Disables server-backed account persistence and email sending

The active mode is shown in the status bar in the app UI.

## Tech Stack

- Backend: Python, Flask, Flask-Login, SQLite
- Data + ML: requests, pandas, numpy, scikit-learn, joblib
- Vision ML: TensorFlow/Keras, OpenCV
- Frontend: vanilla HTML, CSS, JavaScript
- Charts: Chart.js
- Mapping: Leaflet (+ optional `leaflet-velocity`)
- APIs:
  - OpenWeather (current weather + tile layers + forecast component)
  - Open-Meteo (forecast, geocoding, archive, map weather fields)
- PWA: Manifest + Service Worker

## Active Project Structure

```text
backend/
  app.py
  config.py
  routes/
    auth_routes.py
    hyperlocal_routes.py
    intelligence_routes.py
    ml_routes.py
    vision_routes.py
    weather_routes.py
  services/
    activity_service.py
    agriculture_service.py
    ai_service.py
    alert_service.py
    analytics_service.py
    chatbot_service.py
    climate_service.py
    email_service.py
    hyperlocal_prediction_service.py
    ml_prediction_service.py
    sky_image_service.py
    travel_service.py
    weather_service.py
  models/
    db.py
    user.py
  utils/
    cache.py
  train_weather_model.py
  train_sky_model.py

frontend/
  index.html
  css/app.css
  js/app.js
  js/weatherMap.js
  js/liveCamera.js
  js/offlineForecast.js
  manifest.json
  service-worker.js
  components/

root mirrors for static hosting compatibility:
  index.html
  service-worker.js
  manifest.json
```

## Legacy / Non-Core Files

The repository also contains older experiment folders and scripts (`weatherB/`, `19.03/`, `rgh/`, `main1.py`, `tathu.py`, etc.). They are not part of the active Flask web app runtime.

## Quick Start

### 1) Install dependencies

```bash
pip install -r requirements.txt
```

### 2) Run the Flask app

```bash
python main.py
```

App URL:
- `http://127.0.0.1:5000`

Health check:
- `GET /health` -> `{"ok": true}`

### 3) Optional static-only run

If you serve the repository on `127.0.0.1:5500` (for example with Live Server), the app still works via static mode fallback, but server-only capabilities are limited.

## Configuration

Environment variables (all optional):

| Variable | Purpose | Default |
|---|---|---|
| `SECRET_KEY` | Flask session secret | `dev-weather-studio-secret` |
| `DATABASE_PATH` | SQLite DB path | `<repo>/weather_studio.db` |
| `WEATHER_TIMEOUT_SECONDS` | Upstream request timeout | `15` |
| `CACHE_TTL_SECONDS` | In-memory cache TTL (seconds) | `600` |
| `OPENWEATHER_API_KEYS` | Comma-separated OpenWeather keys | built-in fallback keys |
| `OPENWEATHER_API_KEY` | Single OpenWeather key | empty |
| `SMTP_HOST` | SMTP host | empty |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USERNAME` | SMTP username | empty |
| `SMTP_PASSWORD` | SMTP password | empty |
| `SMTP_FROM` | Sender email | `SMTP_USERNAME` |
| `SMTP_USE_TLS` | TLS (`true/false`) | `true` |

## API Surface

### Core weather APIs

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/config` | UI/runtime config |
| `POST` | `/api/weather` | Current weather by city |
| `POST` | `/api/weather/coords` | Current weather by coordinates |
| `GET` | `/api/forecast` | Forecast by coordinates |
| `GET` | `/api/dashboard` | Current + forecast + analytics + ML summary payload |
| `GET` | `/api/map/layers` | Tile layer URLs |
| `GET` | `/api/map/weather-data` | Map weather point sample (`lat`, `lon`, `hourOffset`) |

### Intelligence APIs

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/platform-bundle` | Bundled intelligence payload for dashboard |
| `POST` | `/api/insights` | AI weather summary |
| `POST` | `/api/analytics` | Forecast analytics data |
| `POST` | `/api/alerts/evaluate` | Evaluate weather alert rules |
| `POST` | `/api/activity-recommendations` | Activity scoring |
| `POST` | `/api/travel-planner` | Travel window recommendation |
| `POST` | `/api/agriculture-advisor` | Crop/weather advice |
| `POST` | `/api/chatbot` | Weather chatbot response |
| `POST` | `/api/climate-insights` | Archive-based climate insights |

### ML and vision APIs

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/ml/predict` | ML weather prediction by coords |
| `POST` | `/api/vision/sky-analysis` | Uploaded sky image analysis |
| `POST` | `/api/vision/live-sky` | Live camera frame sky analysis |

### Hyperlocal API

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/hyperlocal/predict` | Multi-signal fused hyperlocal prediction |

Request example:

```json
{
  "lat": 22.57,
  "lon": 88.36,
  "sky_condition": "storm_clouds"
}
```

Response shape:

```json
{
  "temperature_prediction": 30.9,
  "rain_probability": 0.74,
  "storm_risk": 0.63,
  "confidence_score": 0.88,
  "sources_used": [
    "api_forecast",
    "ml_model",
    "sky_image",
    "satellite_data"
  ]
}
```

### Auth and user APIs

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/signup` | Create account |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/me` | Session + profile + settings + cities + rules |
| `GET` | `/api/user/settings` | Get user settings |
| `POST` | `/api/user/settings` | Update user settings |
| `GET` | `/api/user/cities` | List saved cities |
| `POST` | `/api/user/cities` | Add saved city |
| `DELETE` | `/api/user/cities` | Remove saved city |
| `GET` | `/api/user/alert-rules` | List alert rules |
| `POST` | `/api/user/alert-rules` | Upsert alert rules |

## Hyperlocal Prediction Engine

Implemented in:
- `backend/services/hyperlocal_prediction_service.py`
- `backend/routes/hyperlocal_routes.py`

Fusion sources:
- OpenWeather forecast component
- Open-Meteo forecast component
- ML model output
- Sky condition mapping
- Satellite/map weather fields (wind + precipitation intensity)

Weights:
- API: `0.4`
- ML: `0.3`
- Sky image: `0.2`
- Satellite: `0.1`

Sky-to-rain mapping:
- `clear_sky -> 0.05`
- `overcast -> 0.40`
- `rain_clouds -> 0.65`
- `storm_clouds -> 0.85`

Confidence combines:
- source agreement
- data freshness
- model confidence

Prediction cache:
- TTL 10 minutes (`600s`) per `(lat, lon, sky_condition)` key.

## Data Storage

SQLite tables are auto-created:
- `users`
- `user_settings`
- `saved_cities`
- `alert_rules`

Model artifact locations:
- Weather ML models: `models/weather_temperature_model.pkl`, `models/weather_rain_model.pkl`
- Sky vision model: `backend/models/sky_classifier.h5`

## Model Training

Train weather ML models:

```bash
python -m backend.train_weather_model --lat 22.57 --lon 88.36 --days 540
```

Train sky CNN model:

```bash
python -m backend.train_sky_model --dataset-dir <path-to-dataset> --epochs 12
```

Expected dataset class folders:
- `clear_sky`
- `rain_clouds`
- `storm_clouds`
- `overcast`

## Frontend Runtime Notes

- `frontend/js/app.js` is the main orchestration layer.
- Weather map controller is in `frontend/js/weatherMap.js`.
- Live camera controller is in `frontend/js/liveCamera.js`.
- Offline forecast engine is in `frontend/js/offlineForecast.js`.

Caching behavior:
- Backend memory cache via `TTLCache` (`backend/utils/cache.py`)
- Browser local cache for bundle/offline history
- Service worker UI/data caches for PWA behavior

## CORS and Local Origins

Backend allows CORS credentials for:
- `http://127.0.0.1:5500`
- `http://localhost:5500`
- `http://127.0.0.1:5000`
- `http://localhost:5000`

## Known Constraints

- If TensorFlow/OpenCV dependencies or trained sky model are missing, sky vision endpoints may return service errors.
- If weather ML model files are missing, ML prediction service falls back to forecast-derived prediction logic.
- Static mode cannot provide persistent auth/user storage or email alert sending.

## Troubleshooting

Backend not detected:
- Ensure Flask is running: `python main.py`
- Reload browser and confirm status is not static fallback unless intended.

UI updates not visible:
- Hard refresh (`Ctrl+F5`)
- If needed, unregister service worker in DevTools and reload.

Email alerts not sending:
- Set SMTP environment variables (`SMTP_HOST`, `SMTP_FROM`, optional auth credentials).

Sky analysis failing:
- Confirm `tensorflow` + `opencv-python-headless` are installed.
- Train and place `backend/models/sky_classifier.h5`.

ML prediction low confidence/fallback:
- Train weather models with `backend.train_weather_model`.

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

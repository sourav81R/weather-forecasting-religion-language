const CACHE_KEY = "weather-studio-cache-v2";
const PWA_CACHE_NAME = "weather-studio-pwa-v24";
const FAVORITES_KEY = "weather-studio-favorites-v2";
const LAST_COORDS_KEY = "weather-studio-last-coords-v2";
const WEATHER_HISTORY_DB_NAME = "weather-studio-history-v1";
const WEATHER_HISTORY_STORE_NAME = "forecast_history";
const WEATHER_HISTORY_RETENTION_MS = 72 * 60 * 60 * 1000;
const WEATHER_HISTORY_READ_LIMIT = 144;
const OFFLINE_MODE_BANNER_TEXT = "Offline Mode – Showing predicted forecast based on cached data";
const LIVE_SCAN_INTERVAL_MS = 5000;
const LIVE_SCAN_CACHE_TTL_MS = 60 * 1000;
const LUNAR_CYCLE_DAYS = 29.53058867;
const REFERENCE_NEW_MOON_UTC_MS = Date.UTC(2000, 0, 6, 18, 14, 0);
const QUICK_CITIES = ["Kolkata", "Delhi", "Mumbai", "Chennai", "Dhaka", "Bengaluru"];
const OPENWEATHER_ENDPOINT = "https://api.openweathermap.org/data/2.5/weather";
const OPENMETEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const OPENMETEO_GEO_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const OPENMETEO_REVERSE_GEO_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/reverse";
const BUILTIN_API_KEYS = ["d7842c0b970d897c608c64e6b6cc0b8a", "48a90ac42caa09f90dcaeee4096b9e53"];
const DEFAULT_COORDS = { latitude: 22.5726, longitude: 88.3639 };
const LANGUAGE_CODES = {
  English: "en",
  Assamese: "as",
  Bengali: "bn",
  Bodo: "hi",
  Dogri: "hi",
  Gujarati: "gu",
  Hindi: "hi",
  Kannada: "kn",
  Kashmiri: "ur",
  Konkani: "mr",
  Maithili: "hi",
  Malayalam: "ml",
  Manipuri: "hi",
  Marathi: "mr",
  Nepali: "ne",
  Odia: "or",
  Punjabi: "pa",
  Sanskrit: "sa",
  Santali: "hi",
  Sindhi: "sd",
  Tamil: "ta",
  Telugu: "te",
  Urdu: "ur",
};
const WEATHER_SYMBOLS = {
  Thunderstorm: "\u26C8",
  Drizzle: "\uD83C\uDF26",
  Rain: "\uD83C\uDF27",
  Snow: "\uD83C\uDF28",
  Mist: "\uD83C\uDF2B",
  Fog: "\uD83C\uDF2B",
  Clear: "\u2600",
  Clouds: "\u2601",
};
const WMO_TO_CONDITION = {
  0: "Clear",
  1: "Clouds",
  2: "Clouds",
  3: "Clouds",
  45: "Fog",
  48: "Fog",
  51: "Drizzle",
  53: "Drizzle",
  55: "Drizzle",
  61: "Rain",
  63: "Rain",
  65: "Rain",
  71: "Snow",
  73: "Snow",
  75: "Snow",
  80: "Rain",
  81: "Rain",
  82: "Rain",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};
const CROP_PROFILES = {
  rice: { tempMin: 20, tempMax: 35, weeklyRainMm: 35 },
  wheat: { tempMin: 12, tempMax: 25, weeklyRainMm: 20 },
  maize: { tempMin: 18, tempMax: 32, weeklyRainMm: 28 },
  potato: { tempMin: 10, tempMax: 24, weeklyRainMm: 18 },
  cotton: { tempMin: 21, tempMax: 34, weeklyRainMm: 22 },
};

const el = {
  appShell: document.getElementById("appShell"),
  sidebar: document.querySelector(".sidebar"),
  nav: document.getElementById("sidebarNav"),
  sidebarToggle: document.getElementById("sidebarToggle"),
  cityInput: document.getElementById("cityInput"),
  fetchBtn: document.getElementById("fetchBtn"),
  locateBtn: document.getElementById("locateBtn"),
  languageSelect: document.getElementById("languageSelect"),
  unitsSelect: document.getElementById("unitsSelect"),
  apiKeyInput: document.getElementById("apiKeyInput"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  statusText: document.getElementById("statusText"),
  offlineBanner: document.getElementById("offlineBanner"),
  quickCities: document.getElementById("quickCities"),
  favoriteCities: document.getElementById("favoriteCities"),
  conditionSymbol: document.getElementById("conditionSymbol"),
  temperatureText: document.getElementById("temperatureText"),
  descriptionText: document.getElementById("descriptionText"),
  locationText: document.getElementById("locationText"),
  metricGrid: document.getElementById("metricGrid"),
  aiSummary: document.getElementById("aiSummary"),
  activityList: document.getElementById("activityList"),
  mlPredictionList: document.getElementById("mlPredictionList"),
  offlineForecastCard: document.getElementById("offlineForecastCard"),
  offlineForecastTemp: document.getElementById("offlineForecastTemp"),
  offlineForecastRain: document.getElementById("offlineForecastRain"),
  offlineForecastWind: document.getElementById("offlineForecastWind"),
  offlineForecastTrend: document.getElementById("offlineForecastTrend"),
  offlineForecastMeta: document.getElementById("offlineForecastMeta"),
  forecastCards: document.getElementById("forecastCards"),
  outdoorWindow: document.getElementById("outdoorWindow"),
  climateNarrative: document.getElementById("climateNarrative"),
  climateStats: document.getElementById("climateStats"),
  travelDestination: document.getElementById("travelDestination"),
  travelStart: document.getElementById("travelStart"),
  travelEnd: document.getElementById("travelEnd"),
  travelBtn: document.getElementById("travelBtn"),
  travelResult: document.getElementById("travelResult"),
  cropType: document.getElementById("cropType"),
  agriBtn: document.getElementById("agriBtn"),
  agriResult: document.getElementById("agriResult"),
  skyImageInput: document.getElementById("skyImageInput"),
  skyAnalyzeBtn: document.getElementById("skyAnalyzeBtn"),
  skyImagePreview: document.getElementById("skyImagePreview"),
  skyAnalysisResult: document.getElementById("skyAnalysisResult"),
  liveCameraStartBtn: document.getElementById("liveCameraStartBtn"),
  liveCameraStopBtn: document.getElementById("liveCameraStopBtn"),
  liveCameraCaptureBtn: document.getElementById("liveCameraCaptureBtn"),
  liveCameraScanBtn: document.getElementById("liveCameraScanBtn"),
  liveCameraVideo: document.getElementById("liveCameraVideo"),
  liveCameraCanvas: document.getElementById("liveCameraCanvas"),
  liveCameraStatus: document.getElementById("liveCameraStatus"),
  liveSkyResult: document.getElementById("liveSkyResult"),
  ruleRain: document.getElementById("ruleRain"),
  ruleTemp: document.getElementById("ruleTemp"),
  ruleWind: document.getElementById("ruleWind"),
  ruleUv: document.getElementById("ruleUv"),
  alertEmail: document.getElementById("alertEmail"),
  evaluateAlertsBtn: document.getElementById("evaluateAlertsBtn"),
  alertList: document.getElementById("alertList"),
  installBtn: document.getElementById("installBtn"),
  authState: document.getElementById("authState"),
  authEmail: document.getElementById("authEmail"),
  authPassword: document.getElementById("authPassword"),
  signupBtn: document.getElementById("signupBtn"),
  loginBtn: document.getElementById("loginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  darkModeToggle: document.getElementById("darkModeToggle"),
  saveSettingsBtn: document.getElementById("saveSettingsBtn"),
  savedCitiesServer: document.getElementById("savedCitiesServer"),
  chatLog: document.getElementById("chatLog"),
  chatInput: document.getElementById("chatInput"),
  chatSendBtn: document.getElementById("chatSendBtn"),
  tempChart: document.getElementById("tempChart"),
  rainChart: document.getElementById("rainChart"),
  windChart: document.getElementById("windChart"),
  humidityChart: document.getElementById("humidityChart"),
  uvChart: document.getElementById("uvChart"),
};

const state = {
  config: null,
  staticMode: false,
  apiBase: "",
  current: null,
  forecast: null,
  analytics: null,
  activity: null,
  mlPrediction: null,
  skyAnalysis: null,
  alerts: [],
  coords: null,
  charts: {},
  user: { authenticated: false },
  localFavorites: loadLocalFavorites(),
  weatherMapController: null,
  deferredPrompt: null,
  offlineMode: false,
  offlineForecast: null,
  offlineForecastEngine: null,
  liveCamera: {
    controller: null,
    scanning: false,
    busy: false,
    scanTimer: null,
    predictionCache: new Map(),
  },
};

const i18nState = {
  initialized: false,
  textBase: new Map(),
  placeholderBase: new Map(),
  cache: new Map(),
};

let weatherHistoryDbPromise = null;
let offlineForecastModulePromise = null;
let liveCameraModulePromise = null;
let weatherMapModulePromise = null;

// Edge-computing cache: keep forecast history on-device so offline predictions run in-browser.
function idbTransactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed."));
    transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted."));
  });
}

function normalizeLocationKey(location) {
  return String(location || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function celsiusToFahrenheit(value) {
  return (value * 9) / 5 + 32;
}

function kmhToMph(value) {
  return value / 1.60934;
}

function canonicalTemperatureC(current) {
  if (Number.isFinite(Number(current?.tempC))) return Number(current.tempC);
  const temp = safeNumber(current?.temperature);
  if (temp === null) return null;
  const unit = String(current?.temperatureUnit || "").toUpperCase();
  return unit.includes("F") ? (temp - 32) * (5 / 9) : temp;
}

function canonicalWindKmh(current) {
  if (Number.isFinite(Number(current?.windKmh))) return Number(current.windKmh);
  const speed = safeNumber(current?.windSpeed);
  if (speed === null) return null;
  const unit = String(current?.windUnit || "").toLowerCase();
  if (unit.includes("mph")) return speed * 1.60934;
  if (unit.includes("m/s") || unit === "ms") return speed * 3.6;
  return speed;
}

function formatTemperatureByUnits(tempC, units) {
  if (!Number.isFinite(Number(tempC))) return "--";
  const value = units === "imperial" ? celsiusToFahrenheit(Number(tempC)) : Number(tempC);
  const symbol = units === "imperial" ? "\u00B0F" : "\u00B0C";
  return `${value.toFixed(1)}${symbol}`;
}

function formatWindByUnits(windKmh, units) {
  if (!Number.isFinite(Number(windKmh))) return "--";
  const value = units === "imperial" ? kmhToMph(Number(windKmh)) : Number(windKmh);
  const symbol = units === "imperial" ? "mph" : "km/h";
  return `${value.toFixed(1)} ${symbol}`;
}

function openWeatherHistoryDb() {
  if (weatherHistoryDbPromise) return weatherHistoryDbPromise;
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not supported in this browser."));
  }

  weatherHistoryDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(WEATHER_HISTORY_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(WEATHER_HISTORY_STORE_NAME)) {
        const store = db.createObjectStore(WEATHER_HISTORY_STORE_NAME, { keyPath: "id", autoIncrement: true });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("location", "location", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Unable to open IndexedDB."));
  });
  return weatherHistoryDbPromise;
}

async function pruneHistoryStore(store, cutoffTimestamp) {
  // Keep only the trailing 72h window for offline edge predictions.
  if (typeof IDBKeyRange === "undefined") return;
  const range = IDBKeyRange.upperBound(cutoffTimestamp, true);
  await new Promise((resolve, reject) => {
    const cursorRequest = store.index("timestamp").openCursor(range);
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor) {
        resolve();
        return;
      }
      cursor.delete();
      cursor.continue();
    };
    cursorRequest.onerror = () => reject(cursorRequest.error || new Error("Failed to prune weather history."));
  });
}

async function cleanupExpiredWeatherHistory() {
  try {
    const db = await openWeatherHistoryDb();
    const transaction = db.transaction(WEATHER_HISTORY_STORE_NAME, "readwrite");
    const done = idbTransactionDone(transaction);
    const store = transaction.objectStore(WEATHER_HISTORY_STORE_NAME);
    await pruneHistoryStore(store, Date.now() - WEATHER_HISTORY_RETENTION_MS);
    await done;
  } catch {
    // Ignore offline history cleanup errors to avoid blocking weather flow.
  }
}

async function saveWeatherHistoryRecord(record) {
  try {
    const db = await openWeatherHistoryDb();
    const transaction = db.transaction(WEATHER_HISTORY_STORE_NAME, "readwrite");
    const done = idbTransactionDone(transaction);
    const store = transaction.objectStore(WEATHER_HISTORY_STORE_NAME);
    store.put(record);
    await pruneHistoryStore(store, Date.now() - WEATHER_HISTORY_RETENTION_MS);
    await done;
  } catch {
    // Ignore write errors; live weather flow should still complete.
  }
}

async function readRecentWeatherHistory(locationHint = "", limit = WEATHER_HISTORY_READ_LIMIT) {
  const db = await openWeatherHistoryDb();
  const transaction = db.transaction(WEATHER_HISTORY_STORE_NAME, "readonly");
  const done = idbTransactionDone(transaction);
  const store = transaction.objectStore(WEATHER_HISTORY_STORE_NAME);
  const index = store.index("timestamp");
  const cutoff = Date.now() - WEATHER_HISTORY_RETENTION_MS;
  const range = typeof IDBKeyRange === "undefined" ? null : IDBKeyRange.lowerBound(cutoff);
  const normalizedHint = normalizeLocationKey(locationHint);

  const byLocation = [];
  const recent = [];
  await new Promise((resolve, reject) => {
    const cursorRequest = index.openCursor(range, "prev");
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor) {
        resolve();
        return;
      }
      const item = cursor.value || {};
      recent.push(item);
      if (normalizedHint && normalizeLocationKey(item.location) === normalizedHint) {
        byLocation.push(item);
      }
      if (recent.length >= limit) {
        resolve();
        return;
      }
      cursor.continue();
    };
    cursorRequest.onerror = () => reject(cursorRequest.error || new Error("Failed to read cached weather history."));
  });
  await done;
  return (byLocation.length ? byLocation : recent).slice(0, limit);
}

async function persistWeatherHistoryFromBundle(bundle) {
  const current = bundle?.current || {};
  const today = (bundle?.forecast?.daily || [])[0] || {};
  const temperature = canonicalTemperatureC(current);
  const humidity = safeNumber(current.humidity);
  const wind = canonicalWindKmh(current);
  const rainProbability = safeNumber(today.rainProbability);
  const location = String(current.location || "").trim();

  if (!location && temperature === null && humidity === null && wind === null && rainProbability === null) {
    return;
  }

  const record = {
    timestamp: Date.now(),
    location: location || "Unknown location",
    temperature,
    humidity,
    wind,
    rain_probability: rainProbability !== null ? Math.max(0, Math.min(100, rainProbability)) : null,
  };
  await saveWeatherHistoryRecord(record);
}

async function getOfflineForecastEngine() {
  if (state.offlineForecastEngine) return state.offlineForecastEngine;
  if (!offlineForecastModulePromise) {
    offlineForecastModulePromise = importModuleCandidates([
      "/js/offlineForecast.js",
      "/frontend/js/offlineForecast.js",
      "/static/js/offlineForecast.js",
    ]);
  }
  const module = await offlineForecastModulePromise;
  state.offlineForecastEngine = module.createOfflineForecastEngine();
  return state.offlineForecastEngine;
}

async function getLiveCameraModule() {
  if (!liveCameraModulePromise) {
    liveCameraModulePromise = importModuleCandidates([
      "/js/liveCamera.js",
      "/frontend/js/liveCamera.js",
      "/static/js/liveCamera.js",
    ]);
  }
  return liveCameraModulePromise;
}

async function getWeatherMapModule() {
  if (!weatherMapModulePromise) {
    weatherMapModulePromise = importModuleCandidates([
      "/js/weatherMap.js",
      "/frontend/js/weatherMap.js",
      "/static/js/weatherMap.js",
    ]);
  }
  return weatherMapModulePromise;
}

async function initializeWeatherMapController() {
  if (state.weatherMapController) {
    await state.weatherMapController.updateContext({
      apiBase: state.apiBase,
      staticMode: state.staticMode,
      forceTileReload: true,
    });
    return;
  }

  const mapContainer = document.getElementById("weatherMap");
  if (!mapContainer) return;

  try {
    const module = await getWeatherMapModule();
    state.weatherMapController = module.createWeatherMapController({
      containerId: "weatherMap",
      apiBase: state.apiBase,
      staticMode: state.staticMode,
      builtinApiKeys: BUILTIN_API_KEYS,
      getApiKey: () => el.apiKeyInput?.value?.trim() || "",
      playButtonId: "mapPlayBtn",
      pauseButtonId: "mapPauseBtn",
      hourSliderId: "mapTimeSlider",
      hourLabelId: "mapHourLabel",
      stormIndicatorId: "mapStormIndicator",
      stormListId: "mapStormList",
      onStatus: (text, tone) => setStatus(text, tone),
      onLocationSelected: ({ latitude, longitude }) => {
        state.coords = { latitude: Number(latitude), longitude: Number(longitude) };
        localStorage.setItem(LAST_COORDS_KEY, JSON.stringify(state.coords));
        void loadPlatformBundle({ latitude: state.coords.latitude, longitude: state.coords.longitude });
      },
    });
    await state.weatherMapController.init();
  } catch (error) {
    setStatus(`Map module unavailable: ${error.message}`, "error");
  }
}

async function importModuleCandidates(candidates) {
  let lastError = null;
  for (const candidate of candidates) {
    try {
      return await import(candidate);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Failed to load dynamic module.");
}

function setLiveCameraStatus(text, tone = "") {
  if (!el.liveCameraStatus) return;
  const message = String(text || "");
  el.liveCameraStatus.textContent = message;
  el.liveCameraStatus.style.color = tone === "error" ? "#d13a4d" : tone === "success" ? "#179d84" : "";
}

function setLiveScanButtonLabel(scanning) {
  if (!el.liveCameraScanBtn) return;
  el.liveCameraScanBtn.textContent = scanning ? "Stop Live Scan" : "Start Live Scan";
}

function setLiveCameraButtons() {
  const active = Boolean(state.liveCamera.controller?.isActive?.());
  if (el.liveCameraStartBtn) el.liveCameraStartBtn.disabled = active;
  if (el.liveCameraStopBtn) el.liveCameraStopBtn.disabled = !active;
  if (el.liveCameraCaptureBtn) el.liveCameraCaptureBtn.disabled = !active || state.liveCamera.busy;
  if (el.liveCameraScanBtn) el.liveCameraScanBtn.disabled = !active || state.liveCamera.busy;
  setLiveScanButtonLabel(Boolean(state.liveCamera.scanning));
}

function stopLiveScan() {
  if (state.liveCamera.scanTimer) {
    clearInterval(state.liveCamera.scanTimer);
    state.liveCamera.scanTimer = null;
  }
  state.liveCamera.scanning = false;
  setLiveScanButtonLabel(false);
}

function clearExpiredLivePredictionCache() {
  const now = Date.now();
  for (const [key, entry] of state.liveCamera.predictionCache.entries()) {
    if (!entry || now - Number(entry.at || 0) > LIVE_SCAN_CACHE_TTL_MS) {
      state.liveCamera.predictionCache.delete(key);
    }
  }
}

function livePredictionCacheKey(signature) {
  const lat = Number.isFinite(Number(state.coords?.latitude)) ? Number(state.coords.latitude).toFixed(3) : "na";
  const lon = Number.isFinite(Number(state.coords?.longitude)) ? Number(state.coords.longitude).toFixed(3) : "na";
  return `${signature}:${lat}:${lon}:${state.staticMode ? "static" : "backend"}`;
}

function setOfflineModeUi(visible, bannerText = OFFLINE_MODE_BANNER_TEXT) {
  if (el.offlineBanner) {
    el.offlineBanner.hidden = !visible;
    if (visible) el.offlineBanner.textContent = bannerText;
  }
  if (el.offlineForecastCard) {
    el.offlineForecastCard.hidden = !visible;
  }
}

function renderOfflineForecastCard() {
  if (!el.offlineForecastCard) return;
  if (!state.offlineMode) {
    el.offlineForecastCard.hidden = true;
    return;
  }

  const forecast = state.offlineForecast;
  el.offlineForecastCard.hidden = false;
  if (!forecast) {
    if (el.offlineForecastTemp) el.offlineForecastTemp.textContent = "--";
    if (el.offlineForecastRain) el.offlineForecastRain.textContent = "--";
    if (el.offlineForecastWind) el.offlineForecastWind.textContent = "--";
    if (el.offlineForecastTrend) el.offlineForecastTrend.textContent = "--";
    if (el.offlineForecastMeta) {
      el.offlineForecastMeta.textContent = "No cached forecast available. Please connect to the internet.";
    }
    return;
  }

  const units = el.unitsSelect?.value === "imperial" ? "imperial" : "metric";
  const temperatureC = safeNumber(forecast?.predictions?.temperature);
  const windKmh = safeNumber(forecast?.predictions?.wind);
  const rain = safeNumber(forecast?.predictions?.rainProbability);
  if (el.offlineForecastTemp) el.offlineForecastTemp.textContent = formatTemperatureByUnits(temperatureC, units);
  if (el.offlineForecastRain) el.offlineForecastRain.textContent = rain === null ? "--" : `${Math.round(rain)}%`;
  if (el.offlineForecastWind) el.offlineForecastWind.textContent = formatWindByUnits(windKmh, units);

  const tempTrend = forecast?.trends?.temperature || "stable";
  const humidityTrend = forecast?.trends?.humidity || "stable";
  const rainTrend = forecast?.trends?.rainProbability || "stable";
  if (el.offlineForecastTrend) {
    el.offlineForecastTrend.textContent = `Temp ${tempTrend} | Humidity ${humidityTrend} | Rain ${rainTrend}`;
  }
  if (el.offlineForecastMeta) {
    const samples = Number(forecast.sampleCount || 0);
    el.offlineForecastMeta.textContent = `Predicted locally from ${samples} cached samples in the last 72 hours.`;
  }
}

function buildOfflineBundleFromPrediction(prediction, records, payload) {
  const units = payload.units === "imperial" ? "imperial" : "metric";
  const latest = records[0] || {};
  const coords = state.coords || DEFAULT_COORDS;
  const windUnit = units === "imperial" ? "mph" : "km/h";
  const tempUnit = units === "imperial" ? "\u00B0F" : "\u00B0C";
  const predictedTempC = Number(prediction.predictions.temperature);
  const predictedWindKmh = Number(prediction.predictions.wind);
  const predictedRain = Number(prediction.predictions.rainProbability);
  const displayTemp = units === "imperial" ? celsiusToFahrenheit(predictedTempC) : predictedTempC;
  const displayWind = units === "imperial" ? kmhToMph(predictedWindKmh) : predictedWindKmh;
  const nowIso = new Date().toISOString();

  const current = {
    location: latest.location || prediction.location || payload.city || "Cached location",
    temperature: Number.isFinite(displayTemp) ? Number(displayTemp.toFixed(1)) : null,
    temperatureUnit: tempUnit,
    description: "offline predicted forecast",
    condition: predictedRain >= 60 ? "Rain" : "Clouds",
    symbol: predictedRain >= 60 ? WEATHER_SYMBOLS.Rain : WEATHER_SYMBOLS.Clouds,
    feelsLike: Number.isFinite(displayTemp) ? Number(displayTemp.toFixed(1)) : null,
    humidity: safeNumber(latest.humidity),
    windSpeed: Number.isFinite(displayWind) ? Number(displayWind.toFixed(1)) : null,
    windUnit,
    pressure: "--",
    clouds: "--",
    sunrise: "--",
    sunset: "--",
    source: "offline forecast engine",
    latitude: Number(coords.latitude),
    longitude: Number(coords.longitude),
    tempC: Number.isFinite(predictedTempC) ? Number(predictedTempC.toFixed(1)) : null,
    windKmh: Number.isFinite(predictedWindKmh) ? Number(predictedWindKmh.toFixed(1)) : null,
    updatedAtUtc: nowIso,
  };

  const temperatureSpread = 2;
  const dailyValue = {
    date: nowIso.slice(0, 10),
    maxTemp: Number((displayTemp + temperatureSpread).toFixed(1)),
    minTemp: Number((displayTemp - temperatureSpread).toFixed(1)),
    rainProbability: Number(Math.max(0, Math.min(100, predictedRain)).toFixed(1)),
    rainAmount: Number((predictedRain >= 60 ? 2 : 0.3).toFixed(1)),
    uvIndex: 0,
    windSpeed: Number(displayWind.toFixed(1)),
    condition: predictedRain >= 60 ? "Rain" : "Clouds",
  };
  const forecast = {
    units: {
      temperature: units === "imperial" ? "F" : "C",
      wind: windUnit,
      precipitation: units === "imperial" ? "in" : "mm",
    },
    daily: [dailyValue],
    hourly: [],
  };

  const analytics = staticBuildAnalytics(forecast);
  const activity = staticBuildActivity(current, forecast);
  return {
    current,
    forecast,
    analytics,
    activity,
    alerts: staticBuildAlerts(current, forecast, []),
    aiSummary: `Offline edge prediction generated from cached weather history for ${current.location}.`,
    mlPrediction: {
      temperature: Number.isFinite(predictedTempC) ? Number(predictedTempC.toFixed(1)) : null,
      rainProbability: Number.isFinite(predictedRain) ? Number((predictedRain / 100).toFixed(2)) : null,
      confidence: 0.45,
      humidityTrend: prediction?.trends?.humidity || "stable",
    },
    offlineForecast: prediction,
  };
}

async function loadOfflineBundle(payload) {
  const locationHint = payload.city || state.current?.location || "";
  const records = await readRecentWeatherHistory(locationHint);
  if (!records.length) {
    throw new Error("No cached forecast available. Please connect to the internet.");
  }
  const engine = await getOfflineForecastEngine();
  const prediction = engine.generate(records);
  return buildOfflineBundleFromPrediction(prediction, records, payload);
}

async function apiRequest(path, options = {}) {
  const endpoint = /^https?:\/\//i.test(path) ? path : `${state.apiBase || ""}${path}`;
  const headers = { ...(options.headers || {}) };
  const isFormDataBody = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body && !isFormDataBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: state.apiBase ? "include" : "same-origin",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return payload;
}

function backendBaseCandidates() {
  if (typeof window === "undefined") return [""];
  const candidates = [""];
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  const hostname = window.location.hostname || "127.0.0.1";
  const port = String(window.location.port || "");
  if (port !== "5000") {
    if (hostname === "localhost") {
      candidates.push(`${protocol}://localhost:5000`);
      candidates.push(`${protocol}://127.0.0.1:5000`);
    } else {
      candidates.push(`${protocol}://127.0.0.1:5000`);
      candidates.push(`${protocol}://localhost:5000`);
    }
  }
  return [...new Set(candidates)];
}

async function detectBackendConfig() {
  for (const base of backendBaseCandidates()) {
    const endpoint = `${base}/api/config`;
    try {
      const response = await fetch(endpoint, {
        credentials: base ? "include" : "same-origin",
      });
      if (!response.ok) continue;
      const payload = await response.json().catch(() => null);
      if (!payload || !Array.isArray(payload.languages)) continue;
      return { config: payload, apiBase: base };
    } catch {
      // Try next candidate.
    }
  }
  return null;
}

function candidateApiKeys(customKey) {
  const keys = [];
  if (customKey) keys.push(customKey);
  for (const key of BUILTIN_API_KEYS) keys.push(key);
  return [...new Set(keys.filter(Boolean))];
}

async function staticGeocodeCity(city) {
  const response = await fetch(`${OPENMETEO_GEO_ENDPOINT}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
  if (!response.ok) throw new Error(`Geocoding failed (${response.status})`);
  const payload = await response.json();
  const first = (payload.results || [])[0];
  if (!first) throw new Error("City not found");
  return { latitude: Number(first.latitude), longitude: Number(first.longitude) };
}

async function staticReverseGeocode(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    count: "1",
    language: "en",
    format: "json",
  });
  const response = await fetch(`${OPENMETEO_REVERSE_GEO_ENDPOINT}?${params.toString()}`);
  if (!response.ok) throw new Error(`Reverse geocoding failed (${response.status})`);
  const payload = await response.json();
  const first = (payload.results || [])[0];
  if (!first) return "";
  return `${first.name || ""}${first.country_code ? `, ${first.country_code}` : ""}`.replace(/^,\s*/, "").trim();
}

async function staticFetchCurrentFallback(payload, units) {
  const coords =
    Number.isFinite(Number(payload.latitude)) && Number.isFinite(Number(payload.longitude))
      ? { latitude: Number(payload.latitude), longitude: Number(payload.longitude) }
      : await staticGeocodeCity(payload.city || "");

  const params = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,cloud_cover,wind_speed_10m,weather_code,is_day",
    daily: "sunrise,sunset",
    forecast_days: "1",
    temperature_unit: units === "imperial" ? "fahrenheit" : "celsius",
    wind_speed_unit: units === "imperial" ? "mph" : "ms",
    timezone: "auto",
  });
  const response = await fetch(`${OPENMETEO_ENDPOINT}?${params.toString()}`);
  if (!response.ok) throw new Error(`Fallback weather API error (${response.status})`);
  const data = await response.json();
  const current = data.current || {};
  const daily = data.daily || {};
  const windSpeed = Number(current.wind_speed_10m || 0);
  const temp = Number(current.temperature_2m);
  const condition = WMO_TO_CONDITION[Number(current.weather_code)] || "Clouds";
  const isDayValue = Number(current.is_day);
  const isDay = Number.isFinite(isDayValue) ? isDayValue === 1 : undefined;
  let location = payload.city || "";
  try {
    location = (await staticReverseGeocode(coords.latitude, coords.longitude)) || location;
  } catch {
    // keep existing location fallback
  }

  return {
    location: location || `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`,
    temperature: Number.isFinite(temp) ? temp : null,
    temperatureUnit: units === "imperial" ? "\u00B0F" : "\u00B0C",
    description: condition.toLowerCase(),
    condition,
    symbol: WEATHER_SYMBOLS[condition] || "\uD83C\uDF24",
    isDay,
    feelsLike: Number(current.apparent_temperature || temp || 0),
    humidity: Number(current.relative_humidity_2m || 0),
    windSpeed,
    windUnit: units === "imperial" ? "mph" : "m/s",
    pressure: Number(current.surface_pressure || 0),
    clouds: Number(current.cloud_cover || 0),
    sunrise: formatIsoTime((daily.sunrise || [])[0]),
    sunset: formatIsoTime((daily.sunset || [])[0]),
    source: "open-meteo fallback",
    latitude: coords.latitude,
    longitude: coords.longitude,
    weatherCode: Number(current.weather_code),
    tempC: units === "imperial" ? ((temp - 32) * 5) / 9 : temp,
    windKmh: units === "imperial" ? windSpeed * 1.60934 : windSpeed * 3.6,
  };
}

async function staticFetchCurrent(payload) {
  const units = payload.units === "imperial" ? "imperial" : "metric";
  const lang = payload.language || "English";
  const langCode = i18nLanguageCode(lang);
  const query = payload.city
    ? { q: payload.city }
    : { lat: String(payload.latitude), lon: String(payload.longitude) };

  let lastError = "Unable to fetch weather.";
  for (const key of candidateApiKeys(payload.apiKey)) {
    const params = new URLSearchParams({
      ...query,
      appid: key,
      units,
      lang: langCode,
    });
    try {
      const response = await fetch(`${OPENWEATHER_ENDPOINT}?${params.toString()}`);
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        const weather = (data.weather || [{}])[0];
        const main = data.main || {};
        const wind = data.wind || {};
        const sys = data.sys || {};
        const clouds = data.clouds || {};
        const coord = data.coord || {};
        const timezone = Number(data.timezone || 0);
        const condition = weather.main || "";
        const temp = Number(main.temp);
        const iconCode = String(weather.icon || "");
        const isDay = iconCode.endsWith("d") ? true : iconCode.endsWith("n") ? false : undefined;
        return {
          location: `${data.name || ""}${sys.country ? `, ${sys.country}` : ""}`,
          temperature: main.temp,
          temperatureUnit: units === "imperial" ? "\u00B0F" : "\u00B0C",
          description: weather.description || "",
          condition,
          symbol: WEATHER_SYMBOLS[condition] || "\uD83C\uDF24",
          iconCode,
          isDay,
          feelsLike: main.feels_like,
          humidity: main.humidity,
          windSpeed: wind.speed,
          windUnit: units === "imperial" ? "mph" : "m/s",
          pressure: main.pressure,
          clouds: clouds.all,
          sunrise: formatLocalTime(sys.sunrise, timezone),
          sunset: formatLocalTime(sys.sunset, timezone),
          timezoneOffsetSeconds: timezone,
          source: key === payload.apiKey ? "custom key" : "inbuilt key",
          latitude: Number(coord.lat),
          longitude: Number(coord.lon),
          tempC: units === "imperial" ? ((temp - 32) * 5) / 9 : temp,
          windKmh: units === "imperial" ? Number(wind.speed || 0) * 1.60934 : Number(wind.speed || 0) * 3.6,
        };
      }
      if (response.status === 404) throw new Error("City not found");
      lastError = data.message || `Weather API error (${response.status})`;
    } catch (error) {
      lastError = error.message;
    }
  }
  try {
    return await staticFetchCurrentFallback(payload, units);
  } catch (fallbackError) {
    const message = String(lastError || "").trim() || String(fallbackError?.message || "").trim() || "Unable to fetch weather.";
    throw new Error(message);
  }
}

async function staticFetchForecast(latitude, longitude, units) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max,wind_speed_10m_max",
    hourly: "temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,uv_index,cloud_cover,precipitation",
    forecast_days: "15",
    temperature_unit: units === "imperial" ? "fahrenheit" : "celsius",
    wind_speed_unit: units === "imperial" ? "mph" : "kmh",
    precipitation_unit: units === "imperial" ? "inch" : "mm",
    timezone: "auto",
  });
  const response = await fetch(`${OPENMETEO_ENDPOINT}?${params.toString()}`);
  if (!response.ok) throw new Error(`Forecast API error (${response.status})`);
  const payload = await response.json();
  const daily = payload.daily || {};
  const hourly = payload.hourly || {};
  const dates = daily.time || [];
  const items = dates.map((date, i) => ({
    date,
    maxTemp: Number((daily.temperature_2m_max || [])[i]),
    minTemp: Number((daily.temperature_2m_min || [])[i]),
    rainProbability: Number((daily.precipitation_probability_max || [])[i] || 0),
    rainAmount: Number((daily.precipitation_sum || [])[i] || 0),
    uvIndex: Number((daily.uv_index_max || [])[i] || 0),
    windSpeed: Number((daily.wind_speed_10m_max || [])[i] || 0),
    condition: WMO_TO_CONDITION[Number((daily.weather_code || [])[i])] || "Clouds",
  }));
  const hTimes = hourly.time || [];
  const hItems = hTimes.map((time, i) => ({
    time,
    temperature: Number((hourly.temperature_2m || [])[i]),
    humidity: Number((hourly.relative_humidity_2m || [])[i] || 0),
    rainProbability: Number((hourly.precipitation_probability || [])[i] || 0),
    windSpeed: Number((hourly.wind_speed_10m || [])[i] || 0),
    uvIndex: Number((hourly.uv_index || [])[i] || 0),
    cloudCover: Number((hourly.cloud_cover || [])[i] || 0),
    precipitation: Number((hourly.precipitation || [])[i] || 0),
  }));
  return {
    units: {
      temperature: units === "imperial" ? "F" : "C",
      wind: units === "imperial" ? "mph" : "km/h",
      precipitation: units === "imperial" ? "in" : "mm",
    },
    daily: items,
    hourly: hItems,
  };
}

function staticBuildAnalytics(forecast) {
  const daily = forecast.daily || [];
  const labels = daily.map((d) => d.date);
  const temperature = daily.map((d) => Number(((d.maxTemp + d.minTemp) / 2).toFixed(2)));
  const rainProbability = daily.map((d) => Number(d.rainProbability || 0));
  const windSpeed = daily.map((d) => Number(d.windSpeed || 0));
  const uvIndex = daily.map((d) => Number(d.uvIndex || 0));
  const humidityByDay = {};
  for (const hour of forecast.hourly || []) {
    const day = String(hour.time).slice(0, 10);
    humidityByDay[day] = humidityByDay[day] || [];
    humidityByDay[day].push(Number(hour.humidity || 0));
  }
  const humidity = labels.map((d) => {
    const arr = humidityByDay[d] || [];
    if (!arr.length) return 0;
    return Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
  });
  return { labels, series: { temperature, rainProbability, windSpeed, humidity, uvIndex } };
}

function staticBuildActivity(current, forecast) {
  const today = (forecast.daily || [])[0] || {};
  const input = {
    temperatureC: Number(current.tempC || 24),
    humidity: Number(current.humidity || 55),
    uvIndex: Number(today.uvIndex || 5),
    windKmh: Number(current.windKmh || 14),
    rainProbability: Number(today.rainProbability || 20),
  };
  const definitions = ["running", "cycling", "trekking", "photography", "beach"];
  const activities = definitions.map((name) => {
    const score =
      100 -
      Math.abs(input.temperatureC - 24) * 2.2 -
      Math.max(0, input.humidity - 60) * 0.9 -
      Math.max(0, input.uvIndex - 5) * 6 -
      Math.max(0, input.windKmh - 28) * 0.8 -
      input.rainProbability * 0.45;
    const bounded = Math.max(0, Math.min(100, Number(score.toFixed(1))));
    return {
      activity: name,
      score: bounded,
      recommendation: bounded >= 70 ? `Good window for ${name}.` : bounded >= 45 ? `${name} is possible with caution.` : `${name} is less suitable now.`,
    };
  });
  activities.sort((a, b) => b.score - a.score);
  return { activities, bestActivity: activities[0], input };
}

function staticBuildAlerts(current, forecast, rules) {
  const defaults = {
    rain_probability: 70,
    temperature_c: 35,
    wind_kmh: 40,
    uv_index: 8,
  };
  for (const rule of rules || []) {
    if (rule && rule.enabled !== false && defaults[rule.ruleType] !== undefined) defaults[rule.ruleType] = Number(rule.threshold);
  }
  const daily = forecast.daily || [];
  const highestRain = Math.max(...daily.map((d) => Number(d.rainProbability || 0)), 0);
  const highestTemp = Math.max(...daily.map((d) => Number(d.maxTemp || 0)), Number(current.tempC || 0));
  const highestWind = Math.max(...daily.map((d) => Number(d.windSpeed || 0)), Number(current.windKmh || 0));
  const highestUv = Math.max(...daily.map((d) => Number(d.uvIndex || 0)), 0);
  const alerts = [];
  if (highestRain > defaults.rain_probability) alerts.push({ title: "High rain probability", severity: "medium", message: `Rain probability may reach ${highestRain.toFixed(1)}%.` });
  if (highestTemp > defaults.temperature_c) alerts.push({ title: "Heat alert", severity: "high", message: `Temperature may reach ${highestTemp.toFixed(1)} C.` });
  if (highestWind > defaults.wind_kmh) alerts.push({ title: "Strong wind alert", severity: "medium", message: `Wind may reach ${highestWind.toFixed(1)} km/h.` });
  if (highestUv > defaults.uv_index) alerts.push({ title: "High UV alert", severity: "medium", message: `UV index may reach ${highestUv.toFixed(1)}.` });
  return alerts;
}

function staticBuildSummary(current, forecast) {
  const today = (forecast.daily || [])[0] || {};
  const temp = Number(current.tempC || 0);
  const humidity = Number(current.humidity || 0);
  const wind = Number(current.windKmh || 0);
  const rain = Number(today.rainProbability || 0);
  const tempWord = temp >= 36 ? "very hot" : temp >= 30 ? "hot" : temp >= 24 ? "warm" : temp >= 16 ? "mild" : "cool";
  const humidityWord = humidity >= 75 ? "humid" : humidity >= 45 ? "moderately humid" : "dry";
  const advice = rain > 65 ? "Prefer indoor plans or keep rain protection." : wind > 35 ? "Outdoor plans should use sheltered areas." : "Outdoor activities are best in early morning or evening.";
  return `Today is expected to be ${tempWord} and ${humidityWord}. Rain chance is around ${Math.round(rain)}% with winds near ${Math.round(wind)} km/h. ${advice}`;
}

function staticBuildMlPrediction(current, forecast) {
  const daily = forecast.daily || [];
  const tomorrow = daily[1] || daily[0] || {};
  const tMin = Number(tomorrow.minTemp || current.tempC || current.temperature || 0);
  const tMax = Number(tomorrow.maxTemp || current.tempC || current.temperature || 0);
  const rainProbability = Number(tomorrow.rainProbability || 0) / 100;

  const hourly = forecast.hourly || [];
  const firstWindow = hourly.slice(0, 24).map((h) => Number(h.humidity || 0));
  const secondWindow = hourly.slice(24, 48).map((h) => Number(h.humidity || 0));
  let humidityTrend = "stable";
  if (firstWindow.length && secondWindow.length) {
    const firstAvg = firstWindow.reduce((sum, value) => sum + value, 0) / firstWindow.length;
    const secondAvg = secondWindow.reduce((sum, value) => sum + value, 0) / secondWindow.length;
    humidityTrend = secondAvg > firstAvg ? "increasing" : secondAvg < firstAvg ? "decreasing" : "stable";
  }

  return {
    temperature: Number(((tMin + tMax) / 2).toFixed(1)),
    rainProbability: Number(Math.max(0, Math.min(1, rainProbability)).toFixed(2)),
    confidence: 0.55,
    humidityTrend,
  };
}

async function staticBuildBundle(payload) {
  let location = { ...payload };
  if (!location.city && (!Number.isFinite(Number(location.latitude)) || !Number.isFinite(Number(location.longitude)))) {
    throw new Error("Provide city or valid coordinates.");
  }
  if (location.city && (!location.latitude || !location.longitude)) {
    const geo = await staticGeocodeCity(location.city);
    location = { ...location, ...geo };
  }
  const current = await staticFetchCurrent(location);
  const forecast = await staticFetchForecast(Number(current.latitude), Number(current.longitude), payload.units || "metric");
  const analytics = staticBuildAnalytics(forecast);
  const activity = staticBuildActivity(current, forecast);
  return {
    current,
    forecast,
    analytics,
    activity,
    alerts: staticBuildAlerts(current, forecast, []),
    aiSummary: staticBuildSummary(current, forecast),
    mlPrediction: staticBuildMlPrediction(current, forecast),
  };
}

function formatLocalTime(unixTs, timezoneOffset) {
  if (!unixTs) return "--";
  const local = new Date((Number(unixTs) + Number(timezoneOffset || 0)) * 1000);
  const hh = String(local.getUTCHours()).padStart(2, "0");
  const mm = String(local.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatIsoTime(isoTs) {
  if (!isoTs) return "--";
  const local = new Date(isoTs);
  if (Number.isNaN(local.getTime())) return "--";
  const hh = String(local.getHours()).padStart(2, "0");
  const mm = String(local.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function parseClockToMinutes(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function inferIsDay(c) {
  if (typeof c?.isDay === "boolean") return c.isDay;
  const iconCode = String(c?.iconCode || "");
  if (iconCode.endsWith("d")) return true;
  if (iconCode.endsWith("n")) return false;

  const sunriseMinutes = parseClockToMinutes(c?.sunrise);
  const sunsetMinutes = parseClockToMinutes(c?.sunset);
  if (sunriseMinutes === null || sunsetMinutes === null) return null;

  const timezoneOffset = Number(c?.timezoneOffsetSeconds);
  const localNow = new Date();
  const nowMinutes = Number.isFinite(timezoneOffset)
    ? (() => {
        const zoned = new Date(Date.now() + timezoneOffset * 1000);
        return zoned.getUTCHours() * 60 + zoned.getUTCMinutes();
      })()
    : localNow.getHours() * 60 + localNow.getMinutes();
  return nowMinutes >= sunriseMinutes && nowMinutes < sunsetMinutes;
}

function localNoonUtcMs(timezoneOffsetSeconds) {
  if (!Number.isFinite(Number(timezoneOffsetSeconds))) return Date.now();
  const offset = Number(timezoneOffsetSeconds);
  const shiftedNow = new Date(Date.now() + offset * 1000);
  const y = shiftedNow.getUTCFullYear();
  const m = shiftedNow.getUTCMonth();
  const d = shiftedNow.getUTCDate();
  return Date.UTC(y, m, d, 12, 0, 0) - offset * 1000;
}

function lunarPhaseFraction(atUtcMs) {
  const cycleAgeDays = (atUtcMs - REFERENCE_NEW_MOON_UTC_MS) / 86400000;
  const phase = ((cycleAgeDays / LUNAR_CYCLE_DAYS) % 1 + 1) % 1;
  return phase;
}

function moonEmojiFromPhase(phase) {
  if (phase < 0.125) return "\uD83C\uDF12";
  if (phase < 0.25) return "\uD83C\uDF13";
  if (phase < 0.375) return "\uD83C\uDF14";
  if (phase < 0.625) return "\uD83C\uDF15";
  if (phase < 0.75) return "\uD83C\uDF16";
  if (phase < 0.875) return "\uD83C\uDF17";
  return "\uD83C\uDF18";
}

function resolveNightMoonVisual(c) {
  // Fixed half-moon visual per request.
  const phase = 0.25;
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const shadowWidth = Math.max(10, Math.min(90, Math.pow(1 - illumination, 0.88) * 90));
  const shadowOffset = (phase < 0.5 ? -1 : 1) * (8 + Math.abs(phase - 0.5) * 8);

  return {
    symbol: "\uD83C\uDF13",
    phase,
    illumination,
    shadowWidth,
    shadowOffset,
  };
}

function resolveConditionVisual(c) {
  const condition = String(c?.condition || "").trim();
  const description = String(c?.description || "").toLowerCase();
  const clouds = Number(c?.clouds);
  const isDay = inferIsDay(c);

  if (condition === "Thunderstorm" || description.includes("thunder")) return { symbol: "\u26C8" };
  if (condition === "Snow" || description.includes("snow")) return { symbol: "\uD83C\uDF28" };
  if (condition === "Mist" || condition === "Fog" || description.includes("mist") || description.includes("fog") || description.includes("haze")) {
    return { symbol: "\uD83C\uDF2B" };
  }
  if (condition === "Rain" || condition === "Drizzle" || description.includes("rain") || description.includes("drizzle") || description.includes("shower")) {
    if (Number.isFinite(clouds) && clouds >= 70) return { symbol: "\uD83C\uDF27" };
    return { symbol: isDay === false ? "\u2601" : "\uD83C\uDF26" };
  }
  if (condition === "Clouds" || description.includes("cloud")) {
    return { symbol: isDay === false ? "\u2601" : "\u26C5" };
  }
  if (condition === "Clear" || description.includes("clear") || description.includes("sun")) {
    return isDay === false ? { ...resolveNightMoonVisual(c), moon: true, moonImage: true } : { symbol: "\uD83C\uDF1E" };
  }

  if (isDay === false) return { ...resolveNightMoonVisual(c), moon: true };
  if (isDay === true) return { symbol: "\u2600" };
  return { symbol: c?.symbol || "\u2601" };
}

function i18nLanguageCode(languageName) {
  return LANGUAGE_CODES[languageName] || "en";
}

async function translateText(text, languageName) {
  const source = String(text || "").trim();
  const code = i18nLanguageCode(languageName);
  if (!source || code === "en") return source;
  const cacheKey = `${code}::${source}`;
  if (i18nState.cache.has(cacheKey)) return i18nState.cache.get(cacheKey);
  try {
    const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(code)}&dt=t&q=${encodeURIComponent(source)}`;
    const response = await fetch(endpoint);
    if (!response.ok) return source;
    const payload = await response.json();
    const translated = Array.isArray(payload?.[0]) ? payload[0].map((item) => item?.[0] || "").join("") : source;
    i18nState.cache.set(cacheKey, translated || source);
    return translated || source;
  } catch {
    return source;
  }
}

function setupI18nBase() {
  if (i18nState.initialized) return;
  const textSelectors = [
    ".brand-tag",
    ".brand h1",
    ".topbar-kicker",
    ".topbar-title",
    ".group-label",
    ".section-title",
    ".section-subtitle",
    ".nav-btn",
    "#fetchBtn",
    "#locateBtn",
    "#installBtn",
    "#dashboard h2",
    "#forecast h2",
    "#analytics h2",
    "#planner h2",
    "#alerts h2",
    "#settings h2",
    ".chatbot h2",
    "#travelBtn",
    "#agriBtn",
    "#evaluateAlertsBtn",
    "#signupBtn",
    "#loginBtn",
    "#logoutBtn",
    "#saveSettingsBtn",
    "#chatSendBtn",
  ];
  for (const selector of textSelectors) {
    document.querySelectorAll(selector).forEach((node) => {
      if (!node || !node.textContent) return;
      i18nState.textBase.set(node, node.textContent);
    });
  }
  const placeholderNodes = [el.cityInput, el.apiKeyInput, el.travelDestination, el.alertEmail, el.authEmail, el.authPassword, el.chatInput];
  for (const node of placeholderNodes) {
    if (!node) continue;
    i18nState.placeholderBase.set(node, node.placeholder || "");
  }
  if (el.unitsSelect) {
    el.unitsSelect.querySelectorAll("option").forEach((option) => {
      i18nState.textBase.set(option, option.textContent || "");
    });
  }
  i18nState.initialized = true;
}

async function applySelectedLanguage() {
  setupI18nBase();
  const language = el.languageSelect?.value || "English";
  if (language === "English") {
    for (const [node, original] of i18nState.textBase.entries()) {
      if (node) node.textContent = original;
    }
    for (const [node, original] of i18nState.placeholderBase.entries()) {
      if (node) node.placeholder = original;
    }
    return;
  }

  for (const [node, original] of i18nState.textBase.entries()) {
    if (!node) continue;
    const translated = await translateText(original, language);
    node.textContent = translated;
  }
  for (const [node, original] of i18nState.placeholderBase.entries()) {
    if (!node) continue;
    const translated = await translateText(original, language);
    node.placeholder = translated;
  }
}

function setStatus(text, tone = "") {
  const message = String(text || "");
  el.statusText.textContent = message;
  el.statusText.style.color = tone === "error" ? "#d13a4d" : tone === "success" ? "#179d84" : "";
  const selectedLanguage = el.languageSelect?.value || "English";
  if (selectedLanguage !== "English") {
    void translateText(message, selectedLanguage).then((translated) => {
      if (el.statusText.textContent === message && translated) {
        el.statusText.textContent = translated;
      }
    });
  }
}

function currentPayload() {
  return { units: el.unitsSelect.value, language: el.languageSelect.value, apiKey: el.apiKeyInput.value.trim() };
}

function locationPayload() {
  const city = el.cityInput.value.trim();
  if (city) return { city };
  if (state.coords) return { latitude: state.coords.latitude, longitude: state.coords.longitude };
  return {};
}

function cacheBundle(key, value) {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  cache[key] = { at: Date.now(), value };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

function readCacheBundle(key) {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - Number(entry.at || 0) > 1000 * 60 * 30) return null;
  return entry.value;
}

function cacheKeyFromPayload(payload) {
  if (payload.city) return `city:${payload.city.toLowerCase()}:${payload.units}`;
  return `coords:${Number(payload.latitude).toFixed(2)},${Number(payload.longitude).toFixed(2)}:${payload.units}`;
}

async function loadPlatformBundle(location = {}) {
  const payload = { ...currentPayload(), ...location };
  const key = cacheKeyFromPayload(payload);
  if (!navigator.onLine) {
    setOfflineModeUi(true, OFFLINE_MODE_BANNER_TEXT);
    setStatus("Offline detected. Generating local forecast...");
    try {
      const bundle = await loadOfflineBundle(payload);
      cacheBundle(key, bundle);
      applyBundle(bundle, { offlineMode: true });
      setStatus(OFFLINE_MODE_BANNER_TEXT, "success");
      return true;
    } catch (error) {
      state.offlineMode = true;
      state.offlineForecast = null;
      renderOfflineForecastCard();
      setStatus(error.message, "error");
      return false;
    }
  }

  setOfflineModeUi(false);
  setStatus("Loading weather intelligence...");
  try {
    let bundle;
    if (state.staticMode) {
      bundle = await staticBuildBundle(payload);
    } else {
      bundle = await apiRequest("/api/platform-bundle", { method: "POST", body: JSON.stringify(payload) });
    }
    cacheBundle(key, bundle);
    await persistWeatherHistoryFromBundle(bundle);
    applyBundle(bundle, { offlineMode: false });
    setStatus(state.staticMode ? "Weather intelligence updated (static mode)" : "Weather intelligence updated", "success");
    await saveCurrentCityToServer();
    return true;
  } catch (error) {
    if (!state.staticMode) {
      // Automatic fallback when backend is not available on static hosting.
      state.staticMode = true;
      try {
        const bundle = await staticBuildBundle(payload);
        cacheBundle(key, bundle);
        await persistWeatherHistoryFromBundle(bundle);
        applyBundle(bundle, { offlineMode: false });
        setStatus("Backend unavailable. Running in static mode.", "success");
        return true;
      } catch {
        // Continue to cache fallback below.
      }
    }
    if (!navigator.onLine) {
      try {
        const bundle = await loadOfflineBundle(payload);
        cacheBundle(key, bundle);
        applyBundle(bundle, { offlineMode: true });
        setStatus(OFFLINE_MODE_BANNER_TEXT, "success");
        return true;
      } catch {
        state.offlineMode = true;
        state.offlineForecast = null;
        renderOfflineForecastCard();
        setStatus("No cached forecast available. Please connect to the internet.", "error");
        return false;
      }
    }
    const cached = readCacheBundle(key);
    if (cached) {
      applyBundle(cached, { offlineMode: false });
      setStatus(`Live request failed, using cache: ${error.message}`, "error");
      return true;
    }
    setStatus(error.message, "error");
    return false;
  }
}

function applyBundle(bundle, options = {}) {
  state.current = bundle.current;
  state.forecast = bundle.forecast;
  state.analytics = bundle.analytics;
  state.activity = bundle.activity;
  state.mlPrediction = bundle.mlPrediction || bundle.ml_prediction || null;
  state.alerts = bundle.alerts || [];
  state.offlineMode = Boolean(options.offlineMode);
  state.offlineForecast = bundle.offlineForecast || null;
  if (Number.isFinite(Number(bundle?.current?.latitude)) && Number.isFinite(Number(bundle?.current?.longitude))) {
    state.coords = { latitude: Number(bundle.current.latitude), longitude: Number(bundle.current.longitude) };
    localStorage.setItem(LAST_COORDS_KEY, JSON.stringify(state.coords));
  }

  setOfflineModeUi(state.offlineMode, OFFLINE_MODE_BANNER_TEXT);

  renderCurrent();
  renderForecast();
  renderAnalytics();
  renderActivity();
  renderMlPrediction();
  renderOfflineForecastCard();
  renderAlerts(state.alerts);
  renderAiSummary(bundle.aiSummary);
  addFavorite((state.current.location || "").split(",")[0]);
  if (state.weatherMapController) {
    void state.weatherMapController.updateContext({ apiBase: state.apiBase, staticMode: state.staticMode });
    state.weatherMapController.setFocusLocation({
      latitude: state.coords?.latitude,
      longitude: state.coords?.longitude,
      label: state.current?.location || "Selected location",
    });
  }
  void loadClimateInsights();
}

function renderCurrent() {
  if (!state.current) return;
  const c = state.current;
  const visual = resolveConditionVisual(c);
  const usesMoonImage = Boolean(visual.moonImage);
  el.conditionSymbol.textContent = usesMoonImage ? "" : visual.symbol || "\u2601";
  el.conditionSymbol.classList.toggle("is-moon-image", usesMoonImage);
  const isRealMoon = Boolean(visual.moon) && !usesMoonImage;
  el.conditionSymbol.classList.toggle("is-real-moon", isRealMoon);
  if (isRealMoon) {
    el.conditionSymbol.style.setProperty("--moon-shadow-width", `${Number(visual.shadowWidth || 48).toFixed(1)}%`);
    el.conditionSymbol.style.setProperty("--moon-shadow-offset", `${Number(visual.shadowOffset || 0).toFixed(1)}%`);
    const illumination = Number(visual.illumination || 0.5);
    el.conditionSymbol.style.setProperty("--moon-shadow-opacity", `${Math.max(0.08, Math.min(0.46, (1 - illumination) * 0.52 + 0.03)).toFixed(2)}`);
    el.conditionSymbol.style.setProperty("--moon-glow-opacity", `${Math.max(0.16, Math.min(0.42, 0.2 + illumination * 0.3)).toFixed(2)}`);
    el.conditionSymbol.style.setProperty("--moon-core-brightness", `${Math.max(0.96, Math.min(1.16, 0.96 + illumination * 0.16)).toFixed(2)}`);
  } else {
    el.conditionSymbol.style.removeProperty("--moon-shadow-width");
    el.conditionSymbol.style.removeProperty("--moon-shadow-offset");
    el.conditionSymbol.style.removeProperty("--moon-shadow-opacity");
    el.conditionSymbol.style.removeProperty("--moon-glow-opacity");
    el.conditionSymbol.style.removeProperty("--moon-core-brightness");
  }
  el.temperatureText.textContent = `${c.temperature ?? "--"} ${c.temperatureUnit || ""}`.trim();
  const baseDescription = c.description || "--";
  el.descriptionText.textContent = baseDescription;
  const selectedLanguage = el.languageSelect?.value || "English";
  if (selectedLanguage !== "English" && baseDescription && baseDescription !== "--") {
    void translateText(baseDescription, selectedLanguage).then((translated) => {
      if (translated) el.descriptionText.textContent = translated;
    });
  }
  el.locationText.textContent = c.location || "--";
  el.cityInput.value = (c.location || "").split(",")[0].trim();

  const details = [
    ["Feels", `${c.feelsLike ?? "--"} ${c.temperatureUnit || ""}`.trim()],
    ["Humidity", `${c.humidity ?? "--"}%`],
    ["Wind", `${c.windSpeed ?? "--"} ${c.windUnit || ""}`.trim()],
    ["Pressure", `${c.pressure ?? "--"} hPa`],
    ["Clouds", `${c.clouds ?? "--"}%`],
    ["Sunrise", c.sunrise || "--"],
    ["Sunset", c.sunset || "--"],
    ["Source", c.source || "--"],
  ];
  el.metricGrid.innerHTML = details.map(([k, v]) => `<div class="metric"><span>${k}</span><strong>${v}</strong></div>`).join("");
}

function renderAiSummary(text) {
  const source = text || "AI summary unavailable.";
  el.aiSummary.textContent = source;
  const selectedLanguage = el.languageSelect?.value || "English";
  if (selectedLanguage !== "English" && source) {
    void translateText(source, selectedLanguage).then((translated) => {
      if (translated) el.aiSummary.textContent = translated;
    });
  }
}

function renderActivity() {
  const activities = state.activity?.activities || [];
  if (!activities.length) {
    el.activityList.innerHTML = `<div class="list-item">No activity scores available.</div>`;
    return;
  }
  el.activityList.innerHTML = activities
    .map((item) => `<div class="list-item"><strong>${capitalize(item.activity)}</strong> <span class="muted">${item.score}/100</span><div>${item.recommendation}</div></div>`)
    .join("");
}

function renderMlPrediction() {
  if (!el.mlPredictionList) return;
  const prediction = state.mlPrediction;
  if (!prediction) {
    el.mlPredictionList.innerHTML = `<div class="list-item">ML prediction unavailable.</div>`;
    return;
  }

  let temp = "--";
  if (Number.isFinite(Number(prediction.temperature))) {
    const tempC = Number(prediction.temperature);
    if (el.unitsSelect?.value === "imperial") {
      temp = `${((tempC * 9) / 5 + 32).toFixed(1)}\u00B0F`;
    } else {
      temp = `${tempC.toFixed(1)}\u00B0C`;
    }
  }
  const rain = Number.isFinite(Number(prediction.rainProbability)) ? `${Math.round(Number(prediction.rainProbability) * 100)}%` : "--";
  const confidence = Number.isFinite(Number(prediction.confidence)) ? `${Math.round(Number(prediction.confidence) * 100)}%` : "--";
  const humidityTrend = prediction.humidityTrend || "--";

  el.mlPredictionList.innerHTML = [
    `<div class="list-item"><strong>Temperature Tomorrow</strong><div>${temp}</div></div>`,
    `<div class="list-item"><strong>Rain Probability</strong><div>${rain}</div></div>`,
    `<div class="list-item"><strong>Confidence</strong><div>${confidence}</div></div>`,
    `<div class="list-item"><strong>Humidity Trend</strong><div>${capitalize(String(humidityTrend))}</div></div>`,
  ].join("");
}

function renderForecast() {
  const daily = state.forecast?.daily || [];
  if (!daily.length) {
    el.forecastCards.innerHTML = `<div class="list-item">Forecast unavailable.</div>`;
    el.outdoorWindow.textContent = "--";
    return;
  }

  const tUnit = state.forecast?.units?.temperature === "F" ? "\u00B0F" : "\u00B0C";
  const wUnit = state.forecast?.units?.wind || "km/h";
  const pUnit = state.forecast?.units?.precipitation || "mm";

  el.forecastCards.innerHTML = daily
    .map((day, index) => {
      const d = new Date(day.date);
      const label = Number.isNaN(d.getTime())
        ? day.date
        : d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
      const condition = String(day.condition || "Clouds");
      const conditionKey = condition.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const symbol = WEATHER_SYMBOLS[condition] || "\uD83C\uDF24";
      const maxTemp = Number.isFinite(Number(day.maxTemp)) ? Math.round(Number(day.maxTemp)) : "--";
      const minTemp = Number.isFinite(Number(day.minTemp)) ? Math.round(Number(day.minTemp)) : "--";
      const rain = Number.isFinite(Number(day.rainProbability)) ? Math.round(Number(day.rainProbability)) : "--";
      const wind = Number.isFinite(Number(day.windSpeed)) ? Math.round(Number(day.windSpeed)) : "--";
      const uv = Number.isFinite(Number(day.uvIndex)) ? Number(day.uvIndex).toFixed(1) : "--";
      const precip = Number.isFinite(Number(day.rainAmount)) ? Number(day.rainAmount).toFixed(1) : "--";
      const rainText = rain === "--" ? "--" : `${rain}%`;
      const windText = wind === "--" ? "--" : `${wind} ${wUnit}`;
      const precipText = precip === "--" ? "--" : `${precip} ${pUnit}`;
      const lowText = minTemp === "--" ? "--" : `${minTemp}${tUnit}`;
      const highText = maxTemp === "--" ? "--" : `${maxTemp}${tUnit}`;

      return `<article class="forecast-card" data-condition="${escapeHtml(conditionKey)}" style="--forecast-order:${index};">
        <div class="forecast-card-head">
          <p class="forecast-day">${escapeHtml(label)}</p>
          <p class="forecast-condition-chip"><span>${symbol}</span>${escapeHtml(condition)}</p>
        </div>
        <div class="forecast-temp-band">
          <strong>${highText}</strong>
          <span>Low ${lowText}</span>
        </div>
        <div class="forecast-meta-grid">
          <div class="forecast-meta"><span>Rain</span><strong>${rainText}</strong></div>
          <div class="forecast-meta"><span>Wind</span><strong>${windText}</strong></div>
          <div class="forecast-meta"><span>UV</span><strong>${uv}</strong></div>
          <div class="forecast-meta"><span>Precip</span><strong>${precipText}</strong></div>
        </div>
      </article>`;
    })
    .join("");

  const windowText = computeOutdoorWindow();
  el.outdoorWindow.textContent = windowText;
  const selectedLanguage = el.languageSelect?.value || "English";
  if (selectedLanguage !== "English" && windowText) {
    void translateText(windowText, selectedLanguage).then((translated) => {
      if (translated) el.outdoorWindow.textContent = translated;
    });
  }
}

function computeOutdoorWindow() {
  const hourly = state.forecast?.hourly || [];
  if (!hourly.length) return "Outdoor window unavailable.";

  let best = null;
  for (const hour of hourly.slice(0, 48)) {
    const score =
      100 -
      Math.abs(Number(hour.temperature) - 24) * 2 -
      Math.max(0, Number(hour.uvIndex) - 5) * 8 -
      Math.max(0, Number(hour.windSpeed) - 20) * 1.2 -
      Number(hour.rainProbability) * 0.7;
    if (!best || score > best.score) best = { item: hour, score };
  }
  if (!best) return "No stable outdoor window detected.";

  const d = new Date(best.item.time);
  const label = Number.isNaN(d.getTime()) ? best.item.time : d.toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" });
  return `Best outdoor slot: ${label} (confidence ${Math.round(Math.max(0, Math.min(100, best.score)))}%).`;
}

function smoothSeries(values, windowSize = 3) {
  const source = Array.isArray(values) ? values.map((value) => Number(value)) : [];
  if (!source.length) return [];
  const size = Math.max(1, Number(windowSize) | 0);
  if (source.length < 3 || size <= 1) return source;

  const half = Math.floor(size / 2);
  return source.map((_, index) => {
    let sum = 0;
    let weightSum = 0;
    for (let cursor = Math.max(0, index - half); cursor <= Math.min(source.length - 1, index + half); cursor += 1) {
      const value = source[cursor];
      if (!Number.isFinite(value)) continue;
      const weight = half + 1 - Math.abs(index - cursor);
      sum += value * weight;
      weightSum += weight;
    }
    if (!weightSum) return Number.isFinite(source[index]) ? source[index] : 0;
    return Number((sum / weightSum).toFixed(2));
  });
}

function renderAnalytics() {
  const analytics = state.analytics;
  if (!analytics) return;
  const labels = analytics.labels || [];
  const series = analytics.series || {};
  renderChart("temp", el.tempChart, labels, smoothSeries(series.temperature || [], 5), "#1170ff");
  renderChart("rain", el.rainChart, labels, smoothSeries(series.rainProbability || [], 3), "#0ab3a1");
  renderChart("wind", el.windChart, labels, smoothSeries(series.windSpeed || [], 5), "#f59d0b");
  renderChart("humidity", el.humidityChart, labels, smoothSeries(series.humidity || [], 5), "#7b5cff");
  renderChart("uv", el.uvChart, labels, smoothSeries(series.uvIndex || [], 3), "#d13a4d");
}

function chartYScaleByKey(key) {
  if (key === "temp") return { min: 0, max: 50, ticks: { maxTicksLimit: 6 } };
  if (key === "rain") return { min: 0, max: 100, ticks: { maxTicksLimit: 6 } };
  if (key === "wind") return { min: 0, max: 60, ticks: { maxTicksLimit: 6 } };
  if (key === "humidity") return { min: 0, max: 100, ticks: { maxTicksLimit: 6 } };
  if (key === "uv") return { min: 0, max: 12, ticks: { maxTicksLimit: 6 } };
  return { ticks: { maxTicksLimit: 6 } };
}

function renderChart(key, canvas, labels, values, color) {
  if (!canvas || typeof Chart === "undefined") return;
  if (state.charts[key]) state.charts[key].destroy();
  const yScale = chartYScaleByKey(key);
  state.charts[key] = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{ data: values, borderColor: color, backgroundColor: `${color}33`, fill: true, tension: 0.34, pointRadius: 1.5, spanGaps: true }],
    },
    options: {
      animation: false,
      normalized: true,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { maxTicksLimit: 6 } }, y: yScale },
    },
  });
}

async function loadClimateInsights() {
  if (!state.coords) return;
  if (state.staticMode || state.offlineMode || !navigator.onLine) {
    el.climateNarrative.textContent = "Climate archive insights require backend mode. Run Flask at http://127.0.0.1:5000 for full climate analytics.";
    el.climateStats.innerHTML = "";
    return;
  }
  try {
    const payload = await apiRequest("/api/climate-insights", {
      method: "POST",
      body: JSON.stringify({ latitude: state.coords.latitude, longitude: state.coords.longitude, days: 120 }),
    });

    if (payload.status !== "ok") {
      const baseMessage = payload.message || "Climate data unavailable.";
      el.climateNarrative.textContent = baseMessage;
      const selectedLanguage = el.languageSelect?.value || "English";
      if (selectedLanguage !== "English") {
        void translateText(baseMessage, selectedLanguage).then((translated) => {
          if (translated) el.climateNarrative.textContent = translated;
        });
      }
      el.climateStats.innerHTML = "";
      return;
    }

    const baseNarrative = payload.narrative;
    el.climateNarrative.textContent = baseNarrative;
    const selectedLanguage = el.languageSelect?.value || "English";
    if (selectedLanguage !== "English") {
      void translateText(baseNarrative, selectedLanguage).then((translated) => {
        if (translated) el.climateNarrative.textContent = translated;
      });
    }
    el.climateStats.innerHTML = `
      <div class="metric"><span>Temp Change</span><strong>${payload.averageTemperatureChange}\u00B0C</strong></div>
      <div class="metric"><span>Rain Trend</span><strong>${payload.rainfallTrend}</strong></div>
      <div class="metric"><span>Hot Days</span><strong>${payload.extremeWeatherFrequency.hotDays}</strong></div>
      <div class="metric"><span>Heavy Rain Days</span><strong>${payload.extremeWeatherFrequency.heavyRainDays}</strong></div>
      <div class="metric"><span>High Wind Days</span><strong>${payload.extremeWeatherFrequency.highWindDays}</strong></div>`;
  } catch (error) {
    const baseMessage = `Climate insights failed: ${error.message}`;
    el.climateNarrative.textContent = baseMessage;
    const selectedLanguage = el.languageSelect?.value || "English";
    if (selectedLanguage !== "English") {
      void translateText(baseMessage, selectedLanguage).then((translated) => {
        if (translated) el.climateNarrative.textContent = translated;
      });
    }
  }
}

async function evaluateAlerts() {
  const rules = [
    { ruleType: "rain_probability", threshold: Number(el.ruleRain.value), enabled: true },
    { ruleType: "temperature_c", threshold: Number(el.ruleTemp.value), enabled: true },
    { ruleType: "wind_kmh", threshold: Number(el.ruleWind.value), enabled: true },
    { ruleType: "uv_index", threshold: Number(el.ruleUv.value), enabled: true },
  ];

  if (state.staticMode) {
    state.alerts = staticBuildAlerts(state.current || {}, state.forecast || { daily: [] }, rules);
    renderAlerts(state.alerts);
    await notifyBrowser(state.alerts);
    setStatus(`Alerts evaluated (${state.alerts.length} active) in static mode.`, "success");
    return;
  }

  try {
    const response = await apiRequest("/api/alerts/evaluate", {
      method: "POST",
      body: JSON.stringify({ ...currentPayload(), ...locationPayload(), rules, sendEmail: Boolean(el.alertEmail.value.trim()), email: el.alertEmail.value.trim() }),
    });
    state.alerts = response.alerts || [];
    renderAlerts(state.alerts);
    await notifyBrowser(state.alerts);
    setStatus(`Alerts evaluated (${state.alerts.length} active).`, "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function renderAlerts(alerts) {
  if (!alerts || !alerts.length) {
    el.alertList.innerHTML = `<div class="list-item">No critical alerts triggered.</div>`;
    return;
  }
  el.alertList.innerHTML = alerts.map((a) => `<div class="list-item"><strong>${a.title}</strong> <span class="muted">${a.severity}</span><div>${a.message}</div></div>`).join("");
}

async function notifyBrowser(alerts) {
  if (!alerts.length || !("Notification" in window)) return;
  if (Notification.permission === "default") await Notification.requestPermission();
  if (Notification.permission !== "granted") return;
  for (const item of alerts) new Notification(item.title, { body: item.message });
}
async function handleTravelPlanner() {
  const destination = el.travelDestination.value.trim();
  const startDate = el.travelStart.value;
  const endDate = el.travelEnd.value;
  if (!destination || !startDate || !endDate) {
    setStatus("Travel planner needs destination and dates.", "error");
    return;
  }
  if (endDate < startDate) {
    el.travelResult.innerHTML = `<div class="list-item">End date must be on or after start date.</div>`;
    return;
  }

  try {
    if (state.staticMode) {
      const units = el.unitsSelect.value === "imperial" ? "imperial" : "metric";
      const geo = await staticGeocodeCity(destination);
      const forecast = await staticFetchForecast(geo.latitude, geo.longitude, units);
      const tUnit = forecast?.units?.temperature === "F" ? "\u00B0F" : "\u00B0C";
      const daily = (forecast.daily || []).filter((d) => {
        const date = String(d.date || "").slice(0, 10);
        return date >= startDate && date <= endDate;
      });
      if (!daily.length) throw new Error("Date range is outside available forecast.");
      const scored = daily.map((d) => {
        const avg = (Number(d.maxTemp) + Number(d.minTemp)) / 2;
        const score =
          100 -
          Math.abs(avg - 24) * 2.3 -
          Math.max(0, Number(d.rainProbability) - 20) * 0.6 -
          Math.max(0, Number(d.windSpeed) - 24) * 0.9 -
          Math.max(0, Number(d.uvIndex) - 6) * 2.5;
        return { ...d, score: Number(Math.max(0, score).toFixed(1)) };
      });
      scored.sort((a, b) => b.score - a.score);
      const best = scored.slice(0, 3)
        .map(
          (d) =>
            `<div class="list-item"><strong>${escapeHtml(d.date)}</strong> <span class="muted">Score ${d.score}</span><div>${escapeHtml(d.condition || "Clouds")} | Rain ${Math.round(Number(d.rainProbability) || 0)}% | Temp ${Math.round(Number(d.minTemp) || 0)}${tUnit} to ${Math.round(Number(d.maxTemp) || 0)}${tUnit}</div></div>`,
        )
        .join("");
      const overall = Number((scored.reduce((a, b) => a + b.score, 0) / scored.length).toFixed(1));
      el.travelResult.innerHTML = `<div class="list-item"><strong>${escapeHtml(destination)}</strong><div>Overall score: ${overall}/100</div><div>Static-mode estimate for ${escapeHtml(startDate)} to ${escapeHtml(endDate)}.</div></div>${best}`;
      return;
    }

    const result = await apiRequest("/api/travel-planner", {
      method: "POST",
      body: JSON.stringify({ destination, startDate, endDate, units: el.unitsSelect.value }),
    });
    const tUnit = el.unitsSelect.value === "imperial" ? "\u00B0F" : "\u00B0C";
    const days = (result.bestTravelDays || [])
      .map(
        (d) =>
          `<div class="list-item"><strong>${escapeHtml(d.date)}</strong> <span class="muted">Score ${d.score}</span><div>${escapeHtml(d.condition || "Clouds")} | Rain ${d.rainRisk}% | Temp ${d.tempRange[0]}${tUnit} to ${d.tempRange[1]}${tUnit}</div></div>`,
      )
      .join("");
    el.travelResult.innerHTML = `<div class="list-item"><strong>${escapeHtml(result.destination || destination)}</strong><div>Overall score: ${result.weatherScore}/100</div><div>${escapeHtml(result.recommendation || "")}</div></div>${days}`;
  } catch (error) {
    el.travelResult.innerHTML = `<div class="list-item">${error.message}</div>`;
  }
}

async function handleAgricultureAdvisor() {
  try {
    const cropKey = String(el.cropType.value || "rice").toLowerCase();
    const profile = CROP_PROFILES[cropKey] || CROP_PROFILES.rice;
    if (state.staticMode) {
      const daily = (state.forecast?.daily || []).slice(0, 7);
      if (!daily.length) throw new Error("Forecast unavailable.");
      const avgTemp = daily.reduce((sum, d) => sum + (Number(d.maxTemp) + Number(d.minTemp)) / 2, 0) / daily.length;
      const rain = daily.reduce((sum, d) => sum + Number(d.rainAmount || 0), 0);
      const minTemp = Math.min(...daily.map((d) => Number(d.minTemp || 0)));
      const maxRainProb = Math.max(...daily.map((d) => Number(d.rainProbability || 0)));
      const plantingDays = daily
        .filter((d) => {
          const avg = (Number(d.maxTemp) + Number(d.minTemp)) / 2;
          return avg >= profile.tempMin && avg <= profile.tempMax && Number(d.rainProbability || 0) < 65;
        })
        .slice(0, 3)
        .map((d) => String(d.date));
      const plantingWindow = plantingDays.length
        ? `Suitable planting days: ${plantingDays.join(", ")}.`
        : "No strong planting window in the next 7 days.";
      const irrigation =
        rain >= profile.weeklyRainMm
          ? "Natural rainfall likely sufficient; reduce supplemental irrigation."
          : `Plan supplemental irrigation of approximately ${(profile.weeklyRainMm - rain).toFixed(1)} mm this week.`;
      const advice = [];
      if (avgTemp < profile.tempMin) advice.push("Average temperature is below crop comfort range; growth may slow.");
      else if (avgTemp > profile.tempMax) advice.push("Average temperature is above ideal range; monitor crop stress and soil moisture.");
      else advice.push("Temperature profile is within the crop comfort range.");
      advice.push(maxRainProb >= 70 ? "High rain probability detected; prepare drainage and disease protection." : "No severe rain spikes expected this week.");
      if (minTemp <= 2) advice.push("Frost risk is present; use crop covers during night hours.");
      if (rain < profile.weeklyRainMm) advice.push("Rainfall may be insufficient; schedule irrigation cycles.");
      const adviceHtml = advice.map((item) => `<div class="list-item">${escapeHtml(item)}</div>`).join("");
      el.agriResult.innerHTML = `
        <div class="list-item"><strong>Crop</strong><div>${escapeHtml(capitalize(cropKey))} (ideal ${profile.tempMin} to ${profile.tempMax}\u00B0C, weekly rain target ${profile.weeklyRainMm} mm)</div></div>
        <div class="list-item"><strong>Irrigation</strong><div>${escapeHtml(irrigation)}</div></div>
        <div class="list-item"><strong>Planting Window</strong><div>${escapeHtml(plantingWindow)}</div></div>
        <div class="list-item"><strong>Rain Alert</strong><div>${maxRainProb >= 70 ? "High" : "Normal"}</div></div>
        <div class="list-item"><strong>Frost Risk</strong><div>${minTemp <= 2 ? "Present" : "Low"}</div></div>
        ${adviceHtml}`;
      return;
    }

    const result = await apiRequest("/api/agriculture-advisor", {
      method: "POST",
      body: JSON.stringify({ ...currentPayload(), ...locationPayload(), cropType: el.cropType.value }),
    });
    const advice = (result.advice || []).map((item) => `<div class="list-item">${item}</div>`).join("");
    const cropName = capitalize(String(result.cropType || cropKey).toLowerCase());
    const profileText = `ideal ${profile.tempMin} to ${profile.tempMax}\u00B0C, weekly rain target ${profile.weeklyRainMm} mm`;
    el.agriResult.innerHTML = `
      <div class="list-item"><strong>Crop</strong><div>${escapeHtml(cropName)} (${profileText})</div></div>
      <div class="list-item"><strong>Irrigation</strong><div>${result.irrigationRecommendation}</div></div>
      <div class="list-item"><strong>Planting Window</strong><div>${result.plantingWindow}</div></div>
      <div class="list-item"><strong>Rain Alert</strong><div>${result.rainAlert ? "High" : "Normal"}</div></div>
      <div class="list-item"><strong>Frost Risk</strong><div>${result.frostRisk ? "Present" : "Low"}</div></div>
      ${advice}`;
  } catch (error) {
    el.agriResult.innerHTML = `<div class="list-item">${error.message}</div>`;
  }
}

function previewSkyImage() {
  if (!el.skyImageInput || !el.skyImagePreview) return;
  const file = el.skyImageInput.files?.[0];
  if (!file) {
    el.skyImagePreview.style.display = "none";
    el.skyImagePreview.removeAttribute("src");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    el.skyImagePreview.src = String(reader.result || "");
    el.skyImagePreview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

async function imageStatsFromFile(file) {
  const size = 224;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Invalid image. Please upload a valid sky photo.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Image processing is unavailable in this browser.");

  ctx.drawImage(bitmap, 0, 0, size, size);
  if (typeof bitmap.close === "function") bitmap.close();
  const pixels = ctx.getImageData(0, 0, size, size).data;
  if (!pixels || !pixels.length) throw new Error("Unable to process uploaded image.");

  let sumBrightness = 0;
  let sumBrightnessSq = 0;
  let sumSaturation = 0;
  let sumBlueRatio = 0;
  let darkCount = 0;
  let grayCount = 0;
  const count = pixels.length / 4;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    const brightness = (r + g + b) / 3;
    sumBrightness += brightness;
    sumBrightnessSq += brightness * brightness;
    if (brightness < 85) darkCount += 1;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    sumSaturation += saturation;
    if (saturation < 0.18) grayCount += 1;

    sumBlueRatio += b / Math.max(r + g + b, 1);
  }

  const meanBrightness = sumBrightness / count;
  const variance = Math.max(0, sumBrightnessSq / count - meanBrightness * meanBrightness);
  const stdBrightness = Math.sqrt(variance);
  const meanSaturation = sumSaturation / count;
  const meanBlueRatio = sumBlueRatio / count;
  const darkFraction = darkCount / count;
  const grayFraction = grayCount / count;

  return {
    meanBrightness,
    stdBrightness,
    meanSaturation,
    meanBlueRatio,
    darkFraction,
    grayFraction,
  };
}

async function staticSkyAnalysis(file) {
  const stats = await imageStatsFromFile(file);
  const bNorm = clamp01(stats.meanBrightness / 255);
  const stdNorm = clamp01(stats.stdBrightness / 128);
  const sat = clamp01(stats.meanSaturation);
  const blue = clamp01(stats.meanBlueRatio);
  const dark = clamp01(stats.darkFraction);
  const gray = clamp01(stats.grayFraction);

  const labels = ["clear_sky", "rain_clouds", "storm_clouds", "overcast"];
  const scoreByClass = [
    0.45 * bNorm + 0.35 * sat + 0.35 * blue - 0.4 * dark,
    0.45 * gray + 0.3 * dark + 0.2 * (1 - blue) + 0.15 * stdNorm,
    0.55 * dark + 0.25 * stdNorm + 0.2 * gray - 0.15 * bNorm,
    0.5 * gray + 0.25 * dark + 0.2 * (1 - sat) + 0.1 * (1 - blue),
  ];

  const expScores = scoreByClass.map((score) => Math.exp(score * 3));
  const expTotal = expScores.reduce((sum, value) => sum + value, 0) || 1;
  const probs = expScores.map((value) => value / expTotal);

  const topIndex = probs.reduce((best, value, idx, arr) => (value > arr[best] ? idx : best), 0);
  const sorted = [...probs].sort((a, b) => b - a);
  const confidence = clamp01(sorted[0]);

  let rainProbability = clamp01(probs[1] + 0.9 * probs[2] + 0.5 * probs[3]);
  const stormRisk = clamp01(probs[2] + 0.3 * probs[1]);
  const cloudDensity = clamp01((0.95 * probs[2]) + (0.75 * probs[1]) + (0.9 * probs[3]) + (0.15 * probs[0]) + (0.1 * dark));

  const tomorrow = (state.forecast?.daily || [])[1] || (state.forecast?.daily || [])[0];
  if (tomorrow && Number.isFinite(Number(tomorrow.rainProbability))) {
    const forecastRain = clamp01(Number(tomorrow.rainProbability) / 100);
    rainProbability = clamp01((0.7 * rainProbability) + (0.3 * forecastRain));
    return {
      sky_condition: labels[topIndex],
      rain_probability: Number(rainProbability.toFixed(2)),
      storm_risk: Number(stormRisk.toFixed(2)),
      cloud_density: Number(cloudDensity.toFixed(2)),
      confidence: Number(confidence.toFixed(2)),
      forecast_rain_probability: Number(forecastRain.toFixed(2)),
      analysis_mode: "static_heuristic",
    };
  }

  return {
    sky_condition: labels[topIndex],
    rain_probability: Number(rainProbability.toFixed(2)),
    storm_risk: Number(stormRisk.toFixed(2)),
    cloud_density: Number(cloudDensity.toFixed(2)),
    confidence: Number(confidence.toFixed(2)),
    analysis_mode: "static_heuristic",
  };
}

function skyAnalysisMarkup(result) {
  const rain = Number.isFinite(Number(result.rain_probability)) ? `${Math.round(Number(result.rain_probability) * 100)}%` : "--";
  const storm = Number.isFinite(Number(result.storm_risk)) ? `${Math.round(Number(result.storm_risk) * 100)}%` : "--";
  const cloudDensity = Number.isFinite(Number(result.cloud_density)) ? `${Math.round(Number(result.cloud_density) * 100)}%` : "--";
  const confidence = Number.isFinite(Number(result.confidence)) ? `${Math.round(Number(result.confidence) * 100)}%` : "--";
  const forecastRain =
    Number.isFinite(Number(result.forecast_rain_probability))
      ? `${Math.round(Number(result.forecast_rain_probability) * 100)}%`
      : null;
  const mode = result.analysis_mode ? String(result.analysis_mode).replaceAll("_", " ") : null;

  const extra = forecastRain
    ? `<div class="list-item"><strong>Forecast Rain (Blend Input)</strong><div>${forecastRain}</div></div>`
    : "";
  const modeItem = mode
    ? `<div class="list-item"><strong>Analysis Mode</strong><div>${escapeHtml(capitalize(mode))}</div></div>`
    : "";

  return [
    `<div class="list-item"><strong>Sky Condition</strong><div>${escapeHtml(capitalize(String(result.sky_condition || "--").replaceAll("_", " ")))}</div></div>`,
    `<div class="list-item"><strong>Rain Probability</strong><div>${rain}</div></div>`,
    `<div class="list-item"><strong>Storm Risk</strong><div>${storm}</div></div>`,
    `<div class="list-item"><strong>Cloud Density</strong><div>${cloudDensity}</div></div>`,
    `<div class="list-item"><strong>Confidence</strong><div>${confidence}</div></div>`,
    modeItem,
    extra,
  ]
    .filter(Boolean)
    .join("");
}

function renderSkyAnalysis(result) {
  if (!el.skyAnalysisResult) return;
  if (!result) {
    el.skyAnalysisResult.innerHTML = `<div class="list-item">Sky analysis unavailable.</div>`;
    return;
  }
  el.skyAnalysisResult.innerHTML = skyAnalysisMarkup(result);
}

function renderLiveSkyAnalysis(result) {
  if (!el.liveSkyResult) return;
  if (!result) {
    el.liveSkyResult.innerHTML = `<div class="list-item">Live camera prediction unavailable.</div>`;
    return;
  }
  el.liveSkyResult.innerHTML = skyAnalysisMarkup(result);
}

function buildSkyVisionFormData(imageBlob, filename = "sky.jpg") {
  const body = new FormData();
  body.append("image", imageBlob, filename);
  if (state.coords?.latitude != null && state.coords?.longitude != null) {
    body.append("lat", String(state.coords.latitude));
    body.append("lon", String(state.coords.longitude));
  }
  return body;
}

async function requestSkyPrediction(imageBlob, options = {}) {
  const liveMode = Boolean(options.liveMode);
  const filename = options.filename || (liveMode ? "live-sky.jpg" : "sky.jpg");
  if (state.staticMode) {
    const staticResult = await staticSkyAnalysis(imageBlob);
    return { ...staticResult, input_source: liveMode ? "live_camera" : "upload" };
  }

  const endpointPath = liveMode ? "/api/vision/live-sky" : "/api/vision/sky-analysis";
  const endpoint = `${state.apiBase || ""}${endpointPath}`;
  const response = await fetch(endpoint, {
    method: "POST",
    credentials: state.apiBase ? "include" : "same-origin",
    body: buildSkyVisionFormData(imageBlob, filename),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Sky analysis failed (${response.status})`);
  return payload;
}

async function analyzeSkyImage() {
  if (!el.skyImageInput) return;
  const file = el.skyImageInput.files?.[0];
  if (!file) {
    setStatus("Select a sky image first.", "error");
    return;
  }

  setStatus("Analyzing sky image...");
  try {
    const result = await requestSkyPrediction(file, {
      liveMode: false,
      filename: file.name || "sky.jpg",
    });
    state.skyAnalysis = result;
    renderSkyAnalysis(result);
    renderLiveSkyAnalysis(result);
    setStatus(state.staticMode ? "Sky image analyzed in static mode." : "Sky image analysis complete.", "success");
  } catch (error) {
    renderSkyAnalysis(null);
    renderLiveSkyAnalysis(null);
    setStatus(error.message, "error");
  }
}

async function ensureLiveCameraController() {
  if (state.liveCamera.controller) return state.liveCamera.controller;
  const module = await getLiveCameraModule();
  const controller = new module.LiveCameraController({
    videoElement: el.liveCameraVideo,
    canvasElement: el.liveCameraCanvas,
  });
  state.liveCamera.controller = controller;
  return controller;
}

function initializeLiveCameraUi() {
  if (!el.liveCameraStartBtn || !el.liveCameraVideo || !el.liveCameraCanvas) return;
  const supported = Boolean(navigator?.mediaDevices?.getUserMedia);
  if (!supported) {
    el.liveCameraStartBtn.disabled = true;
    if (el.liveCameraStopBtn) el.liveCameraStopBtn.disabled = true;
    if (el.liveCameraCaptureBtn) el.liveCameraCaptureBtn.disabled = true;
    if (el.liveCameraScanBtn) el.liveCameraScanBtn.disabled = true;
    setLiveCameraStatus("Live camera is unavailable in this browser. Use file upload as fallback.", "error");
    return;
  }
  setLiveCameraStatus("Use Start Camera to begin live sky scanning.");
  setLiveCameraButtons();
}

async function startLiveCamera() {
  if (!el.liveCameraVideo || !el.liveCameraCanvas) return;
  try {
    const controller = await ensureLiveCameraController();
    await controller.start();
    if (el.liveCameraCanvas) el.liveCameraCanvas.style.display = "none";
    setLiveCameraStatus("Camera started. Point to sky and capture.");
    setStatus("Live camera ready.", "success");
  } catch (error) {
    setLiveCameraStatus(`Camera error: ${error.message}`, "error");
    setStatus(error.message, "error");
  } finally {
    setLiveCameraButtons();
  }
}

function stopLiveCamera() {
  stopLiveScan();
  state.liveCamera.busy = false;
  if (state.liveCamera.controller) {
    state.liveCamera.controller.stop();
  }
  setLiveCameraStatus("Camera stopped.");
  setLiveCameraButtons();
}

async function captureLiveSkyFrame(options = {}) {
  const fromLiveScan = Boolean(options.fromLiveScan);
  const controller = state.liveCamera.controller;
  if (!controller || !controller.isActive()) {
    if (!fromLiveScan) setStatus("Start camera before capture.", "error");
    setLiveCameraStatus("Start camera before capture.", "error");
    return;
  }
  if (state.liveCamera.busy) return;

  state.liveCamera.busy = true;
  setLiveCameraButtons();
  try {
    if (!fromLiveScan) {
      setStatus("Capturing live sky frame...");
    }
    const captured = await controller.captureFrame({ type: "image/jpeg", quality: 0.92 });
    if (el.liveCameraCanvas) el.liveCameraCanvas.style.display = "block";

    clearExpiredLivePredictionCache();
    const cacheKey = livePredictionCacheKey(captured.signature);
    let result = null;
    const cached = state.liveCamera.predictionCache.get(cacheKey);
    if (cached && Date.now() - Number(cached.at || 0) <= LIVE_SCAN_CACHE_TTL_MS) {
      result = { ...cached.value, analysis_mode: "client_frame_cache" };
    } else {
      result = await requestSkyPrediction(captured.blob, {
        liveMode: true,
        filename: `live-sky-${Date.now()}.jpg`,
      });
      state.liveCamera.predictionCache.set(cacheKey, { at: Date.now(), value: result });
      if (state.liveCamera.predictionCache.size > 80) {
        const oldestKey = state.liveCamera.predictionCache.keys().next().value;
        if (oldestKey) state.liveCamera.predictionCache.delete(oldestKey);
      }
    }

    state.skyAnalysis = result;
    renderSkyAnalysis(result);
    renderLiveSkyAnalysis(result);
    if (fromLiveScan) {
      setLiveCameraStatus("Live scan updated.");
    } else {
      setStatus("Live sky analysis complete.", "success");
      setLiveCameraStatus("Sky frame analyzed successfully.", "success");
    }
  } catch (error) {
    renderLiveSkyAnalysis(null);
    if (!fromLiveScan) setStatus(error.message, "error");
    setLiveCameraStatus(error.message, "error");
  } finally {
    state.liveCamera.busy = false;
    setLiveCameraButtons();
  }
}

async function toggleLiveSkyScan() {
  if (state.liveCamera.scanning) {
    stopLiveScan();
    setLiveCameraStatus("Live scan stopped.");
    setLiveCameraButtons();
    return;
  }

  if (!state.liveCamera.controller?.isActive?.()) {
    await startLiveCamera();
    if (!state.liveCamera.controller?.isActive?.()) {
      return;
    }
  }

  state.liveCamera.scanning = true;
  setLiveScanButtonLabel(true);
  setLiveCameraStatus("Live scan running every 5 seconds.");
  await captureLiveSkyFrame({ fromLiveScan: true });
  state.liveCamera.scanTimer = setInterval(() => {
    void captureLiveSkyFrame({ fromLiveScan: true });
  }, LIVE_SCAN_INTERVAL_MS);
  setLiveCameraButtons();
}

function appendChat(text, role) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role === "user" ? "chat-user" : "chat-bot"}`;
  bubble.textContent = text;
  el.chatLog.appendChild(bubble);
  el.chatLog.scrollTop = el.chatLog.scrollHeight;
}

function chatHas(text, words) {
  return words.some((word) => text.includes(word));
}

function chatNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function chatResolveDay(text, daily) {
  if (!daily.length) return null;
  if (text.includes("today")) return daily[0];
  if (text.includes("tomorrow")) return daily[1] || null;
  const match = text.match(/\bin\s+(\d{1,2})\s+day/);
  if (match) {
    const idx = Number(match[1]);
    if (Number.isFinite(idx) && idx >= 0 && idx < daily.length) return daily[idx];
  }
  return null;
}

function chatFormatDayLabel(day) {
  const raw = String(day?.date || "").trim();
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw || "selected day";
  return parsed.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
}

function answerStaticWeatherQuestion(question) {
  const current = state.current || {};
  const daily = state.forecast?.daily || [];
  const hourly = state.forecast?.hourly || [];
  const text = String(question || "").toLowerCase().trim();

  if (!daily.length) return "Load weather first, then ask about rain, temperature, humidity, wind, UV, sunrise/sunset, or weekend forecast.";

  const selectedDay = chatResolveDay(text, daily);
  const selectedLabel = selectedDay ? chatFormatDayLabel(selectedDay) : "today";

  if (chatHas(text, ["sunrise", "sunset", "daylight"])) {
    return `Sunrise is around ${current.sunrise || "--"} and sunset is around ${current.sunset || "--"}.`;
  }
  if (chatHas(text, ["humidity", "humid"])) {
    return `Current humidity is around ${Math.round(chatNum(current.humidity))}%.`;
  }
  if (chatHas(text, ["wind", "breeze", "gust"])) {
    return `Current wind is about ${chatNum(current.windSpeed).toFixed(1)} ${current.windUnit || "m/s"}.`;
  }
  if (chatHas(text, ["uv", "sunburn", "sunscreen"])) {
    const uv = chatNum((selectedDay || daily[0]).uvIndex);
    const level = uv >= 8 ? "very high" : uv >= 6 ? "high" : uv >= 3 ? "moderate" : "low";
    return `${selectedLabel} UV index is around ${uv.toFixed(1)} (${level}).`;
  }
  if (chatHas(text, ["rain", "umbrella", "precip", "drizzle", "shower"])) {
    const day = selectedDay || daily[0];
    const rain = chatNum(day.rainProbability);
    const amount = chatNum(day.rainAmount);
    return `${selectedLabel} rain chance is ${Math.round(rain)}% with about ${amount.toFixed(1)} ${(state.forecast?.units?.precipitation || "mm")}. ${rain >= 45 ? "Carry an umbrella." : "Umbrella is usually optional."}`;
  }
  if (chatHas(text, ["temperature", "temp", "hot", "cold", "heat", "feels like"])) {
    if (selectedDay) {
      return `${selectedLabel} temperature is expected around ${Math.round(chatNum(selectedDay.minTemp))} to ${Math.round(chatNum(selectedDay.maxTemp))}${state.current?.temperatureUnit || "°C"}.`;
    }
    return `Current temperature is ${Math.round(chatNum(current.temperature))}${current.temperatureUnit || "°C"} and feels like ${Math.round(chatNum(current.feelsLike))}${current.temperatureUnit || "°C"}.`;
  }
  if (chatHas(text, ["hottest", "warmest", "coldest", "coolest"])) {
    if (text.includes("cold") || text.includes("cool")) {
      const coldest = daily.reduce((best, item) => (chatNum(item.minTemp, 999) < chatNum(best.minTemp, 999) ? item : best), daily[0]);
      return `Coldest forecast day is ${chatFormatDayLabel(coldest)} at about ${Math.round(chatNum(coldest.minTemp))}${state.current?.temperatureUnit || "°C"}.`;
    }
    const hottest = daily.reduce((best, item) => (chatNum(item.maxTemp, -999) > chatNum(best.maxTemp, -999) ? item : best), daily[0]);
    return `Hottest forecast day is ${chatFormatDayLabel(hottest)} at about ${Math.round(chatNum(hottest.maxTemp))}${state.current?.temperatureUnit || "°C"}.`;
  }
  if (chatHas(text, ["weekend"])) {
    const weekend = daily.filter((item) => {
      const d = new Date(item.date);
      return !Number.isNaN(d.getTime()) && (d.getDay() === 0 || d.getDay() === 6);
    });
    if (!weekend.length) return "Weekend forecast is outside the current 15-day range.";
    const highs = weekend.map((item) => chatNum(item.maxTemp));
    const lows = weekend.map((item) => chatNum(item.minTemp));
    const rain = Math.max(...weekend.map((item) => chatNum(item.rainProbability)), 0);
    return `Weekend temperatures are around ${Math.round(Math.min(...lows))}-${Math.round(Math.max(...highs))}${state.current?.temperatureUnit || "°C"} with peak rain chance near ${Math.round(rain)}%.`;
  }
  if (chatHas(text, ["outdoor", "activity", "best time", "walk", "run", "jog", "picnic"])) {
    const windowText = computeOutdoorWindow();
    const best = state.activity?.bestActivity;
    if (best) return `${windowText} Recommended activity now: ${best.activity} (${best.score}/100).`;
    return windowText;
  }
  if (chatHas(text, ["forecast", "next", "upcoming", "weather"])) {
    const today = daily[0];
    const tomorrow = daily[1];
    const line1 = `Today: ${String(today.condition || "mixed").toLowerCase()}, rain chance ${Math.round(chatNum(today.rainProbability))}%.`;
    if (!tomorrow) return line1;
    const line2 = `Tomorrow: ${String(tomorrow.condition || "mixed").toLowerCase()}, ${Math.round(chatNum(tomorrow.minTemp))}-${Math.round(chatNum(tomorrow.maxTemp))}${state.current?.temperatureUnit || "°C"}.`;
    return `${line1} ${line2}`;
  }
  return staticBuildSummary(current, state.forecast || { daily: [] });
}

async function askChatbot() {
  const question = el.chatInput.value.trim();
  if (!question) return;
  el.chatInput.value = "";
  appendChat(question, "user");
  if (state.staticMode) {
    appendChat(answerStaticWeatherQuestion(question), "bot");
    return;
  }

  try {
    const response = await apiRequest("/api/chatbot", {
      method: "POST",
      body: JSON.stringify({ ...currentPayload(), ...locationPayload(), question }),
    });
    appendChat(response.answer || "No answer available.", "bot");
  } catch (error) {
    appendChat(`Error: ${error.message}`, "bot");
  }
}

function setupSectionNavigation() {
  el.nav.addEventListener("click", (event) => {
    const target = event.target.closest(".nav-btn");
    if (!target) return;
    const section = target.getAttribute("data-section");
    document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("is-active"));
    target.classList.add("is-active");
    document.querySelectorAll(".section").forEach((item) => item.classList.remove("is-active"));
    document.getElementById(section)?.classList.add("is-active");
    if (section === "analytics" && state.analytics) {
      requestAnimationFrame(() => renderAnalytics());
    }
    if (section === "maps" && state.weatherMapController) {
      requestAnimationFrame(() => state.weatherMapController.invalidateSize());
    }
    if (isMobileNavViewport()) closeSidebarNav();
  });
}

function isMobileNavViewport() {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia === "function") return window.matchMedia("(max-width: 1080px)").matches;
  return window.innerWidth <= 1080;
}

function closeSidebarNav() {
  if (!el.appShell) return;
  el.appShell.classList.remove("sidebar-open");
  if (el.sidebarToggle) el.sidebarToggle.setAttribute("aria-expanded", "false");
}

function toggleSidebarNav() {
  if (!el.appShell || !el.sidebarToggle || !isMobileNavViewport()) return;
  const willOpen = !el.appShell.classList.contains("sidebar-open");
  el.appShell.classList.toggle("sidebar-open", willOpen);
  el.sidebarToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
}

function setupResponsiveSidebar() {
  if (!el.sidebarToggle || !el.appShell || !el.sidebar) return;

  el.sidebarToggle.addEventListener("click", () => toggleSidebarNav());

  document.addEventListener("click", (event) => {
    if (!isMobileNavViewport() || !el.appShell.classList.contains("sidebar-open")) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".sidebar")) return;
    closeSidebarNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSidebarNav();
  });

  window.addEventListener("resize", () => {
    if (!isMobileNavViewport()) closeSidebarNav();
  });
}

function setupQuickCities() {
  el.quickCities.innerHTML = QUICK_CITIES.map((city) => `<button class="chip" data-city="${city}" type="button">${city}</button>`).join("");
  el.quickCities.addEventListener("click", (event) => {
    const target = event.target.closest("[data-city]");
    if (!target) return;
    const city = target.getAttribute("data-city");
    el.cityInput.value = city;
    void loadPlatformBundle({ city });
  });
}

function loadLocalFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.localFavorites));
}

function addFavorite(city) {
  const clean = (city || "").trim();
  if (!clean) return;
  state.localFavorites = [clean, ...state.localFavorites.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
  saveLocalFavorites();
  renderLocalFavorites();
}

function renderLocalFavorites() {
  el.favoriteCities.innerHTML = state.localFavorites
    .map((city) => `<button class="chip" data-fav-city="${city}" type="button">${city}</button>`)
    .join("");
}

function setupFavoritesEvents() {
  el.favoriteCities.addEventListener("click", (event) => {
    const target = event.target.closest("[data-fav-city]");
    if (!target) return;
    const city = target.getAttribute("data-fav-city");
    el.cityInput.value = city;
    void loadPlatformBundle({ city });
  });
}

async function loadAuthState() {
  if (state.staticMode) {
    state.user = { authenticated: false };
    applyUserState();
    return;
  }
  try {
    state.user = await apiRequest("/api/auth/me");
  } catch {
    state.user = { authenticated: false };
  }
  applyUserState();
}

function applyUserState() {
  if (!state.user.authenticated) {
    el.authState.textContent = "Not logged in";
    el.savedCitiesServer.innerHTML = "";
    return;
  }

  el.authState.textContent = `Logged in as ${state.user.user.email}`;
  if (state.user.settings) {
    el.alertEmail.value = state.user.settings.notificationEmail || "";
    el.darkModeToggle.checked = Boolean(state.user.settings.darkMode);
    el.unitsSelect.value = state.user.settings.units || el.unitsSelect.value;
    if (state.user.settings.language) el.languageSelect.value = state.user.settings.language;
    void applySelectedLanguage();
    applyDarkMode();
  }

  const saved = state.user.savedCities || [];
  el.savedCitiesServer.innerHTML = saved.map((city) => `<button class="chip" data-server-city="${city}" type="button">${city}</button>`).join("");

  for (const rule of state.user.alertRules || []) {
    if (rule.ruleType === "rain_probability") el.ruleRain.value = rule.threshold;
    if (rule.ruleType === "temperature_c") el.ruleTemp.value = rule.threshold;
    if (rule.ruleType === "wind_kmh") el.ruleWind.value = rule.threshold;
    if (rule.ruleType === "uv_index") el.ruleUv.value = rule.threshold;
  }
}

async function authSignup() {
  if (state.staticMode) {
    setStatus("Signup requires backend mode (run Flask app).", "error");
    return;
  }
  try {
    await apiRequest("/api/auth/signup", { method: "POST", body: JSON.stringify({ email: el.authEmail.value.trim(), password: el.authPassword.value }) });
    await loadAuthState();
    setStatus("Account created.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function authLogin() {
  if (state.staticMode) {
    setStatus("Login requires backend mode (run Flask app).", "error");
    return;
  }
  try {
    await apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify({ email: el.authEmail.value.trim(), password: el.authPassword.value }) });
    await loadAuthState();
    setStatus("Logged in.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function authLogout() {
  if (state.staticMode) {
    state.user = { authenticated: false };
    applyUserState();
    return;
  }
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
    state.user = { authenticated: false };
    applyUserState();
    setStatus("Logged out.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function savePreferences() {
  const settings = {
    language: el.languageSelect.value,
    units: el.unitsSelect.value,
    darkMode: el.darkModeToggle.checked,
    notificationEmail: el.alertEmail.value.trim(),
    alertsEnabled: true,
  };
  if (state.staticMode) {
    localStorage.setItem("weather-studio-dark-mode", el.darkModeToggle.checked ? "1" : "0");
    applyDarkMode();
    setStatus("Preferences saved locally (static mode).", "success");
    return;
  }
  try {
    if (state.user.authenticated) {
      await apiRequest("/api/user/settings", { method: "POST", body: JSON.stringify(settings) });
      await apiRequest("/api/user/alert-rules", {
        method: "POST",
        body: JSON.stringify({
          rules: [
            { ruleType: "rain_probability", threshold: Number(el.ruleRain.value), enabled: true },
            { ruleType: "temperature_c", threshold: Number(el.ruleTemp.value), enabled: true },
            { ruleType: "wind_kmh", threshold: Number(el.ruleWind.value), enabled: true },
            { ruleType: "uv_index", threshold: Number(el.ruleUv.value), enabled: true },
          ],
        }),
      });
    }
    localStorage.setItem("weather-studio-dark-mode", el.darkModeToggle.checked ? "1" : "0");
    applyDarkMode();
    setStatus("Preferences saved.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function applyDarkMode() {
  const isDark = Boolean(el.darkModeToggle?.checked);
  document.body.classList.toggle("dark", isDark);
  if (el.themeToggleBtn) {
    const iconNode = el.themeToggleBtn.querySelector(".theme-toggle-icon");
    if (iconNode) iconNode.textContent = isDark ? "\u2600" : "\uD83C\uDF19";
    const nextModeLabel = isDark ? "Switch to light mode" : "Switch to dark mode";
    el.themeToggleBtn.setAttribute("aria-label", nextModeLabel);
    el.themeToggleBtn.setAttribute("title", nextModeLabel);
    el.themeToggleBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
  }
  localStorage.setItem("weather-studio-dark-mode", isDark ? "1" : "0");
}

async function saveCurrentCityToServer() {
  if (state.staticMode || !state.user.authenticated || !el.cityInput.value.trim()) return;
  try {
    const response = await apiRequest("/api/user/cities", { method: "POST", body: JSON.stringify({ city: el.cityInput.value.trim() }) });
    state.user.savedCities = response.cities || [];
    applyUserState();
  } catch {
    // silent
  }
}
async function detectLocation() {
  if (navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, maximumAge: 900000 })
      );
      return { latitude: Number(position.coords.latitude), longitude: Number(position.coords.longitude), source: "geolocation" };
    } catch {
      // continue fallback
    }
  }

  try {
    const cached = JSON.parse(localStorage.getItem(LAST_COORDS_KEY) || "{}");
    if (Number.isFinite(Number(cached.latitude)) && Number.isFinite(Number(cached.longitude))) {
      return { latitude: Number(cached.latitude), longitude: Number(cached.longitude), source: "cache" };
    }
  } catch {
    // continue fallback
  }

  for (const url of ["https://ipapi.co/json/", "https://ipwho.is/"]) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const payload = await response.json();
      const latitude = Number(payload.latitude);
      const longitude = Number(payload.longitude);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) return { latitude, longitude, source: "ip" };
    } catch {
      // continue fallback
    }
  }

  return { ...DEFAULT_COORDS, source: "default" };
}

async function useCurrentLocation() {
  setStatus("Detecting location...");
  try {
    const detected = await detectLocation();
    const coords = { latitude: Number(detected.latitude), longitude: Number(detected.longitude) };
    state.coords = coords;
    const loaded = await loadPlatformBundle(coords);
    if (!loaded) return;
    if (detected.source && detected.source !== "geolocation") {
      setStatus("Using approximate location.", "success");
    }
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function fetchConfig() {
  const detected = await detectBackendConfig();
  if (detected) {
    state.apiBase = detected.apiBase || "";
    state.config = detected.config;
    state.staticMode = false;
  } else {
    state.apiBase = "";
    state.staticMode = true;
    state.config = {
      languages: [
        "English", "Assamese", "Bengali", "Bodo", "Dogri", "Gujarati", "Hindi", "Kannada", "Kashmiri",
        "Konkani", "Maithili", "Malayalam", "Manipuri", "Marathi", "Nepali", "Odia", "Punjabi",
        "Sanskrit", "Santali", "Sindhi", "Tamil", "Telugu", "Urdu",
      ],
      defaultLanguage: "English",
      defaultUnits: "metric",
    };
    setStatus("Backend API not found. Running in static mode.", "error");
  }

  const languages = state.config.languages || ["English"];
  el.languageSelect.innerHTML = languages.map((lang) => `<option value="${lang}">${lang}</option>`).join("");
  el.languageSelect.value = state.config.defaultLanguage || "English";
  el.unitsSelect.value = state.config.defaultUnits || "metric";
}

function setupPwa() {
  if (!el.installBtn) return;

  if (el.installBtn) {
    el.installBtn.hidden = false;
    el.installBtn.disabled = true;
    el.installBtn.textContent = "Install App";
  }

  if ("caches" in window) {
    const activeCaches = new Set([PWA_CACHE_NAME, `${PWA_CACHE_NAME}-ui`, `${PWA_CACHE_NAME}-data`]);
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith("weather-studio-pwa-") && !activeCaches.has(key)).map((key) => caches.delete(key)))
      )
      .catch(() => {});
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => registration.update().catch(() => {}))
      .catch(() => {});
  }
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredPrompt = event;
    if (el.installBtn) el.installBtn.disabled = false;
  });
  window.addEventListener("appinstalled", () => {
    state.deferredPrompt = null;
    if (el.installBtn) {
      el.installBtn.disabled = true;
      el.installBtn.textContent = "App Installed";
    }
  });
  el.installBtn.addEventListener("click", async () => {
    if (!state.deferredPrompt) {
      setStatus("Install prompt not available yet. Keep using the app and try again.", "error");
      return;
    }
    state.deferredPrompt.prompt();
    await state.deferredPrompt.userChoice;
    state.deferredPrompt = null;
    el.installBtn.disabled = true;
  });
}

function setupConnectivityWatchers() {
  const onConnectivityChange = () => {
    if (navigator.onLine) {
      if (state.offlineMode) {
        setStatus("Connection restored. Refreshing live weather...", "success");
        void loadPlatformBundle(locationPayload());
      } else {
        setOfflineModeUi(false);
      }
      return;
    }

    setOfflineModeUi(true, OFFLINE_MODE_BANNER_TEXT);
    renderOfflineForecastCard();
    setStatus("You are offline. Weather updates will use cached history.", "error");
    void loadPlatformBundle(locationPayload());
  };

  window.addEventListener("online", onConnectivityChange);
  window.addEventListener("offline", onConnectivityChange);
  onConnectivityChange();
}

function setupSavedServerCities() {
  el.savedCitiesServer.addEventListener("click", (event) => {
    const target = event.target.closest("[data-server-city]");
    if (!target) return;
    const city = target.getAttribute("data-server-city");
    el.cityInput.value = city;
    void loadPlatformBundle({ city });
  });
}

function wireEvents() {
  el.fetchBtn.addEventListener("click", () => {
    const city = el.cityInput.value.trim();
    if (!city) {
      setStatus("Enter a city name.", "error");
      return;
    }
    void loadPlatformBundle({ city });
  });
  el.cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") el.fetchBtn.click();
  });
  el.locateBtn.addEventListener("click", () => void useCurrentLocation());
  el.travelBtn.addEventListener("click", () => void handleTravelPlanner());
  el.agriBtn.addEventListener("click", () => void handleAgricultureAdvisor());
  if (el.skyImageInput) {
    el.skyImageInput.addEventListener("change", previewSkyImage);
  }
  if (el.skyAnalyzeBtn) {
    el.skyAnalyzeBtn.addEventListener("click", () => void analyzeSkyImage());
  }
  if (el.liveCameraStartBtn) {
    el.liveCameraStartBtn.addEventListener("click", () => void startLiveCamera());
  }
  if (el.liveCameraStopBtn) {
    el.liveCameraStopBtn.addEventListener("click", () => stopLiveCamera());
  }
  if (el.liveCameraCaptureBtn) {
    el.liveCameraCaptureBtn.addEventListener("click", () => void captureLiveSkyFrame());
  }
  if (el.liveCameraScanBtn) {
    el.liveCameraScanBtn.addEventListener("click", () => void toggleLiveSkyScan());
  }
  el.evaluateAlertsBtn.addEventListener("click", () => void evaluateAlerts());
  el.chatSendBtn.addEventListener("click", () => void askChatbot());
  el.chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") void askChatbot();
  });
  el.signupBtn.addEventListener("click", () => void authSignup());
  el.loginBtn.addEventListener("click", () => void authLogin());
  el.logoutBtn.addEventListener("click", () => void authLogout());
  el.saveSettingsBtn.addEventListener("click", () => void savePreferences());
  el.darkModeToggle.addEventListener("change", applyDarkMode);
  if (el.themeToggleBtn) {
    el.themeToggleBtn.addEventListener("click", () => {
      el.darkModeToggle.checked = !el.darkModeToggle.checked;
      applyDarkMode();
    });
  }
  el.unitsSelect.addEventListener("change", () => {
    if (state.current) void loadPlatformBundle(locationPayload());
  });
  el.languageSelect.addEventListener("change", () => {
    void applySelectedLanguage();
    if (state.current) void loadPlatformBundle(locationPayload());
  });
  el.apiKeyInput.addEventListener("change", () => {
    if (state.weatherMapController) {
      void state.weatherMapController.updateContext({ forceTileReload: true, apiBase: state.apiBase, staticMode: state.staticMode });
    }
  });
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return "&#39;";
  });
}

async function initialize() {
  try {
    await fetchConfig();
  } catch (error) {
    setStatus(`Config load failed: ${error.message}`, "error");
    return;
  }

  setupSectionNavigation();
  setupResponsiveSidebar();
  setupQuickCities();
  renderLocalFavorites();
  setupFavoritesEvents();
  setupSavedServerCities();
  setupPwa();
  setupConnectivityWatchers();
  wireEvents();
  await initializeWeatherMapController();
  initializeLiveCameraUi();
  await applySelectedLanguage();
  await cleanupExpiredWeatherHistory();

  const darkPref = localStorage.getItem("weather-studio-dark-mode") === "1";
  el.darkModeToggle.checked = darkPref;
  applyDarkMode();

  await loadAuthState();
  await useCurrentLocation();
  appendChat("Ask me about rain, weekend temperature, or outdoor plans.", "bot");
  window.addEventListener("beforeunload", () => {
    stopLiveCamera();
  });
}

void initialize();





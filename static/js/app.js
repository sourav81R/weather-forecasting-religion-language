const CACHE_KEY = "weather-studio-cache-v2";
const PWA_CACHE_NAME = "weather-studio-pwa-v7";
const FAVORITES_KEY = "weather-studio-favorites-v2";
const LAST_COORDS_KEY = "weather-studio-last-coords-v2";
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
  statusText: document.getElementById("statusText"),
  quickCities: document.getElementById("quickCities"),
  favoriteCities: document.getElementById("favoriteCities"),
  conditionSymbol: document.getElementById("conditionSymbol"),
  temperatureText: document.getElementById("temperatureText"),
  descriptionText: document.getElementById("descriptionText"),
  locationText: document.getElementById("locationText"),
  metricGrid: document.getElementById("metricGrid"),
  aiSummary: document.getElementById("aiSummary"),
  activityList: document.getElementById("activityList"),
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
  ruleRain: document.getElementById("ruleRain"),
  ruleTemp: document.getElementById("ruleTemp"),
  ruleWind: document.getElementById("ruleWind"),
  ruleUv: document.getElementById("ruleUv"),
  alertEmail: document.getElementById("alertEmail"),
  evaluateAlertsBtn: document.getElementById("evaluateAlertsBtn"),
  alertList: document.getElementById("alertList"),
  mapSelection: document.getElementById("mapSelection"),
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
  current: null,
  forecast: null,
  analytics: null,
  activity: null,
  alerts: [],
  coords: null,
  charts: {},
  user: { authenticated: false },
  localFavorites: loadLocalFavorites(),
  map: null,
  focusMarker: null,
  deferredPrompt: null,
};

const i18nState = {
  initialized: false,
  textBase: new Map(),
  placeholderBase: new Map(),
  cache: new Map(),
};

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    credentials: "same-origin",
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return payload;
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
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,cloud_cover,wind_speed_10m,weather_code",
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
        return {
          location: `${data.name || ""}${sys.country ? `, ${sys.country}` : ""}`,
          temperature: main.temp,
          temperatureUnit: units === "imperial" ? "\u00B0F" : "\u00B0C",
          description: weather.description || "",
          condition,
          symbol: WEATHER_SYMBOLS[condition] || "\uD83C\uDF24",
          feelsLike: main.feels_like,
          humidity: main.humidity,
          windSpeed: wind.speed,
          windUnit: units === "imperial" ? "mph" : "m/s",
          pressure: main.pressure,
          clouds: clouds.all,
          sunrise: formatLocalTime(sys.sunrise, timezone),
          sunset: formatLocalTime(sys.sunset, timezone),
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
  setStatus("Loading weather intelligence...");
  try {
    let bundle;
    if (state.staticMode) {
      bundle = await staticBuildBundle(payload);
    } else {
      bundle = await apiRequest("/api/platform-bundle", { method: "POST", body: JSON.stringify(payload) });
    }
    cacheBundle(key, bundle);
    applyBundle(bundle);
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
        applyBundle(bundle);
        setStatus("Backend unavailable. Running in static mode.", "success");
        return true;
      } catch {
        // Continue to cache fallback below.
      }
    }
    const cached = readCacheBundle(key);
    if (cached) {
      applyBundle(cached);
      setStatus(`Live request failed, using cache: ${error.message}`, "error");
      return true;
    }
    setStatus(error.message, "error");
    return false;
  }
}

function applyBundle(bundle) {
  state.current = bundle.current;
  state.forecast = bundle.forecast;
  state.analytics = bundle.analytics;
  state.activity = bundle.activity;
  state.alerts = bundle.alerts || [];
  state.coords = { latitude: Number(bundle.current.latitude), longitude: Number(bundle.current.longitude) };
  localStorage.setItem(LAST_COORDS_KEY, JSON.stringify(state.coords));

  renderCurrent();
  renderForecast();
  renderAnalytics();
  renderActivity();
  renderAlerts(state.alerts);
  renderAiSummary(bundle.aiSummary);
  addFavorite((state.current.location || "").split(",")[0]);
  void loadClimateInsights();
}

function renderCurrent() {
  if (!state.current) return;
  const c = state.current;
  el.conditionSymbol.textContent = c.symbol || "\u2601";
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
    .map((day) => {
      const d = new Date(day.date);
      const label = Number.isNaN(d.getTime())
        ? day.date
        : d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
      return `<div class="forecast-card">
        <strong>${label}</strong>
        <div>${day.condition}</div>
        <div>${Math.round(day.maxTemp)}${tUnit} / ${Math.round(day.minTemp)}${tUnit}</div>
        <div>Rain: ${Math.round(day.rainProbability)}%</div>
        <div>Wind: ${Math.round(day.windSpeed)} ${wUnit}</div>
        <div>UV: ${Number(day.uvIndex).toFixed(1)}</div>
        <div>Precip: ${Number(day.rainAmount).toFixed(1)} ${pUnit}</div>
      </div>`;
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
  if (state.staticMode) {
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

  try {
    if (state.staticMode) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daily = (state.forecast?.daily || []).filter((d) => {
        const cur = new Date(d.date);
        return cur >= start && cur <= end;
      });
      if (!daily.length) throw new Error("Date range is outside available forecast.");
      const scored = daily.map((d) => {
        const avg = (Number(d.maxTemp) + Number(d.minTemp)) / 2;
        const score = Math.max(0, 100 - Math.abs(avg - 24) * 2 - Number(d.rainProbability) * 0.5 - Math.max(0, Number(d.windSpeed) - 25) * 1.1);
        return { ...d, score: Number(score.toFixed(1)) };
      });
      scored.sort((a, b) => b.score - a.score);
      const best = scored.slice(0, 3)
        .map((d) => `<div class="list-item"><strong>${d.date}</strong> <span class="muted">Score ${d.score}</span><div>Rain ${d.rainProbability}% | Temp ${d.minTemp} to ${d.maxTemp}</div></div>`)
        .join("");
      const overall = Number((scored.reduce((a, b) => a + b.score, 0) / scored.length).toFixed(1));
      el.travelResult.innerHTML = `<div class="list-item"><strong>Overall score</strong><div>${overall}/100</div><div>Static-mode local estimate for selected dates.</div></div>${best}`;
      return;
    }

    const result = await apiRequest("/api/travel-planner", {
      method: "POST",
      body: JSON.stringify({ destination, startDate, endDate, units: el.unitsSelect.value }),
    });
    const days = (result.bestTravelDays || [])
      .map((d) => `<div class="list-item"><strong>${d.date}</strong> <span class="muted">Score ${d.score}</span><div>Rain ${d.rainRisk}% | Temp ${d.tempRange[0]} to ${d.tempRange[1]}</div></div>`)
      .join("");
    el.travelResult.innerHTML = `<div class="list-item"><strong>Overall score</strong><div>${result.weatherScore}/100</div><div>${result.recommendation}</div></div>${days}`;
  } catch (error) {
    el.travelResult.innerHTML = `<div class="list-item">${error.message}</div>`;
  }
}

async function handleAgricultureAdvisor() {
  try {
    if (state.staticMode) {
      const daily = (state.forecast?.daily || []).slice(0, 7);
      if (!daily.length) throw new Error("Forecast unavailable.");
      const rain = daily.reduce((sum, d) => sum + Number(d.rainAmount || 0), 0);
      const minTemp = Math.min(...daily.map((d) => Number(d.minTemp || 0)));
      const maxRainProb = Math.max(...daily.map((d) => Number(d.rainProbability || 0)));
      el.agriResult.innerHTML = `
        <div class="list-item"><strong>Irrigation</strong><div>${rain > 25 ? "Rain is likely sufficient; reduce manual irrigation." : "Plan supplemental irrigation this week."}</div></div>
        <div class="list-item"><strong>Planting Window</strong><div>${maxRainProb < 65 ? "Next 3 days are suitable for planting." : "Delay planting until rain risk drops."}</div></div>
        <div class="list-item"><strong>Rain Alert</strong><div>${maxRainProb >= 70 ? "High" : "Normal"}</div></div>
        <div class="list-item"><strong>Frost Risk</strong><div>${minTemp <= 2 ? "Present" : "Low"}</div></div>`;
      return;
    }

    const result = await apiRequest("/api/agriculture-advisor", {
      method: "POST",
      body: JSON.stringify({ ...currentPayload(), ...locationPayload(), cropType: el.cropType.value }),
    });
    const advice = (result.advice || []).map((item) => `<div class="list-item">${item}</div>`).join("");
    el.agriResult.innerHTML = `
      <div class="list-item"><strong>Irrigation</strong><div>${result.irrigationRecommendation}</div></div>
      <div class="list-item"><strong>Planting Window</strong><div>${result.plantingWindow}</div></div>
      <div class="list-item"><strong>Rain Alert</strong><div>${result.rainAlert ? "High" : "Normal"}</div></div>
      <div class="list-item"><strong>Frost Risk</strong><div>${result.frostRisk ? "Present" : "Low"}</div></div>
      ${advice}`;
  } catch (error) {
    el.agriResult.innerHTML = `<div class="list-item">${error.message}</div>`;
  }
}

function appendChat(text, role) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role === "user" ? "chat-user" : "chat-bot"}`;
  bubble.textContent = text;
  el.chatLog.appendChild(bubble);
  el.chatLog.scrollTop = el.chatLog.scrollHeight;
}

async function askChatbot() {
  const question = el.chatInput.value.trim();
  if (!question) return;
  el.chatInput.value = "";
  appendChat(question, "user");
  if (state.staticMode) {
    const daily = state.forecast?.daily || [];
    const q = question.toLowerCase();
    if (q.includes("rain") && q.includes("tomorrow") && daily[1]) {
      appendChat(`Tomorrow rain probability is around ${Math.round(daily[1].rainProbability)}%.`, "bot");
      return;
    }
    if ((q.includes("weekend") || q.includes("this weekend")) && daily.length) {
      const weekend = daily.filter((d) => {
        const date = new Date(d.date);
        return date.getDay() === 0 || date.getDay() === 6;
      });
      if (weekend.length) {
        const highs = weekend.map((d) => Number(d.maxTemp));
        appendChat(`Weekend highs are expected between ${Math.min(...highs).toFixed(1)} and ${Math.max(...highs).toFixed(1)}.`, "bot");
      } else {
        appendChat("Weekend forecast is outside the current 15-day range.", "bot");
      }
      return;
    }
    appendChat(staticBuildSummary(state.current || {}, state.forecast || { daily: [] }), "bot");
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
  document.body.classList.toggle("dark", el.darkModeToggle.checked);
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
async function initMap() {
  const mapContainer = document.getElementById("map");
  if (typeof L === "undefined" || !mapContainer) return;
  state.map = L.map("map", { zoomControl: true }).setView([22.9, 79.5], 4);

  const base = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(state.map);

  const overlays = {};
  try {
    let layers = {};
    if (state.staticMode) {
      const key = (el.apiKeyInput.value.trim() || BUILTIN_API_KEYS[0] || "").trim();
      if (key) {
        layers = {
          temperature: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${key}`,
          rain: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${key}`,
          wind: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${key}`,
          clouds: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${key}`,
        };
      }
    } else {
      const layerPayload = await apiRequest(`/api/map/layers?apiKey=${encodeURIComponent(el.apiKeyInput.value.trim())}`);
      layers = layerPayload.layers || {};
    }
    if (layers.temperature) overlays.Temperature = L.tileLayer(layers.temperature, { opacity: 0.55 });
    if (layers.rain) overlays.Rain = L.tileLayer(layers.rain, { opacity: 0.55 });
    if (layers.wind) overlays.Wind = L.tileLayer(layers.wind, { opacity: 0.55 });
    if (layers.clouds) overlays.Clouds = L.tileLayer(layers.clouds, { opacity: 0.55 });
  } catch {
    // optional
  }

  L.control.layers({ OpenStreetMap: base }, overlays).addTo(state.map);

  state.map.on("click", async (event) => {
    if (!el.mapSelection) return;
    const latitude = event.latlng.lat;
    const longitude = event.latlng.lng;
    el.mapSelection.innerHTML = `<div class="list-item">Loading weather for ${latitude.toFixed(3)}, ${longitude.toFixed(3)}...</div>`;
    const loaded = await loadPlatformBundle({ latitude, longitude });
    if (loaded && state.current) {
      el.mapSelection.innerHTML = `<div class="list-item">Loaded ${state.current.location} at ${latitude.toFixed(3)}, ${longitude.toFixed(3)}.</div>`;
      return;
    }
    el.mapSelection.innerHTML = `<div class="list-item">Could not fetch weather for ${latitude.toFixed(3)}, ${longitude.toFixed(3)}. Try again.</div>`;
  });
}

function syncMapMarker() {
  if (!state.map || !state.coords) return;
  if (state.focusMarker) state.map.removeLayer(state.focusMarker);
  state.focusMarker = L.marker([state.coords.latitude, state.coords.longitude]).addTo(state.map);
  state.focusMarker.bindPopup(state.current?.location || "Selected location").openPopup();
  state.map.setView([state.coords.latitude, state.coords.longitude], Math.max(state.map.getZoom(), 6));
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
  const likelyStaticHost =
    typeof window !== "undefined" &&
    String(window.location.port || "") !== "" &&
    !["5000", "80", "443"].includes(String(window.location.port));
  if (likelyStaticHost) {
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
    setStatus("Running in static mode.", "success");
    const languages = state.config.languages || ["English"];
    el.languageSelect.innerHTML = languages.map((lang) => `<option value="${lang}">${lang}</option>`).join("");
    el.languageSelect.value = state.config.defaultLanguage || "English";
    el.unitsSelect.value = state.config.defaultUnits || "metric";
    return;
  }

  try {
    state.config = await apiRequest("/api/config");
    state.staticMode = false;
  } catch {
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
  if ("caches" in window) {
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith("weather-studio-pwa-") && key !== PWA_CACHE_NAME).map((key) => caches.delete(key)))
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
    el.installBtn.hidden = false;
  });
  el.installBtn.addEventListener("click", async () => {
    if (!state.deferredPrompt) return;
    state.deferredPrompt.prompt();
    await state.deferredPrompt.userChoice;
    state.deferredPrompt = null;
    el.installBtn.hidden = true;
  });
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
  el.unitsSelect.addEventListener("change", () => {
    if (state.current) void loadPlatformBundle(locationPayload());
  });
  el.languageSelect.addEventListener("change", () => {
    void applySelectedLanguage();
    if (state.current) void loadPlatformBundle(locationPayload());
  });
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
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
  wireEvents();
  await applySelectedLanguage();

  const darkPref = localStorage.getItem("weather-studio-dark-mode") === "1";
  el.darkModeToggle.checked = darkPref;
  applyDarkMode();

  await loadAuthState();
  await useCurrentLocation();
  appendChat("Ask me about rain, weekend temperature, or outdoor plans.", "bot");
}

void initialize();

const OPENWEATHER_ENDPOINT = "https://api.openweathermap.org/data/2.5/weather";
const BUILTIN_API_KEYS = [
  "d7842c0b970d897c608c64e6b6cc0b8a",
  "48a90ac42caa09f90dcaeee4096b9e53",
];

const LANGUAGE_CODES = {
  English: "en",
  Bengali: "bn",
  Hindi: "hi",
  Tamil: "ta",
};

const WEATHER_SYMBOLS = {
  Thunderstorm: "\u26C8",
  Drizzle: "\uD83C\uDF26",
  Rain: "\uD83C\uDF27",
  Snow: "\uD83C\uDF28",
  Mist: "\uD83C\uDF2B",
  Smoke: "\uD83C\uDF2B",
  Haze: "\uD83C\uDF2B",
  Dust: "\uD83C\uDF2B",
  Fog: "\uD83C\uDF2B",
  Sand: "\uD83C\uDF2B",
  Ash: "\uD83C\uDF2B",
  Squall: "\uD83D\uDCA8",
  Tornado: "\uD83C\uDF2A",
  Clear: "\u2600",
  Clouds: "\u2601",
};

const WEATHER_MOODS = {
  Thunderstorm: "mood-stormy",
  Drizzle: "mood-rainy",
  Rain: "mood-rainy",
  Snow: "mood-snowy",
  Mist: "mood-foggy",
  Smoke: "mood-foggy",
  Haze: "mood-foggy",
  Dust: "mood-foggy",
  Fog: "mood-foggy",
  Sand: "mood-foggy",
  Ash: "mood-foggy",
  Squall: "mood-windy",
  Tornado: "mood-windy",
  Clear: "mood-sunny",
  Clouds: "mood-cloudy",
};

const UI_TEXT = {
  English: {
    title: "Regional Weather Studio",
    subtitle: "Modern weather app with inbuilt API key fallback for static hosting.",
    chip: "Live + Local",
    cityLabel: "City",
    cityPlaceholder: "Search city...",
    languageLabel: "Language",
    unitsLabel: "Units",
    celsius: "Celsius",
    fahrenheit: "Fahrenheit",
    apiKeyLabel: "Custom API key (optional)",
    apiKeyPlaceholder: "Uses inbuilt keys if empty",
    fetchButton: "Get Weather",
    quickLabel: "Quick cities",
    statusReady: "Ready",
    statusLoading: "Loading weather...",
    statusLocating: "Detecting your location...",
    statusLoaded: "Weather loaded via {source}",
    statusAutoLoaded: "Weather loaded for your location via {source}",
    cityMissing: "Please enter a city name.",
    cityNotFound: "City not found. Check spelling and try again.",
    locationLookupFailed: "Unable to fetch weather for your current location.",
    locationUnsupported: "Geolocation is not supported in this browser.",
    locationDenied: "Location access denied. Enter a city manually.",
    locationUnavailable: "Unable to detect your location right now.",
    allKeysFailed: "All inbuilt API keys failed.",
    weatherUnavailable: "Weather unavailable",
    updatedPrefix: "Updated",
    detailsTitle: "Atmospheric Metrics",
    detailsSubtitle: "Live values from current forecast",
    snapshotLabel: "Current Snapshot",
    details: {
      feelsLike: "Feels like",
      humidity: "Humidity",
      wind: "Wind speed",
      pressure: "Pressure",
      clouds: "Clouds",
      sunrise: "Sunrise",
      sunset: "Sunset",
      source: "Data source",
    },
    quickCities: ["Kolkata", "Delhi", "Mumbai", "Chennai", "Dhaka", "Bengaluru"],
  },
  Bengali: {
    title: "আঞ্চলিক আবহাওয়া স্টুডিও",
    subtitle: "ইনবিল্ট API key fallback সহ আধুনিক আবহাওয়া অ্যাপ।",
    chip: "লাইভ + লোকাল",
    cityLabel: "শহর",
    cityPlaceholder: "শহরের নাম লিখুন...",
    languageLabel: "ভাষা",
    unitsLabel: "একক",
    celsius: "সেলসিয়াস",
    fahrenheit: "ফারেনহাইট",
    apiKeyLabel: "কাস্টম API key (ঐচ্ছিক)",
    apiKeyPlaceholder: "খালি রাখলে ইনবিল্ট key ব্যবহার হবে",
    fetchButton: "আবহাওয়া দেখুন",
    quickLabel: "দ্রুত শহর",
    statusReady: "প্রস্তুত",
    statusLoading: "আবহাওয়া তথ্য লোড হচ্ছে...",
    statusLocating: "আপনার অবস্থান শনাক্ত করা হচ্ছে...",
    statusLoaded: "{source} দিয়ে তথ্য লোড হয়েছে",
    statusAutoLoaded: "আপনার অবস্থানের আবহাওয়া {source} দিয়ে লোড হয়েছে",
    cityMissing: "শহরের নাম লিখুন।",
    cityNotFound: "শহর খুঁজে পাওয়া যায়নি। বানান ঠিক করুন।",
    locationLookupFailed: "আপনার বর্তমান অবস্থানের আবহাওয়া আনা যায়নি।",
    locationUnsupported: "এই ব্রাউজারে লোকেশন সাপোর্ট নেই।",
    locationDenied: "লোকেশন অনুমতি দেওয়া হয়নি। শহরের নাম লিখুন।",
    locationUnavailable: "এখন আপনার অবস্থান শনাক্ত করা যাচ্ছে না।",
    allKeysFailed: "সব ইনবিল্ট API key ব্যর্থ হয়েছে।",
    weatherUnavailable: "আবহাওয়া তথ্য নেই",
    updatedPrefix: "আপডেট",
    detailsTitle: "বায়ুমণ্ডলীয় পরিমাপ",
    detailsSubtitle: "বর্তমান পূর্বাভাসের লাইভ মান",
    snapshotLabel: "বর্তমান অবস্থা",
    details: {
      feelsLike: "অনুভূত তাপমাত্রা",
      humidity: "আর্দ্রতা",
      wind: "বাতাসের গতি",
      pressure: "চাপ",
      clouds: "মেঘ",
      sunrise: "সূর্যোদয়",
      sunset: "সূর্যাস্ত",
      source: "ডেটা উৎস",
    },
    quickCities: ["কলকাতা", "দিল্লি", "মুম্বাই", "চেন্নাই", "ঢাকা", "বেঙ্গালুরু"],
  },
  Hindi: {
    title: "क्षेत्रीय मौसम स्टूडियो",
    subtitle: "inbuilt API key fallback के साथ आधुनिक मौसम ऐप।",
    chip: "लाइव + लोकल",
    cityLabel: "शहर",
    cityPlaceholder: "शहर खोजें...",
    languageLabel: "भाषा",
    unitsLabel: "इकाई",
    celsius: "सेल्सियस",
    fahrenheit: "फ़ारेनहाइट",
    apiKeyLabel: "कस्टम API key (वैकल्पिक)",
    apiKeyPlaceholder: "खाली छोड़ें तो inbuilt key इस्तेमाल होगी",
    fetchButton: "मौसम देखें",
    quickLabel: "त्वरित शहर",
    statusReady: "तैयार",
    statusLoading: "मौसम डेटा लोड हो रहा है...",
    statusLocating: "आपकी लोकेशन पहचानी जा रही है...",
    statusLoaded: "{source} से डेटा लोड हुआ",
    statusAutoLoaded: "आपकी लोकेशन का मौसम {source} से लोड हुआ",
    cityMissing: "कृपया शहर का नाम दर्ज करें।",
    cityNotFound: "शहर नहीं मिला। वर्तनी जाँचें।",
    locationLookupFailed: "आपकी वर्तमान लोकेशन का मौसम नहीं मिल सका।",
    locationUnsupported: "इस ब्राउज़र में लोकेशन सपोर्ट नहीं है।",
    locationDenied: "लोकेशन अनुमति नहीं मिली। शहर मैन्युअली दर्ज करें।",
    locationUnavailable: "अभी आपकी लोकेशन पता नहीं चल पा रही है।",
    allKeysFailed: "सभी inbuilt API key विफल रहीं।",
    weatherUnavailable: "मौसम डेटा उपलब्ध नहीं",
    updatedPrefix: "अपडेट",
    detailsTitle: "वायुमंडलीय मेट्रिक्स",
    detailsSubtitle: "वर्तमान पूर्वानुमान से लाइव मान",
    snapshotLabel: "वर्तमान स्थिति",
    details: {
      feelsLike: "अनुभूत तापमान",
      humidity: "आर्द्रता",
      wind: "हवा की गति",
      pressure: "दाब",
      clouds: "बादल",
      sunrise: "सूर्योदय",
      sunset: "सूर्यास्त",
      source: "डेटा स्रोत",
    },
    quickCities: ["कोलकाता", "दिल्ली", "मुंबई", "चेन्नई", "ढाका", "बेंगलुरु"],
  },
  Tamil: {
    title: "பிராந்திய வானிலை ஸ்டூடியோ",
    subtitle: "inbuilt API key fallback உடன் நவீன வானிலை பயன்பாடு.",
    chip: "லைவ் + லோகல்",
    cityLabel: "நகரம்",
    cityPlaceholder: "நகரத்தை தேடவும்...",
    languageLabel: "மொழி",
    unitsLabel: "அலகு",
    celsius: "செல்சியஸ்",
    fahrenheit: "ஃபாரன்ஹீட்",
    apiKeyLabel: "Custom API key (விருப்பம்)",
    apiKeyPlaceholder: "காலியாக விடுங்கள், inbuilt key பயன்படுத்தப்படும்",
    fetchButton: "வானிலை காண்க",
    quickLabel: "விரைவு நகரங்கள்",
    statusReady: "தயார்",
    statusLoading: "வானிலை தரவு ஏற்றப்படுகிறது...",
    statusLocating: "உங்கள் இருப்பிடம் கண்டறியப்படுகிறது...",
    statusLoaded: "{source} மூலம் தரவு ஏற்றப்பட்டது",
    statusAutoLoaded: "உங்கள் இருப்பிட வானிலை {source} மூலம் ஏற்றப்பட்டது",
    cityMissing: "நகரத்தின் பெயரை உள்ளிடவும்.",
    cityNotFound: "நகரம் கிடைக்கவில்லை. எழுத்துப்பிழை பார்க்கவும்.",
    locationLookupFailed: "உங்கள் தற்போதைய இருப்பிட வானிலையை பெற முடியவில்லை.",
    locationUnsupported: "இந்த உலாவியில் இருப்பிடம் ஆதரவு இல்லை.",
    locationDenied: "இருப்பிட அனுமதி மறுக்கப்பட்டது. நகரத்தை கையால் உள்ளிடவும்.",
    locationUnavailable: "இப்போது உங்கள் இருப்பிடத்தை கண்டறிய முடியவில்லை.",
    allKeysFailed: "அனைத்து inbuilt API key-களும் தோல்வியடைந்தன.",
    weatherUnavailable: "வானிலை தரவு இல்லை",
    updatedPrefix: "புதுப்பிப்பு",
    detailsTitle: "வளிமண்டல அளவுகள்",
    detailsSubtitle: "தற்போதைய முன்னறிவிப்பின் நேரடி மதிப்புகள்",
    snapshotLabel: "தற்போதைய நிலை",
    details: {
      feelsLike: "உணரப்படும் வெப்பநிலை",
      humidity: "ஈரப்பதம்",
      wind: "காற்றின் வேகம்",
      pressure: "அழுத்தம்",
      clouds: "மேக மூடல்",
      sunrise: "சூரிய உதயம்",
      sunset: "சூரிய அஸ்தமனம்",
      source: "தரவு மூலம்",
    },
    quickCities: ["கொல்கத்தா", "டெல்லி", "மும்பை", "சென்னை", "டாக்கா", "பெங்களூரு"],
  },
};

const QUICK_CITY_QUERY = ["Kolkata", "Delhi", "Mumbai", "Chennai", "Dhaka", "Bengaluru"];

const els = {
  titleText: document.getElementById("titleText"),
  subtitleText: document.getElementById("subtitleText"),
  heroChip: document.getElementById("heroChip"),
  updatedAtText: document.getElementById("updatedAtText"),
  weatherResultContainer: document.getElementById("weatherResultContainer"),
  cityLabel: document.getElementById("cityLabel"),
  cityInput: document.getElementById("cityInput"),
  languageLabel: document.getElementById("languageLabel"),
  languageSelect: document.getElementById("languageSelect"),
  unitsLabel: document.getElementById("unitsLabel"),
  unitsSelect: document.getElementById("unitsSelect"),
  apiKeyLabel: document.getElementById("apiKeyLabel"),
  apiKeyInput: document.getElementById("apiKeyInput"),
  fetchBtn: document.getElementById("fetchBtn"),
  statusText: document.getElementById("statusText"),
  quickCityLabel: document.getElementById("quickCityLabel"),
  quickCities: document.getElementById("quickCities"),
  conditionSymbol: document.getElementById("conditionSymbol"),
  temperatureText: document.getElementById("temperatureText"),
  descriptionText: document.getElementById("descriptionText"),
  locationText: document.getElementById("locationText"),
  feelsLikeLabel: document.getElementById("feelsLikeLabel"),
  humidityLabel: document.getElementById("humidityLabel"),
  windLabel: document.getElementById("windLabel"),
  pressureLabel: document.getElementById("pressureLabel"),
  cloudsLabel: document.getElementById("cloudsLabel"),
  sunriseLabel: document.getElementById("sunriseLabel"),
  sunsetLabel: document.getElementById("sunsetLabel"),
  sourceLabel: document.getElementById("sourceLabel"),
  detailsTitle: document.getElementById("detailsTitle"),
  detailsSubtitle: document.getElementById("detailsSubtitle"),
  snapshotLabel: document.getElementById("snapshotLabel"),
  feelsLikeValue: document.getElementById("feelsLikeValue"),
  humidityValue: document.getElementById("humidityValue"),
  windValue: document.getElementById("windValue"),
  pressureValue: document.getElementById("pressureValue"),
  cloudsValue: document.getElementById("cloudsValue"),
  sunriseValue: document.getElementById("sunriseValue"),
  sunsetValue: document.getElementById("sunsetValue"),
  sourceValue: document.getElementById("sourceValue"),
};

let freshAnimationTimer = null;

function setStatusText(message, kind = "neutral") {
  els.statusText.textContent = message;
  els.statusText.classList.remove("status-success", "status-error");
  if (kind === "success") {
    els.statusText.classList.add("status-success");
  } else if (kind === "error") {
    els.statusText.classList.add("status-error");
  }
}

function currentPack() {
  const language = els.languageSelect.value;
  return UI_TEXT[language] || UI_TEXT.English;
}

function setUpdatedAtText(value) {
  if (!els.updatedAtText) {
    return;
  }
  const pack = currentPack();
  const prefix = pack.updatedPrefix || "Updated";
  els.updatedAtText.textContent = `${prefix}: ${value}`;
}

function setWeatherMood(condition) {
  const moodKey = condition && WEATHER_MOODS[condition] ? condition : "default";
  document.body.dataset.weather = moodKey;
  document.body.className = document.body.className.replace(/\bmood-\S+/g, "").trim();
  document.body.classList.add(WEATHER_MOODS[moodKey] || "mood-default");
}

function applyLanguageUI() {
  const pack = currentPack();
  els.titleText.textContent = pack.title;
  els.subtitleText.textContent = pack.subtitle;
  els.heroChip.textContent = pack.chip;
  els.cityLabel.textContent = pack.cityLabel;
  els.cityInput.placeholder = pack.cityPlaceholder;
  els.languageLabel.textContent = pack.languageLabel;
  els.unitsLabel.textContent = pack.unitsLabel;
  els.apiKeyLabel.textContent = pack.apiKeyLabel;
  els.apiKeyInput.placeholder = pack.apiKeyPlaceholder;
  els.fetchBtn.textContent = pack.fetchButton;
  els.quickCityLabel.textContent = pack.quickLabel;
  setStatusText(pack.statusReady, "neutral");
  els.unitsSelect.options[0].textContent = pack.celsius;
  els.unitsSelect.options[1].textContent = pack.fahrenheit;
  if (els.detailsTitle) {
    els.detailsTitle.textContent = pack.detailsTitle || "Atmospheric Metrics";
  }
  if (els.detailsSubtitle) {
    els.detailsSubtitle.textContent = pack.detailsSubtitle || "Live values from current forecast";
  }
  if (els.snapshotLabel) {
    els.snapshotLabel.textContent = pack.snapshotLabel || "Current Snapshot";
  }

  els.feelsLikeLabel.textContent = pack.details.feelsLike;
  els.humidityLabel.textContent = pack.details.humidity;
  els.windLabel.textContent = pack.details.wind;
  els.pressureLabel.textContent = pack.details.pressure;
  els.cloudsLabel.textContent = pack.details.clouds;
  els.sunriseLabel.textContent = pack.details.sunrise;
  els.sunsetLabel.textContent = pack.details.sunset;
  els.sourceLabel.textContent = pack.details.source;

  renderQuickCities();
  setUpdatedAtText("--");
}

function renderQuickCities() {
  const pack = currentPack();
  els.quickCities.innerHTML = "";
  pack.quickCities.forEach((label, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = label;
    btn.addEventListener("click", () => {
      els.cityInput.value = QUICK_CITY_QUERY[idx];
      fetchWeather();
    });
    els.quickCities.appendChild(btn);
  });
}

function setLoading(isLoading) {
  const pack = currentPack();
  els.fetchBtn.disabled = isLoading;
  els.fetchBtn.setAttribute("aria-busy", String(isLoading));
  document.body.classList.toggle("is-loading", isLoading);
  els.fetchBtn.classList.toggle("is-loading", isLoading);
  if (isLoading) {
    setStatusText(pack.statusLoading, "neutral");
  }
  els.weatherResultContainer?.classList.toggle("is-updating", isLoading);
}

function resetWeatherDisplay(message = "") {
  const pack = currentPack();
  setStatusText(message || pack.statusReady, message ? "error" : "neutral");
  els.conditionSymbol.textContent = "";
  els.temperatureText.textContent = "";
  els.descriptionText.textContent = message ? pack.weatherUnavailable : "";
  els.locationText.textContent = "";
  updateDetails({});
  setWeatherMood("default");
  els.weatherResultContainer?.classList.remove("is-fresh");
  if (message) {
    setUpdatedAtText("--");
  }
}

function pulseFreshResults() {
  if (!els.weatherResultContainer) {
    return;
  }
  els.weatherResultContainer.classList.remove("is-fresh");
  // Force reflow so the animation can replay after each successful fetch.
  void els.weatherResultContainer.offsetWidth;
  els.weatherResultContainer.classList.add("is-fresh");
  if (freshAnimationTimer) {
    window.clearTimeout(freshAnimationTimer);
  }
  freshAnimationTimer = window.setTimeout(() => {
    els.weatherResultContainer?.classList.remove("is-fresh");
  }, 520);
}

function updateDetails(values) {
  els.feelsLikeValue.textContent = values.feelsLike ?? "--";
  els.humidityValue.textContent = values.humidity ?? "--";
  els.windValue.textContent = values.wind ?? "--";
  els.pressureValue.textContent = values.pressure ?? "--";
  els.cloudsValue.textContent = values.clouds ?? "--";
  els.sunriseValue.textContent = values.sunrise ?? "--";
  els.sunsetValue.textContent = values.sunset ?? "--";
  els.sourceValue.textContent = values.source ?? "--";
}

function renderWeather(data) {
  const pack = currentPack();
  els.conditionSymbol.textContent = data.symbol || "\uD83C\uDF24";
  els.temperatureText.textContent = `${data.temperature ?? "--"} ${data.temperatureUnit ?? ""}`.trim();
  els.descriptionText.textContent = data.description || pack.weatherUnavailable;
  els.locationText.textContent = data.location || "--";
  updateDetails({
    feelsLike: `${data.feelsLike ?? "--"} ${data.temperatureUnit ?? ""}`.trim(),
    humidity: `${data.humidity ?? "--"}%`,
    wind: `${data.windSpeed ?? "--"} ${data.windUnit ?? ""}`.trim(),
    pressure: `${data.pressure ?? "--"} hPa`,
    clouds: `${data.clouds ?? "--"}%`,
    sunrise: data.sunrise ?? "--",
    sunset: data.sunset ?? "--",
    source: data.source ?? "--",
  });
  setStatusText(pack.statusLoaded.replace("{source}", data.source || "--"), "success");
  setWeatherMood(data.condition);
  setUpdatedAtText(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  pulseFreshResults();
}

function renderError(message) {
  resetWeatherDisplay(message);
}

function getCandidateKeys(customKey) {
  const candidates = [];
  if (customKey) {
    candidates.push({ key: customKey, source: "custom key" });
  }
  BUILTIN_API_KEYS.forEach((key, index) => {
    candidates.push({ key, source: `inbuilt key #${index + 1}` });
  });

  const seen = new Set();
  return candidates.filter((entry) => {
    if (!entry.key || seen.has(entry.key)) {
      return false;
    }
    seen.add(entry.key);
    return true;
  });
}

function getCurrentPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

function formatLocalTime(unixTs, timezoneOffsetSeconds) {
  if (!unixTs) {
    return "--";
  }
  const local = new Date((unixTs + timezoneOffsetSeconds) * 1000);
  const hh = String(local.getUTCHours()).padStart(2, "0");
  const mm = String(local.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function normalizeWeather(payload, units, source) {
  const weather = (payload.weather && payload.weather[0]) || {};
  const main = payload.main || {};
  const wind = payload.wind || {};
  const sys = payload.sys || {};
  const clouds = payload.clouds || {};
  const timezone = Number(payload.timezone || 0);

  const city = payload.name || "";
  const country = sys.country || "";
  const location = country ? `${city}, ${country}` : city;
  const condition = weather.main || "";

  return {
    location,
    temperature: main.temp ?? "--",
    temperatureUnit: units === "metric" ? "\u00B0C" : "\u00B0F",
    description: weather.description || "",
    condition,
    symbol: WEATHER_SYMBOLS[condition] || "\uD83C\uDF24",
    feelsLike: main.feels_like ?? "--",
    humidity: main.humidity ?? "--",
    windSpeed: wind.speed ?? "--",
    windUnit: units === "metric" ? "m/s" : "mph",
    pressure: main.pressure ?? "--",
    clouds: clouds.all ?? "--",
    sunrise: formatLocalTime(sys.sunrise, timezone),
    sunset: formatLocalTime(sys.sunset, timezone),
    source,
  };
}

async function fetchFromOpenWeather(query, language, units, customKey) {
  const keys = getCandidateKeys(customKey);
  const pack = currentPack();
  const queryParams = typeof query === "string" ? { q: query } : query;

  if (!keys.length) {
    return { error: pack.allKeysFailed };
  }

  const languageCode = LANGUAGE_CODES[language] || "en";
  let lastKeyError = "";

  for (const entry of keys) {
    const params = new URLSearchParams({
      ...queryParams,
      appid: entry.key,
      units,
      lang: languageCode,
    });
    const url = `${OPENWEATHER_ENDPOINT}?${params.toString()}`;

    try {
      const response = await fetch(url);
      const payload = await response.json().catch(() => ({}));

      if (response.ok) {
        return { data: normalizeWeather(payload, units, entry.source) };
      }

      if (response.status === 404) {
        return { error: queryParams.q ? pack.cityNotFound : pack.locationLookupFailed };
      }
      if (response.status === 401 || response.status === 429) {
        lastKeyError = payload.message || `API key error (${response.status})`;
        continue;
      }
      return { error: payload.message || "Unable to fetch weather data." };
    } catch (error) {
      lastKeyError = error.message || "Network error";
    }
  }

  return {
    error: `${pack.allKeysFailed}${lastKeyError ? ` (${lastKeyError})` : ""}`,
  };
}

async function fetchWeather() {
  const city = els.cityInput.value.trim();
  if (!city) {
    renderError(currentPack().cityMissing);
    return;
  }

  setLoading(true);
  try {
    const result = await fetchFromOpenWeather(
      { q: city },
      els.languageSelect.value,
      els.unitsSelect.value,
      els.apiKeyInput.value.trim()
    );

    if (result.error) {
      renderError(result.error);
      return;
    }
    renderWeather(result.data);
  } catch (error) {
    renderError(`Network error: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

async function autoFetchWeatherForCurrentLocation() {
  const pack = currentPack();
  if (!navigator.geolocation) {
    setStatusText(pack.locationUnsupported, "error");
    return;
  }

  setLoading(true);
  setStatusText(pack.statusLocating, "neutral");

  try {
    const position = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 300000,
    });
    const result = await fetchFromOpenWeather(
      {
        lat: position.coords.latitude.toString(),
        lon: position.coords.longitude.toString(),
      },
      els.languageSelect.value,
      els.unitsSelect.value,
      els.apiKeyInput.value.trim()
    );

    if (result.error) {
      setStatusText(result.error, "error");
      return;
    }

    renderWeather(result.data);
    if (result.data.location) {
      els.cityInput.value = result.data.location.split(",")[0].trim();
    }
    setStatusText(pack.statusAutoLoaded.replace("{source}", result.data.source || "--"), "success");
  } catch (error) {
    if (error && error.code === 1) {
      setStatusText(pack.locationDenied, "error");
    } else {
      setStatusText(pack.locationUnavailable, "error");
    }
  } finally {
    setLoading(false);
  }
}

function initialize() {
  applyLanguageUI();
  setWeatherMood("default");
  els.fetchBtn.addEventListener("click", fetchWeather);
  els.languageSelect.addEventListener("change", applyLanguageUI);
  els.cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      fetchWeather();
    }
  });
  els.cityInput.focus();
  autoFetchWeatherForCurrentLocation();
}

initialize();




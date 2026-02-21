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
  Thunderstorm: "⛈",
  Drizzle: "🌦",
  Rain: "🌧",
  Snow: "🌨",
  Mist: "🌫",
  Smoke: "🌫",
  Haze: "🌫",
  Dust: "🌫",
  Fog: "🌫",
  Sand: "🌫",
  Ash: "🌫",
  Squall: "💨",
  Tornado: "🌪",
  Clear: "☀",
  Clouds: "☁",
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
    statusLoaded: "Weather loaded via {source}",
    cityMissing: "Please enter a city name.",
    cityNotFound: "City not found. Check spelling and try again.",
    allKeysFailed: "All inbuilt API keys failed.",
    weatherUnavailable: "Weather unavailable",
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
    statusLoaded: "{source} দিয়ে তথ্য লোড হয়েছে",
    cityMissing: "শহরের নাম লিখুন।",
    cityNotFound: "শহর খুঁজে পাওয়া যায়নি। বানান ঠিক করুন।",
    allKeysFailed: "সব ইনবিল্ট API key ব্যর্থ হয়েছে।",
    weatherUnavailable: "আবহাওয়া তথ্য নেই",
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
    statusLoaded: "{source} से डेटा लोड हुआ",
    cityMissing: "कृपया शहर का नाम दर्ज करें।",
    cityNotFound: "शहर नहीं मिला। वर्तनी जांचें।",
    allKeysFailed: "सभी inbuilt API key विफल रहीं।",
    weatherUnavailable: "मौसम डेटा उपलब्ध नहीं",
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
    statusLoaded: "{source} மூலம் தரவு ஏற்றப்பட்டது",
    cityMissing: "நகரத்தின் பெயரை உள்ளிடவும்.",
    cityNotFound: "நகரம் கிடைக்கவில்லை. எழுத்துப்பிழை பார்க்கவும்.",
    allKeysFailed: "அனைத்து inbuilt API key-களும் தோல்வியடைந்தன.",
    weatherUnavailable: "வானிலை தரவு இல்லை",
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
  feelsLikeValue: document.getElementById("feelsLikeValue"),
  humidityValue: document.getElementById("humidityValue"),
  windValue: document.getElementById("windValue"),
  pressureValue: document.getElementById("pressureValue"),
  cloudsValue: document.getElementById("cloudsValue"),
  sunriseValue: document.getElementById("sunriseValue"),
  sunsetValue: document.getElementById("sunsetValue"),
  sourceValue: document.getElementById("sourceValue"),
};

function currentPack() {
  const language = els.languageSelect.value;
  return UI_TEXT[language] || UI_TEXT.English;
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
  els.statusText.textContent = pack.statusReady;
  els.unitsSelect.options[0].textContent = pack.celsius;
  els.unitsSelect.options[1].textContent = pack.fahrenheit;

  els.feelsLikeLabel.textContent = pack.details.feelsLike;
  els.humidityLabel.textContent = pack.details.humidity;
  els.windLabel.textContent = pack.details.wind;
  els.pressureLabel.textContent = pack.details.pressure;
  els.cloudsLabel.textContent = pack.details.clouds;
  els.sunriseLabel.textContent = pack.details.sunrise;
  els.sunsetLabel.textContent = pack.details.sunset;
  els.sourceLabel.textContent = pack.details.source;

  renderQuickCities();
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
  if (isLoading) {
    els.statusText.textContent = pack.statusLoading;
  }
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
  els.conditionSymbol.textContent = data.symbol || "🌤";
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
  els.statusText.textContent = pack.statusLoaded.replace("{source}", data.source || "--");
}

function renderError(message) {
  const pack = currentPack();
  els.statusText.textContent = message;
  els.descriptionText.textContent = pack.weatherUnavailable;
  updateDetails({
    feelsLike: "--",
    humidity: "--",
    wind: "--",
    pressure: "--",
    clouds: "--",
    sunrise: "--",
    sunset: "--",
    source: "--",
  });
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
    temperatureUnit: units === "metric" ? "°C" : "°F",
    description: weather.description || "",
    condition,
    symbol: WEATHER_SYMBOLS[condition] || "🌤",
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

async function fetchFromOpenWeather(city, language, units, customKey) {
  const keys = getCandidateKeys(customKey);
  const pack = currentPack();

  if (!keys.length) {
    return { error: pack.allKeysFailed };
  }

  const languageCode = LANGUAGE_CODES[language] || "en";
  let lastKeyError = "";

  for (const entry of keys) {
    const params = new URLSearchParams({
      q: city,
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
        return { error: pack.cityNotFound };
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
      city,
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

function initialize() {
  applyLanguageUI();
  els.fetchBtn.addEventListener("click", fetchWeather);
  els.languageSelect.addEventListener("change", applyLanguageUI);
  els.cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      fetchWeather();
    }
  });
}

initialize();

const OPENWEATHER_ENDPOINT = "https://api.openweathermap.org/data/2.5/weather";
const OPEN_METEO_FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const FORECAST_DAYS = 15;
const GEOLOCATION_TIMEOUT_MS = 4500;
const BUILTIN_API_KEYS = [
  "d7842c0b970d897c608c64e6b6cc0b8a",
  "48a90ac42caa09f90dcaeee4096b9e53",
];

const LANGUAGE_CODES = {
  English: "en",
  Assamese: "as",
  Bengali: "bn",
  Bodo: "brx",
  Dogri: "doi",
  Gujarati: "gu",
  Hindi: "hi",
  Kannada: "kn",
  Kashmiri: "ks",
  Konkani: "gom",
  Maithili: "mai",
  Malayalam: "ml",
  Manipuri: "mni",
  Marathi: "mr",
  Nepali: "ne",
  Odia: "or",
  Punjabi: "pa",
  Sanskrit: "sa",
  Santali: "sat",
  Sindhi: "sd",
  Tamil: "ta",
  Telugu: "te",
  Urdu: "ur",
};

const OPENWEATHER_LANGUAGE_FALLBACK = {
  Bodo: "hi",
  Dogri: "hi",
  Konkani: "mr",
  Maithili: "hi",
  Manipuri: "hi",
  Santali: "hi",
  Sanskrit: "hi",
};

const LANGUAGE_TRANSLATION_TARGETS = {
  English: ["en"],
  Assamese: ["as", "hi"],
  Bengali: ["bn", "hi"],
  Bodo: ["brx", "hi"],
  Dogri: ["doi", "hi"],
  Gujarati: ["gu", "hi"],
  Hindi: ["hi"],
  Kannada: ["kn", "hi"],
  Kashmiri: ["ks", "ur", "hi"],
  Konkani: ["gom", "mr", "hi"],
  Maithili: ["mai", "hi"],
  Malayalam: ["ml", "hi"],
  Manipuri: ["mni-Mtei", "mni", "hi"],
  Marathi: ["mr", "hi"],
  Nepali: ["ne", "hi"],
  Odia: ["or", "hi"],
  Punjabi: ["pa", "hi"],
  Sanskrit: ["sa", "hi"],
  Santali: ["sat", "hi"],
  Sindhi: ["sd", "ur", "hi"],
  Tamil: ["ta", "hi"],
  Telugu: ["te", "hi"],
  Urdu: ["ur", "hi"],
};

const LANGUAGE_LOCALES = {
  English: "en-IN",
  Assamese: "as-IN",
  Bengali: "bn-IN",
  Dogri: "hi-IN",
  Gujarati: "gu-IN",
  Hindi: "hi-IN",
  Kannada: "kn-IN",
  Kashmiri: "ks-IN",
  Konkani: "gom-IN",
  Malayalam: "ml-IN",
  Marathi: "mr-IN",
  Nepali: "ne-NP",
  Odia: "or-IN",
  Punjabi: "pa-IN",
  Sanskrit: "sa-IN",
  Sindhi: "sd-IN",
  Tamil: "ta-IN",
  Telugu: "te-IN",
  Urdu: "ur-IN",
};

const FORECAST_TEXT = {
  English: {
    title: "15-Day Outlook",
    subtitle: "Expected changes in temperature and rain probability.",
    trendPrefix: "Expected change",
    loading: "Loading 15-day forecast...",
    unavailable: "15-day forecast unavailable right now.",
    idle: "Search a city to load the 15-day outlook.",
    selectedDayTitle: "Selected day details",
    conditionLabel: "Condition",
    tempRangeLabel: "High / Low",
    rainChance: "Rain chance",
    rainAmountLabel: "Rain amount",
    disclaimer: "Forecast values can differ from Google because providers and weather models are different.",
    warming: "warmer",
    cooling: "cooler",
    stable: "stable",
    wetter: "wetter",
    drier: "drier",
  },
  Hindi: {
    title: "15-दिन का पूर्वानुमान",
    subtitle: "तापमान और बारिश की संभावना में संभावित बदलाव।",
    trendPrefix: "संभावित बदलाव",
    loading: "15-दिन का पूर्वानुमान लोड हो रहा है...",
    unavailable: "अभी 15-दिन का पूर्वानुमान उपलब्ध नहीं है।",
    idle: "15-दिन का पूर्वानुमान देखने के लिए शहर खोजें।",
    selectedDayTitle: "चुने गए दिन का विवरण",
    conditionLabel: "स्थिति",
    tempRangeLabel: "अधिकतम / न्यूनतम",
    rainChance: "बारिश की संभावना",
    rainAmountLabel: "बारिश की मात्रा",
    disclaimer: "Google और इस ऐप में अंतर हो सकता है क्योंकि डेटा स्रोत और मौसम मॉडल अलग होते हैं।",
    warming: "गर्म",
    cooling: "ठंडा",
    stable: "लगभग स्थिर",
    wetter: "ज्यादा बारिश",
    drier: "कम बारिश",
  },
  Nepali: {
    title: "१५-दिने पूर्वानुमान",
    subtitle: "तापक्रम र वर्षाको सम्भावनामा अपेक्षित परिवर्तन।",
    trendPrefix: "अपेक्षित परिवर्तन",
    loading: "१५-दिने पूर्वानुमान लोड हुँदैछ...",
    unavailable: "अहिले १५-दिने पूर्वानुमान उपलब्ध छैन।",
    idle: "१५-दिने पूर्वानुमान हेर्न सहर खोज्नुहोस्।",
    selectedDayTitle: "छानिएको दिनको विवरण",
    conditionLabel: "अवस्था",
    tempRangeLabel: "उच्च / न्यून",
    rainChance: "वर्षाको सम्भावना",
    rainAmountLabel: "वर्षा मात्रा",
    disclaimer: "Google सँग फरक देखिन सक्छ किनकि डेटा स्रोत र मौसम मोडेल फरक हुन्छन्।",
    warming: "तातो हुँदै",
    cooling: "चिसिँदै",
    stable: "लगभग स्थिर",
    wetter: "बढी वर्षा",
    drier: "कम वर्षा",
  },
  Malayalam: {
    title: "15 ദിവസത്തെ പ്രവചനം",
    subtitle: "താപനിലയിലും മഴസാധ്യതയിലും പ്രതീക്ഷിക്കുന്ന മാറ്റങ്ങൾ.",
    trendPrefix: "പ്രതീക്ഷിക്കുന്ന മാറ്റം",
    loading: "15 ദിവസത്തെ പ്രവചനം ലോഡ് ചെയ്യുന്നു...",
    unavailable: "ഇപ്പോൾ 15 ദിവസത്തെ പ്രവചനം ലഭ്യമല്ല.",
    idle: "15 ദിവസത്തെ പ്രവചനം കാണാൻ ഒരു നഗരം തിരയുക.",
    selectedDayTitle: "തിരഞ്ഞെടുത്ത ദിവസത്തിന്റെ വിശദാംശങ്ങൾ",
    conditionLabel: "സ്ഥിതി",
    tempRangeLabel: "പരമാവധി / കുറഞ്ഞത്",
    rainChance: "മഴ സാധ്യത",
    rainAmountLabel: "മഴയുടെ അളവ്",
    disclaimer: "ഡാറ്റ ഉറവിടവും മോഡലുകളും വ്യത്യസ്തമായതിനാൽ Google-നേക്കാൾ വ്യത്യാസം വരാം.",
    warming: "കൂടുതൽ ചൂട്",
    cooling: "കൂടുതൽ തണുപ്പ്",
    stable: "ഏകദേശം സ്ഥിരം",
    wetter: "കൂടുതൽ മഴ",
    drier: "കുറഞ്ഞ മഴ",
  },
  Telugu: {
    title: "15-రోజుల అంచనా",
    subtitle: "ఉష్ణోగ్రత మరియు వర్ష అవకాశంలో భావించే మార్పులు.",
    trendPrefix: "భావించే మార్పు",
    loading: "15-రోజుల అంచనా లోడ్ అవుతోంది...",
    unavailable: "ప్రస్తుతం 15-రోజుల అంచనా అందుబాటులో లేదు.",
    idle: "15-రోజుల అంచనా చూడటానికి నగరాన్ని వెతకండి.",
    selectedDayTitle: "ఎంచుకున్న రోజు వివరాలు",
    conditionLabel: "పరిస్థితి",
    tempRangeLabel: "గరిష్టం / కనిష్టం",
    rainChance: "వర్ష అవకాశం",
    rainAmountLabel: "వర్ష పరిమాణం",
    disclaimer: "డేటా సోర్స్ మరియు మోడల్స్ వేరుగా ఉండటం వల్ల Google తో తేడాలు రావచ్చు.",
    warming: "ఎక్కువ వేడి",
    cooling: "ఎక్కువ చలి",
    stable: "దాదాపు స్థిరం",
    wetter: "ఎక్కువ వర్షం",
    drier: "తక్కువ వర్షం",
  },
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

const CONDITION_LABELS = {
  Nepali: {
    Thunderstorm: "मेघगर्जन",
    Drizzle: "फुसफुसे पानी",
    Rain: "वर्षा",
    Snow: "हिउँ",
    Mist: "कुहिरो",
    Smoke: "धुवाँ",
    Haze: "धुम्म अवस्था",
    Dust: "धुलो",
    Fog: "कुहिरो",
    Sand: "बालुवायुक्त अवस्था",
    Ash: "राखयुक्त अवस्था",
    Squall: "तीव्र हावाहुरी",
    Tornado: "भुमरी",
    Clear: "साफ आकाश",
    Clouds: "बादल",
  },
  Malayalam: {
    Thunderstorm: "ഇടിമിന്നലോട് കൂടിയ കാലാവസ്ഥ",
    Drizzle: "ചാറ്റൽമഴ",
    Rain: "മഴ",
    Snow: "മഞ്ഞുവീഴ്ച",
    Mist: "മഞ്ഞ്",
    Smoke: "പുക",
    Haze: "മങ്ങിയ കാലാവസ്ഥ",
    Dust: "പൊടി",
    Fog: "കട്ടമഞ്ഞ്",
    Sand: "മണൽ കാറ്റ്",
    Ash: "ചാര കണങ്ങൾ",
    Squall: "ശക്തമായ കാറ്റ്",
    Tornado: "ചുഴലിക്കാറ്റ്",
    Clear: "തെളിഞ്ഞ ആകാശം",
    Clouds: "മേഘാവൃതം",
  },
  Telugu: {
    Thunderstorm: "ఉరుములతో కూడిన వాతావరణం",
    Drizzle: "చినుకులు",
    Rain: "వర్షం",
    Snow: "మంచు",
    Mist: "మసకమంచు",
    Smoke: "పొగ",
    Haze: "మబ్బు వాతావరణం",
    Dust: "దుమ్ము",
    Fog: "మంచు పొగమంచు",
    Sand: "ఇసుక గాలి",
    Ash: "బూడిద కణాలు",
    Squall: "బలమైన ఈదురుగాలి",
    Tornado: "సుడిగాలి",
    Clear: "స్పష్టమైన ఆకాశం",
    Clouds: "మేఘావృతం",
  },
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
  Nepali: {
    title: "क्षेत्रीय मौसम स्टुडियो",
    subtitle: "inbuilt API key fallback सहित आधुनिक मौसम एप।",
    chip: "लाइभ + स्थानीय",
    cityLabel: "सहर",
    cityPlaceholder: "सहर खोज्नुहोस्...",
    languageLabel: "भाषा",
    unitsLabel: "एकाइ",
    celsius: "सेल्सियस",
    fahrenheit: "फारेनहाइट",
    apiKeyLabel: "कस्टम API key (वैकल्पिक)",
    apiKeyPlaceholder: "खाली छोड्दा inbuilt key प्रयोग हुन्छ",
    fetchButton: "मौसम हेर्नुहोस्",
    quickLabel: "द्रुत सहरहरू",
    statusReady: "तयार",
    statusLoading: "मौसम डेटा लोड हुँदैछ...",
    statusLocating: "तपाईंको स्थान पत्ता लगाइँदैछ...",
    statusLoaded: "{source} बाट डेटा लोड भयो",
    statusAutoLoaded: "तपाईंको स्थानको मौसम {source} बाट लोड भयो",
    cityMissing: "कृपया सहरको नाम लेख्नुहोस्।",
    cityNotFound: "सहर भेटिएन। हिज्जे जाँच्नुहोस्।",
    locationLookupFailed: "तपाईंको हालको स्थानको मौसम ल्याउन सकिएन।",
    locationUnsupported: "यो ब्राउजरमा geolocation समर्थन छैन।",
    locationDenied: "स्थान अनुमति अस्वीकृत भयो। सहर हातैले लेख्नुहोस्।",
    locationUnavailable: "अहिले तपाईंको स्थान पत्ता लगाउन सकिएन।",
    allKeysFailed: "सबै inbuilt API key असफल भए।",
    weatherUnavailable: "मौसम डेटा उपलब्ध छैन",
    updatedPrefix: "अपडेट",
    detailsTitle: "वायुमण्डलीय मेट्रिक्स",
    detailsSubtitle: "हालको पूर्वानुमानका प्रत्यक्ष मानहरू",
    snapshotLabel: "हालको स्थिति",
    details: {
      feelsLike: "अनुभूत तापक्रम",
      humidity: "आर्द्रता",
      wind: "हावाको गति",
      pressure: "चाप",
      clouds: "बादल",
      sunrise: "सूर्योदय",
      sunset: "सूर्यास्त",
      source: "डेटा स्रोत",
    },
    quickCities: ["कोलकाता", "दिल्ली", "मुंबई", "चेन्नई", "ढाका", "बेङ्गलुरु"],
  },
  Malayalam: {
    title: "പ്രാദേശിക കാലാവസ്ഥ സ്റ്റുഡിയോ",
    subtitle: "inbuilt API key fallback ഉള്ള ആധുനിക കാലാവസ്ഥ ആപ്പ്.",
    chip: "ലൈവ് + ലോക്കൽ",
    cityLabel: "നഗരം",
    cityPlaceholder: "നഗരം തിരയൂ...",
    languageLabel: "ഭാഷ",
    unitsLabel: "യൂണിറ്റ്",
    celsius: "സെൽഷ്യസ്",
    fahrenheit: "ഫാരൻഹീറ്റ്",
    apiKeyLabel: "കസ്റ്റം API key (ഐച്ഛികം)",
    apiKeyPlaceholder: "ശൂന്യമായി വിട്ടാൽ inbuilt key ഉപയോഗിക്കും",
    fetchButton: "കാലാവസ്ഥ കാണുക",
    quickLabel: "വേഗ നഗരങ്ങൾ",
    statusReady: "തയ്യാർ",
    statusLoading: "കാലാവസ്ഥാ ഡാറ്റ ലോഡ് ചെയ്യുന്നു...",
    statusLocating: "നിങ്ങളുടെ ലൊക്കേഷൻ കണ്ടെത്തുന്നു...",
    statusLoaded: "{source} വഴി ഡാറ്റ ലോഡ് ചെയ്തു",
    statusAutoLoaded: "നിങ്ങളുടെ ലൊക്കേഷന്റെ കാലാവസ്ഥ {source} വഴി ലോഡ് ചെയ്തു",
    cityMissing: "ദയവായി നഗരനാമം നൽകുക.",
    cityNotFound: "നഗരം കണ്ടെത്തിയില്ല. അക്ഷരത്തെറ്റ് പരിശോധിക്കുക.",
    locationLookupFailed: "നിങ്ങളുടെ നിലവിലെ ലൊക്കേഷന്റെ കാലാവസ്ഥ ലഭ്യമാക്കാൻ കഴിഞ്ഞില്ല.",
    locationUnsupported: "ഈ ബ്രൗസറിൽ geolocation പിന്തുണയില്ല.",
    locationDenied: "ലൊക്കേഷൻ അനുമതി നിഷേധിച്ചു. നഗരം കൈയോടെ നൽകുക.",
    locationUnavailable: "ഇപ്പോൾ നിങ്ങളുടെ ലൊക്കേഷൻ കണ്ടെത്താൻ കഴിഞ്ഞില്ല.",
    allKeysFailed: "എല്ലാ inbuilt API key-കളും പരാജയപ്പെട്ടു.",
    weatherUnavailable: "കാലാവസ്ഥാ ഡാറ്റ ലഭ്യമല്ല",
    updatedPrefix: "അപ്ഡേറ്റ്",
    detailsTitle: "വായുമണ്ഡല മാനദണ്ഡങ്ങൾ",
    detailsSubtitle: "നിലവിലെ പ്രവചനത്തിലെ തത്സമയ മൂല്യങ്ങൾ",
    snapshotLabel: "നിലവിലെ സ്ഥിതി",
    details: {
      feelsLike: "അനുഭവ താപനില",
      humidity: "ഈർപ്പം",
      wind: "കാറ്റിന്റെ വേഗം",
      pressure: "മർദ്ദം",
      clouds: "മേഘാവരണം",
      sunrise: "സൂര്യോദയം",
      sunset: "സൂര്യാസ്തമയം",
      source: "ഡാറ്റ ഉറവിടം",
    },
    quickCities: ["കൊൽക്കത്ത", "ഡൽഹി", "മുംബൈ", "ചെന്നൈ", "ഡാക്ക", "ബെംഗളൂരു"],
  },
  Telugu: {
    title: "ప్రాంతీయ వాతావరణ స్టూడియో",
    subtitle: "inbuilt API key fallback తో ఆధునిక వాతావరణ యాప్.",
    chip: "లైవ్ + లోకల్",
    cityLabel: "నగరం",
    cityPlaceholder: "నగరాన్ని శోధించండి...",
    languageLabel: "భాష",
    unitsLabel: "యూనిట్లు",
    celsius: "సెల్సియస్",
    fahrenheit: "ఫారెన్‌హీట్",
    apiKeyLabel: "కస్టమ్ API key (ఐచ్ఛికం)",
    apiKeyPlaceholder: "ఖాళీగా వదిలితే inbuilt key ఉపయోగించబడుతుంది",
    fetchButton: "వాతావరణం చూడండి",
    quickLabel: "త్వరిత నగరాలు",
    statusReady: "సిద్ధంగా ఉంది",
    statusLoading: "వాతావరణ డేటా లోడ్ అవుతోంది...",
    statusLocating: "మీ లొకేషన్ గుర్తిస్తోంది...",
    statusLoaded: "{source} ద్వారా డేటా లోడ్ అయింది",
    statusAutoLoaded: "మీ లొకేషన్ వాతావరణం {source} ద్వారా లోడ్ అయింది",
    cityMissing: "దయచేసి నగర పేరును నమోదు చేయండి.",
    cityNotFound: "నగరం కనబడలేదు. స్పెల్లింగ్ తనిఖీ చేయండి.",
    locationLookupFailed: "మీ ప్రస్తుత లొకేషన్‌కు వాతావరణం పొందలేకపోయాం.",
    locationUnsupported: "ఈ బ్రౌజర్‌లో geolocation మద్దతు లేదు.",
    locationDenied: "లొకేషన్ అనుమతి నిరాకరించబడింది. నగరాన్ని మాన్యువల్‌గా ఇవ్వండి.",
    locationUnavailable: "ప్రస్తుతం మీ లొకేషన్ గుర్తించలేకపోతున్నాం.",
    allKeysFailed: "అన్ని inbuilt API keyలు విఫలమయ్యాయి.",
    weatherUnavailable: "వాతావరణ డేటా అందుబాటులో లేదు",
    updatedPrefix: "అప్డేట్",
    detailsTitle: "వాతావరణ ప్రమాణాలు",
    detailsSubtitle: "ప్రస్తుత అంచనాల నుండి లైవ్ విలువలు",
    snapshotLabel: "ప్రస్తుత స్థితి",
    details: {
      feelsLike: "అనుభూతి ఉష్ణోగ్రత",
      humidity: "ఆర్ద్రత",
      wind: "గాలి వేగం",
      pressure: "పీడనం",
      clouds: "మేఘావరణం",
      sunrise: "సూర్యోదయం",
      sunset: "సూర్యాస్తమయం",
      source: "డేటా మూలం",
    },
    quickCities: ["కొలకతా", "ఢిల్లీ", "ముంబై", "చెన్నై", "ఢాకా", "బెంగళూరు"],
  },
};

const UI_TRANSLATABLE_KEYS = [
  "title",
  "subtitle",
  "chip",
  "cityLabel",
  "cityPlaceholder",
  "languageLabel",
  "unitsLabel",
  "celsius",
  "fahrenheit",
  "apiKeyLabel",
  "apiKeyPlaceholder",
  "fetchButton",
  "quickLabel",
  "statusReady",
  "statusLoading",
  "statusLocating",
  "statusLoaded",
  "statusAutoLoaded",
  "cityMissing",
  "cityNotFound",
  "locationLookupFailed",
  "locationUnsupported",
  "locationDenied",
  "locationUnavailable",
  "allKeysFailed",
  "weatherUnavailable",
  "updatedPrefix",
  "detailsTitle",
  "detailsSubtitle",
  "snapshotLabel",
];
const UI_DETAIL_TRANSLATABLE_KEYS = [
  "feelsLike",
  "humidity",
  "wind",
  "pressure",
  "clouds",
  "sunrise",
  "sunset",
  "source",
];
const FORECAST_TRANSLATABLE_KEYS = [
  "title",
  "subtitle",
  "trendPrefix",
  "loading",
  "unavailable",
  "idle",
  "selectedDayTitle",
  "conditionLabel",
  "tempRangeLabel",
  "rainChance",
  "rainAmountLabel",
  "disclaimer",
  "warming",
  "cooling",
  "stable",
  "wetter",
  "drier",
];
const WEATHER_CONDITIONS = Object.keys(WEATHER_SYMBOLS);

const translationCache = new Map();
const translationRequestCache = new Map();
const languagePackRequestCache = new Map();
const forecastTextRequestCache = new Map();
const conditionLabelRequestCache = new Map();
const experienceTextRequestCache = new Map();

const QUICK_CITY_QUERY = ["Kolkata", "Delhi", "Mumbai", "Chennai", "Dhaka", "Bengaluru"];
const FAVORITES_STORAGE_KEY = "regional-weather-studio-favorites-v1";
const MAX_FAVORITES = 8;

const EXPERIENCE_TEXT = {
  English: {
    favoritesLabel: "Saved cities",
    saveCityButton: "Save city",
    emptyFavorites: "No saved cities yet.",
    noCityToSave: "Search a city first to save it.",
    citySavedStatus: "{city} saved to favorites.",
    cityRemovedStatus: "{city} removed from favorites.",
    cityAlreadySavedStatus: "{city} is already in favorites.",
    removeCityLabel: "Remove",
    insightTitle: "Weather Persona",
    insightIdle: "Search a city to generate a personalized weather narrative.",
    insightSummaryTemplate: "{location}: {description}. {comfortPrefix} {score}/100 ({band}).",
    insightSummaryBasicTemplate: "{location}: {description}.",
    insightComfortPrefix: "Comfort",
    insightComfortHigh: "Excellent",
    insightComfortMid: "Balanced",
    insightComfortLow: "Harsh",
    tipWarm: "Light layers should be comfortable for most outdoor plans.",
    tipCold: "Keep a warm layer ready, especially in early morning and evening.",
    tipHumid: "Humidity is high, so stay hydrated and prefer breathable fabrics.",
    tipWindy: "Winds are stronger than usual, so secure loose items outdoors.",
    tipRainy: "Rain chance is elevated in upcoming days; keep a rain backup.",
    tipDry: "Rain chance is limited in the next few days, ideal for commute windows.",
    plannerTitle: "Best Outdoor Window",
    plannerIdle: "Load weather to compute the best 3-hour outdoor window.",
    plannerLoading: "Computing best outdoor window...",
    plannerUnavailable: "Could not compute a reliable outdoor window.",
    plannerConfidencePrefix: "Confidence",
    plannerConfidenceHigh: "High",
    plannerConfidenceMid: "Medium",
    plannerConfidenceLow: "Low",
    plannerTempLabel: "Temperature",
    plannerRainLabel: "Rain chance",
    plannerWindLabel: "Wind",
    plannerUvLabel: "UV index",
  },
};

const EXPERIENCE_TRANSLATABLE_KEYS = Object.keys(EXPERIENCE_TEXT.English);

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
  favoritesLabel: document.getElementById("favoritesLabel"),
  saveCityBtn: document.getElementById("saveCityBtn"),
  favoriteCities: document.getElementById("favoriteCities"),
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
  forecastTitle: document.getElementById("forecastTitle"),
  forecastSubtitle: document.getElementById("forecastSubtitle"),
  forecastTrend: document.getElementById("forecastTrend"),
  forecastList: document.getElementById("forecastList"),
  forecastDisclaimer: document.getElementById("forecastDisclaimer"),
  forecastDayDetails: document.getElementById("forecastDayDetails"),
  forecastSelectedTitle: document.getElementById("forecastSelectedTitle"),
  forecastSelectedDate: document.getElementById("forecastSelectedDate"),
  forecastSelectedConditionLabel: document.getElementById("forecastSelectedConditionLabel"),
  forecastSelectedConditionValue: document.getElementById("forecastSelectedConditionValue"),
  forecastSelectedTempLabel: document.getElementById("forecastSelectedTempLabel"),
  forecastSelectedTempValue: document.getElementById("forecastSelectedTempValue"),
  forecastSelectedRainLabel: document.getElementById("forecastSelectedRainLabel"),
  forecastSelectedRainValue: document.getElementById("forecastSelectedRainValue"),
  forecastSelectedRainAmountLabel: document.getElementById("forecastSelectedRainAmountLabel"),
  forecastSelectedRainAmountValue: document.getElementById("forecastSelectedRainAmountValue"),
  insightTitle: document.getElementById("insightTitle"),
  comfortBadge: document.getElementById("comfortBadge"),
  insightSummary: document.getElementById("insightSummary"),
  insightTips: document.getElementById("insightTips"),
  plannerTitle: document.getElementById("plannerTitle"),
  plannerConfidence: document.getElementById("plannerConfidence"),
  plannerWindow: document.getElementById("plannerWindow"),
  plannerTempLabel: document.getElementById("plannerTempLabel"),
  plannerTempValue: document.getElementById("plannerTempValue"),
  plannerRainLabel: document.getElementById("plannerRainLabel"),
  plannerRainValue: document.getElementById("plannerRainValue"),
  plannerWindLabel: document.getElementById("plannerWindLabel"),
  plannerWindValue: document.getElementById("plannerWindValue"),
  plannerUvLabel: document.getElementById("plannerUvLabel"),
  plannerUvValue: document.getElementById("plannerUvValue"),
};

let freshAnimationTimer = null;
let latestWeatherData = null;
let latestForecast = null;
let forecastRequestCounter = 0;
let forecastState = "idle";
let selectedForecastDate = "";
let uiLanguageRequestCounter = 0;
let weatherDescriptionRequestCounter = 0;
let plannerRequestCounter = 0;
let plannerState = "idle";
let latestPlannerWindow = null;
let favoriteCitiesState = [];

function translationTargetsFor(language) {
  const candidates = LANGUAGE_TRANSLATION_TARGETS[language] || [LANGUAGE_CODES[language], "hi"];
  return candidates.filter((code, idx) => Boolean(code) && candidates.indexOf(code) === idx);
}

function tokenizeTemplatePlaceholders(value) {
  const placeholders = [];
  const text = String(value || "");
  const tokenized = text.replace(/\{[^}]+\}/g, (match) => {
    const token = `__PH_${placeholders.length}__`;
    placeholders.push({ token, match });
    return token;
  });
  return { tokenized, placeholders };
}

function restoreTemplatePlaceholders(value, placeholders) {
  return placeholders.reduce((acc, item) => acc.replace(item.token, item.match), value);
}

function readGoogleTranslatePayload(payload) {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    return "";
  }
  return payload[0].map((chunk) => (Array.isArray(chunk) ? chunk[0] : "")).join("").trim();
}

async function requestGoogleTranslation(text, target) {
  const cacheKey = `${target}::${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  if (translationRequestCache.has(cacheKey)) {
    return translationRequestCache.get(cacheKey);
  }

  const request = (async () => {
    const { tokenized, placeholders } = tokenizeTemplatePlaceholders(text);
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&dt=t&tl=${encodeURIComponent(target)}` +
      `&q=${encodeURIComponent(tokenized)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Translate API error (${response.status})`);
    }
    const payload = await response.json();
    const translated = readGoogleTranslatePayload(payload);
    const restored = restoreTemplatePlaceholders(translated || String(text), placeholders);
    translationCache.set(cacheKey, restored);
    return restored;
  })()
    .catch(() => String(text))
    .finally(() => {
      translationRequestCache.delete(cacheKey);
    });

  translationRequestCache.set(cacheKey, request);
  return request;
}

async function translateText(text, language) {
  const input = String(text ?? "");
  if (!input || language === "English") {
    return input;
  }
  const targets = translationTargetsFor(language);
  for (const target of targets) {
    const translated = await requestGoogleTranslation(input, target);
    if (translated && translated.toLowerCase() !== input.toLowerCase()) {
      return translated;
    }
  }
  return input;
}

async function buildTranslatedUiPack(language) {
  const base = UI_TEXT.English;
  const translatedValues = await Promise.all(UI_TRANSLATABLE_KEYS.map((key) => translateText(base[key], language)));
  const translatedDetails = await Promise.all(
    UI_DETAIL_TRANSLATABLE_KEYS.map((key) => translateText(base.details[key], language))
  );
  const translatedQuickCities = await Promise.all(base.quickCities.map((city) => translateText(city, language)));

  const nextPack = { ...base, details: { ...base.details }, quickCities: translatedQuickCities };
  UI_TRANSLATABLE_KEYS.forEach((key, idx) => {
    nextPack[key] = translatedValues[idx] || base[key];
  });
  UI_DETAIL_TRANSLATABLE_KEYS.forEach((key, idx) => {
    nextPack.details[key] = translatedDetails[idx] || base.details[key];
  });
  return nextPack;
}

async function ensureLanguagePack(language) {
  if (UI_TEXT[language]) {
    return UI_TEXT[language];
  }
  if (languagePackRequestCache.has(language)) {
    return languagePackRequestCache.get(language);
  }
  const request = buildTranslatedUiPack(language)
    .then((pack) => {
      UI_TEXT[language] = pack;
      return pack;
    })
    .finally(() => {
      languagePackRequestCache.delete(language);
    });
  languagePackRequestCache.set(language, request);
  return request;
}

async function ensureForecastText(language) {
  if (FORECAST_TEXT[language]) {
    return FORECAST_TEXT[language];
  }
  if (forecastTextRequestCache.has(language)) {
    return forecastTextRequestCache.get(language);
  }
  const base = FORECAST_TEXT.English;
  const request = Promise.all(FORECAST_TRANSLATABLE_KEYS.map((key) => translateText(base[key], language)))
    .then((translated) => {
      const pack = { ...base };
      FORECAST_TRANSLATABLE_KEYS.forEach((key, idx) => {
        pack[key] = translated[idx] || base[key];
      });
      FORECAST_TEXT[language] = pack;
      return pack;
    })
    .finally(() => {
      forecastTextRequestCache.delete(language);
    });
  forecastTextRequestCache.set(language, request);
  return request;
}

async function ensureExperienceText(language) {
  if (EXPERIENCE_TEXT[language]) {
    return EXPERIENCE_TEXT[language];
  }
  if (experienceTextRequestCache.has(language)) {
    return experienceTextRequestCache.get(language);
  }
  const base = EXPERIENCE_TEXT.English;
  const request = Promise.all(EXPERIENCE_TRANSLATABLE_KEYS.map((key) => translateText(base[key], language)))
    .then((translated) => {
      const pack = { ...base };
      EXPERIENCE_TRANSLATABLE_KEYS.forEach((key, idx) => {
        pack[key] = translated[idx] || base[key];
      });
      EXPERIENCE_TEXT[language] = pack;
      return pack;
    })
    .finally(() => {
      experienceTextRequestCache.delete(language);
    });
  experienceTextRequestCache.set(language, request);
  return request;
}

async function ensureConditionLabels(language) {
  if (CONDITION_LABELS[language]) {
    return CONDITION_LABELS[language];
  }
  if (conditionLabelRequestCache.has(language)) {
    return conditionLabelRequestCache.get(language);
  }
  const request = Promise.all(WEATHER_CONDITIONS.map((condition) => translateText(condition, language)))
    .then((translated) => {
      const labels = {};
      WEATHER_CONDITIONS.forEach((condition, idx) => {
        labels[condition] = translated[idx] || condition;
      });
      CONDITION_LABELS[language] = labels;
      return labels;
    })
    .finally(() => {
      conditionLabelRequestCache.delete(language);
    });
  conditionLabelRequestCache.set(language, request);
  return request;
}

async function ensureLanguageResources(language) {
  // Avoid network translation calls on first load for English.
  if (language === "English") {
    if (!CONDITION_LABELS.English) {
      const englishLabels = {};
      WEATHER_CONDITIONS.forEach((condition) => {
        englishLabels[condition] = condition;
      });
      CONDITION_LABELS.English = englishLabels;
    }
    return;
  }
  await Promise.all([
    ensureLanguagePack(language),
    ensureForecastText(language),
    ensureConditionLabels(language),
    ensureExperienceText(language),
  ]);
}

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

function currentForecastText() {
  const language = els.languageSelect.value;
  return FORECAST_TEXT[language] || FORECAST_TEXT.English;
}

function currentExperienceText() {
  const language = els.languageSelect.value;
  return EXPERIENCE_TEXT[language] || EXPERIENCE_TEXT.English;
}

function currentLocale() {
  const language = els.languageSelect.value;
  return LANGUAGE_LOCALES[language] || "en-IN";
}

function fillTemplate(template, replacements) {
  let output = String(template || "");
  Object.entries(replacements || {}).forEach(([key, value]) => {
    output = output.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  });
  return output;
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

function toFiniteNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeCityName(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cityLookupKey(value) {
  return normalizeCityName(value).toLowerCase();
}

function cityFromLocation(value) {
  return normalizeCityName(String(value || "").split(",")[0]);
}

function currentCityCandidate() {
  const typed = normalizeCityName(els.cityInput?.value || "");
  if (typed) {
    return typed;
  }
  return cityFromLocation(latestWeatherData?.location || "");
}

function loadFavoriteCities() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }
    const unique = [];
    const seen = new Set();
    parsed.forEach((city) => {
      const normalized = normalizeCityName(city);
      const key = cityLookupKey(normalized);
      if (!normalized || seen.has(key)) {
        return;
      }
      seen.add(key);
      unique.push(normalized);
    });
    return unique.slice(0, MAX_FAVORITES);
  } catch (error) {
    return [];
  }
}

function persistFavoriteCities() {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteCitiesState));
  } catch (error) {
    // Ignore storage write errors in restricted/private contexts.
  }
}

function setSaveCityButtonState() {
  if (!els.saveCityBtn) {
    return;
  }
  els.saveCityBtn.disabled = !currentCityCandidate();
}

function renderFavoriteCities() {
  if (!els.favoriteCities) {
    return;
  }
  const text = currentExperienceText();
  els.favoriteCities.innerHTML = "";

  if (!favoriteCitiesState.length) {
    const empty = document.createElement("p");
    empty.className = "chip-placeholder";
    empty.textContent = text.emptyFavorites;
    els.favoriteCities.appendChild(empty);
    setSaveCityButtonState();
    return;
  }

  favoriteCitiesState.forEach((city) => {
    const wrap = document.createElement("div");
    wrap.className = "saved-chip";

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "saved-city-btn";
    openBtn.textContent = city;
    openBtn.addEventListener("click", () => {
      els.cityInput.value = city;
      fetchWeather();
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "saved-city-remove";
    removeBtn.textContent = "x";
    removeBtn.setAttribute("aria-label", `${text.removeCityLabel} ${city}`);
    removeBtn.title = text.removeCityLabel;
    removeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      removeFavoriteCity(city);
    });

    wrap.appendChild(openBtn);
    wrap.appendChild(removeBtn);
    els.favoriteCities.appendChild(wrap);
  });

  setSaveCityButtonState();
}

function addFavoriteCity(rawCity) {
  const city = normalizeCityName(rawCity);
  const text = currentExperienceText();
  if (!city) {
    setStatusText(text.noCityToSave, "error");
    return;
  }
  const key = cityLookupKey(city);
  if (favoriteCitiesState.some((entry) => cityLookupKey(entry) === key)) {
    setStatusText(fillTemplate(text.cityAlreadySavedStatus, { city }), "neutral");
    setSaveCityButtonState();
    return;
  }
  favoriteCitiesState = [city, ...favoriteCitiesState.filter((entry) => cityLookupKey(entry) !== key)].slice(0, MAX_FAVORITES);
  persistFavoriteCities();
  renderFavoriteCities();
  setStatusText(fillTemplate(text.citySavedStatus, { city }), "success");
}

function removeFavoriteCity(rawCity) {
  const city = normalizeCityName(rawCity);
  const key = cityLookupKey(city);
  if (!key) {
    return;
  }
  const hasCity = favoriteCitiesState.some((entry) => cityLookupKey(entry) === key);
  if (!hasCity) {
    return;
  }
  favoriteCitiesState = favoriteCitiesState.filter((entry) => cityLookupKey(entry) !== key);
  persistFavoriteCities();
  renderFavoriteCities();
  setStatusText(fillTemplate(currentExperienceText().cityRemovedStatus, { city }), "neutral");
}

function toCelsius(value, unitSymbol) {
  if (unitSymbol === "\u00B0F") {
    return ((Number(value) - 32) * 5) / 9;
  }
  return Number(value);
}

function toKmh(value, windUnit) {
  if (windUnit === "mph") {
    return Number(value) * 1.60934;
  }
  if (windUnit === "m/s") {
    return Number(value) * 3.6;
  }
  return Number(value);
}

function computeComfortScore(data) {
  if (!data) {
    return null;
  }
  const feelsLike = toFiniteNumber(data.feelsLike);
  const humidity = toFiniteNumber(data.humidity);
  const wind = toFiniteNumber(data.windSpeed);
  if (feelsLike === null || humidity === null || wind === null) {
    return null;
  }

  const tempC = toCelsius(feelsLike, data.temperatureUnit);
  const windKmh = toKmh(wind, data.windUnit);
  const tempPenalty = Math.abs(tempC - 24) * 2.5;
  const humidityPenalty = Math.abs(humidity - 52) * 0.45;
  const windPenalty = Math.max(windKmh - 14, 0) * 0.85;
  const score = clamp(100 - tempPenalty - humidityPenalty - windPenalty, 0, 100);
  return Math.round(score);
}

function describeComfort(score) {
  const text = currentExperienceText();
  if (!Number.isFinite(score)) {
    return { label: "--", className: "" };
  }
  if (score >= 74) {
    return { label: text.insightComfortHigh, className: "score-high" };
  }
  if (score >= 48) {
    return { label: text.insightComfortMid, className: "score-mid" };
  }
  return { label: text.insightComfortLow, className: "score-low" };
}

function buildInsightTips(weatherData, forecastData) {
  const text = currentExperienceText();
  const tips = [];
  const feelsLike = toFiniteNumber(weatherData?.feelsLike);
  const humidity = toFiniteNumber(weatherData?.humidity);
  const wind = toFiniteNumber(weatherData?.windSpeed);
  const tempC = feelsLike === null ? null : toCelsius(feelsLike, weatherData.temperatureUnit);
  const windKmh = wind === null ? null : toKmh(wind, weatherData.windUnit);

  if (tempC !== null && tempC <= 17) {
    tips.push(text.tipCold);
  } else {
    tips.push(text.tipWarm);
  }

  if (humidity !== null && humidity >= 72) {
    tips.push(text.tipHumid);
  }
  if (windKmh !== null && windKmh >= 26) {
    tips.push(text.tipWindy);
  }

  const upcoming = Array.isArray(forecastData?.items) ? forecastData.items.slice(0, 4) : [];
  if (upcoming.length) {
    const rainAvg = upcoming.reduce((sum, item) => sum + Number(item.rainChance || 0), 0) / upcoming.length;
    tips.push(rainAvg >= 40 ? text.tipRainy : text.tipDry);
  }

  return tips.filter(Boolean).slice(0, 3);
}

function renderInsights() {
  if (!els.insightSummary || !els.insightTips || !els.comfortBadge || !els.insightTitle) {
    return;
  }

  const text = currentExperienceText();
  els.insightTitle.textContent = text.insightTitle;

  if (!latestWeatherData) {
    els.comfortBadge.classList.remove("score-high", "score-mid", "score-low");
    els.comfortBadge.textContent = `${text.insightComfortPrefix}: --`;
    els.insightSummary.textContent = text.insightIdle;
    els.insightTips.innerHTML = "";
    return;
  }

  const score = computeComfortScore(latestWeatherData);
  const mood = describeComfort(score);
  els.comfortBadge.classList.remove("score-high", "score-mid", "score-low");
  if (mood.className) {
    els.comfortBadge.classList.add(mood.className);
  }
  els.comfortBadge.textContent = Number.isFinite(score)
    ? `${text.insightComfortPrefix}: ${score}/100 (${mood.label})`
    : `${text.insightComfortPrefix}: --`;

  const description = els.descriptionText.textContent || latestWeatherData.description || currentPack().weatherUnavailable;
  const location = latestWeatherData.location || "--";
  if (Number.isFinite(score)) {
    els.insightSummary.textContent = fillTemplate(text.insightSummaryTemplate, {
      location,
      description,
      comfortPrefix: text.insightComfortPrefix,
      score,
      band: mood.label,
    });
  } else {
    els.insightSummary.textContent = fillTemplate(text.insightSummaryBasicTemplate, {
      location,
      description,
    });
  }

  const tips = buildInsightTips(latestWeatherData, latestForecast);
  els.insightTips.innerHTML = "";
  tips.forEach((tip) => {
    const tipNode = document.createElement("p");
    tipNode.className = "insight-tip";
    tipNode.textContent = tip;
    els.insightTips.appendChild(tipNode);
  });
}

function formatPlannerSlotLabel(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "--";
  }
  const locale = currentLocale();
  const day = start.toLocaleDateString(locale, { weekday: "short", day: "2-digit", month: "short" });
  const from = start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const to = end.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return `${day}, ${from} - ${to}`;
}

function plannerConfidenceBand(score) {
  const text = currentExperienceText();
  if (!Number.isFinite(score)) {
    return { label: "--", className: "" };
  }
  if (score >= 74) {
    return { label: text.plannerConfidenceHigh, className: "score-high" };
  }
  if (score >= 48) {
    return { label: text.plannerConfidenceMid, className: "score-mid" };
  }
  return { label: text.plannerConfidenceLow, className: "score-low" };
}

function renderPlannerWindow(plannerData) {
  if (
    !els.plannerTitle ||
    !els.plannerConfidence ||
    !els.plannerWindow ||
    !els.plannerTempValue ||
    !els.plannerRainValue ||
    !els.plannerWindValue ||
    !els.plannerUvValue
  ) {
    return;
  }

  const text = currentExperienceText();
  els.plannerTitle.textContent = text.plannerTitle;
  els.plannerTempLabel.textContent = text.plannerTempLabel;
  els.plannerRainLabel.textContent = text.plannerRainLabel;
  els.plannerWindLabel.textContent = text.plannerWindLabel;
  els.plannerUvLabel.textContent = text.plannerUvLabel;

  if (!plannerData) {
    const message =
      plannerState === "loading"
        ? text.plannerLoading
        : plannerState === "error"
          ? text.plannerUnavailable
          : text.plannerIdle;
    els.plannerConfidence.classList.remove("score-high", "score-mid", "score-low");
    els.plannerConfidence.textContent = `${text.plannerConfidencePrefix}: --`;
    els.plannerWindow.textContent = message;
    els.plannerTempValue.textContent = "--";
    els.plannerRainValue.textContent = "--";
    els.plannerWindValue.textContent = "--";
    els.plannerUvValue.textContent = "--";
    return;
  }

  const band = plannerConfidenceBand(plannerData.score);
  els.plannerConfidence.classList.remove("score-high", "score-mid", "score-low");
  if (band.className) {
    els.plannerConfidence.classList.add(band.className);
  }
  els.plannerConfidence.textContent = `${text.plannerConfidencePrefix}: ${band.label}`;
  els.plannerWindow.textContent = formatPlannerSlotLabel(plannerData.start, plannerData.end);
  els.plannerTempValue.textContent = `${Math.round(plannerData.avgTemp)}${plannerData.tempUnitSymbol}`;
  els.plannerRainValue.textContent = `${Math.round(plannerData.avgRainChance)}%`;
  els.plannerWindValue.textContent = `${Math.round(plannerData.avgWind)} ${plannerData.windUnit}`;
  els.plannerUvValue.textContent = Number(plannerData.maxUv).toFixed(1);
}

function scoreHourlyPoint(item, units) {
  const tempC = units === "imperial" ? ((item.temperature - 32) * 5) / 9 : item.temperature;
  const windKmh = units === "imperial" ? item.windSpeed * 1.60934 : item.windSpeed;
  const tempPenalty = Math.abs(tempC - 24) * 2.4;
  const rainPenalty = item.rainChance * 0.56;
  const windPenalty = Math.max(windKmh - 16, 0) * 1.2;
  const uvPenalty = Math.max(item.uvIndex - 5.5, 0) * 6;
  return clamp(100 - tempPenalty - rainPenalty - windPenalty - uvPenalty, 0, 100);
}

function normalizePlannerHourly(payload) {
  const hourly = payload.hourly || {};
  const times = hourly.time || [];
  const temps = hourly.temperature_2m || [];
  const rains = hourly.precipitation_probability || [];
  const winds = hourly.wind_speed_10m || [];
  const uvs = hourly.uv_index || [];
  const count = Math.min(times.length, temps.length, rains.length, winds.length, uvs.length);
  const points = [];

  for (let idx = 0; idx < count; idx += 1) {
    const when = new Date(times[idx]);
    if (Number.isNaN(when.getTime())) {
      continue;
    }
    points.push({
      time: times[idx],
      dateObj: when,
      temperature: Number(temps[idx]),
      rainChance: Number(rains[idx] ?? 0),
      windSpeed: Number(winds[idx]),
      uvIndex: Number(uvs[idx] ?? 0),
    });
  }
  return points;
}

function isSequentialHourWindow(items) {
  for (let idx = 0; idx < items.length - 1; idx += 1) {
    const diff = items[idx + 1].dateObj.getTime() - items[idx].dateObj.getTime();
    if (diff !== 60 * 60 * 1000) {
      return false;
    }
  }
  return true;
}

function computeBestPlannerWindow(points, units) {
  if (!Array.isArray(points) || points.length < 3) {
    return null;
  }
  let best = null;

  for (let idx = 0; idx <= points.length - 3; idx += 1) {
    const windowItems = points.slice(idx, idx + 3);
    if (!isSequentialHourWindow(windowItems)) {
      continue;
    }
    const startHour = windowItems[0].dateObj.getHours();
    if (startHour < 6 || startHour > 18) {
      continue;
    }
    const scores = windowItems.map((item) => scoreHourlyPoint(item, units));
    const avgScore = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    if (!best || avgScore > best.score) {
      best = {
        score: avgScore,
        start: windowItems[0].time,
        end: windowItems[windowItems.length - 1].time,
        avgTemp: windowItems.reduce((sum, item) => sum + item.temperature, 0) / windowItems.length,
        avgRainChance: windowItems.reduce((sum, item) => sum + item.rainChance, 0) / windowItems.length,
        avgWind: windowItems.reduce((sum, item) => sum + item.windSpeed, 0) / windowItems.length,
        maxUv: Math.max(...windowItems.map((item) => item.uvIndex)),
      };
    }
  }

  return best;
}

async function fetchPlanner(latitude, longitude, units) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: "temperature_2m,precipitation_probability,wind_speed_10m,uv_index",
    forecast_days: "2",
    temperature_unit: units === "imperial" ? "fahrenheit" : "celsius",
    wind_speed_unit: units === "imperial" ? "mph" : "kmh",
    timezone: "auto",
  });
  const response = await fetch(`${OPEN_METEO_FORECAST_ENDPOINT}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Planner API error (${response.status})`);
  }
  const payload = await response.json();
  const points = normalizePlannerHourly(payload);
  const best = computeBestPlannerWindow(points, units);
  if (!best) {
    return null;
  }
  best.tempUnitSymbol = units === "imperial" ? "\u00B0F" : "\u00B0C";
  best.windUnit = units === "imperial" ? "mph" : "km/h";
  return best;
}

async function fetchAndRenderPlanner(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    plannerState = "error";
    latestPlannerWindow = null;
    renderPlannerWindow(null);
    return;
  }

  const ticket = plannerRequestCounter + 1;
  plannerRequestCounter = ticket;
  plannerState = "loading";
  renderPlannerWindow(null);

  try {
    const planner = await fetchPlanner(latitude, longitude, els.unitsSelect.value);
    if (ticket !== plannerRequestCounter) {
      return;
    }
    if (!planner) {
      plannerState = "error";
      latestPlannerWindow = null;
      renderPlannerWindow(null);
      return;
    }
    plannerState = "ready";
    latestPlannerWindow = planner;
    renderPlannerWindow(planner);
  } catch (error) {
    if (ticket !== plannerRequestCounter) {
      return;
    }
    plannerState = "error";
    latestPlannerWindow = null;
    renderPlannerWindow(null);
  }
}

async function applyLanguageUI() {
  const requestId = uiLanguageRequestCounter + 1;
  uiLanguageRequestCounter = requestId;
  const selectedLanguage = els.languageSelect.value;
  await ensureLanguageResources(selectedLanguage);
  if (requestId !== uiLanguageRequestCounter || selectedLanguage !== els.languageSelect.value) {
    return;
  }

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
  const experienceText = currentExperienceText();
  if (els.favoritesLabel) {
    els.favoritesLabel.textContent = experienceText.favoritesLabel;
  }
  if (els.saveCityBtn) {
    els.saveCityBtn.textContent = experienceText.saveCityButton;
  }
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
  const forecastText = currentForecastText();
  if (els.forecastTitle) {
    els.forecastTitle.textContent = forecastText.title;
  }
  if (els.forecastSubtitle) {
    els.forecastSubtitle.textContent = forecastText.subtitle;
  }
  if (els.forecastDisclaimer) {
    els.forecastDisclaimer.textContent = forecastText.disclaimer;
  }
  if (els.forecastSelectedTitle) {
    els.forecastSelectedTitle.textContent = forecastText.selectedDayTitle || "Selected day details";
  }
  if (els.forecastSelectedConditionLabel) {
    els.forecastSelectedConditionLabel.textContent = forecastText.conditionLabel || "Condition";
  }
  if (els.forecastSelectedTempLabel) {
    els.forecastSelectedTempLabel.textContent = forecastText.tempRangeLabel || "High / Low";
  }
  if (els.forecastSelectedRainLabel) {
    els.forecastSelectedRainLabel.textContent = forecastText.rainChance || "Rain chance";
  }
  if (els.forecastSelectedRainAmountLabel) {
    els.forecastSelectedRainAmountLabel.textContent = forecastText.rainAmountLabel || "Rain amount";
  }

  renderQuickCities();
  renderFavoriteCities();
  refreshWeatherLanguage();
  renderInsights();
  renderForecast(latestForecast);
  renderPlannerWindow(latestPlannerWindow);
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
  if (els.saveCityBtn) {
    els.saveCityBtn.disabled = isLoading || !currentCityCandidate();
  }
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
  latestWeatherData = null;
  setWeatherMood("default");
  forecastState = message ? "error" : "idle";
  selectedForecastDate = "";
  latestForecast = null;
  plannerState = message ? "error" : "idle";
  latestPlannerWindow = null;
  renderForecast(null);
  renderPlannerWindow(null);
  renderInsights();
  els.weatherResultContainer?.classList.remove("is-fresh");
  setSaveCityButtonState();
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

function refreshWeatherLanguage() {
  if (!latestWeatherData) {
    return;
  }
  const requestId = weatherDescriptionRequestCounter + 1;
  weatherDescriptionRequestCounter = requestId;
  const pack = currentPack();
  const language = els.languageSelect.value;
  const localizedDescription = localizeDescription(latestWeatherData.description, latestWeatherData.condition, language);
  els.descriptionText.textContent = localizedDescription || pack.weatherUnavailable;
  if (language !== "English" && localizedDescription && isLikelyEnglish(localizedDescription)) {
    void translateText(localizedDescription, language).then((translated) => {
      if (requestId !== weatherDescriptionRequestCounter) {
        return;
      }
      if (translated) {
        els.descriptionText.textContent = translated;
      }
    });
  }
  setStatusText(pack.statusLoaded.replace("{source}", latestWeatherData.source || "--"), "success");
  renderInsights();
}

function mapWmoToCondition(code) {
  return WMO_TO_CONDITION[Number(code)] || "Clouds";
}

function toDisplayCondition(condition, language) {
  const conditionMap = CONDITION_LABELS[language];
  if (!conditionMap) {
    return condition;
  }
  return conditionMap[condition] || condition;
}

function formatTrendText(items) {
  const text = currentForecastText();
  if (!items || !items.length) {
    return `${text.trendPrefix}: --`;
  }
  const first = items.slice(0, 5);
  const last = items.slice(-5);
  const avg = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

  const firstTemp = avg(first.map((item) => item.max));
  const lastTemp = avg(last.map((item) => item.max));
  const tempDelta = lastTemp - firstTemp;

  const firstRain = avg(first.map((item) => item.rainChance));
  const lastRain = avg(last.map((item) => item.rainChance));
  const rainDelta = lastRain - firstRain;

  const tempTrend = tempDelta > 1.2 ? text.warming : tempDelta < -1.2 ? text.cooling : text.stable;
  const rainTrend = rainDelta > 8 ? text.wetter : rainDelta < -8 ? text.drier : text.stable;
  return `${text.trendPrefix}: ${tempTrend}, ${rainTrend}`;
}

function renderSelectedForecastDetails(item, unitSymbol, language) {
  if (
    !els.forecastSelectedDate ||
    !els.forecastSelectedConditionValue ||
    !els.forecastSelectedTempValue ||
    !els.forecastSelectedRainValue ||
    !els.forecastSelectedRainAmountValue
  ) {
    return;
  }

  if (!item) {
    els.forecastSelectedDate.textContent = "--";
    els.forecastSelectedConditionValue.textContent = "--";
    els.forecastSelectedTempValue.textContent = "--";
    els.forecastSelectedRainValue.textContent = "--";
    els.forecastSelectedRainAmountValue.textContent = "--";
    return;
  }

  const locale = currentLocale();
  const dt = new Date(item.date);
  const dateLabel = Number.isNaN(dt.getTime())
    ? item.date
    : dt.toLocaleDateString(locale, { weekday: "long", day: "2-digit", month: "long" });
  const conditionLabel = toDisplayCondition(item.condition, language);
  const symbol = WEATHER_SYMBOLS[item.condition] || "\uD83C\uDF24";

  els.forecastSelectedDate.textContent = dateLabel;
  els.forecastSelectedConditionValue.textContent = `${symbol} ${conditionLabel}`;
  els.forecastSelectedTempValue.textContent = `${Math.round(item.max)}${unitSymbol} / ${Math.round(item.min)}${unitSymbol}`;
  els.forecastSelectedRainValue.textContent = `${Math.round(item.rainChance)}%`;
  els.forecastSelectedRainAmountValue.textContent = `${Number(item.rainAmount ?? 0).toFixed(1)} mm`;
}

function renderForecast(forecastData) {
  if (!els.forecastList || !els.forecastTrend) {
    return;
  }

  const text = currentForecastText();
  const language = els.languageSelect.value;
  const unitSymbol = forecastData?.unitSymbol || (els.unitsSelect.value === "metric" ? "\u00B0C" : "\u00B0F");

  if (!forecastData || !Array.isArray(forecastData.items) || !forecastData.items.length) {
    const fallbackMessage =
      forecastState === "loading"
        ? text.loading
        : forecastState === "error"
          ? text.unavailable
          : text.idle || text.unavailable;
    els.forecastList.innerHTML = `<p class="forecast-rain">${fallbackMessage}</p>`;
    els.forecastTrend.textContent = `${text.trendPrefix}: --`;
    renderSelectedForecastDetails(null, unitSymbol, language);
    renderInsights();
    return;
  }

  if (!selectedForecastDate || !forecastData.items.some((item) => item.date === selectedForecastDate)) {
    selectedForecastDate = forecastData.items[0].date;
  }

  const locale = currentLocale();
  const cards = forecastData.items
    .map((item) => {
      const dt = new Date(item.date);
      const dayLabel = Number.isNaN(dt.getTime())
        ? item.date
        : dt.toLocaleDateString(locale, { weekday: "short", day: "2-digit", month: "short" });
      const conditionLabel = toDisplayCondition(item.condition, language);
      const symbol = WEATHER_SYMBOLS[item.condition] || "\uD83C\uDF24";
      const isSelected = item.date === selectedForecastDate;
      return `
        <button type="button" class="forecast-card ${isSelected ? "is-selected" : ""}" data-forecast-date="${item.date}" aria-pressed="${isSelected}">
          <p class="forecast-day">${dayLabel}</p>
          <p class="forecast-condition">${symbol} ${conditionLabel}</p>
          <p class="forecast-temp">${Math.round(item.max)}${unitSymbol} / ${Math.round(item.min)}${unitSymbol}</p>
          <p class="forecast-rain">${text.rainChance}: ${Math.round(item.rainChance)}%</p>
        </button>
      `;
    })
    .join("");

  els.forecastList.innerHTML = cards;
  const buttons = els.forecastList.querySelectorAll("[data-forecast-date]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextDate = button.getAttribute("data-forecast-date") || "";
      if (!nextDate || nextDate === selectedForecastDate) {
        return;
      }
      selectedForecastDate = nextDate;
      renderForecast(latestForecast);
    });
  });

  const selectedItem = forecastData.items.find((item) => item.date === selectedForecastDate) || forecastData.items[0];
  if (selectedItem) {
    selectedForecastDate = selectedItem.date;
  }
  renderSelectedForecastDetails(selectedItem, unitSymbol, language);
  els.forecastTrend.textContent = formatTrendText(forecastData.items);
  renderInsights();
}

function normalizeForecast(payload) {
  const daily = payload.daily || {};
  const time = daily.time || [];
  const max = daily.temperature_2m_max || [];
  const min = daily.temperature_2m_min || [];
  const rain = daily.precipitation_probability_max || [];
  const rainAmount = daily.precipitation_sum || [];
  const codes = daily.weather_code || [];

  const items = [];
  const count = Math.min(time.length, max.length, min.length, rain.length, codes.length, FORECAST_DAYS);
  for (let idx = 0; idx < count; idx += 1) {
    items.push({
      date: time[idx],
      max: Number(max[idx]),
      min: Number(min[idx]),
      rainChance: Number(rain[idx] ?? 0),
      rainAmount: Number(rainAmount[idx] ?? 0),
      condition: mapWmoToCondition(codes[idx]),
    });
  }
  return { items };
}

async function fetchForecast(latitude, longitude, units) {
  const temperatureUnit = units === "imperial" ? "fahrenheit" : "celsius";
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum",
    forecast_days: String(FORECAST_DAYS),
    temperature_unit: temperatureUnit,
    timezone: "auto",
  });
  const response = await fetch(`${OPEN_METEO_FORECAST_ENDPOINT}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Forecast API error (${response.status})`);
  }
  const payload = await response.json();
  const normalized = normalizeForecast(payload);
  normalized.unitSymbol = units === "imperial" ? "\u00B0F" : "\u00B0C";
  return normalized;
}

async function fetchAndRenderForecast(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    forecastState = "error";
    selectedForecastDate = "";
    latestForecast = null;
    renderForecast(null);
    return;
  }

  const ticket = forecastRequestCounter + 1;
  forecastRequestCounter = ticket;
  forecastState = "loading";
  renderForecast(null);

  try {
    const forecast = await fetchForecast(latitude, longitude, els.unitsSelect.value);
    if (ticket !== forecastRequestCounter) {
      return;
    }
    forecastState = "ready";
    latestForecast = forecast;
    renderForecast(latestForecast);
  } catch (error) {
    if (ticket !== forecastRequestCounter) {
      return;
    }
    forecastState = "error";
    selectedForecastDate = "";
    latestForecast = null;
    renderForecast(null);
  }
}

function isLikelyEnglish(text) {
  const value = (text || "").trim();
  if (!value) {
    return false;
  }
  return /^[a-z\s-]+$/i.test(value);
}

function localizeDescription(description, condition, language) {
  const conditionMap = CONDITION_LABELS[language];
  if (!conditionMap) {
    return description;
  }
  // OpenWeather can return English text for some locale codes.
  if (!isLikelyEnglish(description)) {
    return description;
  }
  return conditionMap[condition] || description;
}

function renderWeather(data) {
  latestWeatherData = data;
  const renderRequestId = weatherDescriptionRequestCounter + 1;
  weatherDescriptionRequestCounter = renderRequestId;
  const pack = currentPack();
  const selectedLanguage = els.languageSelect.value;
  const localizedDescription = localizeDescription(data.description, data.condition, selectedLanguage);
  els.conditionSymbol.textContent = data.symbol || "\uD83C\uDF24";
  els.temperatureText.textContent = `${data.temperature ?? "--"} ${data.temperatureUnit ?? ""}`.trim();
  els.descriptionText.textContent = localizedDescription || pack.weatherUnavailable;
  if (
    selectedLanguage !== "English" &&
    localizedDescription &&
    isLikelyEnglish(localizedDescription)
  ) {
    void translateText(localizedDescription, selectedLanguage).then((translated) => {
      if (renderRequestId !== weatherDescriptionRequestCounter) {
        return;
      }
      if (translated) {
        els.descriptionText.textContent = translated;
      }
    });
  }
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
  fetchAndRenderForecast(data.latitude, data.longitude);
  fetchAndRenderPlanner(data.latitude, data.longitude);
  renderInsights();
  setSaveCityButtonState();
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
  const coord = payload.coord || {};
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
    latitude: Number(coord.lat),
    longitude: Number(coord.lon),
  };
}

async function fetchFromOpenWeather(query, language, units, customKey) {
  const keys = getCandidateKeys(customKey);
  const pack = currentPack();
  const queryParams = typeof query === "string" ? { q: query } : query;

  if (!keys.length) {
    return { error: pack.allKeysFailed };
  }

  const languageCode = OPENWEATHER_LANGUAGE_FALLBACK[language] || LANGUAGE_CODES[language] || "en";
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
    await ensureLanguageResources(els.languageSelect.value);
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
  setLoading(true);
  const pack = currentPack();
  if (!navigator.geolocation) {
    setStatusText(pack.locationUnsupported, "error");
    setLoading(false);
    return;
  }

  setStatusText(pack.statusLocating, "neutral");

  try {
    const position = await getCurrentPosition({
      enableHighAccuracy: false,
      timeout: GEOLOCATION_TIMEOUT_MS,
      maximumAge: 900000,
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
  favoriteCitiesState = loadFavoriteCities();
  void applyLanguageUI();
  setWeatherMood("default");
  renderFavoriteCities();
  renderInsights();
  renderPlannerWindow(null);
  els.fetchBtn.addEventListener("click", fetchWeather);
  els.saveCityBtn?.addEventListener("click", () => {
    addFavoriteCity(currentCityCandidate());
  });
  els.languageSelect.addEventListener("change", () => {
    void applyLanguageUI();
  });
  els.cityInput.addEventListener("input", () => {
    setSaveCityButtonState();
  });
  els.cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      fetchWeather();
    }
  });
  els.cityInput.focus();
  setSaveCityButtonState();
  window.setTimeout(() => {
    void autoFetchWeatherForCurrentLocation();
  }, 0);
}

initialize();





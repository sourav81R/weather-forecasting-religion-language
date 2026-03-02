const OPENWEATHER_ENDPOINT = "https://api.openweathermap.org/data/2.5/weather";
const OPEN_METEO_FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const FORECAST_DAYS = 15;
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
    rainChance: "Rain chance",
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
    rainChance: "बारिश की संभावना",
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
    rainChance: "वर्षाको सम्भावना",
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
    rainChance: "മഴ സാധ്യത",
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
    rainChance: "వర్ష అవకాశం",
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
  forecastTitle: document.getElementById("forecastTitle"),
  forecastSubtitle: document.getElementById("forecastSubtitle"),
  forecastTrend: document.getElementById("forecastTrend"),
  forecastList: document.getElementById("forecastList"),
  forecastDisclaimer: document.getElementById("forecastDisclaimer"),
};

let freshAnimationTimer = null;
let latestForecast = null;
let forecastRequestCounter = 0;
let forecastState = "idle";

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

function currentLocale() {
  const language = els.languageSelect.value;
  return LANGUAGE_LOCALES[language] || "en-IN";
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

  renderQuickCities();
  renderForecast(latestForecast);
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
  forecastState = message ? "error" : "idle";
  latestForecast = null;
  renderForecast(null);
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
    return;
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
      return `
        <article class="forecast-card">
          <p class="forecast-day">${dayLabel}</p>
          <p class="forecast-condition">${symbol} ${conditionLabel}</p>
          <p class="forecast-temp">${Math.round(item.max)}${unitSymbol} / ${Math.round(item.min)}${unitSymbol}</p>
          <p class="forecast-rain">${text.rainChance}: ${Math.round(item.rainChance)}%</p>
        </article>
      `;
    })
    .join("");

  els.forecastList.innerHTML = cards;
  els.forecastTrend.textContent = formatTrendText(forecastData.items);
}

function normalizeForecast(payload) {
  const daily = payload.daily || {};
  const time = daily.time || [];
  const max = daily.temperature_2m_max || [];
  const min = daily.temperature_2m_min || [];
  const rain = daily.precipitation_probability_max || [];
  const codes = daily.weather_code || [];

  const items = [];
  const count = Math.min(time.length, max.length, min.length, rain.length, codes.length, FORECAST_DAYS);
  for (let idx = 0; idx < count; idx += 1) {
    items.push({
      date: time[idx],
      max: Number(max[idx]),
      min: Number(min[idx]),
      rainChance: Number(rain[idx] ?? 0),
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
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
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
  const pack = currentPack();
  const selectedLanguage = els.languageSelect.value;
  const localizedDescription = localizeDescription(data.description, data.condition, selectedLanguage);
  els.conditionSymbol.textContent = data.symbol || "\uD83C\uDF24";
  els.temperatureText.textContent = `${data.temperature ?? "--"} ${data.temperatureUnit ?? ""}`.trim();
  els.descriptionText.textContent = localizedDescription || pack.weatherUnavailable;
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





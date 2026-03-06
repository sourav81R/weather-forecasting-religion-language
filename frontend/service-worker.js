const CACHE_VERSION = "weather-studio-pwa-v34";
const UI_CACHE = `${CACHE_VERSION}-ui`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

const CORE_UI_ASSETS = [
  "/",
  "/frontend/index.html",
  "/manifest.json",
  "/css/app.css",
  "/css/app.css?v=20260306-24",
  "/static/css/app.css",
  "/static/css/app.css?v=20260306-8",
  "/js/app.js",
  "/js/app.js?v=20260306-25",
  "/static/js/app.js",
  "/static/js/app.js?v=20260306-11",
  "/js/weatherMap.js",
  "/js/offlineForecast.js",
  "/js/liveCamera.js",
  "/frontend/css/app.css?v=20260306-24",
  "/frontend/js/app.js?v=20260306-25",
  "/frontend/js/weatherMap.js",
  "/frontend/js/offlineForecast.js",
  "/frontend/js/liveCamera.js",
  "/components/moon-night.svg",
  "/components/icon-192.png",
  "/components/icon-512.png",
];

function canCacheResponse(response) {
  return Boolean(response) && (response.ok || response.type === "opaque");
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (canCacheResponse(response)) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      return (await caches.match("/")) || Response.error();
    }
    return Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (canCacheResponse(response)) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    if (request.mode === "navigate") {
      return (await caches.match("/")) || Response.error();
    }
    return Response.error();
  }
}

function isWeatherDataRequest(url) {
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) return true;
  if (url.hostname === "api.openweathermap.org") return true;
  if (url.hostname === "api.open-meteo.com") return true;
  if (url.hostname === "geocoding-api.open-meteo.com") return true;
  if (url.hostname === "archive-api.open-meteo.com") return true;
  if (url.hostname === "tile.openweathermap.org") return true;
  return false;
}

function isWeatherIconRequest(url) {
  return url.hostname === "openweathermap.org" && url.pathname.includes("/img/wn/");
}

function isUiAssetRequest(request, url) {
  if (request.mode === "navigate") return true;
  if (url.origin !== self.location.origin) return false;

  if (url.pathname.startsWith("/css/")) return true;
  if (url.pathname.startsWith("/js/")) return true;
  if (url.pathname.startsWith("/static/css/")) return true;
  if (url.pathname.startsWith("/static/js/")) return true;
  if (url.pathname.startsWith("/components/")) return true;
  if (url.pathname.startsWith("/static/components/")) return true;
  if (url.pathname.startsWith("/frontend/css/")) return true;
  if (url.pathname.startsWith("/frontend/js/")) return true;
  if (url.pathname.startsWith("/frontend/components/")) return true;
  if (url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/frontend/index.html") return true;
  if (url.pathname === "/manifest.json") return true;
  return false;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(UI_CACHE).then(async (cache) => {
      for (const asset of CORE_UI_ASSETS) {
        try {
          const response = await fetch(asset, { cache: "no-store" });
          if (canCacheResponse(response)) {
            await cache.put(asset, response.clone());
          }
        } catch {
          // Ignore optional path failures for backend/static mode compatibility.
        }
      }
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== UI_CACHE && key !== DATA_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (isWeatherDataRequest(url)) {
    event.respondWith(networkFirst(event.request, DATA_CACHE));
    return;
  }

  if (isWeatherIconRequest(url)) {
    event.respondWith(cacheFirst(event.request, UI_CACHE));
    return;
  }

  if (isUiAssetRequest(event.request, url)) {
    event.respondWith(cacheFirst(event.request, UI_CACHE));
    return;
  }

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

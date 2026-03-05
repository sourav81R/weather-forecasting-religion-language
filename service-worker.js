const CACHE_NAME = "weather-studio-pwa-v19";
const OFFLINE_ASSETS = [
  "/",
  "/frontend/index.html",
  "/css/app.css",
  "/css/app.css?v=20260306-5",
  "/js/app.js",
  "/js/app.js?v=20260306-5",
  "/static/css/app.css",
  "/static/css/app.css?v=20260306-5",
  "/static/js/app.js",
  "/static/js/app.js?v=20260306-5",
  "/components/moon-night.svg",
  "/manifest.json",
  "/components/icon-192.png",
  "/components/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of OFFLINE_ASSETS) {
        try {
          const response = await fetch(asset, { cache: "no-store" });
          if (response.ok) {
            await cache.put(asset, response.clone());
          }
        } catch {
          // Ignore missing paths for cross-mode compatibility.
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("/"));
    })
  );
});








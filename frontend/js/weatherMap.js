const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const OPENWEATHER_TILE_ENDPOINT = "https://tile.openweathermap.org/map";
const DEFAULT_CENTER = [20, 77];
const DEFAULT_ZOOM = 4;
const MAX_FORECAST_HOUR = 47;
const STORM_WIND_THRESHOLD_KMH = 50;
const STORM_RAIN_THRESHOLD = 70;
const GRID_CACHE_TTL_MS = 8 * 60 * 1000;
const REFRESH_DEBOUNCE_MS = 280;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function hasLeafletVelocity() {
  return typeof window !== "undefined" && typeof window.L !== "undefined" && typeof window.L.velocityLayer === "function";
}

function detectLowPowerDevice() {
  const reducedMotion = typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
  const cores = typeof navigator !== "undefined" ? Number(navigator.hardwareConcurrency || 4) : 4;
  return reducedMotion || cores <= 4;
}

function particleBudget() {
  if (typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return 70;
  }
  const cores = typeof navigator !== "undefined" ? Number(navigator.hardwareConcurrency || 4) : 4;
  if (cores <= 4) return 130;
  return 240;
}

function precipitationColor(rainProbability) {
  const value = finiteNumber(rainProbability, 0);
  if (value >= 80) return "#de4030";
  if (value >= 60) return "#f1c548";
  if (value >= 35) return "#3eb86a";
  return "#2f86e0";
}

function stormRisk(windSpeed, rainProbability) {
  const wind = finiteNumber(windSpeed, 0);
  const rain = finiteNumber(rainProbability, 0);
  if ((wind > 65 && rain > 80) || wind > 85 || rain > 92) return "high";
  if (wind > STORM_WIND_THRESHOLD_KMH && rain > STORM_RAIN_THRESHOLD) return "high";
  if (wind > 42 || rain > 58) return "medium";
  return "low";
}

function stormRiskLabel(risk) {
  if (risk === "high") return "High";
  if (risk === "medium") return "Moderate";
  return "Low";
}

function parseUtcTimeMs(value) {
  const text = String(value || "").trim();
  if (!text) return NaN;
  if (/[zZ]$/.test(text) || /[+-]\d{2}:\d{2}$/.test(text)) return Date.parse(text);
  return Date.parse(`${text}Z`);
}

function nearestIndexByHourOffset(times, hourOffset) {
  if (!Array.isArray(times) || !times.length) return 0;
  const now = new Date();
  now.setUTCMinutes(0, 0, 0);
  const targetMs = now.getTime() + clamp(Number(hourOffset || 0), 0, MAX_FORECAST_HOUR) * 60 * 60 * 1000;
  let bestIndex = 0;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (let index = 0; index < times.length; index += 1) {
    const timeMs = parseUtcTimeMs(times[index]);
    if (!Number.isFinite(timeMs)) continue;
    const delta = Math.abs(timeMs - targetMs);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = index;
    }
  }
  return bestIndex;
}

function normalizeLongitude(lon) {
  let value = finiteNumber(lon, 0);
  while (value > 180) value -= 360;
  while (value < -180) value += 360;
  return value;
}

function toWindVector(speedKmh, directionDeg) {
  const speedMs = finiteNumber(speedKmh, 0) / 3.6;
  const radians = (finiteNumber(directionDeg, 0) * Math.PI) / 180;
  return {
    u: -speedMs * Math.sin(radians),
    v: -speedMs * Math.cos(radians),
    speedMs,
  };
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === "\"") return "&quot;";
    return "&#39;";
  });
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return response.json();
}

async function workerPool(items, concurrency, worker) {
  const results = new Array(items.length);
  const total = items.length;
  if (!total) return results;
  const limit = clamp(concurrency, 1, total);
  let cursor = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (cursor < total) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

function vectorFieldFromSnapshot(snapshot) {
  const { rows, columns, points, bounds } = snapshot;
  const west = finiteNumber(bounds.west, -180);
  const east = finiteNumber(bounds.east, 180);
  const north = finiteNumber(bounds.north, 90);
  const south = finiteNumber(bounds.south, -90);
  const spanLon = Math.max(0.000001, east - west);
  const spanLat = Math.max(0.000001, north - south);

  function pointAt(row, column) {
    const index = row * columns + column;
    return points[index] || points[0];
  }

  function bilinear(u00, u10, u01, u11, tx, ty) {
    const top = u00 + (u10 - u00) * tx;
    const bottom = u01 + (u11 - u01) * tx;
    return top + (bottom - top) * ty;
  }

  return {
    sample(latitude, longitude) {
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
      const lon = normalizeLongitude(longitude);
      const x = ((lon - west) / spanLon) * (columns - 1);
      const y = ((north - latitude) / spanLat) * (rows - 1);
      if (x < 0 || y < 0 || x > columns - 1 || y > rows - 1) return null;

      const x0 = clamp(Math.floor(x), 0, columns - 1);
      const x1 = clamp(x0 + 1, 0, columns - 1);
      const y0 = clamp(Math.floor(y), 0, rows - 1);
      const y1 = clamp(y0 + 1, 0, rows - 1);
      const tx = x - x0;
      const ty = y - y0;

      const p00 = pointAt(y0, x0);
      const p10 = pointAt(y0, x1);
      const p01 = pointAt(y1, x0);
      const p11 = pointAt(y1, x1);

      const u = bilinear(p00.vector.u, p10.vector.u, p01.vector.u, p11.vector.u, tx, ty);
      const v = bilinear(p00.vector.v, p10.vector.v, p01.vector.v, p11.vector.v, tx, ty);
      return {
        u,
        v,
        speed: Math.sqrt(u * u + v * v),
      };
    },
  };
}

function velocityRecords(snapshot, hourOffset) {
  const { rows, columns, points, bounds } = snapshot;
  const uValues = [];
  const vValues = [];
  for (const point of points) {
    uValues.push(point.vector.u);
    vValues.push(point.vector.v);
  }
  const template = {
    nx: columns,
    ny: rows,
    lo1: bounds.west,
    la1: bounds.north,
    lo2: bounds.east,
    la2: bounds.south,
    dx: columns > 1 ? (bounds.east - bounds.west) / (columns - 1) : 0,
    dy: rows > 1 ? (bounds.north - bounds.south) / (rows - 1) : 0,
    refTime: new Date().toISOString(),
    forecastTime: clamp(Number(hourOffset || 0), 0, MAX_FORECAST_HOUR),
  };
  return [
    {
      header: {
        ...template,
        parameterCategory: 2,
        parameterNumber: 2,
        parameterUnit: "m/s",
      },
      data: uValues,
    },
    {
      header: {
        ...template,
        parameterCategory: 2,
        parameterNumber: 3,
        parameterUnit: "m/s",
      },
      data: vValues,
    },
  ];
}

class CanvasWindLayer {
  constructor(options = {}) {
    this.options = {
      particleCount: 200,
      velocityScale: 0.32,
      fadeFillStyle: "rgba(7, 21, 37, 0.08)",
      ...options,
    };
    this._map = null;
    this._canvas = null;
    this._ctx = null;
    this._particles = [];
    this._field = null;
    this._frameHandle = 0;
    this._visible = false;
    this._onMove = () => this._reset(true);
  }

  onAdd(map) {
    this._map = map;
    this._canvas = window.L.DomUtil.create("canvas", "wind-particle-canvas");
    this._canvas.style.position = "absolute";
    this._canvas.style.pointerEvents = "none";
    this._canvas.style.zIndex = "420";
    map.getPanes().overlayPane.appendChild(this._canvas);
    this._ctx = this._canvas.getContext("2d");
    this._reset(true);
    map.on("moveend zoomend resize", this._onMove);
    this._visible = true;
    this._animate();
  }

  onRemove(map) {
    this._visible = false;
    if (this._frameHandle) {
      cancelAnimationFrame(this._frameHandle);
      this._frameHandle = 0;
    }
    map.off("moveend zoomend resize", this._onMove);
    if (this._canvas && this._canvas.parentNode) this._canvas.parentNode.removeChild(this._canvas);
    this._canvas = null;
    this._ctx = null;
    this._particles = [];
    this._map = null;
  }

  setField(field) {
    this._field = field;
    if (!this._particles.length) this._seedParticles();
  }

  _reset(forceClear = false) {
    if (!this._map || !this._canvas) return;
    const size = this._map.getSize();
    this._canvas.width = Math.max(2, size.x);
    this._canvas.height = Math.max(2, size.y);
    this._canvas.style.width = `${size.x}px`;
    this._canvas.style.height = `${size.y}px`;
    if (forceClear && this._ctx) this._ctx.clearRect(0, 0, size.x, size.y);
    this._seedParticles();
  }

  _seedParticles() {
    if (!this._canvas) return;
    const width = this._canvas.width;
    const height = this._canvas.height;
    const count = clamp(Number(this.options.particleCount || 200), 40, 600);
    this._particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      age: Math.random() * 90,
      ttl: 60 + Math.random() * 90,
    }));
  }

  _animate() {
    if (!this._visible) return;
    this._frameHandle = requestAnimationFrame(() => {
      this._drawFrame();
      this._animate();
    });
  }

  _drawFrame() {
    if (!this._ctx || !this._map || !this._canvas || !this._field) return;
    const width = this._canvas.width;
    const height = this._canvas.height;
    this._ctx.fillStyle = this.options.fadeFillStyle;
    this._ctx.globalCompositeOperation = "destination-in";
    this._ctx.fillRect(0, 0, width, height);
    this._ctx.globalCompositeOperation = "source-over";
    this._ctx.lineWidth = 1.2;

    const scale = finiteNumber(this.options.velocityScale, 0.32);
    for (const particle of this._particles) {
      if (particle.age >= particle.ttl) {
        this._respawnParticle(particle, width, height);
        continue;
      }

      const latLng = this._map.containerPointToLatLng([particle.x, particle.y]);
      const sample = this._field.sample(latLng.lat, latLng.lng);
      if (!sample) {
        this._respawnParticle(particle, width, height);
        continue;
      }

      const nx = particle.x + sample.u * scale;
      const ny = particle.y - sample.v * scale;
      if (nx < 0 || ny < 0 || nx > width || ny > height) {
        this._respawnParticle(particle, width, height);
        continue;
      }

      this._ctx.beginPath();
      this._ctx.strokeStyle = this._speedColor(sample.speed);
      this._ctx.moveTo(particle.x, particle.y);
      this._ctx.lineTo(nx, ny);
      this._ctx.stroke();

      particle.x = nx;
      particle.y = ny;
      particle.age += 1;
    }
  }

  _respawnParticle(particle, width, height) {
    particle.x = Math.random() * width;
    particle.y = Math.random() * height;
    particle.age = 0;
    particle.ttl = 60 + Math.random() * 90;
  }

  _speedColor(speedMs) {
    const speed = finiteNumber(speedMs, 0);
    if (speed >= 24) return "rgba(244, 78, 57, 0.88)";
    if (speed >= 16) return "rgba(247, 183, 75, 0.84)";
    if (speed >= 9) return "rgba(115, 212, 135, 0.80)";
    return "rgba(84, 168, 255, 0.78)";
  }
}

class WeatherMapController {
  constructor(options = {}) {
    this.options = options;
    this.apiBase = String(options.apiBase || "");
    this.staticMode = Boolean(options.staticMode);
    this.getApiKey = typeof options.getApiKey === "function" ? options.getApiKey : () => "";
    this.builtinApiKeys = Array.isArray(options.builtinApiKeys) ? options.builtinApiKeys.filter(Boolean) : [];
    this.onStatus = typeof options.onStatus === "function" ? options.onStatus : () => {};
    this.onLocationSelected = typeof options.onLocationSelected === "function" ? options.onLocationSelected : null;
    this.getHyperlocalPrediction = typeof options.getHyperlocalPrediction === "function" ? options.getHyperlocalPrediction : null;
    this.containerId = options.containerId || "weatherMap";

    this.map = null;
    this.baseLayer = null;
    this.tileLayers = {};
    this.windFlowGroup = null;
    this.rainRadarLayer = null;
    this.stormLayer = null;
    this.layerControl = null;
    this.overlayRegistry = {};
    this.defaultOverlays = new Set(["Precipitation", "Cloud Coverage", "Rain Radar", "Wind Flow", "Storm Alerts"]);

    this.velocityLayer = null;
    this.canvasWindLayer = null;
    this.lowPowerMode = detectLowPowerDevice();
    this.initialized = false;
    this.focusMarker = null;
    this.focusedOnce = false;

    this.hourOffset = 0;
    this.playing = false;
    this.playbackFrame = 0;
    this.playbackLastMs = 0;
    this.refreshTimer = 0;
    this.refreshToken = 0;

    this.pointCache = new Map();
    this.snapshot = null;

    this.playBtn = document.getElementById(options.playButtonId || "mapPlayBtn");
    this.pauseBtn = document.getElementById(options.pauseButtonId || "mapPauseBtn");
    this.hourSlider = document.getElementById(options.hourSliderId || "mapTimeSlider");
    this.hourLabel = document.getElementById(options.hourLabelId || "mapHourLabel");
    this.stormIndicator = document.getElementById(options.stormIndicatorId || "mapStormIndicator");
    this.stormList = document.getElementById(options.stormListId || "mapStormList");
  }

  async init() {
    const container = document.getElementById(this.containerId);
    if (!container || typeof window.L === "undefined") return;
    if (this.initialized) {
      this.invalidateSize();
      return;
    }

    this.map = window.L.map(this.containerId, {
      zoomControl: true,
      worldCopyJump: true,
      preferCanvas: true,
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    this.baseLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
      keepBuffer: 6,
      crossOrigin: true,
    });
    this.baseLayer.addTo(this.map);

    this.windFlowGroup = window.L.layerGroup();
    this.rainRadarLayer = window.L.layerGroup();
    this.stormLayer = window.L.layerGroup();

    await this._reloadLayerControl();
    this._bindMapEvents();
    this._bindAnimationControls();
    this._renderHourLabel();

    this.initialized = true;
    this.scheduleRefresh(true);
  }

  invalidateSize() {
    if (!this.map) return;
    this.map.invalidateSize({ pan: false });
    this.scheduleRefresh(true);
  }

  async updateContext(next = {}) {
    let requiresTileReload = false;

    if (next.apiBase !== undefined) {
      const value = String(next.apiBase || "");
      if (value !== this.apiBase) {
        this.apiBase = value;
        requiresTileReload = true;
      }
    }

    if (next.staticMode !== undefined) {
      const value = Boolean(next.staticMode);
      if (value !== this.staticMode) {
        this.staticMode = value;
        requiresTileReload = true;
      }
    }

    if (next.forceTileReload) requiresTileReload = true;
    if (requiresTileReload && this.initialized) {
      await this._reloadLayerControl();
      this.scheduleRefresh(true);
    }
  }

  applyChatAction(actionPayload = {}) {
    if (!this.map || !actionPayload) return false;
    const actionType = typeof actionPayload === "string" ? actionPayload : String(actionPayload.type || "").trim();
    const location = typeof actionPayload === "object" ? actionPayload.location || null : null;
    if (!actionType) return false;

    if (location) {
      this._focusLocationFromChat(location);
    }

    if (actionType === "show_wind_layer") {
      this._setOverlayVisible("Wind Flow", true);
      this._setOverlayVisible("Wind Speed", true);
      this.scheduleRefresh(true);
      return true;
    }
    if (actionType === "show_rain_layer") {
      this._setOverlayVisible("Rain Radar", true);
      this._setOverlayVisible("Precipitation", true);
      this.scheduleRefresh(true);
      return true;
    }
    if (actionType === "show_cloud_layer") {
      this._setOverlayVisible("Cloud Coverage", true);
      this.scheduleRefresh(true);
      return true;
    }
    if (actionType === "show_temperature_layer") {
      this._setOverlayVisible("Temperature", true);
      this.scheduleRefresh(true);
      return true;
    }
    if (actionType === "highlight_storm") {
      this._setOverlayVisible("Storm Alerts", true);
      this._setOverlayVisible("Rain Radar", true);
      this.scheduleRefresh(true);
      return true;
    }
    return false;
  }

  setFocusLocation(location, options = {}) {
    if (!this.map || !location) return;
    const latitude = finiteNumber(location.latitude, NaN);
    const longitude = finiteNumber(location.longitude, NaN);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    const label = String(location.label || "Selected location");
    if (!this.focusMarker) {
      this.focusMarker = window.L.marker([latitude, longitude]).addTo(this.map);
    } else {
      this.focusMarker.setLatLng([latitude, longitude]);
    }
    this.focusMarker.bindPopup(label);

    const shouldPan = options.forcePan || !this.focusedOnce;
    if (shouldPan) {
      this.map.setView([latitude, longitude], Math.max(this.map.getZoom(), 5));
      this.focusedOnce = true;
    }
  }

  _focusLocationFromChat(location) {
    const latitude = finiteNumber(location.latitude, NaN);
    const longitude = finiteNumber(location.longitude, NaN);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    this.setFocusLocation(
      {
        latitude,
        longitude,
        label: String(location.label || location.city || "Chat-selected location"),
      },
      { forcePan: true }
    );
  }

  _setOverlayVisible(label, visible) {
    const layer = this.overlayRegistry[label];
    if (!layer || !this.map) return;
    const shouldShow = Boolean(visible);
    const isVisible = this.map.hasLayer(layer);
    if (shouldShow && !isVisible) layer.addTo(this.map);
    if (!shouldShow && isVisible) this.map.removeLayer(layer);
  }

  setHourOffset(value, options = {}) {
    const next = clamp(Number(value || 0), 0, MAX_FORECAST_HOUR);
    if (next === this.hourOffset && !options.force) return;
    this.hourOffset = next;
    this._renderHourLabel();
    if (this.hourSlider && Number(this.hourSlider.value) !== this.hourOffset) {
      this.hourSlider.value = String(this.hourOffset);
    }
    if (options.pausePlayback) this.pausePlayback();
    this.scheduleRefresh(true);
  }

  startPlayback() {
    if (this.playing) return;
    this.playing = true;
    this.playbackLastMs = 0;
    if (this.playBtn) this.playBtn.disabled = true;
    if (this.pauseBtn) this.pauseBtn.disabled = false;

    const loop = (timeMs) => {
      if (!this.playing) return;
      if (!this.playbackLastMs) this.playbackLastMs = timeMs;
      if (timeMs - this.playbackLastMs >= 1500) {
        this.playbackLastMs = timeMs;
        const nextHour = (this.hourOffset + 1) % (MAX_FORECAST_HOUR + 1);
        this.setHourOffset(nextHour);
      }
      this.playbackFrame = requestAnimationFrame(loop);
    };
    this.playbackFrame = requestAnimationFrame(loop);
  }

  pausePlayback() {
    if (!this.playing) return;
    this.playing = false;
    if (this.playbackFrame) {
      cancelAnimationFrame(this.playbackFrame);
      this.playbackFrame = 0;
    }
    if (this.playBtn) this.playBtn.disabled = false;
    if (this.pauseBtn) this.pauseBtn.disabled = true;
  }

  scheduleRefresh(immediate = false) {
    if (!this.map) return;
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    if (immediate) {
      void this.refreshDynamicLayers();
      return;
    }
    this.refreshTimer = window.setTimeout(() => {
      void this.refreshDynamicLayers();
    }, REFRESH_DEBOUNCE_MS);
  }

  async refreshDynamicLayers() {
    if (!this.map) return;
    const token = ++this.refreshToken;
    const snapshot = await this._fetchSnapshot().catch(() => null);
    if (!snapshot || token !== this.refreshToken) return;
    this.snapshot = snapshot;
    this._renderWindFlow(snapshot);
    this._renderRainRadar(snapshot);
    this._renderStormLayer(snapshot);
  }

  async inspectAt(latitude, longitude) {
    const lat = finiteNumber(latitude, NaN);
    const lon = finiteNumber(longitude, NaN);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    try {
      const point = await this._fetchPointData(lat, lon, this.hourOffset, { bypassCache: true });
      const popup = window.L.popup({ maxWidth: 360 })
        .setLatLng([lat, lon])
        .setContent(this._inspectorPopupHtml({ lat, lon, point, hyperlocal: null, loading: Boolean(this.getHyperlocalPrediction) }))
        .openOn(this.map);

      if (this.getHyperlocalPrediction) {
        try {
          const hyperlocal = await this.getHyperlocalPrediction({
            latitude: lat,
            longitude: lon,
            mapWeather: point,
          });
          popup.setContent(this._inspectorPopupHtml({ lat, lon, point, hyperlocal, loading: false }));
        } catch {
          popup.setContent(this._inspectorPopupHtml({ lat, lon, point, hyperlocal: null, loading: false }));
        }
      }

      if (this.onLocationSelected) {
        this.onLocationSelected({ latitude: lat, longitude: lon });
      }
    } catch (error) {
      this.onStatus(`Map inspector failed: ${error.message}`, "error");
    }
  }

  _inspectorPopupHtml({ lat, lon, point, hyperlocal, loading = false }) {
    const risk = stormRiskLabel(point.stormRisk);
    const weatherSection = [
      "<div class=\"map-inspector-popup\">",
      "<h4>Weather Inspector</h4>",
      `<p class=\"map-inspector-location\">${lat.toFixed(3)}, ${lon.toFixed(3)}</p>`,
      "<div class=\"map-inspector-grid\">",
      `<div><span>Temperature</span><strong>${point.temperature.toFixed(1)} C</strong></div>`,
      `<div><span>Humidity</span><strong>${Math.round(point.humidity)}%</strong></div>`,
      `<div><span>Wind Speed</span><strong>${point.windSpeed.toFixed(1)} km/h</strong></div>`,
      `<div><span>Wind Direction</span><strong>${Math.round(point.windDirection)} deg</strong></div>`,
      `<div><span>Rain Probability</span><strong>${Math.round(point.rainProbability)}%</strong></div>`,
      `<div><span>Cloud Coverage</span><strong>${Math.round(point.cloudCoverage)}%</strong></div>`,
      `<div><span>Storm Risk</span><strong>${escapeHtml(risk)}</strong></div>`,
      `<div><span>Forecast Time</span><strong>${escapeHtml(point.timeUtc)}</strong></div>`,
      "</div>",
    ].join("");

    if (loading) {
      return `${weatherSection}<p class="map-inspector-loading">Loading hyperlocal AI forecast...</p></div>`;
    }
    if (!hyperlocal) {
      return `${weatherSection}<p class="map-inspector-loading">Hyperlocal AI forecast unavailable.</p></div>`;
    }
    return `${weatherSection}${this._hyperlocalPopupHtml(hyperlocal)}</div>`;
  }

  _hyperlocalPopupHtml(hyperlocal) {
    const temp = finiteNumber(hyperlocal.temperaturePrediction, NaN);
    const rain = finiteNumber(hyperlocal.rainProbability, NaN);
    const storm = finiteNumber(hyperlocal.stormRisk, NaN);
    const confidence = finiteNumber(hyperlocal.confidenceScore, NaN);
    const sources = Array.isArray(hyperlocal.sourcesUsed) ? hyperlocal.sourcesUsed : [];
    const tempLabel = Number.isFinite(temp) ? `${temp.toFixed(1)} C` : "--";
    const rainLabel = Number.isFinite(rain) ? `${Math.round(rain * 100)}%` : "--";
    const stormLabel = Number.isFinite(storm) ? `${Math.round(storm * 100)}%` : "--";
    const confidenceLabel = Number.isFinite(confidence) ? `${Math.round(confidence * 100)}%` : "--";
    const sourceLabel = sources.length
      ? sources.map((item) => String(item).replaceAll("_", " ")).join(", ")
      : "--";

    return [
      "<div class=\"map-inspector-hyperlocal\">",
      "<h5>Hyperlocal AI Forecast</h5>",
      "<div class=\"map-inspector-grid\">",
      `<div><span>Predicted Temp</span><strong>${escapeHtml(tempLabel)}</strong></div>`,
      `<div><span>Rain Probability</span><strong>${escapeHtml(rainLabel)}</strong></div>`,
      `<div><span>Storm Risk</span><strong>${escapeHtml(stormLabel)}</strong></div>`,
      `<div><span>Confidence</span><strong>${escapeHtml(confidenceLabel)}</strong></div>`,
      "</div>",
      `<p class="map-inspector-sources"><strong>Sources:</strong> ${escapeHtml(sourceLabel)}</p>`,
      "</div>",
    ].join("");
  }

  _bindMapEvents() {
    this.map.on("moveend zoomend", () => this.scheduleRefresh());
    this.map.on("click", (event) => {
      void this.inspectAt(event.latlng.lat, event.latlng.lng);
    });
  }

  _bindAnimationControls() {
    if (this.hourSlider) {
      this.hourSlider.min = "0";
      this.hourSlider.max = String(MAX_FORECAST_HOUR);
      this.hourSlider.step = "1";
      this.hourSlider.value = String(this.hourOffset);
      this.hourSlider.addEventListener("input", () => {
        this.setHourOffset(Number(this.hourSlider.value), { pausePlayback: true });
      });
    }

    if (this.playBtn) {
      this.playBtn.addEventListener("click", () => this.startPlayback());
    }
    if (this.pauseBtn) {
      this.pauseBtn.addEventListener("click", () => this.pausePlayback());
      this.pauseBtn.disabled = true;
    }
  }

  _renderHourLabel() {
    if (!this.hourLabel) return;
    const target = new Date(Date.now() + this.hourOffset * 60 * 60 * 1000);
    const formatted = target.toLocaleString([], {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    this.hourLabel.textContent = `Forecast +${this.hourOffset}h (${formatted})`;
  }

  async _reloadLayerControl() {
    if (!this.map || !this.baseLayer) return;
    const activeLabels = new Set();
    for (const [label, layer] of Object.entries(this.overlayRegistry)) {
      if (layer && this.map.hasLayer(layer)) activeLabels.add(label);
    }

    for (const layer of Object.values(this.tileLayers)) {
      if (layer && this.map.hasLayer(layer)) this.map.removeLayer(layer);
    }
    this.tileLayers = {};

    const layerUrls = await this._resolveLayerUrls();
    if (layerUrls.temperature) this.tileLayers.temperature = this._createTileLayer(layerUrls.temperature, 0.5);
    if (layerUrls.rain) this.tileLayers.rain = this._createTileLayer(layerUrls.rain, 0.58);
    if (layerUrls.clouds) this.tileLayers.clouds = this._createTileLayer(layerUrls.clouds, 0.48);
    if (layerUrls.wind) this.tileLayers.wind = this._createTileLayer(layerUrls.wind, 0.45);

    this.overlayRegistry = {};
    if (this.tileLayers.temperature) this.overlayRegistry["Temperature"] = this.tileLayers.temperature;
    if (this.tileLayers.rain) this.overlayRegistry["Precipitation"] = this.tileLayers.rain;
    if (this.tileLayers.clouds) this.overlayRegistry["Cloud Coverage"] = this.tileLayers.clouds;
    if (this.tileLayers.wind) this.overlayRegistry["Wind Speed"] = this.tileLayers.wind;
    this.overlayRegistry["Wind Flow"] = this.windFlowGroup;
    this.overlayRegistry["Rain Radar"] = this.rainRadarLayer;
    this.overlayRegistry["Storm Alerts"] = this.stormLayer;

    if (this.layerControl) this.map.removeControl(this.layerControl);
    this.layerControl = window.L.control.layers(
      { OpenStreetMap: this.baseLayer },
      this.overlayRegistry,
      { collapsed: typeof window !== "undefined" ? window.innerWidth < 960 : false }
    );
    this.layerControl.addTo(this.map);

    for (const [label, layer] of Object.entries(this.overlayRegistry)) {
      const shouldEnable = activeLabels.has(label) || (!activeLabels.size && this.defaultOverlays.has(label));
      if (shouldEnable && layer && !this.map.hasLayer(layer)) layer.addTo(this.map);
    }
  }

  _createTileLayer(url, opacity) {
    return window.L.tileLayer(url, {
      opacity,
      maxZoom: 19,
      keepBuffer: 6,
      updateWhenIdle: true,
      crossOrigin: true,
    });
  }

  async _resolveLayerUrls() {
    const customKey = String(this.getApiKey() || "").trim();
    const fallbackKey = customKey || this.builtinApiKeys[0] || "";

    if (!this.staticMode) {
      const endpoint = `${this.apiBase || ""}/api/map/layers?apiKey=${encodeURIComponent(customKey)}`;
      try {
        const payload = await fetchJson(endpoint, {
          credentials: this.apiBase ? "include" : "same-origin",
        });
        if (payload && payload.layers && Object.keys(payload.layers).length) {
          return payload.layers;
        }
      } catch {
        // Fall back to direct URL generation.
      }
    }

    if (!fallbackKey) return {};
    return {
      temperature: `${OPENWEATHER_TILE_ENDPOINT}/temp_new/{z}/{x}/{y}.png?appid=${fallbackKey}`,
      rain: `${OPENWEATHER_TILE_ENDPOINT}/precipitation_new/{z}/{x}/{y}.png?appid=${fallbackKey}`,
      clouds: `${OPENWEATHER_TILE_ENDPOINT}/clouds_new/{z}/{x}/{y}.png?appid=${fallbackKey}`,
      wind: `${OPENWEATHER_TILE_ENDPOINT}/wind_new/{z}/{x}/{y}.png?appid=${fallbackKey}`,
    };
  }

  async _fetchSnapshot() {
    const bounds = this.map.getBounds();
    const west = bounds.getWest();
    const east = bounds.getEast();
    const north = bounds.getNorth();
    const south = bounds.getSouth();

    const size = this.map.getSize();
    let columns = this.lowPowerMode ? 5 : 7;
    let rows = this.lowPowerMode ? 4 : 5;
    if (size.x > 1300) columns += 1;
    if (size.y > 760) rows += 1;
    if (this.map.getZoom() <= 3) {
      columns = Math.min(columns, 6);
      rows = Math.min(rows, 4);
    }
    columns = clamp(columns, 4, 9);
    rows = clamp(rows, 3, 7);

    const pointsToFetch = [];
    for (let row = 0; row < rows; row += 1) {
      const yRatio = rows === 1 ? 0 : row / (rows - 1);
      const latitude = north - (north - south) * yRatio;
      for (let col = 0; col < columns; col += 1) {
        const xRatio = columns === 1 ? 0 : col / (columns - 1);
        const longitude = west + (east - west) * xRatio;
        pointsToFetch.push({ row, col, latitude, longitude: normalizeLongitude(longitude) });
      }
    }

    const concurrency = this.lowPowerMode ? 4 : 7;
    const sampled = await workerPool(pointsToFetch, concurrency, async (point) => {
      const weather = await this._fetchPointData(point.latitude, point.longitude, this.hourOffset);
      return { ...point, ...weather };
    });

    sampled.sort((a, b) => a.row - b.row || a.col - b.col);
    return {
      rows,
      columns,
      points: sampled.map((item) => ({
        ...item,
        vector: toWindVector(item.windSpeed, item.windDirection),
      })),
      bounds: {
        west: finiteNumber(west, -180),
        east: finiteNumber(east, 180),
        north: finiteNumber(north, 90),
        south: finiteNumber(south, -90),
      },
    };
  }

  async _fetchPointData(latitude, longitude, hourOffset, options = {}) {
    const lat = Number(finiteNumber(latitude, 0).toFixed(2));
    const lon = Number(normalizeLongitude(longitude).toFixed(2));
    const offset = clamp(Number(hourOffset || 0), 0, MAX_FORECAST_HOUR);
    const key = `${lat}:${lon}:${offset}`;

    if (!options.bypassCache) {
      const cached = this.pointCache.get(key);
      if (cached && Date.now() - cached.at < GRID_CACHE_TTL_MS) return cached.value;
    }

    let value = null;
    if (!this.staticMode) {
      try {
        value = await this._fetchPointFromBackend(lat, lon, offset);
      } catch {
        value = null;
      }
    }

    if (!value) {
      value = await this._fetchPointFromOpenMeteo(lat, lon, offset);
    }

    this.pointCache.set(key, { at: Date.now(), value });
    return value;
  }

  async _fetchPointFromBackend(latitude, longitude, hourOffset) {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      hourOffset: String(hourOffset),
    });
    const endpoint = `${this.apiBase || ""}/api/map/weather-data?${params.toString()}`;
    const payload = await fetchJson(endpoint, {
      credentials: this.apiBase ? "include" : "same-origin",
    });
    return {
      latitude: finiteNumber(payload.latitude, latitude),
      longitude: finiteNumber(payload.longitude, longitude),
      timeUtc: String(payload.timeUtc || ""),
      temperature: finiteNumber(payload.temperature, 0),
      humidity: finiteNumber(payload.humidity, 0),
      windSpeed: finiteNumber(payload.windSpeed, 0),
      windDirection: finiteNumber(payload.windDirection, 0),
      rainProbability: finiteNumber(payload.rainProbability, 0),
      cloudCoverage: finiteNumber(payload.cloudCoverage, 0),
      precipitation: finiteNumber(payload.precipitation, 0),
      stormRisk: stormRisk(
        finiteNumber(payload.windSpeed, 0),
        finiteNumber(payload.rainProbability, 0)
      ),
      isStorm: Boolean(payload.isStorm),
    };
  }

  async _fetchPointFromOpenMeteo(latitude, longitude, hourOffset) {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      hourly: "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation_probability,cloud_cover,precipitation",
      wind_speed_unit: "kmh",
      timezone: "UTC",
      forecast_days: "3",
    });
    const payload = await fetchJson(`${OPEN_METEO_ENDPOINT}?${params.toString()}`);
    const hourly = payload.hourly || {};
    const times = hourly.time || [];
    const index = nearestIndexByHourOffset(times, hourOffset);

    const temperature = finiteNumber((hourly.temperature_2m || [])[index], 0);
    const humidity = finiteNumber((hourly.relative_humidity_2m || [])[index], 0);
    const windSpeed = finiteNumber((hourly.wind_speed_10m || [])[index], 0);
    const windDirection = finiteNumber((hourly.wind_direction_10m || [])[index], 0);
    const rainProbability = finiteNumber((hourly.precipitation_probability || [])[index], 0);
    const cloudCoverage = finiteNumber((hourly.cloud_cover || [])[index], 0);
    const precipitation = finiteNumber((hourly.precipitation || [])[index], 0);
    return {
      latitude,
      longitude,
      timeUtc: String((times[index] || "").replace("T", " ").trim()),
      temperature,
      humidity,
      windSpeed,
      windDirection,
      rainProbability,
      cloudCoverage,
      precipitation,
      stormRisk: stormRisk(windSpeed, rainProbability),
      isStorm: windSpeed > STORM_WIND_THRESHOLD_KMH && rainProbability > STORM_RAIN_THRESHOLD,
    };
  }

  _renderWindFlow(snapshot) {
    if (!this.windFlowGroup) return;
    const data = velocityRecords(snapshot, this.hourOffset);

    if (this.velocityLayer) {
      this.windFlowGroup.removeLayer(this.velocityLayer);
      this.velocityLayer = null;
    }
    if (this.canvasWindLayer) {
      this.windFlowGroup.removeLayer(this.canvasWindLayer);
    }

    if (hasLeafletVelocity()) {
      this.velocityLayer = window.L.velocityLayer({
        data,
        displayValues: false,
        velocityScale: this.lowPowerMode ? 0.004 : 0.006,
        particleAge: this.lowPowerMode ? 40 : 60,
        particleMultiplier: this.lowPowerMode ? 0.003 : 0.006,
        maxVelocity: 32,
        colorScale: ["#4ca2ff", "#75d2a3", "#f3c14e", "#f47f45", "#e34b3d"],
      });
      this.windFlowGroup.addLayer(this.velocityLayer);
      return;
    }

    if (!this.canvasWindLayer) {
      const BaseLayer = window.L.Layer.extend({
        initialize: function initialize(options = {}) {
          this._engine = new CanvasWindLayer(options);
        },
        onAdd: function onAdd(map) {
          this._engine.onAdd(map);
        },
        onRemove: function onRemove(map) {
          this._engine.onRemove(map);
        },
        setField: function setField(field) {
          this._engine.setField(field);
        },
      });
      this.canvasWindLayer = new BaseLayer({
        particleCount: this.lowPowerMode ? Math.max(60, Math.floor(particleBudget() * 0.65)) : particleBudget(),
      });
    }
    this.canvasWindLayer.setField(vectorFieldFromSnapshot(snapshot));
    this.windFlowGroup.addLayer(this.canvasWindLayer);
  }

  _renderRainRadar(snapshot) {
    if (!this.rainRadarLayer) return;
    this.rainRadarLayer.clearLayers();
    for (const point of snapshot.points) {
      const rainProbability = finiteNumber(point.rainProbability, 0);
      const precipitation = finiteNumber(point.precipitation, 0);
      if (rainProbability < 8 && precipitation <= 0) continue;
      const radius = 4 + Math.min(16, (rainProbability / 100) * 16);
      const color = precipitationColor(rainProbability);
      const marker = window.L.circleMarker([point.latitude, point.longitude], {
        radius,
        color,
        weight: 1,
        fillColor: color,
        fillOpacity: 0.24 + Math.min(0.45, rainProbability / 200),
      });
      marker.bindTooltip(
        `Rain ${Math.round(rainProbability)}% | ${precipitation.toFixed(1)} mm`,
        { direction: "top", sticky: true }
      );
      this.rainRadarLayer.addLayer(marker);
    }
  }

  _renderStormLayer(snapshot) {
    if (!this.stormLayer) return;
    this.stormLayer.clearLayers();
    const storms = [];

    for (const point of snapshot.points) {
      const isStormCell = point.windSpeed > STORM_WIND_THRESHOLD_KMH && point.rainProbability > STORM_RAIN_THRESHOLD;
      if (!isStormCell) continue;
      storms.push(point);

      const icon = window.L.divIcon({
        className: "weather-storm-marker",
        html: "<span>&#9928;</span>",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const marker = window.L.marker([point.latitude, point.longitude], { icon });
      marker.bindPopup(
        `Storm cell<br>Wind: ${point.windSpeed.toFixed(1)} km/h<br>Rain: ${Math.round(point.rainProbability)}%`
      );
      this.stormLayer.addLayer(marker);
      this.stormLayer.addLayer(
        window.L.circle([point.latitude, point.longitude], {
          radius: 38000,
          color: "#e34b3d",
          weight: 1.2,
          fillColor: "#e34b3d",
          fillOpacity: 0.12,
        })
      );
    }

    this._renderStormSummary(storms);
  }

  _renderStormSummary(storms) {
    if (this.stormIndicator) {
      if (!storms.length) {
        this.stormIndicator.textContent = `No active storm cells detected for +${this.hourOffset}h.`;
      } else {
        const maxWind = Math.max(...storms.map((item) => finiteNumber(item.windSpeed, 0)));
        const maxRain = Math.max(...storms.map((item) => finiteNumber(item.rainProbability, 0)));
        this.stormIndicator.textContent = `${storms.length} storm cells detected. Peak wind ${maxWind.toFixed(
          1
        )} km/h, rain ${Math.round(maxRain)}%.`;
      }
    }

    if (this.stormList) {
      if (!storms.length) {
        this.stormList.innerHTML = "<div class=\"storm-list-item\">No storm alerts in the sampled region.</div>";
        return;
      }

      const items = storms
        .slice(0, 8)
        .map((storm) => {
          const risk = stormRiskLabel(storm.stormRisk);
          return [
            "<div class=\"storm-list-item\">",
            `<strong>${storm.latitude.toFixed(2)}, ${storm.longitude.toFixed(2)}</strong>`,
            `<span>Wind ${storm.windSpeed.toFixed(1)} km/h</span>`,
            `<span>Rain ${Math.round(storm.rainProbability)}%</span>`,
            `<span>Risk ${escapeHtml(risk)}</span>`,
            "</div>",
          ].join("");
        });
      this.stormList.innerHTML = items.join("");
    }
  }
}

export function createWeatherMapController(options = {}) {
  return new WeatherMapController(options);
}

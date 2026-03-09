const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const WMO_ICONS = {
  0: "\u2600",
  1: "\uD83C\uDF24",
  2: "\u26C5",
  3: "\u2601",
  45: "\uD83C\uDF2B",
  48: "\uD83C\uDF2B",
  51: "\uD83C\uDF26",
  53: "\uD83C\uDF26",
  55: "\uD83C\uDF26",
  56: "\uD83C\uDF26",
  57: "\uD83C\uDF26",
  61: "\uD83C\uDF27",
  63: "\uD83C\uDF27",
  65: "\uD83C\uDF27",
  66: "\uD83C\uDF27",
  67: "\uD83C\uDF27",
  71: "\uD83C\uDF28",
  73: "\uD83C\uDF28",
  75: "\uD83C\uDF28",
  77: "\uD83C\uDF28",
  80: "\uD83C\uDF27",
  81: "\uD83C\uDF27",
  82: "\uD83C\uDF27",
  85: "\uD83C\uDF28",
  86: "\uD83C\uDF28",
  95: "\u26C8",
  96: "\u26C8",
  99: "\u26C8",
};

const WMO_LABELS = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Heavy showers",
  82: "Storm showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Severe storm",
};

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatHourLabel(value) {
  const match = String(value || "").match(/T(\d{2}):/);
  if (!match) return "--";
  const hour = Number(match[1]);
  if (!Number.isFinite(hour)) return "--";
  const suffix = hour >= 12 ? "PM" : "AM";
  const twelveHour = hour % 12 || 12;
  return `${twelveHour}${suffix}`;
}

function formatZonedNow(timeZone) {
  try {
    const formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: timeZone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date())
        .filter((item) => item.type !== "literal")
        .map((item) => [item.type, item.value])
    );
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  } catch {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }
}

function toDisplayHour(item, units) {
  const temperatureC = safeNumber(item.temperature);
  const windKmh = safeNumber(item.wind_speed);
  const rainProbability = safeNumber(item.rain_probability);
  const weatherCode = Number(item.weather_code || 0);

  const temperatureValue =
    temperatureC === null ? null : units === "imperial" ? temperatureC * (9 / 5) + 32 : temperatureC;
  const windValue = windKmh === null ? null : units === "imperial" ? windKmh / 1.60934 : windKmh;

  return {
    time: String(item.time || ""),
    hour: formatHourLabel(item.time),
    temperatureLabel: temperatureValue === null ? "--" : `${Math.round(temperatureValue)}${units === "imperial" ? "\u00B0F" : "\u00B0C"}`,
    temperatureValue,
    rainProbability: rainProbability === null ? 0 : Math.max(0, Math.min(100, Math.round(rainProbability))),
    windLabel: windValue === null ? "--" : `${Math.round(windValue)} ${units === "imperial" ? "mph" : "km/h"}`,
    weatherCode,
    conditionLabel: WMO_LABELS[weatherCode] || "Forecast",
    icon: WMO_ICONS[weatherCode] || "\uD83C\uDF24",
  };
}

function normalizeDirectResponse(payload) {
  const timezone = String(payload?.timezone || "UTC");
  const nowText = formatZonedNow(timezone);
  const hourly = payload?.hourly || {};
  const times = hourly.time || [];
  const temperatures = hourly.temperature_2m || [];
  const rainProbabilities = hourly.precipitation_probability || [];
  const windSpeeds = hourly.wind_speed_10m || hourly.windspeed_10m || [];
  const weatherCodes = hourly.weather_code || hourly.weathercode || [];

  const count = Math.min(times.length, temperatures.length, rainProbabilities.length, windSpeeds.length, weatherCodes.length);
  const hours = [];
  for (let index = 0; index < count; index += 1) {
    if (String(times[index]) <= nowText) continue;
    hours.push({
      time: String(times[index]),
      hour: String(times[index]).slice(11, 13),
      temperature: Number(temperatures[index]),
      rain_probability: Number(rainProbabilities[index] || 0),
      wind_speed: Number(windSpeeds[index] || 0),
      weather_code: Number(weatherCodes[index] || 0),
    });
    if (hours.length >= 24) break;
  }
  return { hours };
}

async function fetchDirectHourlyForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: "temperature_2m,precipitation_probability,wind_speed_10m,weather_code",
    forecast_days: "2",
    timezone: "auto",
  });
  const response = await fetch(`${OPEN_METEO_FORECAST_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Hourly forecast API error (${response.status})`);
  }
  const payload = await response.json();
  return normalizeDirectResponse(payload);
}

export function createHourlyForecastController(options = {}) {
  const statusNode = document.getElementById(options.statusId || "hourlyForecastStatus");
  const timelineNode = document.getElementById(options.timelineId || "hourlyForecastTimeline");
  const chartNode = document.getElementById(options.chartId || "hourlyForecastChart");
  const metaNode = document.getElementById(options.metaId || "hourlyForecastMeta");
  let chart = null;
  let requestId = 0;

  function destroyChart() {
    if (chart) {
      chart.destroy();
      chart = null;
    }
  }

  function setStatus(text, tone = "") {
    if (!statusNode) return;
    statusNode.textContent = String(text || "");
    statusNode.style.color = tone === "error" ? "#d13a4d" : tone === "success" ? "#179d84" : "";
  }

  function setMeta(text) {
    if (!metaNode) return;
    metaNode.textContent = String(text || "Peak rain chance: --");
  }

  function renderEmpty(text) {
    if (timelineNode) {
      timelineNode.innerHTML = `<div class="hourly-forecast-empty">${String(text || "Hourly forecast unavailable.")}</div>`;
    }
    destroyChart();
    setMeta("Peak rain chance: --");
  }

  function renderChart(hours) {
    if (!chartNode || typeof Chart === "undefined") return;
    destroyChart();
    chart = new Chart(chartNode.getContext("2d"), {
      type: "line",
      data: {
        labels: hours.map((item) => item.hour),
        datasets: [
          {
            data: hours.map((item) => item.temperatureValue),
            borderColor: "#1170ff",
            backgroundColor: "rgba(17, 112, 255, 0.16)",
            fill: true,
            tension: 0.32,
            pointRadius: 2,
            spanGaps: true,
          },
        ],
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { maxTicksLimit: 8 } },
          y: { ticks: { maxTicksLimit: 5 } },
        },
      },
    });
  }

  function render(hours, units) {
    const displayHours = (hours || []).map((item) => toDisplayHour(item, units));
    if (!displayHours.length) {
      renderEmpty("Hourly forecast unavailable.");
      setStatus("Hourly forecast unavailable.", "error");
      return;
    }

    if (timelineNode) {
      timelineNode.innerHTML = displayHours
        .map((item, index) => {
          const rainWidth = Math.max(0, Math.min(100, item.rainProbability));
          const cardClasses = [
            "hourly-forecast-item",
            index === 0 ? "is-current" : "",
            item.rainProbability >= 40 ? "is-wet" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return `<article class="${cardClasses}">
            <div class="hourly-forecast-top">
              <p class="hourly-forecast-time">${item.hour}</p>
              <div class="hourly-forecast-tags">
                ${index === 0 ? '<span class="hourly-forecast-tag is-now">Now</span>' : ""}
                <span class="hourly-forecast-tag">WMO ${item.weatherCode}</span>
              </div>
            </div>
            <div class="hourly-forecast-hero">
              <div class="hourly-forecast-icon-wrap">
                <div class="hourly-forecast-icon" aria-hidden="true">${item.icon}</div>
              </div>
              <div class="hourly-forecast-reading">
                <p class="hourly-forecast-temp">${item.temperatureLabel}</p>
                <p class="hourly-forecast-condition">${item.conditionLabel}</p>
              </div>
            </div>
            <div class="hourly-rain-bar" aria-hidden="true"><span style="width:${rainWidth}%"></span></div>
            <div class="hourly-forecast-rain"><span>Rain chance</span><strong>${item.rainProbability}%</strong></div>
            <div class="hourly-forecast-wind"><span>Wind speed</span><strong>${item.windLabel}</strong></div>
          </article>`;
        })
        .join("");
    }

    const peakRainChance = Math.max(...displayHours.map((item) => item.rainProbability));
    setMeta(`Peak rain chance: ${peakRainChance}%`);
    setStatus("Next 24 future hours", "success");
    renderChart(displayHours);
  }

  async function load(context = {}) {
    const latitude = safeNumber(context.latitude);
    const longitude = safeNumber(context.longitude);
    const units = context.units === "imperial" ? "imperial" : "metric";
    const apiBase = String(context.apiBase || "");
    const currentRequestId = ++requestId;

    if (latitude === null || longitude === null) {
      renderEmpty("Load weather to view the next 24 hours.");
      setStatus("Load weather to view the next 24 hours.");
      return;
    }

    setStatus("Loading hourly forecast...");
    try {
      let payload;
      try {
        const response = await fetch(`${apiBase}/api/hourly-forecast`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: apiBase ? "include" : "same-origin",
          body: JSON.stringify({ lat: latitude, lon: longitude }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body.error || `Request failed (${response.status})`);
        }
        payload = body;
      } catch {
        payload = await fetchDirectHourlyForecast(latitude, longitude);
      }

      if (currentRequestId !== requestId) return;
      render(payload.hours || [], units);
    } catch (error) {
      if (currentRequestId !== requestId) return;
      renderEmpty("Hourly forecast unavailable.");
      setStatus(`Hourly forecast unavailable: ${error.message}`, "error");
    }
  }

  return {
    clear(message = "Load weather to view the next 24 hours.") {
      requestId += 1;
      renderEmpty(message);
      setStatus(message);
    },
    load,
  };
}

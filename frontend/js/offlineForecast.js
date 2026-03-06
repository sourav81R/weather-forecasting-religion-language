const MODEL_NAME = "moving-average-linear-regression-v1";

function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function average(values, fallback = 0) {
  const clean = values.map(toFiniteNumber).filter((value) => value !== null);
  if (!clean.length) return fallback;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function pickRecent(values, count) {
  return values.slice(Math.max(0, values.length - count));
}

/**
 * Simple linear regression slope for [0..n-1] -> y.
 * Used for lightweight on-device trend detection.
 */
function linearRegressionSlope(values) {
  const clean = values.map(toFiniteNumber).filter((value) => value !== null);
  const n = clean.length;
  if (n < 2) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i += 1) {
    const x = i;
    const y = clean[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (!denominator) return 0;
  return (n * sumXY - sumX * sumY) / denominator;
}

function directionalTrend(slope, epsilon, positiveWord = "increasing", negativeWord = "decreasing") {
  if (slope > epsilon) return positiveWord;
  if (slope < -epsilon) return negativeWord;
  return "stable";
}

function normalizeRecord(record) {
  return {
    timestamp: Number(record?.timestamp || 0),
    location: String(record?.location || "").trim(),
    temperature: toFiniteNumber(record?.temperature),
    humidity: toFiniteNumber(record?.humidity),
    wind: toFiniteNumber(record?.wind),
    rain_probability: toFiniteNumber(record?.rain_probability),
  };
}

/**
 * Default offline model.
 * Strategy:
 * - temperature prediction: moving average of last 6 points
 * - rain prediction: moving average of recent rain probability points
 * - wind prediction: latest wind adjusted by linear-regression slope
 */
export class MovingAverageTrendModel {
  constructor(options = {}) {
    this.temperatureWindow = Math.max(1, Number(options.temperatureWindow || 6));
    this.rainWindow = Math.max(1, Number(options.rainWindow || 6));
    this.windWindow = Math.max(2, Number(options.windWindow || 6));
    this.temperatureTrendEpsilon = Number(options.temperatureTrendEpsilon || 0.08);
    this.humidityTrendEpsilon = Number(options.humidityTrendEpsilon || 0.2);
    this.rainTrendEpsilon = Number(options.rainTrendEpsilon || 0.35);
    this.windTrendEpsilon = Number(options.windTrendEpsilon || 0.15);
  }

  predict(records) {
    const sorted = [...(records || [])]
      .map(normalizeRecord)
      .filter((record) => Number.isFinite(record.timestamp) && record.timestamp > 0)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (!sorted.length) {
      throw new Error("No cached weather history available.");
    }

    const temperatures = sorted.map((item) => item.temperature).filter((value) => value !== null);
    const humidities = sorted.map((item) => item.humidity).filter((value) => value !== null);
    const winds = sorted.map((item) => item.wind).filter((value) => value !== null);
    const rainProbabilities = sorted.map((item) => item.rain_probability).filter((value) => value !== null);

    const recentTemperatures = pickRecent(temperatures, this.temperatureWindow);
    const recentRainProbabilities = pickRecent(rainProbabilities, this.rainWindow);
    const recentWinds = pickRecent(winds, this.windWindow);

    const temperaturePrediction = average(recentTemperatures, average(temperatures, 0));
    const rainPrediction = average(recentRainProbabilities, average(rainProbabilities, 0));

    const windSlope = linearRegressionSlope(recentWinds);
    const latestWind = recentWinds.length ? recentWinds[recentWinds.length - 1] : average(winds, 0);
    const windPrediction = Math.max(0, latestWind + windSlope);

    const temperatureSlope = linearRegressionSlope(pickRecent(temperatures, Math.max(temperatures.length, 6)));
    const humiditySlope = linearRegressionSlope(pickRecent(humidities, Math.max(humidities.length, 6)));
    const rainSlope = linearRegressionSlope(pickRecent(rainProbabilities, Math.max(rainProbabilities.length, 6)));

    return {
      model: MODEL_NAME,
      generatedAt: Date.now(),
      location: sorted[sorted.length - 1].location || "Unknown",
      sampleCount: sorted.length,
      predictions: {
        temperature: Number(temperaturePrediction.toFixed(1)),
        rainProbability: Number(Math.max(0, Math.min(100, rainPrediction)).toFixed(1)),
        wind: Number(windPrediction.toFixed(1)),
      },
      trends: {
        temperature: directionalTrend(temperatureSlope, this.temperatureTrendEpsilon, "increasing", "decreasing"),
        humidity: directionalTrend(humiditySlope, this.humidityTrendEpsilon, "rising", "falling"),
        rainProbability: directionalTrend(rainSlope, this.rainTrendEpsilon, "rising", "falling"),
        wind: directionalTrend(windSlope, this.windTrendEpsilon, "rising", "falling"),
      },
      slopes: {
        temperature: Number(temperatureSlope.toFixed(4)),
        humidity: Number(humiditySlope.toFixed(4)),
        rainProbability: Number(rainSlope.toFixed(4)),
        wind: Number(windSlope.toFixed(4)),
      },
    };
  }
}

/**
 * Edge forecast engine running fully in-browser.
 * Model is replaceable (for a future TensorFlow.js model) by calling `setModel`.
 */
export class OfflineForecastEngine {
  constructor(options = {}) {
    this.model = options.model || new MovingAverageTrendModel(options.modelOptions || {});
  }

  setModel(model) {
    if (!model || typeof model.predict !== "function") {
      throw new Error("Offline forecast model must expose predict(records).");
    }
    this.model = model;
  }

  generate(records) {
    return this.model.predict(records || []);
  }
}

export function createOfflineForecastEngine(options = {}) {
  return new OfflineForecastEngine(options);
}

export { MODEL_NAME, average, linearRegressionSlope };

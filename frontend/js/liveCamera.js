function blobFromCanvas(canvas, type = "image/jpeg", quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to convert captured frame to image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

function frameSignatureFromContext(ctx, width, height) {
  const sampleSize = 16;
  const imageData = ctx.getImageData(0, 0, width, height).data;
  const stepX = Math.max(1, Math.floor(width / sampleSize));
  const stepY = Math.max(1, Math.floor(height / sampleSize));

  let hash = 2166136261;
  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      const idx = (y * width + x) * 4;
      const r = imageData[idx];
      const g = imageData[idx + 1];
      const b = imageData[idx + 2];
      const brightness = Math.round((r + g + b) / 3);
      hash ^= brightness;
      hash = Math.imul(hash, 16777619);
    }
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function isSupported() {
  return Boolean(navigator?.mediaDevices?.getUserMedia);
}

function isSecureCameraContext() {
  if (typeof window === "undefined") return true;
  if (window.isSecureContext) return true;
  const hostname = String(window.location?.hostname || "").toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function createCameraError(message, cause = null) {
  const error = new Error(String(message || "Unable to access camera."));
  if (cause) error.cause = cause;
  return error;
}

function normalizeCameraError(error) {
  const name = String(error?.name || "");
  const message = String(error?.message || "");
  const lowered = message.toLowerCase();

  const permissionDenied =
    name === "NotAllowedError" ||
    name === "SecurityError" ||
    lowered.includes("permission denied") ||
    lowered.includes("permission") ||
    lowered.includes("denied");
  if (permissionDenied) {
    if (!isSecureCameraContext()) {
      return createCameraError("Camera requires HTTPS on mobile. Open this app using https:// and allow permission.", error);
    }
    return createCameraError("Camera permission denied. Allow camera access in browser site settings and retry.", error);
  }

  if (name === "NotFoundError" || lowered.includes("notfound") || lowered.includes("device not found")) {
    return createCameraError("No camera device was found on this phone.", error);
  }

  if (name === "NotReadableError" || lowered.includes("track start") || lowered.includes("in use")) {
    return createCameraError("Camera is in use by another app. Close other camera apps and retry.", error);
  }

  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
    return createCameraError("Requested camera mode is unavailable on this device.", error);
  }

  return createCameraError(message || "Unable to access camera.", error);
}

async function queryCameraPermissionState() {
  if (!navigator?.permissions?.query) return "unknown";
  try {
    const status = await navigator.permissions.query({ name: "camera" });
    return String(status?.state || "unknown");
  } catch {
    return "unknown";
  }
}

async function optimizeVideoTrack(track) {
  if (!track || typeof track.applyConstraints !== "function") return;
  try {
    await track.applyConstraints({
      facingMode: { ideal: "environment" },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    });
  } catch {
    // Ignore optional optimization failures and keep the acquired stream.
  }
}

export class LiveCameraController {
  constructor(options = {}) {
    this.videoElement = options.videoElement || null;
    this.canvasElement = options.canvasElement || null;
    this.stream = null;
  }

  static isSupported() {
    return isSupported();
  }

  isActive() {
    return Boolean(this.stream && this.stream.getTracks().some((track) => track.readyState === "live"));
  }

  async start() {
    if (!isSupported()) {
      throw new Error("Live camera is not supported in this browser.");
    }
    if (!this.videoElement) {
      throw new Error("Camera preview element is missing.");
    }

    this.stop();

    const permissionState = await queryCameraPermissionState();
    if (permissionState === "denied") {
      throw normalizeCameraError({ name: "NotAllowedError", message: "Camera permission denied." });
    }

    const constraintsCandidates = [
      { video: true, audio: false },
      {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      },
      {
        video: {
          facingMode: "environment",
        },
        audio: false,
      },
    ];

    let stream = null;
    let lastError = null;
    for (const constraints of constraintsCandidates) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (error) {
        lastError = error;
        const name = String(error?.name || "");
        if (name === "NotAllowedError" || name === "SecurityError") {
          break;
        }
      }
    }
    if (!stream) {
      throw normalizeCameraError(lastError);
    }

    this.stream = stream;
    const [videoTrack] = stream.getVideoTracks();
    await optimizeVideoTrack(videoTrack);
    this.videoElement.srcObject = stream;
    this.videoElement.autoplay = true;
    this.videoElement.setAttribute("playsinline", "true");
    this.videoElement.setAttribute("webkit-playsinline", "true");
    this.videoElement.muted = true;
    this.videoElement.setAttribute("muted", "true");
    try {
      await this.videoElement.play();
    } catch (error) {
      this.stop();
      throw normalizeCameraError(error);
    }
    return {
      width: Number(this.videoElement.videoWidth || 0),
      height: Number(this.videoElement.videoHeight || 0),
    };
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
    }
  }

  async captureFrame(options = {}) {
    if (!this.videoElement || !this.canvasElement) {
      throw new Error("Camera capture elements are not configured.");
    }
    if (!this.isActive()) {
      throw new Error("Camera is not active.");
    }

    const width = Number(this.videoElement.videoWidth || 0);
    const height = Number(this.videoElement.videoHeight || 0);
    if (!width || !height) {
      throw new Error("Camera frame is not ready yet.");
    }

    this.canvasElement.width = width;
    this.canvasElement.height = height;
    const ctx = this.canvasElement.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      throw new Error("Unable to create capture canvas context.");
    }
    ctx.drawImage(this.videoElement, 0, 0, width, height);
    const signature = frameSignatureFromContext(ctx, width, height);
    const blob = await blobFromCanvas(
      this.canvasElement,
      options.type || "image/jpeg",
      Number.isFinite(Number(options.quality)) ? Number(options.quality) : 0.92,
    );
    return { blob, signature, width, height };
  }
}

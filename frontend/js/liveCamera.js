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

    const constraintsCandidates = [
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
      { video: true, audio: false },
    ];

    let stream = null;
    let lastError = null;
    for (const constraints of constraintsCandidates) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!stream) {
      throw new Error(lastError?.message || "Unable to access camera.");
    }

    this.stream = stream;
    this.videoElement.srcObject = stream;
    this.videoElement.setAttribute("playsinline", "true");
    this.videoElement.muted = true;
    await this.videoElement.play();
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

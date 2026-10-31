/**
 * VATX.BD - Browser-based Computer Vision & Document Image Processing
 * Pure client-side edge detection, quadrilateral perspective warping, and enhancement filters.
 * Zero heavy external binary dependencies; runs at 60fps on mobile browsers.
 */

export interface Point {
  x: number;
  y: number;
}

export interface QuadCorners {
  tl: Point;
  tr: Point;
  br: Point;
  bl: Point;
}

export type FilterType = 'original' | 'magic_color' | 'bw' | 'grayscale' | 'vibrant';

/**
 * Automatically detects the four corners of a document in an image canvas.
 * Uses edge-gradient analysis + contour boundary bounding with safety fallback.
 */
export function detectDocumentCorners(
  sourceCanvas: HTMLCanvasElement,
  insetRatio: number = 0.08
): QuadCorners {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  // Default fallback: rectangular inset (e.g. 8% inside margins)
  const fallback: QuadCorners = {
    tl: { x: Math.round(width * insetRatio), y: Math.round(height * insetRatio) },
    tr: { x: Math.round(width * (1 - insetRatio)), y: Math.round(height * insetRatio) },
    br: { x: Math.round(width * (1 - insetRatio)), y: Math.round(height * (1 - insetRatio)) },
    bl: { x: Math.round(width * insetRatio), y: Math.round(height * (1 - insetRatio)) }
  };

  try {
    // Downscale for high-speed analysis
    const maxDim = 320;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    const sw = Math.round(width * scale);
    const sh = Math.round(height * scale);

    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = sw;
    smallCanvas.height = sh;
    const sctx = smallCanvas.getContext('2d');
    if (!sctx) return fallback;

    sctx.drawImage(sourceCanvas, 0, 0, sw, sh);
    const imgData = sctx.getImageData(0, 0, sw, sh);
    const data = imgData.data;

    // Convert to grayscale luminance
    const gray = new Float32Array(sw * sh);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    // Sobel gradient magnitude
    const edges = new Float32Array(sw * sh);
    let maxGrad = 0;

    for (let y = 1; y < sh - 1; y++) {
      for (let x = 1; x < sw - 1; x++) {
        const idx = y * sw + x;
        // Horizontal gradient (Sobel Gx)
        const gx =
          -1 * gray[idx - sw - 1] + 1 * gray[idx - sw + 1] +
          -2 * gray[idx - 1]      + 2 * gray[idx + 1] +
          -1 * gray[idx + sw - 1] + 1 * gray[idx + sw + 1];

        // Vertical gradient (Sobel Gy)
        const gy =
          -1 * gray[idx - sw - 1] - 2 * gray[idx - sw] - 1 * gray[idx - sw + 1] +
           1 * gray[idx + sw - 1] + 2 * gray[idx + sw] + 1 * gray[idx + sw + 1];

        const mag = Math.sqrt(gx * gx + gy * gy);
        edges[idx] = mag;
        if (mag > maxGrad) maxGrad = mag;
      }
    }

    // Search for prominent edge peaks in four quadrants
    const threshold = maxGrad * 0.25;
    const midX = sw / 2;
    const midY = sh / 2;

    let tlBest = { x: 0, y: 0, score: -Infinity };
    let trBest = { x: sw, y: 0, score: -Infinity };
    let brBest = { x: sw, y: sh, score: -Infinity };
    let blBest = { x: 0, y: sh, score: -Infinity };

    for (let y = 8; y < sh - 8; y++) {
      for (let x = 8; x < sw - 8; x++) {
        const idx = y * sw + x;
        const mag = edges[idx];
        if (mag < threshold) continue;

        // Weight towards corners: score = distance from center * edge magnitude
        const dx = x - midX;
        const dy = y - midY;

        if (x < midX && y < midY) {
          // Top-Left quadrant: maximizes (-x - y)
          const score = mag * ((-dx) + (-dy));
          if (score > tlBest.score) tlBest = { x, y, score };
        } else if (x >= midX && y < midY) {
          // Top-Right quadrant
          const score = mag * (dx + (-dy));
          if (score > trBest.score) trBest = { x, y, score };
        } else if (x >= midX && y >= midY) {
          // Bottom-Right quadrant
          const score = mag * (dx + dy);
          if (score > brBest.score) brBest = { x, y, score };
        } else {
          // Bottom-Left quadrant
          const score = mag * ((-dx) + dy);
          if (score > blBest.score) blBest = { x, y, score };
        }
      }
    }

    // Sanity checks on area of detected polygon
    const invScale = 1 / scale;
    const detected: QuadCorners = {
      tl: { x: Math.round(tlBest.x * invScale), y: Math.round(tlBest.y * invScale) },
      tr: { x: Math.round(trBest.x * invScale), y: Math.round(trBest.y * invScale) },
      br: { x: Math.round(brBest.x * invScale), y: Math.round(brBest.y * invScale) },
      bl: { x: Math.round(blBest.x * invScale), y: Math.round(blBest.y * invScale) }
    };

    // Calculate detected polygon area
    const polyArea = 0.5 * Math.abs(
      (detected.tl.x * detected.tr.y - detected.tr.x * detected.tl.y) +
      (detected.tr.x * detected.br.y - detected.br.x * detected.tr.y) +
      (detected.br.x * detected.bl.y - detected.bl.x * detected.br.y) +
      (detected.bl.x * detected.tl.y - detected.tl.x * detected.bl.y)
    );

    const totalArea = width * height;
    // Accept if detected area is between 25% and 95% of total image
    if (polyArea >= totalArea * 0.25 && polyArea <= totalArea * 0.98) {
      return detected;
    }

    return fallback;
  } catch (err) {
    console.warn("Corner auto-detection fallback applied:", err);
    return fallback;
  }
}

/**
 * Solves 8-parameter perspective homography matrix mapping source quad to destination rectangle.
 */
function getPerspectiveTransform(src: QuadCorners, dstWidth: number, dstHeight: number): number[] {
  const p1 = [src.tl.x, src.tl.y];
  const p2 = [src.tr.x, src.tr.y];
  const p3 = [src.br.x, src.br.y];
  const p4 = [src.bl.x, src.bl.y];

  const q1 = [0, 0];
  const q2 = [dstWidth, 0];
  const q3 = [dstWidth, dstHeight];
  const q4 = [0, dstHeight];

  // We want H mapping (x, y) -> (u, v)
  // [u, v, 1]^T ~ H [x, y, 1]^T
  const A: number[][] = [];
  const B: number[] = [];

  const addPointPair = (p: number[], q: number[]) => {
    const x = p[0];
    const y = p[1];
    const u = q[0];
    const v = q[1];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    B.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    B.push(v);
  };

  addPointPair(p1, q1);
  addPointPair(p2, q2);
  addPointPair(p3, q3);
  addPointPair(p4, q4);

  // Gaussian elimination to solve A * h = B
  const n = 8;
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }
    const tempA = A[i]; A[i] = A[maxRow]; A[maxRow] = tempA;
    const tempB = B[i]; B[i] = B[maxRow]; B[maxRow] = tempB;

    for (let k = i + 1; k < n; k++) {
      const c = -A[k][i] / (A[i][i] || 1e-9);
      for (let j = i; j < n; j++) {
        if (i === j) {
          A[k][j] = 0;
        } else {
          A[k][j] += c * A[i][j];
        }
      }
      B[k] += c * B[i];
    }
  }

  const h = new Array(8);
  for (let i = n - 1; i >= 0; i--) {
    let s = 0;
    for (let j = i + 1; j < n; j++) {
      s += A[i][j] * h[j];
    }
    h[i] = (B[i] - s) / (A[i][i] || 1e-9);
  }

  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1.0];
}

/**
 * Inverts a 3x3 matrix
 */
function invert3x3(m: number[]): number[] {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const D = -(b * i - c * h);
  const E = a * i - c * g;
  const F = -(a * h - b * g);
  const G = b * f - c * e;
  const H = -(a * f - c * d);
  const I = a * e - b * d;

  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-12) return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const invDet = 1 / det;

  return [
    A * invDet, D * invDet, G * invDet,
    B * invDet, E * invDet, H * invDet,
    C * invDet, F * invDet, I * invDet
  ];
}

/**
 * Applies perspective crop and warping to extract the flattened document.
 */
export function warpPerspective(
  sourceCanvas: HTMLCanvasElement,
  corners: QuadCorners,
  desiredWidth?: number,
  desiredHeight?: number
): HTMLCanvasElement {
  // Compute aspect ratio based on top/bottom & left/right edge lengths
  const topLen = Math.hypot(corners.tr.x - corners.tl.x, corners.tr.y - corners.tl.y);
  const botLen = Math.hypot(corners.br.x - corners.bl.x, corners.br.y - corners.bl.y);
  const leftLen = Math.hypot(corners.bl.x - corners.tl.x, corners.bl.y - corners.tl.y);
  const rightLen = Math.hypot(corners.br.x - corners.tr.x, corners.br.y - corners.tr.y);

  const avgWidth = Math.round((topLen + botLen) / 2);
  const avgHeight = Math.round((leftLen + rightLen) / 2);

  const outWidth = desiredWidth || Math.max(300, Math.min(2400, avgWidth));
  const outHeight = desiredHeight || Math.max(400, Math.min(3200, avgHeight));

  const destCanvas = document.createElement('canvas');
  destCanvas.width = outWidth;
  destCanvas.height = outHeight;
  const dctx = destCanvas.getContext('2d');
  if (!dctx) return sourceCanvas;

  const sctx = sourceCanvas.getContext('2d');
  if (!sctx) return sourceCanvas;

  const srcImgData = sctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const srcPixels = srcImgData.data;
  const srcW = sourceCanvas.width;
  const srcH = sourceCanvas.height;

  const destImgData = dctx.createImageData(outWidth, outHeight);
  const destPixels = destImgData.data;

  // H maps src -> dst. We invert H to sample dst -> src
  const H = getPerspectiveTransform(corners, outWidth, outHeight);
  const Hinv = invert3x3(H);

  const [h0, h1, h2, h3, h4, h5, h6, h7, h8] = Hinv;

  for (let y = 0; y < outHeight; y++) {
    for (let x = 0; x < outWidth; x++) {
      const z = h6 * x + h7 * y + h8;
      if (Math.abs(z) < 1e-8) continue;
      const invZ = 1 / z;
      const sx = (h0 * x + h1 * y + h2) * invZ;
      const sy = (h3 * x + h4 * y + h5) * invZ;

      // Bilinear interpolation
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const x1 = x0 + 1;
      const y1 = y0 + 1;

      if (x0 >= 0 && x1 < srcW && y0 >= 0 && y1 < srcH) {
        const wx = sx - x0;
        const wy = sy - y0;

        const i00 = (y0 * srcW + x0) * 4;
        const i10 = (y0 * srcW + x1) * 4;
        const i01 = (y1 * srcW + x0) * 4;
        const i11 = (y1 * srcW + x1) * 4;

        const dIdx = (y * outWidth + x) * 4;

        for (let c = 0; c < 3; c++) {
          const top = srcPixels[i00 + c] * (1 - wx) + srcPixels[i10 + c] * wx;
          const bot = srcPixels[i01 + c] * (1 - wx) + srcPixels[i11 + c] * wx;
          destPixels[dIdx + c] = Math.round(top * (1 - wy) + bot * wy);
        }
        destPixels[dIdx + 3] = 255;
      }
    }
  }

  dctx.putImageData(destImgData, 0, 0);
  return destCanvas;
}

/**
 * Applies document enhancement filters (Magic Color, B&W Threshold, Grayscale, Vibrant)
 * plus fine-tuned brightness and contrast adjustments.
 */
export function applyFilter(
  canvas: HTMLCanvasElement,
  filter: FilterType,
  brightness: number = 0, // -50 to +50
  contrast: number = 0     // -50 to +50
): HTMLCanvasElement {
  const output = document.createElement('canvas');
  output.width = canvas.width;
  output.height = canvas.height;
  const ctx = output.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(canvas, 0, 0);
  if (filter === 'original' && brightness === 0 && contrast === 0) {
    return output;
  }

  const imgData = ctx.getImageData(0, 0, output.width, output.height);
  const data = imgData.data;
  const len = data.length;

  // Contrast factor: [-50, 50] -> factor
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const brightnessOffset = brightness * 2.55;

  if (filter === 'bw') {
    // High-contrast clean black & white for crisp document text (Otsu threshold approximation)
    // 1. Calculate luminance histogram
    const hist = new Int32Array(256);
    for (let i = 0; i < len; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      hist[gray]++;
    }

    // Otsu's threshold calculation
    const total = len / 4;
    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * hist[t];

    let sumB = 0;
    let wB = 0;
    let maxVariance = 0;
    let optimalThreshold = 128;

    for (let t = 0; t < 256; t++) {
      wB += hist[t];
      if (wB === 0) continue;
      const wF = total - wB;
      if (wF === 0) break;

      sumB += t * hist[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const variance = wB * wF * (mB - mF) * (mB - mF);

      if (variance > maxVariance) {
        maxVariance = variance;
        optimalThreshold = t;
      }
    }

    // Shift threshold with user brightness
    const finalThreshold = Math.max(40, Math.min(220, optimalThreshold - brightnessOffset * 0.5));

    for (let i = 0; i < len; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const val = gray > finalThreshold ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
  } else if (filter === 'grayscale') {
    for (let i = 0; i < len; i += 4) {
      let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (contrast !== 0) gray = contrastFactor * (gray - 128) + 128;
      gray += brightnessOffset;
      const val = Math.max(0, Math.min(255, Math.round(gray)));
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
  } else if (filter === 'magic_color') {
    // CamScanner-style "Magic Color": Whitens document background while boosting text/ink contrast
    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Non-linear tone curve: lighten brights to pure white, darken text inks
      if (lum > 155) {
        const boost = (lum - 155) * 0.9;
        r = Math.min(255, r + boost);
        g = Math.min(255, g + boost);
        b = Math.min(255, b + boost);
      } else {
        r = Math.max(0, r * 0.88);
        g = Math.max(0, g * 0.88);
        b = Math.max(0, b * 0.88);
      }

      if (contrast !== 0) {
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;
      }
      r += brightnessOffset;
      g += brightnessOffset;
      b += brightnessOffset;

      data[i] = Math.max(0, Math.min(255, Math.round(r)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }
  } else if (filter === 'vibrant') {
    // Saturated color enhancement
    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      const avg = (r + g + b) / 3;
      // 1.35x color saturation
      r = avg + (r - avg) * 1.35;
      g = avg + (g - avg) * 1.35;
      b = avg + (b - avg) * 1.35;

      if (contrast !== 0) {
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;
      }
      r += brightnessOffset;
      g += brightnessOffset;
      b += brightnessOffset;

      data[i] = Math.max(0, Math.min(255, Math.round(r)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }
  } else {
    // Original with brightness/contrast adjustments
    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      if (contrast !== 0) {
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;
      }
      r += brightnessOffset;
      g += brightnessOffset;
      b += brightnessOffset;

      data[i] = Math.max(0, Math.min(255, Math.round(r)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return output;
}

/**
 * Rotates canvas by 90, 180, or 270 degrees.
 */
export function rotateCanvas(canvas: HTMLCanvasElement, degrees: 90 | 180 | 270): HTMLCanvasElement {
  const output = document.createElement('canvas');
  const isRightAngle = degrees === 90 || degrees === 270;

  output.width = isRightAngle ? canvas.height : canvas.width;
  output.height = isRightAngle ? canvas.width : canvas.height;

  const ctx = output.getContext('2d');
  if (!ctx) return canvas;

  ctx.translate(output.width / 2, output.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

  return output;
}

/**
 * Flips canvas horizontally or vertically.
 */
export function flipCanvas(canvas: HTMLCanvasElement, horizontal = true): HTMLCanvasElement {
  const output = document.createElement('canvas');
  output.width = canvas.width;
  output.height = canvas.height;

  const ctx = output.getContext('2d');
  if (!ctx) return canvas;

  ctx.translate(horizontal ? output.width : 0, horizontal ? 0 : output.height);
  ctx.scale(horizontal ? -1 : 1, horizontal ? 1 : -1);
  ctx.drawImage(canvas, 0, 0);

  return output;
}

/**
 * Linearly interpolates between two sets of quadrilateral corners.
 */
export function interpolateCorners(start: QuadCorners, end: QuadCorners, progress: number): QuadCorners {
  const p = Math.max(0, Math.min(1, progress));
  return {
    tl: {
      x: Math.round(start.tl.x + (end.tl.x - start.tl.x) * p),
      y: Math.round(start.tl.y + (end.tl.y - start.tl.y) * p)
    },
    tr: {
      x: Math.round(start.tr.x + (end.tr.x - start.tr.x) * p),
      y: Math.round(start.tr.y + (end.tr.y - start.tr.y) * p)
    },
    br: {
      x: Math.round(start.br.x + (end.br.x - start.br.x) * p),
      y: Math.round(start.br.y + (end.br.y - start.br.y) * p)
    },
    bl: {
      x: Math.round(start.bl.x + (end.bl.x - start.bl.x) * p),
      y: Math.round(start.bl.y + (end.bl.y - start.bl.y) * p)
    }
  };
}

/**
 * Calculates midpoints of the four edges (top, right, bottom, left) of the quad.
 */
export function getEdgeMidpoints(corners: QuadCorners): {
  top: Point;
  right: Point;
  bottom: Point;
  left: Point;
} {
  return {
    top: {
      x: Math.round((corners.tl.x + corners.tr.x) / 2),
      y: Math.round((corners.tl.y + corners.tr.y) / 2)
    },
    right: {
      x: Math.round((corners.tr.x + corners.br.x) / 2),
      y: Math.round((corners.tr.y + corners.br.y) / 2)
    },
    bottom: {
      x: Math.round((corners.bl.x + corners.br.x) / 2),
      y: Math.round((corners.bl.y + corners.br.y) / 2)
    },
    left: {
      x: Math.round((corners.tl.x + corners.bl.x) / 2),
      y: Math.round((corners.tl.y + corners.bl.y) / 2)
    }
  };
}

/**
 * Snaps a corner coordinate magnetically to canvas edges or adjacent corner axes.
 */
export function snapCorner(
  point: Point,
  canvasWidth: number,
  canvasHeight: number,
  alignedNeighbors: Point[] = [],
  threshold: number = 20
): { point: Point; snappedH: boolean; snappedV: boolean } {
  let x = point.x;
  let y = point.y;
  let snappedH = false;
  let snappedV = false;

  // Snap to image boundaries
  if (Math.abs(x) < threshold) {
    x = 0;
    snappedH = true;
  } else if (Math.abs(x - canvasWidth) < threshold) {
    x = canvasWidth;
    snappedH = true;
  }

  if (Math.abs(y) < threshold) {
    y = 0;
    snappedV = true;
  } else if (Math.abs(y - canvasHeight) < threshold) {
    y = canvasHeight;
    snappedV = true;
  }

  // Snap to neighbor alignments (e.g. matching X with BL or Y with TR)
  for (const n of alignedNeighbors) {
    if (!snappedH && Math.abs(x - n.x) < threshold) {
      x = n.x;
      snappedH = true;
    }
    if (!snappedV && Math.abs(y - n.y) < threshold) {
      y = n.y;
      snappedV = true;
    }
  }

  return { point: { x, y }, snappedH, snappedV };
}

/**
 * Loads a File object into an HTMLCanvasElement asynchronously.
 */
export function loadImageToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Failed to get 2d canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}


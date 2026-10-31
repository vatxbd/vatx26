import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  // Use unpkg / cdnjs fallback or local worker URL compatible with Vite
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`;
}

export interface LowConfidenceWord {
  text: string;
  confidence: number;
  bbox?: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  page?: number;
}

export interface OcrProgressState {
  currentPage: number;
  totalPages: number;
  percent: number;
  statusText: string;
}

export interface ClientOcrResult {
  originalText: string;
  normalizedText: string;
  lowConfidenceWords: LowConfidenceWord[];
  pagesProcessed: number;
  extractedViaPdfTextDirectly?: boolean;
}

/**
 * Singleton Tesseract Worker cache to load worker once and reuse it across multiple files
 */
let cachedWorkerPromise: Promise<Tesseract.Worker> | null = null;

export async function getSharedOcrWorker(): Promise<Tesseract.Worker> {
  if (!cachedWorkerPromise) {
    cachedWorkerPromise = (async () => {
      // In tesseract.js v5/v6/v7, createWorker takes language and options
      const worker = await Tesseract.createWorker(['ben', 'eng'], 1, {
        logger: () => {},
      });
      return worker;
    })().catch((err) => {
      cachedWorkerPromise = null; // reset on error so next attempt can retry
      throw err;
    });
  }
  return cachedWorkerPromise;
}

/**
 * Normalize Bengali digits (০-৯) to English digits (0-9)
 */
export function normalizeBengaliDigits(text: string): string {
  if (!text) return '';
  const bnToEnMap: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  return text.replace(/[০-৯]/g, (ch) => bnToEnMap[ch] || ch);
}

/**
 * Preprocess image on an HTML5 canvas:
 * 1. Draw to canvas
 * 2. Convert to Grayscale
 * 3. Increase contrast for optimal Bengali vowel-mark / diacritic recognition
 */
export async function preprocessImageCanvas(imageSource: string | HTMLCanvasElement): Promise<string> {
  return new Promise((resolve) => {
    if (imageSource instanceof HTMLCanvasElement) {
      try {
        const ctx = imageSource.getContext('2d');
        if (!ctx) return resolve(imageSource.toDataURL('image/png'));
        const imgData = ctx.getImageData(0, 0, imageSource.width, imageSource.height);
        applyGrayscaleAndContrast(imgData);
        ctx.putImageData(imgData, 0, 0);
        return resolve(imageSource.toDataURL('image/png'));
      } catch (e) {
        console.warn('Canvas direct preprocessing fallback:', e);
        return resolve(imageSource.toDataURL('image/png'));
      }
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSource);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyGrayscaleAndContrast(imgData);
        ctx.putImageData(imgData, 0, 0);

        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Image preprocess error, fallback to raw:', err);
        resolve(imageSource);
      }
    };
    img.onerror = () => resolve(imageSource);
    img.src = imageSource;
  });
}

function applyGrayscaleAndContrast(imgData: ImageData, contrast: number = 55) {
  const data = imgData.data;
  // Standard contrast formula: factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    // Luminance standard for printed/handwritten Bengali ink
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const contrasted = factor * (gray - 128) + 128;
    const clamped = Math.min(255, Math.max(0, contrasted));

    data[i] = clamped;     // R
    data[i + 1] = clamped; // G
    data[i + 2] = clamped; // B
  }
}

/**
 * Process an Image File (jpg, png, webp) using client-side preprocessed Canvas + Tesseract.js (ben+eng)
 */
export async function ocrImageFileClient(
  file: File,
  onProgress?: (progress: OcrProgressState) => void
): Promise<ClientOcrResult> {
  onProgress?.({
    currentPage: 1,
    totalPages: 1,
    percent: 10,
    statusText: 'ছবি প্রস্তুত ও কনট্রাস্ট বৃদ্ধি করা হচ্ছে...',
  });

  const objectUrl = URL.createObjectURL(file);

  try {
    const preprocessedDataUrl = await preprocessImageCanvas(objectUrl);

    onProgress?.({
      currentPage: 1,
      totalPages: 1,
      percent: 30,
      statusText: 'বাংলা ও ইংরেজি ওসিআর ইঞ্জিন লোড হচ্ছে...',
    });

    const worker = await getSharedOcrWorker();

    onProgress?.({
      currentPage: 1,
      totalPages: 1,
      percent: 50,
      statusText: 'পৃষ্ঠা ১/১ — লেখা শনাক্ত করা হচ্ছে...',
    });

    const ocrResult = await worker.recognize(preprocessedDataUrl);
    const text = ocrResult.data?.text || '';

    // Extract low confidence words (< 70)
    const lowConfidenceWords: LowConfidenceWord[] = [];
    const words = (ocrResult.data as any)?.words || [];
    for (const w of words) {
      const cleanWord = (w.text || '').trim();
      if (cleanWord.length > 0 && typeof w.confidence === 'number' && w.confidence < 70) {
        lowConfidenceWords.push({
          text: cleanWord,
          confidence: Math.round(w.confidence),
          bbox: w.bbox,
          page: 1,
        });
      }
    }

    onProgress?.({
      currentPage: 1,
      totalPages: 1,
      percent: 100,
      statusText: 'ওসিআর সম্পন্ন হয়েছে!',
    });

    return {
      originalText: text,
      normalizedText: normalizeBengaliDigits(text),
      lowConfidenceWords,
      pagesProcessed: 1,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Process a PDF File (scanned or native):
 * 1. Read pages with pdfjs-dist
 * 2. If page has selectable text (text.items.length > 10), extract text directly
 * 3. If page is scanned/empty, render to canvas at 2x scale, preprocess, and run Tesseract OCR
 */
export async function ocrPdfFileClient(
  file: File,
  onProgress?: (progress: OcrProgressState) => void
): Promise<ClientOcrResult> {
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({
    currentPage: 0,
    totalPages: 0,
    percent: 5,
    statusText: 'পিডিএফ ফাইল প্রস্তুত করা হচ্ছে...',
  });

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/cmaps/`,
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages || 1;

  let combinedOriginalText = '';
  const lowConfidenceWords: LowConfidenceWord[] = [];
  let hasUsedDirectPdfText = false;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    const baseProgress = Math.round(((pageNum - 1) / totalPages) * 90);
    onProgress?.({
      currentPage: pageNum,
      totalPages,
      percent: Math.max(10, baseProgress),
      statusText: `পৃষ্ঠা ${pageNum}/${totalPages} — বিশ্লেষণ করা হচ্ছে...`,
    });

    // Check if page already has selectable text
    const textContent = await page.getTextContent();
    const textItems = (textContent?.items || []).filter((item: any) => item.str && item.str.trim().length > 0);

    // If there is substantial selectable text in this page (e.g. >= 20 characters), use that text directly!
    const pageDirectText = textItems.map((item: any) => item.str).join(' ').trim();
    if (pageDirectText.length > 25) {
      hasUsedDirectPdfText = true;
      combinedOriginalText += (combinedOriginalText ? '\n\n' : '') + pageDirectText;

      onProgress?.({
        currentPage: pageNum,
        totalPages,
        percent: Math.round((pageNum / totalPages) * 90),
        statusText: `পৃষ্ঠা ${pageNum}/${totalPages} — ডিজিটাল টেক্সট সরাসরি পাওয়া গেছে!`,
      });
      continue;
    }

    // Scanned page: render page to canvas at 2x scale for maximum OCR fidelity
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      continue;
    }

    onProgress?.({
      currentPage: pageNum,
      totalPages,
      percent: Math.max(15, baseProgress + 10),
      statusText: `পৃষ্ঠা ${pageNum}/${totalPages} — স্ক্যান পেজ ২x স্কেলে রেন্ডার করা হচ্ছে...`,
    });

    const renderContext: any = {
      canvasContext: ctx,
      viewport,
      canvas,
    };
    await page.render(renderContext).promise;

    // Preprocess the rendered canvas
    const preprocessedDataUrl = await preprocessImageCanvas(canvas);

    onProgress?.({
      currentPage: pageNum,
      totalPages,
      percent: Math.max(25, baseProgress + 20),
      statusText: `পৃষ্ঠা ${pageNum}/${totalPages} — ওসিআর করা হচ্ছে...`,
    });

    const worker = await getSharedOcrWorker();
    const ocrResult = await worker.recognize(preprocessedDataUrl);
    const pageText = ocrResult.data?.text || '';

    if (pageText.trim()) {
      combinedOriginalText += (combinedOriginalText ? '\n\n' : '') + pageText.trim();
    }

    // Collect low-confidence words (< 70)
    const words = (ocrResult.data as any)?.words || [];
    for (const w of words) {
      const cleanWord = (w.text || '').trim();
      if (cleanWord.length > 0 && typeof w.confidence === 'number' && w.confidence < 70) {
        lowConfidenceWords.push({
          text: cleanWord,
          confidence: Math.round(w.confidence),
          bbox: w.bbox,
          page: pageNum,
        });
      }
    }
  }

  onProgress?.({
    currentPage: totalPages,
    totalPages,
    percent: 100,
    statusText: 'পিডিএফ ওসিআর সম্পন্ন হয়েছে!',
  });

  return {
    originalText: combinedOriginalText,
    normalizedText: normalizeBengaliDigits(combinedOriginalText),
    lowConfidenceWords,
    pagesProcessed: totalPages,
    extractedViaPdfTextDirectly: hasUsedDirectPdfText && lowConfidenceWords.length === 0,
  };
}

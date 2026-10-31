/**
 * VATX.BD - Client-side PDF Generator Module using pdf-lib
 * Generates multi-page high-resolution PDFs with page-size options, compression presets,
 * and optional invisible copyable OCR text layer.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export type PageSizeOption = 'A4' | 'LETTER' | 'FIT';
export type PageOrientation = 'portrait' | 'landscape' | 'auto';
export type QualityPreset = 'small' | 'balanced' | 'high';

export interface OcrWordBox {
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  confidence?: number;
}

export interface DocumentPage {
  id: string;
  originalCanvas: HTMLCanvasElement;
  processedCanvas: HTMLCanvasElement;
  rotation: number;
  filter: string;
  ocrText?: string;
  ocrWords?: OcrWordBox[];
}

export interface PdfExportOptions {
  pageSize?: PageSizeOption;
  orientation?: PageOrientation;
  quality?: QualityPreset;
  filename?: string;
  includeOcrLayer?: boolean;
}

const PAGE_DIMENSIONS = {
  A4: { width: 595.28, height: 841.89 },
  LETTER: { width: 612.0, height: 792.0 }
};

/**
 * Encodes canvas to JPEG byte buffer with quality setting
 */
async function canvasToJpegBytes(
  canvas: HTMLCanvasElement,
  qualityPreset: QualityPreset
): Promise<Uint8Array> {
  const quality = qualityPreset === 'small' ? 0.65 : qualityPreset === 'high' ? 0.95 : 0.82;
  const maxDim = qualityPreset === 'small' ? 1280 : qualityPreset === 'high' ? 2400 : 1800;

  let targetCanvas = canvas;
  if (canvas.width > maxDim || canvas.height > maxDim) {
    const scale = maxDim / Math.max(canvas.width, canvas.height);
    const scaled = document.createElement('canvas');
    scaled.width = Math.round(canvas.width * scale);
    scaled.height = Math.round(canvas.height * scale);
    const ctx = scaled.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
      targetCanvas = scaled;
    }
  }

  return new Promise((resolve, reject) => {
    targetCanvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('Canvas to blob conversion failed'));
          return;
        }
        const arrayBuffer = await blob.arrayBuffer();
        resolve(new Uint8Array(arrayBuffer));
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Builds a multi-page PDF document from an array of DocumentPage items.
 */
export async function generateDocumentPdf(
  pages: DocumentPage[],
  options: PdfExportOptions = {}
): Promise<Uint8Array> {
  const {
    pageSize = 'A4',
    orientation = 'auto',
    quality = 'balanced',
    includeOcrLayer = false
  } = options;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('Scanned Document');
  pdfDoc.setCreator('VATX.BD Document Scanner');
  pdfDoc.setProducer('VATX.BD Client-Side Scanner v2.0');

  let helveticaFont;
  if (includeOcrLayer) {
    try {
      helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    } catch (e) {
      console.warn('Font embedding failed:', e);
    }
  }

  for (const page of pages) {
    const canvas = page.processedCanvas;
    const jpegBytes = await canvasToJpegBytes(canvas, quality);
    const embeddedImage = await pdfDoc.embedJpg(jpegBytes);

    const imgW = embeddedImage.width;
    const imgH = embeddedImage.height;
    const isImageLandscape = imgW > imgH;

    // Determine target page width and height in PDF points
    let pWidth: number;
    let pHeight: number;

    if (pageSize === 'FIT') {
      pWidth = imgW * 0.72; // 100 DPI base
      pHeight = imgH * 0.72;
    } else {
      const baseDim = PAGE_DIMENSIONS[pageSize];
      let isTargetLandscape = false;
      if (orientation === 'auto') {
        isTargetLandscape = isImageLandscape;
      } else if (orientation === 'landscape') {
        isTargetLandscape = true;
      }

      pWidth = isTargetLandscape ? baseDim.height : baseDim.width;
      pHeight = isTargetLandscape ? baseDim.width : baseDim.height;
    }

    const pdfPage = pdfDoc.addPage([pWidth, pHeight]);

    // Fit image inside page preserving aspect ratio with clean 12pt margin
    const margin = pageSize === 'FIT' ? 0 : 16;
    const availW = pWidth - margin * 2;
    const availH = pHeight - margin * 2;

    const scale = Math.min(availW / imgW, availH / imgH);
    const renderW = imgW * scale;
    const renderH = imgH * scale;

    const posX = margin + (availW - renderW) / 2;
    const posY = margin + (availH - renderH) / 2;

    pdfPage.drawImage(embeddedImage, {
      x: posX,
      y: posY,
      width: renderW,
      height: renderH
    });

    // Optional invisible OCR text layer (copyable and searchable)
    if (includeOcrLayer && helveticaFont && page.ocrWords && page.ocrWords.length > 0) {
      const scaleX = renderW / canvas.width;
      const scaleY = renderH / canvas.height;

      for (const w of page.ocrWords) {
        if (!w.text || !w.text.trim()) continue;
        const wordX = posX + w.x0 * scaleX;
        // Invert Y coordinate for PDF coordinate system (0,0 is bottom-left)
        const wordY = posY + renderH - w.y1 * scaleY;
        const wordW = Math.max(8, (w.x1 - w.x0) * scaleX);
        const wordH = Math.max(6, (w.y1 - w.y0) * scaleY);
        const fontSize = Math.max(4, Math.min(18, wordH * 0.85));

        try {
          pdfPage.drawText(w.text, {
            x: wordX,
            y: wordY,
            size: fontSize,
            font: helveticaFont,
            color: rgb(1, 1, 1),
            opacity: 0.01 // Invisible text layer overlay
          });
        } catch {
          // Ignore unsupported unicode glyphs in standard Helvetica
        }
      }
    }
  }

  return await pdfDoc.save();
}

/**
 * Triggers instant browser download of PDF Uint8Array.
 */
export function downloadPdf(bytes: Uint8Array, filename: string = 'Scanned_Document.pdf'): void {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Shares PDF using Web Share API on mobile devices.
 */
export async function sharePdf(
  bytes: Uint8Array,
  filename: string = 'Scanned_Document.pdf',
  title: string = 'Scanned Document'
): Promise<boolean> {
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const file = new File([blob], safeFilename, { type: 'application/pdf' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title,
        text: 'Sharing scanned document PDF created with VATX Scanner.',
        files: [file]
      });
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Web share error:', err);
      }
      return false;
    }
  }
  return false;
}

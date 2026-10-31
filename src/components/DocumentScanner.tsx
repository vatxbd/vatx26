"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  Download,
  Share2,
  Trash2,
  Plus,
  RotateCw,
  Sliders,
  Check,
  X,
  FileText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Crop,
  Layers,
  ArrowRight,
  Maximize2,
  Sun,
  Contrast,
  CloudUpload,
  FlipHorizontal,
  Zap,
  ZapOff,
  CheckCircle2,
  AlertCircle,
  Move,
  Magnet,
  FolderUp,
  FileCheck2,
  SlidersHorizontal,
  Wand2
} from "lucide-react";
import {
  Point,
  QuadCorners,
  FilterType,
  detectDocumentCorners,
  warpPerspective,
  applyFilter,
  rotateCanvas,
  flipCanvas,
  interpolateCorners,
  getEdgeMidpoints,
  snapCorner,
  loadImageToCanvas
} from "../utils/imageProcessing";
import {
  DocumentPage,
  PageSizeOption,
  PageOrientation,
  QualityPreset,
  generateDocumentPdf,
  downloadPdf,
  sharePdf
} from "../utils/pdfGenerator";
import { Language } from "../translations";

interface DocumentScannerProps {
  language?: Language;
  onPdfGenerated?: (pdfBytes: Uint8Array, filename: string) => void;
  onClose?: () => void;
}

type ScanStep = 'camera' | 'crop' | 'filter' | 'review';

export default function DocumentScanner({
  language = 'bn',
  onPdfGenerated,
  onClose
}: DocumentScannerProps) {
  const isBn = language === 'bn';

  // Navigation & Multi-page state
  const [step, setStep] = useState<ScanStep>('camera');
  const [pages, setPages] = useState<DocumentPage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Live Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Current editing page working canvases
  const [rawCapturedCanvas, setRawCapturedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [croppedCanvas, setCroppedCanvas] = useState<HTMLCanvasElement | null>(null);

  // Crop & perspective handles
  const [corners, setCorners] = useState<QuadCorners | null>(null);
  const [draggingCorner, setDraggingCorner] = useState<keyof QuadCorners | null>(null);
  const [draggingEdge, setDraggingEdge] = useState<'top' | 'right' | 'bottom' | 'left' | null>(null);
  const [edgeDragStart, setEdgeDragStart] = useState<Point | null>(null);
  const [initialCornersOnDrag, setInitialCornersOnDrag] = useState<QuadCorners | null>(null);
  const [magnifierPoint, setMagnifierPoint] = useState<Point | null>(null);
  const [isAutoDragging, setIsAutoDragging] = useState<boolean>(false);
  const [magneticSnap, setMagneticSnap] = useState<boolean>(true);
  const [alignmentGuides, setAlignmentGuides] = useState<{ x?: number; y?: number } | null>(null);

  // Batch Multi-File Upload & AI Auto-Drag State
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    filename: string;
    completedThumbs: string[];
  }>({ current: 0, total: 0, filename: '', completedThumbs: [] });
  const [isDragOverBatch, setIsDragOverBatch] = useState<boolean>(false);

  // Filter settings
  const [activeFilter, setActiveFilter] = useState<FilterType>('magic_color');
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);

  // Export settings
  const [pageSize, setPageSize] = useState<PageSizeOption>('A4');
  const [orientation, setOrientation] = useState<PageOrientation>('auto');
  const [quality, setQuality] = useState<QualityPreset>('balanced');
  const [filename, setFilename] = useState<string>(() => {
    const d = new Date().toISOString().slice(0, 10);
    return `VATX_Scanned_Document_${d}`;
  });
  const [includeOcr, setIncludeOcr] = useState<boolean>(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const filterPreviewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // 1. CAMERA LIFECYCLE & STREAM MANAGEMENT
  // ==========================================
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        t.stop();
      });
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
    setHasTorch(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        isBn
          ? "আপনার ব্রাউজার ক্যামেরা সাপোর্ট করে না বা HTTPS সক্রিয় নেই।"
          : "Camera not supported or HTTPS connection required."
      );
      setHasCameraPermission(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: cameraFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      setHasCameraPermission(true);

      // Check torch capability
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities: any = track.getCapabilities?.() || {};
        if (capabilities.torch) {
          setHasTorch(true);
        }
      }
    } catch (err: any) {
      console.warn("Camera access error:", err);
      setHasCameraPermission(false);
      setCameraError(
        isBn
          ? "ক্যামেরা এক্সেস দেওয়া হয়নি। অনুগ্রহ করে ব্রাউজার সেটিংসে ক্যামেরা অনুমতি দিন অথবা ফাইল আপলোড করুন।"
          : "Camera permission denied. Please allow camera access or upload an image file."
      );
    }
  }, [cameraFacing, isBn, stopCamera]);

  useEffect(() => {
    if (step === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step, startCamera, stopCamera]);

  const toggleTorch = async () => {
    if (!streamRef.current || !hasTorch) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setIsTorchOn(nextState);
      } catch (e) {
        console.warn("Torch toggle error:", e);
      }
    }
  };

  const switchCamera = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // ==========================================
  // 2. CAPTURE & FILE IMPORT HANDLERS
  // ==========================================
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    // Haptic feedback if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();

    // Proceed to Crop Step
    prepareCropStep(canvas);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          stopCamera();
          prepareCropStep(canvas);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ==========================================
  // 3. CROP & PERSPECTIVE WARPING WORKFLOW
  // ==========================================
  // ==========================================
  // 3. CROP & PERSPECTIVE WARPING WORKFLOW
  // ==========================================
  const autoDragCornersToTarget = useCallback((target: QuadCorners, durationMs: number = 380) => {
    if (!corners) {
      setCorners(target);
      return;
    }
    setIsAutoDragging(true);
    const start = { ...corners };
    const startTime = performance.now();

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(25); } catch {}
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const p = Math.min(1, elapsed / durationMs);
      const ease = 1 - Math.pow(1 - p, 3);
      const current = interpolateCorners(start, target, ease);
      setCorners(current);

      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        setCorners(target);
        setIsAutoDragging(false);
      }
    };

    requestAnimationFrame(animate);
  }, [corners]);

  const prepareCropStep = (canvas: HTMLCanvasElement) => {
    setRawCapturedCanvas(canvas);
    // Initial inset boundary
    const initialCorners: QuadCorners = {
      tl: { x: Math.round(canvas.width * 0.05), y: Math.round(canvas.height * 0.05) },
      tr: { x: Math.round(canvas.width * 0.95), y: Math.round(canvas.height * 0.05) },
      br: { x: Math.round(canvas.width * 0.95), y: Math.round(canvas.height * 0.95) },
      bl: { x: Math.round(canvas.width * 0.05), y: Math.round(canvas.height * 0.95) }
    };
    setCorners(initialCorners);
    setStep('crop');

    // Automatically auto-drag corners to detected document borders with smooth glide
    const detected = detectDocumentCorners(canvas);
    setTimeout(() => {
      autoDragCornersToTarget(detected, 420);
    }, 120);
  };

  const handleAutoDragCorners = () => {
    if (!rawCapturedCanvas) return;
    const detected = detectDocumentCorners(rawCapturedCanvas);
    autoDragCornersToTarget(detected, 400);
  };

  // Redraw Interactive Crop Canvas with 4 Draggable Handles, Edge Midpoints & Alignment Guides
  const drawCropCanvas = useCallback(() => {
    if (!cropCanvasRef.current || !rawCapturedCanvas || !corners) return;
    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = rawCapturedCanvas.width;
    canvas.height = rawCapturedCanvas.height;

    // Draw background image
    ctx.drawImage(rawCapturedCanvas, 0, 0);

    // Dim outside region
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Highlight quadrilateral interior
    ctx.beginPath();
    ctx.moveTo(corners.tl.x, corners.tl.y);
    ctx.lineTo(corners.tr.x, corners.tr.y);
    ctx.lineTo(corners.br.x, corners.br.y);
    ctx.lineTo(corners.bl.x, corners.bl.y);
    ctx.closePath();

    ctx.save();
    ctx.clip();
    ctx.drawImage(rawCapturedCanvas, 0, 0);
    ctx.fillStyle = isAutoDragging ? 'rgba(52, 211, 153, 0.22)' : 'rgba(16, 185, 129, 0.12)';
    ctx.fill();
    ctx.restore();

    // Alignment guides if snapped
    if (alignmentGuides) {
      ctx.save();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      if (alignmentGuides.x !== undefined) {
        ctx.beginPath();
        ctx.moveTo(alignmentGuides.x, 0);
        ctx.lineTo(alignmentGuides.x, canvas.height);
        ctx.stroke();
      }
      if (alignmentGuides.y !== undefined) {
        ctx.beginPath();
        ctx.moveTo(0, alignmentGuides.y);
        ctx.lineTo(canvas.width, alignmentGuides.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw connecting lines
    ctx.strokeStyle = isAutoDragging ? '#34d399' : '#10b981';
    ctx.lineWidth = Math.max(3, Math.round(canvas.width / 360));
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.restore();

    // Draw Edge Midpoint Handles (Top, Right, Bottom, Left)
    const midpoints = getEdgeMidpoints(corners);
    const edgeEntries: Array<['top' | 'right' | 'bottom' | 'left', Point, string]> = [
      ['top', midpoints.top, '↕ Top'],
      ['right', midpoints.right, '↔ Right'],
      ['bottom', midpoints.bottom, '↕ Bottom'],
      ['left', midpoints.left, '↔ Left']
    ];

    edgeEntries.forEach(([key, pt, label]) => {
      const isSelected = draggingEdge === key;
      ctx.save();
      const pillW = Math.max(48, Math.round(canvas.width / 16));
      const pillH = Math.max(22, Math.round(canvas.width / 36));

      ctx.beginPath();
      // Rounded rect pill
      const rx = pt.x - pillW / 2;
      const ry = pt.y - pillH / 2;
      const r = pillH / 2;
      ctx.moveTo(rx + r, ry);
      ctx.arcTo(rx + pillW, ry, rx + pillW, ry + pillH, r);
      ctx.arcTo(rx + pillW, ry + pillH, rx, ry + pillH, r);
      ctx.arcTo(rx, ry + pillH, rx, ry, r);
      ctx.arcTo(rx, ry, rx + pillW, ry, r);
      ctx.closePath();

      ctx.fillStyle = isSelected ? '#047857' : 'rgba(16, 185, 129, 0.9)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.font = `bold ${Math.round(pillH * 0.52)}px sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, pt.x, pt.y);
      ctx.restore();
    });

    // Draw 4 Corner Handles
    const handleRadius = Math.max(16, Math.round(canvas.width / 42));
    const handleEntries: Array<[keyof QuadCorners, Point, string]> = [
      ['tl', corners.tl, 'TL'],
      ['tr', corners.tr, 'TR'],
      ['br', corners.br, 'BR'],
      ['bl', corners.bl, 'BL']
    ];

    handleEntries.forEach(([key, pt, label]) => {
      const isSelected = draggingCorner === key;

      // Outer ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, handleRadius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#047857' : isAutoDragging ? '#10b981' : '#059669';
      ctx.fill();
      ctx.lineWidth = Math.max(3, handleRadius * 0.22);
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, handleRadius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Label text
      ctx.font = `bold ${Math.round(handleRadius * 0.65)}px sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, pt.x, pt.y);
      ctx.restore();
    });

    // Magnifier Loupe if handle is being dragged
    if (draggingCorner && magnifierPoint) {
      const pt = corners[draggingCorner];
      const loupeRadius = Math.max(64, canvas.width / 11);
      const zoom = 2.2;

      // Position loupe offset above the touched corner so finger doesn't block it
      const loupeX = Math.max(loupeRadius + 10, Math.min(canvas.width - loupeRadius - 10, pt.x));
      const loupeY = Math.max(loupeRadius + 10, pt.y - loupeRadius - 35);

      ctx.save();
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeRadius, 0, Math.PI * 2);
      ctx.clip();

      // Draw zoomed portion of raw image
      const srcW = (loupeRadius * 2) / zoom;
      const srcH = (loupeRadius * 2) / zoom;
      ctx.drawImage(
        rawCapturedCanvas,
        pt.x - srcW / 2,
        pt.y - srcH / 2,
        srcW,
        srcH,
        loupeX - loupeRadius,
        loupeY - loupeRadius,
        loupeRadius * 2,
        loupeRadius * 2
      );

      // Loupe crosshair
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(loupeX - 18, loupeY);
      ctx.lineTo(loupeX + 18, loupeY);
      ctx.moveTo(loupeX, loupeY - 18);
      ctx.lineTo(loupeX, loupeY + 18);
      ctx.stroke();

      ctx.restore();

      // Loupe circular border
      ctx.save();
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeRadius, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#10b981';
      ctx.stroke();
      ctx.restore();
    }
  }, [rawCapturedCanvas, corners, draggingCorner, draggingEdge, magnifierPoint, isAutoDragging, alignmentGuides]);

  useEffect(() => {
    if (step === 'crop') {
      drawCropCanvas();
    }
  }, [step, corners, draggingCorner, draggingEdge, drawCropCanvas]);

  // Touch / Mouse coordinates mapping helper
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    if (!cropCanvasRef.current) return null;
    const canvas = cropCanvasRef.current;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY)
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!corners || !cropCanvasRef.current) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    const hitRadius = Math.max(35, cropCanvasRef.current.width / 24);
    const keys: (keyof QuadCorners)[] = ['tl', 'tr', 'br', 'bl'];

    for (const key of keys) {
      const pt = corners[key];
      const dist = Math.hypot(coords.x - pt.x, coords.y - pt.y);
      if (dist <= hitRadius) {
        setDraggingCorner(key);
        setMagnifierPoint(coords);
        return;
      }
    }

    // Check edge midpoints
    const midpoints = getEdgeMidpoints(corners);
    const edgeEntries: Array<['top' | 'right' | 'bottom' | 'left', Point]> = [
      ['top', midpoints.top],
      ['right', midpoints.right],
      ['bottom', midpoints.bottom],
      ['left', midpoints.left]
    ];
    for (const [key, pt] of edgeEntries) {
      const dist = Math.hypot(coords.x - pt.x, coords.y - pt.y);
      if (dist <= hitRadius * 1.3) {
        setDraggingEdge(key);
        setEdgeDragStart(coords);
        setInitialCornersOnDrag({ ...corners });
        return;
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!cropCanvasRef.current || !corners) return;

    if (draggingCorner) {
      const coords = getCanvasCoords(e);
      if (!coords) return;
      let targetX = Math.max(0, Math.min(cropCanvasRef.current.width, coords.x));
      let targetY = Math.max(0, Math.min(cropCanvasRef.current.height, coords.y));

      let guides: { x?: number; y?: number } | null = null;
      if (magneticSnap) {
        let neighbors: Point[] = [];
        if (draggingCorner === 'tl') neighbors = [corners.tr, corners.bl];
        else if (draggingCorner === 'tr') neighbors = [corners.tl, corners.br];
        else if (draggingCorner === 'br') neighbors = [corners.tr, corners.bl];
        else if (draggingCorner === 'bl') neighbors = [corners.tl, corners.br];

        const snap = snapCorner(
          { x: targetX, y: targetY },
          cropCanvasRef.current.width,
          cropCanvasRef.current.height,
          neighbors,
          22
        );
        targetX = snap.point.x;
        targetY = snap.point.y;
        if (snap.snappedH || snap.snappedV) {
          guides = {
            x: snap.snappedH ? targetX : undefined,
            y: snap.snappedV ? targetY : undefined
          };
        }
      }

      setAlignmentGuides(guides);
      setCorners((prev) => (prev ? { ...prev, [draggingCorner]: { x: targetX, y: targetY } } : null));
      setMagnifierPoint({ x: targetX, y: targetY });
      return;
    }

    if (draggingEdge && edgeDragStart && initialCornersOnDrag) {
      const coords = getCanvasCoords(e);
      if (!coords) return;
      const dx = coords.x - edgeDragStart.x;
      const dy = coords.y - edgeDragStart.y;
      const w = cropCanvasRef.current.width;
      const h = cropCanvasRef.current.height;

      setCorners(() => {
        const next = {
          tl: { ...initialCornersOnDrag.tl },
          tr: { ...initialCornersOnDrag.tr },
          br: { ...initialCornersOnDrag.br },
          bl: { ...initialCornersOnDrag.bl }
        };

        if (draggingEdge === 'top') {
          next.tl.y = Math.max(0, Math.min(h - 20, initialCornersOnDrag.tl.y + dy));
          next.tr.y = Math.max(0, Math.min(h - 20, initialCornersOnDrag.tr.y + dy));
        } else if (draggingEdge === 'bottom') {
          next.bl.y = Math.max(20, Math.min(h, initialCornersOnDrag.bl.y + dy));
          next.br.y = Math.max(20, Math.min(h, initialCornersOnDrag.br.y + dy));
        } else if (draggingEdge === 'left') {
          next.tl.x = Math.max(0, Math.min(w - 20, initialCornersOnDrag.tl.x + dx));
          next.bl.x = Math.max(0, Math.min(w - 20, initialCornersOnDrag.bl.x + dx));
        } else if (draggingEdge === 'right') {
          next.tr.x = Math.max(20, Math.min(w, initialCornersOnDrag.tr.x + dx));
          next.br.x = Math.max(20, Math.min(w, initialCornersOnDrag.br.x + dx));
        }
        return next;
      });
    }
  };

  const handlePointerUp = () => {
    setDraggingCorner(null);
    setDraggingEdge(null);
    setEdgeDragStart(null);
    setInitialCornersOnDrag(null);
    setMagnifierPoint(null);
    setAlignmentGuides(null);
  };

  // Multi-File Upload & AI Auto-Drag Batch Pipeline
  const processMultipleFiles = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList).filter((f) =>
      f.type.startsWith('image/') || f.type === 'application/pdf' || /\.(jpe?g|png|webp|pdf)$/i.test(f.name)
    );
    if (filesArray.length === 0) {
      alert(isBn ? "অনুগ্রহ করে ছবি (JPG, PNG, WebP) নির্বাচন করুন।" : "Please select valid image files.");
      return;
    }

    stopCamera();
    setIsBatchProcessing(true);
    setBatchProgress({
      current: 0,
      total: filesArray.length,
      filename: filesArray[0].name,
      completedThumbs: []
    });

    const newPages: DocumentPage[] = [];
    const completedThumbs: string[] = [];

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      setBatchProgress((prev) => ({
        ...prev,
        current: i + 1,
        filename: file.name
      }));

      try {
        const canvas = await loadImageToCanvas(file);
        // AI Auto-detect corners & borders
        const detected = detectDocumentCorners(canvas);
        // Auto perspective warp
        const warped = warpPerspective(canvas, detected);
        // Auto enhance with magic_color
        const enhanced = applyFilter(warped, 'magic_color', 5, 8);

        const pageId = `page_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;
        const page: DocumentPage = {
          id: pageId,
          originalCanvas: canvas,
          processedCanvas: enhanced,
          rotation: 0,
          filter: 'magic_color'
        };

        newPages.push(page);
        const thumb = enhanced.toDataURL('image/jpeg', 0.6);
        completedThumbs.push(thumb);
        setBatchProgress((prev) => ({
          ...prev,
          completedThumbs: [...completedThumbs]
        }));
      } catch (err: any) {
        console.warn(`Error processing file ${file.name}:`, err);
      }

      await new Promise((r) => setTimeout(r, 70));
    }

    if (newPages.length > 0) {
      setPages((prev) => [...prev, ...newPages]);
      setActivePageIndex(pages.length);
      setStep('review');
    }

    setIsBatchProcessing(false);
  };

  const handleResetCrop = () => {
    if (!rawCapturedCanvas) return;
    setCorners({
      tl: { x: 0, y: 0 },
      tr: { x: rawCapturedCanvas.width, y: 0 },
      br: { x: rawCapturedCanvas.width, y: rawCapturedCanvas.height },
      bl: { x: 0, y: rawCapturedCanvas.height }
    });
  };

  const handleAutoDetect = () => {
    if (!rawCapturedCanvas) return;
    const detected = detectDocumentCorners(rawCapturedCanvas);
    setCorners(detected);
  };

  const applyCropAndWarp = () => {
    if (!rawCapturedCanvas || !corners) return;
    const warped = warpPerspective(rawCapturedCanvas, corners);
    setCroppedCanvas(warped);
    setStep('filter');
  };

  // ==========================================
  // 4. FILTER & ENHANCEMENT WORKFLOW
  // ==========================================
  const updateFilterPreview = useCallback(() => {
    if (!croppedCanvas || !filterPreviewCanvasRef.current) return;
    const previewCanvas = filterPreviewCanvasRef.current;
    const enhanced = applyFilter(croppedCanvas, activeFilter, brightness, contrast);

    previewCanvas.width = enhanced.width;
    previewCanvas.height = enhanced.height;
    const ctx = previewCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(enhanced, 0, 0);
    }
  }, [croppedCanvas, activeFilter, brightness, contrast]);

  useEffect(() => {
    if (step === 'filter') {
      updateFilterPreview();
    }
  }, [step, activeFilter, brightness, contrast, updateFilterPreview]);

  const handleRotateCurrent = (deg: 90 | 180 | 270) => {
    if (!croppedCanvas) return;
    const rotated = rotateCanvas(croppedCanvas, deg);
    setCroppedCanvas(rotated);
  };

  const handleFlipCurrent = () => {
    if (!croppedCanvas) return;
    const flipped = flipCanvas(croppedCanvas, true);
    setCroppedCanvas(flipped);
  };

  const saveCurrentPage = () => {
    if (!croppedCanvas || !rawCapturedCanvas) return;
    const finalEnhanced = applyFilter(croppedCanvas, activeFilter, brightness, contrast);

    const newPage: DocumentPage = {
      id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      originalCanvas: rawCapturedCanvas,
      processedCanvas: finalEnhanced,
      rotation: 0,
      filter: activeFilter
    };

    setPages((prev) => [...prev, newPage]);
    setActivePageIndex(pages.length);
    setStep('review');
  };

  // ==========================================
  // 5. MULTI-PAGE MANAGEMENT
  // ==========================================
  const handleMovePage = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= pages.length) return;
    const updated = [...pages];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setPages(updated);
    setActivePageIndex(targetIdx);
  };

  const handleDeletePage = (idx: number) => {
    if (pages.length <= 1) {
      if (confirm(isBn ? "আপনি কি পৃষ্ঠাটি মুছে ফেলে পুনরায় ক্যামেরা খুলতে চান?" : "Delete page and reopen camera?")) {
        setPages([]);
        setStep('camera');
      }
      return;
    }
    const updated = pages.filter((_, i) => i !== idx);
    setPages(updated);
    setActivePageIndex(Math.min(activePageIndex, updated.length - 1));
  };

  const handleEditPage = (idx: number) => {
    const page = pages[idx];
    if (!page) return;
    setRawCapturedCanvas(page.originalCanvas);
    setCroppedCanvas(page.processedCanvas);
    const detected = detectDocumentCorners(page.originalCanvas);
    setCorners(detected);
    setActivePageIndex(idx);
    setStep('crop');
  };

  // ==========================================
  // 6. PDF EXPORT, OCR & BACKEND UPLOAD
  // ==========================================
  const handleExportPdf = async () => {
    if (pages.length === 0) return;
    setIsExporting(true);

    try {
      const pdfBytes = await generateDocumentPdf(pages, {
        pageSize,
        orientation,
        quality,
        includeOcrLayer: includeOcr
      });

      downloadPdf(pdfBytes, `${filename}.pdf`);

      if (onPdfGenerated) {
        onPdfGenerated(pdfBytes, `${filename}.pdf`);
      }
    } catch (err: any) {
      console.error("PDF generation error:", err);
      alert(isBn ? "পিডিএফ তৈরি করতে সমস্যা হয়েছে।" : "Failed to generate PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareMobile = async () => {
    if (pages.length === 0) return;
    setIsExporting(true);

    try {
      const pdfBytes = await generateDocumentPdf(pages, {
        pageSize,
        orientation,
        quality,
        includeOcrLayer: includeOcr
      });

      const shared = await sharePdf(pdfBytes, `${filename}.pdf`, filename);
      if (!shared) {
        downloadPdf(pdfBytes, `${filename}.pdf`);
      }
    } catch (err) {
      console.error("PDF share error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleUploadToBackend = async () => {
    if (pages.length === 0) return;
    setUploadStatus(isBn ? "পিডিএফ প্রস্তুত ও সার্ভারে আপলোড হচ্ছে..." : "Uploading to server...");

    try {
      const pdfBytes = await generateDocumentPdf(pages, {
        pageSize,
        orientation,
        quality,
        includeOcrLayer: includeOcr
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', blob, `${filename}.pdf`);

      const res = await fetch('/api/scanner/upload', {
        method: 'POST',
        body: formData
      });

      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setUploadStatus(
          isBn
            ? `✓ সফলভাবে সংরক্ষিত হয়েছে! (ডকুমেন্ট আইডি: ${json.documentId || 'OK'})`
            : `✓ Saved successfully! (Document ID: ${json.documentId || 'OK'})`
        );
        setTimeout(() => setUploadStatus(null), 4000);
      } else {
        throw new Error(json?.error || `Upload failed with code ${res.status}`);
      }
    } catch (err: any) {
      setUploadStatus(
        isBn
          ? `আপলোড ব্যর্থ হয়েছে: ${err.message || 'নেটওয়ার্ক সমস্যা'}`
          : `Upload failed: ${err.message}`
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 p-4 md:p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xl space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-black">
            <Camera size={14} className="text-emerald-600" />
            <span>{isBn ? "মোবাইল-ফার্স্ট ডকুমেন্ট স্ক্যানার" : "Mobile-First Document Scanner"}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight">
            {isBn ? "ক্যামেরা স্ক্যান ও প্রফেশনাল PDF জেনারেটর" : "Camera Document Scanner & PDF"}
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            {isBn
              ? "অটো এজ ডিটেকশন, পার্সপেক্টিভ সোজা করা, ফিল্টার এবং মাল্টি-পেজ সার্চেবল PDF এক্সপোর্ট।"
              : "Auto edge-detection, perspective warp, CamScanner filters, and multi-page PDF export."}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1.5 rounded-2xl self-start sm:self-auto">
          {(['camera', 'crop', 'filter', 'review'] as ScanStep[]).map((s, idx) => (
            <button
              key={s}
              onClick={() => {
                if (s === 'camera') setStep('camera');
                if (s === 'review' && pages.length > 0) setStep('review');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                step === s
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {idx + 1}. {s === 'camera' ? (isBn ? 'ক্যাপচার' : 'Capture') : s === 'crop' ? (isBn ? 'ক্রপ' : 'Crop') : s === 'filter' ? (isBn ? 'ফিল্টার' : 'Filter') : (isBn ? 'পিডিএফ' : 'PDF')}
            </button>
          ))}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-xl transition-all ml-1"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Batch Processing Overlay Modal */}
      {isBatchProcessing && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-100 space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 animate-pulse">
              <Wand2 size={32} />
            </div>
            <div>
              <h3 className="font-black text-lg text-zinc-900">
                {isBn ? "AI অটো-ড্র্যাগ ও ব্যাচ স্ক্যান চলছে" : "AI Auto-Drag & Batch Processing"}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 truncate">
                {batchProgress.filename ? `Processing: ${batchProgress.filename}` : "Analyzing document geometry..."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-zinc-600">
                <span>{isBn ? `পৃষ্ঠা ${batchProgress.current} এর ${batchProgress.total}` : `Page ${batchProgress.current} of ${batchProgress.total}`}</span>
                <span>{Math.round((batchProgress.current / (batchProgress.total || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-200">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((batchProgress.current / (batchProgress.total || 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Completed Thumbnails Strip */}
            {batchProgress.completedThumbs.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-left">
                  {isBn ? "সম্পন্ন পৃষ্ঠাগুলো:" : "Completed Pages:"}
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {batchProgress.completedThumbs.map((thumb, idx) => (
                    <div key={idx} className="relative w-14 h-18 rounded-lg overflow-hidden border-2 border-emerald-500 shrink-0 shadow-sm animate-in zoom-in-95">
                      <img src={thumb} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-mono text-center">
                        #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 1: LIVE CAMERA CAPTURE OR MULTI-FILE UPLOAD               */}
      {/* ============================================================== */}
      {step === 'camera' && (
        <div className="space-y-6">
          {/* Multi-File Upload & AI Batch Scan Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverBatch(true);
            }}
            onDragLeave={() => setIsDragOverBatch(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverBatch(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                processMultipleFiles(e.dataTransfer.files);
              }
            }}
            className={`p-6 rounded-3xl border-2 border-dashed transition-all text-center relative overflow-hidden ${
              isDragOverBatch
                ? "border-emerald-500 bg-emerald-50/80 scale-[1.01]"
                : "border-zinc-200 bg-gradient-to-b from-zinc-50 to-white hover:border-emerald-400"
            }`}
          >
            <div className="max-w-xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                <Sparkles size={13} className="text-emerald-600" />
                <span>{isBn ? "এআই অটো-ড্র্যাগ ও মাল্টিপল ফাইল স্ক্যান" : "AI Auto-Drag & Multi-File Batch Scan"}</span>
              </div>
              <h3 className="font-black text-zinc-900 text-base sm:text-lg">
                {isBn ? "একসাথে একাধিক ডকুমেন্ট ফাইল আপলোড করুন" : "Upload Multiple Documents at Once"}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-md mx-auto">
                {isBn
                  ? "ছবিগুলো সিলেক্ট বা ড্রপ করুন। আমাদের AI স্বয়ংক্রিয়ভাবে ৪টি কর্নার শনাক্ত করে বর্ডার এডজাস্ট করবে এবং এক ক্লিকে মাল্টি-পেজ PDF তৈরি করবে।"
                  : "Select or drop multiple document images (JPG, PNG, WebP) or PDFs. AI will automatically detect all 4 corners, auto-drag borders, flatten perspective, and compile your multi-page PDF."}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => multiFileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  <FolderUp size={16} />
                  <span>{isBn ? "একাধিক ফাইল সিলেক্ট করুন (Batch Scan)" : "Select Multiple Files (AI Batch Scan)"}</span>
                </button>
                <input
                  ref={multiFileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(e) => e.target.files && processMultipleFiles(e.target.files)}
                  className="hidden"
                />

                <span className="text-xs text-zinc-400 font-bold uppercase">{isBn ? "অথবা" : "or"}</span>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Upload size={15} />
                  <span>{isBn ? "একটি ফাইল আপলোড" : "Single File"}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Camera View Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <Camera size={13} /> {isBn ? "লাইভ ক্যামেরা স্ক্যান" : "Live Camera Scan"}
            </span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-black aspect-[3/4] sm:aspect-[4/3] max-h-[520px] flex items-center justify-center shadow-inner">
            {/* Live Video Element */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
            />

            {/* Camera Overlay Guide Box */}
            {isCameraActive && (
              <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-4 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                <span className="text-[11px] font-mono font-bold text-white bg-black/60 px-2.5 py-1 rounded-md self-center">
                  {isBn ? "ডকুমেন্টটি ফ্রেমের ভেতর রাখুন" : "Align document inside frame"}
                </span>
                <span className="text-[10px] text-zinc-300 self-center bg-black/60 px-2 py-0.5 rounded">
                  {pages.length > 0 ? `${pages.length} ${isBn ? 'টি পেজ স্ক্যান করা হয়েছে' : 'page(s) scanned'}` : ''}
                </span>
              </div>
            )}

            {/* Error or Fallback Message */}
            {!isCameraActive && (
              <div className="p-6 text-center space-y-3 text-white max-w-sm">
                <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                  <Camera size={28} />
                </div>
                <h4 className="font-bold text-sm">
                  {isBn ? "ক্যামেরা চালু করা হয়নি" : "Camera Inactive"}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {cameraError || (isBn ? "ক্যামেরা পারমিশন দিন অথবা উপরের ফাইল আপলোড ব্যবহার করুন।" : "Allow camera permission or use the file upload above.")}
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <RefreshCw size={14} />
                  <span>{isBn ? "ক্যামেরা চালু করুন" : "Start Camera"}</span>
                </button>
              </div>
            )}

            {/* Top Toolbar: Flash, Flip & Exit */}
            {isCameraActive && (
              <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                {hasTorch ? (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`p-3 rounded-2xl backdrop-blur-md transition-all ${
                      isTorchOn ? "bg-amber-400 text-zinc-950 font-bold" : "bg-black/50 text-white"
                    }`}
                    title={isBn ? "টর্চ অন/অফ" : "Toggle Flashlight"}
                  >
                    {isTorchOn ? <Zap size={18} /> : <ZapOff size={18} />}
                  </button>
                ) : <div />}

                <button
                  type="button"
                  onClick={switchCamera}
                  className="p-3 bg-black/50 text-white rounded-2xl backdrop-blur-md hover:bg-black/70 transition-all"
                  title={isBn ? "ক্যামেরা বদলান" : "Switch Camera"}
                >
                  <RotateCw size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Bottom Controls: Shutter Button, File Pick & Gallery */}
          <div className="flex items-center justify-around p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
            {/* Gallery Upload Button */}
            <label className="flex flex-col items-center gap-1 text-zinc-600 hover:text-emerald-700 cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-300 flex items-center justify-center shadow-sm">
                <Upload size={20} className="text-zinc-700" />
              </div>
              <span className="text-[11px] font-bold">{isBn ? "ফাইল আপলোড" : "Upload File"}</span>
            </label>

            {/* Big Shutter Capture Button */}
            <button
              type="button"
              onClick={handleCapture}
              disabled={!isCameraActive}
              className="w-18 h-18 rounded-full border-4 border-emerald-500 bg-white hover:bg-emerald-50 p-1 flex items-center justify-center shadow-lg transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
              title={isBn ? "ছবি তুলুন" : "Capture Page"}
            >
              <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-inner">
                <Camera size={26} />
              </div>
            </button>

            {/* Done / Review Button if pages exist */}
            {pages.length > 0 ? (
              <button
                type="button"
                onClick={() => setStep('review')}
                className="flex flex-col items-center gap-1 text-emerald-700 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md font-black text-sm">
                  {pages.length}
                </div>
                <span className="text-[11px] font-bold">{isBn ? "রিভিউ করুন" : "Review PDF"}</span>
              </button>
            ) : (
              <div className="w-12 h-12" />
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: CROP & PERSPECTIVE ADJUSTMENT (AUTO-DRAG & SNAP)       */}
      {/* ============================================================== */}
      {step === 'crop' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
            <div className="space-y-0.5">
              <p className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                <Move size={14} className="text-emerald-600" />
                <span>{isBn ? "কর্নার ও বর্ডার অ্যাডজাস্ট করুন:" : "Adjust Document Borders:"}</span>
              </p>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                {isBn
                  ? "৪টি কর্নার পিন বা ধারের মিডপয়েন্ট হ্যান্ডেল (↕ ↔) ড্র্যাগ করুন।"
                  : "Drag the 4 corner pins or edge midpoint handles (↕ ↔) to fit your document."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoDragCorners}
                disabled={isAutoDragging}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm ${
                  isAutoDragging
                    ? "bg-amber-100 text-amber-900 animate-pulse cursor-wait"
                    : "bg-gradient-to-r from-amber-500 to-emerald-600 text-white hover:brightness-110 active:scale-95"
                }`}
                title={isBn ? "AI দিয়ে স্বয়ংক্রিয়ভাবে কর্নার অ্যাডজাস্ট করুন" : "Auto-drag corners to detected document edges"}
              >
                <Sparkles size={13} className={isAutoDragging ? "animate-spin" : ""} />
                <span>{isAutoDragging ? (isBn ? "অটো-ড্র্যাগ হচ্ছে..." : "Auto-Dragging...") : (isBn ? "AI অটো-ড্র্যাগ কর্নার" : "AI Auto-Drag Corners")}</span>
              </button>

              <button
                type="button"
                onClick={() => setMagneticSnap(!magneticSnap)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                  magneticSnap
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-zinc-100 text-zinc-500 border-zinc-200"
                }`}
                title={isBn ? "ম্যাগনেটিক বর্ডার স্ন্যাপ অন/অফ" : "Toggle Magnetic Border Snap"}
              >
                <Magnet size={13} />
                <span>{magneticSnap ? "Snap ON" : "Snap OFF"}</span>
              </button>

              <button
                type="button"
                onClick={handleResetCrop}
                className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-all"
                title={isBn ? "সম্পূর্ণ ছবিতে রিসেট" : "Reset to full bounds"}
              >
                {isBn ? "রিসেট" : "Reset"}
              </button>
            </div>
          </div>

          {/* Interactive Touch/Mouse Canvas */}
          <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-200 shadow-md touch-none select-none max-h-[560px] flex items-center justify-center">
            <canvas
              ref={cropCanvasRef}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className="max-w-full max-h-[560px] object-contain cursor-crosshair"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep('camera')}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <ChevronLeft size={16} />
              <span>{isBn ? "পুনরায় ছবি তুলুন" : "Retake"}</span>
            </button>

            <button
              type="button"
              onClick={applyCropAndWarp}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md active:scale-95"
            >
              <span>{isBn ? "ক্রপ ও সোজা করুন" : "Apply & Flatten"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: ENHANCEMENT FILTERS & CONTRAST                         */}
      {/* ============================================================== */}
      {step === 'filter' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Enhanced Preview Canvas */}
          <div className="relative rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-md max-h-[500px] flex items-center justify-center p-2">
            <canvas
              ref={filterPreviewCanvasRef}
              className="max-w-full max-h-[480px] object-contain shadow-sm rounded-lg"
            />
          </div>

          {/* Preset Filter Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-black text-zinc-700 uppercase tracking-wider">
              {isBn ? "ডকুমেন্ট ফিল্টার নির্বাচন করুন:" : "Enhancement Filter:"}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'magic_color', label: isBn ? 'ম্যাজিক কালার' : 'Magic Color', badge: isBn ? 'জনপ্রিয়' : 'Best' },
                { id: 'bw', label: isBn ? 'ক্লিন B&W' : 'Crisp B&W', badge: isBn ? 'টেক্সট' : 'Text' },
                { id: 'grayscale', label: isBn ? 'গ্রেস্কেল' : 'Grayscale' },
                { id: 'vibrant', label: isBn ? 'উজ্জ্বল' : 'Vibrant' },
                { id: 'original', label: isBn ? 'আসল' : 'Original' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id as FilterType)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    activeFilter === f.id
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  <span>{f.label}</span>
                  {f.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-200 text-emerald-900 font-black rounded-md">
                      {f.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders: Brightness, Contrast & Rotation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold text-zinc-700">
                <span className="flex items-center gap-1">
                  <Sun size={14} className="text-amber-500" />
                  <span>{isBn ? "উজ্জ্বলতা (Brightness):" : "Brightness:"}</span>
                </span>
                <span className="font-mono">{brightness}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold text-zinc-700">
                <span className="flex items-center gap-1">
                  <Contrast size={14} className="text-indigo-500" />
                  <span>{isBn ? "কনট্রাস্ট (Contrast):" : "Contrast:"}</span>
                </span>
                <span className="font-mono">{contrast}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRotateCurrent(90)}
                className="p-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-700 transition-all font-bold text-xs flex items-center gap-1.5"
                title={isBn ? "ঘড়ির কাঁটার দিকে ঘোরান" : "Rotate 90°"}
              >
                <RotateCw size={14} />
                <span>90°</span>
              </button>
              <button
                type="button"
                onClick={handleFlipCurrent}
                className="p-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-700 transition-all font-bold text-xs flex items-center gap-1.5"
                title={isBn ? "ফ্লিপ করুন" : "Flip Horizontal"}
              >
                <FlipHorizontal size={14} />
                <span>{isBn ? "ফ্লিপ" : "Flip"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('crop')}
                className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all"
              >
                {isBn ? "ক্রপে ফেরত" : "Back to Crop"}
              </button>
              <button
                type="button"
                onClick={saveCurrentPage}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Check size={16} />
                <span>{isBn ? "পৃষ্ঠা সেভ করুন" : "Save Page"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 4: MULTI-PAGE REVIEW & PDF EXPORT                         */}
      {/* ============================================================== */}
      {step === 'review' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Thumbnail Strip & Page Actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-zinc-700">
              <span>
                {isBn ? `স্ক্যানকৃত পৃষ্ঠাসমূহ (${pages.length} টি):` : `Scanned Pages (${pages.length}):`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => multiFileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:brightness-105 transition-all flex items-center gap-1.5 font-bold shadow-sm active:scale-95"
                >
                  <FolderUp size={14} />
                  <span>{isBn ? "ব্যাচ ফাইল আপলোড" : "Batch Upload"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep('camera')}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all flex items-center gap-1.5 font-bold"
                >
                  <Plus size={14} />
                  <span>{isBn ? "ক্যামেরা" : "Camera"}</span>
                </button>
              </div>
            </div>

            {/* Horizontal Thumbnails List */}
            <div className="flex gap-3 overflow-x-auto p-2 bg-zinc-50 rounded-2xl border border-zinc-200">
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setActivePageIndex(idx)}
                  className={`relative shrink-0 w-24 sm:w-28 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    activePageIndex === idx
                      ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                      : "border-zinc-200 hover:border-zinc-300 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={p.processedCanvas.toDataURL('image/jpeg', 0.6)}
                    alt={`Page ${idx + 1}`}
                    className="w-full aspect-[3/4] object-cover bg-white"
                  />
                  <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.2 rounded font-bold">
                    P{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Page Large View & Management Controls */}
          {pages[activePageIndex] && (
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                <span>{isBn ? `পৃষ্ঠা ${activePageIndex + 1} এর প্রিভিউ:` : `Previewing Page ${activePageIndex + 1}:`}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={activePageIndex === 0}
                    onClick={() => handleMovePage(activePageIndex, -1)}
                    className="p-1.5 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-100 disabled:opacity-40 transition-all"
                    title={isBn ? "বামে সরান" : "Move Left"}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={activePageIndex === pages.length - 1}
                    onClick={() => handleMovePage(activePageIndex, 1)}
                    className="p-1.5 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-100 disabled:opacity-40 transition-all"
                    title={isBn ? "ডানে সরান" : "Move Right"}
                  >
                    <ChevronRight size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditPage(activePageIndex)}
                    className="px-2.5 py-1.5 bg-white border border-zinc-300 text-zinc-800 rounded-lg hover:bg-zinc-100 transition-all flex items-center gap-1 text-[11px]"
                  >
                    <Crop size={13} />
                    <span>{isBn ? "পুনরায় ক্রপ" : "Re-Crop"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePage(activePageIndex)}
                    className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all"
                    title={isBn ? "মুছে ফেলুন" : "Delete Page"}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="max-h-[380px] overflow-hidden rounded-xl bg-white border border-zinc-200 flex items-center justify-center p-2 shadow-xs">
                <img
                  src={pages[activePageIndex].processedCanvas.toDataURL('image/jpeg', 0.85)}
                  alt="Current Page"
                  className="max-h-[360px] object-contain shadow-xs rounded"
                />
              </div>
            </div>
          )}

          {/* PDF Settings Grid */}
          <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4">
            <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={15} className="text-emerald-600" />
              <span>{isBn ? "পিডিএফ কনফিগারেশন ও এক্সপোর্ট সেটিংস:" : "PDF Configuration & Export:"}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Page Size */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-700">{isBn ? "পৃষ্ঠার মাপ (Page Size):" : "Page Size:"}</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as PageSizeOption)}
                  className="w-full p-2 bg-white border border-zinc-300 rounded-xl font-bold focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="LETTER">US Letter (8.5 × 11 in)</option>
                  <option value="FIT">{isBn ? "ছবির মাপে ফিট (Fit to Image)" : "Fit to Image"}</option>
                </select>
              </div>

              {/* Orientation */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-700">{isBn ? "দিকবিন্যাস (Orientation):" : "Orientation:"}</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as PageOrientation)}
                  className="w-full p-2 bg-white border border-zinc-300 rounded-xl font-bold focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="auto">{isBn ? "স্বয়ংক্রিয় (Auto)" : "Auto"}</option>
                  <option value="portrait">{isBn ? "লম্বালম্বি (Portrait)" : "Portrait"}</option>
                  <option value="landscape">{isBn ? "আড়াআড়ি (Landscape)" : "Landscape"}</option>
                </select>
              </div>

              {/* Compression Quality */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-700">{isBn ? "ফাইলের মান (Quality):" : "Quality Preset:"}</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as QualityPreset)}
                  className="w-full p-2 bg-white border border-zinc-300 rounded-xl font-bold focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="balanced">{isBn ? "ভারসাম্যপূর্ণ (~৭০০ KB/doc)" : "Balanced (~700 KB/doc)"}</option>
                  <option value="small">{isBn ? "ছোট সাইজ (~৩০০ KB/doc)" : "Small Size (~300 KB/doc)"}</option>
                  <option value="high">{isBn ? "সর্বোচ্চ রেজোলিউশন (~২ MB/doc)" : "High Res (~2 MB/doc)"}</option>
                </select>
              </div>
            </div>

            {/* Custom Filename */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-zinc-700">{isBn ? "পিডিএফ ফাইলের নাম:" : "PDF File Name:"}</label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full p-2 bg-white border border-zinc-300 rounded-xl font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                placeholder="VATX_Document"
              />
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
            <span className="leading-relaxed font-medium">
              {isBn
                ? "১০০% ক্লায়েন্ট-সাইড প্রসেসিং — আপনার ছবি বা ডকুমেন্ট আপনার ডিভাইস ছেড়ে কোথাও যাবে না, সম্পূর্ণ অফলাইনে নিরাপদে পিডিএফ তৈরি হয়।"
                : "100% Client-Side Processing — Documents never leave your device unless you explicitly click 'Upload to Server'."}
            </span>
          </div>

          {/* Upload Status Feedback */}
          {uploadStatus && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
              <span>{uploadStatus}</span>
            </div>
          )}

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep('camera')}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>{isBn ? "আরও স্ক্যান করুন" : "Scan Another Page"}</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleShareMobile}
                  disabled={isExporting}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Share2 size={15} />
                  <span>{isBn ? "শেয়ার করুন" : "Share"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleUploadToBackend}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <CloudUpload size={15} />
                <span>{isBn ? "সার্ভারে সেভ করুন" : "Upload to Server"}</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>{isBn ? "তৈরি হচ্ছে..." : "Generating..."}</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>{isBn ? `ডাউনলোড PDF (${pages.length} পৃষ্ঠা)` : `Download PDF (${pages.length} pgs)`}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { 
  FileText, 
  Upload, 
  Copy, 
  Check, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Cpu, 
  AlertCircle, 
  Layers, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Clock, 
  FileCheck,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface OcrToolProps {
  language?: 'en' | 'bn';
}

type OcrEngineMode = 'standard' | 'enhanced';

export default function OcrTool({ language = 'bn' }: OcrToolProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [preprocessedUrl, setPreprocessedUrl] = useState<string | null>(null);
  const [showPreprocessed, setShowPreprocessed] = useState<boolean>(false);
  
  const [engineMode, setEngineMode] = useState<OcrEngineMode>('standard');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  const [extractedText, setExtractedText] = useState<string>('');
  const [activeEngineUsed, setActiveEngineUsed] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preprocess image on HTML Canvas: Grayscale + High Contrast for enhanced Bengali script accuracy
  const preprocessImage = useCallback(async (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(imageSrc);
            return;
          }

          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          // Contrast multiplier factor (contrast value = 50)
          const contrast = 50;
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

          for (let i = 0; i < data.length; i += 4) {
            // Perceptual Luminance formula for Bengali handwriting & print ink
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            
            // Contrast stretching
            const contrasted = factor * (gray - 128) + 128;
            const clamped = Math.min(255, Math.max(0, contrasted));

            data[i] = clamped;     // Red
            data[i + 1] = clamped; // Green
            data[i + 2] = clamped; // Blue
          }

          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          console.warn('Canvas preprocessing fallback:', e);
          resolve(imageSrc);
        }
      };
      img.onerror = () => resolve(imageSrc);
      img.src = imageSrc;
    });
  }, []);

  // Handle file selection & validation
  const handleFileChange = useCallback(async (file: File) => {
    setErrorMessage(null);
    setWarningMessage(null);
    setExtractedText('');
    setActiveEngineUsed(null);
    setProgress(0);
    setStatusMessage('');

    // Check mime type (jpg, png, webp)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(
        language === 'bn' 
          ? 'শুধুমাত্র ছবি ফাইল (JPG, PNG বা WebP) সমর্থন করে।' 
          : 'Only image files (JPG, PNG or WebP) are supported.'
      );
      return;
    }

    // 5MB Limit check
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage(
        language === 'bn'
          ? 'ছবির সাইজ ৫ মেগাবাইট (5MB)-এর বেশি। অনুগ্রহ করে ৫MB-এর নিচে সাইজের ছবি দিন।'
          : 'File size exceeds 5MB. Please upload an image under 5MB.'
      );
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Generate preprocessed version asynchronously
    try {
      const processed = await preprocessImage(objectUrl);
      setPreprocessedUrl(processed);
    } catch {
      setPreprocessedUrl(objectUrl);
    }
  }, [language, preprocessImage]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Run Client-Side Tesseract OCR
  const runTesseractOcr = async (imageInput: string): Promise<string> => {
    setStatusMessage(
      language === 'bn' 
        ? 'ব্রাউজারে Tesseract ওসিআর ইঞ্জিন লোড হচ্ছে (বাংলা + ইংরেজি)...' 
        : 'Loading Tesseract engine in browser (Bangla + English)...'
    );
    setProgress(15);

    const result = await Tesseract.recognize(
      imageInput,
      'ben+eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round((m.progress || 0) * 100);
            setProgress(Math.max(15, pct));
            setStatusMessage(
              language === 'bn'
                ? `টেক্সট শনাক্তকরণ চলছে (${pct}%)...`
                : `Recognizing text (${pct}%)...`
            );
          } else if (m.status === 'loading tesseract core') {
            setProgress(25);
            setStatusMessage(language === 'bn' ? 'ওসিআর কোর ইঞ্জিন চালু হচ্ছে...' : 'Initializing OCR core...');
          } else if (m.status === 'loading language traineddata') {
            setProgress(40);
            setStatusMessage(language === 'bn' ? 'বাংলা ও ইংরেজি ভাষা ডাটা লোড হচ্ছে...' : 'Loading language models...');
          }
        }
      }
    );

    setProgress(100);
    return result.data.text || '';
  };

  // Main OCR Execution Handler
  const handleStartOcr = async () => {
    if (!selectedFile || !previewUrl) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে প্রথমে একটি ছবি আপলোড করুন।'
          : 'Please select or upload an image first.'
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setWarningMessage(null);
    setProgress(5);
    setStatusMessage(language === 'bn' ? 'ছবি প্রিপ্রসেস করা হচ্ছে...' : 'Preprocessing image in canvas...');

    // Always use preprocessed image if available for better OCR contrast
    const targetPreprocessed = preprocessedUrl || (await preprocessImage(previewUrl));

    if (engineMode === 'enhanced') {
      // Enhanced OCR (AI: Gemini 2.5 Flash via /api/ocr)
      setStatusMessage(
        language === 'bn' 
          ? 'এআই ভিশন ইঞ্জিনের (Gemini 2.5 Flash) কাছে পাঠানো হচ্ছে...' 
          : 'Sending to Enhanced AI OCR (Gemini 2.5 Flash)...'
      );
      setProgress(30);

      try {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success && data.text) {
          setProgress(100);
          setStatusMessage(language === 'bn' ? 'এআই ওসিআর সফলভাবে সম্পন্ন!' : 'AI OCR completed successfully!');
          setExtractedText(data.text);
          setActiveEngineUsed('Enhanced (Gemini 2.5 Flash)');
          setIsProcessing(false);
          return;
        } else {
          // Rate limit reached (429) or other AI server failure:
          // Requirement 6: "If the limit is hit or the call fails, show a friendly Bengali message and automatically fall back to Tesseract."
          const friendlyMessage = data?.limitExceeded || response.status === 429
            ? (language === 'bn'
                ? '⚠️ এআই ওসিআরের দৈনিক লিমিট (১০ বার) শেষ হয়েছে। স্বয়ংক্রিয়ভাবে ক্লায়েন্ট-সাইড ফ্রি স্ট্যান্ডার্ড ওসিআর (Tesseract) দিয়ে রূপান্তর করা হচ্ছে...'
                : '⚠️ Daily AI OCR quota reached (10/day). Automatically falling back to Free Standard OCR (Tesseract)...')
            : (language === 'bn'
                ? `⚠️ এআই সার্ভার সাড়া দেয়নি (${data?.error || 'ব্যর্থতা'})। ফ্রি স্ট্যান্ডার্ড ওসিআরে স্বয়ংক্রিয়ভাবে রূপান্তর করা হচ্ছে...`
                : `⚠️ AI OCR failed (${data?.error || 'error'}). Automatically falling back to Standard OCR...`);

          setWarningMessage(friendlyMessage);
          // Fall back to Tesseract
          const fallbackText = await runTesseractOcr(targetPreprocessed);
          setExtractedText(fallbackText);
          setActiveEngineUsed('Standard Tesseract.js (Auto Fallback)');
          setStatusMessage(
            language === 'bn' 
              ? 'স্ট্যান্ডার্ড ওসিআরের মাধ্যমে রূপান্তর সম্পন্ন হয়েছে!' 
              : 'Completed via Standard OCR fallback!'
          );
        }
      } catch (err: any) {
        console.warn('AI OCR call error, falling back to Tesseract:', err);
        setWarningMessage(
          language === 'bn'
            ? '⚠️ এআই রিকোয়েস্ট ব্যর্থ হয়েছে। স্বয়ংক্রিয়ভাবে ক্লায়েন্ট-সাইড ফ্রি ওসিআর (Tesseract) দিয়ে রূপান্তর করা হচ্ছে...'
            : '⚠️ AI call failed. Automatically falling back to client-side Standard OCR...'
        );

        // Fall back to Tesseract
        try {
          const fallbackText = await runTesseractOcr(targetPreprocessed);
          setExtractedText(fallbackText);
          setActiveEngineUsed('Standard Tesseract.js (Auto Fallback)');
          setStatusMessage(
            language === 'bn' 
              ? 'স্ট্যান্ডার্ড ওসিআরের মাধ্যমে রূপান্তর সম্পন্ন হয়েছে!' 
              : 'Completed via Standard OCR fallback!'
          );
        } catch (tessErr: any) {
          setErrorMessage(
            language === 'bn'
              ? `ওসিআর ব্যর্থ হয়েছে: ${tessErr.message || 'অপ্রত্যাশিত সমস্যা'}`
              : `OCR failed: ${tessErr.message || 'Unexpected error'}`
          );
        }
      }
    } else {
      // Standard OCR (Tesseract.js in browser with ben+eng)
      try {
        const text = await runTesseractOcr(targetPreprocessed);
        setExtractedText(text);
        setActiveEngineUsed('Standard Tesseract.js (Client-Side, ben+eng)');
        setStatusMessage(
          language === 'bn' 
            ? 'ওসিআর সফলভাবে সম্পন্ন হয়েছে!' 
            : 'OCR completed successfully!'
        );
      } catch (err: any) {
        console.error('Tesseract Error:', err);
        setErrorMessage(
          language === 'bn'
            ? `ওসিআর ব্যর্থ হয়েছে: ${err.message || 'টেক্সট পড়া সম্ভব হয়নি'}`
            : `OCR recognition failed: ${err.message || 'Unable to recognize text'}`
        );
      }
    }

    setIsProcessing(false);
  };

  // Copy to clipboard
  const handleCopyText = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = extractedText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Download as .txt file
  const handleDownloadTxt = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = selectedFile?.name ? selectedFile.name.replace(/\.[^/.]+$/, "") : 'ocr_extracted';
    link.download = `${baseName}_bangla_ocr.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset tool
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPreprocessedUrl(null);
    setShowPreprocessed(false);
    setExtractedText('');
    setActiveEngineUsed(null);
    setErrorMessage(null);
    setWarningMessage(null);
    setProgress(0);
    setStatusMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const charCount = extractedText.length;
  const wordCount = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
  const lineCount = extractedText ? extractedText.split('\n').length : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <Zap size={14} className="animate-pulse" />
              {language === 'bn' ? 'সম্পূর্ণ ফ্রি বাংলা ও ইংরেজি ওসিআর' : 'Free Bengali & English OCR'}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <FileText className="text-emerald-400" size={32} />
              {language === 'bn' ? 'বাংলা ওসিআর রূপান্তরকারী (OCR Tool)' : 'Bengali OCR Digitizer'}
            </h1>
            <p className="text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              {language === 'bn'
                ? 'কাগজের চালান, ভ্যাট রসিদ, ট্যাক্স ডকুমেন্ট বা যেকোনো বাংলা ও ইংরেজি ছবি আপলোড করে মুহূর্তেই ডিজিটাল টেক্সটে রূপান্তর করুন। ক্লায়েন্ট-সাইড ব্রাউজার প্রসেসিং—সম্পূর্ণ নিরাপদ ও ফ্রি।'
                : 'Convert scanned receipts, tax certificates, challans, or documents in Bengali and English into editable digital text. Zero server cost, unlimited, and 100% private.'}
            </p>
          </div>

          {/* Engine Selector Toggle */}
          <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 flex flex-col sm:flex-row gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setEngineMode('standard')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                engineMode === 'standard'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-zinc-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu size={16} />
              <span>{language === 'bn' ? 'স্ট্যান্ডার্ড (ফ্রি, আনলিমিটেড)' : 'Standard (Free, unlimited)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setEngineMode('enhanced')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                engineMode === 'enhanced'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={16} className="text-amber-300" />
              <span>{language === 'bn' ? 'এনহ্যান্সড (এআই, সীমিত)' : 'Enhanced (AI, limited)'}</span>
            </button>
          </div>
        </div>

        {/* Engine Explanation Sub-bar */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-emerald-200/80 gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>
              {engineMode === 'standard'
                ? (language === 'bn' 
                    ? 'বর্তমান ইঞ্জিন: Tesseract.js (বাংলা + ইংরেজি) — সরাসরি ব্রাউজারে চলবে, কোনো সার্ভার খরচ নেই।' 
                    : 'Active Engine: Tesseract.js (ben+eng) — Runs client-side in browser, zero server cost.')
                : (language === 'bn'
                    ? 'বর্তমান ইঞ্জিন: Gemini 2.5 Flash এআই (প্রতি আইপিতে দৈনিক সর্বোচ্চ ১০ বার, শেষ হলে অটো-ফলব্যাক)।'
                    : 'Active Engine: Gemini 2.5 Flash AI (Max 10 calls/IP/day, automatic Tesseract fallback).')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>{language === 'bn' ? 'ক্যানভাস প্রিপ্রসেসিং সক্রিয় (গ্রেস্কেল + হাই কনট্রাস্ট)' : 'Canvas Grayscale & Contrast Active'}</span>
          </div>
        </div>
      </div>

      {/* Warnings & Notices */}
      {warningMessage && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-sm shadow-sm animate-fadeIn">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">{language === 'bn' ? 'বিজ্ঞপ্তি / স্বয়ংক্রিয় পরিবর্তন:' : 'Notice / Automatic Fallback:'}</p>
            <p className="text-xs text-amber-800 mt-0.5">{warningMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900 text-sm shadow-sm animate-fadeIn">
          <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">{language === 'bn' ? 'সমস্যা হয়েছে:' : 'Error:'}</p>
            <p className="text-xs text-rose-800 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-zinc-900 text-base flex items-center gap-2">
                <Upload size={18} className="text-emerald-600" />
                {language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image'}
              </h3>
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold text-zinc-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={14} />
                  {language === 'bn' ? 'নতুন ছবি' : 'Reset'}
                </button>
              )}
            </div>

            {/* Drag & Drop Area */}
            {!previewUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                    : 'border-zinc-300 hover:border-emerald-400 hover:bg-zinc-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                  <Upload size={28} />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-zinc-800 text-sm">
                    {language === 'bn' ? 'এখানে ছবি ড্র্যাগ করুন বা ক্লিক করুন' : 'Drag & drop image here or click'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {language === 'bn' ? 'সমর্থিত ফরম্যাট: JPG, PNG, WebP (সর্বোচ্চ ৫ মেগাবাইট)' : 'Supports JPG, PNG, WebP (Max 5MB)'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-[11px] font-bold text-zinc-600">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  {language === 'bn' ? '১০০% ব্রাউজার প্রসেসিং ও সুরক্ষিত' : 'Private & Processed in Browser'}
                </div>
              </div>
            ) : (
              /* Image Preview Area */
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-950 aspect-[4/3] flex items-center justify-center group">
                  <img
                    src={showPreprocessed && preprocessedUrl ? preprocessedUrl : previewUrl}
                    alt="Document Preview"
                    className="max-h-full max-w-full object-contain"
                  />

                  {/* Preprocessed View Toggle Overlay */}
                  {preprocessedUrl && (
                    <button
                      type="button"
                      onClick={() => setShowPreprocessed(!showPreprocessed)}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-zinc-900/80 backdrop-blur-md text-white text-xs font-bold border border-white/20 hover:bg-zinc-800 flex items-center gap-1.5 shadow-lg transition-all"
                      title={language === 'bn' ? 'প্রি-প্রসেসড ক্যানভাস রূপান্তর দেখুন' : 'Toggle canvas preprocessed image'}
                    >
                      {showPreprocessed ? <EyeOff size={14} /> : <Eye size={14} />}
                      <span>{showPreprocessed ? (language === 'bn' ? 'মূল ছবি' : 'Original') : (language === 'bn' ? 'ক্যানভাস প্রিপ্রসেসড' : 'Preprocessed')}</span>
                    </button>
                  )}

                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-[11px] font-bold text-white flex items-center gap-1.5">
                    <FileCheck size={12} className="text-emerald-400" />
                    <span>{showPreprocessed ? (language === 'bn' ? 'গ্রেস্কেল ও হাই-কনট্রাস্ট' : 'Grayscale + Contrast') : (language === 'bn' ? 'মূল ছবি' : 'Original Image')}</span>
                  </div>
                </div>

                {/* File Details */}
                {selectedFile && (
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/70 flex items-center justify-between text-xs text-zinc-600">
                    <div className="truncate max-w-[200px]">
                      <span className="font-bold text-zinc-800 truncate block">{selectedFile.name}</span>
                      <span className="text-[11px] text-zinc-400">{(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'image'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-emerald-700 hover:text-emerald-800 font-bold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
                    >
                      {language === 'bn' ? 'ছবি পরিবর্তন' : 'Change'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                )}

                {/* Start OCR Button */}
                <button
                  type="button"
                  onClick={handleStartOcr}
                  disabled={isProcessing}
                  className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                    isProcessing
                      ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                      : engineMode === 'enhanced'
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:scale-[1.01]'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 hover:scale-[1.01]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-700 rounded-full animate-spin" />
                      <span>{language === 'bn' ? 'ওসিআর প্রক্রিয়াধীন...' : 'Processing OCR...'}</span>
                    </>
                  ) : (
                    <>
                      {engineMode === 'enhanced' ? <Sparkles size={18} /> : <Cpu size={18} />}
                      <span>
                        {language === 'bn'
                          ? `${engineMode === 'enhanced' ? 'এআই দিয়ে' : 'স্ট্যান্ডার্ড ফ্রি'} ওসিআর শুরু করুন`
                          : `Start ${engineMode === 'enhanced' ? 'Enhanced AI' : 'Standard Free'} OCR`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Quick Guide & Features Card */}
          <div className="bg-emerald-50/60 rounded-3xl p-5 border border-emerald-100 space-y-3">
            <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-2">
              <Info size={16} className="text-emerald-600" />
              {language === 'bn' ? 'বাংলা ওসিআরের বৈশিষ্ট্য ও সুবিধা' : 'Features & Bengali Preprocessing'}
            </h4>
            <ul className="text-xs text-emerald-900 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>ক্যানভাস অপটিমাইজেশন:</strong> ওসিআর চালানোর আগে স্বয়ংক্রিয়ভাবে ছবিটিকে গ্রেস্কেল ও হাই-কনট্রাস্ট করা হয়, যা বাংলা অক্ষরের সূক্ষ্ম মাত্রা ও ফলা সহজে পড়তে সাহায্য করে।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>দ্বিভাষিক সমর্থন:</strong> বাংলা ও ইংরেজি উভয় ভাষার মিশ্র লেখা (যেমন ইনভয়েস, ভ্যাট চালান ও মেমো) একসাথে সঠিকভাবে শনাক্ত করে।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>সম্পূর্ণ আনলিমিটেড:</strong> স্ট্যান্ডার্ড মোডে ব্রাউজারে চলে, ফলে ইন্টারনেটের গতি কম থাকলেও বা কোনো সার্ভার খরচ ছাড়াই যেকোনো সময় ব্যবহারযোগ্য।</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Processing Status, Result Textarea & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm flex flex-col h-full min-h-[560px]">
            {/* Header with Title and Copy/Download Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-zinc-900 text-base">
                    {language === 'bn' ? 'শনাক্তকৃত টেক্সট ফলাফল' : 'Extracted Text Result'}
                  </h3>
                  {activeEngineUsed && (
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 font-bold text-[10px] rounded-md border border-zinc-200">
                      {activeEngineUsed}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  {language === 'bn' ? 'ফলাফলটি প্রয়োজন অনুযায়ী সম্পাদনা (Edit) করতে পারবেন।' : 'Editable text area. You can modify before copying or downloading.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyText}
                  disabled={!extractedText}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : extractedText
                        ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                        : 'bg-zinc-50 text-zinc-300 cursor-not-allowed'
                  }`}
                  title={language === 'bn' ? 'টেক্সট কপি করুন' : 'Copy text to clipboard'}
                >
                  {copied ? <Check size={14} className="text-white" /> : <Copy size={14} />}
                  <span>{copied ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'কপি করুন' : 'Copy')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  disabled={!extractedText}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    extractedText
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      : 'bg-zinc-50 text-zinc-300 cursor-not-allowed'
                  }`}
                  title={language === 'bn' ? '.txt ফাইল হিসেবে ডাউনলোড করুন' : 'Download as .txt file'}
                >
                  <Download size={14} />
                  <span>{language === 'bn' ? 'ডাউনলোড (.txt)' : 'Download as .txt'}</span>
                </button>
              </div>
            </div>

            {/* Progress Bar (while processing) */}
            {isProcessing && (
              <div className="py-4 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <Clock size={14} className="animate-spin text-emerald-600" />
                    {statusMessage || (language === 'bn' ? 'ওসিআর প্রক্রিয়াকরণ চলছে...' : 'Processing OCR...')}
                  </span>
                  <span className="text-zinc-600 font-mono">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Textarea for Output */}
            <div className="flex-1 mt-4 relative flex flex-col">
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'ছবি আপলোড করে "ওসিআর শুরু করুন" বাটনে ক্লিক করুন। এখানে শনাক্তকৃত বাংলা ও ইংরেজি টেক্সট প্রদর্শিত হবে এবং আপনি প্রয়োজনমতো এডিট করতে পারবেন...'
                    : 'Upload an image and click "Start OCR". The transcribed Bengali and English text will appear here...'
                }
                className="w-full flex-1 min-h-[360px] p-4 bg-zinc-50/60 hover:bg-zinc-50 focus:bg-white rounded-2xl border border-zinc-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono text-sm text-zinc-800 leading-relaxed resize-none outline-none"
              />

              {/* Text Statistics Footer */}
              <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between text-xs text-zinc-500 gap-2">
                <div className="flex items-center gap-4">
                  <span><strong>{charCount}</strong> {language === 'bn' ? 'বর্ণ' : 'characters'}</span>
                  <span><strong>{wordCount}</strong> {language === 'bn' ? 'শব্দ' : 'words'}</span>
                  <span><strong>{lineCount}</strong> {language === 'bn' ? 'লাইন' : 'lines'}</span>
                </div>

                {extractedText && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExtractedText('')}
                      className="text-zinc-400 hover:text-rose-600 font-bold transition-colors"
                    >
                      {language === 'bn' ? 'টেক্সট মুছুন' : 'Clear text'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

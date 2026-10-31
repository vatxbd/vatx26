import React, { useState, useEffect, useRef } from 'react';
import {
  FileCode,
  Copy,
  Check,
  ExternalLink,
  Download,
  Code,
  Sparkles,
  Upload,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  DollarSign,
  Fingerprint,
  Calendar,
  Terminal,
  HelpCircle,
  Clipboard,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
  ScanText,
  AlertTriangle,
  X,
  Search
} from 'lucide-react';
import {
  ocrImageFileClient,
  ocrPdfFileClient,
  normalizeBengaliDigits,
  LowConfidenceWord,
  OcrProgressState
} from '../utils/clientOcrEngine';
import {
  NBRDocumentData,
  ChallanEntry,
  formatNBRDate,
  parseMarkItDownToNBRData,
  generatePrivateSalaryLedgerScript,
  generateTRMSScript,
  generateUniversalETaxScript,
  SAMPLE_MAMUNUR_CERTIFICATE
} from '../utils/nbrScriptGenerator';
import { Language, translations } from '../translations';

interface NBRMarkupScriptHubProps {
  language?: Language;
  initialMarkup?: string;
  initialData?: NBRDocumentData;
  onOpenModal?: (data: NBRDocumentData) => void;
}

export const SAMPLE_MARKUP_TABLE = `# NBR Salary Tax Deduction Certificate (u/s 86 of Income Tax Act 2023)

- **Taxpayer Name**: Mamunur Rashid Rifath
- **e-TIN**: 696173907287
- **Employee ID**: 10863
- **Designation**: Corporate Account Manager
- **Employer / Depositing Authority**: Eastern Bank PLC
- **Income Year**: 2025-2026
- **Assessment Year**: 2026-2027

### Monthly Tax Deduction & Challan Schedule:

| SL | Month | Depositing Authority | Payment Doc Type | Challan Ref No | Challan Date | Deposited Amount | Claimed TDS |
|---|---|---|---|---|---|---|---|
| 1 | Jul | Eastern Bank PLC | Challan | 2526-00043326111 | 14-08-2025 | 27650502.89 | 4131.97 |
| 2 | Aug | Eastern Bank PLC | Challan | 2526-00044819203 | 12-09-2025 | 28410200.00 | 4131.97 |
| 3 | Sep | Eastern Bank PLC | Challan | 2526-00046129845 | 15-10-2025 | 27950000.50 | 4131.97 |
| 4 | Oct | Eastern Bank PLC | Challan | 2526-00047391022 | 11-11-2025 | 28100450.00 | 4131.97 |
| 5 | Nov | Eastern Bank PLC | Challan | 2526-00048821904 | 14-12-2025 | 27800000.00 | 4131.97 |
| 6 | Dec | Eastern Bank PLC | Challan | 2526-00049912033 | 13-01-2026 | 28350100.00 | 4131.97 |
`;

export default function NBRMarkupScriptHub({
  language = 'en',
  initialMarkup = '',
  initialData,
  onOpenModal
}: NBRMarkupScriptHubProps) {
  const isBn = language === 'bn';
  const t = translations[language];

  const [markupText, setMarkupText] = useState<string>(initialMarkup || '');
  const [targetPortal, setTargetPortal] = useState<'ledger' | 'trms' | 'etax'>('ledger');
  const [extractedData, setExtractedData] = useState<NBRDocumentData>(() => {
    if (initialData && (initialData.challans?.length || initialData.taxpayerName)) {
      return initialData;
    }
    return { challans: [] };
  });

  const [selectedOcrEngine, setSelectedOcrEngine] = useState<'markitdown' | 'gemini' | 'tesseract'>('markitdown');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<OcrProgressState | null>(null);
  const [lowConfidenceWords, setLowConfidenceWords] = useState<LowConfidenceWord[]>([]);
  const [lastOcrNotice, setLastOcrNotice] = useState<string | null>(null);
  const [fallbackFile, setFallbackFile] = useState<File | null>(null);
  const [canRunTesseractFallback, setCanRunTesseractFallback] = useState<boolean>(false);
  const [canRunMarkItDownFallback, setCanRunMarkItDownFallback] = useState<boolean>(false);
  const [canRunGeminiFallback, setCanRunGeminiFallback] = useState<boolean>(false);
  const [currentQuestionMarkIdx, setCurrentQuestionMarkIdx] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [copiedType, setCopiedType] = useState<'script' | 'bookmarklet' | null>(null);
  const [copiedRowIdx, setCopiedRowIdx] = useState<number | null>(null);
  const [showEasyBanglaGuide, setShowEasyBanglaGuide] = useState<boolean>(true);
  const [guideMethod, setGuideMethod] = useState<'console' | 'bookmark'>('console');
  const [copiedAllowPasting, setCopiedAllowPasting] = useState<boolean>(false);

  // Sync initial markup or data if passed
  useEffect(() => {
    if (initialMarkup && initialMarkup.trim() !== '') {
      setMarkupText(initialMarkup);
      handleParse(initialMarkup);
    }
  }, [initialMarkup]);

  useEffect(() => {
    if (initialData && (initialData.challans?.length || initialData.taxpayerName)) {
      setExtractedData(initialData);
    }
  }, [initialData]);

  // Parse markup text into authentic structured data
  // Accepts an optional normalizedText used specifically for number parsing while keeping original text intact
  const handleParse = (textToParse?: string, normalizedForParsing?: string) => {
    const text = textToParse !== undefined ? textToParse : markupText;
    if (!text || !text.trim()) {
      setExtractedData({ challans: [] });
      return;
    }

    try {
      // If a normalized copy with English digits (0-9) is provided, use that for parsing calculations & challans
      const parseTarget = normalizedForParsing || normalizeBengaliDigits(text);
      const parsed = parseMarkItDownToNBRData(parseTarget);
      setExtractedData(parsed);
    } catch (err: any) {
      console.error("Markup parsing error:", err);
    }
  };

  // Helper to extract lines containing [?]
  const getLinesWithQuestionMark = (text: string) => {
    if (!text) return [];
    const lines = text.split('\n');
    const result: { lineNumber: number; preview: string; index: number }[] = [];
    let charOffset = 0;
    lines.forEach((line, idx) => {
      if (line.includes('[?]')) {
        const lineIdxInText = charOffset + line.indexOf('[?]');
        result.push({
          lineNumber: idx + 1,
          preview: line.trim(),
          index: lineIdxInText
        });
      }
      charOffset += line.length + 1;
    });
    return result;
  };

  // Helper to jump to and highlight [?] in the textarea
  const focusAndHighlightQuestionMark = (targetIndex?: number) => {
    if (!textareaRef.current || !markupText.includes('[?]')) return;
    const matches: number[] = [];
    let pos = markupText.indexOf('[?]');
    while (pos !== -1) {
      matches.push(pos);
      pos = markupText.indexOf('[?]', pos + 3);
    }
    if (matches.length === 0) return;

    let target = matches[0];
    if (targetIndex !== undefined && matches.includes(targetIndex)) {
      target = targetIndex;
    } else {
      const nextIdx = (currentQuestionMarkIdx + 1) % matches.length;
      setCurrentQuestionMarkIdx(nextIdx);
      target = matches[nextIdx];
    }

    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(target, target + 3);
  };

  // Client-Side Tesseract OCR Fallback
  const runTesseractFallback = async (fileToProcess?: File) => {
    const file = fileToProcess || fallbackFile;
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setCanRunTesseractFallback(false);
    setCanRunMarkItDownFallback(false);
    setCanRunGeminiFallback(false);
    setLowConfidenceWords([]);

    const fileNameLower = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(fileNameLower);
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(fileNameLower);

    try {
      if (isImage) {
        setOcrProgress({
          currentPage: 1,
          totalPages: 1,
          percent: 10,
          statusText: isBn ? 'ব্রাউজারে ছবি অপ্টিমাইজেশন ও Tesseract OCR চলছে...' : 'Preprocessing image & running Tesseract OCR in browser...'
        });

        const ocrResult = await ocrImageFileClient(file, (p) => {
          setOcrProgress(p);
        });

        const rawText = ocrResult.originalText.trim();
        if (!rawText) {
          throw new Error(
            isBn
              ? 'Tesseract ছবি থেকে কোনো লেখা শনাক্ত করতে পারেনি।'
              : 'Could not extract text from this image via Tesseract.'
          );
        }

        const newMarkup = markupText && markupText.trim()
          ? `${markupText.trim()}\n\n--- [Tesseract OCR: ${file.name}] ---\n${rawText}`
          : rawText;

        const newNormalizedForParsing = markupText && markupText.trim()
          ? `${normalizeBengaliDigits(markupText.trim())}\n\n--- [Tesseract OCR: ${file.name}] ---\n${ocrResult.normalizedText}`
          : ocrResult.normalizedText;

        setMarkupText(newMarkup);
        handleParse(newMarkup, newNormalizedForParsing);

        if (ocrResult.lowConfidenceWords.length > 0) {
          setLowConfidenceWords(ocrResult.lowConfidenceWords);
        }

        setLastOcrNotice(
          isBn
            ? `Tesseract ফলব্যাক দ্বারা "${file.name}" থেকে সফলভাবে টেক্সট এক্সট্র্যাক্ট করা হয়েছে।`
            : `Extracted text via Tesseract fallback for "${file.name}".`
        );
      } else if (isPdf) {
        setOcrProgress({
          currentPage: 1,
          totalPages: 1,
          percent: 5,
          statusText: isBn ? 'পিডিএফ বিশ্লেষণ ও ব্রাউজারে Tesseract OCR চলছে...' : 'Analyzing PDF & running Tesseract OCR in browser...'
        });

        const ocrResult = await ocrPdfFileClient(file, (p) => {
          setOcrProgress(p);
        });

        const rawText = ocrResult.originalText.trim();
        if (!rawText) {
          throw new Error(
            isBn
              ? 'পিডিএফ থেকে কোনো টেক্সট বা টেবিল শনাক্ত করা সম্ভব হয়নি।'
              : 'Could not extract text from this PDF.'
          );
        }

        const newMarkup = markupText && markupText.trim()
          ? `${markupText.trim()}\n\n--- [Tesseract PDF: ${file.name}] ---\n${rawText}`
          : rawText;

        const newNormalizedForParsing = markupText && markupText.trim()
          ? `${normalizeBengaliDigits(markupText.trim())}\n\n--- [Tesseract PDF: ${file.name}] ---\n${ocrResult.normalizedText}`
          : ocrResult.normalizedText;

        setMarkupText(newMarkup);
        handleParse(newMarkup, newNormalizedForParsing);

        if (ocrResult.lowConfidenceWords.length > 0) {
          setLowConfidenceWords(ocrResult.lowConfidenceWords);
        }

        setLastOcrNotice(
          isBn
            ? `Tesseract ফলব্যাক দ্বারা "${file.name}" (${ocrResult.pagesProcessed} পৃষ্ঠা) সম্পন্ন হয়েছে।`
            : `Extracted text via Tesseract fallback for "${file.name}" (${ocrResult.pagesProcessed} pages).`
        );
      } else {
        throw new Error(
          isBn ? 'Tesseract শুধুমাত্র ছবি এবং পিডিএফ সমর্থন করে।' : 'Tesseract only supports images and PDFs.'
        );
      }
    } catch (err: any) {
      console.error("Tesseract fallback error:", err);
      setCanRunMarkItDownFallback(true);
      setCanRunGeminiFallback(true);
      setUploadError(
        err.message ||
        (isBn
          ? 'Tesseract OCR সম্পন্ন করতে ব্যর্থ হয়েছে।'
          : 'Tesseract OCR failed.')
      );
    } finally {
      setIsUploading(false);
      setOcrProgress(null);
    }
  };

  // 1. Microsoft MarkItDown OCR Engine (converts PDFs, images, DOCX, XLSX, TXT with MarkItDown + AI Vision)
  const runMarkItDownConversion = async (fileToProcess?: File) => {
    const file = fileToProcess || fallbackFile;
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setCanRunTesseractFallback(false);
    setCanRunGeminiFallback(false);
    setCanRunMarkItDownFallback(false);
    setFallbackFile(file);
    setLowConfidenceWords([]);

    try {
      setOcrProgress({
        currentPage: 1,
        totalPages: 1,
        percent: 25,
        statusText: isBn
          ? 'Microsoft MarkItDown ইঞ্জিন দিয়ে ফাইল এনকোডিং ও প্রসেসিং হচ্ছে...'
          : 'Converting document via Microsoft MarkItDown engine...'
      });

      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const res = reader.result as string;
          resolve(res.includes(',') ? res.split(',')[1] : res);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      setOcrProgress({
        currentPage: 1,
        totalPages: 1,
        percent: 65,
        statusText: isBn
          ? 'Microsoft MarkItDown ও এআই ভিশন দিয়ে আসল টেবিল ও চালান এক্সট্র্যাক্ট হচ্ছে...'
          : 'Extracting authentic tables with Microsoft MarkItDown...'
      });

      const res = await fetch('/api/markitdown/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64,
          filename: file.name,
          mimeType: file.type,
          enableAiOcr: true
        })
      });

      let json: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        json = await res.json().catch(() => null);
      } else {
        const rawText = await res.text().catch(() => '');
        try {
          json = JSON.parse(rawText);
        } catch {
          json = null;
        }
      }

      if (!res.ok || !json?.markdown) {
        setCanRunTesseractFallback(true);
        setCanRunGeminiFallback(true);
        throw new Error(
          json?.error ||
          (isBn
            ? `Microsoft MarkItDown কনভার্সন ব্যর্থ হয়েছে (কোড: ${res.status})।`
            : `Microsoft MarkItDown conversion failed (status: ${res.status}).`)
        );
      }

      const returnedMarkdown = (json.markdown || '').trim();
      const newMarkup = markupText && markupText.trim()
        ? `${markupText.trim()}\n\n--- [Microsoft MarkItDown: ${file.name}] ---\n${returnedMarkdown}`
        : returnedMarkdown;

      const newNormalizedForParsing = normalizeBengaliDigits(newMarkup);
      setMarkupText(newMarkup);
      handleParse(newMarkup, newNormalizedForParsing);

      setLastOcrNotice(
        isBn
          ? `Microsoft MarkItDown দ্বারা "${file.name}" সফলভাবে পরিচ্ছন্ন মার্কডাউন টেবিলে রূপান্তরিত হয়েছে!`
          : `Extracted clean Markdown table from "${file.name}" via Microsoft MarkItDown.`
      );
    } catch (err: any) {
      console.error("MarkItDown conversion error:", err);
      setCanRunTesseractFallback(true);
      setCanRunGeminiFallback(true);
      setUploadError(
        err.message ||
        (isBn
          ? 'Microsoft MarkItDown কনভার্সন সম্পন্ন করতে ব্যর্থ হয়েছে।'
          : 'Microsoft MarkItDown conversion failed.')
      );
    } finally {
      setIsUploading(false);
      setOcrProgress(null);
    }
  };

  // 2. Gemini 2.5 Flash AI OCR Engine (Markdown Tables)
  const runGeminiOcr = async (fileToProcess?: File) => {
    const file = fileToProcess || fallbackFile;
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(fileNameLower);
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(fileNameLower);

    // If it's a docx/xlsx, delegate to MarkItDown
    if (!isImage && !isPdf) {
      return runMarkItDownConversion(file);
    }

    setIsUploading(true);
    setUploadError(null);
    setCanRunTesseractFallback(false);
    setCanRunMarkItDownFallback(false);
    setCanRunGeminiFallback(false);
    setFallbackFile(file);
    setLowConfidenceWords([]);

    try {
      setOcrProgress({
        currentPage: 1,
        totalPages: 1,
        percent: 40,
        statusText: isBn
          ? 'Gemini 2.5 Flash এআই দিয়ে ডকুমেন্ট স্ক্যান ও মার্কডাউন টেবিল এক্সট্র্যাক্ট হচ্ছে...'
          : 'Extracting clean Markdown table with Gemini 2.5 Flash...'
      });

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ocr-markdown', {
        method: 'POST',
        body: formData
      });

      let data: any = null;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json().catch(() => null);
      } else {
        const rawText = await res.text().catch(() => '');
        try {
          data = JSON.parse(rawText);
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        const errMsg = data?.error || (
          res.status === 429
            ? (isBn
                ? 'দৈনিক এআই লিমিট শেষ হয়েছে (১৫ বার প্রতি দিন)। অনুগ্রহ করে Microsoft MarkItDown বা Tesseract OCR ব্যবহার করুন।'
                : 'Daily AI limit reached (15 requests/day). Please use Microsoft MarkItDown or Tesseract OCR.')
            : (isBn
                ? `Gemini এআই ওসিআর রিকোয়েস্ট ব্যর্থ হয়েছে (কোড: ${res.status})।`
                : `Gemini AI OCR request failed (status: ${res.status}).`)
        );
        setCanRunTesseractFallback(true);
        setCanRunMarkItDownFallback(true);
        setFallbackFile(file);
        throw new Error(errMsg);
      }

      if (!data || typeof data !== 'object') {
        setCanRunTesseractFallback(true);
        setCanRunMarkItDownFallback(true);
        setFallbackFile(file);
        throw new Error(
          isBn
            ? 'সার্ভার থেকে সঠিক ফরম্যাটে ফলাফল পাওয়া যায়নি। অনুগ্রহ করে Microsoft MarkItDown বা Tesseract ব্যবহার করুন।'
            : 'Invalid response received from OCR server. Falling back to alternative OCR engine.'
        );
      }

      const returnedMarkdown = (data.markdown || '').trim();

      if (!returnedMarkdown) {
        setCanRunTesseractFallback(true);
        setCanRunMarkItDownFallback(true);
        setFallbackFile(file);
        throw new Error(
          isBn
            ? 'ডকুমেন্ট থেকে কোনো টেক্সট বা টেবিল শনাক্ত করা সম্ভব হয়নি।'
            : 'Could not extract text or table from this document.'
        );
      }

      const newMarkup = markupText && markupText.trim()
        ? `${markupText.trim()}\n\n--- [AI OCR: ${file.name}] ---\n${returnedMarkdown}`
        : returnedMarkdown;

      const newNormalizedForParsing = normalizeBengaliDigits(newMarkup);
      setMarkupText(newMarkup);
      handleParse(newMarkup, newNormalizedForParsing);

      setLastOcrNotice(
        isBn
          ? `Gemini AI দ্বারা "${file.name}" সফলভাবে পরিষ্কার মার্কডাউন টেবিলে রূপান্তরিত হয়েছে!`
          : `Extracted clean Markdown table from "${file.name}" with Gemini AI.`
      );
    } catch (err: any) {
      console.error("Gemini OCR error:", err);
      setCanRunTesseractFallback(true);
      setCanRunMarkItDownFallback(true);
      setUploadError(
        err.message ||
        (isBn
          ? 'Gemini এআই ওসিআর সম্পন্ন করতে ব্যর্থ হয়েছে।'
          : 'Gemini AI OCR failed.')
      );
    } finally {
      setIsUploading(false);
      setOcrProgress(null);
    }
  };

  // Primary File Upload Router based on user-selected engine
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error & states
    setUploadError(null);
    setCanRunTesseractFallback(false);
    setCanRunMarkItDownFallback(false);
    setCanRunGeminiFallback(false);
    setFallbackFile(file);
    setOcrProgress(null);
    setLowConfidenceWords([]);
    setLastOcrNotice(null);

    // File validation: Size limit (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError(
        isBn
          ? 'ফাইলের সাইজ অনেক বড় (১০ মেগাবাইটের বেশি)। অনুগ্রহ করে ১০MB এর ছোট ফাইল নির্বাচন করুন।'
          : 'File size is too large (exceeds 10MB). Please select a file under 10MB.'
      );
      e.target.value = '';
      return;
    }

    const fileNameLower = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(fileNameLower);
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(fileNameLower);
    const isSupportedDoc = isImage || isPdf || /\.(docx|xlsx|csv|txt)$/i.test(fileNameLower);

    if (!isSupportedDoc) {
      setUploadError(
        isBn
          ? 'অসমর্থিত ফাইল ফরম্যাট! অনুগ্রহ করে PDF, ছবি (JPG, PNG, WebP), অথবা DOCX/XLSX ফাইল দিন।'
          : 'Unsupported file format! Please provide a PDF, image (JPG, PNG, WebP), or DOCX/XLSX file.'
      );
      e.target.value = '';
      return;
    }

    try {
      if (selectedOcrEngine === 'markitdown') {
        await runMarkItDownConversion(file);
      } else if (selectedOcrEngine === 'gemini') {
        await runGeminiOcr(file);
      } else {
        await runTesseractFallback(file);
      }
    } finally {
      e.target.value = '';
    }
  };

  // Row modifications in Challans table
  const handleAddRow = () => {
    const nextSl = (extractedData.challans?.length || 0) + 1;
    const FISCAL_MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const month = FISCAL_MONTHS[nextSl - 1] || `Period ${nextSl}`;
    const newEntry: ChallanEntry = {
      sl: nextSl,
      month,
      depositingAuthority: extractedData.depositingAuthority || '',
      paymentDocType: 'Challan',
      challanRefNo: '',
      challanDate: '',
      challanAmount: 0,
      claimedAmount: 0
    };

    setExtractedData(prev => ({
      ...prev,
      challans: [...(prev.challans || []), newEntry]
    }));
  };

  const handleUpdateRow = (index: number, field: keyof ChallanEntry, value: any) => {
    const updated = [...(extractedData.challans || [])];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setExtractedData(prev => ({ ...prev, challans: updated }));
  };

  const handleDeleteRow = (index: number) => {
    const updated = (extractedData.challans || []).filter((_, idx) => idx !== index);
    const reindexed = updated.map((item, idx) => ({ ...item, sl: idx + 1 }));
    setExtractedData(prev => ({ ...prev, challans: reindexed }));
  };

  // Generate scripts based on target portal
  let scriptCode = '';
  let portalUrl = 'https://ledger.etaxnbr.gov.bd/#/pages/source-tax/private-salary';
  let portalLabel = isBn ? 'এনবিআর প্রাইভেট স্যালারি লেজার' : 'NBR Source Tax Private Salary Ledger';

  if (targetPortal === 'ledger') {
    scriptCode = generatePrivateSalaryLedgerScript(extractedData);
    portalUrl = 'https://ledger.etaxnbr.gov.bd/#/pages/source-tax/private-salary';
    portalLabel = isBn ? 'এনবিআর প্রাইভেট স্যালারি লেজার' : 'NBR Source Tax Private Salary Ledger';
  } else if (targetPortal === 'trms') {
    scriptCode = generateTRMSScript(extractedData);
    portalUrl = 'https://trms.nbr.gov.bd/dashboard';
    portalLabel = isBn ? 'এনবিআর টিআরএমএস পোর্টাল' : 'NBR TRMS Tax Portal';
  } else {
    scriptCode = generateUniversalETaxScript(extractedData);
    portalUrl = 'https://etaxnbr.gov.bd';
    portalLabel = isBn ? 'এনবিআর ই-ট্যাক্স সার্বজনীন' : 'NBR e-Tax Universal Portal';
  }

  const bookmarkletCode = `javascript:(function(){${encodeURIComponent(scriptCode)}})();`;

  const handleCopyScript = (type: 'script' | 'bookmarklet') => {
    const text = type === 'script' ? scriptCode : bookmarkletCode;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopySingleField = (text: string, rowIdx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedRowIdx(rowIdx);
    setTimeout(() => setCopiedRowIdx(null), 1800);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([scriptCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VATX_NBR_Script_${extractedData.tin || 'PrivateSalary'}.js`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = () => {
    setMarkupText(SAMPLE_MARKUP_TABLE);
    handleParse(SAMPLE_MARKUP_TABLE);
  };

  const handleClear = () => {
    setMarkupText('');
    setExtractedData({ challans: [] });
  };

  const challansCount = extractedData.challans?.length || 0;
  const totalClaimed = (extractedData.challans || []).reduce((acc, c) => acc + (Number(c.claimedAmount) || 0), 0) || (extractedData.claimedAmount || extractedData.taxAmount || 0);
  const totalChallan = (extractedData.challans || []).reduce((acc, c) => acc + (Number(c.challanAmount) || 0), 0) || (extractedData.challanAmount || extractedData.totalAmount || 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-900 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-[11px] font-bold tracking-wide">
              <Sparkles size={14} className="text-emerald-400" />
              {isBn ? 'আসল ডাটা এক্সট্র্যাকশন ও শূন্য কাল্পনিক মান' : '100% Authentic OCR & Zero Fictitious Values'}
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white">
              {isBn ? 'মার্কআপ টেক্সট থেকে এনবিআর স্ক্রিপ্ট জেনারেটর' : 'Make NBR Script from Markup Text'}
            </h2>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-medium">
              {isBn
                ? 'মাইক্রোসফট মার্কইটডাউন (Microsoft MarkItDown), ওসিআর টেক্সট বা মার্কডাউন টেবিল থেকে সরাসরি আসল চালান ও ট্যাক্স ডাটা দিয়ে স্বয়ংক্রিয় এনবিআর প্রাইভেট স্যালারি স্ক্রিপ্ট তৈরি করুন।'
                : 'Convert Markdown tables, OCR markup text, or Microsoft MarkItDown extracts into verified NBR browser automation scripts. Extracts actual amounts, dates, and reference numbers with zero hallucination.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setShowEasyBanglaGuide(true);
                const el = document.getElementById('nbr-easy-bangla-guide');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95"
            >
              <HelpCircle size={15} />
              <span>সহজ বাংলা গাইড (নতুনদের জন্য)</span>
            </button>
            <button
              onClick={handleLoadSample}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-white active:scale-95"
            >
              <RefreshCw size={14} />
              {isBn ? 'নমুনা মার্কআপ লোড করুন' : 'Load Sample Markup'}
            </button>
            <a
              href="https://ledger.etaxnbr.gov.bd/#/pages/source-tax/private-salary"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <ExternalLink size={14} />
              {isBn ? 'এনবিআর লেজার পোর্টাল' : 'Open NBR Ledger'}
            </a>
          </div>
        </div>
      </div>

      {/* BEGINNER-FRIENDLY STEP-BY-STEP BANGLA GUIDE FOR ANY NAIVE USER */}
      <div
        id="nbr-easy-bangla-guide"
        className="rounded-[2.5rem] bg-gradient-to-br from-amber-50 via-orange-50/50 to-emerald-50/40 border-2 border-amber-300/80 shadow-lg overflow-hidden"
      >
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/80 pb-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500 text-white rounded-full text-[11px] font-black tracking-wide">
                <HelpCircle size={14} />
                <span>যেকোনো নতুন বা সাধারণ মানুষের জন্য সহজ বাংলা নির্দেশিকা (Zero Technical Knowledge Needed)</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-zinc-900">
                কীভাবে এনবিআর (NBR) ওয়েবসাইটে অটো-ফিল স্ক্রিপ্টটি ব্যবহার করবেন? (মাত্র ১ মিনিটে)
              </h3>
              <p className="text-xs md:text-sm text-zinc-700 font-medium">
                আপনি যদি কম্পিউটার বা কোডিং সম্পর্কে একদমই কিছু না জানেন, তবুও নিচের <strong>৫টি সহজ ধাপ</strong> অনুসরণ করে হাতের টাইপিং ছাড়াই ১২ মাসের সব চালান ও ট্যাক্সের হিসাব এনবিআর পোর্টালে বসাতে পারবেন।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex bg-white p-1 rounded-xl border border-amber-200 shadow-sm">
                <button
                  onClick={() => setGuideMethod('console')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    guideMethod === 'console'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  পদ্ধতি ১: মাউস / F12 (সহজ)
                </button>
                <button
                  onClick={() => setGuideMethod('bookmark')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    guideMethod === 'bookmark'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  পদ্ধতি ২: বুকমার্ক (F12 ছাড়াই)
                </button>
              </div>

              <button
                onClick={() => setShowEasyBanglaGuide(!showEasyBanglaGuide)}
                className="px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-black transition-all"
              >
                {showEasyBanglaGuide ? 'গাইড লুকান ▲' : 'গাইড দেখুন ▼'}
              </button>
            </div>
          </div>

          {showEasyBanglaGuide && (
            <div className="space-y-6">
              {guideMethod === 'console' ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* ধাপ ১ */}
                  <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                          ১
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                          Step 1
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-zinc-900">
                        ১. ফাইল দিন বা টেক্সট পেস্ট করুন
                      </h4>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        নিচে বাম পাশের বক্সে আপনার অফিসের <strong>ট্যাক্স সার্টিফিকেট (PDF বা ছবি)</strong> আপলোড করুন অথবা টেক্সট পেস্ট করুন। ডানপাশের টেবিলে আপনার চালান নম্বর ও টাকার অংক চলে আসবে।
                      </p>
                    </div>
                    <button
                      onClick={handleLoadSample}
                      className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all"
                    >
                      <RefreshCw size={12} />
                      পরীক্ষা করতে নমুনা লোড করুন
                    </button>
                  </div>

                  {/* ধাপ ২ */}
                  <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                          ২
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                          Step 2
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-zinc-900">
                        ২. স্ক্রিপ্টটি কপি করুন (১ ক্লিকে)
                      </h4>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        এই গাইডের নিচে অথবা ঠিক এই কার্ডের নিচের <strong>"স্ক্রিপ্ট কপি করুন"</strong> বাটনে মাত্র ১ বার ক্লিক করুন। আপনার অটো-ফিল কোডটি কম্পিউটারে কপি হয়ে যাবে।
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyScript('script')}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      {copiedType === 'script' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedType === 'script' ? 'কপি সম্পন্ন হয়েছে!' : 'এখান থেকেই স্ক্রিপ্ট কপি করুন'}
                    </button>
                  </div>

                  {/* ধাপ ৩ */}
                  <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                          ৩
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                          Step 3
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-zinc-900">
                        ৩. এনবিআর পেজে গিয়ে লগইন করুন
                      </h4>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        এনবিআর ই-ট্যাক্স ওয়েবসাইটে লগইন করে বাম পাশের মেনু থেকে <strong>Source Tax ➔ Private Salary</strong> পেজে যান (যেখানে চালানের ছকটি দেখা যায়)।
                      </p>
                    </div>
                    <a
                      href={portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ExternalLink size={12} />
                      এনবিআর পেজ খুলুন ↗
                    </a>
                  </div>

                  {/* ধাপ ৪ */}
                  <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                          ৪
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                          Step 4
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-zinc-900">
                        ৪. Console বক্স খুলুন (খুব সহজ)
                      </h4>
                      <div className="text-xs text-zinc-600 leading-relaxed space-y-1.5">
                        <p>
                          <strong>মাউস দিয়ে:</strong> এনবিআর পেজের যেকোনো ফাঁকা জায়গায় মাউসের <strong>ডান বাটনে ক্লিক (Right Click)</strong> করে নিচে <strong>Inspect</strong> চাপুন, তারপর উপরে <strong>Console</strong> লেখায় ক্লিক করুন।
                        </p>
                        <p>
                          <strong>অথবা কিবোর্ডে:</strong> <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 rounded font-mono text-[10px]">F12</kbd> বা <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 rounded font-mono text-[10px]">Ctrl+Shift+J</kbd> চাপুন।
                        </p>
                      </div>
                    </div>
                    <div className="py-1.5 px-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] font-bold text-amber-900 text-center">
                      মাউস Right-Click ➔ Inspect ➔ Console
                    </div>
                  </div>

                  {/* ধাপ ৫ */}
                  <div className="p-4 rounded-2xl bg-emerald-900 text-white border border-emerald-700 shadow-md flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-xl bg-emerald-400 text-zinc-950 font-black text-sm flex items-center justify-center shadow-sm">
                          ৫
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-800 text-emerald-300 rounded-md">
                          Final Step
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-white">
                        ৫. পেস্ট (Ctrl+V) করে Enter চাপুন!
                      </h4>
                      <p className="text-xs text-emerald-100 leading-relaxed">
                        Console-এর খালি জায়গায় ক্লিক করে কিবোর্ডে <strong>Ctrl + V</strong> চেপে পেস্ট করুন এবং <strong>Enter</strong> চাপুন। সাথে সাথে পর্দার কোণায় সবুজ বক্স আসবে—সেখানে <strong>"🚀 ১-ক্লিকে সব এন্ট্রি অটো-ফিল"</strong> চাপলেই সব পূরণ হয়ে যাবে!
                      </p>
                    </div>
                    <div className="py-1.5 px-2.5 bg-emerald-800/90 border border-emerald-600 rounded-xl text-[10px] font-black text-emerald-200 text-center">
                      🎉 ১২ মাসের সব ঘর একা একাই পূরণ হবে!
                    </div>
                  </div>
                </div>
              ) : (
                /* পদ্ধতি ২: বুকমার্কলেট গাইড (F12 ছাড়াই) */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                      ১
                    </span>
                    <h4 className="font-black text-sm text-zinc-900">
                      ১. বুকমার্কলেট কোড কপি করুন
                    </h4>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      আপনি যদি F12 বা Console ব্যবহার করতে না চান, তবে নিচের বাটনে ক্লিক করে <strong>বুকমার্কলেট কোডটি</strong> কপি করে নিন।
                    </p>
                    <button
                      onClick={() => handleCopyScript('bookmarklet')}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
                    >
                      {copiedType === 'bookmarklet' ? <Check size={14} /> : <Code size={14} />}
                      {copiedType === 'bookmarklet' ? 'বুকমার্ক কোড কপি হয়েছে!' : 'বুকমার্কলেট কোড কপি করুন'}
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                      ২
                    </span>
                    <h4 className="font-black text-sm text-zinc-900">
                      ২. ব্রাউজারে একটি নতুন বুকমার্ক বানান
                    </h4>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      ব্রাউজারের উপরের বুকমার্ক বারে (Bookmarks Bar) মাউসের ডান বাটনে ক্লিক করে <strong>Add Page...</strong> বা <strong>Add Bookmark</strong> দিন। Name-এর ঘরে লিখুন <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-bold">NBR Auto Fill</code> এবং <strong>URL</strong>-এর ঘরে কপি করা কোডটি পেস্ট করে Save করুন।
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-900 text-white border border-emerald-700 shadow-sm space-y-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-400 text-zinc-950 font-black text-sm flex items-center justify-center">
                      ৩
                    </span>
                    <h4 className="font-black text-sm text-white">
                      ৩. এনবিআর পেজে গিয়ে বুকমার্কে ১ ক্লিক করুন!
                    </h4>
                    <p className="text-xs text-emerald-100 leading-relaxed">
                      এবার এনবিআর-এর <strong>Private Salary</strong> পেজে যান এবং উপরের বুকমার্ক বার থেকে আপনার বানানো <strong>NBR Auto Fill</strong> বুকমার্কে মাত্র ১টি ক্লিক করুন। সাথে সাথে অটো-ফিল বক্স চালু হয়ে যাবে!
                    </p>
                  </div>
                </div>
              )}

              {/* নতুনদের জন্য সাধারণ সমস্যা ও সমাধান (Troubleshooting Box) */}
              <div className="p-4 md:p-5 rounded-2xl bg-white/90 border border-amber-300 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 text-xs">
                  <div className="font-black text-amber-950 flex items-center gap-2 text-sm">
                    <AlertCircle size={16} className="text-amber-600 shrink-0" />
                    <span>প্রথমবার পেস্ট করার সময় কি হলুদ রঙের সতর্কবার্তা (Warning: Don't paste code...) দেখাচ্ছে?</span>
                  </div>
                  <p className="text-zinc-700 leading-relaxed">
                    চিন্তার কিছু নেই! গুগল ক্রোম (Chrome) ব্রাউজারে প্রথমবার পেস্ট করার সময় নিরাপত্তার জন্য এটি দেখা যায়। সমাধান অতি সহজ: Console-এ কিবোর্ড দিয়ে ছোট হাতের অক্ষরে টাইপ করুন <code className="px-2 py-0.5 bg-amber-100 text-amber-950 font-mono font-black rounded border border-amber-300">allow pasting</code> এবং <strong>Enter</strong> চাপুন। এরপর আবার <strong>Ctrl + V</strong> চেপে আমাদের স্ক্রিপ্টটি পেস্ট করে <strong>Enter</strong> দিন!
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText('allow pasting');
                    setCopiedAllowPasting(true);
                    setTimeout(() => setCopiedAllowPasting(false), 2000);
                  }}
                  className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-xl text-xs font-black shrink-0 flex items-center gap-2 transition-all active:scale-95"
                >
                  {copiedAllowPasting ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                  <span>{copiedAllowPasting ? '"allow pasting" কপি হয়েছে!' : 'কপি করুন: allow pasting'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Input on Left, Extracted & Scripts on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Markup Text Editor & Converter (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-card p-6 md:p-8 rounded-[2.5rem] bg-white border border-zinc-200/80 shadow-sm flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileCode size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
                    {isBn ? 'মার্কআপ / মার্কডাউন ইনপুট' : 'Markup / Markdown Input'}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    {isBn ? 'টেক্সট পেস্ট বা ফাইল কনভার্ট করুন' : 'Paste text or convert documents'}
                  </p>
                </div>
              </div>

              {markupText && (
                <button
                  onClick={handleClear}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  {isBn ? 'মুছুন' : 'Clear'}
                </button>
              )}
            </div>

            {/* File Upload Card with Microsoft MarkItDown OCR, Gemini AI OCR & Tesseract Fallback */}
            <div className="p-4 md:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4 shadow-xs">
              {/* OCR Engine Switcher */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-zinc-500 tracking-wider">
                    {isBn ? 'ওসিআর / কনভার্সন ইঞ্জিন নির্বাচন করুন:' : 'Select OCR / Conversion Engine:'}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400">
                    {selectedOcrEngine === 'markitdown' ? 'v2.0 MarkItDown' : selectedOcrEngine === 'gemini' ? 'Gemini 2.5 Flash' : 'Tesseract v5'}
                  </span>
                </div>
                <div className="grid grid-cols-3 bg-zinc-200/70 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedOcrEngine('markitdown')}
                    className={`py-2 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedOcrEngine === 'markitdown'
                        ? 'bg-white text-emerald-900 shadow-sm border border-emerald-300/60 ring-1 ring-emerald-500/20'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/40'
                    }`}
                  >
                    <Sparkles size={13} className="text-emerald-600 shrink-0" />
                    <span className="truncate">MarkItDown</span>
                    <span className="hidden sm:inline-block text-[8px] px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded font-black uppercase">
                      {isBn ? 'আসল টেবিল' : 'Authentic'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOcrEngine('gemini')}
                    className={`py-2 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedOcrEngine === 'gemini'
                        ? 'bg-white text-indigo-900 shadow-sm border border-indigo-300/60 ring-1 ring-indigo-500/20'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/40'
                    }`}
                  >
                    <ShieldCheck size={13} className="text-indigo-600 shrink-0" />
                    <span className="truncate">Gemini 2.5</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOcrEngine('tesseract')}
                    className={`py-2 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedOcrEngine === 'tesseract'
                        ? 'bg-white text-zinc-900 shadow-sm border border-zinc-300 ring-1 ring-zinc-500/20'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/40'
                    }`}
                  >
                    <ScanText size={13} className="text-zinc-600 shrink-0" />
                    <span className="truncate">{isBn ? 'Tesseract' : 'Tesseract'}</span>
                    <span className="hidden sm:inline-block text-[8px] px-1 py-0.2 bg-zinc-200 text-zinc-700 rounded font-black uppercase">
                      {isBn ? 'অফলাইন' : 'Offline'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Dynamic Header & Engine Description */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                    {selectedOcrEngine === 'markitdown' ? (
                      <>
                        <Sparkles size={14} className="text-emerald-600" />
                        <span>{isBn ? 'মাইক্রোসফট মার্কইটডাউন (Microsoft MarkItDown OCR)' : 'Microsoft MarkItDown OCR'}</span>
                      </>
                    ) : selectedOcrEngine === 'gemini' ? (
                      <>
                        <ShieldCheck size={14} className="text-indigo-600" />
                        <span>{isBn ? 'জেমিনি ২.৫ ফ্ল্যাশ এআই ওসিআর (Gemini AI OCR)' : 'Gemini 2.5 Flash AI OCR'}</span>
                      </>
                    ) : (
                      <>
                        <ScanText size={14} className="text-zinc-700" />
                        <span>{isBn ? 'টেসেরাক্ট ব্রাউজার ক্লায়েন্ট ওসিআর (Tesseract OCR)' : 'In-Browser Tesseract OCR'}</span>
                      </>
                    )}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    selectedOcrEngine === 'markitdown'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                      : selectedOcrEngine === 'gemini'
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-300/60'
                        : 'bg-zinc-200 text-zinc-800'
                  }`}>
                    {selectedOcrEngine === 'markitdown'
                      ? 'MarkItDown + AI Vision'
                      : selectedOcrEngine === 'gemini'
                        ? 'Gemini 2.5 Flash'
                        : '100% In-Browser Offline'}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  {selectedOcrEngine === 'markitdown'
                    ? (isBn
                        ? 'মাইক্রোসফট মার্কইটডাউন (Microsoft MarkItDown) এবং এআই ভিশন দিয়ে PDF, চালান বা সার্টিফিকেট ছবি (JPG/PNG/WebP), অথবা Word/Excel (DOCX/XLSX) সরাসরি পরিচ্ছন্ন মার্কডাউন টেবিলে কনভার্ট করুন।'
                        : 'Convert PDFs, images (JPG/PNG/WebP), Word (DOCX) or Excel (XLSX) into clean GitHub-Flavored Markdown tables via Microsoft MarkItDown + AI Vision with authentic figures.')
                    : selectedOcrEngine === 'gemini'
                      ? (isBn
                          ? 'Gemini 2.5 Flash এআই দিয়ে স্ক্যান করা PDF বা চালান ছবি সরাসরি মার্কডাউন টেবিলে রূপান্তর করুন।'
                          : 'Extract clean Markdown tables directly from scanned PDF or challan images with Gemini 2.5 Flash AI.')
                      : (isBn
                          ? 'কোনো সার্ভার আপলোড ছাড়াই ব্রাউজারে সম্পূর্ণ অফলাইনে Tesseract দিয়ে বাংলা+ইংরেজি ওসিআর চালান।'
                          : 'Process image and PDF OCR 100% offline in your browser with Tesseract.js (ben+eng).')}
                </p>
              </div>

              {/* Upload Input Button */}
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-zinc-300 hover:border-emerald-500 rounded-xl cursor-pointer text-xs font-bold text-zinc-700 hover:text-emerald-700 transition-all shadow-sm">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.csv,.txt"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                {isUploading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-emerald-600" />
                    <span>{ocrProgress?.statusText || (isBn ? 'ডকুমেন্ট প্রসেস হচ্ছে...' : 'Processing document...')}</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} className="text-emerald-600" />
                    <span>
                      {selectedOcrEngine === 'markitdown'
                        ? (isBn ? 'MarkItDown দিয়ে ফাইল দিন (PDF, ছবি, DOCX, XLSX)' : 'Convert with Microsoft MarkItDown (PDF, Images, DOCX, XLSX)')
                        : selectedOcrEngine === 'gemini'
                          ? (isBn ? 'Gemini AI দিয়ে ফাইল দিন (PDF, JPG, PNG, WebP)' : 'Upload with Gemini AI (PDF, JPG, PNG, WebP)')
                          : (isBn ? 'Tesseract অফলাইন OCR চালান (PDF, JPG, PNG)' : 'Run In-Browser Tesseract OCR (PDF, JPG, PNG)')}
                    </span>
                  </>
                )}
              </label>

              {/* Requirement 7: Loading State & Progress Bar in Bengali */}
              {isUploading && ocrProgress && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw size={12} className="animate-spin text-emerald-600" />
                      {ocrProgress.statusText}
                    </span>
                    <span className="font-mono text-emerald-700">
                      {ocrProgress.totalPages > 1
                        ? `${isBn ? 'পৃষ্ঠা' : 'Page'} ${ocrProgress.currentPage}/${ocrProgress.totalPages} — ${ocrProgress.percent}%`
                        : `${ocrProgress.percent}%`}
                    </span>
                  </div>
                  <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(5, Math.min(100, ocrProgress.percent))}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Friendly Error Message & Multi-Engine Fallback Options */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 text-rose-600 mt-0.5" />
                    <span className="leading-relaxed">{uploadError}</span>
                  </div>

                  {fallbackFile && (canRunMarkItDownFallback || canRunGeminiFallback || canRunTesseractFallback) && (
                    <div className="pt-2 border-t border-rose-200 space-y-2">
                      <span className="text-[11px] font-bold text-rose-900 block">
                        {isBn
                          ? 'বিকল্প ইঞ্জিন দিয়ে এই ফাইলটি পুনরায় চালাতে চান?'
                          : 'Would you like to retry processing this file with an alternative engine?'}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {canRunMarkItDownFallback && (
                          <button
                            type="button"
                            onClick={() => runMarkItDownConversion(fallbackFile)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Sparkles size={13} />
                            {isBn ? 'Microsoft MarkItDown চালান' : 'Run Microsoft MarkItDown'}
                          </button>
                        )}
                        {canRunGeminiFallback && (
                          <button
                            type="button"
                            onClick={() => runGeminiOcr(fallbackFile)}
                            className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <ShieldCheck size={13} />
                            {isBn ? 'Gemini AI চালান' : 'Run Gemini AI OCR'}
                          </button>
                        )}
                        {canRunTesseractFallback && (
                          <button
                            type="button"
                            onClick={() => runTesseractFallback(fallbackFile)}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <ScanText size={13} />
                            {isBn ? 'Tesseract ফলব্যাক চালান' : 'Run Tesseract Fallback'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {lastOcrNotice && !uploadError && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center justify-between">
                  <span>✓ {lastOcrNotice}</span>
                  <button
                    onClick={() => setLastOcrNotice(null)}
                    className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Requirement 9: Notice */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-950 text-xs flex items-start gap-2.5 shadow-xs">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-black text-amber-900">
                  {isBn
                    ? 'AI OCR ভুল করতে পারে। স্ক্রিপ্ট তৈরির আগে চালান নম্বর ও টাকার অংক মূল ডকুমেন্টের সাথে মিলিয়ে নিন।'
                    : 'AI OCR can make mistakes. Please verify challan numbers and amounts against original documents before generating script.'}
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {isBn
                    ? 'নিচের বক্সে টেক্সট সরাসরি এডিটযোগ্য। ভুল বা অস্পষ্ট কোনো অক্ষর থাকলে তা ঠিক করে নিন।'
                    : 'The text box below is fully editable. You can correct any misread characters directly.'}
                </p>
              </div>
            </div>

            {/* Requirement 10: Highlight any [?] in the text box so the user can fix it */}
            {(() => {
              const unreadableCount = (markupText.match(/\[\?\]/g) || []).length;
              const linesWithQM = getLinesWithQuestionMark(markupText);
              if (unreadableCount === 0) return null;

              return (
                <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 text-xs space-y-2.5 shadow-xs animate-in fade-in">
                  <div className="flex items-center justify-between font-black">
                    <span className="flex items-center gap-1.5 text-amber-900">
                      <AlertTriangle size={15} className="text-amber-600 animate-pulse shrink-0" />
                      {isBn
                        ? `অস্পষ্ট অংশ শনাক্ত হয়েছে (${unreadableCount}টি [?]) — মূল ডকুমেন্টের সাথে মেলান:`
                        : `Unreadable parts detected (${unreadableCount} instance(s) of [?]) — verify with original:`}
                    </span>
                    <button
                      type="button"
                      onClick={() => focusAndHighlightQuestionMark()}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Search size={12} />
                      {isBn ? 'পরবর্তী [?] হাইলাইট করুন' : 'Highlight Next [?]'}
                    </button>
                  </div>

                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {isBn
                      ? 'ডকুমেন্টে যেসব অক্ষর অস্পষ্ট ছিল সেখানে [?] বসানো হয়েছে। নিচের বক্সে গিয়ে মূল ডকুমেন্টের সাথে মিলিয়ে সঠিক চালান নম্বর, তারিখ বা টাকার অংক টাইপ করে দিন।'
                      : 'Characters unreadable from the source document have been marked as [?]. Jump to each one below and replace it with the authentic value.'}
                  </p>

                  {linesWithQM.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                        {isBn ? '[?] যুক্ত লাইনসমূহ (ক্লিক করে সরাসরি সিলেক্ট করুন):' : 'Lines with [?] (click to select in text box):'}
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white/90 rounded-xl border border-amber-200">
                        {linesWithQM.slice(0, 15).map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => focusAndHighlightQuestionMark(item.index)}
                            className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded text-[11px] font-mono flex items-center gap-1 shadow-2xs transition-all cursor-pointer text-left"
                            title={isBn ? 'এই লাইনে যেতে ক্লিক করুন' : 'Click to jump to line in text box'}
                          >
                            <span className="font-bold text-amber-800">L{item.lineNumber}:</span>
                            <span className="truncate max-w-[180px]">{item.preview}</span>
                          </button>
                        ))}
                        {linesWithQM.length > 15 && (
                          <span className="text-[10px] text-amber-700 font-bold self-center px-1">
                            +{linesWithQM.length - 15} {isBn ? 'টি আরও...' : 'more...'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Low-Confidence Words (< 70) from Tesseract Fallback */}
            {lowConfidenceWords.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-rose-900">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-rose-600" />
                    {isBn
                      ? `Tesseract কম কনফিডেন্স শব্দ (${lowConfidenceWords.length}টি) — যাচাইয়ের পরামর্শ:`
                      : `Tesseract low confidence words (${lowConfidenceWords.length}) — review recommended:`}
                  </span>
                  <button
                    onClick={() => setLowConfidenceWords([])}
                    className="text-[10px] text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
                  >
                    {isBn ? 'আড়াল করুন' : 'Dismiss'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white/80 rounded-lg border border-rose-100">
                  {lowConfidenceWords.slice(0, 30).map((w, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded text-[11px] font-mono flex items-center gap-1 shadow-2xs"
                      title={`Confidence: ${w.confidence}%${w.page ? ` (Page ${w.page})` : ''}`}
                    >
                      <span>{w.text}</span>
                      <span className="text-[9px] text-rose-500 font-sans font-bold">
                        {w.confidence}%
                      </span>
                    </span>
                  ))}
                  {lowConfidenceWords.length > 30 && (
                    <span className="text-[10px] text-rose-500 self-center font-bold px-1">
                      +{lowConfidenceWords.length - 30} {isBn ? 'টি আরও...' : 'more...'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Markup Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-700 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>{isBn ? 'মার্কআপ / টেবিল টেক্সট (এডিটযোগ্য):' : 'Raw Markup Text / Markdown Table (Editable):'}</span>
                  {markupText.includes('[?]') && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300 animate-pulse">
                      ⚠️ [?] অস্পষ্ট অক্ষর বিদ্যমান
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 font-normal">
                  {markupText.length} chars • {markupText.split('\n').length} lines
                </span>
              </label>
              <textarea
                ref={textareaRef}
                value={markupText}
                onChange={(e) => {
                  setMarkupText(e.target.value);
                  handleParse(e.target.value);
                }}
                placeholder={isBn ? 'মার্কআপ টেক্সট বা মার্কডাউন টেবিল এখানে পেস্ট করুন...' : 'Paste markdown table or OCR markup text here...\n\nExample:\n| SL | Month | Depositing Authority | Payment Doc Type | Challan Ref No | Challan Date | Deposited Amount | Claimed TDS |\n|---|---|---|---|---|---|---|---|\n| 1 | Jul | Eastern Bank PLC | Challan | 2526-00043326111 | 14-08-2025 | 27650502.89 | 4131.97 |'}
                rows={16}
                className={`w-full p-4 rounded-2xl border text-xs font-mono focus:outline-none focus:ring-2 leading-relaxed selection:bg-emerald-200 transition-all ${
                  markupText.includes('[?]')
                    ? 'border-amber-400 focus:ring-amber-500 bg-amber-50/15'
                    : 'border-zinc-200 focus:ring-emerald-500 bg-zinc-50/70'
                }`}
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.readText().then(clip => {
                    if (clip) {
                      setMarkupText(clip);
                      handleParse(clip);
                    }
                  }).catch(() => {});
                }}
                className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Clipboard size={14} />
                {isBn ? 'ক্লিপবোর্ড থেকে পেস্ট' : 'Paste Clipboard'}
              </button>

              <button
                onClick={() => handleParse()}
                disabled={!markupText.trim()}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 active:scale-95"
              >
                <Sparkles size={14} />
                {isBn ? 'স্ক্রিপ্ট তৈরি করুন' : 'Generate NBR Script'}
              </button>
            </div>
          </div>

          {/* Quick Guide Card */}
          <div className="neo-card p-6 rounded-[2rem] bg-amber-50/60 border border-amber-200/60 text-amber-950 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-amber-900">
              <HelpCircle size={15} className="text-amber-700" />
              <span>সংক্ষেপে ৩টি সহজ ধাপ (Quick Summary in Bangla)</span>
            </h4>
            <ol className="text-xs space-y-2 list-decimal list-inside text-amber-900/90 font-medium leading-relaxed">
              <li>
                <strong>১. ফাইল বা টেক্সট দিন:</strong> আপনার ট্যাক্স সার্টিফিকেট (PDF/ছবি) আপলোড করুন অথবা মার্কডাউন টেবিল পেস্ট করুন।
              </li>
              <li>
                <strong>২. টেবিল মিলিয়ে নিন:</strong> ডানপাশের টেবিলে আপনার চালান নম্বর, তারিখ ও টাকার অংক ঠিক আছে কি না দেখুন।
              </li>
              <li>
                <strong>৩. কপি ও পেস্ট (১-ক্লিক অটো-ফিল):</strong> সবুজ বাটনে চাপ দিয়ে স্ক্রিপ্ট কপি করুন, এনবিআর পোর্টালে গিয়ে মাউসের ডান বাটনে ক্লিক করে <strong>Inspect ➔ Console</strong>-এ পেস্ট করে Enter চাপুন!
              </li>
            </ol>
          </div>
        </div>

        {/* Right Column: Extracted Challans & Script Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metadata Cards */}
          <div className="neo-card p-6 rounded-[2.5rem] bg-white border border-zinc-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                  {isBn ? 'এক্সট্র্যাক্ট করা আসল ট্যাক্স ডাটা' : 'Extracted Authentic Taxpayer & Entity Data'}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                {challansCount} {isBn ? 'টি এন্ট্রি প্রস্তুত' : 'Entries Extracted'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                  {isBn ? 'করদাতার নাম' : 'Taxpayer Name'}
                </span>
                <p className="text-xs font-black text-zinc-800 truncate">
                  {extractedData.taxpayerName || '-'}
                </p>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                  {isBn ? 'ই-টিন নম্বর' : 'e-TIN Number'}
                </span>
                <p className="text-xs font-mono font-bold text-zinc-900 truncate">
                  {extractedData.tin || '-'}
                </p>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                  {isBn ? 'কর্তনকারী কর্তৃপক্ষ' : 'Depositing Authority'}
                </span>
                <p className="text-xs font-bold text-zinc-800 truncate">
                  {extractedData.depositingAuthority || extractedData.vendorName || '-'}
                </p>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                  {isBn ? 'কর ও আয় বর্ষ' : 'Assessment Year'}
                </span>
                <p className="text-xs font-bold text-zinc-800 truncate">
                  {extractedData.assessmentYear || '2026-2027'}
                </p>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                  {isBn ? 'মোট চালান জমা (৳)' : 'Total Challan Deposited'}
                </span>
                <p className="text-xs font-mono font-black text-zinc-900">
                  ৳{totalChallan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 block mb-1">
                  {isBn ? 'মোট টিডিএস কর্তন (৳)' : 'Total TDS Claimed'}
                </span>
                <p className="text-xs font-mono font-black text-emerald-800">
                  ৳{totalClaimed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive 7-Column Challan Table */}
          <div className="neo-card p-6 rounded-[2.5rem] bg-white border border-zinc-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                  <Layers size={16} className="text-emerald-600" />
                  {isBn ? 'এনবিআর প্রাইভেট স্যালারি লেজার ৭ কলাম সূচি' : 'NBR Private Salary 7-Column Form Rows'}
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                  {isBn ? 'প্রয়োজনে যে কোনো ঘরের তথ্য এডিট করতে পারেন' : 'Editable rows for 100% precision'}
                </p>
              </div>

              <button
                onClick={handleAddRow}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1 active:scale-95"
              >
                <Plus size={14} />
                {isBn ? 'নতুন রো যোগ করুন' : 'Add Row'}
              </button>
            </div>

            {challansCount === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-xs italic border border-dashed border-zinc-200 rounded-2xl">
                {isBn
                  ? 'বাম পাশে মার্কআপ টেক্সট দিন অথবা "নমুনা মার্কআপ লোড করুন" বাটনে ক্লিক করুন।'
                  : 'No table entries extracted yet. Paste markup text on the left or click "Load Sample Markup".'}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                <table className="w-full text-left text-xs min-w-[720px]">
                  <thead className="bg-zinc-50 font-black text-zinc-600 uppercase tracking-widest text-[10px] border-b border-zinc-200">
                    <tr>
                      <th className="p-2.5 w-10 text-center">SL</th>
                      <th className="p-2.5 w-20">{isBn ? 'মাস' : 'Month'}</th>
                      <th className="p-2.5">{isBn ? 'কর্তৃপক্ষ' : 'Authority'}</th>
                      <th className="p-2.5 w-36">{isBn ? 'চালান রেফারেন্স' : 'Challan Ref No.'}</th>
                      <th className="p-2.5 w-28">{isBn ? 'তারিখ' : 'Date'}</th>
                      <th className="p-2.5 w-28 text-right">{isBn ? 'চালান মোট (৳)' : 'Challan Amt'}</th>
                      <th className="p-2.5 w-28 text-right">{isBn ? 'টিডিএস (৳)' : 'Claimed TDS'}</th>
                      <th className="p-2.5 w-12 text-center">{isBn ? 'মুছুন' : 'Del'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {extractedData.challans?.map((c, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50/30 transition-all">
                        <td className="p-2 text-center font-bold text-zinc-400">{c.sl || idx + 1}</td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={c.month || ''}
                            onChange={(e) => handleUpdateRow(idx, 'month', e.target.value)}
                            className="w-full p-1.5 text-xs font-bold rounded-lg border border-zinc-200 bg-white"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={c.depositingAuthority || ''}
                            onChange={(e) => handleUpdateRow(idx, 'depositingAuthority', e.target.value)}
                            className="w-full p-1.5 text-xs rounded-lg border border-zinc-200 bg-white"
                          />
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={c.challanRefNo || c.challanNo || ''}
                              onChange={(e) => handleUpdateRow(idx, 'challanRefNo', e.target.value)}
                              className="w-full p-1.5 text-xs font-mono font-bold text-sky-800 rounded-lg border border-zinc-200 bg-white"
                            />
                            {c.challanRefNo && (
                              <button
                                onClick={() => handleCopySingleField(c.challanRefNo || '', idx)}
                                title="Copy Ref No"
                                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100"
                              >
                                {copiedRowIdx === idx ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={c.challanDate || c.date || ''}
                            onChange={(e) => handleUpdateRow(idx, 'challanDate', e.target.value)}
                            placeholder="DD-MM-YYYY"
                            className="w-full p-1.5 text-xs font-mono text-zinc-700 rounded-lg border border-zinc-200 bg-white"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            value={c.challanAmount !== undefined ? c.challanAmount : ''}
                            onChange={(e) => handleUpdateRow(idx, 'challanAmount', parseFloat(e.target.value) || 0)}
                            className="w-full p-1.5 text-xs font-mono text-right rounded-lg border border-zinc-200 bg-white"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            value={c.claimedAmount !== undefined ? c.claimedAmount : ''}
                            onChange={(e) => handleUpdateRow(idx, 'claimedAmount', parseFloat(e.target.value) || 0)}
                            className="w-full p-1.5 text-xs font-mono font-bold text-right text-emerald-700 rounded-lg border border-emerald-200 bg-emerald-50/40"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleDeleteRow(idx)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Script Output & Action Hub */}
          <div className="neo-card p-6 md:p-8 rounded-[2.5rem] bg-zinc-900 text-white shadow-xl shadow-zinc-900/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    {isBn ? 'এনবিআর ব্রাউজার অটোমেশন স্ক্রিপ্ট' : 'NBR Browser Automation Script'}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    {portalLabel}
                  </p>
                </div>
              </div>

              {/* Portal Selector Tabs */}
              <div className="flex bg-zinc-800/80 p-1 rounded-xl">
                <button
                  onClick={() => setTargetPortal('ledger')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    targetPortal === 'ledger' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Private Salary Ledger
                </button>
                <button
                  onClick={() => setTargetPortal('trms')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    targetPortal === 'trms' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  TRMS Portal
                </button>
                <button
                  onClick={() => setTargetPortal('etax')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    targetPortal === 'etax' ? 'bg-emerald-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Universal e-Tax
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleCopyScript('script')}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                {copiedType === 'script' ? (
                  <>
                    <Check size={16} className="text-zinc-950" />
                    <span>{isBn ? 'স্ক্রিপ্ট কপি হয়েছে!' : 'Script Copied to Clipboard!'}</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>{isBn ? 'কনসোল স্ক্রিপ্ট কপি করুন' : 'Copy Console Script'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleCopyScript('bookmarklet')}
                className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 border border-zinc-700"
              >
                {copiedType === 'bookmarklet' ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span>{isBn ? 'বুকমার্কলেট কপি হয়েছে!' : 'Bookmarklet Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Code size={14} />
                    <span>{isBn ? 'বুকমার্কলেট কোড' : 'Copy Bookmarklet'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadScript}
                className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95 border border-zinc-700"
              >
                <Download size={14} />
                <span>.js {isBn ? 'ডাউনলোড' : 'Download'}</span>
              </button>

              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-zinc-700 ml-auto"
              >
                <ExternalLink size={14} />
                <span>{isBn ? 'পোর্টাল খুলুন' : 'Open Portal'}</span>
              </a>

              {onOpenModal && (
                <button
                  onClick={() => onOpenModal(extractedData)}
                  className="px-4 py-3 bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-brand-500/30"
                >
                  <Layers size={14} />
                  <span>{isBn ? 'অ্যাডভান্সড মডাল' : 'Open Full Hub'}</span>
                </button>
              )}
            </div>

            {/* Script Code Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono text-[11px]">
                  Generated JavaScript Code ({scriptCode.split('\n').length} lines)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {challansCount} rows configured
                </span>
              </div>
              <div className="relative">
                <pre className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-56 leading-relaxed custom-scrollbar selection:bg-emerald-800">
                  {scriptCode}
                </pre>
              </div>
            </div>

            {/* Step-by-Step Instructions in Easy Bangla */}
            <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 text-xs space-y-2">
              <p className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Terminal size={14} className="text-emerald-400" />
                <span>ব্রাউজারে স্ক্রিপ্ট চালানোর সহজ বাংলা নিয়ম (নতুনদের জন্য):</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px] text-zinc-300">
                <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
                  <span className="font-black text-emerald-400 block">ধাপ ১: এনবিআর পেজ খুলুন</span>
                  <span>
                    <strong className="text-white">{targetPortal === 'ledger' ? 'ledger.etaxnbr.gov.bd' : 'trms.nbr.gov.bd'}</strong>-এ লগইন করে Private Salary পেজে যান।
                  </span>
                </div>
                <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
                  <span className="font-black text-emerald-400 block">ধাপ ২: Console ওপেন করুন</span>
                  <span>
                    মাউসের <strong>Right Click ➔ Inspect ➔ Console</strong> ট্যাবে যান (অথবা কিবোর্ডে <strong>F12</strong> চাপুন)।
                  </span>
                </div>
                <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
                  <span className="font-black text-emerald-400 block">ধাপ ৩: পেস্ট ও অটো-ফিল!</span>
                  <span>
                    কপি করা স্ক্রিপ্টটি <strong>Ctrl + V</strong> দিয়ে পেস্ট করে <strong>Enter</strong> চাপুন। সব ঘর নিজে নিজে পূরণ হবে!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

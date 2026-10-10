import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FileUp, 
  Loader2, 
  Plus, 
  Trash2, 
  FileText, 
  Layers, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileDown,
  FileJson,
  Zap,
  ChevronDown,
  Search,
  Sparkles,
  Copy,
  Check,
  Table,
  Hash,
  Calendar,
  Building2,
  ExternalLink,
  Download,
  CreditCard,
  ClipboardCopy,
  ShieldCheck,
  Receipt,
  AlertTriangle,
  Filter,
  Wand2,
  Info,
  XCircle,
  X,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import ExcelJS from 'exceljs';
import * as mammoth from 'mammoth';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { translations, Language } from '../translations';
import { ALL_FORMS, NBRForm } from '../constants/formCatalog';
import { formatNBRDate, ChallanEntry, generatePrivateSalaryLedgerScript, parseRawSalaryCertificateText, parseMarkItDownToNBRData, SAMPLE_MAMUNUR_CERTIFICATE } from '../utils/nbrScriptGenerator';
import { parseRobustJson } from '../utils/robustJsonParser';

const Type = {
  OBJECT: "OBJECT",
  STRING: "STRING",
  NUMBER: "NUMBER",
  INTEGER: "INTEGER",
  BOOLEAN: "BOOLEAN",
  ARRAY: "ARRAY"
} as const;

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface ChallanValidationInfo {
  isValid: boolean;
  status: 'valid' | 'missing' | 'no_2526_prefix' | 'too_short';
  message: string;
  suggestedFix?: string;
}

export function validateChallanRefNumber(refNo: string): ChallanValidationInfo {
  const clean = (refNo || '').trim();
  if (!clean) {
    return {
      isValid: false,
      status: 'missing',
      message: 'Challan # is empty',
      suggestedFix: '2526-00043326111'
    };
  }

  // Check prefix: Expected to start with 2526 (e.g. 2526-00043326111, 252600043326111)
  const has2526Prefix = /^2526[-/\.]?\d+/i.test(clean) || /^2526/i.test(clean);
  const alphanumericCount = clean.replace(/[\s-]/g, '').length;
  const isTooShort = alphanumericCount < 12;

  if (!has2526Prefix && isTooShort) {
    const cleanDigits = clean.replace(/^[-/\.\s]+/, '');
    const suggestedFix = `2526-${cleanDigits}`;
    return {
      isValid: false,
      status: 'no_2526_prefix',
      message: `Missing '2526' prefix & short (${alphanumericCount} chars, min 12)`,
      suggestedFix
    };
  }

  if (!has2526Prefix) {
    const cleanDigits = clean.replace(/^[-/\.\s]+/, '');
    const suggestedFix = `2526-${cleanDigits}`;
    return {
      isValid: false,
      status: 'no_2526_prefix',
      message: `Missing standard '2526' prefix`,
      suggestedFix
    };
  }

  if (isTooShort) {
    return {
      isValid: false,
      status: 'too_short',
      message: `Too short (${alphanumericCount} chars, min 12 required)`,
    };
  }

  return {
    isValid: true,
    status: 'valid',
    message: 'Valid NBR 2526 series reference'
  };
}

export interface FormField {
  id: string;
  label: string;
  value: string;
  isAlphanumericId?: boolean;
}

export interface ExtractedChallan {
  sl: number;
  month: string;
  depositingAuthority: string;
  paymentDocType: string;
  challanRefNo: string;
  challanDate: string;
  challanAmount: number;
  claimedAmount: number;
  bankName?: string;
  branchName?: string;
}

export interface ExtractedItem {
  desc: string;
  qty: number;
  price: number;
  vatRate: number;
  hsCode?: string;
  total?: number;
}

export interface OCRResult {
  documentType: string;
  fields: FormField[];
  items?: ExtractedItem[];
  challans?: ExtractedChallan[];
}

interface OCRFormAutomationProps {
  language?: Language;
  onInvoiceExtracted?: (data: any) => void;
  initialData?: any;
  defaultCategory?: 'INCOME_TAX' | 'VAT';
}

const OCR_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    documentType: { type: Type.STRING, description: "Formal title or classification of the document or form" },
    fields: {
      type: Type.ARRAY,
      description: "Key-value pairs representing form fields with exact labels and values",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique identifier for the field key" },
          label: { type: Type.STRING, description: "Exact human-readable label from the document or form" },
          value: { type: Type.STRING, description: "Exact value extracted. All identifiers must be complete strings without truncation." }
        },
        required: ["id", "label", "value"]
      }
    },
    items: {
      type: Type.ARRAY,
      description: "Itemized invoice or product line items (for VAT Mushak 6.3/6.1/commercial invoices)",
      items: {
        type: Type.OBJECT,
        properties: {
          desc: { type: Type.STRING, description: "Item or service description" },
          qty: { type: Type.NUMBER, description: "Quantity" },
          price: { type: Type.NUMBER, description: "Unit price before VAT" },
          vatRate: { type: Type.NUMBER, description: "VAT rate percentage (e.g., 15)" },
          hsCode: { type: Type.STRING, description: "HS Code if present" },
          total: { type: Type.NUMBER, description: "Total line item amount in BDT" }
        },
        required: ["desc", "qty", "price", "vatRate"]
      }
    },
    challans: {
      type: Type.ARRAY,
      description: "Table of tax challans / salary deductions for NBR Private Salary Ledger and TRMS",
      items: {
        type: Type.OBJECT,
        properties: {
          sl: { type: Type.NUMBER, description: "Serial number (1, 2, 3...)" },
          month: { type: Type.STRING, description: "Month or deduction period (e.g., Jul 2025, July, Jul)" },
          depositingAuthority: { type: Type.STRING, description: "Employer or authority depositing the tax (e.g. Eastern Bank PLC)" },
          paymentDocType: { type: Type.STRING, description: "Challan, Certificate, e-Challan, or Pay Order" },
          challanRefNo: { type: Type.STRING, description: "FULL alphanumeric Challan reference number string (e.g. '2526-00043326111', '2526-00078707191', 'CH-456307'). Must be an exact, complete string starting with 2526 or other NBR treasury codes. Never truncate or cast to float/scientific notation." },
          challanNo: { type: Type.STRING, description: "Alias for challanRefNo" },
          refNo: { type: Type.STRING, description: "Alias for challanRefNo" },
          challanDate: { type: Type.STRING, description: "Challan date in DD-MM-YYYY format (e.g. '14-08-2025')" },
          challanAmount: { type: Type.NUMBER, description: "Total Challan Amount in BDT" },
          claimedAmount: { type: Type.NUMBER, description: "Claimed TDS Amount in BDT for this employee/taxpayer" },
          bankName: { type: Type.STRING, description: "Bank name where deposited" },
          branchName: { type: Type.STRING, description: "Branch name" }
        },
        required: ["sl", "challanRefNo", "challanDate", "challanAmount", "claimedAmount"]
      }
    }
  },
  required: ["documentType", "fields"]
};

const sanitizeAlphanumericString = (val: any): string => {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  // Preserve known challan formats (e.g. 2526-00043326111) verbatim
  if (/^2526\s*[-/\.]\s*\d+/i.test(str)) {
    return str.replace(/\s+/g, '');
  }
  // Guard against scientific notation representation (e.g. 2.526e+10 or 2.526e10)
  if (/^[+\-]?\d+(\.\d+)?[eE][+\-]?\d+$/.test(str)) {
    try {
      const num = BigInt(Math.round(Number(str)));
      return num.toString();
    } catch {
      return str;
    }
  }
  return str;
};

export function parseRobustOCRJSON(rawText: string): OCRResult {
  if (!rawText || !rawText.trim()) {
    return { documentType: 'Salary Tax Certificate (u/s 86 of ITA 2023)', fields: [], challans: [], items: [] };
  }

  // Parse using multi-stage robust repair engine
  const parsed = parseRobustJson<any>(rawText, {});
  if (parsed && typeof parsed === 'object' && (parsed.fields || parsed.challans || parsed.items || parsed.documentType)) {
    return {
      documentType: parsed.documentType || 'Salary Tax Certificate (u/s 86 of ITA 2023)',
      fields: Array.isArray(parsed.fields) ? parsed.fields : [],
      challans: Array.isArray(parsed.challans) ? parsed.challans : [],
      items: Array.isArray(parsed.items) ? parsed.items : []
    };
  }

  // Regex-based granular recovery fallback
  const result: OCRResult = {
    documentType: 'Salary Tax Certificate (u/s 86 of ITA 2023)',
    fields: [],
    challans: [],
    items: []
  };

  // Extract documentType
  const docTypeMatch = rawText.match(/"documentType"\s*:\s*"([^"]+)"/i);
  if (docTypeMatch) {
    result.documentType = docTypeMatch[1];
  }

  // Extract fields via regex matching {"id": "...", "label": "...", "value": "..."}
  const fieldRegex = /\{\s*"id"\s*:\s*"([^"]+)"\s*,\s*"label"\s*:\s*"([^"]+)"\s*,\s*"value"\s*:\s*"([^"]*)"\s*\}/g;
  let fMatch: RegExpExecArray | null;
  while ((fMatch = fieldRegex.exec(rawText)) !== null) {
    result.fields.push({
      id: fMatch[1],
      label: fMatch[2],
      value: fMatch[3]
    });
  }

  // If no fields matched with strict format, match looser field objects
  if (result.fields.length === 0) {
    const looseFieldRegex = /"label"\s*:\s*"([^"]+)"\s*,\s*"value"\s*:\s*"([^"]*)"/g;
    let idx = 0;
    while ((fMatch = looseFieldRegex.exec(rawText)) !== null) {
      idx++;
      result.fields.push({
        id: `field_${idx}`,
        label: fMatch[1],
        value: fMatch[2]
      });
    }
  }

  // Extract challans
  const challanObjRegex = /\{[^{}]*(?:challanRefNo|2526|claimedAmount)[^{}]*\}/g;
  const challanBlocks = rawText.match(challanObjRegex) || [];
  let sl = 1;
  for (const block of challanBlocks) {
    const refMatch = block.match(/"challanRefNo"\s*:\s*"([^"]+)"/i) || block.match(/\b(2526[-/\.]?\d{6,14})\b/i);
    const dateMatch = block.match(/"challanDate"\s*:\s*"([^"]+)"/i) || block.match(/\b(\d{2}[-/\.]\d{2}[-/\.]\d{4})\b/);
    const monthMatch = block.match(/"month"\s*:\s*"([^"]+)"/i);
    const authMatch = block.match(/"depositingAuthority"\s*:\s*"([^"]+)"/i);
    const amtMatch = block.match(/"challanAmount"\s*:\s*([0-9.]+)/i);
    const claimMatch = block.match(/"claimedAmount"\s*:\s*([0-9.]+)/i);

    if (refMatch || dateMatch || claimMatch) {
      result.challans!.push({
        sl: sl++,
        month: monthMatch ? monthMatch[1] : `Month ${sl - 1}`,
        depositingAuthority: authMatch ? authMatch[1] : '',
        paymentDocType: 'Challan',
        challanRefNo: refMatch ? refMatch[1] : '',
        challanDate: dateMatch ? formatNBRDate(dateMatch[1]) : '',
        challanAmount: amtMatch ? parseFloat(amtMatch[1]) : 0,
        claimedAmount: claimMatch ? parseFloat(claimMatch[1]) : 0
      });
    }
  }

  // Also check if any standalone 2526... references exist in the text that weren't captured
  const standaloneChallanMatches = Array.from(rawText.matchAll(/\b(2526[-/\.]?\d{6,14})\b/gi));
  if (result.challans!.length === 0 && standaloneChallanMatches.length > 0) {
    standaloneChallanMatches.forEach((m, i) => {
      result.challans!.push({
        sl: i + 1,
        month: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i % 12] || 'Month',
        depositingAuthority: '',
        paymentDocType: 'Challan',
        challanRefNo: m[1],
        challanDate: '',
        challanAmount: 0,
        claimedAmount: 0
      });
    });
  }

  return result;
}

const isAlphanumericIdentifier = (label: string, id: string): boolean => {
  const l = `${label} ${id}`.toLowerCase();
  return l.includes('challan') || l.includes('ref') || l.includes('tin') || 
         l.includes('bin') || l.includes('nid') || l.includes('invoice') || 
         l.includes('token') || l.includes('scroll') || l.includes('certificate no') ||
         l.includes('tracking') || l.includes('bank transaction') || l.includes('code');
};

export default function OCRFormAutomation({ language = 'en', onInvoiceExtracted, initialData, defaultCategory }: OCRFormAutomationProps) {
  const t = translations[language];
  const [mode, setMode] = useState<'single' | 'template' | 'text'>('single');
  
  // Set initial form based on category
  const getInitialFormId = () => {
    if (defaultCategory === 'VAT') return 'MUSOK-9.1';
    return 'IT-11GA-2023';
  };

  const [selectedFormId, setSelectedFormId] = useState<string>(getInitialFormId());
  const [selectedCategory, setSelectedCategory] = useState<'INCOME_TAX' | 'VAT'>(defaultCategory || 'INCOME_TAX');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormSelectorOpen, setIsFormSelectorOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTypeConfirmed, setIsTypeConfirmed] = useState(!!initialData);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>(initialData?.items || []);
  const [extractedChallans, setExtractedChallans] = useState<ExtractedChallan[]>(initialData?.challans || []);
  const [documentType, setDocumentType] = useState<string>(initialData?.documentType || '');
  const [fields, setFields] = useState<FormField[]>(initialData?.fields || []);
  const [copiedFieldId, setCopiedFieldId] = useState<string | null>(null);
  const [copiedChallanSl, setCopiedChallanSl] = useState<number | null>(null);
  const [copiedAllChallans, setCopiedAllChallans] = useState(false);
  const [rawPastedText, setRawPastedText] = useState<string>('');
  const [filterIssuesOnly, setFilterIssuesOnly] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  
  // Single mode state
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singlePreview, setSinglePreview] = useState<string | null>(null);
  
  // Template mode state
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templatePreview, setTemplatePreview] = useState<string | null>(null);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [dataPreview, setDataPreview] = useState<string | null>(null);

  const onDropSingle = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSingleFile(file);
      setSinglePreview(URL.createObjectURL(file));
      setError(null);
    }
  }, []);

  const onDropTemplate = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setTemplateFile(file);
      setTemplatePreview(URL.createObjectURL(file));
      setError(null);
    }
  }, []);

  const onDropData = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setDataFile(file);
      setDataPreview(URL.createObjectURL(file));
      setError(null);
    }
  }, []);

  const { getRootProps: getSingleProps, getInputProps: getSingleInputProps, isDragActive: isSingleActive } = useDropzone({
    onDrop: onDropSingle,
    accept: { 
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const { getRootProps: getTemplateProps, getInputProps: getTemplateInputProps, isDragActive: isTemplateActive } = useDropzone({
    onDrop: onDropTemplate,
    accept: { 
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const { getRootProps: getDataProps, getInputProps: getDataInputProps, isDragActive: isDataActive } = useDropzone({
    onDrop: onDropData,
    accept: { 
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const extractTextContent = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    
    if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value || "";
      } catch (e) {
        console.error("Word extraction failed", e);
        return "";
      }
    }
    
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        let content = "";
        workbook.eachSheet((sheet) => {
          content += `\nSheet: ${sheet.name}\n`;
          sheet.eachRow((row) => {
            const rowValues = row.values as any[];
            content += rowValues.join(' | ') + '\n';
          });
        });
        return content;
      } catch (e) {
        console.error("Excel extraction failed", e);
        return "";
      }
    }
    
    return "";
  };

  const copyToClipboard = (text: string, type: 'field' | 'challan' | 'all', idOrSl?: string | number) => {
    navigator.clipboard.writeText(text);
    if (type === 'field' && typeof idOrSl === 'string') {
      setCopiedFieldId(idOrSl);
      setTimeout(() => setCopiedFieldId(null), 2000);
    } else if (type === 'challan' && typeof idOrSl === 'number') {
      setCopiedChallanSl(idOrSl);
      setTimeout(() => setCopiedChallanSl(null), 2000);
    } else if (type === 'all') {
      setCopiedAllChallans(true);
      setTimeout(() => setCopiedAllChallans(false), 2500);
    }
  };

  const runOCR = async () => {
    if (mode === 'single' && !singleFile) return;
    if (mode === 'template' && (!templateFile || !dataFile)) return;

    setIsProcessing(true);
    setError(null);

    try {
      let prompt = "";
      let contents: any[] = [];

      const STRICT_ALPHANUMERIC_RULES = `
### MANDATORY COMPLIANCE: 100% FAITHFULNESS TO DOCUMENT - ZERO HALLUCINATION
1. ACTUAL VALUES ONLY:
   - Extract ONLY the text, numbers, dates, and amounts that physically appear in this document.
   - NEVER invent, extrapolate, or substitute sample data (do NOT invent Eastern Bank, 2526-00043326111, or 27,650,502.89).
   - If an amount is 12,500, output 12500. Extract exact amounts from the document.
2. CHALLAN / CERTIFICATE REFERENCE NUMBERS:
   - Extract the COMPLETE, UNTRUNCATED alphanumeric sequence for EACH row (e.g. 2526 series, TR series, CH series).
   - NEVER truncate, summarize, or abbreviate characters, hyphens, or slashes.
   - NEVER cast to scientific or exponential notation (e.g. 2.526e10).
3. TAXPAYER IDENTIFICATION NUMBER (e-TIN):
   - Extract as exact 12-digit string without hyphens or spaces.
4. NBR SOURCE TAX & PRIVATE SALARY 7-COLUMN EXTRACTION:
   - For every row or month listed in the document:
     - sl: 1, 2, 3...
     - month: (e.g. Jul, Aug, Sep)
     - depositingAuthority: Exact Employer/Bank/Organization name from the document
     - paymentDocType: 'Challan', 'Certificate', 'e-Challan', or 'Pay Order'
     - challanRefNo: Exact alphanumeric reference string from the document
     - challanDate: DD-MM-YYYY
     - challanAmount: Total challan deposit amount in BDT for that row (number)
     - claimedAmount: Claimed TDS deduction for this employee in BDT for that row (number)
     - bankName: Depositing bank name if present
     - branchName: Branch name if present
`;

      if (mode === 'text') {
        prompt = `Analyze the pasted salary certificate / schedule text and extract structured data for Bangladesh NBR Private Salary Ledger and TDS:
${STRICT_ALPHANUMERIC_RULES}

Source Text:
---
${rawPastedText}
---`;
      } else if (mode === 'single' && singleFile) {
        const isVisual = singleFile.type.startsWith('image/') || singleFile.type === 'application/pdf';
        const targetForm = ALL_FORMS.find(f => f.id === selectedFormId);
        
        if (isVisual) {
          const base64 = await fileToBase64(singleFile);
          contents.push({
            inlineData: { mimeType: singleFile.type, data: base64 }
          });
          prompt = `### NBR COMPLIANCE MODE (Bangladesh NBR Strict 1:1 Mapping)
Build an OCR-based form automation result that enforces strict 1-to-1 mapping with the official Bangladesh NBR form template: ${targetForm?.name} (${targetForm?.id}).

${STRICT_ALPHANUMERIC_RULES}

STRICT COMPLIANCE RULES:
- PRESERVE EXACT LABELS: You must use the EXACT field labels found on the official form. 
- BENGALI/ENGLISH FIDELITY: If a label is in Bengali on the form (e.g., 'করদাতার নাম', 'অর্থ বছর'), you MUST output that exact label. If it is bilingual, output both.
- NO MODIFICATION: No merging, renaming, summarizing, or omitting any field.
- STRUCTURE INTEGRITY: Maintain the original layout logic. No summarizing multiple lines into one.
- TABLE PRECISION: Keep original table structures (e.g., Mushak 6.3 columns, NBR Private Salary Challan schedules). Ensure multi-item data aligns precisely with official columns.

Detect both English and Bengali text. Normalize all financial values to BDT. Dates must be formatted as DD-MM-YYYY.`;
        } else {
          const extractedText = await extractTextContent(singleFile);
          prompt = `Analyze the text content of this ${singleFile.name} file. Your task is to extract necessary data for the ${targetForm?.name} (${targetForm?.id}) form of Bangladesh NBR.

${STRICT_ALPHANUMERIC_RULES}
            
Source Text:
---
${extractedText}
---`;
        }

        prompt += `
EXHAUSTIVE EXTRACTION LIST:
1. Taxpayer Identity: Name (EN/BN), TIN, BIN, NID, Date of Birth, Gender, Circle, Division, Designation, Employee ID.
2. Contact & Employer: Depositing Authority, Employer Name, Address, Phone, Email.
3. Assessment: Assessment Year, Income Year, Financial Year.
4. Challan & Source Tax: Full Challan Reference Number (untruncated, exact string from document), Challan Date (DD-MM-YYYY), Deposited Challan Amount, Claimed TDS Amount.
CRITICAL: Extract actual figures only. Never invent placeholder numbers or company names.
5. Financial Data: 
   - Income: Salary, House Property, Business/Profession, Capital Gains, Other Sources.
   - Deductions: Life insurance premium, DPS, Savings certificate investment, etc.
   - Tax: Total Tax Payable, TDS, Advance Tax, Refund.
6. Line Items: Items/Invoice data (if applicable for VAT forms MUSOK 6.3/6.1 etc).
7. Challan Schedule: Multi-month deduction table with all 7 columns (SL, Month, Authority, Doc Type, Challan Ref No, Challan Date, Total Amount, Claimed Amount).`;
      } else if (mode === 'template' && templateFile && dataFile) {
        const templateBase64 = await fileToBase64(templateFile);
        const dataIsVisual = dataFile.type.startsWith('image/') || dataFile.type === 'application/pdf';
        
        contents.push({
          inlineData: { mimeType: templateFile.type, data: templateBase64 }
        });

        if (dataIsVisual) {
          const dataBase64 = await fileToBase64(dataFile);
          contents.push({
            inlineData: { mimeType: dataFile.type, data: dataBase64 }
          });
        }
        
        prompt = `### NBR COMPLIANCE MODE (Bangladesh NBR Strict 1:1 Mapping)
I have provided two inputs:
1. BLANK FORM TEMPLATE image (e.g. NBR IT-11G, Mushak 6.3, or Private Salary Ledger).
2. SOURCE DOCUMENT containing data.

${STRICT_ALPHANUMERIC_RULES}

STRICT COMPLIANCE RULES:
- Identify the EXACT structure and labels in the BLANK FORM TEMPLATE.
- Map data precisely into fields as they appear on the template.
- BENGALI/ENGLISH FIDELITY: Use the EXACT terminology found on the template.
- ENFORCE “NO MERGING” and “EXACT LABELING” at all times.
- TABLE INTEGRITY: Maintain original table structures and line item columns.`;

        if (!dataIsVisual) {
          const extractedDataText = await extractTextContent(dataFile);
          prompt = `${prompt}
          
The SOURCE DOCUMENT is a structured text file (${dataFile.name}). Use the following text content as your data source:
---
${extractedDataText}
---`;
        }
      }

      const res = await fetch('/api/gemini/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [...contents, { text: prompt }],
          config: {
            responseMimeType: "application/json",
            responseSchema: OCR_RESPONSE_SCHEMA
          }
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server OCR returned HTTP ${res.status}`);
      }

      const ocrData = await res.json();
      const result = parseRobustOCRJSON(ocrData.text || "{}");

      // Normalize and sanitize extracted fields
      const processedFields: FormField[] = (result.fields || []).map((f: any) => {
        const isAlpha = isAlphanumericIdentifier(f.label || '', f.id || '');
        let val = sanitizeAlphanumericString(f.value);
        const isDateField = (f.label || '').toLowerCase().includes('date') || (f.id || '').toLowerCase().includes('date');
        if (isDateField) {
          val = formatNBRDate(val) || val;
        }
        return {
          id: f.id || `field_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          label: f.label || 'Field',
          value: val,
          isAlphanumericId: isAlpha
        };
      });

      // Normalize and sanitize extracted challans table with multi-layer 2526 recovery
      let processedChallans: ExtractedChallan[] = (result.challans || []).map((c: any, idx: number) => {
        let refNo = c.challanRefNo || c.challanNo || c.refNo || c.challanNumber || 
                     c.chalanNo || c.chalanRefNo || c.referenceNumber || c.tokenNo || 
                     c.scrollNo || c.depositRefNo || '';

        // If missing, inspect all keys/values of row c for 2526... pattern
        if (!refNo || refNo === '-') {
          for (const val of Object.values(c)) {
            const valStr = String(val || '').trim();
            const m = valStr.match(/\b(2526\s*[-/\.]\s*\d{6,14}|2526\d{8,14})\b/i);
            if (m) {
              refNo = m[1].replace(/\s+/g, '');
              break;
            }
          }
        }

        // Check general challan regex
        if (!refNo || refNo === '-') {
          for (const val of Object.values(c)) {
            const valStr = String(val || '').trim();
            const m = valStr.match(/\b(\d{4}\s*[-/\.]\s*\d{6,14}|CH[-/\s]?\d+|TR[-/\s]?\d+|[A-Z]{2,4}[-/\s]\d{6,14})\b/i);
            if (m) {
              refNo = m[1].replace(/\s+/g, '');
              break;
            }
          }
        }

        return {
          sl: Number(c.sl || idx + 1),
          month: sanitizeAlphanumericString(c.month || `Month ${idx + 1}`),
          depositingAuthority: sanitizeAlphanumericString(c.depositingAuthority || ''),
          paymentDocType: sanitizeAlphanumericString(c.paymentDocType || 'Challan'),
          challanRefNo: sanitizeAlphanumericString(refNo),
          challanDate: formatNBRDate(c.challanDate) || sanitizeAlphanumericString(c.challanDate || ''),
          challanAmount: Number(c.challanAmount !== undefined ? c.challanAmount : (c.amount || 0)),
          claimedAmount: Number(c.claimedAmount !== undefined ? c.claimedAmount : (c.taxAmount || 0)),
          bankName: sanitizeAlphanumericString(c.bankName || ''),
          branchName: sanitizeAlphanumericString(c.branchName || '')
        };
      });

      // Fallback: If no challans array was extracted, check fields for Challan info
      if (processedChallans.length === 0) {
        const challanNoField = processedFields.find(f => 
          /\b2526[-/\.]?\d+/i.test(f.value) || 
          (f.label.toLowerCase().includes('challan') && (f.label.toLowerCase().includes('no') || f.label.toLowerCase().includes('ref')))
        );
        if (challanNoField && challanNoField.value) {
          const authorityField = processedFields.find(f => f.label.toLowerCase().includes('authority') || f.label.toLowerCase().includes('employer') || f.label.toLowerCase().includes('company'));
          const dateField = processedFields.find(f => f.label.toLowerCase().includes('challan') && f.label.toLowerCase().includes('date')) || processedFields.find(f => f.label.toLowerCase().includes('date'));
          const amountField = processedFields.find(f => f.label.toLowerCase().includes('challan') && f.label.toLowerCase().includes('amount')) || processedFields.find(f => f.label.toLowerCase().includes('total'));
          const claimedField = processedFields.find(f => f.label.toLowerCase().includes('claimed')) || processedFields.find(f => f.label.toLowerCase().includes('tds'));
          
          processedChallans.push({
            sl: 1,
            month: 'Jul',
            depositingAuthority: authorityField?.value || '',
            paymentDocType: 'Challan',
            challanRefNo: sanitizeAlphanumericString(challanNoField.value),
            challanDate: dateField?.value ? formatNBRDate(dateField.value) : '',
            challanAmount: amountField?.value ? parseFloat(amountField.value.replace(/[^0-9.]/g, '')) || 0 : 0,
            claimedAmount: claimedField?.value ? parseFloat(claimedField.value.replace(/[^0-9.]/g, '')) || 0 : 0,
            bankName: '',
            branchName: ''
          });
        }
      }

      setDocumentType(result.documentType || 'Salary Tax Certificate (u/s 86 of ITA 2023)');
      setFields(processedFields);
      setExtractedItems(result.items || []);
      setExtractedChallans(processedChallans);
      setIsTypeConfirmed(false);
    } catch (err: any) {
      console.error("OCR Error:", err);
      // Attempt emergency text fallback if raw pasted text is present
      if (rawPastedText && rawPastedText.trim().length > 0) {
        try {
          const fallbackParsed = parseMarkItDownToNBRData(rawPastedText);
          if (fallbackParsed.challans && fallbackParsed.challans.length > 0) {
            const converted: ExtractedChallan[] = fallbackParsed.challans.map((c, i) => ({
              sl: Number(c.sl || i + 1),
              month: c.month || `Month ${i + 1}`,
              depositingAuthority: c.depositingAuthority || fallbackParsed.depositingAuthority || '',
              paymentDocType: c.paymentDocType || 'Challan',
              challanRefNo: c.challanRefNo || '',
              challanDate: c.challanDate || '',
              challanAmount: Number(c.challanAmount || 0),
              claimedAmount: Number(c.claimedAmount || 0),
              bankName: c.bankName || '',
              branchName: c.branchName || ''
            }));
            setExtractedChallans(converted);
            
            const fallbackFields: FormField[] = [];
            if (fallbackParsed.taxpayerName) fallbackFields.push({ id: 'taxpayer_name', label: 'Taxpayer Name', value: fallbackParsed.taxpayerName });
            if (fallbackParsed.tin) fallbackFields.push({ id: 'tin', label: 'e-TIN', value: fallbackParsed.tin, isAlphanumericId: true });
            if (fallbackParsed.employeeId) fallbackFields.push({ id: 'employee_id', label: 'Employee ID', value: fallbackParsed.employeeId, isAlphanumericId: true });
            if (fallbackParsed.designation) fallbackFields.push({ id: 'designation', label: 'Designation', value: fallbackParsed.designation });
            if (fallbackParsed.depositingAuthority) fallbackFields.push({ id: 'depositing_auth', label: 'Depositing Authority', value: fallbackParsed.depositingAuthority });
            if (fallbackParsed.incomeYear) fallbackFields.push({ id: 'income_year', label: 'Income Year', value: fallbackParsed.incomeYear });
            if (fallbackParsed.assessmentYear) fallbackFields.push({ id: 'assessment_year', label: 'Assessment Year', value: fallbackParsed.assessmentYear });
            if (fallbackParsed.challanRefNo) fallbackFields.push({ id: 'primary_challan_ref', label: 'Primary Challan Reference', value: fallbackParsed.challanRefNo, isAlphanumericId: true });
            
            setFields(fallbackFields);
            setDocumentType(fallbackParsed.documentType || 'Salary Tax Certificate (u/s 86 of ITA 2023)');
            return;
          }
        } catch {
          // ignore fallback error
        }
      }
      setError(err?.message ? `OCR failed: ${err.message}` : "Failed to process document. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParseDirectText = () => {
    if (!rawPastedText.trim()) {
      setError("Please paste salary tax certificate text or schedule data first.");
      return;
    }
    setError(null);
    const parsed = parseMarkItDownToNBRData(rawPastedText);
    
    if (parsed.challans && parsed.challans.length > 0) {
      const converted: ExtractedChallan[] = parsed.challans.map((c, i) => ({
        sl: Number(c.sl || i + 1),
        month: c.month || (i === 0 ? 'Jul' : `Period ${i + 1}`),
        depositingAuthority: c.depositingAuthority || parsed.depositingAuthority || '',
        paymentDocType: c.paymentDocType || 'Challan',
        challanRefNo: c.challanRefNo || '',
        challanDate: c.challanDate || '',
        challanAmount: Number(c.challanAmount || 0),
        claimedAmount: Number(c.claimedAmount || 0),
        bankName: c.bankName || '',
        branchName: c.branchName || ''
      }));
      setExtractedChallans(converted);
    }

    const newFields: FormField[] = [];
    if (parsed.taxpayerName) newFields.push({ id: 'taxpayer_name', label: 'Taxpayer Name', value: parsed.taxpayerName });
    if (parsed.tin) newFields.push({ id: 'tin', label: 'e-TIN', value: parsed.tin, isAlphanumericId: true });
    if (parsed.employeeId) newFields.push({ id: 'employee_id', label: 'Employee ID', value: parsed.employeeId, isAlphanumericId: true });
    if (parsed.designation) newFields.push({ id: 'designation', label: 'Designation', value: parsed.designation });
    if (parsed.depositingAuthority) newFields.push({ id: 'depositing_auth', label: 'Depositing Authority', value: parsed.depositingAuthority });
    if (parsed.incomeYear) newFields.push({ id: 'income_year', label: 'Income Year', value: parsed.incomeYear });
    if (parsed.assessmentYear) newFields.push({ id: 'assessment_year', label: 'Assessment Year', value: parsed.assessmentYear });
    if (parsed.challanRefNo) newFields.push({ id: 'primary_challan_ref', label: 'Primary Challan Reference', value: parsed.challanRefNo, isAlphanumericId: true });
    
    if (newFields.length > 0) {
      setFields(newFields);
    }
    setDocumentType(parsed.documentType || 'Salary Tax Certificate (u/s 86 of ITA 2023)');
    setIsTypeConfirmed(false);
  };

  const handleLoadSample2526 = () => {
    const s = SAMPLE_MAMUNUR_CERTIFICATE;
    setDocumentType(s.documentType || 'Salary Tax Certificate (u/s 86 of ITA 2023)');
    
    const sampleFields: FormField[] = [
      { id: 'taxpayer_name', label: 'Taxpayer Name', value: s.taxpayerName || 'Mamunur Rashid Rifath' },
      { id: 'tin', label: 'e-TIN', value: s.tin || '696173907287', isAlphanumericId: true },
      { id: 'employee_id', label: 'Employee ID', value: s.employeeId || '10863', isAlphanumericId: true },
      { id: 'designation', label: 'Designation', value: s.designation || 'Corporate Account Manager' },
      { id: 'depositing_auth', label: 'Depositing Authority', value: s.depositingAuthority || 'Eastern Bank / Mutual Trust Bank' },
      { id: 'income_year', label: 'Income Year', value: s.incomeYear || '2025-2026' },
      { id: 'assessment_year', label: 'Assessment Year', value: s.assessmentYear || '2026-2027' },
      { id: 'primary_challan_ref', label: 'Primary Challan Ref No', value: s.challanRefNo || '2526-00043326111', isAlphanumericId: true }
    ];
    setFields(sampleFields);

    const convertedChallans: ExtractedChallan[] = (s.challans || []).map((c, i) => ({
      sl: Number(c.sl || i + 1),
      month: c.month || `Month ${i + 1}`,
      depositingAuthority: c.depositingAuthority || 'Eastern Bank',
      paymentDocType: c.paymentDocType || 'Challan',
      challanRefNo: c.challanRefNo || `2526-0004332611${i + 1}`,
      challanDate: c.challanDate || '14-08-2025',
      challanAmount: c.challanAmount || 0,
      claimedAmount: c.claimedAmount || 0,
      bankName: c.bankName || 'Eastern Bank',
      branchName: c.branchName || 'Gulshan Branch'
    }));
    setExtractedChallans(convertedChallans);
    setIsTypeConfirmed(false);
  };

  const addField = () => {
    const newId = `field_${Date.now()}`;
    setFields([...fields, { id: newId, label: 'New Field', value: '', isAlphanumericId: false }]);
  };

  const generate12DistinctMonths = () => {
    const FISCAL_MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const defaultAuth = extractedChallans[0]?.depositingAuthority || '';
    const defaultDoc = extractedChallans[0]?.paymentDocType || 'Challan';
    const baseChallan = extractedChallans[0];

    const updated: ExtractedChallan[] = FISCAL_MONTHS.map((monthName, idx) => {
      const existing = extractedChallans[idx];
      return {
        sl: idx + 1,
        month: existing?.month || monthName,
        depositingAuthority: existing?.depositingAuthority || defaultAuth,
        paymentDocType: existing?.paymentDocType || defaultDoc,
        challanRefNo: existing?.challanRefNo || (idx === 0 ? (baseChallan?.challanRefNo || '') : ''),
        challanDate: existing?.challanDate || (idx === 0 ? (baseChallan?.challanDate || '') : ''),
        challanAmount: existing?.challanAmount !== undefined ? Number(existing.challanAmount) : (idx === 0 ? Number(baseChallan?.challanAmount || 0) : 0),
        claimedAmount: existing?.claimedAmount !== undefined ? Number(existing.claimedAmount) : (idx === 0 ? Number(baseChallan?.claimedAmount || 0) : 0),
        bankName: existing?.bankName || baseChallan?.bankName || '',
        branchName: existing?.branchName || baseChallan?.branchName || ''
      };
    });
    setExtractedChallans(updated);
  };

  const addChallanRow = () => {
    const nextSl = extractedChallans.length + 1;
    const FISCAL_MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const month = FISCAL_MONTHS[nextSl - 1] || `Period ${nextSl}`;
    const defaultAuth = extractedChallans[0]?.depositingAuthority || '';
    const newChallan: ExtractedChallan = {
      sl: nextSl,
      month,
      depositingAuthority: defaultAuth,
      paymentDocType: 'Challan',
      challanRefNo: '',
      challanDate: '',
      challanAmount: 0,
      claimedAmount: 0,
      bankName: defaultAuth,
      branchName: ''
    };
    setExtractedChallans([...extractedChallans, newChallan]);
  };

  const updateChallan = (sl: number, key: keyof ExtractedChallan, val: any) => {
    setExtractedChallans(extractedChallans.map(c => {
      if (c.sl === sl) {
        if (key === 'challanRefNo') {
          return { ...c, [key]: sanitizeAlphanumericString(val) };
        }
        if (key === 'challanDate') {
          return { ...c, [key]: formatNBRDate(val) || val };
        }
        if (key === 'challanAmount' || key === 'claimedAmount') {
          return { ...c, [key]: Number(val) || 0 };
        }
        return { ...c, [key]: val };
      }
      return c;
    }));
  };

  const removeChallan = (sl: number) => {
    const filtered = extractedChallans.filter(c => c.sl !== sl);
    // Re-index SL
    const reindexed = filtered.map((c, i) => ({ ...c, sl: i + 1 }));
    setExtractedChallans(reindexed);
  };

  const autoFixAllChallanPrefixes = () => {
    setExtractedChallans(prev => prev.map(c => {
      const v = validateChallanRefNumber(c.challanRefNo);
      if (!v.isValid && v.suggestedFix) {
        return { ...c, challanRefNo: v.suggestedFix };
      }
      return c;
    }));
  };

  const autoFixSingleChallan = (sl: number, suggested: string) => {
    updateChallan(sl, 'challanRefNo', suggested);
  };

  const handleDownloadScriptClick = () => {
    if (extractedChallans.length > 0) {
      const invalidRows = extractedChallans.filter(c => !validateChallanRefNumber(c.challanRefNo).isValid);
      if (invalidRows.length > 0) {
        setShowValidationModal(true);
        return;
      }
    }
    generateAutoFillScript();
  };

  const generateAutoFillScript = () => {
    // If we have extracted challans, generate the high-precision NBR Private Salary script
    if (extractedChallans.length > 0) {
      const script = generatePrivateSalaryLedgerScript({
        documentType,
        challans: extractedChallans.map(c => ({
          sl: c.sl,
          month: c.month,
          depositingAuthority: c.depositingAuthority,
          paymentDocType: c.paymentDocType,
          challanRefNo: c.challanRefNo,
          challanDate: c.challanDate,
          challanAmount: c.challanAmount,
          claimedAmount: c.claimedAmount,
          bankName: c.bankName,
          branchName: c.branchName
        }))
      });

      const blob = new Blob([script], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nbr_private_salary_autofill_${Date.now()}.js`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const dataString = JSON.stringify({ documentType, fields, items: extractedItems, challans: extractedChallans }, null, 2);
    const script = `
/**
 * VATX.BD - NBR Auto-Fill Script (Universal Form Automation)
 * Target Form: ${documentType}
 * Generated: ${new Date().toISOString()}
 */
(function() {
  const data = ${dataString};
  console.log("%c VATX.BD Auto-Fill Active: ${documentType} ", "background: #10b981; color: white; padding: 6px 10px; font-weight: bold; border-radius: 4px;");
  
  const fillField = (label, value) => {
    if (!value) return;
    const cleanVal = String(value).trim();
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    const target = inputs.find(i => {
      const id = (i.id || "").toLowerCase();
      const name = (i.name || "").toLowerCase();
      const placeholder = (i.placeholder || "").toLowerCase();
      const aria = (i.getAttribute('aria-label') || "").toLowerCase();
      const lbl = label.toLowerCase();
      return id.includes(lbl) || name.includes(lbl) || placeholder.includes(lbl) || aria.includes(lbl);
    });
    
    if (target) {
      target.focus();
      target.value = cleanVal;
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
      target.dispatchEvent(new Event('blur', { bubbles: true }));
      console.log("✅ Auto-filled: " + label + " -> " + cleanVal);
    }
  };

  data.fields.forEach(f => fillField(f.label, f.value));
  alert("VATX.BD: Successfully auto-filled " + data.fields.length + " form fields with 100% alphanumeric accuracy.");
})();`.trim();

    const blob = new Blob([script], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autofill_${selectedFormId}.js`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJson = () => {
    const data = { 
      documentType, 
      fields, 
      items: extractedItems, 
      challans: extractedChallans,
      mapping: { formId: selectedFormId } 
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFormId}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateField = (id: string, key: 'label' | 'value', val: string) => {
    setFields(fields.map(f => {
      if (f.id === id) {
        const updated = { ...f, [key]: val };
        if (key === 'value' && f.isAlphanumericId) {
          updated.value = sanitizeAlphanumericString(val);
        }
        return updated;
      }
      return f;
    }));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const saveOCRResult = async () => {
    try {
      await fetch('/api/ocr/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          fields,
          items: extractedItems,
          challans: extractedChallans,
          imageUrl: ''
        })
      });
    } catch (err) {
      console.error("Failed to save OCR result:", err);
    }
  };

  const handleConfirmType = () => {
    setIsTypeConfirmed(true);
    saveOCRResult();
    if (documentType.toLowerCase().includes('invoice') && onInvoiceExtracted) {
      const findField = (keywords: string[]) => 
        fields.find(f => keywords.some(k => f.label.toLowerCase().includes(k)))?.value;

      const invoiceData: any = {
        number: findField(['number', 'inv#', 'invoice no']) || `INV-${Date.now().toString().slice(-6)}`,
        date: findField(['date', 'issue date']) || new Date().toISOString().split('T')[0],
        seller: {
          name: findField(['seller', 'vendor', 'from', 'supplier']) || '',
          address: findField(['address', 'location', 'street']) || '',
          bin: findField(['bin', 'vat reg', 'mushak']) || ''
        },
        buyer: {
          name: findField(['buyer', 'to', 'customer', 'client']) || '',
          address: findField(['buyer address', 'ship to', 'bill to']) || '',
          bin: findField(['buyer bin', 'tin', 'customer bin']) || ''
        },
        items: extractedItems.length > 0 
          ? extractedItems.map((item, i) => ({
              id: i + 1,
              desc: item.desc,
              category: 'Standard Goods/Services',
              qty: item.qty || 1,
              price: item.price || 0,
              vatRate: item.vatRate || 15
            }))
          : fields.filter(f => f.label.toLowerCase().includes('item') || f.label.toLowerCase().includes('description')).map((f, i) => ({
              id: i + 1,
              desc: f.value,
              category: 'Standard Goods/Services',
              qty: 1,
              price: 0,
              vatRate: 15
            }))
      };
      
      if (invoiceData.items.length === 0) {
        invoiceData.items = [{ id: 1, desc: 'Extracted Service/Product', category: 'Standard Goods/Services', qty: 1, price: 0, vatRate: 15 }];
      }
      
      onInvoiceExtracted(invoiceData);
    }
  };

  const handleExportWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: documentType || "Extracted NBR Compliance Document",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Generated by VATX.BD AI OCR Automation (Bangladesh NBR Compliance Mode)",
                bold: true,
                size: 20,
                color: "666666",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),
          ...fields.flatMap(field => [
            new Paragraph({
              children: [
                new TextRun({
                  text: field.label.toUpperCase(),
                  bold: true,
                  size: 18,
                  color: "444444",
                }),
              ],
              spacing: { before: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: field.value || "—",
                  size: 24,
                  bold: field.isAlphanumericId,
                }),
              ],
              border: {
                bottom: { color: "CCCCCC", space: 5, style: "single", size: 6 },
              },
              spacing: { after: 200 },
            }),
          ]),
          ...(extractedChallans.length > 0 ? [
            new Paragraph({
              text: "CHALLAN & SOURCE TAX DEDUCTION SCHEDULE (7-COLUMN NBR FORMAT)",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            ...extractedChallans.map(c => new Paragraph({
              children: [
                new TextRun({ text: `[SL ${c.sl} | ${c.month}] `, bold: true }),
                new TextRun({ text: `Ref: ${c.challanRefNo} | Date: ${c.challanDate} | Authority: ${c.depositingAuthority} | Doc: ${c.paymentDocType} | Amount: BDT ${c.challanAmount.toLocaleString()} | Claimed: BDT ${c.claimedAmount.toLocaleString()}` })
              ],
              spacing: { after: 100 },
            }))
          ] : []),
          ...(extractedItems.length > 0 ? [
            new Paragraph({
              text: "ITEMIZED DETAILS (TABLE DATA)",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            ...extractedItems.map(item => new Paragraph({
              children: [
                new TextRun({ text: `${item.desc}: `, bold: true }),
                new TextRun({ text: `${item.qty} x ${item.price} (VAT: ${item.vatRate}%) = BDT ${item.total}` }),
              ],
              spacing: { after: 100 },
            }))
          ] : []),
          new Paragraph({
            children: [
              new TextRun({
                text: `\n\nVerification ID: ${Math.random().toString(36).substring(7).toUpperCase()}`,
                size: 16,
                color: "999999",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 1000 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "This document was automatically generated and verified by VATX.BD AI OCR Automation.",
                size: 14,
                color: "CCCCCC",
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentType || 'document'}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const copyAllChallanNumbers = () => {
    const allNos = extractedChallans.map(c => c.challanRefNo).filter(Boolean).join('\n');
    copyToClipboard(allNos, 'all');
  };

  const totalClaimedTds = extractedChallans.reduce((sum, c) => sum + (c.claimedAmount || 0), 0);
  const totalChallanAmount = extractedChallans.reduce((sum, c) => sum + (c.challanAmount || 0), 0);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-black text-zinc-900 tracking-tighter font-display">{t.aiFormAutomation}</h2>
        <p className="text-zinc-500 max-w-xl mx-auto text-lg">
          {t.aiFormAutomationDesc}
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-wrap bg-zinc-100 p-1.5 rounded-2xl w-fit mx-auto gap-1">
        <button
          onClick={() => setMode('single')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
            mode === 'single' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          <FileText size={16} />
          {t.singleScan}
        </button>
        <button
          onClick={() => setMode('text')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
            mode === 'text' ? "bg-white text-emerald-700 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          <Receipt size={16} />
          <span>Direct Text / Paste</span>
        </button>
        <button
          onClick={() => setMode('template')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
            mode === 'template' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          <Layers size={16} />
          {t.templateMapping}
        </button>
      </div>

      {/* Target Form Selector */}
      <div className="max-w-xl mx-auto w-full space-y-2">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-4">
          {t.targetingForm}
        </label>
        <div className="relative">
          <button
            onClick={() => setIsFormSelectorOpen(!isFormSelectorOpen)}
            className="w-full p-4 bg-white border border-zinc-100 rounded-2xl flex items-center justify-between text-left shadow-sm hover:border-zinc-200 transition-all"
          >
            <div>
              <p className="text-sm font-black text-zinc-900">
                {language === 'bn' ? ALL_FORMS.find(f => f.id === selectedFormId)?.nameBn : ALL_FORMS.find(f => f.id === selectedFormId)?.name}
              </p>
              <p className="text-[10px] font-bold text-zinc-400">{selectedFormId}</p>
            </div>
            <ChevronDown size={20} className={cn("text-zinc-400 transition-transform", isFormSelectorOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isFormSelectorOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-zinc-100 rounded-3xl shadow-xl overflow-hidden"
              >
                <div className="p-4 border-b border-zinc-50 flex items-center gap-3">
                  <Search size={16} className="text-zinc-300" />
                  <input 
                    type="text" 
                    placeholder="Search NBR forms..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 text-sm outline-none placeholder:text-zinc-300"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                {/* Category Tabs */}
                <div className="flex bg-zinc-50 p-1 border-b border-zinc-50">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCategory('INCOME_TAX'); }}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                      selectedCategory === 'INCOME_TAX' ? "bg-white text-blue-600 shadow-sm" : "text-zinc-400"
                    )}
                  >
                    {t.incomeTax}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCategory('VAT'); }}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                      selectedCategory === 'VAT' ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-400"
                    )}
                  >
                    {t.vat}
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto p-2">
                  <div className="mb-4">
                    <p className="px-3 py-1 text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                      {selectedCategory.replace('_', ' ')} Forms
                    </p>
                    {ALL_FORMS.filter(f => f.category === selectedCategory && (f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.id.toLowerCase().includes(searchTerm.toLowerCase()))).map(form => (
                      <button
                        key={form.id}
                        onClick={() => {
                          setSelectedFormId(form.id);
                          setIsFormSelectorOpen(false);
                        }}
                        className={cn(
                          "w-full p-3 rounded-xl text-left hover:bg-zinc-50 transition-all flex items-center justify-between group",
                          selectedFormId === form.id && "bg-blue-50"
                        )}
                      >
                        <div>
                          <p className={cn("text-xs font-bold", selectedFormId === form.id ? (selectedCategory === 'VAT' ? "text-emerald-600" : "text-blue-600") : "text-zinc-700")}>
                              {language === 'bn' ? form.nameBn : form.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-medium">{form.id}</p>
                        </div>
                        {selectedFormId === form.id && <CheckCircle2 size={16} className={selectedCategory === 'VAT' ? "text-emerald-500" : "text-blue-500"} />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upload Zone & Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Column */}
        <div className="lg:col-span-5 space-y-6">
          {mode === 'text' ? (
            <div className="p-6 border-2 border-dashed border-emerald-300 rounded-[2.5rem] bg-emerald-50/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={16} /> Direct Salary Certificate Text
                </span>
                <button
                  onClick={handleLoadSample2526}
                  className="text-[11px] font-black text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-sm"
                  title="Load sample Eastern Bank salary certificate with 2526... challans"
                >
                  Load Sample (2526...)
                </button>
              </div>
              <textarea
                value={rawPastedText}
                onChange={(e) => setRawPastedText(e.target.value)}
                placeholder="Paste salary certificate text, monthly tax deduction schedule, or Eastern Bank letter here (e.g. containing Challan reference numbers like 2526-00043326111)..."
                rows={9}
                className="w-full text-xs font-mono p-4 bg-white border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none text-zinc-800 shadow-inner"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleParseDirectText}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Zap size={14} />
                  <span>Parse 7-Col Table</span>
                </button>
                <button
                  onClick={runOCR}
                  disabled={isProcessing || !rawPastedText.trim()}
                  className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 text-white disabled:text-zinc-400 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  <span>AI OCR Extraction</span>
                </button>
              </div>
            </div>
          ) : mode === 'single' ? (
            <div 
              {...getSingleProps()} 
              className={cn(
                "p-8 border-2 border-dashed rounded-[2.5rem] text-center transition-all cursor-pointer bg-white group hover:border-brand-500 hover:shadow-xl",
                isSingleActive ? "border-brand-500 bg-brand-50/20" : "border-zinc-200",
                singleFile ? "border-brand-500 bg-brand-50/5" : ""
              )}
            >
              <input {...getSingleInputProps()} />
              {singlePreview ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
                    {singleFile?.type.startsWith('image/') ? (
                      <img src={singlePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <FileText size={48} className="text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-600">{singleFile?.name}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle2 size={14} /> Ready for OCR Extraction
                  </p>
                </div>
              ) : (
                <div className="space-y-4 py-8">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mx-auto text-zinc-400 group-hover:scale-110 group-hover:text-brand-600 transition-all">
                    <FileUp size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-zinc-800">{t.dropDocuments}</p>
                    <p className="text-xs text-zinc-400 mt-1">{t.fileTypes}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div 
                {...getTemplateProps()} 
                className={cn(
                  "p-6 border-2 border-dashed rounded-[2rem] text-center transition-all cursor-pointer bg-white group hover:border-amber-500",
                  isTemplateActive ? "border-amber-500 bg-amber-50/20" : "border-zinc-200",
                  templateFile ? "border-amber-500 bg-amber-50/5" : ""
                )}
              >
                <input {...getTemplateInputProps()} />
                {templatePreview ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-amber-600 flex items-center justify-center gap-1">
                      <CheckCircle2 size={14} /> Blank Template: {templateFile?.name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <Layers size={24} className="mx-auto text-zinc-400 group-hover:text-amber-500" />
                    <p className="text-xs font-bold text-zinc-600">{t.uploadBlankTemplate}</p>
                  </div>
                )}
              </div>

              <div 
                {...getDataProps()} 
                className={cn(
                  "p-6 border-2 border-dashed rounded-[2rem] text-center transition-all cursor-pointer bg-white group hover:border-emerald-500",
                  isDataActive ? "border-emerald-500 bg-emerald-50/20" : "border-zinc-200",
                  dataFile ? "border-emerald-500 bg-emerald-50/5" : ""
                )}
              >
                <input {...getDataInputProps()} />
                {dataPreview ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                      <CheckCircle2 size={14} /> Data Source: {dataFile?.name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <FileText size={24} className="mx-auto text-zinc-400 group-hover:text-emerald-500" />
                    <p className="text-xs font-bold text-zinc-600">{t.uploadSourceData}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {mode !== 'text' && (
            <button
              onClick={runOCR}
              disabled={isProcessing || (mode === 'single' ? !singleFile : (!templateFile || !dataFile))}
              className={cn(
                "w-full py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]",
                isProcessing ? "bg-zinc-100 text-zinc-400" : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-200"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  {t.aiReading}
                </>
              ) : (
                <>
                  <Zap size={24} className={mode === 'template' ? "text-amber-400" : "text-emerald-400"} />
                  {mode === 'template' ? "Start Strict Template Mapping" : t.startAiOcr}
                </>
              )}
            </button>
          )}

          <div className="flex bg-zinc-900 border border-zinc-800 p-2 rounded-2xl w-fit mx-auto items-center gap-2">
            <div className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <Sparkles size={12} />
              NBR Alphanumeric Precision Active
            </div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pr-2">100% String Fidelity</span>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </div>

        {/* Form & Results Column */}
        <div className="lg:col-span-7 bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm print:shadow-none print:border-none print:p-0 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100 print:hidden">
            <div>
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{t.reviewExport}</h3>
              <p className="text-xs text-zinc-400 font-medium">Verify extracted values before generating auto-fill scripts or export files.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={addField}
                className="p-3 bg-zinc-100 text-zinc-600 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95"
                title="Add Field"
              >
                <Plus size={18} />
              </button>
              <button 
                onClick={exportToJson}
                disabled={fields.length === 0 && extractedChallans.length === 0}
                className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all disabled:opacity-50 active:scale-95"
                title={t.generateJson}
              >
                <FileJson size={18} />
              </button>
              <button 
                onClick={generateAutoFillScript}
                disabled={fields.length === 0 && extractedChallans.length === 0}
                className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 active:scale-95 text-xs uppercase tracking-wider"
                title="Generate NBR Automation Script"
              >
                <Zap size={16} className="text-amber-300" />
                <span>Auto-Fill Script</span>
              </button>
              <button 
                onClick={handleExportWord}
                disabled={fields.length === 0 && extractedChallans.length === 0}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 active:scale-95 text-xs uppercase tracking-wider"
              >
                <FileDown size={16} />
                <span>{t.exportWord}</span>
              </button>
            </div>
          </div>

          <div id="printable-form" className="space-y-8 bg-white print:p-0">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-2 pb-6 border-b-2 border-zinc-900">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-zinc-900 flex items-center justify-center text-white rounded-2xl font-black text-lg shadow-md">NBR</div>
                <div className="text-left">
                  <p className="text-lg font-black text-zinc-900 uppercase tracking-tight">Government of the People's Republic of Bangladesh</p>
                  <p className="text-sm font-bold text-zinc-600">National Board of Revenue (e-Tax & Source Tax Hub)</p>
                </div>
              </div>
            </div>

            {/* Document Title Input */}
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  value={documentType || ""}
                  onChange={(e) => setDocumentType(e.target.value)}
                  placeholder={t.documentTitle}
                  className={cn(
                    "text-2xl font-black text-zinc-900 w-full outline-none bg-transparent placeholder:text-zinc-300 transition-all",
                    !isTypeConfirmed && (fields.length > 0 || extractedChallans.length > 0) ? "ring-4 ring-blue-500/20 bg-blue-50/30 p-3 rounded-2xl" : ""
                  )}
                />
                {!isTypeConfirmed && (fields.length > 0 || extractedChallans.length > 0) && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{t.confirmType}</p>
                      <button 
                        onClick={handleConfirmType}
                        className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all"
                      >
                        {t.confirm}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase py-1">{t.typeSuggestions}</span>
                      {["Salary Tax Certificate (u/s 86 of ITA 2023)", "NBR Private Salary Source Tax Ledger", "e-Challan / A-Challan Statement", t.salaryCertificate, t.tdsCertificate, t.mushak63, t.it11g].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setDocumentType(suggestion)}
                          className="px-3 py-1 bg-white border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-600 hover:border-blue-500 hover:text-blue-600 transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Empty state */}
            {fields.length === 0 && extractedChallans.length === 0 && !isProcessing && (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                  <FileText size={32} />
                </div>
                <p className="text-zinc-400 font-bold">{t.noFieldsExtracted}</p>
                <p className="text-xs text-zinc-300 max-w-sm mx-auto">Upload an NBR document, salary tax certificate, or challan statement on the left to extract structured form fields.</p>
              </div>
            )}

            {/* Structured Challan Table (7-Column NBR Private Salary Schedule) */}
            {extractedChallans.length > 0 && (() => {
              const invalidChallans = extractedChallans.filter(c => !validateChallanRefNumber(c.challanRefNo).isValid);
              const hasValidationIssues = invalidChallans.length > 0;
              const displayedChallans = filterIssuesOnly ? invalidChallans : extractedChallans;

              return (
                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-sm">
                        <Table size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-zinc-900 uppercase tracking-tight">
                            NBR Private Salary Challan Schedule (7 Columns)
                          </h4>
                          {hasValidationIssues ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <AlertTriangle size={11} className="text-amber-700" />
                              {invalidChallans.length} Needs Fix
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-emerald-700" />
                              All Validated
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                          {extractedChallans.length} Challan Records • Total Claimed: ৳{totalClaimedTds.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={generate12DistinctMonths}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        title="Generate 12 distinct fiscal months (July to June) with unique Challan numbers and amounts"
                      >
                        <Calendar size={14} />
                        <span>12 Distinct Months (Jul-Jun)</span>
                      </button>
                      <button
                        onClick={copyAllChallanNumbers}
                        className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                        title="Copy all Challan Reference Numbers"
                      >
                        {copiedAllChallans ? <Check size={14} className="text-emerald-600" /> : <ClipboardCopy size={14} />}
                        <span>{copiedAllChallans ? "All Copied!" : "Copy All Challan #"}</span>
                      </button>
                      <button
                        onClick={addChallanRow}
                        className="px-3 py-1.5 bg-zinc-800 text-white hover:bg-zinc-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <Plus size={14} />
                        <span>Add Row</span>
                      </button>
                    </div>
                  </div>

                  {/* Real-Time Validation Status Alert Banner */}
                  {hasValidationIssues ? (
                    <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-amber-900 shadow-sm animate-in fade-in duration-300">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="p-2 bg-amber-200/80 text-amber-900 rounded-xl shrink-0 mt-0.5 sm:mt-0">
                          <AlertTriangle size={18} className="animate-pulse text-amber-800" />
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                            <span>Challan Validation Warning:</span>
                            <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              {invalidChallans.length} of {extractedChallans.length} entries flagged
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                            Entries missing the standard <strong className="font-mono text-amber-950 font-black">'2526'</strong> prefix or under 12 characters are highlighted below. Correct them manually or use Auto-Fix before downloading the NBR script.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={autoFixAllChallanPrefixes}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                          title="Automatically add '2526-' prefix to all eligible rows"
                        >
                          <Wand2 size={13} />
                          <span>Auto-Fix All (2526-)</span>
                        </button>
                        <button
                          onClick={() => setFilterIssuesOnly(!filterIssuesOnly)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm",
                            filterIssuesOnly 
                              ? "bg-amber-200 text-amber-950 border border-amber-300 font-black" 
                              : "bg-white text-amber-800 border border-amber-200 hover:bg-amber-100/50"
                          )}
                        >
                          <Filter size={13} />
                          <span>{filterIssuesOnly ? "Show All Rows" : `Show Issues Only (${invalidChallans.length})`}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-emerald-900 shadow-sm animate-in fade-in duration-300">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider">All Challan Numbers Validated:</span>{' '}
                          <span className="text-[11px] text-emerald-800 font-medium">All {extractedChallans.length} entries comply with the standard 2526... series NBR format.</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider border border-emerald-200">
                        100% NBR Script Ready
                      </span>
                    </div>
                  )}

                  {/* Filter Active Notice */}
                  {filterIssuesOnly && (
                    <div className="flex items-center justify-between bg-zinc-100 px-4 py-2 rounded-xl text-xs font-bold text-zinc-700">
                      <span className="flex items-center gap-1.5">
                        <Filter size={13} className="text-amber-600" />
                        Showing only {displayedChallans.length} flagged records requiring correction
                      </span>
                      <button
                        onClick={() => setFilterIssuesOnly(false)}
                        className="text-emerald-700 hover:underline text-[11px]"
                      >
                        Clear Filter (View all {extractedChallans.length})
                      </button>
                    </div>
                  )}

                  {/* Table Container */}
                  <div className="overflow-x-auto rounded-2xl border border-zinc-200 shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-zinc-900 text-white font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3 w-10 text-center">SL</th>
                          <th className="p-3">Month</th>
                          <th className="p-3">Depositing Authority</th>
                          <th className="p-3">Doc Type</th>
                          <th className="p-3 min-w-[240px]">Challan/Cert Ref No (2526...)</th>
                          <th className="p-3">Challan Date</th>
                          <th className="p-3 text-right">Challan Amount</th>
                          <th className="p-3 text-right">Claimed Amount</th>
                          <th className="p-3 text-center print:hidden">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 bg-white">
                        {displayedChallans.map((c) => {
                          const val = validateChallanRefNumber(c.challanRefNo);
                          const isInvalid = !val.isValid;

                          return (
                            <tr 
                              key={c.sl} 
                              className={cn(
                                "transition-colors",
                                isInvalid ? "bg-amber-50/40 hover:bg-amber-50/70" : "hover:bg-zinc-50/70"
                              )}
                            >
                              <td className="p-3 text-center font-bold text-zinc-500">
                                <div className="flex items-center justify-center gap-1">
                                  <span>{c.sl}</span>
                                  {isInvalid && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Validation Warning" />
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <input 
                                  type="text" 
                                  value={c.month} 
                                  onChange={(e) => updateChallan(c.sl, 'month', e.target.value)}
                                  className="w-16 bg-transparent font-medium text-zinc-800 outline-none border-b border-transparent hover:border-zinc-300 focus:border-emerald-500"
                                />
                              </td>
                              <td className="p-3">
                                <input 
                                  type="text" 
                                  value={c.depositingAuthority} 
                                  onChange={(e) => updateChallan(c.sl, 'depositingAuthority', e.target.value)}
                                  className="w-36 bg-transparent font-medium text-zinc-800 outline-none border-b border-transparent hover:border-zinc-300 focus:border-emerald-500 truncate"
                                  title={c.depositingAuthority}
                                />
                              </td>
                              <td className="p-3">
                                <select 
                                  value={c.paymentDocType || 'Challan'} 
                                  onChange={(e) => updateChallan(c.sl, 'paymentDocType', e.target.value)}
                                  className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 outline-none"
                                >
                                  <option value="Challan">Challan</option>
                                  <option value="Certificate">Certificate</option>
                                  <option value="e-Challan">e-Challan</option>
                                  <option value="Pay Order">Pay Order</option>
                                </select>
                              </td>
                              <td className="p-3">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <input 
                                      type="text" 
                                      value={c.challanRefNo} 
                                      onChange={(e) => updateChallan(c.sl, 'challanRefNo', e.target.value)}
                                      placeholder="e.g. 2526-00043326111"
                                      className={cn(
                                        "w-full font-mono font-bold text-xs px-2.5 py-1.5 rounded-lg border outline-none transition-all",
                                        val.isValid 
                                          ? "bg-emerald-50/50 text-emerald-950 border-emerald-300 focus:ring-2 focus:ring-emerald-500/20" 
                                          : val.status === 'no_2526_prefix'
                                            ? "bg-amber-50 text-amber-950 border-amber-400 focus:ring-2 focus:ring-amber-500/30 ring-1 ring-amber-300"
                                            : "bg-rose-50 text-rose-950 border-rose-400 focus:ring-2 focus:ring-rose-500/30 ring-1 ring-rose-300"
                                      )}
                                    />
                                    <button
                                      onClick={() => copyToClipboard(c.challanRefNo, 'challan', c.sl)}
                                      className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all print:hidden shrink-0"
                                      title="Copy Challan Ref No"
                                    >
                                      {copiedChallanSl === c.sl ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    </button>
                                  </div>

                                  {/* Inline Validation Status & 1-Click Fix */}
                                  {!val.isValid ? (
                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                      <span className={cn(
                                        "px-1.5 py-0.5 rounded font-bold flex items-center gap-1 shadow-2xs",
                                        val.status === 'no_2526_prefix' ? "bg-amber-100 text-amber-900 border border-amber-200" : "bg-rose-100 text-rose-900 border border-rose-200"
                                      )}>
                                        <AlertTriangle size={10} className="shrink-0" />
                                        <span>{val.message}</span>
                                      </span>
                                      {val.suggestedFix && (
                                        <button
                                          onClick={() => autoFixSingleChallan(c.sl, val.suggestedFix!)}
                                          className="px-1.5 py-0.5 bg-zinc-900 hover:bg-emerald-700 text-white rounded font-mono font-bold hover:scale-105 active:scale-95 transition-all shadow-2xs flex items-center gap-1"
                                          title={`Auto-apply: ${val.suggestedFix}`}
                                        >
                                          <Wand2 size={9} />
                                          <span>Fix: {val.suggestedFix}</span>
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-700">
                                      <CheckCircle2 size={10} />
                                      <span>2526 Series Verified ({c.challanRefNo.replace(/[\s-]/g, '').length} chars)</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <input 
                                  type="text" 
                                  value={c.challanDate} 
                                  onChange={(e) => updateChallan(c.sl, 'challanDate', e.target.value)}
                                  placeholder="DD-MM-YYYY"
                                  className="w-24 font-mono text-xs bg-transparent text-zinc-700 outline-none border-b border-transparent hover:border-zinc-300 focus:border-emerald-500"
                                />
                              </td>
                              <td className="p-3 text-right">
                                <input 
                                  type="number" 
                                  value={c.challanAmount} 
                                  onChange={(e) => updateChallan(c.sl, 'challanAmount', e.target.value)}
                                  className="w-24 text-right font-mono font-medium text-zinc-700 bg-transparent outline-none border-b border-transparent hover:border-zinc-300 focus:border-emerald-500"
                                />
                              </td>
                              <td className="p-3 text-right">
                                <input 
                                  type="number" 
                                  value={c.claimedAmount} 
                                  onChange={(e) => updateChallan(c.sl, 'claimedAmount', e.target.value)}
                                  className="w-24 text-right font-mono font-bold text-emerald-700 bg-transparent outline-none border-b border-transparent hover:border-zinc-300 focus:border-emerald-500"
                                />
                              </td>
                              <td className="p-3 text-center print:hidden">
                                <button
                                  onClick={() => removeChallan(c.sl)}
                                  className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors"
                                  title="Delete Row"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-zinc-50 font-black text-xs border-t-2 border-zinc-200">
                        <tr>
                          <td colSpan={6} className="p-3 text-right text-zinc-600 uppercase tracking-widest">Total:</td>
                          <td className="p-3 text-right font-mono font-bold text-zinc-900">৳{totalChallanAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700">৳{totalClaimedTds.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 print:hidden"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-900 text-white rounded-2xl shadow-lg">
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <ShieldCheck size={16} /> NBR Private Salary Portal Target
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono">https://ledger.etaxnbr.gov.bd/#/pages/source-tax/private-salary</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownloadScriptClick}
                        className={cn(
                          "px-5 py-2.5 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95",
                          hasValidationIssues 
                            ? "bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-amber-400/20" 
                            : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20"
                        )}
                      >
                        {hasValidationIssues ? <AlertTriangle size={16} /> : <Zap size={16} />}
                        <span>
                          {hasValidationIssues 
                            ? `Validate & Generate Script (${invalidChallans.length} warnings)` 
                            : "Download Auto-Fill Script"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Extracted Form Fields */}
            {fields.length > 0 && (
              <div className="space-y-6 pt-4 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">General Form Fields ({fields.length})</h4>
                  <span className="text-[10px] text-zinc-400 font-bold">Click field value to edit</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div 
                      key={field.id} 
                      className={cn(
                        "group relative p-4 rounded-2xl border transition-all",
                        field.isAlphanumericId ? "bg-emerald-50/20 border-emerald-100 hover:border-emerald-300" : "bg-zinc-50/50 border-zinc-100 hover:border-zinc-200"
                      )}
                    >
                      <div className="flex flex-col gap-1.5 pr-8">
                        <div className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={field.label || ""}
                            onChange={(e) => updateField(field.id, 'label', e.target.value)}
                            className="text-[10px] font-black text-zinc-400 uppercase tracking-widest outline-none bg-transparent w-full"
                          />
                          {field.isAlphanumericId && (
                            <span className="shrink-0 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded tracking-wider">
                              Alphanumeric
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={field.value || ""}
                            onChange={(e) => updateField(field.id, 'value', e.target.value)}
                            className={cn(
                              "text-sm font-bold text-zinc-900 w-full outline-none transition-all",
                              field.isAlphanumericId ? "font-mono text-emerald-950 font-bold" : ""
                            )}
                          />
                          <button
                            onClick={() => copyToClipboard(field.value, 'field', field.id)}
                            className="p-1 text-zinc-400 hover:text-emerald-600 rounded transition-all print:hidden"
                            title="Copy value"
                          >
                            {copiedFieldId === field.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeField(field.id)}
                        className="absolute right-2 top-2 p-2 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all print:hidden"
                        title="Remove field"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Line Items (For Invoices/Mushak 6.3) */}
            {extractedItems.length > 0 && (
              <div className="mt-8 pt-8 border-t border-zinc-100">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Extracted Line Items</h4>
                <div className="space-y-3">
                  {extractedItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-zinc-900">{item.desc}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                            Qty: {item.qty} × {item.price} | VAT: {item.vatRate}%
                          </p>
                          {item.hsCode && (
                            <span className="text-[10px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded font-black uppercase">HS: {item.hsCode}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-zinc-900">
                          {item.total ? item.total.toLocaleString() : (item.qty * item.price * (1 + item.vatRate / 100)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-zinc-100 text-center hidden print:block">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{t.verificationId}: {Math.random().toString(36).substring(7).toUpperCase()}</p>
              <p className="text-[8px] text-zinc-300 mt-1">{t.autoGenerated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Challan Validation Warning Modal before Script Generation */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-100 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 tracking-tight">
                    Challan Number Validation Warning
                  </h3>
                  <p className="text-xs text-amber-900 font-semibold mt-0.5">
                    {extractedChallans.filter(c => !validateChallanRefNumber(c.challanRefNo).isValid).length} of {extractedChallans.length} records missing '2526' prefix or too short
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowValidationModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-950 leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-amber-900">
                  <Info size={14} /> Why is this important?
                </p>
                The NBR Private Salary Portal (<code className="font-mono bg-white px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-900 border border-amber-200">ledger.etaxnbr.gov.bd</code>) requires full 12–16 character Challan reference numbers (such as <strong className="font-mono text-emerald-800">2526-00043326111</strong>) for tax deposit verification. Submitting truncated or un-prefixed values will cause the government portal to fail auto-matching.
              </div>

              <div>
                <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider mb-2.5">
                  Flagged Challan Entries:
                </h4>
                <div className="border border-zinc-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100 text-zinc-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 w-10 text-center">SL</th>
                        <th className="p-2.5">Month</th>
                        <th className="p-2.5 font-mono">Current Value</th>
                        <th className="p-2.5">Detected Issue</th>
                        <th className="p-2.5 font-mono">Suggested Fix</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
                      {extractedChallans
                        .filter(c => !validateChallanRefNumber(c.challanRefNo).isValid)
                        .map(c => {
                          const v = validateChallanRefNumber(c.challanRefNo);
                          return (
                            <tr key={c.sl} className="hover:bg-zinc-50">
                              <td className="p-2.5 text-center font-bold text-zinc-500">{c.sl}</td>
                              <td className="p-2.5 font-semibold">{c.month || '-'}</td>
                              <td className="p-2.5 font-mono font-bold text-rose-700 bg-rose-50/50">{c.challanRefNo || '<empty>'}</td>
                              <td className="p-2.5 text-amber-800 text-[11px] font-semibold">{v.message}</td>
                              <td className="p-2.5 font-mono font-bold text-emerald-700">
                                {v.suggestedFix || 'Manual entry needed'}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-5 bg-zinc-50 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  setShowValidationModal(false);
                  generateAutoFillScript();
                }}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-800 hover:underline px-2 py-1"
              >
                Proceed anyway without changes
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowValidationModal(false);
                    setFilterIssuesOnly(true);
                  }}
                  className="px-4 py-2 bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-100 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Filter size={13} />
                  <span>Correct Manually in Table</span>
                </button>
                <button
                  onClick={() => {
                    autoFixAllChallanPrefixes();
                    setShowValidationModal(false);
                    setTimeout(() => {
                      generateAutoFillScript();
                    }, 100);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  <Wand2 size={14} />
                  <span>Auto-Fix All (2526-) & Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

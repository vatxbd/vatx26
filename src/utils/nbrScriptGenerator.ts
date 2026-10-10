/**
 * VATX.BD - NBR Script Generator
 * Specifically tailored for NBR Source Tax Private Salary Ledger:
 * Target: https://ledger.etaxnbr.gov.bd/#/pages/source-tax/private-salary
 * And NBR TRMS Portal: https://trms.nbr.gov.bd
 * And NBR e-Tax: https://etaxnbr.gov.bd
 */

export interface ChallanEntry {
  sl?: number | string;
  month?: string;
  depositingAuthority?: string;
  paymentDocType?: string; // "Challan" | "Certificate" | "e-Challan" | "Pay Order"
  challanRefNo?: string;   // e.g. "2526-00043326111" or "CH-456307"
  challanNo?: string;      // Alias for challanRefNo
  challanDate?: string;    // e.g. "14-08-2025"
  date?: string;           // Alias for challanDate
  challanAmount?: number;  // Deposited Challan Amount
  claimedAmount?: number;  // Amount Relating to Certificate (TDS)
  bankName?: string;
  branchName?: string;
  deductionDate?: string;
  remarks?: string;
}

export interface NBRDocumentData {
  documentType?: string;
  taxpayerName?: string;
  vendorName?: string;
  depositingAuthority?: string;
  paymentDocType?: string;
  challanRefNo?: string;
  challanNo?: string;
  challanDate?: string;
  date?: string;
  challanAmount?: number;
  claimedAmount?: number;
  totalAmount?: number;
  taxAmount?: number;
  tin?: string;
  bin?: string;
  assessmentYear?: string;
  financialYear?: string;
  incomeYear?: string;
  designation?: string;
  employeeId?: string;
  salaryIncome?: number;
  housePropertyIncome?: number;
  businessIncome?: number;
  investmentAmount?: number;
  circle?: string;
  zone?: string;
  challans?: ChallanEntry[];
  entities?: Array<{ name: string; type: string; relevance?: string }>;
  summary?: string;
  confidence?: number;
}

/**
 * Normalizes date into DD-MM-YYYY format expected by NBR forms
 * Accurately parses "14 Aug 2025", "14-08-2025", "2025-08-14", "14/08/2025", etc.
 */
export function formatNBRDate(rawDate?: string): string {
  if (!rawDate) return '';
  const clean = String(rawDate).trim();
  
  // If already DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) return clean;
  // If DD/MM/YYYY or DD.MM.YYYY
  if (/^\d{2}[\/\.]\d{2}[\/\.]\d{4}$/.test(clean)) return clean.replace(/[\/\.]/g, '-');
  
  // Month name mapping
  const monthMap: Record<string, string> = {
    jan: '01', january: '01',
    feb: '02', february: '02',
    mar: '03', march: '03',
    apr: '04', april: '04',
    may: '05',
    jun: '06', june: '06',
    jul: '07', july: '07',
    aug: '08', august: '08',
    sep: '09', sept: '09', september: '09',
    oct: '10', october: '10',
    nov: '11', november: '11',
    dec: '12', december: '12'
  };

  // Pattern: "14 Aug 2025", "14-Aug-2025", "14 August 2025"
  const textMonthMatch = clean.match(/^(\d{1,2})[\s\-\/\.]([a-zA-Z]{3,10})[\s\-\/\.](\d{4})/);
  if (textMonthMatch) {
    const d = textMonthMatch[1].padStart(2, '0');
    const mStr = textMonthMatch[2].toLowerCase();
    const y = textMonthMatch[3];
    const m = monthMap[mStr] || monthMap[mStr.slice(0, 3)] || '01';
    return `${d}-${m}-${y}`;
  }

  // Pattern: "Aug 14, 2025" or "August 14 2025"
  const textMonthMatch2 = clean.match(/^([a-zA-Z]{3,10})[\s\-\/\.](\d{1,2}),?[\s\-\/\.](\d{4})/);
  if (textMonthMatch2) {
    const mStr = textMonthMatch2[1].toLowerCase();
    const d = textMonthMatch2[2].padStart(2, '0');
    const y = textMonthMatch2[3];
    const m = monthMap[mStr] || monthMap[mStr.slice(0, 3)] || '01';
    return `${d}-${m}-${y}`;
  }

  // Pattern: YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})[-/\.](\d{1,2})[-/\.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${d}-${m}-${y}`;
  }

  // Try JS Date
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const y = parsed.getFullYear();
    return `${d}-${m}-${y}`;
  }

  return clean;
}

/**
 * Sample pre-loaded NBR Salary Deduction Certificate (u/s 86 of ITA 2023)
 */
export const SAMPLE_MAMUNUR_CERTIFICATE: NBRDocumentData = {
  documentType: "Salary Tax Certificate (u/s 86 of ITA 2023)",
  taxpayerName: "Mamunur Rashid Rifath",
  depositingAuthority: "Eastern Bank / Mutual Trust Bank",
  vendorName: "Eastern Bank / Mutual Trust Bank",
  paymentDocType: "Challan",
  tin: "696173907287",
  employeeId: "10863",
  designation: "Corporate Account Manager",
  incomeYear: "2025-2026",
  financialYear: "2025-2026",
  assessmentYear: "2026-2027",
  taxAmount: 92772.51,
  claimedAmount: 92772.51,
  totalAmount: 533446864.08,
  challanAmount: 27650502.89,
  challanRefNo: "2526-00043326111",
  challanDate: "14-08-2025",
  challans: [
    {
      sl: 1,
      month: "Jul",
      challanRefNo: "2526-00043326111",
      challanDate: "14-08-2025",
      bankName: "Eastern Bank",
      branchName: "Gulshan Branch",
      challanAmount: 27650502.89,
      deductionDate: "21-07-2025",
      claimedAmount: 4131.97,
      depositingAuthority: "Eastern Bank",
      paymentDocType: "Challan"
    },
    {
      sl: 2,
      month: "Aug",
      challanRefNo: "2526-00078707191",
      challanDate: "15-09-2025",
      bankName: "Eastern Bank",
      branchName: "Gulshan Branch",
      challanAmount: 29920125.01,
      deductionDate: "19-08-2025",
      claimedAmount: 18803.55,
      depositingAuthority: "Eastern Bank",
      paymentDocType: "Challan"
    },
    {
      sl: 3,
      month: "Sep",
      challanRefNo: "2526-00126127781",
      challanDate: "14-10-2025",
      bankName: "Eastern Bank",
      branchName: "Gulshan Branch",
      challanAmount: 26786777.39,
      deductionDate: "22-09-2025",
      claimedAmount: 4131.97,
      depositingAuthority: "Eastern Bank",
      paymentDocType: "Challan"
    },
    {
      sl: 4,
      month: "Oct",
      challanRefNo: "2526-00184129981",
      challanDate: "13-11-2025",
      bankName: "Eastern Bank",
      branchName: "Gulshan Branch",
      challanAmount: 26156603.12,
      deductionDate: "20-10-2025",
      claimedAmount: 4131.97,
      depositingAuthority: "Eastern Bank",
      paymentDocType: "Challan"
    },
    {
      sl: 5,
      month: "Nov",
      challanRefNo: "2526-00206976301",
      challanDate: "14-12-2025",
      bankName: "Eastern Bank",
      branchName: "Gulshan Branch",
      challanAmount: 29640748.48,
      deductionDate: "19-11-2025",
      claimedAmount: 15178.58,
      depositingAuthority: "Eastern Bank",
      paymentDocType: "Challan"
    },
    {
      sl: 6,
      month: "Dec",
      challanRefNo: "2526-00229354061",
      challanDate: "14-01-2026",
      bankName: "Eastern Bank",
      branchName: "Gulshan Branch",
      challanAmount: 27945289.81,
      deductionDate: "21-12-2025",
      claimedAmount: 4131.97,
      depositingAuthority: "Eastern Bank",
      paymentDocType: "Challan"
    },
    {
      sl: 7,
      month: "Jan",
      challanRefNo: "2526-00333608961",
      challanDate: "10-02-2026",
      bankName: "Mutual Trust Bank",
      branchName: "Gulshan Branch",
      challanAmount: 27878811.54,
      deductionDate: "20-01-2026",
      claimedAmount: 4131.97,
      depositingAuthority: "Mutual Trust Bank",
      paymentDocType: "Challan"
    },
    {
      sl: 8,
      month: "Feb",
      challanRefNo: "2526-00423350741",
      challanDate: "12-03-2026",
      bankName: "Eastern Bank",
      branchName: "Gulshan Branch",
      challanAmount: 53027621.77,
      deductionDate: "19-02-2026",
      claimedAmount: 33998.56,
      depositingAuthority: "Eastern Bank",
      paymentDocType: "Challan"
    },
    {
      sl: 9,
      month: "Mar",
      challanRefNo: "2526-00477979431",
      challanDate: "13-04-2026",
      bankName: "Mutual Trust Bank",
      branchName: "Gulshan Branch",
      challanAmount: 155934516.65,
      deductionDate: "12-03-2026",
      claimedAmount: 4131.97,
      depositingAuthority: "Mutual Trust Bank",
      paymentDocType: "Challan"
    },
    {
      sl: 10,
      month: "Apr",
      challanRefNo: "2526-00537833651",
      challanDate: "13-05-2026",
      bankName: "Mutual Trust Bank",
      branchName: "Gulshan Branch",
      challanAmount: 51593173.61,
      deductionDate: "20-04-2026",
      claimedAmount: 0.00,
      depositingAuthority: "Mutual Trust Bank",
      paymentDocType: "Challan"
    },
    {
      sl: 11,
      month: "May",
      challanRefNo: "2526-00577260901",
      challanDate: "14-06-2026",
      bankName: "Mutual Trust Bank",
      branchName: "Gulshan Branch",
      challanAmount: 36083242.65,
      deductionDate: "19-05-2026",
      claimedAmount: 0.00,
      depositingAuthority: "Mutual Trust Bank",
      paymentDocType: "Challan"
    },
    {
      sl: 12,
      month: "Jun",
      challanRefNo: "2526-00606785121",
      challanDate: "28-06-2026",
      bankName: "Mutual Trust Bank",
      branchName: "Gulshan Branch",
      challanAmount: 30912717.79,
      deductionDate: "22-06-2026",
      claimedAmount: 0.00,
      depositingAuthority: "Mutual Trust Bank",
      paymentDocType: "Challan"
    }
  ]
};

/**
 * Parses raw copied text or table data from NBR TDS certificates / salary schedules
 */
export function parseRawSalaryCertificateText(rawText: string): Partial<NBRDocumentData> {
  if (!rawText || !rawText.trim()) return {};

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const result: Partial<NBRDocumentData> = {
    documentType: "Salary Tax Certificate (u/s 86 of ITA 2023)",
    paymentDocType: "Challan",
    challans: []
  };

  // 1. Extract Header Metadata
  for (const line of lines) {
    // Strip markdown bold/italic/heading formatting and convert 2-column pipe tables into Key: Value format
    const cleanMetaLine = line
      .replace(/[*_`#]/g, '')
      .replace(/^\s*[-•|]+\s*/, '')
      .replace(/\s*\|\s*$/, '')
      .replace(/\s*\|\s*/g, ': ')
      .trim();

    // Name
    const nameMatch = cleanMetaLine.match(/(?:Name|Taxpayer Name|Employee Name|Name of the Employee)[:\s]+([^\t,;|]+)/i);
    if (nameMatch && !result.taxpayerName) {
      const candidate = nameMatch[1].trim();
      if (candidate && !/^(designation|tin|e-tin|employee|salary|income|assessment)$/i.test(candidate)) {
        result.taxpayerName = candidate;
      }
    }

    // TIN
    const tinMatch = cleanMetaLine.match(/(?:TIN|TIN No|e-TIN|Taxpayer Identification Number)[:\s]+([0-9\s-]{10,16})/i);
    if (tinMatch && !result.tin) {
      result.tin = (tinMatch[1] || '').replace(/[\s-]/g, '').trim();
    }

    // Employee ID
    const idMatch = cleanMetaLine.match(/(?:Employee ID|Emp ID|Staff ID|PIN)[:\s]+([^\t,;|]+)/i);
    if (idMatch && !result.employeeId) {
      result.employeeId = idMatch[1].trim();
    }

    // Designation
    const desMatch = cleanMetaLine.match(/(?:Designation)[:\s]+([^\t,;|]+)/i);
    if (desMatch && !result.designation) {
      result.designation = desMatch[1].trim();
    }

    // Income Year
    const incMatch = cleanMetaLine.match(/(?:Income Year)[:\s]+([0-9\s/-]+)/i);
    if (incMatch && !result.incomeYear) {
      result.incomeYear = incMatch[1].trim();
    }

    // Assessment Year
    const assMatch = cleanMetaLine.match(/(?:Assessment Year)[:\s]+([0-9\s/-]+)/i);
    if (assMatch && !result.assessmentYear) {
      result.assessmentYear = assMatch[1].trim();
    }

    // Depositing Authority / Employer
    const authMatch = cleanMetaLine.match(/(?:Employer\s*\/\s*Depositing Authority|Depositing Authority|Employer|Company|Authority|Bank)[:\s]+([^\t,;|]+)/i);
    if (authMatch && !result.depositingAuthority) {
      const candidateAuth = authMatch[1].trim();
      if (candidateAuth && !/^(payment|challan|month|sl|amount|date)$/i.test(candidateAuth)) {
        result.depositingAuthority = candidateAuth;
      }
    }
  }

  // 2. Extract Table Rows
  const extractedChallans: ChallanEntry[] = [];
  const monthRegex = /\b(Jul|Aug|Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|July|August|September|October|November|December|January|February|March|April|June)\b/i;
  
  // Specific Regexes for Challan Reference Numbers (especially 2526... fiscal year series)
  const challan2526Regex = /\b(2526\s*[-/\.]\s*\d{6,14}|2526\d{8,14})\b/i;
  const generalChallanRegex = /(?:challan|chalan|ref|scroll|token|deposit|cert)?\s*(?:no|num|ref|#)?[:\s-]*\b(\d{4}\s*[-/\.]\s*\d{6,14}|CH[-/\s]?\d+|TR[-/\s]?\d+|[A-Z]{2,4}[-/\s]\d{6,14})\b/i;
  const alphanumericRefRegex = /\b([A-Z0-9]{3,6}-\d{6,14})\b/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip markdown table separator rows (e.g. |---|---|)
    if (/^\|?[\s\-:|]+\|?$/.test(line)) {
      continue;
    }

    // Skip headers and totals lines that don't contain monthly row data
    if (/^\s*\|?\s*(Month\s*\|\s*Challan|Total\s*Amount|Grand\s*Total|Total\b|Sub\s*Total|Certification|SL\s*No|SL\s*\||SL\tMonth)/i.test(line) && !challan2526Regex.test(line)) {
      continue;
    }

    const hasMonth = monthRegex.test(line);
    const has2526Challan = challan2526Regex.test(line);
    const hasGeneralChallan = generalChallanRegex.test(line);

    if (hasMonth || has2526Challan || hasGeneralChallan) {
      let month = '';
      let challanRefNo = '';
      let challanDate = '';
      let bankName = '';
      let branchName = '';
      let challanAmount = 0;
      let claimedAmount = 0;

      // Extract month
      const mMatch = line.match(monthRegex);
      if (mMatch) month = mMatch[1];

      // Extract full Challan No with top priority to 2526... pattern
      const match2526 = line.match(challan2526Regex);
      if (match2526) {
        challanRefNo = match2526[1].replace(/\s+/g, '');
      } else {
        const matchGen = line.match(generalChallanRegex);
        if (matchGen) {
          challanRefNo = matchGen[1].replace(/\s+/g, '');
        } else {
          const matchAlpha = line.match(alphanumericRefRegex);
          if (matchAlpha && !matchAlpha[1].startsWith('TIN') && !matchAlpha[1].startsWith('NID')) {
            challanRefNo = matchAlpha[1];
          }
        }
      }

      // Extract dates (e.g. 14 Aug 2025 or 14-08-2025 or 2025-08-14)
      const datesFound = line.match(/\b\d{1,2}[\s\-\/\.](?:[a-zA-Z]{3,10}|\d{1,2})[\s\-\/\.]\d{4}\b/g) || 
                         line.match(/\b\d{4}[\s\-\/\.]\d{1,2}[\s\-\/\.]\d{1,2}\b/g) || [];
      if (datesFound.length > 0) {
        challanDate = formatNBRDate(datesFound[0]);
      }

      // Create clean line without the extracted challanRefNo, dates, and TIN to avoid numeric misparsing
      let lineForNumbers = line;
      if (challanRefNo) {
        lineForNumbers = lineForNumbers.replace(challanRefNo, ' ');
      }
      datesFound.forEach(d => {
        lineForNumbers = lineForNumbers.replace(d, ' ');
      });
      if (result.tin) {
        lineForNumbers = lineForNumbers.replace(result.tin, ' ');
      }
      if (result.employeeId) {
        lineForNumbers = lineForNumbers.replace(result.employeeId, ' ');
      }
      // Remove any fiscal year notations like 2024-2025 or 2526 prefixes
      lineForNumbers = lineForNumbers.replace(/\b202[0-9][-/\.]202[0-9]\b/g, ' ');
      lineForNumbers = lineForNumbers.replace(/\b2526\b/g, ' ');

      // Extract numeric financial amounts (e.g. 5,000,000.00 or 15,250.50)
      const numbers = lineForNumbers.match(/\b\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?\b|\b\d+(?:\.\d{1,2})\b|\b\d{3,10}\b/g) || [];
      const cleanNums = numbers
        .map(n => parseFloat(n.replace(/,/g, '')))
        .filter(n => {
          if (isNaN(n) || n <= 0) return false;
          if (result.tin && String(n) === result.tin) return false;
          if (result.employeeId && String(n) === result.employeeId) return false;
          return true;
        });

      if (cleanNums.length >= 2) {
        challanAmount = Math.max(...cleanNums);
        claimedAmount = Math.min(...cleanNums);
      } else if (cleanNums.length === 1) {
        claimedAmount = cleanNums[0];
        challanAmount = cleanNums[0];
      }

      if (/\b0\.00\b/.test(line) && (claimedAmount === challanAmount || cleanNums.length === 1) && challanAmount > 1000) {
        claimedAmount = 0;
      }

      // Bank detection
      if (/Eastern Bank/i.test(line)) bankName = "Eastern Bank";
      else if (/Mutual Trust Bank/i.test(line)) bankName = "Mutual Trust Bank";
      else if (/Sonali Bank/i.test(line)) bankName = "Sonali Bank";
      else if (/BRAC Bank/i.test(line)) bankName = "BRAC Bank";
      else if (/City Bank/i.test(line)) bankName = "City Bank";
      else if (/Standard Chartered/i.test(line)) bankName = "Standard Chartered Bank";
      else if (/Islami Bank/i.test(line)) bankName = "Islami Bank Bangladesh";
      else if (/Dutch-Bangla|DBBL/i.test(line)) bankName = "Dutch-Bangla Bank";

      if (/Gulshan Branch/i.test(line)) branchName = "Gulshan Branch";
      else if (/Corporate Branch/i.test(line)) branchName = "Corporate Branch";
      else if (/Principal Branch/i.test(line)) branchName = "Principal Branch";

      if (challanRefNo || month || challanAmount > 0 || claimedAmount > 0) {
        const nextIndex = extractedChallans.length + 1;
        extractedChallans.push({
          sl: nextIndex,
          month: month || `Period ${nextIndex}`,
          depositingAuthority: bankName ? `${bankName}` : (result.depositingAuthority || ''),
          paymentDocType: 'Challan',
          challanRefNo: challanRefNo || '',
          challanDate: challanDate || '',
          challanAmount: challanAmount,
          claimedAmount: claimedAmount,
          bankName,
          branchName
        });
      }
    }
  }

  if (extractedChallans.length > 0) {
    result.challans = extractedChallans;
    result.challanRefNo = extractedChallans[0].challanRefNo;
    result.challanDate = extractedChallans[0].challanDate;
    result.challanAmount = extractedChallans[0].challanAmount;
    result.claimedAmount = extractedChallans[0].claimedAmount;
    result.taxAmount = extractedChallans.reduce((sum, c) => sum + (c.claimedAmount || 0), 0);
  }

  return result;
}

export function generatePrivateSalaryLedgerScript(data: NBRDocumentData): string {
  const defaultAuthority = String(data.depositingAuthority || data.vendorName || data.taxpayerName || '').trim();
  const defaultPaymentType = data.paymentDocType || 'Challan';
  const defaultRefNo = String(data.challanRefNo || data.challanNo || '').trim();
  const defaultDate = formatNBRDate(data.challanDate || data.date) || '';
  const defaultChallanAmt = Number(data.challanAmount !== undefined ? data.challanAmount : (data.totalAmount || 0));
  const defaultClaimedAmt = Number(data.claimedAmount !== undefined ? data.claimedAmount : (data.taxAmount || 0));

  let normalizedChallans: Array<ChallanEntry> = [];
  const rawChallans = Array.isArray(data.challans) ? data.challans : [];

  if (rawChallans.length > 0) {
    // Preserve authentic extracted challans 1-to-1 without fabricating rows or substituting fake amounts
    normalizedChallans = rawChallans.map((c, idx) => ({
      sl: Number(c.sl) || idx + 1,
      month: c.month || (idx === 0 ? 'Jul' : `Period ${idx + 1}`),
      depositingAuthority: c.depositingAuthority || defaultAuthority || '',
      paymentDocType: c.paymentDocType || defaultPaymentType,
      challanRefNo: String(c.challanRefNo || c.challanNo || defaultRefNo).trim(),
      challanDate: formatNBRDate(c.challanDate || c.date) || defaultDate,
      challanAmount: c.challanAmount !== undefined ? Number(c.challanAmount) : defaultChallanAmt,
      claimedAmount: c.claimedAmount !== undefined ? Number(c.claimedAmount) : defaultClaimedAmt,
      bankName: c.bankName || '',
      branchName: c.branchName || ''
    }));
  } else {
    // Single entry reflecting the extracted document
    normalizedChallans = [{
      sl: 1,
      month: 'Jul',
      depositingAuthority: defaultAuthority,
      paymentDocType: defaultPaymentType,
      challanRefNo: defaultRefNo,
      challanDate: defaultDate,
      challanAmount: defaultChallanAmt,
      claimedAmount: defaultClaimedAmt,
      bankName: '',
      branchName: ''
    }];
  }

  const payload = {
    ...data,
    depositingAuthority: defaultAuthority,
    paymentDocType: defaultPaymentType,
    challanRefNo: normalizedChallans[0]?.challanRefNo || defaultRefNo,
    challanDate: normalizedChallans[0]?.challanDate || defaultDate,
    challanAmount: normalizedChallans[0]?.challanAmount !== undefined ? normalizedChallans[0].challanAmount : defaultChallanAmt,
    claimedAmount: normalizedChallans[0]?.claimedAmount !== undefined ? normalizedChallans[0].claimedAmount : defaultClaimedAmt,
    challans: normalizedChallans
  };

  const safeData = JSON.stringify(payload, null, 2);

  return `
/**
 * ====================================================================
 * VATX.BD - NBR Source Tax Private Salary Ledger Auto-Fill Assistant
 * Target URL: https://ledger.etaxnbr.gov.bd/#/pages/source-tax/private-salary
 * Supported Form Columns:
 *  1. SL.
 *  2. Depositing Authority (placeholder: "Enter Depositing Authority")
 *  3. Payment Document Type (e.g. "Challan" / "Certificate")
 *  4. Challan/ Certificate Reference No. (e.g. "2526-00043326111")
 *  5. Challan/ Certificate Date (e.g. "14-08-2025")
 *  6. Challan/ Certificate Amount (placeholder: "Enter Amount")
 *  7. Claimed Amount (placeholder: "Enter Claimed Amount")
 *  8. Action (Add / Save)
 * ====================================================================
 */
(function() {
  'use strict';

  // Remove existing helper if present
  const old = document.getElementById('vatx-nbr-helper');
  if (old) old.remove();

  const payload = ${safeData};
  let challans = Array.isArray(payload.challans) && payload.challans.length > 0 ? [...payload.challans] : [];
  let currentIndex = 0;
  let isMinimized = false;

  console.log("%c [VATX.BD] NBR Private Salary Source Tax Ledger Automation Active ", "background: #059669; color: white; font-weight: bold; font-size: 13px; padding: 6px 12px; border-radius: 8px;");
  console.log("Loaded Challan Schedule (12 Months):", challans);

  // Helper to reliably trigger Angular / React / Vue reactive form bindings
  function setInputValue(input, val) {
    if (!input || val === undefined || val === null) return false;
    const strVal = String(val).trim();
    try {
      input.focus();
      const proto = input.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) {
        setter.call(input, strVal);
      } else {
        input.value = strVal;
      }
      
      // Trigger all reactive and synthetic events for Angular / React / Vue
      ['input', 'change', 'blur', 'keyup', 'paste'].forEach(evtType => {
        input.dispatchEvent(new Event(evtType, { bubbles: true, cancelable: true }));
      });

      // Visual feedback pulse
      const prevBorder = input.style.border;
      const prevShadow = input.style.boxShadow;
      input.style.border = '2px solid #10b981';
      input.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.2)';
      setTimeout(() => {
        input.style.border = prevBorder;
        input.style.boxShadow = prevShadow;
      }, 1200);

      return true;
    } catch(err) {
      input.value = strVal;
      return false;
    }
  }

  function setDropdownValue(selectOrElement, val) {
    if (!selectOrElement || !val) return false;
    const target = String(val).toLowerCase().trim();
    
    if (selectOrElement.tagName === 'SELECT') {
      const opts = Array.from(selectOrElement.options);
      const match = opts.find(o => o.text.toLowerCase().includes(target) || o.value.toLowerCase().includes(target));
      if (match) {
        selectOrElement.value = match.value;
        selectOrElement.dispatchEvent(new Event('change', { bubbles: true }));
        selectOrElement.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      if (opts.length > 1 && !selectOrElement.value) {
        selectOrElement.selectedIndex = 1;
        selectOrElement.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    
    // If it's a custom dropdown or input (e.g., Angular mat-select or ng-select or input)
    if (selectOrElement.tagName === 'INPUT') {
      return setInputValue(selectOrElement, val);
    }
    return false;
  }

  // Toast Notification
  function showToast(msg, isSuccess = true) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed',
      top: '24px',
      right: '24px',
      background: isSuccess ? '#065f46' : '#991b1b',
      color: '#ecfdf5',
      padding: '10px 18px',
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: 'bold',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      zIndex: '1000000',
      transition: 'all 0.3s ease'
    });
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }

  function copyText(val, label) {
    if (val !== undefined && val !== null) {
      const fullText = String(val).trim();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(fullText).then(() => {
          showToast('Copied ' + label + ': ' + fullText);
        }).catch(() => {
          fallbackCopy(fullText, label);
        });
      } else {
        fallbackCopy(fullText, label);
      }
    }
  }

  function fallbackCopy(fullText, label) {
    const temp = document.createElement('textarea');
    temp.value = fullText;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    temp.remove();
    showToast('Copied ' + label + ': ' + fullText);
  }

  // Auto-clicks the "+ Add" button on the top right of NBR Private Salary table
  function triggerAddRowButton() {
    const candidateButtons = Array.from(document.querySelectorAll('button, a, .btn, [role="button"], span'));
    const addBtn = candidateButtons.find(b => {
      const txt = (b.textContent || '').trim().toLowerCase();
      const title = (b.getAttribute('title') || '').toLowerCase();
      const aria = (b.getAttribute('aria-label') || '').toLowerCase();
      return txt.includes('add') || txt.includes('+ add') || txt.includes('add row') || 
             txt === '+' || txt.includes('নতুন যোগ') || title.includes('add') || aria.includes('add');
    });
    if (addBtn) {
      addBtn.click();
      return true;
    }
    return false;
  }

  // Returns all table rows or form blocks in the private salary ledger interface
  function getTableRows() {
    const tbodyRows = Array.from(document.querySelectorAll('table tbody tr, .data-row, .ledger-row, .salary-row, [formarrayname] > tr'));
    if (tbodyRows.length > 0) return tbodyRows;
    return [];
  }

  // Finds the active editable row or the specific row at index
  function findTargetRow(index) {
    const rows = getTableRows();
    if (rows.length === 0) return document;

    // 1. If a row is currently in edit mode (contains inputs with error or empty inputs)
    const editingRows = rows.filter(r => r.querySelectorAll('input:not([type="hidden"])').length >= 3);
    
    // If the row at index is currently being edited, use it
    if (rows.length > index && rows[index].querySelectorAll('input:not([type="hidden"])').length >= 3) {
      return rows[index];
    }

    // Otherwise use the first active editing row
    if (editingRows.length > 0) {
      return editingRows[0];
    }

    // Or the indexed row
    if (rows.length > index) {
      return rows[index];
    }

    return rows[rows.length - 1];
  }

  // Auto-Fill Function targeting the 7 specific NBR columns in the active or indexed row
  function fillChallanRecord(record, targetRow = null, rowIndex = -1) {
    if (!record) return 0;
    let filled = 0;
    const isExplicitRow = !!targetRow;
    const scope = targetRow || findTargetRow(rowIndex >= 0 ? rowIndex : currentIndex);
    const inputs = Array.from(scope.querySelectorAll('input:not([type="hidden"]), select, textarea'));

    // Helper to find input strictly within scope, or globally only if scope is document
    function findInput(matcher, colSelector, globalSelector) {
      const match = inputs.find(matcher);
      if (match) return match;
      if (colSelector) {
        const colMatch = scope.querySelector(colSelector);
        if (colMatch) return colMatch;
      }
      if (!isExplicitRow && globalSelector && scope === document) {
        return document.querySelector(globalSelector);
      }
      return null;
    }

    // Field 1: Depositing Authority (placeholder: "Enter Depositing Authority")
    const authInput = findInput(
      i => {
        const p = (i.placeholder || '').toLowerCase();
        const n = (i.name || '').toLowerCase();
        const fcn = (i.getAttribute('formcontrolname') || '').toLowerCase();
        return p.includes('authority') || p.includes('depositing') || fcn.includes('authority') || fcn.includes('bank') || n.includes('authority');
      },
      'td:nth-child(2) input',
      'input[placeholder*="Authority" i]'
    );

    const authVal = record.depositingAuthority || payload.depositingAuthority || payload.vendorName || payload.taxpayerName || '';
    if (authInput && authVal) {
      if (setInputValue(authInput, authVal)) filled++;
    }

    // Field 2: Payment Document Type ("Challan" / "Certificate")
    const docTypeEl = inputs.find(i => i.tagName === 'SELECT' || (i.getAttribute('formcontrolname') || '').toLowerCase().includes('doc')) 
                   || scope.querySelector('td:nth-child(3) select') 
                   || (!isExplicitRow && scope === document ? document.querySelector('select') : null);
    const docTypeVal = record.paymentDocType || 'Challan';
    if (docTypeEl && docTypeVal) {
      if (setDropdownValue(docTypeEl, docTypeVal)) filled++;
    }

    // Field 3: Challan/ Certificate Reference No. (e.g. "2526-00043326111")
    const refNoInput = findInput(
      i => {
        const p = (i.placeholder || '').toLowerCase();
        const n = (i.name || '').toLowerCase();
        const fcn = (i.getAttribute('formcontrolname') || '').toLowerCase();
        return p.includes('challan') || p.includes('ref') || p.includes('certificate') || fcn.includes('ref') || fcn.includes('challan') || n.includes('ref');
      },
      'td:nth-child(4) input',
      'input[placeholder*="Challan" i]'
    );

    const refVal = String(record.challanRefNo || record.challanNo || '').trim();
    if (refNoInput && refVal) {
      if (setInputValue(refNoInput, refVal)) filled++;
    }

    // Field 4: Challan/ Certificate Date (e.g. "14-08-2025")
    const dateInput = findInput(
      i => {
        const p = (i.placeholder || '').toLowerCase();
        const fcn = (i.getAttribute('formcontrolname') || '').toLowerCase();
        return i.type === 'date' || p.includes('date') || p.includes('dd-mm') || p.includes('dd/mm') || fcn.includes('date');
      },
      'td:nth-child(5) input',
      'input[placeholder*="Date" i]'
    );

    const dateVal = record.challanDate || record.date || '';
    if (dateInput && dateVal) {
      if (dateInput.type === 'date' && /^\\d{2}-\\d{2}-\\d{4}$/.test(dateVal)) {
        const parts = dateVal.split('-');
        const iso = parts[2] + '-' + parts[1] + '-' + parts[0];
        if (setInputValue(dateInput, iso)) filled++;
      } else {
        if (setInputValue(dateInput, dateVal)) filled++;
      }
    }

    // Field 5: Challan/ Certificate Amount (placeholder: "Enter Amount")
    const amtInput = findInput(
      i => {
        const p = (i.placeholder || '').toLowerCase();
        const fcn = (i.getAttribute('formcontrolname') || '').toLowerCase();
        return (p.includes('amount') || fcn.includes('amount') || fcn.includes('challanamount')) && !p.includes('claimed') && !fcn.includes('claimed');
      },
      'td:nth-child(6) input',
      'input[placeholder="Enter Amount" i]'
    );

    const amtVal = record.challanAmount !== undefined ? record.challanAmount : (record.claimedAmount || 0);
    if (amtInput && amtVal !== undefined) {
      if (setInputValue(amtInput, String(amtVal))) filled++;
    }

    // Field 6: Claimed Amount (placeholder: "Enter Claimed Amount")
    const claimedInput = findInput(
      i => {
        const p = (i.placeholder || '').toLowerCase();
        const fcn = (i.getAttribute('formcontrolname') || '').toLowerCase();
        return p.includes('claimed') || fcn.includes('claimed') || fcn.includes('tax') || p.includes('tds');
      },
      'td:nth-child(7) input',
      'input[placeholder*="Claimed" i]'
    );

    const claimedVal = record.claimedAmount !== undefined ? record.claimedAmount : 0;
    if (claimedInput && claimedVal !== undefined) {
      if (setInputValue(claimedInput, String(claimedVal))) filled++;
    }

    return filled;
  }

  // Clicks the green Save button inside the row to persist it
  function saveTargetRow(scope) {
    if (!scope) return false;
    const saveBtn = scope.querySelector('button.btn-success, button[title*="save" i], button.btn-save, .fa-save, .fa-check, [title="Save"]');
    if (saveBtn) {
      const btn = saveBtn.tagName === 'BUTTON' ? saveBtn : saveBtn.closest('button');
      if (btn) {
        btn.click();
        return true;
      }
    }
    return false;
  }

  // Automates sequentially filling ALL 12 months with automatic row generation
  async function fillAll12Months() {
    showToast('🚀 Starting 12-Month Batch Fill Routine...', true);
    let totalFilledRows = 0;

    for (let idx = 0; idx < challans.length; idx++) {
      const record = challans[idx];
      currentIndex = idx;
      render();

      let rows = getTableRows();

      // If needed row doesn't exist yet, click + Add button
      if (rows.length <= idx) {
        triggerAddRowButton();
        await new Promise(r => setTimeout(r, 450));
        rows = getTableRows();
      }

      const targetRow = rows.length > idx ? rows[idx] : findTargetRow(idx);
      const fieldsCount = fillChallanRecord(record, targetRow, idx);
      
      if (fieldsCount > 0) {
        totalFilledRows++;
        showToast('✔ Filled ' + (record.month || ('Month ' + (idx + 1))) + ': Ref ' + (record.challanRefNo || '') + ' | TDS ৳' + (record.claimedAmount || 0), true);
        await new Promise(r => setTimeout(r, 200));
        saveTargetRow(targetRow);
      }

      await new Promise(r => setTimeout(r, 350));
    }

    if (totalFilledRows > 0) {
      showToast('🎉 Successfully populated ' + totalFilledRows + ' of ' + challans.length + ' distinct monthly ledger entries!', true);
    } else {
      fillChallanRecord(challans[currentIndex] || challans[0]);
    }
  }

  // Create Floating Assistant UI Widget
  const container = document.createElement('div');
  container.id = 'vatx-nbr-helper';
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.08)',
    zIndex: '999999',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
    border: '2px solid #059669'
  });

  function render() {
    if (challans.length === 0) {
      container.innerHTML = '<div style="padding: 16px; font-size: 12px; color: #64748b;">No challan records loaded.</div>';
      return;
    }

    // Safety boundary
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex >= challans.length) currentIndex = challans.length - 1;

    const c = challans[currentIndex] || challans[0];
    const fullRefNo = String(c.challanRefNo || c.challanNo || '2526-00043326111').trim();

    if (isMinimized) {
      container.style.width = 'auto';
      container.innerHTML = \`
        <div style="background: #059669; color: white; padding: 8px 14px; display: flex; align-items: center; gap: 8px; cursor: pointer; border-radius: 20px;" id="vatx-restore">
          <span style="font-weight: 900; font-size: 12px;">⚡ VATX Private Salary Helper</span>
          <span style="font-size: 10px; background: rgba(255,255,255,0.25); padding: 2px 8px; border-radius: 8px; font-weight: bold;">
            SL \${currentIndex + 1}: \${c.month || 'Month'} (\${currentIndex + 1}/\${challans.length})
          </span>
        </div>
      \`;
      document.getElementById('vatx-restore').onclick = () => {
        isMinimized = false;
        container.style.width = '400px';
        render();
      };
      return;
    }

    // Build 12-Month Quick Selector Tabs
    const monthTabsHtml = challans.map((item, idx) => {
      const isSelected = idx === currentIndex;
      const label = item.month || (idx + 1);
      return \`
        <button 
          data-month-idx="\${idx}" 
          class="vatx-month-chip"
          style="padding: 4px 6px; font-size: 10px; font-weight: 800; border-radius: 6px; border: 1px solid \${isSelected ? '#059669' : '#e2e8f0'}; background: \${isSelected ? '#059669' : '#f8fafc'}; color: \${isSelected ? '#ffffff' : '#334155'}; cursor: pointer; transition: all 0.15s; white-space: nowrap;"
          title="Jump to SL \${idx + 1}: \${label}"
        >
          \${idx + 1}:\${label}
        </button>
      \`;
    }).join('');

    container.innerHTML = \`
      <div style="display: flex; flex-direction: column;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 26px; height: 26px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px;">⚡</div>
            <div>
              <div style="font-size: 13px; font-weight: 900; letter-spacing: -0.2px;">VATX Private Salary Helper</div>
              <div style="font-size: 10px; color: #a7f3d0;">ledger.etaxnbr.gov.bd/#/pages/source-tax/private-salary</div>
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button id="vatx-min" title="Minimize" style="background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 6px; width: 24px; height: 24px; cursor: pointer; font-weight: bold;">_</button>
            <button id="vatx-close" title="Close" style="background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 6px; width: 24px; height: 24px; cursor: pointer; font-weight: bold;">✕</button>
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 14px 16px; max-height: 520px; overflow-y: auto;">
          <!-- Easy Bangla Tip Banner -->
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 10px; padding: 8px 10px; margin-bottom: 10px; font-size: 11px; color: #92400e; font-weight: 700; line-height: 1.4;">
            💡 <strong>সহজ নির্দেশিকা:</strong> নিচের <strong>"🚀 ১-ক্লিকে সব এন্ট্রি অটো-ফিল"</strong> বাটনে চাপলেই সব মাসের চালান ও টাকার অংক স্বয়ংক্রিয়ভাবে পূরণ হয়ে যাবে!
          </div>

          <!-- 12-Month Selector Bar -->
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Select Month / মাস নির্বাচন (1 - \${challans.length}):</span>
              <button id="vatx-add-month-btn" style="padding: 2px 6px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; font-size: 9px; font-weight: 800; color: #065f46; cursor: pointer;">+ নতুন মাস (Add)</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px;">
              \${monthTabsHtml}
            </div>
          </div>

          <!-- Active Record Card -->
          <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 14px; padding: 12px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 13px; font-weight: 900; color: #065f46;">
                SL \${currentIndex + 1}: \${c.month || 'Salary Month'}
              </span>
              <span style="font-size: 11px; font-weight: 900; color: #047857; background: #dcfce7; padding: 2px 8px; border-radius: 10px;">
                \${currentIndex + 1} / \${challans.length}
              </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
              <div style="grid-column: span 2;">
                <span style="color: #64748b; font-size: 10px; font-weight: bold;">1. Authority (কর্তৃপক্ষ):</span>
                <div style="font-weight: 800; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  \${c.depositingAuthority || payload.depositingAuthority || 'Not Specified'}
                </div>
              </div>

              <div>
                <span style="color: #64748b; font-size: 10px; font-weight: bold;">2. Doc Type (ধরন):</span>
                <div style="font-weight: 800; color: #059669;">\${c.paymentDocType || 'Challan'}</div>
              </div>

              <div>
                <span style="color: #64748b; font-size: 10px; font-weight: bold;">3. Full Ref No (চালান নং):</span>
                <div style="font-family: monospace; font-weight: 900; color: #0284c7; word-break: break-all;">\${fullRefNo || '-'}</div>
              </div>

              <div>
                <span style="color: #64748b; font-size: 10px; font-weight: bold;">4. Date (তারিখ):</span>
                <div style="font-weight: 800; color: #1e293b;">\${c.challanDate || c.date || '-'}</div>
              </div>

              <div>
                <span style="color: #64748b; font-size: 10px; font-weight: bold;">5. Challan Total (মোট):</span>
                <div style="font-weight: 800; color: #334155;">৳\${Number(c.challanAmount || 0).toLocaleString()}</div>
              </div>

              <div style="grid-column: span 2; background: #dcfce7; padding: 6px 10px; border-radius: 8px;">
                <span style="color: #065f46; font-size: 10px; font-weight: bold;">6. Claimed TDS Amount (দাবিকৃত কর):</span>
                <div style="font-weight: 900; color: #047857; font-size: 13px;">৳\${Number(c.claimedAmount || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <!-- 1-Click Copy Chips -->
          <div style="margin-bottom: 10px;">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Click to Copy Value (কপি করতে ক্লিক করুন):</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              <button id="vatx-copy-ref" style="padding: 4px 8px; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; border-radius: 6px; font-size: 10px; font-weight: 800; cursor: pointer;">📋 চালান নং (Ref No)</button>
              <button id="vatx-copy-date" style="padding: 4px 8px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">📅 তারিখ (Date)</button>
              <button id="vatx-copy-auth" style="padding: 4px 8px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">🏢 কর্তৃপক্ষ</button>
              <button id="vatx-copy-claimed" style="padding: 4px 8px; background: #dcfce7; color: #065f46; border: 1px solid #86efac; border-radius: 6px; font-size: 10px; font-weight: 800; cursor: pointer;">💰 টিডিএস ৳</button>
              <button id="vatx-copy-total" style="padding: 4px 8px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">💳 মোট চালান ৳</button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;">
            <button id="vatx-fill-all" style="width: 100%; padding: 10px; background: #059669; color: white; border: none; border-radius: 12px; font-size: 13px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 12px rgba(5,150,105,0.25); transition: all 0.2s;">
              🚀 ১-ক্লিকে সব এন্ট্রি অটো-ফিল (\${challans.length === 1 ? 'Auto-Fill Record' : 'Auto-Fill ALL ' + challans.length + ' Months'})
            </button>
            <button id="vatx-fill-active" style="width: 100%; padding: 8px; background: #f0fdf4; color: #065f46; border: 1.5px solid #86efac; border-radius: 10px; font-size: 12px; font-weight: 800; cursor: pointer;">
              ⚡ শুধুমাত্র এই সারিটি পূরণ করুন (SL \${currentIndex + 1}: \${c.month || 'Month'})
            </button>
          </div>

          <!-- Stepper Navigation -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <button id="vatx-prev" style="flex: 1; padding: 8px; background: \${currentIndex > 0 ? '#f8fafc' : '#f1f5f9'}; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 11px; font-weight: 800; color: \${currentIndex > 0 ? '#1e293b' : '#94a3b8'}; cursor: \${currentIndex > 0 ? 'pointer' : 'default'};">
              ← Prev (\${currentIndex > 0 ? (challans[currentIndex - 1].month || currentIndex) : '1'})
            </button>
            <button id="vatx-portal-add" style="padding: 8px 12px; background: #ecfdf5; border: 1px solid #10b981; border-radius: 10px; font-size: 11px; font-weight: 900; color: #047857; cursor: pointer;" title="Trigger + Add button on NBR Portal">
              + Add Row
            </button>
            <button id="vatx-next" style="flex: 1; padding: 8px; background: #047857; color: white; border: none; border-radius: 10px; font-size: 11px; font-weight: 900; cursor: pointer; box-shadow: 0 2px 6px rgba(4,120,87,0.25);">
              \${currentIndex < challans.length - 1 ? 'Next (' + (challans[currentIndex + 1].month || (currentIndex + 2)) + ') →' : '+ Next Month →'}
            </button>
          </div>
        </div>
      </div>
    \`;

    // Bind Month Chips
    container.querySelectorAll('.vatx-month-chip').forEach(btn => {
      btn.onclick = (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-month-idx'), 10);
        if (!isNaN(idx) && idx >= 0 && idx < challans.length) {
          currentIndex = idx;
          render();
        }
      };
    });

    // Add Custom Month
    const addMonthBtn = document.getElementById('vatx-add-month-btn');
    if (addMonthBtn) {
      addMonthBtn.onclick = () => {
        const nextSl = challans.length + 1;
        const fiscalMonths = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const monthLabel = fiscalMonths[nextSl - 1] || ('Period ' + nextSl);
        const newMonth = {
          sl: nextSl,
          month: monthLabel,
          depositingAuthority: c.depositingAuthority || payload.depositingAuthority || '',
          paymentDocType: c.paymentDocType || 'Challan',
          challanRefNo: '',
          challanDate: '',
          challanAmount: 0,
          claimedAmount: 0
        };
        challans.push(newMonth);
        currentIndex = challans.length - 1;
        render();
        showToast('Added ' + newMonth.month);
      };
    }

    // Event Bindings
    document.getElementById('vatx-min').onclick = () => {
      isMinimized = true;
      render();
    };

    document.getElementById('vatx-close').onclick = () => {
      container.remove();
    };

    document.getElementById('vatx-fill-all').onclick = () => {
      fillAll12Months();
    };

    document.getElementById('vatx-portal-add').onclick = () => {
      triggerAddRowButton();
      showToast('Clicked + Add on NBR portal');
    };

    document.getElementById('vatx-fill-active').onclick = () => {
      const targetRow = findTargetRow(currentIndex);
      const count = fillChallanRecord(c, targetRow, currentIndex);
      if (count > 0) {
        showToast('⚡ Auto-filled ' + count + ' fields for SL ' + (currentIndex + 1) + ' (' + (c.month || 'Month') + ')');
      } else {
        showToast('⚠️ Clicked form inputs. If fields did not fill, make sure Row is opened in Edit mode.', false);
      }
    };

    // Direct Exact Value Copy Handlers
    document.getElementById('vatx-copy-ref').onclick = () => {
      copyText(fullRefNo, 'Challan Ref No');
    };

    document.getElementById('vatx-copy-date').onclick = () => {
      copyText(c.challanDate || c.date || '14-08-2025', 'Challan Date');
    };

    document.getElementById('vatx-copy-auth').onclick = () => {
      copyText(c.depositingAuthority || payload.depositingAuthority || '', 'Depositing Authority');
    };

    document.getElementById('vatx-copy-claimed').onclick = () => {
      copyText(c.claimedAmount !== undefined ? c.claimedAmount : 0, 'Claimed Amount');
    };

    document.getElementById('vatx-copy-total').onclick = () => {
      copyText(c.challanAmount !== undefined ? c.challanAmount : 0, 'Challan Total Amount');
    };

    // Navigation Buttons
    const prevBtn = document.getElementById('vatx-prev');
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (currentIndex > 0) {
          currentIndex--;
          render();
        }
      };
    }

    const nextBtn = document.getElementById('vatx-next');
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (currentIndex < challans.length - 1) {
          currentIndex++;
          render();
        } else {
          // If on the last item, automatically add next month with distinct reference
          const nextSl = challans.length + 1;
          const fiscalMonths = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
          const monthLabel = fiscalMonths[nextSl - 1] || ('Period ' + nextSl);
          const newMonth = {
            sl: nextSl,
            month: monthLabel,
            depositingAuthority: c.depositingAuthority || payload.depositingAuthority || '',
            paymentDocType: c.paymentDocType || 'Challan',
            challanRefNo: '',
            challanDate: '',
            challanAmount: 0,
            claimedAmount: 0
          };
          challans.push(newMonth);
          currentIndex = challans.length - 1;
          render();
          showToast('Added ' + newMonth.month);
        }
      };
    }
  }

  document.body.appendChild(container);
  render();
})();
  `.trim();
}

export function generateTRMSScript(data: NBRDocumentData): string {
  const safeData = JSON.stringify(data, null, 2);

  return `
/**
 * ====================================================================
 * VATX.BD - NBR TRMS Individual Tax Auto-Fill Assistant
 * Target: https://trms.nbr.gov.bd/dashboard
 * ====================================================================
 */
(function() {
  'use strict';
  const data = ${safeData};
  console.log("%c [VATX.BD] NBR TRMS Automation Active ", "background: #0284c7; color: white; font-weight: bold; padding: 6px 12px; border-radius: 8px;");

  function setNativeValue(element, value) {
    if (!element || value === undefined || value === null) return false;
    try {
      element.focus();
      const proto = element.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) {
        setter.call(element, String(value));
      } else {
        element.value = String(value);
      }
      ['input', 'change', 'blur'].forEach(t => element.dispatchEvent(new Event(t, { bubbles: true })));
      return true;
    } catch(e) {
      element.value = String(value);
      return false;
    }
  }

  const selectors = {
    tin: ['input[name="tin"]', '#tin', '.tin-input', 'input[placeholder*="TIN" i]'],
    name: ['input[name="name"]', '#taxpayer_name', '.name-input', 'input[placeholder*="Name" i]'],
    assessmentYear: ['select[name="assessment_year"]', 'input[name="assessment_year"]'],
    salary: ['input[name="salary_income"]', 'input[name="income_salary"]', '#salary', 'input[placeholder*="Salary" i]'],
    houseProperty: ['input[name="house_property_income"]', '#house_property'],
    business: ['input[name="business_income"]', '#business_income'],
    investment: ['input[name="investment_rebate"]', '#investment'],
    taxPaid: ['input[name="tax_paid"]', '#tax_paid', 'input[placeholder*="Tax Paid" i]'],
    amount: ['input[name="amount"]', 'input[name="total_amount"]', '#amount']
  };

  const fill = (key, val) => {
    if (val === undefined || val === null || val === '') return;
    const possibleSelectors = selectors[key] || [];
    for (const sel of possibleSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        setNativeValue(el, val);
        console.log('[VATX.BD] Filled ' + key + ' -> ' + val);
        return;
      }
    }
  };

  fill('tin', data.tin);
  fill('name', data.taxpayerName);
  fill('assessmentYear', data.assessmentYear);
  fill('salary', data.salaryIncome);
  fill('houseProperty', data.housePropertyIncome);
  fill('business', data.businessIncome);
  fill('investment', data.investmentAmount);
  fill('taxPaid', data.taxAmount || data.claimedAmount);
  fill('amount', data.totalAmount || data.challanAmount);

  alert("VATX.BD: Tax filing data auto-filled for " + (data.taxpayerName || "Taxpayer") + "! Please review before final submission.");
})();
  `.trim();
}

export function generateUniversalETaxScript(data: NBRDocumentData): string {
  const safeData = JSON.stringify(data, null, 2);

  return `
/**
 * ====================================================================
 * VATX.BD - NBR e-Tax Universal Assistant
 * Target Portal: https://etaxnbr.gov.bd
 * ====================================================================
 */
(function() {
  'use strict';
  const data = ${safeData};
  console.log("%c [VATX.BD] Universal e-Tax Assistant Active ", "background: #7c3aed; color: white; font-weight: bold; padding: 6px 12px; border-radius: 8px;");

  function setNativeValue(element, value) {
    if (!element || value === undefined || value === null) return false;
    element.focus();
    const proto = element.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) {
      setter.call(element, String(value));
    } else {
      element.value = String(value);
    }
    ['input', 'change', 'blur'].forEach(t => element.dispatchEvent(new Event(t, { bubbles: true })));
    return true;
  }

  document.querySelectorAll('input, select, textarea').forEach(input => {
    const ph = (input.placeholder || '').toLowerCase();
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    
    if (ph.includes('tin') || name.includes('tin') || id.includes('tin')) {
      if (data.tin) setNativeValue(input, data.tin);
    } else if (ph.includes('name') || name.includes('name') || id.includes('name')) {
      if (data.taxpayerName) setNativeValue(input, data.taxpayerName);
    } else if (ph.includes('salary') || name.includes('salary')) {
      if (data.salaryIncome) setNativeValue(input, data.salaryIncome);
    } else if (ph.includes('tax') || name.includes('tax')) {
      if (data.taxAmount || data.claimedAmount) setNativeValue(input, data.taxAmount || data.claimedAmount);
    }
  });

  console.log('[VATX.BD] e-Tax Auto-fill routine executed.');
})();
  `.trim();
}

/**
 * Converts Microsoft MarkItDown generated Markdown into structured NBR Document Data & Challans
 */
export function parseMarkItDownToNBRData(markdown: string): NBRDocumentData {
  if (!markdown || !markdown.trim()) {
    return { challans: [] };
  }

  // 1. First run the robust raw salary certificate parser which handles key-values and text
  const baseData = parseRawSalaryCertificateText(markdown);

  // 2. Specialized Multi-Table Markdown Extraction for MarkItDown format (| col1 | col2 | ... |)
  const lines = markdown.split(/\r?\n/);
  interface ParsedMarkdownTable {
    headers: string[];
    rows: string[][];
  }
  const tables: ParsedMarkdownTable[] = [];
  let currentHeaders: string[] = [];
  let currentRows: string[][] = [];
  let inTable = false;

  const flushTable = () => {
    if (currentHeaders.length > 0 && currentRows.length > 0) {
      tables.push({ headers: currentHeaders, rows: currentRows });
    }
    currentHeaders = [];
    currentRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] || '').trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line
        .slice(1, -1)
        .split('|')
        .map(c => String(c ?? '').replace(/[*_`]/g, '').trim());

      // Check if it's a separator row like |---|---|
      if (cells.length > 0 && cells.every(c => /^[-:\s]+$/.test(c))) {
        inTable = true;
        continue;
      }

      if (!inTable) {
        currentHeaders = cells.map(h => h.toLowerCase());
      } else {
        currentRows.push(cells);
      }
    } else {
      if (inTable || currentHeaders.length > 0) {
        flushTable();
      }
    }
  }
  flushTable();

  const getCell = (row: string[], index: number): string => {
    if (!row || index < 0 || index >= row.length) return '';
    return String(row[index] ?? '').replace(/[*_`]/g, '').trim();
  };

  const parseSafeNumber = (val?: string): number => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const allMdChallans: ChallanEntry[] = [];

  for (const table of tables) {
    const { headers, rows } = table;
    if (headers.length === 0 || rows.length === 0) continue;

    // Find column indexes for this specific table
    const slIdx = headers.findIndex(h => h === 'sl' || h === 'sl.' || h === 's/n' || h.includes('sl no') || h.includes('serial') || h === '#' || h === 'no' || h === 'no.');
    const monthIdx = headers.findIndex(h => h.includes('month') || h.includes('period'));
    const authIdx = headers.findIndex(h => h.includes('auth') || h.includes('bank') || h.includes('employer') || h.includes('company') || h.includes('branch'));
    const docTypeIdx = headers.findIndex(h => h.includes('doc type') || h.includes('payment doc') || (h.includes('type') && !h.includes('tax')));
    const refIdx = headers.findIndex(h => (h.includes('challan') || h.includes('chalan') || h.includes('ref') || h.includes('number') || h.includes('scroll')) && !h.includes('amount') && !h.includes('date') && !h.includes('tin'));
    const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('deposit date'));
    const chAmtIdx = headers.findIndex(h => (h.includes('challan') || h.includes('total') || h.includes('deposit')) && (h.includes('amount') || h.includes('taka') || h.includes('bdt') || h.includes('tk') || h.includes('amt')));
    const clAmtIdx = headers.findIndex(h => (h.includes('claim') || h.includes('tds') || h.includes('deduct') || h.includes('employee') || h.includes('certificate')) && (h.includes('amount') || h.includes('tax') || h.includes('tds') || h.includes('taka') || h.includes('bdt') || h.includes('tk') || h.includes('amt')));

    // Determine if this table looks like a Challan / Monthly TDS table
    const hasChallanHeader = monthIdx !== -1 || refIdx !== -1 || chAmtIdx !== -1 || clAmtIdx !== -1 || dateIdx !== -1;
    if (!hasChallanHeader && headers.length < 3) {
      continue;
    }

    rows.forEach((row, idx) => {
      if (!row || row.length === 0) return;
      const rowJoined = row.map(c => String(c ?? '')).join(' ');

      // Skip summary / total rows
      const firstNonEmpty = row.find(c => c && c.trim().length > 0) || '';
      if (/^\s*(total|grand\s*total|sub\s*total|sum)\b/i.test(firstNonEmpty)) {
        return;
      }

      // Find month
      let month = getCell(row, monthIdx);
      if (!month) {
        const m = rowJoined.match(/\b(Jul|Aug|Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|July|August|September|October|November|December|January|February|March|April|June)\b/i);
        if (m) month = m[1];
      }

      // Find challan ref (priority to 2526...)
      let refNo = getCell(row, refIdx);
      const m2526 = rowJoined.match(/\b(2526\s*[-/\.]\s*\d{6,14}|2526\d{8,14})\b/i);
      if (m2526 && m2526[1]) {
        refNo = m2526[1].replace(/\s+/g, '');
      } else if (!refNo) {
        const genM = rowJoined.match(/(?:CH|TR|[A-Z]{2,4})[-/\s]?\d{6,14}/i);
        if (genM && genM[0]) refNo = genM[0].replace(/\s+/g, '');
      }

      // Find date
      let date = formatNBRDate(getCell(row, dateIdx));
      if (!date) {
        const dFound = rowJoined.match(/\b\d{1,2}[\s\-\/\.](?:[a-zA-Z]{3,10}|\d{1,2})[\s\-\/\.]\d{4}\b/);
        if (dFound && dFound[0]) date = formatNBRDate(dFound[0]);
      }

      // Authority & Payment Doc Type
      const auth = getCell(row, authIdx) || baseData.depositingAuthority || '';
      const docType = getCell(row, docTypeIdx) || 'Challan';

      // Amounts
      let challanAmt = chAmtIdx !== -1 ? parseSafeNumber(getCell(row, chAmtIdx)) : 0;
      let claimedAmt = clAmtIdx !== -1 ? parseSafeNumber(getCell(row, clAmtIdx)) : 0;

      // If amounts not found at exact index, scan remaining cells for numbers
      if (!challanAmt || !claimedAmt) {
        const candidateNumbers: number[] = [];
        row.forEach((cell, cellIdx) => {
          if (cellIdx === slIdx || cellIdx === refIdx || cellIdx === dateIdx || cellIdx === monthIdx) return;
          const cellStr = String(cell ?? '').trim();
          if (!cellStr) return;
          // Skip cells that look like dates or challan numbers
          if (/^\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}$/.test(cellStr)) return;
          if (/^2526[-/\.]?\d+$/.test(cellStr)) return;
          const num = parseSafeNumber(cellStr);
          if (num > 0 && num !== idx + 1) {
            candidateNumbers.push(num);
          }
        });

        if (candidateNumbers.length >= 2) {
          if (!challanAmt) challanAmt = Math.max(...candidateNumbers);
          if (!claimedAmt) claimedAmt = Math.min(...candidateNumbers);
        } else if (candidateNumbers.length === 1) {
          if (!challanAmt && !claimedAmt) {
            challanAmt = candidateNumbers[0];
            claimedAmt = candidateNumbers[0];
          } else if (!challanAmt) {
            challanAmt = candidateNumbers[0];
          } else if (!claimedAmt) {
            claimedAmt = candidateNumbers[0];
          }
        }
      }

      // Only add row if it looks like a genuine challan/deduction entry
      if (month || refNo || (hasChallanHeader && (challanAmt > 0 || claimedAmt > 0))) {
        allMdChallans.push({
          sl: allMdChallans.length + 1,
          month: month || `Month ${allMdChallans.length + 1}`,
          depositingAuthority: auth || baseData.depositingAuthority || '',
          paymentDocType: docType || 'Challan',
          challanRefNo: refNo || '',
          challanDate: date || '',
          challanAmount: challanAmt,
          claimedAmount: claimedAmt
        });
      }
    });
  }

  if (allMdChallans.length > 0) {
    baseData.challans = allMdChallans;
    baseData.challanRefNo = allMdChallans[0].challanRefNo;
    baseData.challanDate = allMdChallans[0].challanDate;
    baseData.challanAmount = allMdChallans[0].challanAmount;
    baseData.claimedAmount = allMdChallans[0].claimedAmount;
    baseData.taxAmount = allMdChallans.reduce((sum, c) => sum + (c.claimedAmount || 0), 0);
  }

  // Ensure consistent typing and date format without fictitious placeholders
  if (baseData.challans && baseData.challans.length > 0) {
    baseData.challans = baseData.challans.map((c, i) => ({
      ...c,
      sl: c.sl || i + 1,
      month: c.month || `Month ${i + 1}`,
      depositingAuthority: c.depositingAuthority || baseData.depositingAuthority || '',
      paymentDocType: c.paymentDocType || 'Challan',
      challanRefNo: c.challanRefNo || '',
      challanDate: formatNBRDate(c.challanDate) || '',
      challanAmount: Number(c.challanAmount || 0),
      claimedAmount: Number(c.claimedAmount || 0)
    }));
  }

  return baseData;
}

/**
 * High-level function: Directly converts MarkItDown Markdown to NBR Script
 */
export function generateNBRScriptFromMarkItDown(markdown: string): { data: NBRDocumentData; script: string } {
  const data = parseMarkItDownToNBRData(markdown);
  const script = generatePrivateSalaryLedgerScript(data);
  return { data, script };
}


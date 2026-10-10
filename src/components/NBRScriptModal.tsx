import React, { useState, useEffect } from 'react';
import { 
  Copy, Check, ExternalLink, Download, Code, Bookmark, 
  Sparkles, Layers,
  Calendar, DollarSign, Database, Plus, Trash2, Edit3, X, Globe, Building, FileText,
  FileCode, ArrowRight, CheckCircle2, RefreshCw, Clipboard, FileUp, Loader2, AlertCircle
} from 'lucide-react';
import { 
  NBRDocumentData, 
  ChallanEntry, 
  formatNBRDate,
  parseRawSalaryCertificateText,
  parseMarkItDownToNBRData,
  SAMPLE_MAMUNUR_CERTIFICATE,
  generatePrivateSalaryLedgerScript, 
  generateTRMSScript, 
  generateUniversalETaxScript 
} from '../utils/nbrScriptGenerator';

interface NBRScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: NBRDocumentData;
  language?: 'en' | 'bn';
}

export const NBRScriptModal: React.FC<NBRScriptModalProps> = ({
  isOpen,
  onClose,
  initialData,
  language = 'en'
}) => {
  const [targetPortal, setTargetPortal] = useState<'ledger' | 'trms' | 'etax'>('ledger');
  const [copiedType, setCopiedType] = useState<'console' | 'bookmarklet' | null>(null);
  const [copiedRowIdx, setCopiedRowIdx] = useState<number | null>(null);
  const [data, setData] = useState<NBRDocumentData>({ ...initialData });
  const [activeTab, setActiveTab] = useState<'challans' | 'parser' | 'script' | 'guide'>('challans');
  const [rawText, setRawText] = useState<string>('');
  const [isConvertingFile, setIsConvertingFile] = useState<boolean>(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      const defaultAuthority = initialData.depositingAuthority || initialData.vendorName || initialData.taxpayerName || '';
      const defaultRefNo = initialData.challanRefNo || initialData.challanNo || '';
      const defaultDate = formatNBRDate(initialData.challanDate || initialData.date) || '';
      const defaultChallanAmt = initialData.challanAmount !== undefined ? initialData.challanAmount : (initialData.totalAmount || 0);
      const defaultClaimedAmt = initialData.claimedAmount !== undefined ? initialData.claimedAmount : (initialData.taxAmount || 0);

      let initialChallans: ChallanEntry[] = [];
      if (initialData.challans && initialData.challans.length > 0) {
        initialChallans = initialData.challans.map((c, idx) => ({
          sl: c.sl || idx + 1,
          month: c.month || (idx === 0 ? 'Jul' : `Period ${idx + 1}`),
          depositingAuthority: c.depositingAuthority || defaultAuthority,
          paymentDocType: c.paymentDocType || initialData.paymentDocType || 'Challan',
          challanRefNo: String(c.challanRefNo || c.challanNo || defaultRefNo).trim(),
          challanDate: formatNBRDate(c.challanDate || c.date || defaultDate),
          challanAmount: c.challanAmount !== undefined ? Number(c.challanAmount) : defaultChallanAmt,
          claimedAmount: c.claimedAmount !== undefined ? Number(c.claimedAmount) : defaultClaimedAmt,
          bankName: c.bankName || '',
          branchName: c.branchName || ''
        }));
      } else if (defaultRefNo || defaultChallanAmt > 0 || defaultClaimedAmt > 0 || defaultAuthority) {
        // Synthesize single authentic challan from top level data
        initialChallans = [{
          sl: 1,
          month: 'Jul',
          depositingAuthority: defaultAuthority,
          paymentDocType: initialData.paymentDocType || 'Challan',
          challanRefNo: defaultRefNo,
          challanDate: defaultDate,
          challanAmount: defaultChallanAmt,
          claimedAmount: defaultClaimedAmt
        }];
      }

      setData({
        ...initialData,
        depositingAuthority: defaultAuthority,
        paymentDocType: initialData.paymentDocType || 'Challan',
        challanRefNo: defaultRefNo,
        challanDate: defaultDate,
        challanAmount: defaultChallanAmt,
        claimedAmount: defaultClaimedAmt,
        challans: initialChallans
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Generate scripts based on selection
  let currentScript = '';
  let portalUrl = 'https://ledger.etaxnbr.gov.bd/#/pages/source-tax/private-salary';
  let portalName = 'NBR Source Tax Ledger (Private Salary)';

  if (targetPortal === 'ledger') {
    currentScript = generatePrivateSalaryLedgerScript(data);
    portalUrl = 'https://ledger.etaxnbr.gov.bd/#/pages/source-tax/private-salary';
    portalName = 'NBR Source Tax Ledger (Private Salary)';
  } else if (targetPortal === 'trms') {
    currentScript = generateTRMSScript(data);
    portalUrl = 'https://trms.nbr.gov.bd/dashboard';
    portalName = 'NBR TRMS Tax Portal';
  } else {
    currentScript = generateUniversalETaxScript(data);
    portalUrl = 'https://etaxnbr.gov.bd';
    portalName = 'NBR e-Tax Universal Portal';
  }

  // Create bookmarklet code
  const bookmarkletCode = `javascript:(function(){${encodeURIComponent(currentScript)}})();`;

  const handleCopy = (type: 'console' | 'bookmarklet') => {
    const textToCopy = type === 'console' ? currentScript : bookmarkletCode;
    navigator.clipboard.writeText(textToCopy);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopySingleField = (text: string, rowIdx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedRowIdx(rowIdx);
    setTimeout(() => setCopiedRowIdx(null), 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([currentScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VATX_NBR_PrivateSalary_Script_${data.tin || 'Ledger'}.js`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddChallan = () => {
    const nextSl = (data.challans?.length || 0) + 1;
    const FISCAL_MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const month = FISCAL_MONTHS[nextSl - 1] || `Period ${nextSl}`;
    const defaultAuthority = data.depositingAuthority || data.vendorName || '';
    const newEntry: ChallanEntry = {
      sl: nextSl,
      month,
      depositingAuthority: defaultAuthority,
      paymentDocType: 'Challan',
      challanRefNo: '',
      challanDate: '',
      challanAmount: 0,
      claimedAmount: 0
    };
    setData({
      ...data,
      challans: [...(data.challans || []), newEntry]
    });
  };

  const handleUpdateChallan = (index: number, field: keyof ChallanEntry, value: any) => {
    const updated = [...(data.challans || [])];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setData({ ...data, challans: updated });
  };

  const handleDeleteChallan = (index: number) => {
    const updated = (data.challans || []).filter((_, idx) => idx !== index);
    const reindexed = updated.map((item, idx) => ({ ...item, sl: idx + 1 }));
    setData({ ...data, challans: reindexed });
  };

  const handleParseRawText = () => {
    if (!rawText.trim()) return;
    const parsed = parseMarkItDownToNBRData(rawText);
    if (parsed.challans && parsed.challans.length > 0) {
      setData({
        ...data,
        ...parsed,
        challans: parsed.challans
      });
      setActiveTab('challans');
    }
  };

  const handleMarkItDownFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsConvertingFile(true);
    setConvertError(null);

    try {
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

      if (!res.ok) {
        throw new Error(`Conversion failed with status ${res.status}`);
      }

      const result = await res.json();
      const markdown = result.markdown || '';
      setRawText(markdown);

      // Parse markdown into authentic NBR Document Data & Challans
      const parsed = parseMarkItDownToNBRData(markdown);
      if (parsed.challans && parsed.challans.length > 0) {
        setData({
          ...data,
          ...parsed,
          challans: parsed.challans
        });
        setActiveTab('challans');
      } else {
        setData(prev => ({
          ...prev,
          ...parsed
        }));
      }
    } catch (err: any) {
      console.error("MarkItDown upload error:", err);
      setConvertError(err.message || "Failed to convert document with MarkItDown");
    } finally {
      setIsConvertingFile(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleLoadSampleCertificate = () => {
    setData({
      ...data,
      ...SAMPLE_MAMUNUR_CERTIFICATE
    });
    setActiveTab('challans');
  };

  const handleGenerate12Months = () => {
    const FISCAL_MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const base = (data.challans && data.challans[0]) || {};
    const defaultAuth = base.depositingAuthority || data.depositingAuthority || data.vendorName || '';
    const defaultDoc = base.paymentDocType || data.paymentDocType || 'Challan';
    const currentChallans = data.challans || [];

    const generated = FISCAL_MONTHS.map((monthName, idx) => {
      const existing = currentChallans[idx];
      return {
        sl: idx + 1,
        month: existing?.month || monthName,
        depositingAuthority: existing?.depositingAuthority || defaultAuth,
        paymentDocType: existing?.paymentDocType || defaultDoc,
        challanRefNo: existing?.challanRefNo || (idx === 0 ? (base.challanRefNo || '') : ''),
        challanDate: existing?.challanDate || (idx === 0 ? (base.challanDate || '') : ''),
        challanAmount: existing?.challanAmount !== undefined ? Number(existing.challanAmount) : (idx === 0 ? Number(base.challanAmount || 0) : 0),
        claimedAmount: existing?.claimedAmount !== undefined ? Number(existing.claimedAmount) : (idx === 0 ? Number(base.claimedAmount || 0) : 0),
        bankName: existing?.bankName || base.bankName || '',
        branchName: existing?.branchName || base.branchName || ''
      };
    });

    setData({ ...data, challans: generated });
  };

  const isBn = language === 'bn';
  const totalTaxClaimed = (data.challans || []).reduce((sum, c) => sum + (Number(c.claimedAmount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-zinc-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-[2.5rem] shadow-2xl border border-zinc-100 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 md:p-6 bg-zinc-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-display tracking-tight text-white">
                  {isBn ? 'এনবিআর অটো-ফিল স্ক্রিপ্ট হাব' : 'NBR Private Salary & Source Tax Auto-Fill Hub'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isBn ? '৭-কলাম ফর্ম রেডি' : '7-Column Form Verified'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                {isBn 
                  ? 'উৎস কর খতিয়ান (বেসরকারি বেতন) এর পূর্ণ চালান নম্বর, তারিখ ও টাকার পরিমাণ অটো-ফিল করুন'
                  : 'Automated browser assistant for NBR Private Salary Source Tax Ledger (Full Challan Ref No support)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Globe size={14} />
              {isBn ? 'পোর্টাল খুলুন' : 'Open NBR Portal'}
              <ExternalLink size={12} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation & Portal Selector */}
        <div className="px-5 md:px-6 py-3 bg-zinc-50 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3">
          {/* Target Portal Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-200/70 rounded-xl">
            <button
              onClick={() => setTargetPortal('ledger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                targetPortal === 'ledger'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isBn ? 'উৎস কর লেজার (বেসরকারি বেতন)' : 'Source Tax Ledger (Private Salary)'}
            </button>
            <button
              onClick={() => setTargetPortal('trms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                targetPortal === 'trms'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              TRMS (Individual)
            </button>
            <button
              onClick={() => setTargetPortal('etax')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                targetPortal === 'etax'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              e-Tax Universal
            </button>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('challans')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'challans' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Database size={13} />
              {isBn ? 'ফর্ম ডাটা ও কলামস' : 'Form Data & Columns'} ({data.challans?.length || 1})
            </button>
            <button
              onClick={() => setActiveTab('parser')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'parser' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Clipboard size={13} />
              {isBn ? 'ডাইরেক্ট টেক্সট / সার্টিফিকেট পার্সার' : 'Direct Text / Certificate Parser'}
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'script' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Code size={13} />
              {isBn ? 'স্ক্রিপ্ট প্রিভিউ' : 'Browser Script'}
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <FileText size={13} />
              <span>📖 সহজ বাংলা গাইড (নতুনদের জন্য)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          
          {/* TAB 1: FORM DATA & 7-COLUMNS TABLE */}
          {activeTab === 'challans' && (
            <div className="space-y-5">
              {/* Header Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="text-[10px] font-black uppercase text-zinc-400">
                    {isBn ? 'করদাতার নাম' : 'Taxpayer Name'}
                  </div>
                  <div className="text-sm font-black text-zinc-900 truncate mt-0.5">
                    {data.taxpayerName || 'Mamunur Rashid Rifath'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="text-[10px] font-black uppercase text-zinc-400">
                    {isBn ? 'ই-টিন নম্বর' : 'e-TIN / Employee ID'}
                  </div>
                  <div className="text-sm font-black text-emerald-700 font-mono mt-0.5">
                    {data.tin || '696173907287'} {data.employeeId ? `(${data.employeeId})` : ''}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="text-[10px] font-black uppercase text-zinc-400">
                    {isBn ? 'মোট চালান রেকর্ড' : 'Challan Records'}
                  </div>
                  <div className="text-sm font-black text-zinc-900 mt-0.5">
                    {data.challans?.length || 1} {isBn ? 'টি মাস' : 'Months'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <div className="text-[10px] font-black uppercase text-emerald-700">
                    {isBn ? 'মোট দাবিযোগ্য কর (TDS)' : 'Total Claimed TDS'}
                  </div>
                  <div className="text-sm font-black text-emerald-900 mt-0.5">
                    ৳{totalTaxClaimed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Table Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
                    {isBn ? 'বেসরকারি বেতন লেজার কলামস (NBR Form Fields):' : 'Official NBR Private Salary Columns:'}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-zinc-100 rounded-md font-bold text-zinc-600">
                    7 Columns
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerate12Months}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition-all"
                    title="Generate standard 12 fiscal months schedule (July to June)"
                  >
                    <Sparkles size={13} />
                    {isBn ? '১২ মাসের শিডিউল তৈরি করুন' : 'Generate 12-Month Schedule'}
                  </button>

                  <button
                    onClick={handleLoadSampleCertificate}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all"
                    title="Load verified 12-month schedule with full Challan numbers"
                  >
                    <RefreshCw size={13} />
                    {isBn ? 'নমুনা সার্টিফিকেট' : 'Load Sample'}
                  </button>

                  <button
                    onClick={handleAddChallan}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition-all"
                  >
                    <Plus size={14} />
                    {isBn ? 'নতুন চালান' : 'Add Row'}
                  </button>
                </div>
              </div>

              {/* 7-Column Form Table */}
              <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto max-h-[380px] custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-zinc-900 text-white font-bold sticky top-0 z-10">
                      <tr>
                        <th className="p-3 w-12 text-center">SL.</th>
                        <th className="p-3 min-w-[140px]">
                          <div>Depositing Authority</div>
                          <div className="text-[9px] font-normal text-zinc-400">জমা প্রদানকারী কর্তৃপক্ষ</div>
                        </th>
                        <th className="p-3 w-28">
                          <div>Doc Type</div>
                          <div className="text-[9px] font-normal text-zinc-400">দলিলের ধরন</div>
                        </th>
                        <th className="p-3 min-w-[210px]">
                          <div>Challan / Ref No.</div>
                          <div className="text-[9px] font-normal text-zinc-400">চালান / রেফারেন্স নম্বর</div>
                        </th>
                        <th className="p-3 min-w-[130px]">
                          <div>Date (DD-MM-YYYY)</div>
                          <div className="text-[9px] font-normal text-zinc-400">চালানের তারিখ</div>
                        </th>
                        <th className="p-3 min-w-[130px]">
                          <div>Challan Amount (৳)</div>
                          <div className="text-[9px] font-normal text-zinc-400">মোট চালানের টাকা</div>
                        </th>
                        <th className="p-3 min-w-[130px]">
                          <div>Claimed Amount (৳)</div>
                          <div className="text-[9px] font-normal text-emerald-400">দাবিযোগ্য কর্তন</div>
                        </th>
                        <th className="p-3 w-16 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-700">
                      {(data.challans || []).map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                          {/* 1. SL */}
                          <td className="p-2.5 text-center font-bold text-zinc-400 font-mono">
                            {row.sl || idx + 1}
                          </td>

                          {/* 2. Depositing Authority */}
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.depositingAuthority || ''}
                              onChange={(e) => handleUpdateChallan(idx, 'depositingAuthority', e.target.value)}
                              placeholder="Enter Depositing Authority"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                            />
                          </td>

                          {/* 3. Payment Document Type */}
                          <td className="p-2">
                            <select
                              value={row.paymentDocType || 'Challan'}
                              onChange={(e) => handleUpdateChallan(idx, 'paymentDocType', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                            >
                              <option value="Challan">Challan</option>
                              <option value="Certificate">Certificate</option>
                              <option value="e-Challan">e-Challan</option>
                              <option value="Pay Order">Pay Order</option>
                            </select>
                          </td>

                          {/* 4. Challan / Certificate Reference No. (With 1-Click Copy) */}
                          <td className="p-2">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={row.challanRefNo || row.challanNo || ''}
                                onChange={(e) => handleUpdateChallan(idx, 'challanRefNo', e.target.value)}
                                placeholder="e.g. 2526-00043326111"
                                className="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-mono font-bold text-sky-800 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-sky-50/30"
                              />
                              <button
                                onClick={() => handleCopySingleField(String(row.challanRefNo || row.challanNo || ''), idx)}
                                title="Copy Full Challan Number"
                                className={`p-1.5 rounded-lg border transition-all ${
                                  copiedRowIdx === idx
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
                                }`}
                              >
                                {copiedRowIdx === idx ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            </div>
                          </td>

                          {/* 5. Challan / Certificate Date */}
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.challanDate || row.date || ''}
                              onChange={(e) => handleUpdateChallan(idx, 'challanDate', e.target.value)}
                              placeholder="DD-MM-YYYY"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                            />
                          </td>

                          {/* 6. Challan / Certificate Amount */}
                          <td className="p-2">
                            <input
                              type="number"
                              value={row.challanAmount !== undefined ? row.challanAmount : ''}
                              onChange={(e) => handleUpdateChallan(idx, 'challanAmount', parseFloat(e.target.value) || 0)}
                              placeholder="Enter Amount"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                            />
                          </td>

                          {/* 7. Claimed Amount */}
                          <td className="p-2">
                            <input
                              type="number"
                              value={row.claimedAmount !== undefined ? row.claimedAmount : ''}
                              onChange={(e) => handleUpdateChallan(idx, 'claimedAmount', parseFloat(e.target.value) || 0)}
                              placeholder="Enter Claimed Amount"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 text-xs font-mono font-black text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-emerald-50/40"
                            />
                          </td>

                          {/* Action */}
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleDeleteChallan(idx)}
                              disabled={(data.challans || []).length <= 1}
                              className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Delete row"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-zinc-500">
                  {isBn 
                    ? 'টেবিলের সকল তথ্য ব্রাউজার অটোমেশন স্ক্রিপ্টের সাথে সরাসরি সিঙ্ক করা হয়েছে।'
                    : 'Data is synchronized in real-time with the browser automation script.'}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleCopy('console');
                      setActiveTab('script');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                  >
                    <Copy size={15} /> {isBn ? 'স্ক্রিপ্ট কপি করুন ও চালান' : 'Copy Script & Proceed'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MICROSOFT MARKITDOWN & DOCUMENT OCR PARSER */}
          {activeTab === 'parser' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-3">
                <Clipboard className="text-sky-600 shrink-0 mt-0.5" size={20} />
                <div className="space-y-1 text-xs">
                  <div className="font-black text-sky-900 text-sm">
                    {isBn ? 'মাইক্রোসফট মার্কইটডাউন ওসিআর এবং প্রত্যয়নপত্র কনভার্টার' : 'Microsoft MarkItDown OCR & Document Converter'}
                  </div>
                  <div className="text-sky-800 leading-relaxed">
                    {isBn 
                      ? 'আপনার বেতন প্রত্যয়নপত্র (PDF/ছবি/DOCX/টেক্সট) সরাসরি আপলোড করুন অথবা ওসিআর টেক্সট পেস্ট করুন। আসল চালান নম্বর, তারিখ ও সঠিক টাকার পরিমাণ নিখুঁতভাবে এক্সট্র্যাক্ট হবে।'
                      : 'Upload salary certificates, TDS schedules, or PDF documents directly to convert via Microsoft MarkItDown + AI Vision OCR. The actual text, reference codes, and exact financial amounts are extracted with zero fictitious placeholders.'}
                  </div>
                </div>
              </div>

              {/* Microsoft MarkItDown Document File Upload Card */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    {isConvertingFile ? <Loader2 size={20} className="animate-spin" /> : <FileUp size={20} />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900">
                      {isBn ? 'ডকুমেন্ট আপলোড ও মাইক্রোসফট মার্কইটডাউন কনভার্ট' : 'Convert Document with Microsoft MarkItDown'}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Supports PDF, PNG, JPG, DOCX, XLSX, CSV, and TXT files
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className={`cursor-pointer px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2 ${isConvertingFile ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isConvertingFile ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Converting...</span>
                      </>
                    ) : (
                      <>
                        <FileUp size={14} />
                        <span>Select File to Convert</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.csv,.txt"
                      onChange={handleMarkItDownFileUpload}
                      disabled={isConvertingFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {convertError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{convertError}</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-zinc-700 uppercase tracking-wider">
                    {isBn ? 'সার্টিফিকেট / মার্কডাউন টেক্সট:' : 'Markdown Table / Raw Document Text:'}
                  </label>
                  <button
                    onClick={handleLoadSampleCertificate}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    {isBn ? 'নমুনা প্রত্যয়নপত্র লোড করুন' : 'Load Demo Sample (Eastern Bank)'}
                  </button>
                </div>

                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Paste certificate text or Microsoft MarkItDown Markdown here... Example:
| SL | Month | Depositing Authority | Payment Doc Type | Challan Ref No | Challan Date | Challan Amount | Claimed TDS |
|---|---|---|---|---|---|---|---|
| 1 | Jul | Eastern Bank | Challan | 2526-00043326111 | 14-08-2025 | 27650502.89 | 4131.97 |`}
                  rows={8}
                  className="w-full p-4 rounded-2xl border border-zinc-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-zinc-50/50 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleParseRawText}
                  disabled={!rawText.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  <Sparkles size={16} />
                  {isBn ? 'টেক্সট/মার্কডাউন থেকে ফর্ম ডাটা এক্সট্র্যাক্ট করুন' : 'Extract Actual Amounts & Challans'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SCRIPT CODE PREVIEW */}
          {activeTab === 'script' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy('console')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md ${
                      copiedType === 'console'
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                    }`}
                  >
                    {copiedType === 'console' ? <Check size={16} /> : <Copy size={16} />}
                    {copiedType === 'console' 
                      ? (isBn ? 'কপি সম্পন্ন!' : 'Script Copied!') 
                      : (isBn ? 'কনসোল স্ক্রিপ্ট কপি করুন' : 'Copy Console Script')}
                  </button>

                  <button
                    onClick={() => handleCopy('bookmarklet')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      copiedType === 'bookmarklet'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                    title="Copy Bookmarklet URL to save in your browser bookmarks bar"
                  >
                    {copiedType === 'bookmarklet' ? <Check size={14} /> : <Bookmark size={14} />}
                    {copiedType === 'bookmarklet' ? 'Bookmarklet Copied!' : 'Copy Bookmarklet'}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-all"
                  >
                    <Download size={14} />
                    {isBn ? '.js ফাইল ডাউনলোড' : 'Download .js'}
                  </button>
                </div>

                <div className="text-xs text-zinc-400 font-mono">
                  {currentScript.length} characters • {data.challans?.length || 1} records
                </div>
              </div>

              {/* Code Box */}
              <div className="relative rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-inner">
                <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                    <span className="ml-2 text-zinc-300 font-bold">nbr_private_salary_helper.js</span>
                  </div>
                  <span>JavaScript (ES6+)</span>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[340px] custom-scrollbar leading-relaxed">
                  {currentScript}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: HOW-TO GUIDE (EASY BANGLA GUIDE FOR NAIVE USERS) */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-black">
                    নতুনদের জন্য সহজ বাংলা নির্দেশিকা (Beginner Friendly)
                  </span>
                  <h4 className="text-lg font-black text-zinc-900">
                    কীভাবে এনবিআর (NBR) ওয়েবসাইটে অটো-ফিল স্ক্রিপ্টটি ব্যবহার করবেন?
                  </h4>
                  <p className="text-xs text-zinc-700 font-medium">
                    আপনি যদি কম্পিউটার বা কোডিং সম্পর্কে একদমই কিছু না জানেন, তবুও নিচের <strong>৪টি সহজ ধাপ</strong> অনুসরণ করে হাতের টাইপিং ছাড়াই ১২ মাসের সব চালান ও ট্যাক্সের হিসাব বসাতে পারবেন।
                  </p>
                </div>
                <button
                  onClick={() => handleCopy('console')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shrink-0 flex items-center gap-2 shadow-md"
                >
                  <Copy size={14} />
                  <span>১-ক্লিকে স্ক্রিপ্ট কপি করুন</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ধাপ ১ */}
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                        ১
                      </span>
                      <h5 className="font-black text-sm text-zinc-900">
                        ধাপ ১: স্ক্রিপ্ট কপি করুন ও এনবিআর পেজে যান
                      </h5>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      প্রথমে উপরের <strong>"১-ক্লিকে স্ক্রিপ্ট কপি করুন"</strong> বাটনে ক্লিক করুন। এরপর আপনার কম্পিউটারের ব্রাউজারে (Google Chrome বা Edge) <strong>ledger.etaxnbr.gov.bd</strong> ওয়েবসাইটে লগইন করে বাম পাশের মেনু থেকে <strong>Source Tax ➔ Private Salary</strong> পেজটি খুলুন।
                    </p>
                  </div>
                  <a
                    href={portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 w-fit hover:bg-emerald-100"
                  >
                    <span>এনবিআর প্রাইভেট স্যালারি পেজ খুলুন</span> <ExternalLink size={13} />
                  </a>
                </div>

                {/* ধাপ ২ */}
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                        ২
                      </span>
                      <h5 className="font-black text-sm text-zinc-900">
                        ধাপ ২: মাউস বা কিবোর্ড দিয়ে Console বক্স খুলুন
                      </h5>
                    </div>
                    <div className="text-xs text-zinc-600 leading-relaxed space-y-1.5">
                      <p>
                        <strong>উপায় ক (মাউস দিয়ে - সবচেয়ে সহজ):</strong> এনবিআর পেজের যেকোনো ফাঁকা জায়গায় মাউসের <strong>ডান বাটনে ক্লিক (Right Click)</strong> করুন ➔ নিচে <strong>Inspect</strong> লেখায় ক্লিক করুন ➔ ডানপাশে বা নিচে যে বক্সটি খুলবে তার উপরের সারি থেকে <strong>Console</strong> লেখায় ক্লিক করুন।
                      </p>
                      <p>
                        <strong>উপায় খ (কিবোর্ড দিয়ে):</strong> কিবোর্ডের <strong>F12</strong> বাটন চাপুন (অথবা একসাথে <strong>Ctrl + Shift + J</strong> চাপুন)।
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 w-fit">
                    মাউস Right-Click ➔ Inspect ➔ Console ট্যাব
                  </div>
                </div>

                {/* ধাপ ৩ */}
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                        ৩
                      </span>
                      <h5 className="font-black text-sm text-zinc-900">
                        ধাপ ৩: পেস্ট (Ctrl + V) করে Enter চাপুন
                      </h5>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Console বক্সের খালি জায়গায় মাউস দিয়ে ক্লিক করে কিবোর্ডে <strong>Ctrl + V</strong> চাপুন (অথবা রাইট-ক্লিক করে Paste দিন) এবং কিবোর্ডের <strong>Enter</strong> বাটন চাপুন।
                      <br />
                      <span className="text-amber-800 font-bold">
                        * নোট: প্রথমবার পেস্ট করার সময় যদি হলুদ সতর্কবার্তা দেখায়, তবে কিবোর্ডে লিখুন <code className="bg-amber-100 px-1 rounded">allow pasting</code> এবং Enter চাপুন, তারপর আবার Ctrl+V দিয়ে Enter দিন।
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText('allow pasting')}
                    className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl w-fit flex items-center gap-1.5"
                  >
                    <Copy size={12} /> <span>"allow pasting" লেখাটি কপি করুন</span>
                  </button>
                </div>

                {/* ধাপ ৪ */}
                <div className="p-5 rounded-2xl bg-emerald-900 text-white border border-emerald-700 shadow-md flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-emerald-400 text-zinc-950 flex items-center justify-center font-black text-sm">
                        ৪
                      </span>
                      <h5 className="font-black text-sm text-white">
                        ধাপ ৪: ১-ক্লিকে ১২ মাসের সব ঘর পূরণ করুন!
                      </h5>
                    </div>
                    <p className="text-xs text-emerald-100 leading-relaxed">
                      Enter চাপার সাথে সাথে এনবিআর পেজের ডান কোণায় <strong>⚡ VATX Private Salary Helper</strong> নামের একটি সবুজ বক্স ভেসে উঠবে। সেখানে থাকা <strong>"🚀 ১-ক্লিকে সব এন্ট্রি অটো-ফিল"</strong> বাটনে ক্লিক করলেই আপনার সব মাসের চালান নম্বর, তারিখ ও টাকার অংক একা একাই পূরণ হয়ে যাবে!
                    </p>
                  </div>
                  <div className="text-xs font-black text-emerald-300">
                    🎉 কোনো টাইপিং ছাড়াই ১০০% নির্ভুল অটো-ফিল সম্পন্ন!
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

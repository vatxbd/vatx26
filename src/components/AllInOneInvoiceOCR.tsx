"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  Download, 
  FileDown, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Calculator,
  ArrowRight,
  Eye
} from "lucide-react";

export interface InvoiceItem {
  invoice_number: string;
  vendor_name: string;
  date: string;
  subtotal: number;
  vat_amount: number;
  total_amount: number;
}

interface AllInOneInvoiceOCRProps {
  language?: 'en' | 'bn';
}

// ১. ব্রাউজারে ছবি রিসাইজ ও কমপ্রেস করার ফাংশন (PDF হলে অপরিবর্তিত রাখবে)
const compressImage = (file: File, maxWidth = 1600, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) return resolve(file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(
                new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: "image/jpeg",
                })
              );
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

const SAMPLE_INVOICES: InvoiceItem[] = [
  {
    invoice_number: "VAT-2026-0891",
    vendor_name: "বাংলাদেশ স্টিল অ্যান্ড রি-রোলিং মিলস",
    date: "14/10/2026",
    subtotal: 125000,
    vat_amount: 18750,
    total_amount: 143750,
  },
  {
    invoice_number: "CH-994102",
    vendor_name: "মেসার্স রহিম ট্রেডার্স",
    date: "18/10/2026",
    subtotal: 45000,
    vat_amount: 6750,
    total_amount: 51750,
  },
  {
    invoice_number: "INV-44120",
    vendor_name: "স্কয়ার টেক্সটাইলস লিমিটেড",
    date: "20/10/2026",
    subtotal: 82000,
    vat_amount: 12300,
    total_amount: 94300,
  },
];

export default function AllInOneInvoiceOCR({ language = 'bn' }: AllInOneInvoiceOCRProps) {
  const isBn = language === 'bn';
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<string>("");
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ২. ছবি আপলোড ও স্ক্যান হ্যান্ডলার
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!files || files.length === 0) {
      alert(isBn ? "অনুগ্রহ করে ছবি বা PDF সিলেক্ট করুন!" : "Please select an image or PDF file!");
      return;
    }

    try {
      setStatus(isBn ? "ছবিগুলো অপটিমাইজ করা হচ্ছে..." : "Optimizing & compressing files...");
      const compressedFiles = await Promise.all(
        Array.from(files).map((file) => compressImage(file))
      );

      setStatus(isBn ? "Gemini AI দিয়ে স্ক্যান হচ্ছে..." : "Scanning with Gemini AI...");
      const formData = new FormData();
      compressedFiles.forEach((file) => {
        formData.append("files", file);
        // Also append as image for backward-compatibility if only 1 image
        formData.append("image", file);
      });

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      let data: any = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json().catch(() => null);
      } else {
        const text = await res.text().catch(() => "");
        try {
          data = JSON.parse(text);
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        throw new Error(data?.error || `Server responded with status ${res.status}`);
      }

      if (data && data.invoices && Array.isArray(data.invoices) && data.invoices.length > 0) {
        // আগের ডেটার সাথে নতুন স্ক্যান করা ডেটা যুক্ত করা
        setInvoices((prev) => [...prev, ...data.invoices]);
      } else if (data && data.text) {
        // Fallback: If text was returned, construct a single row if possible
        const lines = data.text.split("\n");
        const guessedVendor = lines[0] || (isBn ? "স্ক্যানকৃত প্রতিষ্ঠান" : "Scanned Vendor");
        setInvoices((prev) => [
          ...prev,
          {
            invoice_number: `INV-${Date.now().toString().slice(-4)}`,
            vendor_name: guessedVendor.slice(0, 40),
            date: new Date().toISOString().slice(0, 10),
            subtotal: 0,
            vat_amount: 0,
            total_amount: 0,
          },
        ]);
      } else {
        alert(data?.error || (isBn ? "ডেটা পাওয়া যায়নি!" : "No invoice data detected!"));
      }
    } catch (err: any) {
      console.error("Batch OCR error:", err);
      setErrorMessage(err.message || (isBn ? "স্ক্যান করতে সমস্যা হয়েছে!" : "Scan failed!"));
      alert(err.message || (isBn ? "স্ক্যান করতে সমস্যা হয়েছে!" : "Failed to scan documents!"));
    } finally {
      setStatus("");
    }
  };

  // ৩. টেবিলের ভেতরে সরাসরি ডেটা এডিট করার ফাংশন (Inline Edit)
  const handleCellChange = (index: number, field: keyof InvoiceItem, value: string) => {
    const updated = [...invoices];
    if (field === "subtotal" || field === "vat_amount" || field === "total_amount") {
      const numVal = parseFloat(value) || 0;
      (updated[index] as any)[field] = numVal;

      // Auto compute total_amount if subtotal and vat_amount are changed
      if (field === "subtotal") {
        const vat = Number(updated[index].vat_amount) || 0;
        updated[index].total_amount = Math.round((numVal + vat) * 100) / 100;
      } else if (field === "vat_amount") {
        const sub = Number(updated[index].subtotal) || 0;
        updated[index].total_amount = Math.round((sub + numVal) * 100) / 100;
      }
    } else {
      (updated[index] as any)[field] = value;
    }
    setInvoices(updated);
  };

  // ৪. কোনো নির্দিষ্ট রো (Row) ডিলিট বা নতুন রো যোগ করার ফাংশন
  const handleDeleteRow = (index: number) => {
    setInvoices(invoices.filter((_, i) => i !== index));
  };

  const handleAddEmptyRow = () => {
    setInvoices([
      ...invoices,
      { invoice_number: "", vendor_name: "", date: "", subtotal: 0, vat_amount: 0, total_amount: 0 },
    ]);
  };

  const handleLoadSample = () => {
    setInvoices((prev) => [...prev, ...SAMPLE_INVOICES]);
  };

  const handleClearAll = () => {
    if (invoices.length === 0) return;
    if (confirm(isBn ? "আপনি কি সম্পূর্ণ তালিকা মুছতে চান?" : "Are you sure you want to clear the entire list?")) {
      setInvoices([]);
    }
  };

  // ৫. সর্বমোট হিসাব (Auto Calculation)
  const totalSubtotal = invoices.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  const totalVat = invoices.reduce((sum, item) => sum + (Number(item.vat_amount) || 0), 0);
  const grandTotal = invoices.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);

  // ৬. CSV ডাউনলোড ফাংশন (বাংলা ফন্ট সাপোর্টসহ)
  const downloadCSV = () => {
    if (invoices.length === 0) return;
    const headers = [
      isBn 
        ? "ইনভয়েস নং,প্রতিষ্ঠানের নাম,তারিখ,ভ্যাট ছাড়া মূল্য,ভ্যাট (VAT),সর্বমোট টাকা"
        : "Invoice No,Vendor Name,Date,Subtotal (Excl VAT),VAT Amount,Grand Total"
    ];
    const rows = invoices.map((inv) => {
      const vendor = `"${(inv.vendor_name || "").replace(/"/g, '""')}"`;
      const invNo = `"${(inv.invoice_number || "").replace(/"/g, '""')}"`;
      return `${invNo},${vendor},${inv.date || ""},${inv.subtotal || 0},${inv.vat_amount || 0},${inv.total_amount || 0}`;
    });
    rows.push(`"","${isBn ? 'সর্বমোট (Total) =' : 'Total ='}","",${totalSubtotal},${totalVat},${grandTotal}`);

    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `VAT_Invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ৭. আসল Excel (.xlsx) ডাউনলোড ফাংশন
  const downloadExcel = () => {
    if (invoices.length === 0) return;
    const formattedData = invoices.map((inv, idx) => ({
      [isBn ? "ক্রমিক নং" : "SL No"]: idx + 1,
      [isBn ? "ইনভয়েস নং" : "Invoice No"]: inv.invoice_number,
      [isBn ? "প্রতিষ্ঠানের নাম" : "Vendor Name"]: inv.vendor_name,
      [isBn ? "তারিখ" : "Date"]: inv.date,
      [isBn ? "ভ্যাট ছাড়া মূল্য (৳)" : "Subtotal (৳)"]: Number(inv.subtotal) || 0,
      [isBn ? "ভ্যাট - VAT (৳)" : "VAT (৳)"]: Number(inv.vat_amount) || 0,
      [isBn ? "সর্বমোট টাকা (৳)" : "Total Amount (৳)"]: Number(inv.total_amount) || 0,
    }));

    formattedData.push({
      [isBn ? "ক্রমিক নং" : "SL No"]: "" as any,
      [isBn ? "ইনভয়েস নং" : "Invoice No"]: "",
      [isBn ? "প্রতিষ্ঠানের নাম" : "Vendor Name"]: isBn ? "সর্বমোট (Total) =" : "Grand Total =",
      [isBn ? "তারিখ" : "Date"]: "",
      [isBn ? "ভ্যাট ছাড়া মূল্য (৳)" : "Subtotal (৳)"]: totalSubtotal,
      [isBn ? "ভ্যাট - VAT (৳)" : "VAT (৳)"]: totalVat,
      [isBn ? "সর্বমোট টাকা (৳)" : "Total Amount (৳)"]: grandTotal,
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Set auto column widths for neat appearance
    worksheet["!cols"] = [
      { wch: 8 },  // SL
      { wch: 18 }, // Invoice No
      { wch: 32 }, // Vendor
      { wch: 14 }, // Date
      { wch: 18 }, // Subtotal
      { wch: 16 }, // VAT
      { wch: 18 }, // Total
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    XLSX.writeFile(workbook, `VAT_Invoices_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="max-w-6xl mx-auto my-6 p-4 md:p-8 font-sans space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-zinc-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-[11px] font-bold tracking-wide">
              <Sparkles size={14} className="text-blue-400" />
              {isBn ? 'মাল্টিপল ইনভয়েস ও ভ্যাট চালান স্ক্যানার' : 'Batch Invoice & VAT Challan Scanner'}
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {isBn ? 'স্মার্ট ইনভয়েস ও ভ্যাট চালান স্ক্যানার (Batch OCR)' : 'Smart Batch Invoice & VAT Scanner (OCR)'}
            </h2>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-medium">
              {isBn
                ? 'একসাথে একাধিক চালান ও ইনভয়েসের ছবি (JPG/PNG) বা PDF আপলোড করুন। ব্রাউজারে ইমেজ কমপ্রেশন ও Gemini AI দিয়ে স্বয়ংক্রিয়ভাবে ইনভয়েস নম্বর, প্রতিষ্ঠান, তারিখ ও ভ্যাট হিসাব প্রস্তুত হয়।'
                : 'Upload multiple invoice or challan images (JPG/PNG) or PDFs in batch. Pre-compresses in browser and uses Gemini AI to extract invoice numbers, vendors, dates, and VAT amounts.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 cursor-pointer shadow-sm"
            >
              <RefreshCw size={14} />
              <span>{isBn ? 'নমুনা ডেটা লোড করুন' : 'Load Sample Data'}</span>
            </button>
            {invoices.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 cursor-pointer shadow-sm"
              >
                <Trash2 size={14} />
                <span>{isBn ? 'সব মুছুন' : 'Clear All'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* আপলোড ফর্ম */}
      <form
        onSubmit={handleUpload}
        className="p-5 md:p-6 bg-white rounded-2xl border border-zinc-200/90 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div>
            <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2">
              <Upload size={16} className="text-blue-600" />
              <span>{isBn ? 'ডকুমেন্ট ও চালান আপলোড করুন' : 'Upload Documents & Challans'}</span>
            </h4>
            <p className="text-xs text-zinc-500">
              {isBn 
                ? 'একসাথে এক বা একাধিক ছবি (JPG, PNG, WebP) অথবা PDF নির্বাচন করুন।' 
                : 'Select one or more images (JPG, PNG, WebP) or PDFs at once.'}
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-md font-bold self-start sm:self-auto">
            {files ? `${files.length} ${isBn ? 'টি ফাইল সিলেক্ট করা হয়েছে' : 'files selected'}` : (isBn ? 'কোনো ফাইল সিলেক্ট করা হয়নি' : 'No files selected')}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label className="flex-1 flex items-center gap-3 px-4 py-3 bg-zinc-50 border border-dashed border-zinc-300 hover:border-blue-500 rounded-xl cursor-pointer text-xs font-bold text-zinc-700 hover:text-blue-700 transition-all">
            <Upload size={16} className="text-blue-600 shrink-0" />
            <span className="truncate">
              {files && files.length > 0 
                ? `${files.length} ${isBn ? 'টি ফাইল নির্বাচিত:' : 'files:'} ${Array.from(files).map(f => f.name).slice(0, 2).join(', ')}${files.length > 2 ? '...' : ''}` 
                : (isBn ? 'ছবি বা PDF সিলেক্ট করুন (একাধিক ফাইল গ্রহণ করে)' : 'Choose Images or PDF (Multiple files supported)')}
            </span>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => setFiles(e.target.files)}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={status !== ""}
            className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
              status !== ""
                ? "bg-zinc-400 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
            }`}
          >
            {status !== "" ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>{status}</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>{isBn ? "🔍 স্ক্যান করুন (Batch OCR)" : "🔍 Scan Batch"}</span>
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>

      {/* এডিটেবল টেবিল ও ডাউনলোড বাটন */}
      {invoices.length > 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-600" />
                <span>
                  {isBn 
                    ? `স্ক্যানকৃত তালিকা (${invoices.length} টি) — ক্লিক করে সরাসরি এডিট করুন`
                    : `Extracted Invoices (${invoices.length}) — Click any cell to edit`}
                </span>
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                {isBn 
                  ? 'প্রতিটি সেল সরাসরি এডিটযোগ্য। এডিট করার সাথে সাথে সর্বমোট হিসাব স্বয়ংক্রিয়ভাবে আপডেট হবে।'
                  : 'All cells are inline-editable. Grand totals re-calculate automatically.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleAddEmptyRow}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus size={14} />
                <span>{isBn ? "নতুন রো" : "Add Row"}</span>
              </button>
              <button
                type="button"
                onClick={downloadCSV}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Download size={14} />
                <span>{isBn ? "CSV ডাউনলোড" : "Export CSV"}</span>
              </button>
              <button
                type="button"
                onClick={downloadExcel}
                className="px-3.5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet size={14} />
                <span>{isBn ? "Excel (.xlsx) ডাউনলোড" : "Export Excel"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-100/90 text-zinc-700 font-bold border-b border-zinc-200">
                  <th className="p-3 text-center w-12">#</th>
                  <th className="p-3 min-w-[140px]">{isBn ? "ইনভয়েস নং" : "Invoice No"}</th>
                  <th className="p-3 min-w-[200px]">{isBn ? "প্রতিষ্ঠানের নাম" : "Vendor Name"}</th>
                  <th className="p-3 min-w-[120px]">{isBn ? "তারিখ" : "Date"}</th>
                  <th className="p-3 min-w-[130px] text-right">{isBn ? "ভ্যাট ছাড়া মূল্য (৳)" : "Subtotal (৳)"}</th>
                  <th className="p-3 min-w-[120px] text-right">{isBn ? "ভ্যাট - VAT (৳)" : "VAT Amount (৳)"}</th>
                  <th className="p-3 min-w-[140px] text-right">{isBn ? "সর্বমোট টাকা (৳)" : "Total Amount (৳)"}</th>
                  <th className="p-3 text-center w-16">{isBn ? "অ্যাকশন" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {invoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-2.5 text-center font-mono font-bold text-zinc-500">
                      {idx + 1}
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={inv.invoice_number || ""}
                        onChange={(e) => handleCellChange(idx, "invoice_number", e.target.value)}
                        placeholder="e.g. INV-1002"
                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={inv.vendor_name || ""}
                        onChange={(e) => handleCellChange(idx, "vendor_name", e.target.value)}
                        placeholder="e.g. Eastern Trading PLC"
                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={inv.date || ""}
                        onChange={(e) => handleCellChange(idx, "date", e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="any"
                        value={inv.subtotal ?? 0}
                        onChange={(e) => handleCellChange(idx, "subtotal", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-mono text-right focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="any"
                        value={inv.vat_amount ?? 0}
                        onChange={(e) => handleCellChange(idx, "vat_amount", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-mono text-right focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium text-emerald-700"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="any"
                        value={inv.total_amount ?? 0}
                        onChange={(e) => handleCellChange(idx, "total_amount", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-blue-200 rounded-lg text-xs font-mono text-right focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-bold text-blue-900"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title={isBn ? "মুছে ফেলুন" : "Delete row"}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* সর্বমোট যোগফলের সারি */}
                <tr className="bg-zinc-100 font-bold border-t-2 border-zinc-300">
                  <td colSpan={4} className="p-3 text-right text-zinc-800 font-black">
                    {isBn ? "সর্বমোট (Grand Total) =" : "Grand Total ="}
                  </td>
                  <td className="p-3 text-right font-mono text-zinc-900">
                    ৳ {totalSubtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-700">
                    ৳ {totalVat.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono text-blue-900 font-black text-sm">
                    ৳ {grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-500 gap-2 pt-2">
            <span>
              ✓ {isBn ? 'এক্সেল ডাউনলোড করতে "Excel (.xlsx) ডাউনলোড" এ ক্লিক করুন।' : 'Click "Export Excel" to save in native .xlsx spreadsheet format.'}
            </span>
            <span className="font-mono">
              {invoices.length} {isBn ? 'টি এন্ট্রি সংরক্ষিত' : 'entries recorded'}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <FileSpreadsheet size={32} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="font-black text-zinc-900 text-sm">
              {isBn ? "এখনও কোনো চালান স্ক্যান করা হয়নি" : "No invoices scanned yet"}
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {isBn
                ? "উপরের বক্সে এক বা একাধিক চালানের ছবি বা PDF দিন অথবা পরীক্ষা করতে নমুনা ডেটা লোড করুন।"
                : "Upload invoice photos or PDF files above to scan multiple invoices in batch, or load sample data."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            <Sparkles size={14} className="text-blue-600" />
            <span>{isBn ? "পরীক্ষা করতে নমুনা ডেটা লোড করুন" : "Load Sample Invoices"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

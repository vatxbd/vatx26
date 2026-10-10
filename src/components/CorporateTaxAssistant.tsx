import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Edit3, 
  Save, 
  Calculator, 
  TrendingUp, 
  FileSearch,
  Loader2,
  X,
  ChevronRight,
  Info,
  Sparkles,
  Building2,
  PieChart,
  ClipboardCheck,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseRobustJson } from '../utils/robustJsonParser';

const Type = {
  OBJECT: "OBJECT",
  STRING: "STRING",
  NUMBER: "NUMBER",
  INTEGER: "INTEGER",
  BOOLEAN: "BOOLEAN",
  ARRAY: "ARRAY"
} as const;

interface CorporateTaxData {
  company_name: string;
  etin: string;
  bin: string;
  incorporation_no: string;
  assessment_year: string;
  financial_year: string;
  profit_loss: {
    total_turnover: number;
    cost_of_goods_sold: number;
    gross_profit: number;
    admin_expenses: number;
    selling_dist_expenses: number;
    financial_expenses: number;
    other_income: number;
    net_profit_before_tax: number;
  };
  tax_computation: {
    taxable_income: number;
    tax_rate: number;
    tax_liability: number;
    tds: number;
    advance_tax: number;
    tax_payable: number;
  };
  uncertain?: boolean;
  explanation?: string;
  confidence_scores?: {
    [key: string]: number;
  };
}

const CORPORATE_TAX_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    company_name: { type: Type.STRING, description: "Legal name of the company" },
    etin: { type: Type.STRING, description: "12-digit eTIN for the company" },
    bin: { type: Type.STRING, description: "Business Identification Number" },
    incorporation_no: { type: Type.STRING, description: "Company Registration/Incorporation Number" },
    assessment_year: { type: Type.STRING, description: "Assessment year (e.g., 2024-2025)" },
    financial_year: { type: Type.STRING, description: "Accounting/Financial year period" },
    profit_loss: {
      type: Type.OBJECT,
      properties: {
        total_turnover: { type: Type.NUMBER, description: "Total revenue or sales" },
        cost_of_goods_sold: { type: Type.NUMBER, description: "COGS" },
        gross_profit: { type: Type.NUMBER },
        admin_expenses: { type: Type.NUMBER },
        selling_dist_expenses: { type: Type.NUMBER },
        financial_expenses: { type: Type.NUMBER },
        other_income: { type: Type.NUMBER },
        net_profit_before_tax: { type: Type.NUMBER }
      }
    },
    tax_computation: {
      type: Type.OBJECT,
      properties: {
        taxable_income: { type: Type.NUMBER },
        tax_rate: { type: Type.NUMBER, description: "Applicable corporate tax rate in percentage" },
        tax_liability: { type: Type.NUMBER },
        tds: { type: Type.NUMBER },
        advance_tax: { type: Type.NUMBER },
        tax_payable: { type: Type.NUMBER }
      }
    },
    confidence_scores: {
      type: Type.OBJECT,
      properties: {
        company_name: { type: Type.NUMBER },
        etin: { type: Type.NUMBER },
        profit_loss: { type: Type.NUMBER }
      }
    },
    uncertain: { type: Type.BOOLEAN },
    explanation: { type: Type.STRING }
  },
  required: ["company_name", "etin", "assessment_year"]
};

export default function CorporateTaxAssistant({ t }: { t: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<CorporateTaxData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState('2024-25');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const financialYears = ['2023-24', '2024-25', '2025-26', '2026-27'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setExtractedData(null);
      setError(null);
    }
  };

  const analyzeDocument = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      const ocrResponse = await fetch('/api/gemini/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
          {
            parts: [
              { text: `Extract corporate tax return data from this document for Bangladesh NBR system. 
                Target Financial Year: ${selectedFinancialYear} (Finance Bill 2026-27 / আয়কর পরিপত্র ২৬-২৭, ও আয়কর নির্দেশিকা ২৬-২৭).
                
                CRITICAL COMPLIANCE RULES:
                - Every field identified must strictly match the NBR standard corporate tax return categories under Income Tax Act 2023 and Finance Bill 26-27 guidelines.
                - Preserve exact 1:1 official field structure with zero arbitrary modifications.
                - Look for audited financial statements, tax computation sheets, or previous returns. 
                - Detect English and Bengali text accurately. Normalize all values to BDT.` },
              { inlineData: { data: base64Data, mimeType: file.type } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: CORPORATE_TAX_SCHEMA as any
        }
        })
      });

      if (!ocrResponse.ok) throw new Error(`HTTP ${ocrResponse.status}`);
      const ocrJson = await ocrResponse.json();
      const data = parseRobustJson<CorporateTaxData>(ocrJson.text || '{}', {} as CorporateTaxData);
      setExtractedData(data);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze company document. Please ensure it's a clear audit report or tax sheet.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    if (!extractedData) return;
    const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Company_Tax_${extractedData.company_name.replace(/\s+/g, '_')}.json`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <Building2 className="text-brand-600" size={32} />
            {t.corporateTax}
          </h2>
          <p className="text-zinc-500 mt-1">{t.corporateTaxDesc}</p>
        </div>
        
        {extractedData && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all"
            >
              {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
              {isEditing ? "Save Changes" : "Edit Summary"}
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
            >
              <Download size={18} />
              Export Returns Data
            </button>
          </div>
        )}
      </div>

      {!extractedData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 space-y-4">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest px-1">Target Financial Year</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {financialYears.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedFinancialYear(year)}
                    className={cn(
                      "py-3 rounded-2xl text-xs font-bold transition-all border",
                      selectedFinancialYear === year 
                        ? "bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-100" 
                        : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:bg-zinc-100"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative group cursor-pointer border-2 border-dashed rounded-[2.5rem] p-12 transition-all duration-300 flex flex-col items-center justify-center text-center gap-4",
                file ? "border-brand-500 bg-brand-50/30" : "border-zinc-200 hover:border-brand-400 hover:bg-zinc-50"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*,application/pdf"
              />
              
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300",
                file ? "bg-brand-500 text-white scale-110" : "bg-zinc-100 text-zinc-400 group-hover:scale-110 group-hover:bg-brand-100 group-hover:text-brand-600"
              )}>
                {file ? <FileText size={40} /> : <Upload size={40} />}
              </div>

              <div>
                <h3 className="text-xl font-bold text-zinc-900">
                  {file ? file.name : "Upload Audit Report"}
                </h3>
                <p className="text-zinc-500 text-sm mt-1">
                  Upload Audited Financial Statements, P/L accounts or TDS certificates
                </p>
              </div>

              {file && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button 
              disabled={!file || isAnalyzing}
              onClick={analyzeDocument}
              className="w-full py-5 bg-brand-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-brand-200 hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" />
                  Extracting Corporate Data...
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  Analyze Company Document
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                {error}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-900">
                <ClipboardCheck className="text-brand-600" />
                Company Return Wizard
              </h3>
              <div className="space-y-6">
                <Step 
                  icon={<FileSearch size={18} />}
                  title="Upload Documentation"
                  desc="Upload income statements, balance sheets or TDS certificates."
                />
                <Step 
                  icon={<Sparkles size={18} />}
                  title="Extract Data"
                  desc="AI extracts financial figures, turnover, and tax computations automatically."
                />
                <Step 
                  icon={<Edit3 size={18} />}
                  title="Review & Map"
                  desc="Verify extracted data and map it to Bangladesh corporate tax categories."
                />
                <Step 
                  icon={<ArrowRight size={18} />}
                  title="Pre-fill Form"
                  desc="Generate a structured summary for automated NBR form submission."
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form Data */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-zinc-50 bg-zinc-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 size={24} className="text-brand-600" />
                  <div>
                    <h3 className="font-bold text-zinc-900">Extracted Return Data</h3>
                    <p className="text-xs text-zinc-500">Review extraction for {extractedData.company_name}</p>
                  </div>
                </div>
                {extractedData.uncertain && (
                  <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    Needs Verification
                  </div>
                )}
              </div>

              <div className="p-8 space-y-10">
                {/* section: Company basics */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Info size={14} className="text-brand-500" />
                    Company Identification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DataField 
                      label={t.companyName} 
                      value={extractedData.company_name} 
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, company_name: val})}
                    />
                    <DataField 
                      label={t.companyBin} 
                      value={extractedData.bin} 
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, bin: val})}
                    />
                    <DataField 
                      label={t.companyTin} 
                      value={extractedData.etin} 
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, etin: val})}
                    />
                    <DataField 
                      label={t.incorpNo} 
                      value={extractedData.incorporation_no} 
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, incorporation_no: val})}
                    />
                    <DataField 
                      label={t.assessmentYear} 
                      value={extractedData.assessment_year} 
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, assessment_year: val})}
                    />
                    <DataField 
                      label={t.financialYear} 
                      value={extractedData.financial_year} 
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, financial_year: val})}
                    />
                  </div>
                </div>

                {/* section: Profit & Loss */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <PieChart size={14} className="text-brand-500" />
                    Income & Expenditure Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <DataField 
                      label={t.turnover} 
                      value={extractedData.profit_loss.total_turnover} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, profit_loss: {...extractedData.profit_loss, total_turnover: Number(val)}})}
                    />
                    <DataField 
                      label={t.cogs} 
                      value={extractedData.profit_loss.cost_of_goods_sold} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, profit_loss: {...extractedData.profit_loss, cost_of_goods_sold: Number(val)}})}
                    />
                    <DataField 
                      label={t.grossProfit} 
                      value={extractedData.profit_loss.gross_profit} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, profit_loss: {...extractedData.profit_loss, gross_profit: Number(val)}})}
                    />
                    <DataField 
                      label="Admin Expenses" 
                      value={extractedData.profit_loss.admin_expenses} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, profit_loss: {...extractedData.profit_loss, admin_expenses: Number(val)}})}
                    />
                    <DataField 
                      label="Marketing Exp." 
                      value={extractedData.profit_loss.selling_dist_expenses} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, profit_loss: {...extractedData.profit_loss, selling_dist_expenses: Number(val)}})}
                    />
                    <DataField 
                      label="Financial Exp." 
                      value={extractedData.profit_loss.financial_expenses} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, profit_loss: {...extractedData.profit_loss, financial_expenses: Number(val)}})}
                    />
                    <DataField 
                      label="Other Income" 
                      value={extractedData.profit_loss.other_income} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, profit_loss: {...extractedData.profit_loss, other_income: Number(val)}})}
                    />
                    <DataField 
                      label={t.netProfit} 
                      value={extractedData.profit_loss.net_profit_before_tax} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, profit_loss: {...extractedData.profit_loss, net_profit_before_tax: Number(val)}})}
                    />
                  </div>
                </div>

                {/* section: Tax Computation */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Calculator size={14} className="text-brand-500" />
                    Tax Liability & Payments
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DataField 
                      label="Taxable Income" 
                      value={extractedData.tax_computation.taxable_income} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, tax_computation: {...extractedData.tax_computation, taxable_income: Number(val)}})}
                    />
                    <DataField 
                      label={t.taxRate} 
                      value={extractedData.tax_computation.tax_rate} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, tax_computation: {...extractedData.tax_computation, tax_rate: Number(val)}})}
                    />
                    <DataField 
                      label={t.taxLiability} 
                      value={extractedData.tax_computation.tax_liability} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, tax_computation: {...extractedData.tax_computation, tax_liability: Number(val)}})}
                    />
                    <DataField 
                      label="TDS/VDS Credit" 
                      value={extractedData.tax_computation.tds} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, tax_computation: {...extractedData.tax_computation, tds: Number(val)}})}
                    />
                    <DataField 
                      label="Advance Tax (AIT)" 
                      value={extractedData.tax_computation.advance_tax} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, tax_computation: {...extractedData.tax_computation, advance_tax: Number(val)}})}
                    />
                    <DataField 
                      label={t.taxPayable} 
                      value={extractedData.tax_computation.tax_payable} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, tax_computation: {...extractedData.tax_computation, tax_payable: Number(val)}})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Info & Actions */}
          <div className="space-y-6">
            <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 space-y-6 shadow-xl shadow-zinc-200">
              <h3 className="font-bold flex items-center gap-2">
                <ClipboardCheck className="text-brand-400" size={20} />
                Return Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Assessment</span>
                  <span className="font-bold uppercase tracking-wider">{extractedData.assessment_year}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Tax Payable</span>
                  <span className="font-bold text-brand-400">৳{extractedData.tax_computation.tax_payable.toLocaleString()}</span>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <div className="space-y-3">
                <button className="w-full py-4 bg-brand-500 text-white rounded-2xl font-black text-sm hover:bg-brand-600 transition-all flex items-center justify-center gap-2">
                  <Download size={16} /> Export NBR Mapping
                </button>
                <button 
                  onClick={() => setExtractedData(null)}
                  className="w-full py-4 bg-white/5 text-zinc-400 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all"
                >
                  Upload New Doc
                </button>
              </div>
            </div>

            {previewUrl && (
              <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-4 shadow-sm">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 px-4">Financial Doc Preview</p>
                <div className="rounded-2xl overflow-hidden border border-zinc-100">
                  {file?.type === 'application/pdf' ? (
                    <div className="aspect-[3/4] bg-zinc-100 flex items-center justify-center">
                      <FileText size={48} className="text-zinc-300" />
                    </div>
                  ) : (
                    <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DataField({ label, value, type = "text", isEditing, onChange }: { 
  label: string, 
  value: any, 
  type?: string,
  isEditing: boolean,
  onChange: (val: string) => void
}) {
  return (
    <div className="space-y-1.5 ">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</label>
      {isEditing ? (
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all"
        />
      ) : (
        <div className="px-4 py-3 bg-zinc-50 border border-transparent rounded-xl text-sm font-bold text-zinc-900 min-h-[46px] flex items-center">
          {type === 'number' ? `৳${Number(value).toLocaleString()}` : value || "—"}
        </div>
      )}
    </div>
  );
}

function Step({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:bg-brand-100 group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <div>
        <p className="font-bold text-zinc-900 text-sm">{title}</p>
        <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

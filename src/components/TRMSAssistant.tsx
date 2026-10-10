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
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseRobustJson } from '../utils/robustJsonParser';
import Markdown from 'react-markdown';

const Type = {
  OBJECT: "OBJECT",
  STRING: "STRING",
  NUMBER: "NUMBER",
  INTEGER: "INTEGER",
  BOOLEAN: "BOOLEAN",
  ARRAY: "ARRAY"
} as const;

interface TRMSData {
  taxpayer_name: string;
  tin: string;
  assessment_year: string;
  employer_name: string;
  salary: {
    basic: number;
    house_rent: number;
    medical: number;
    conveyance: number;
    bonus: number;
    other: number;
    gross_total: number;
  };
  deductions: {
    tds: number;
    provident_fund: number;
    others: number;
  };
  confidence_scores?: {
    [key: string]: number;
  };
  uncertain?: boolean;
  explanation?: string;
}

const TRMS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    taxpayer_name: { type: Type.STRING, description: "Full name of the taxpayer" },
    tin: { type: Type.STRING, description: "12-digit Taxpayer Identification Number" },
    assessment_year: { type: Type.STRING, description: "The tax assessment year (e.g., 2024-2025)" },
    employer_name: { type: Type.STRING, description: "Name of the employer or organization" },
    salary: {
      type: Type.OBJECT,
      properties: {
        basic: { type: Type.NUMBER, description: "Basic salary amount" },
        house_rent: { type: Type.NUMBER, description: "House rent allowance" },
        medical: { type: Type.NUMBER, description: "Medical allowance" },
        conveyance: { type: Type.NUMBER, description: "Conveyance allowance" },
        bonus: { type: Type.NUMBER, description: "Festival or other bonuses" },
        other: { type: Type.NUMBER, description: "Any other allowances" },
        gross_total: { type: Type.NUMBER, description: "Total gross salary" }
      },
      required: ["basic", "gross_total"]
    },
    deductions: {
      type: Type.OBJECT,
      properties: {
        tds: { type: Type.NUMBER, description: "Tax Deducted at Source" },
        provident_fund: { type: Type.NUMBER, description: "Provident fund contribution" },
        others: { type: Type.NUMBER, description: "Other deductions" }
      }
    },
    confidence_scores: {
      type: Type.OBJECT,
      properties: {
        taxpayer_name: { type: Type.NUMBER },
        tin: { type: Type.NUMBER },
        salary: { type: Type.NUMBER },
        deductions: { type: Type.NUMBER }
      }
    },
    uncertain: { type: Type.BOOLEAN },
    explanation: { type: Type.STRING }
  },
  required: ["taxpayer_name", "tin", "salary"]
};

export default function TRMSAssistant() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<TRMSData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      const res = await fetch('/api/gemini/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: "Extract tax-related data from this document for Bangladesh NBR TRMS system. Detect both English and Bengali text. Normalize currency to BDT. If data is unclear, set uncertain to true and provide an explanation." },
                { inlineData: { data: base64Data, mimeType: file.type } }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: TRMS_SCHEMA as any
          }
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ocrJson = await res.json();
      const data = parseRobustJson<TRMSData>(ocrJson.text || '{}', {} as TRMSData);
      setExtractedData(data);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze the document. Please ensure it's a clear image or PDF.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateTaxableIncome = (data: TRMSData) => {
    // Bangladesh Tax Rules (Simplified for 2024-25)
    // Basic: 100% taxable
    // House Rent: Exemption up to 50% of basic or 25,000/month (whichever is lower)
    // Medical: Exemption up to 10% of basic or 1,20,000/year (whichever is lower)
    // Conveyance: Exemption up to 30,000/year
    
    const { basic, house_rent, medical, conveyance, bonus, other } = data.salary;
    
    let taxable = basic;
    
    // House Rent
    const hrExemption = Math.min(basic * 0.5, 25000 * 12);
    taxable += Math.max(0, house_rent - hrExemption);
    
    // Medical
    const medExemption = Math.min(basic * 0.1, 120000);
    taxable += Math.max(0, medical - medExemption);
    
    // Conveyance
    taxable += Math.max(0, conveyance - 30000);
    
    // Bonus & Other
    taxable += bonus + other;
    
    return taxable;
  };

  const suggestRebate = (taxableIncome: number) => {
    // Investment limit: 20% of taxable income or 10,000,000 (whichever is lower)
    // Rebate: 15% of actual investment
    const investmentLimit = Math.min(taxableIncome * 0.2, 10000000);
    return {
      limit: investmentLimit,
      suggestedInvestment: investmentLimit,
      potentialRebate: investmentLimit * 0.15
    };
  };

  const handleExport = () => {
    if (!extractedData) return;
    const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TRMS_Data_${extractedData.taxpayer_name.replace(/\s+/g, '_')}.json`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <FileSearch className="text-brand-600" size={32} />
            TRMS Data Extractor
          </h2>
          <p className="text-zinc-500 mt-1">Intelligent tax data extraction for NBR TRMS system</p>
        </div>
        
        {extractedData && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all"
            >
              {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
              {isEditing ? "Save Changes" : "Edit Data"}
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
            >
              <Download size={18} />
              Export JSON
            </button>
          </div>
        )}
      </div>

      {!extractedData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
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
                  {file ? file.name : "Upload Document"}
                </h3>
                <p className="text-zinc-500 text-sm mt-1">
                  PDF, JPG, or PNG (Salary Statement, Payslip, etc.)
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
                  Analyzing Document...
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  Start AI Extraction
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

          <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Info className="text-brand-600" />
              How it works
            </h3>
            <div className="space-y-4">
              {[
                { title: "Upload", desc: "Upload your salary certificate or payslip (Bengali or English)." },
                { title: "AI Analysis", desc: "Our AI extracts all TRMS-required fields with high precision." },
                { title: "Review & Edit", desc: "Verify the extracted data and make manual adjustments if needed." },
                { title: "Export", desc: "Download the structured JSON data ready for NBR portal entry." }
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-black text-xs shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 text-sm">{step.title}</p>
                    <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Data Preview & Edit */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-zinc-50 bg-zinc-50/50 flex items-center justify-between">
                <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                  <FileText className="text-brand-600" size={20} />
                  Extracted TRMS Data
                </h3>
                {extractedData.uncertain && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100">
                    <AlertCircle size={12} />
                    Uncertain
                  </div>
                )}
              </div>

              <div className="p-8 space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DataField 
                    label="Taxpayer Name" 
                    value={extractedData.taxpayer_name} 
                    confidence={extractedData.confidence_scores?.taxpayer_name}
                    isEditing={isEditing}
                    onChange={(val) => setExtractedData({...extractedData, taxpayer_name: val})}
                  />
                  <DataField 
                    label="TIN Number" 
                    value={extractedData.tin} 
                    confidence={extractedData.confidence_scores?.tin}
                    isEditing={isEditing}
                    onChange={(val) => setExtractedData({...extractedData, tin: val})}
                  />
                  <DataField 
                    label="Assessment Year" 
                    value={extractedData.assessment_year} 
                    isEditing={isEditing}
                    onChange={(val) => setExtractedData({...extractedData, assessment_year: val})}
                  />
                  <DataField 
                    label="Employer Name" 
                    value={extractedData.employer_name} 
                    isEditing={isEditing}
                    onChange={(val) => setExtractedData({...extractedData, employer_name: val})}
                  />
                </div>

                {/* Salary Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Calculator size={14} />
                    Salary Breakdown (BDT)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DataField 
                      label="Basic Salary" 
                      value={extractedData.salary.basic} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, salary: {...extractedData.salary, basic: Number(val)}})}
                    />
                    <DataField 
                      label="House Rent" 
                      value={extractedData.salary.house_rent} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, salary: {...extractedData.salary, house_rent: Number(val)}})}
                    />
                    <DataField 
                      label="Medical" 
                      value={extractedData.salary.medical} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, salary: {...extractedData.salary, medical: Number(val)}})}
                    />
                    <DataField 
                      label="Conveyance" 
                      value={extractedData.salary.conveyance} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, salary: {...extractedData.salary, conveyance: Number(val)}})}
                    />
                    <DataField 
                      label="Bonus" 
                      value={extractedData.salary.bonus} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, salary: {...extractedData.salary, bonus: Number(val)}})}
                    />
                    <DataField 
                      label="Other" 
                      value={extractedData.salary.other} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, salary: {...extractedData.salary, other: Number(val)}})}
                    />
                  </div>
                  <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 flex justify-between items-center">
                    <span className="font-bold text-brand-900">Gross Total</span>
                    <span className="text-xl font-black text-brand-600">৳{extractedData.salary.gross_total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={14} />
                    Deductions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DataField 
                      label="TDS (Tax Paid)" 
                      value={extractedData.deductions.tds} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, deductions: {...extractedData.deductions, tds: Number(val)}})}
                    />
                    <DataField 
                      label="Provident Fund" 
                      value={extractedData.deductions.provident_fund} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, deductions: {...extractedData.deductions, provident_fund: Number(val)}})}
                    />
                    <DataField 
                      label="Others" 
                      value={extractedData.deductions.others} 
                      type="number"
                      isEditing={isEditing}
                      onChange={(val) => setExtractedData({...extractedData, deductions: {...extractedData.deductions, others: Number(val)}})}
                    />
                  </div>
                </div>

                {extractedData.explanation && (
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">AI Explanation</p>
                    <p className="text-sm text-zinc-600 italic">{extractedData.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analysis & Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 space-y-6 shadow-sm">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <Calculator className="text-brand-600" size={20} />
                Tax Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-zinc-50">
                  <span className="text-sm text-zinc-500">Gross Salary</span>
                  <span className="font-bold">৳{extractedData.salary.gross_total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-50">
                  <span className="text-sm text-zinc-500">Taxable Income</span>
                  <span className="font-bold text-brand-600">৳{calculateTaxableIncome(extractedData).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-zinc-500">Tax Paid (TDS)</span>
                  <span className="font-bold text-emerald-600">৳{extractedData.deductions.tds.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 space-y-2">
                <p className="text-xs font-black text-brand-600 uppercase tracking-widest">Rebate Suggestion</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-brand-800">Investment Limit</span>
                  <span className="text-sm font-bold text-brand-900">৳{suggestRebate(calculateTaxableIncome(extractedData)).limit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-brand-800">Potential Rebate</span>
                  <span className="text-sm font-bold text-emerald-600">৳{suggestRebate(calculateTaxableIncome(extractedData)).potentialRebate.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => setExtractedData(null)}
                className="w-full py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                <Upload size={16} />
                Upload Another
              </button>
            </div>

            {previewUrl && (
              <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-4 shadow-sm">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 px-4">Document Preview</p>
                <div className="rounded-2xl overflow-hidden border border-zinc-100">
                  {file?.type === 'application/pdf' ? (
                    <div className="aspect-[3/4] bg-zinc-100 flex items-center justify-center">
                      <FileText size={48} className="text-zinc-300" />
                      <p className="text-xs text-zinc-400 mt-2">PDF Preview not available</p>
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

function DataField({ label, value, type = "text", confidence, isEditing, onChange }: { 
  label: string, 
  value: any, 
  type?: string,
  confidence?: number,
  isEditing: boolean,
  onChange: (val: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</label>
        {confidence !== undefined && (
          <div className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            confidence > 0.9 ? "bg-emerald-50 text-emerald-600" : 
            confidence > 0.7 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
          )}>
            {Math.round(confidence * 100)}% Match
          </div>
        )}
      </div>
      {isEditing ? (
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all"
        />
      ) : (
        <div className="px-4 py-3 bg-zinc-50 border border-transparent rounded-xl text-sm font-bold text-zinc-900">
          {type === 'number' ? `৳${Number(value).toLocaleString()}` : value || "—"}
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

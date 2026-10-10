import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  MessageCircle, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Save,
  MessageSquare,
  ImageIcon
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { parseRobustJson } from '../utils/robustJsonParser';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  label: string;
}

interface OCREntry {
  id: number;
  sourceType: string;
  rawText: string;
  extractedData: any;
  imageUrl: string;
  sourceUrl?: string;
  status: string;
  createdAt: string;
}

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: <Facebook size={18} /> },
  { id: 'twitter', name: 'Twitter', icon: <Twitter size={18} /> },
  { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin size={18} /> },
  { id: 'instagram', name: 'Instagram', icon: <Instagram size={18} /> },
  { id: 'whatsapp', name: 'WhatsApp', icon: <MessageCircle size={18} /> },
  { id: 'other', name: 'Other', icon: <Share2 size={18} /> },
];

export default function SocialIntegration() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [ocrEntries, setOcrEntries] = useState<OCREntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newLink, setNewLink] = useState({ platform: 'facebook', url: '', label: '' });
  const [showAddLink, setShowAddLink] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSource, setLastSource] = useState<{ type: 'image' | 'url'; value: string } | null>(null);

  const selectEntry = (entry: OCREntry) => {
    setOcrResult(entry.extractedData);
    if (entry.sourceType === 'image') {
      setPreviewImage(entry.imageUrl);
      setLastSource({ type: 'image', value: entry.imageUrl });
    } else {
      setPreviewImage(null);
      setLastSource({ type: 'url', value: entry.sourceUrl || '' });
    }
    // Scroll to top of OCR section or just let the user see it
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchLinks();
    fetchOcrEntries();
  }, []);

  const fetchLinks = async () => {
    const res = await fetch('/api/social/links');
    const data = await res.json();
    setLinks(data);
  };

  const fetchOcrEntries = async () => {
    const res = await fetch('/api/social/ocr');
    const data = await res.json();
    setOcrEntries(data);
  };

  const handleAddLink = async () => {
    if (!newLink.url) return;
    await fetch('/api/social/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLink),
    });
    setNewLink({ platform: 'facebook', url: '', label: '' });
    setShowAddLink(false);
    fetchLinks();
  };

  const handleDeleteLink = async (id: number) => {
    await fetch(`/api/social/links/${id}`, { method: 'DELETE' });
    fetchLinks();
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      setPreviewImage(base64Data);
      processOCR(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false 
  } as any);

  const processOCR = async (base64Image: string) => {
    setIsProcessing(true);
    setOcrResult(null);
    try {
      const res = await fetch('/api/gemini/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Extract data from this social media message/screenshot. Extract all relevant text and identify key entities (people, organizations, locations, dates, amounts). Look for transaction details, amounts, dates, vendor names, or tax-related info. Return as JSON with fields: rawText (string), entities (array of {name, type, context}), amount (number), date (ISO string), vendor (string), description (string), type (vat/tax/other).",
          images: [{ mimeType: "image/png", base64: base64Image.split(',')[1] || base64Image }],
          config: { responseMimeType: "application/json" }
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const parsed = parseRobustJson<any>(data.text || '{}', {});
      setOcrResult(parsed);
      setLastSource({ type: 'image', value: base64Image });
    } catch (err) {
      console.error("OCR failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const processURLOCR = async () => {
    if (!urlInput) return;
    setIsProcessing(true);
    setOcrResult(null);
    setPreviewImage(null);
    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyze this social media URL: ${urlInput}. Extract all relevant text and identify key entities (people, organizations, locations, dates, amounts). Look for transaction details, amounts, dates, vendor names, or tax-related info. Return as JSON with fields: rawText (string), entities (array of {name, type, context}), amount (number), date (ISO string), vendor (string), description (string), type (vat/tax/other).`,
          responseMimeType: "application/json"
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const parsed = parseRobustJson<any>(data.text || '{}', {});
      setOcrResult(parsed);
      setLastSource({ type: 'url', value: urlInput });
      setUrlInput('');
    } catch (err) {
      console.error("URL OCR failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToHistory = async () => {
    if (!ocrResult || !lastSource) return;
    setIsSaving(true);
    try {
      await fetch('/api/social/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: ocrResult.rawText || JSON.stringify(ocrResult),
          extractedData: ocrResult,
          imageUrl: lastSource.type === 'image' ? lastSource.value : null,
          sourceUrl: lastSource.type === 'url' ? lastSource.value : null,
          sourceType: lastSource.type
        }),
      });
      fetchOcrEntries();
      alert('Saved to OCR history!');
    } catch (err) {
      console.error("Save to history failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const saveToRecords = async (type: 'vat' | 'tax') => {
    if (!ocrResult) return;
    
    const endpoint = type === 'vat' ? '/api/vat/calculate' : '/api/tax/income/calculate';
    const payload = type === 'vat' ? {
      amount: ocrResult.amount || 0,
      rate: 15,
      category: 'Social Media Entry',
      label: ocrResult.description || ocrResult.vendor || 'OCR Entry'
    } : {
      totalIncome: ocrResult.amount || 0,
      label: ocrResult.description || ocrResult.vendor || 'OCR Entry'
    };

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    alert(`Saved to ${type.toUpperCase()} records!`);
    setOcrResult(null);
    setPreviewImage(null);
  };

  return (
    <div className="space-y-8">
      {/* Social Links Section */}
      <section className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Share2 className="text-brand-500" /> Social Links
            </h2>
            <p className="text-sm text-zinc-500">Manage your business social media profiles</p>
          </div>
          <button 
            onClick={() => setShowAddLink(!showAddLink)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all"
          >
            <Plus size={18} /> Add Link
          </button>
        </div>

        <AnimatePresence>
          {showAddLink && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Platform</label>
                  <select 
                    value={newLink.platform}
                    onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                    className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                  >
                    {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">URL</label>
                  <input 
                    type="url"
                    placeholder="https://..."
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Label (Optional)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. Main Page"
                      value={newLink.label}
                      onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                      className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                    />
                    <button 
                      onClick={handleAddLink}
                      className="px-6 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map(link => (
            <div key={link.id} className="group p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-brand-200 hover:bg-white transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-zinc-600 shadow-sm group-hover:text-brand-600 transition-colors">
                  {PLATFORMS.find(p => p.id === link.platform)?.icon || <Share2 size={18} />}
                </div>
                <button 
                  onClick={() => handleDeleteLink(link.id)}
                  className="p-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="font-bold text-zinc-900 mb-1">{link.label || link.platform}</h3>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-brand-600 flex items-center gap-1 truncate"
              >
                {link.url} <ExternalLink size={10} />
              </a>
            </div>
          ))}
          {links.length === 0 && !showAddLink && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-100 rounded-3xl">
              <p className="text-zinc-400 text-sm italic">No social links added yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* OCR Integration Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <MessageSquare className="text-brand-500" /> Message OCR
            </h2>
            <p className="text-sm text-zinc-500">Extract data from social media screenshots or URLs</p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-2">
              <input 
                type="url"
                placeholder="Paste social media URL here..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
              <button 
                onClick={processURLOCR}
                disabled={!urlInput || isProcessing}
                className="px-6 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50"
              >
                Analyze URL
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-100"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-zinc-400 font-bold">Or Upload Image</span>
              </div>
            </div>

            <div 
              {...getRootProps()} 
              className={cn(
                "relative aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer",
                isDragActive ? "border-brand-500 bg-brand-50/50" : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/50",
                previewImage && "border-none p-0 overflow-hidden"
              )}
            >
              <input {...getInputProps()} />
              {previewImage ? (
                <>
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-bold flex items-center gap-2">
                      <Upload size={20} /> Change Image
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-zinc-400 shadow-sm mb-4">
                    <ImageIcon size={32} />
                  </div>
                  <p className="text-sm font-bold text-zinc-900 mb-1">Drop screenshot here</p>
                  <p className="text-xs text-zinc-500">or click to browse files</p>
                </>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-4 bg-brand-50 rounded-2xl border border-brand-100 flex items-center gap-3"
              >
                <Loader2 className="text-brand-600 animate-spin" size={20} />
                <p className="text-sm font-bold text-brand-900">Analyzing message with AI...</p>
              </motion.div>
            )}

            {ocrResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4"
              >
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Extracted Data
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">Amount</p>
                      <p className="text-lg font-black text-emerald-900">৳{ocrResult.amount || '0.00'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">Date</p>
                      <p className="text-sm font-bold text-emerald-900">{ocrResult.date || 'N/A'}</p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">Vendor/Source</p>
                      <p className="text-sm font-bold text-emerald-900">{ocrResult.vendor || 'N/A'}</p>
                    </div>
                    {ocrResult.entities && ocrResult.entities.length > 0 && (
                      <div className="col-span-2 space-y-2">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Identified Entities</p>
                        <div className="flex flex-wrap gap-2">
                          {ocrResult.entities.map((ent: any, i: number) => (
                            <span key={i} className="px-2 py-1 bg-white/50 rounded-lg text-[10px] font-bold text-emerald-700 border border-emerald-100" title={ent.context}>
                              {ent.name} ({ent.type})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="col-span-2 space-y-1">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">Description</p>
                      <p className="text-xs text-emerald-800">{ocrResult.description || 'No description extracted.'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={saveToHistory}
                    disabled={isSaving}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                    Save to History
                  </button>
                  <button 
                    onClick={() => saveToRecords('vat')}
                    className="flex-1 py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={18} /> Entry to VAT
                  </button>
                  <button 
                    onClick={() => saveToRecords('tax')}
                    className="flex-1 py-3 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={18} /> Entry to Tax
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-sm flex flex-col">
          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <FileText className="text-brand-500" /> Recent Entries
            </h2>
            <p className="text-sm text-zinc-500">History of OCR processed social messages</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {ocrEntries.map(entry => (
              <div 
                key={entry.id} 
                onClick={() => selectEntry(entry)}
                className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-brand-200 hover:bg-white transition-all cursor-pointer"
              >
                  <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 bg-zinc-200 text-zinc-600 rounded-full uppercase">
                      {entry.sourceType.replace('_', ' ')}
                    </span>
                    {entry.sourceUrl && (
                      <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand-600 hover:underline flex items-center gap-1">
                        View Source <ExternalLink size={8} />
                      </a>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      {entry.extractedData?.vendor || 'Unknown Source'}
                    </p>
                    <p className="text-xs text-zinc-500 truncate max-w-[200px]">
                      {entry.extractedData?.description || 'No description'}
                    </p>
                  </div>
                  <p className="text-sm font-black text-brand-600">
                    ৳{entry.extractedData?.amount || 0}
                  </p>
                </div>
              </div>
            ))}
            {ocrEntries.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-4">
                  <FileText size={24} />
                </div>
                <p className="text-zinc-400 text-sm italic">No OCR entries yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

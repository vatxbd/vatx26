import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  ExternalLink, 
  FileText, 
  Calendar, 
  User, 
  DollarSign,
  ChevronRight,
  RefreshCw,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface OCRHistoryEntry {
  id: number;
  sourceType: string;
  extractedData: any;
  imageUrl: string;
  status: string;
  createdAt: string;
}

interface OCRHistoryProps {
  onSelect: (data: any) => void;
  language: 'en' | 'bn';
}

const OCRHistory: React.FC<OCRHistoryProps> = ({ onSelect, language }) => {
  const [history, setHistory] = useState<OCRHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<OCRHistoryEntry | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ocr/history');
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch OCR history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const deleteEntry = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await fetch(`/api/ocr/history/${id}`, { method: 'DELETE' });
      setHistory(history.filter(h => h.id !== id));
      if (selectedEntry?.id === id) setSelectedEntry(null);
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  const filteredHistory = history.filter(h => {
    const data = h.extractedData;
    const searchStr = `${data.documentType} ${data.taxpayerName || ''} ${data.date || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-xl shadow-zinc-200/50">
      <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-900/20">
            <History size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black font-display tracking-tight">OCR History</h3>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Previous Extractions</p>
          </div>
        </div>
        <button 
          onClick={fetchHistory}
          className="p-2 text-zinc-400 hover:text-zinc-900 transition-all"
          title="Refresh"
        >
          <RefreshCw size={18} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      <div className="p-6 border-b border-zinc-100 bg-white">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            type="text"
            placeholder="Search by type, name, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-brand-500" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-zinc-400 italic py-20">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center">
              <History size={32} className="text-zinc-200" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest">No history found</p>
          </div>
        ) : (
          filteredHistory.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedEntry(entry)}
              className={cn(
                "group p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden",
                selectedEntry?.id === entry.id 
                  ? "bg-brand-50 border-brand-200 shadow-lg shadow-brand-500/5" 
                  : "bg-white border-zinc-100 hover:border-zinc-300 hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="flex gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                    selectedEntry?.id === entry.id ? "bg-brand-500 text-white" : "bg-zinc-100 text-zinc-500"
                  )}>
                    <FileText size={24} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-zinc-900 truncate uppercase tracking-tight">
                      {entry.extractedData.documentType || "Unknown Document"}
                    </h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                        <Calendar size={10} /> {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                      {entry.extractedData.taxpayerName && (
                        <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                          <User size={10} /> {entry.extractedData.taxpayerName}
                        </span>
                      )}
                      {entry.extractedData.totalAmount && (
                        <span className="text-[10px] font-bold text-brand-600 flex items-center gap-1">
                          <DollarSign size={10} /> ৳{entry.extractedData.totalAmount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => deleteEntry(entry.id, e)}
                    className="p-2 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={20} className={cn("text-zinc-300 transition-transform", selectedEntry?.id === entry.id && "rotate-90 text-brand-500")} />
                </div>
              </div>

              <AnimatePresence>
                {selectedEntry?.id === entry.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 pt-6 border-t border-brand-100 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {entry.extractedData.fields?.slice(0, 4).map((f: any, i: number) => (
                          <div key={i} className="space-y-1">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{f.label}</p>
                            <p className="text-xs font-bold text-zinc-900 truncate">{f.value}</p>
                          </div>
                        ))}
                      </div>

                      {entry.extractedData.items && entry.extractedData.items.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Line Items ({entry.extractedData.items.length})</p>
                          <div className="space-y-2">
                            {entry.extractedData.items.slice(0, 2).map((item: any, i: number) => (
                              <div key={i} className="flex justify-between text-[10px] bg-white/50 p-2 rounded-lg border border-brand-100">
                                <span className="font-medium text-zinc-600 truncate mr-2">{item.desc}</span>
                                <span className="font-black text-zinc-900 shrink-0">৳{(item.qty * item.price).toLocaleString()}</span>
                              </div>
                            ))}
                            {entry.extractedData.items.length > 2 && (
                              <p className="text-[8px] text-zinc-400 italic">+{entry.extractedData.items.length - 2} more items...</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button 
                          onClick={() => onSelect(entry.extractedData)}
                          className="flex-1 py-3 bg-brand-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
                        >
                          <RefreshCw size={14} /> Re-process Extraction
                        </button>
                        <button 
                          className="px-4 py-3 bg-white border border-brand-200 text-brand-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-50 transition-all"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default OCRHistory;

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  ExternalLink, 
  FileText, 
  Users, 
  Package, 
  CreditCard, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  MoreHorizontal,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface OdooRecord {
  id: number;
  display_name: string;
  [key: string]: any;
}

const MODELS = [
  { id: 'account.move', name: 'Invoices', icon: <FileText size={18} /> },
  { id: 'res.partner', name: 'Customers', icon: <Users size={18} /> },
  { id: 'product.template', name: 'Products', icon: <Package size={18} /> },
  { id: 'account.payment', name: 'Payments', icon: <CreditCard size={18} /> },
];

export default function OdooIntegration() {
  const [activeModel, setActiveModel] = useState(MODELS[0].id);
  const [records, setRecords] = useState<OdooRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [activeModel]);

  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const domain = searchQuery ? `[["name", "ilike", "${searchQuery}"]]` : "[]";
      const res = await fetch(`/api/odoo/search?model=${activeModel}&domain=${encodeURIComponent(domain)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setRecords(data.data);
      } else {
        setError(data.error || 'Failed to fetch Odoo records');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
      {/* Sidebar Models */}
      <aside className="w-full lg:w-64 space-y-2">
        <div className="px-4 py-2 mb-4">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Odoo Models</h3>
        </div>
        {MODELS.map((model) => (
          <button 
            key={model.id}
            onClick={() => setActiveModel(model.id)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
              activeModel === model.id 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-200" 
                : "bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-100"
            )}
          >
            <div className="flex items-center gap-3">
              {model.icon}
              {model.name}
            </div>
            <ChevronRight size={14} className={cn("transition-transform", activeModel === model.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100")} />
          </button>
        ))}

        <div className="mt-8 p-6 bg-purple-50 rounded-3xl border border-purple-100">
          <div className="flex items-center gap-2 text-purple-700 mb-2">
            <Database size={16} />
            <span className="text-xs font-black uppercase tracking-widest">ERP Sync</span>
          </div>
          <p className="text-[10px] text-purple-600 font-medium leading-relaxed">
            Real-time synchronization with Odoo Enterprise. Changes here reflect instantly in your ERP.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50/30">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text"
              placeholder={`Search ${MODELS.find(m => m.id === activeModel)?.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
            />
          </form>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchRecords}
              className="p-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-all"
              title="Refresh"
            >
              <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10">
              <Plus size={16} /> New Record
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center gap-4 py-20"
              >
                <Loader2 size={40} className="text-purple-600 animate-spin" />
                <p className="text-sm font-bold text-zinc-400">Querying Odoo Database...</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center gap-4 py-20 text-center"
              >
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                  <AlertCircle size={32} />
                </div>
                <div>
                  <p className="text-lg font-black text-zinc-900">Odoo Connection Failed</p>
                  <p className="text-sm text-zinc-500">{error}</p>
                </div>
                <button 
                  onClick={fetchRecords}
                  className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
                >
                  Reconnect
                </button>
              </motion.div>
            ) : records.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center gap-4 py-20 text-center"
              >
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300">
                  <Database size={32} />
                </div>
                <div>
                  <p className="text-lg font-black text-zinc-900">No Records Found</p>
                  <p className="text-sm text-zinc-500">Try adjusting your search or filters</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="records"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {records.map((record) => (
                    <div 
                      key={record.id}
                      className="p-6 bg-white border border-zinc-100 rounded-3xl hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/20 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                          {MODELS.find(m => m.id === activeModel)?.icon}
                        </div>
                        <button className="p-2 text-zinc-300 hover:text-zinc-600 transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                      <h4 className="font-black text-zinc-900 mb-1 truncate">{record.display_name}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-4">ID: #{record.id}</p>
                      
                      <div className="space-y-2 mb-6">
                        {Object.entries(record).slice(0, 3).map(([key, value]) => {
                          if (key === 'id' || key === 'display_name') return null;
                          return (
                            <div key={key} className="flex justify-between text-[10px]">
                              <span className="text-zinc-400 font-medium capitalize">{key.replace('_', ' ')}</span>
                              <span className="text-zinc-600 font-bold truncate max-w-[120px]">
                                {typeof value === 'object' ? value[1] || 'N/A' : String(value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <button className="w-full py-2 bg-zinc-50 text-zinc-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2">
                        View Details <ExternalLink size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-zinc-500">Odoo XML-RPC Connected</span>
          </div>
          <span className="text-[10px] font-bold text-zinc-400">Showing {records.length} records</span>
        </div>
      </main>

      {/* Status Toasts */}
      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50",
              status.type === 'success' ? "bg-emerald-900 text-white" : "bg-red-900 text-white"
            )}
          >
            {status.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertCircle size={20} className="text-red-400" />}
            <span className="text-sm font-bold">{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

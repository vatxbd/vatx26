import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Database, 
  Search, 
  RefreshCw, 
  FileText, 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Filter,
  Download,
  ExternalLink,
  Zap,
  ShieldCheck,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ERPNextDoc {
  name: string;
  customer?: string;
  supplier?: string;
  posting_date: string;
  grand_total: number;
  currency: string;
  status: string;
  [key: string]: any;
}

const DOCTYPES = [
  { id: 'Sales Invoice', name: 'Sales Invoices', icon: <FileText size={18} /> },
  { id: 'Purchase Invoice', name: 'Purchase Invoices', icon: <Download size={18} /> },
  { id: 'Sales Order', name: 'Sales Orders', icon: <Zap size={18} /> },
];

export default function ERPNextIntegration() {
  const [activeDoctype, setActiveDoctype] = useState(DOCTYPES[0].id);
  const [records, setRecords] = useState<ERPNextDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [automationStatus, setAutomationStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  useEffect(() => {
    fetchRecords();
  }, [activeDoctype]);

  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/erpnext/list?doctype=${activeDoctype}&fields=${encodeURIComponent('["*"]')}`);
      const data = await res.json();
      if (data.success && data.data) {
        setRecords(data.data);
      } else {
        setError(data.error || 'Failed to fetch ERPNext records');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateVAT = (amount: number) => {
    // Standard Bangladesh VAT is 15%
    return amount * 0.15;
  };

  const calculateAIT = (amount: number) => {
    // Advance Income Tax (AIT) - example 5%
    return amount * 0.05;
  };

  const runAutomation = async () => {
    if (selectedRecords.length === 0) return;
    setAutomationStatus('running');
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAutomationStatus('completed');
    setTimeout(() => setAutomationStatus('idle'), 3000);
  };

  const toggleSelect = (name: string) => {
    setSelectedRecords(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const selectAll = () => {
    if (selectedRecords.length === records.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(records.map(r => r.name));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[32px] border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Cpu size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">ERPNext Automation</h2>
            <p className="text-sm text-zinc-500 font-medium">Automated VAT & Tax Calculation Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Secure Sync Active</span>
          </div>
          <button 
            onClick={fetchRecords}
            className="p-3 bg-zinc-50 text-zinc-600 rounded-xl hover:bg-zinc-100 transition-all"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <a 
            href="https://github.com/vatxbd/erpnext" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2"
          >
            <ExternalLink size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Source</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Document Types</h3>
            <div className="space-y-2">
              {DOCTYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveDoctype(type.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                    activeDoctype === type.id 
                      ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" 
                      : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                  )}
                >
                  {type.icon}
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 p-8 rounded-[32px] text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Calculator size={20} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Automation Engine</span>
              </div>
              <h4 className="text-xl font-black mb-2">Run VAT/Tax Audit</h4>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-6">
                Automatically calculate VAT (15%) and AIT (5%) for selected ERPNext records and generate compliance reports.
              </p>
              <button 
                onClick={runAutomation}
                disabled={selectedRecords.length === 0 || automationStatus === 'running'}
                className={cn(
                  "w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  selectedRecords.length > 0 
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/40" 
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                )}
              >
                {automationStatus === 'running' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : automationStatus === 'completed' ? (
                  <>
                    <CheckCircle2 size={16} />
                    Done
                  </>
                ) : (
                  <>
                    Start Automation ({selectedRecords.length})
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Database size={16} className="text-zinc-400" />
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Open Source</h3>
            </div>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-4">
              This integration is built on the open-source ERPNext framework. You can audit the source code and contribute to the VAT/Tax calculation engine on GitHub.
            </p>
            <a 
              href="https://github.com/vatxbd/erpnext" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-all group"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">View Repository</span>
              <ExternalLink size={14} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
            </a>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="lg:col-span-3 bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
            <div className="flex items-center gap-4">
              <button 
                onClick={selectAll}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                {selectedRecords.length === records.length ? 'Deselect All' : 'Select All'}
              </button>
              <div className="h-4 w-px bg-zinc-200" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                {records.length} Records Found
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter records..."
                  className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-4 focus:ring-blue-500/10 outline-none transition-all w-48"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 flex flex-col items-center justify-center gap-4"
                >
                  <Loader2 size={40} className="text-blue-600 animate-spin" />
                  <p className="text-sm font-bold text-zinc-400">Fetching from ERPNext...</p>
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 flex flex-col items-center justify-center gap-4 text-center"
                >
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                    <AlertCircle size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-zinc-900">Integration Error</p>
                    <p className="text-sm text-zinc-500">{error}</p>
                  </div>
                </motion.div>
              ) : records.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 flex flex-col items-center justify-center gap-4 text-center"
                >
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300">
                    <Database size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-zinc-900">No Data Available</p>
                    <p className="text-sm text-zinc-500">No {activeDoctype} records found in ERPNext</p>
                  </div>
                </motion.div>
              ) : (
                <motion.table 
                  key="table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full text-left border-collapse"
                >
                  <thead>
                    <tr className="bg-zinc-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100">Select</th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100">Document</th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-right">Total</th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-right">VAT (15%)</th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-right">AIT (5%)</th>
                      <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr 
                        key={record.name}
                        className={cn(
                          "group hover:bg-zinc-50/50 transition-colors",
                          selectedRecords.includes(record.name) && "bg-blue-50/30"
                        )}
                      >
                        <td className="px-6 py-4 border-b border-zinc-50">
                          <button 
                            onClick={() => toggleSelect(record.name)}
                            className={cn(
                              "w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center",
                              selectedRecords.includes(record.name) 
                                ? "bg-blue-600 border-blue-600 text-white" 
                                : "border-zinc-200 hover:border-blue-400"
                            )}
                          >
                            {selectedRecords.includes(record.name) && <CheckCircle2 size={12} />}
                          </button>
                        </td>
                        <td className="px-6 py-4 border-b border-zinc-50">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-zinc-900">{record.name}</span>
                            <span className="text-[10px] font-bold text-zinc-400 truncate max-w-[150px]">
                              {record.customer || record.supplier || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-b border-zinc-50 text-xs font-bold text-zinc-500">
                          {record.posting_date}
                        </td>
                        <td className="px-6 py-4 border-b border-zinc-50 text-right text-sm font-black text-zinc-900">
                          {record.currency} {record.grand_total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 border-b border-zinc-50 text-right text-sm font-bold text-blue-600">
                          {record.currency} {calculateVAT(record.grand_total).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 border-b border-zinc-50 text-right text-sm font-bold text-emerald-600">
                          {record.currency} {calculateAIT(record.grand_total).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 border-b border-zinc-50 text-center">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            record.status === 'Paid' || record.status === 'Submitted' 
                              ? "bg-emerald-50 text-emerald-600" 
                              : "bg-zinc-100 text-zinc-500"
                          )}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </motion.table>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

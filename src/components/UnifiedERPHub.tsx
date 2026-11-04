import React, { useState } from 'react';
import { 
  Database, 
  Cpu, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Globe, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Settings,
  Zap,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import OdooIntegration from './OdooIntegration';
import ERPNextIntegration from './ERPNextIntegration';
import OdooAccounting from './OdooAccounting';
import { Language } from '../translations';

interface UnifiedERPHubProps {
  language?: Language;
  defaultTab?: 'odoo-live' | 'erpnext' | 'odoo-guide';
}

export default function UnifiedERPHub({ language = 'en', defaultTab = 'odoo-live' }: UnifiedERPHubProps) {
  const [activeTab, setActiveTab] = useState<'odoo-live' | 'erpnext' | 'odoo-guide'>(defaultTab);
  const isBn = language === 'bn';

  return (
    <div className="space-y-8">
      {/* Flagship Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <ShieldCheck size={14} />
                ENTERPRISE ERP & ACCOUNTING CONNECTOR
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-emerald-400 font-bold">2-WAY STATUTORY SYNC</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              {isBn ? 'ইউনিফায়েড এন্টারপ্রাইজ ইআরপি হাব (Odoo ও ERPNext)' : 'Unified Enterprise ERP Hub (Odoo & ERPNext)'}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              {isBn
                ? 'ওডু (Odoo) এবং ইআরপিনেক্সট (ERPNext) থেকে সরাসরি সেলস ইনভয়েস, কাস্টমার লেজার ও পারচেজ ডেটা এনে মূসক ৯.১ এবং আয়কর রিটার্নে রিয়েল-টাইম রিকনসিলিয়েশন করুন।'
                : 'Directly synchronize sales invoices, vendor ledgers, and inventory between Odoo, ERPNext, and NBR Mushak 9.1 statutory returns.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              REST & Composio Active
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="relative z-10 pt-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('odoo-live')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'odoo-live'
                ? 'bg-amber-400 text-zinc-950 font-black shadow-lg shadow-amber-400/20'
                : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800'
            }`}
          >
            <Database size={16} />
            <span>{isBn ? 'ওডু লাইভ সিঙ্ক (Odoo Live)' : 'Odoo Live ERP Sync'}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-black/20 text-current font-mono">Live</span>
          </button>

          <button
            onClick={() => setActiveTab('erpnext')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'erpnext'
                ? 'bg-amber-400 text-zinc-950 font-black shadow-lg shadow-amber-400/20'
                : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800'
            }`}
          >
            <Cpu size={16} />
            <span>{isBn ? 'ইআরপিনেক্সট অটোমেশন (ERPNext)' : 'ERPNext Automation'}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-black/20 text-current font-mono">Live</span>
          </button>

          <button
            onClick={() => setActiveTab('odoo-guide')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'odoo-guide'
                ? 'bg-amber-400 text-zinc-950 font-black shadow-lg shadow-amber-400/20'
                : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800'
            }`}
          >
            <BookOpen size={16} />
            <span>{isBn ? 'ওডু বিডি ট্যাক্স সেটআপ গাইড' : 'Odoo BD Tax Setup Guide'}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-black/20 text-current font-mono">l10n_bd</span>
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'odoo-live' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                <span>Synchronizing models: <code className="text-amber-400 font-mono">account.move</code> (Invoices), <code className="text-amber-400 font-mono">res.partner</code> (Vendors/Clients), <code className="text-amber-400 font-mono">account.payment</code></span>
                <span className="text-[11px] font-bold text-emerald-400">Auto-mapped to Mushak 9.1</span>
              </div>
              <OdooIntegration />
            </div>
          )}

          {activeTab === 'erpnext' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                <span>Frappe DocTypes: <code className="text-amber-400 font-mono">Sales Invoice</code>, <code className="text-amber-400 font-mono">Purchase Invoice</code>, <code className="text-amber-400 font-mono">Sales Order</code></span>
                <span className="text-[11px] font-bold text-emerald-400">Batch TDS/VDS Verification Ready</span>
              </div>
              <ERPNextIntegration />
            </div>
          )}

          {activeTab === 'odoo-guide' && (
            <div className="space-y-4">
              <OdooAccounting language={language} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

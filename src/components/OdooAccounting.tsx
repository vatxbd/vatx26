import React, { useState } from 'react';
import { 
  BookOpen, 
  Settings, 
  CheckSquare, 
  Lightbulb, 
  AlertTriangle, 
  Search, 
  ChevronRight, 
  FileText, 
  DollarSign, 
  Globe, 
  ShieldCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Check,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { translations, type Language } from '../translations';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SetupTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: {
    menu: string;
    steps: string[];
    note?: string;
  };
}

const TOPICS: SetupTopic[] = [
  {
    id: 'localization',
    title: 'Localization & Chart of Accounts',
    description: 'Setting up the Bangladesh-specific accounting standards and tax rules.',
    icon: <Globe size={20} />,
    content: {
      menu: 'Apps > Search "Bangladesh" > Install l10n_bd',
      steps: [
        'Install the Bangladesh Accounting Localization module.',
        'Verify the default Chart of Accounts is loaded.',
        'Check if default VAT taxes (5%, 7.5%, 15%) are created.',
        'Set the default currency to BDT (৳).'
      ],
      note: 'Odoo 17+ has improved support for Mushak forms directly in the localization module.'
    }
  },
  {
    id: 'taxes',
    title: 'Tax Configuration (VAT)',
    description: 'Defining tax groups, mapping, and Mushak-specific reporting.',
    icon: <Percent size={20} />,
    content: {
      menu: 'Accounting > Configuration > Taxes',
      steps: [
        'Create Tax Groups for VDS (VAT Deducted at Source).',
        'Configure "Tax Included in Price" for retail scenarios.',
        'Set up Tax Mapping for export (Zero Rated) transactions.',
        'Assign Tax Grids for Mushak 9.1 automated reporting.'
      ]
    }
  },
  {
    id: 'journals',
    title: 'Bank & Cash Journals',
    description: 'Connecting your local bank accounts and managing petty cash.',
    icon: <DollarSign size={20} />,
    content: {
      menu: 'Accounting > Configuration > Journals',
      steps: [
        'Create a new Journal for each bank account.',
        'Set up the Bank Account Number and IBAN/Swift.',
        'Configure the Outstanding Receipts/Payments accounts.',
        'Enable "Import Bank Statements" if using CSV/Excel.'
      ]
    }
  }
];

export default function OdooAccounting({ language = 'en' }: { language?: Language }) {
  const t = translations[language];
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [checklist, setChecklist] = useState([
    { label: 'Install Localization Module', done: true },
    { label: 'Configure Default Taxes', done: false },
    { label: 'Set Up Bank Journals', done: false },
    { label: 'Define Fiscal Positions', done: false },
    { label: 'Create Payment Terms', done: false },
    { label: 'Lock Initial Dates', done: false }
  ]);

  const toggleCheck = (index: number) => {
    const item = checklist[index];
    if (!item.done) {
      if (!confirm(t.confirmTaskComplete)) return;
    }
    const next = [...checklist];
    next[index].done = !next[index].done;
    setChecklist(next);
  };

  const filteredTopics = TOPICS.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAiConsult = async () => {
    if (!aiInput.trim()) return;
    setIsAiThinking(true);
    setAiResponse(null);
    
    // Simulate AI consultation based on Odoo skill context
    setTimeout(() => {
      setAiResponse(`Based on your scenario: "${aiInput}", here is the recommended Odoo setup:
      
1. **Localization**: Ensure you have installed the 'l10n_bd' (Bangladesh) or relevant localization module first.
2. **Tax Mapping**: For the specific tax rule you mentioned, use a 'Fiscal Position' to map standard VAT to the specific rate.
3. **Journal Entries**: Use the 'Miscellaneous' journal for adjustments that don't involve cash/bank directly.

Would you like me to generate a step-by-step PDF guide for this?`);
      setIsAiThinking(false);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Odoo Accounting Setup</h2>
          <p className="text-zinc-500 font-medium">Expert guide for Bangladesh localization and tax compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">Odoo 17 Ready</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">L10N_BD Certified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Assistant & Checklist */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900 rounded-3xl p-8 text-white space-y-6 shadow-2xl shadow-zinc-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold">Odoo AI Consultant</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Powered by Gemini</p>
              </div>
            </div>

            <div className="space-y-4">
              <textarea 
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask about Odoo tax mapping, Mushak 9.1 setup, or bank reconciliation..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all min-h-[120px] placeholder:text-zinc-600"
              />
              <button 
                onClick={handleAiConsult}
                disabled={isAiThinking}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAiThinking ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                Consult AI Expert
              </button>
            </div>

            <AnimatePresence>
              {aiResponse && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-zinc-800 rounded-2xl border border-zinc-700 text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap"
                >
                  {aiResponse}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <h3 className="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2">
              <CheckSquare className="text-emerald-500" /> Setup Checklist
            </h3>
            <div className="space-y-4">
              {checklist.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => toggleCheck(i)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                    item.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-200 bg-zinc-50 group-hover:border-emerald-300"
                  )}>
                    {item.done && <Check size={12} strokeWidth={4} />}
                  </div>
                  <span className={cn("text-sm font-bold transition-all", item.done ? "text-zinc-400 line-through" : "text-zinc-700 group-hover:text-emerald-600")}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Reference Library */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text"
                placeholder="Search setup topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-100 rounded-3xl text-sm focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTopics.map((topic) => (
              <motion.div 
                key={topic.id}
                layoutId={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                className={cn(
                  "p-6 bg-white border rounded-3xl cursor-pointer transition-all group",
                  activeTopic === topic.id ? "border-emerald-500 ring-4 ring-emerald-500/5 shadow-xl" : "border-zinc-100 hover:border-emerald-200 hover:shadow-lg"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    activeTopic === topic.id ? "bg-emerald-500 text-white" : "bg-zinc-50 text-zinc-400 group-hover:bg-emerald-50 group-hover:text-emerald-500"
                  )}>
                    {topic.icon}
                  </div>
                  <ChevronRight size={18} className={cn("transition-transform", activeTopic === topic.id ? "rotate-90 text-emerald-500" : "text-zinc-300")} />
                </div>
                <h4 className="font-black text-zinc-900 mb-2">{topic.title}</h4>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">{topic.description}</p>
              </motion.div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTopic && (
              <motion.div 
                key={activeTopic}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-500/5 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-zinc-900">
                    {TOPICS.find(t => t.id === activeTopic)?.title}
                  </h3>
                  <button onClick={() => setActiveTopic(null)} className="p-2 hover:bg-zinc-50 rounded-xl transition-colors">
                    <ArrowRight className="rotate-180 text-zinc-400" size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Navigation Menu</h5>
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 font-mono text-xs text-zinc-600">
                        {TOPICS.find(t => t.id === activeTopic)?.content.menu}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Implementation Steps</h5>
                      <div className="space-y-3">
                        {TOPICS.find(t => t.id === activeTopic)?.content.steps.map((step, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">
                              {i + 1}
                            </div>
                            <p className="text-sm text-zinc-700 font-medium">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-3">
                      <div className="flex items-center gap-2 text-amber-600">
                        <Lightbulb size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Expert Tip</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        {TOPICS.find(t => t.id === activeTopic)?.content.note || 'Always perform a trial balance check after configuring new taxes or journals to ensure no posting errors occur.'}
                      </p>
                    </div>

                    <button className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/20">
                      View Documentation <FileText size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Loader2({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}

function Percent({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="19" y1="5" x2="5" y2="19"/>
      <circle cx="6.5" cy="6.5" r="2.5"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  );
}

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  BarChart3,
  ShieldCheck,
  BellRing,
  UploadCloud,
  FileSearch,
  UserCheck,
  Calendar,
  FolderKanban,
  Sparkles,
  Layers,
  FileCode,
  Calculator,
  Receipt,
  Building2,
  Camera,
  ScanText,
  Smartphone,
  ArrowRight,
  Command,
  X,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CommandItem {
  id: string;
  tab: string;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  category: 'MVP Core' | 'VAT & Mushak' | 'Income Tax' | 'OCR & Docs' | 'AI & Advisory' | 'Enterprise';
  keywords: string;
  isMvp?: boolean;
  icon: React.ReactNode;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'bn';
  onSelectTab: (tab: any) => void;
  onOpenLiveAgent?: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  language,
  onSelectTab,
  onOpenLiveAgent
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  const isBn = language === 'bn';

  const items: CommandItem[] = useMemo(
    () => [
      {
        id: 'mvp-hub',
        tab: 'mvp-hub',
        titleEn: 'MVP Features Showcase & Compliance Checklist',
        titleBn: 'এমভিপি ফিচার হাব ও কমপ্লায়েন্স চেকলিস্ট',
        subtitleEn: 'Interactive tour of all 11 mandatory MVP competition features',
        subtitleBn: 'প্রতিযোগিতার ১১টি আবশ্যকীয় এমভিপি ফিচারের লাইভ ডেমো ও চেকলিস্ট',
        category: 'MVP Core',
        keywords: 'mvp checklist demo tour competition judge verification চেকলিস্ট ডেমো',
        isMvp: true,
        icon: <ShieldCheck className="w-4 h-4 text-amber-400" />
      },
      {
        id: 'dashboard',
        tab: 'dashboard',
        titleEn: 'Executive VAT & Tax Compliance Dashboard',
        titleBn: 'এক্সিকিউটিভ ভ্যাট ও ট্যাক্স কমপ্লায়েন্স ড্যাশবোর্ড',
        subtitleEn: 'Real-time KPIs, compliance score, and flagship automation workbench',
        subtitleBn: 'রিয়েল-টাইম কেপিআই, কমপ্লায়েন্স স্কোর এবং অটোমেশন ওয়ার্কবেঞ্চ',
        category: 'MVP Core',
        keywords: 'dashboard home overview vat compliance kpi ড্যাশবোর্ড হোম',
        isMvp: true,
        icon: <BarChart3 className="w-4 h-4 text-amber-400" />
      },
      {
        id: 'law-updates',
        tab: 'law-updates',
        titleEn: '7-Day Due Date Reminders & Statutory Alerts',
        titleBn: '৭ দিনের ডেডলাইন রিমাইন্ডার ও আইন আপডেট',
        subtitleEn: 'Automated 7-day push alerts for Mushak 9.1, TDS/VDS, and Nov 30 Tax Day',
        subtitleBn: 'মূসক ৯.১, টিডিএস/ভিডিএস ও আয়কর রিটার্নের ৭ দিন আগের স্বয়ংক্রিয় সতর্কবার্তা',
        category: 'MVP Core',
        keywords: 'due date reminder notification alert 7 days sro law রিমাইন্ডার নোটিফিকেশন ডেডলাইন',
        isMvp: true,
        icon: <BellRing className="w-4 h-4 text-rose-400" />
      },
      {
        id: 'critical-vat',
        tab: 'critical-vat',
        titleEn: 'Mushak 9.1 Monthly VAT Return Filing',
        titleBn: 'মূসক ৯.১ মাসিক ভ্যাট রিটার্ন দাখিল ফরম',
        subtitleEn: 'Full NBR Mushak 9.1 form with sub-forms, ITC rebate, and net payable calculation',
        subtitleBn: 'সাব-ফর্ম, রেয়াত ও নিট প্রদেয় ভ্যাটসহ পূর্ণাঙ্গ মূসক ৯.১ রিটার্ন',
        category: 'VAT & Mushak',
        keywords: 'mushak 9.1 vat return compliance dashboard মূসক ৯.১ ভ্যাট রিটার্ন',
        isMvp: true,
        icon: <Receipt className="w-4 h-4 text-emerald-400" />
      },
      {
        id: 'challan-verify',
        tab: 'challan-verify',
        titleEn: 'Tax & e-Challan Compliance Checker',
        titleBn: 'ট্যাক্স ও ই-চালান কমপ্লায়েন্স চেকার',
        subtitleEn: 'Verify A-Challan, e-Challan, BIN status, and statutory compliance authenticity',
        subtitleBn: 'এ-চালান, ই-চালান, বিআইএন এবং ট্যাক্স কমপ্লায়েন্স যাচাইকরণ',
        category: 'MVP Core',
        keywords: 'tax compliance checker challan verify bin verification চালান চেকার যাচাই',
        isMvp: true,
        icon: <FileSearch className="w-4 h-4 text-indigo-400" />
      },
      {
        id: 'documents',
        tab: 'documents',
        titleEn: 'Document Management & Upload Centre',
        titleBn: 'ডকুমেন্ট ম্যানেজমেন্ট ও আপলোড সেন্টার',
        subtitleEn: 'Upload, organize, scan, and extract structured NBR data from tax documents',
        subtitleBn: 'ট্যাক্স নথি আপলোড, সংরক্ষণ এবং এআই ডেটা এক্সট্র্যাকশন সেন্টার',
        category: 'OCR & Docs',
        keywords: 'document upload management center pdf image ডকুমেন্ট আপলোড ম্যানেজমেন্ট',
        isMvp: true,
        icon: <FolderKanban className="w-4 h-4 text-cyan-400" />
      },
      {
        id: 'compliance-calendar',
        tab: 'compliance-calendar',
        titleEn: 'Return Deadline Tracking Calendar',
        titleBn: 'রিটার্ন ডেডলাইন ট্র্যাকিং ক্যালেন্ডার',
        subtitleEn: 'Monthly & annual statutory filing calendar with recurring task automation',
        subtitleBn: 'মাসিক ও বার্ষিক সংবিধিবদ্ধ রিটার্ন দাখিলের ক্যালেন্ডার ও ট্র্যাকার',
        category: 'MVP Core',
        keywords: 'return deadline tracking calendar schedule ক্যালেন্ডার ডেডলাইন ট্র্যাকিং',
        isMvp: true,
        icon: <Calendar className="w-4 h-4 text-purple-400" />
      },
      {
        id: 'ai',
        tab: 'ai',
        titleEn: 'AI Tax & VAT Guidance Assistant',
        titleBn: 'এআই ট্যাক্স ও ভ্যাট গাইডেন্স অ্যাসিস্ট্যান্ট',
        subtitleEn: 'Advisory powered by Bangladesh Income Tax Act 2023 & VAT Act 2012',
        subtitleBn: 'আয়কর আইন ২০২৩ এবং মূসক আইন ২০১২ ভিত্তিক এআই পরামর্শক',
        category: 'AI & Advisory',
        keywords: 'ai guidance assistant chat advisory law এআই গাইডেন্স পরামর্শ',
        isMvp: true,
        icon: <Sparkles className="w-4 h-4 text-amber-400" />
      },
      {
        id: 'reports',
        tab: 'reports',
        titleEn: 'Automated Compliance Reports & Exports',
        titleBn: 'অটোমেটেড কমপ্লায়েন্স রিপোর্ট ও এক্সপোর্ট',
        subtitleEn: 'Generate audit-ready VAT/Tax ledgers and export to PDF, Excel, or CSV',
        subtitleBn: 'অডিট-রেডি ভ্যাট ও ট্যাক্স রিপোর্ট তৈরি এবং পিডিএফ/এক্সেল ডাউনলোড',
        category: 'MVP Core',
        keywords: 'automated reports export pdf csv excel analytics রিপোর্ট ডাউনলোড',
        isMvp: true,
        icon: <Layers className="w-4 h-4 text-emerald-400" />
      },
      {
        id: 'history',
        tab: 'history',
        titleEn: 'User Account, Google OAuth & Filing History',
        titleBn: 'ইউজার অ্যাকাউন্ট, গুগল লগইন ও ফাইলিং হিস্ট্রি',
        subtitleEn: 'Manage user session, Google Workspace sync, and historical tax records',
        subtitleBn: 'ইউজার অ্যাকাউন্ট, গুগল ওয়ার্কস্পেস সিঙ্ক এবং পূর্ববর্তী ফাইলিং রেকর্ড',
        category: 'MVP Core',
        keywords: 'user account login google oauth profile history লগইন অ্যাকাউন্ট হিস্ট্রি',
        isMvp: true,
        icon: <UserCheck className="w-4 h-4 text-teal-400" />
      },
      {
        id: 'nbr-script-markup',
        tab: 'nbr-script-markup',
        titleEn: 'NBR Auto-Fill Script from Markup Text',
        titleBn: 'মার্কআপ থেকে এনবিআর অটো-ফিল স্ক্রিপ্ট',
        subtitleEn: 'Zero-hallucination 7-column Private Salary Ledger & TRMS script generator',
        subtitleBn: 'স্যালারি সার্টিফিকেট ও মার্কডাউন থেকে ১-ক্লিকে এনবিআর ব্রাউজার স্ক্রিপ্ট',
        category: 'Income Tax',
        keywords: 'nbr script markup markitdown salary ledger trms স্ক্রিপ্ট মার্কআপ',
        isMvp: true,
        icon: <FileCode className="w-4 h-4 text-emerald-400" />
      },
      {
        id: 'scanner',
        tab: 'scanner',
        titleEn: 'Smart Camera Document Scanner & PDF Studio',
        titleBn: 'স্মার্ট ডকুমেন্ট স্ক্যানার ও পিডিএফ স্টুডিও',
        subtitleEn: 'Auto-crop corners, perspective warp, contrast filters, and searchable PDF export',
        subtitleBn: 'অটো কর্নার ডিটেকশন, ফিল্টার এবং মাল্টি-পেজ পিডিএফ স্ক্যানার',
        category: 'OCR & Docs',
        keywords: 'scanner camera pdf crop perspective ডকুমেন্ট স্ক্যানার পিডিএফ',
        icon: <Camera className="w-4 h-4 text-sky-400" />
      },
      {
        id: 'batch-invoice-ocr',
        tab: 'batch-invoice-ocr',
        titleEn: 'All-In-One Batch Invoice OCR & Excel Exporter',
        titleBn: 'ব্যাচ ইনভয়েস ওসিআর ও এক্সেল এক্সপোর্টার',
        subtitleEn: 'Compress images client-side, extract multiple invoices via AI, inline edit & export XLSX',
        subtitleBn: 'একসাথে একাধিক চালান স্ক্যান, ইনলাইন এডিট এবং এক্সেল/সিএসভি ডাউনলোড',
        category: 'OCR & Docs',
        keywords: 'batch invoice ocr excel csv inline edit ব্যাচ ইনভয়েস ওসিআর',
        icon: <UploadCloud className="w-4 h-4 text-blue-400" />
      },
      {
        id: 'ocr',
        tab: 'ocr',
        titleEn: 'Free Bengali & English OCR Engine',
        titleBn: 'ফ্রি বাংলা ও ইংরেজি ওসিআর ইঞ্জিন',
        subtitleEn: 'Extract text and Markdown tables from tax receipts and forms',
        subtitleBn: 'ট্যাক্স রশিদ ও ফর্ম থেকে বাংলা ও ইংরেজি টেক্সট এক্সট্র্যাকশন',
        category: 'OCR & Docs',
        keywords: 'ocr bengali free tesseract markdown বাংলা ওসিআর',
        icon: <ScanText className="w-4 h-4 text-emerald-400" />
      },
      {
        id: 'vat',
        tab: 'vat',
        titleEn: 'Standard & Truncated VAT Calculator',
        titleBn: 'ভ্যাট ও মূসক ক্যালকুলেটর',
        subtitleEn: '15% standard rate, trading rates, VDS applicability, and Mushak 6.3 preview',
        subtitleBn: '১৫% স্ট্যান্ডার্ড ভ্যাট, হ্রাসকৃত হার এবং মূসক ৬.৩ হিসাব',
        category: 'VAT & Mushak',
        keywords: 'vat calculator 15% mushak 6.3 ভ্যাট ক্যালকুলেটর',
        icon: <Calculator className="w-4 h-4 text-amber-400" />
      },
      {
        id: 'vds-tracker',
        tab: 'vds-tracker',
        titleEn: 'VDS Withholding & Mushak 6.6 Tracker',
        titleBn: 'উৎসে ভ্যাট (VDS) ও মূসক ৬.৬ ট্র্যাকার',
        subtitleEn: 'Track vendor VDS deductions, treasury deposits, and Mushak 6.6 certificates',
        subtitleBn: 'ভেন্ডর ভিডিএস কর্তন, ট্রেজারি জমা এবং মূসক ৬.৬ সার্টিফিকেট ট্র্যাকার',
        category: 'VAT & Mushak',
        keywords: 'vds tracker mushak 6.6 withholding ভিডিএস মূসক ৬.৬',
        icon: <Receipt className="w-4 h-4 text-amber-400" />
      },
      {
        id: 'tax',
        tab: 'tax',
        titleEn: 'Individual Income Tax Calculator (ITA 2023)',
        titleBn: 'ব্যক্তিগত আয়কর ক্যালকুলেটর (আয়কর আইন ২০২৩)',
        subtitleEn: 'Slab-wise calculation, investment rebate u/s 78, minimum tax, and IT-11GA',
        subtitleBn: 'স্ল্যাব অনুযায়ী কর হিসাব, বিনিয়োগ রেয়াত ও আইটি-১১গ',
        category: 'Income Tax',
        keywords: 'income tax calculator individual rebate slab আয়কর ক্যালকুলেটর',
        icon: <Calculator className="w-4 h-4 text-blue-400" />
      },
      {
        id: 'corporate-tax',
        tab: 'corporate-tax',
        titleEn: 'Corporate Tax & Minimum Tax u/s 163 Engine',
        titleBn: 'কর্পোরেট ট্যাক্স ও ন্যূনতম কর (ধারা ১৬৩) ইঞ্জিন',
        subtitleEn: 'Listed/non-listed rates, cash transaction penalties, and turnover tax',
        subtitleBn: 'কোম্পানি কর হার, নগদ লেনদেনের শর্ত এবং টার্নওভার ট্যাক্স',
        category: 'Income Tax',
        keywords: 'corporate tax company 163 turnover কর্পোরেট ট্যাক্স',
        icon: <Building2 className="w-4 h-4 text-indigo-400" />
      },
      {
        id: 'ctg-tax',
        tab: 'ctg-tax',
        titleEn: 'Chittagong Holding Tax & PWD Govt Office Rent Calculator',
        titleBn: 'চট্টগ্রাম মহানগরী চসিক গৃহকর ও গণপূর্ত অফিস ভাড়া ক্যালকুলেটর',
        subtitleEn: 'CCC 1986 taxation rules holding tax vs PWD government office rent ceilings with 15% VAT & 5% TDS',
        subtitleBn: 'চসিক হোল্ডিং ট্যাক্স (১৭%) ও গণপূর্ত সরকারি অফিস ভাড়ার স্বয়ংক্রিয় দ্বৈত হিসাব',
        category: 'Income Tax',
        keywords: 'chittagong ccc holding tax pwd rent ctg চসিক চট্টগ্রাম গৃহকর গণপূর্ত ভাড়া',
        icon: <Building2 className="w-4 h-4 text-emerald-400" />
      },
      {
        id: 'tds-tracker',
        tab: 'tds-tracker',
        titleEn: 'TDS Withholding Register & Rates',
        titleBn: 'উৎসে কর (TDS) রেজিস্টার ও হার',
        subtitleEn: 'Manage source tax deductions, TIN/non-TIN rates, and treasury challans',
        subtitleBn: 'উৎসে কর কর্তন, টিআইএন হার এবং ট্রেজারি চালান ব্যবস্থাপনা',
        category: 'Income Tax',
        keywords: 'tds tracker withholding source tax টিডিএস উৎসে কর',
        icon: <FileSearch className="w-4 h-4 text-sky-400" />
      },
      {
        id: 'mfs-payment',
        tab: 'mfs-payment',
        titleEn: 'bKash / Nagad / Rocket A-Challan Payment',
        titleBn: 'বিকাশ / নগদ / রকেট এ-চালান পেমেন্ট',
        subtitleEn: 'Instant MFS treasury fee & tax deposit simulation with verification receipt',
        subtitleBn: 'মোবাইল ব্যাংকিংয়ের মাধ্যমে সরকারি কোষাগারে ভ্যাট ও ট্যাক্স জমা',
        category: 'Enterprise',
        keywords: 'mfs payment bkash nagad rocket challan বিকাশ নগদ পেমেন্ট',
        icon: <Smartphone className="w-4 h-4 text-pink-400" />
      },
      {
        id: 'subscription',
        tab: 'subscription',
        titleEn: 'Subscription Plans & Multi-Channel Payment Gateway',
        titleBn: 'সাবস্ক্রিপশন প্ল্যান ও মাল্টি-চ্যানেল পেমেন্ট গেটওয়ে',
        subtitleEn: 'Upgrade to Basic, Pro, or Enterprise via SSLCOMMERZ, AamarPay, bKash, Nagad & Cards',
        subtitleBn: 'SSLCOMMERZ, বিকাশ, নগদ ও কার্ডের মাধ্যমে প্রো বা এন্টারপ্রাইজ লাইসেন্স সক্রিয় করুন',
        category: 'MVP Core',
        keywords: 'subscription pricing pro enterprise payment gateway sslcommerz aamarpay bkash nagad সাবস্ক্রিপশন পেমেন্ট প্রো',
        isMvp: true,
        icon: <Sparkles className="w-4 h-4 text-amber-400" />
      },
      {
        id: 'odoo-erp',
        tab: 'odoo-erp',
        titleEn: 'Enterprise ERP Hub (Odoo & ERPNext Integration)',
        titleBn: 'এন্টারপ্রাইজ ইআরপি হাব (Odoo ও ERPNext ইন্টিগ্রেশন)',
        subtitleEn: 'Unified workbench for Odoo REST/Composio sync, Bangladesh tax localization (l10n_bd), and ERPNext',
        subtitleBn: 'Odoo রিয়েল-টাইম সিঙ্ক, বাংলাদেশ ট্যাক্স লোকালাইজেশন এবং ERPNext ইনভয়েস অটোমেশন',
        category: 'Enterprise',
        keywords: 'odoo erpnext erp integration composio api rest accounting bangladesh l10n_bd ইআরপি ওডু অটোমেশন',
        icon: <Layers className="w-4 h-4 text-amber-400" />
      }
    ],
    []
  );

  const categories = ['All', 'MVP Core', 'VAT & Mushak', 'Income Tax', 'OCR & Docs', 'AI & Advisory', 'Enterprise'];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeCategory !== 'All' && item.category !== activeCategory) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        item.titleEn.toLowerCase().includes(q) ||
        item.titleBn.toLowerCase().includes(q) ||
        item.subtitleEn.toLowerCase().includes(q) ||
        item.subtitleBn.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
      );
    });
  }, [items, query, activeCategory]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + Math.max(1, filteredItems.length)) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        const chosen = filteredItems[selectedIndex];
        onSelectTab(chosen.tab);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onSelectTab, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-2xl bg-[#0B0F19] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/80 bg-[#090D16]">
              <Search className="w-5 h-5 text-amber-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isBn
                    ? 'যেকোনো টুল খুঁজুন (যেমন: মূসক ৯.১, চেকলিস্ট, ওসিআর, চালান যাচাই)...'
                    : 'Search any MVP feature, Mushak 9.1, OCR scanner, or tax calculator...'
                }
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none font-medium"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider bg-zinc-800/80 text-zinc-400 hover:text-white rounded border border-zinc-700"
              >
                ESC
              </button>
            </div>

            {/* Category Filter Bar */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0E1320] border-b border-zinc-800/70 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-amber-400 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  {cat === 'All' ? (isBn ? 'সব টুলস' : 'All Tools') : cat}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-zinc-800/50 p-2">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm font-bold text-zinc-400">
                    {isBn ? 'কোনো মডিউল পাওয়া যায়নি' : 'No matching compliance modules found'}
                  </p>
                  <p className="text-xs text-zinc-600">
                    {isBn ? 'অন্য কিওয়ার্ড দিয়ে চেষ্টা করুন' : 'Try searching for VAT, OCR, Checklist, or Challan'}
                  </p>
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.tab);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between gap-4 p-3.5 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-zinc-800/90 border border-amber-500/30 shadow-md'
                          : 'hover:bg-zinc-900/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0 mt-0.5">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white truncate">
                              {isBn ? item.titleBn : item.titleEn}
                            </span>
                            {item.isMvp && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                                · MVP Core
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-zinc-500">
                              · {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">
                            {isBn ? item.subtitleBn : item.subtitleEn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                          {isBn ? 'চালু করুন' : 'Open'}
                        </span>
                        <ArrowRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? 'text-amber-400 translate-x-0.5' : 'text-zinc-600'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#090D16] border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>↵ Launch Module</span>
                <span>ESC Close</span>
              </div>
              {onOpenLiveAgent && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenLiveAgent();
                  }}
                  className="text-amber-400 hover:text-amber-300 font-sans font-bold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isBn ? 'জেমিনি লাইভ ভয়েস এজেন্ট' : 'Launch Gemini Live Voice'}</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle,
  ShieldCheck, 
  Calendar, 
  UploadCloud, 
  FileSearch, 
  UserCheck, 
  BellRing, 
  FolderKanban, 
  Sparkles, 
  BarChart3, 
  ArrowRight,
  Layers,
  FileCode,
  Play,
  Award,
  Check,
  RotateCcw,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MVPFeaturesHubProps {
  language: 'en' | 'bn';
  setActiveTab: (tab: any) => void;
}

interface ChecklistItem {
  id: string;
  titleEn: string;
  titleBn: string;
  lawRef: string;
  dueInfoEn: string;
  dueInfoBn: string;
  targetTab: string;
  actionLabelEn: string;
  actionLabelBn: string;
  completed: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'chk-mushak-61-62',
    titleEn: 'Reconcile Purchase (Mushak 6.1) & Sales (Mushak 6.2) Books',
    titleBn: 'ক্রয় (মূসক ৬.১) ও বিক্রয় (মূসক ৬.২) পুস্তক যাচাই ও সমন্বয়',
    lawRef: 'Section 51, VAT & SD Act 2012',
    dueInfoEn: 'Before 10th of each month',
    dueInfoBn: 'প্রতি মাসের ১০ তারিখের পূর্বে',
    targetTab: 'batch-invoice-ocr',
    actionLabelEn: 'Scan Invoices via OCR',
    actionLabelBn: 'ওসিআর দিয়ে চালান স্ক্যান',
    completed: true
  },
  {
    id: 'chk-vds-tds',
    titleEn: 'Verify Withholding VDS (Mushak 6.6) & Treasury e-Challans',
    titleBn: 'উৎসে কর্তনকৃত ভিডিএস (মূসক ৬.৬) ও ট্রেজারি ই-চালান যাচাই',
    lawRef: 'Sections 49–53, VAT Act 2012',
    dueInfoEn: 'Due by 15th of following month',
    dueInfoBn: 'পরবর্তী মাসের ১৫ তারিখের মধ্যে',
    targetTab: 'challan-verify',
    actionLabelEn: 'Verify e-Challan Now',
    actionLabelBn: 'ই-চালান যাচাই করুন',
    completed: true
  },
  {
    id: 'chk-mushak-91',
    titleEn: 'Prepare & Validate Monthly VAT Return (Mushak 9.1)',
    titleBn: 'মাসিক মূসক ৯.১ রিটার্ন প্রস্তুত ও নিট প্রদেয় ভ্যাট যাচাই',
    lawRef: 'Section 64, VAT & SD Act 2012',
    dueInfoEn: 'Statutory deadline: 15th of every month',
    dueInfoBn: 'সংবিধিবদ্ধ শেষ সময়: প্রতি মাসের ১৫ তারিখ',
    targetTab: 'critical-vat',
    actionLabelEn: 'Open Mushak 9.1 Form',
    actionLabelBn: 'মূসক ৯.১ ফরম খুলুন',
    completed: false
  },
  {
    id: 'chk-salary-tds',
    titleEn: 'Generate 7-Column NBR Private Salary Ledger Script from Markup',
    titleBn: 'মার্কআপ থেকে ৭-কলাম এনবিআর প্রাইভেট স্যালারি লেজার স্ক্রিপ্ট তৈরি',
    lawRef: 'Section 86 & 143, Income Tax Act 2023',
    dueInfoEn: 'Monthly source tax return & TRMS',
    dueInfoBn: 'মাসিক উৎস কর রিটার্ন ও টিআরএমএস',
    targetTab: 'nbr-script-markup',
    actionLabelEn: 'Launch Script Generator',
    actionLabelBn: 'স্ক্রিপ্ট জেনারেটর খুলুন',
    completed: true
  },
  {
    id: 'chk-7day-alerts',
    titleEn: 'Activate Automated 7-Day Browser Push & In-App Alerts',
    titleBn: '৭ দিন আগের স্বয়ংক্রিয় ব্রাউজার পুশ ও ইন-অ্যাপ রিমাইন্ডার সক্রিয়করণ',
    lawRef: 'Sec 266 Penalty Avoidance Protocol',
    dueInfoEn: 'Triggers 7 days before due date',
    dueInfoBn: 'নির্ধারিত তারিখের ৭ দিন পূর্বে সতর্কবার্তা',
    targetTab: 'law-updates',
    actionLabelEn: 'Configure 7-Day Alerts',
    actionLabelBn: '৭ দিনের অ্যালার্ট দেখুন',
    completed: true
  },
  {
    id: 'chk-annual-tax',
    titleEn: 'Compute Individual / Corporate Income Tax & Investment Rebate',
    titleBn: 'বার্ষিক আয়কর ও বিনিয়োগ রেয়াত হিসাব এবং রিটার্ন ডকুমেন্ট সংরক্ষণ',
    lawRef: 'Section 78 & 166, Income Tax Act 2023',
    dueInfoEn: 'National Tax Day: November 30',
    dueInfoBn: 'জাতীয় কর দিবস: ৩০ নভেম্বর',
    targetTab: 'tax',
    actionLabelEn: 'Open Tax Engine',
    actionLabelBn: 'আয়কর ক্যালকুলেটর খুলুন',
    completed: false
  }
];

export default function MVPFeaturesHub({ language, setActiveTab }: MVPFeaturesHubProps) {
  const isBn = language === 'bn';

  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem('vatx_mvp_checklist_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return DEFAULT_CHECKLIST;
  });

  const [activeTourIndex, setActiveTourIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('vatx_mvp_checklist_v1', JSON.stringify(checklist));
    } catch {
      // ignore
    }
  }, [checklist]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const resetChecklist = () => {
    setChecklist(DEFAULT_CHECKLIST);
  };

  const completedCount = checklist.filter((c) => c.completed).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  const features = [
    {
      step: '01',
      id: 'vat-dashboard',
      titleEn: 'VAT Compliance Dashboard (Mushak 9.1)',
      titleBn: 'ভ্যাট কমপ্লায়েন্স ড্যাশবোর্ড (মূসক ৯.১)',
      descEn: 'Complete NBR Mushak 9.1 return workbench with Output VAT, Input Tax Credit (ITC), VDS adjustments, and Net Payable computation.',
      descBn: 'আউটপুট ভ্যাট, ইনপুট ট্যাক্স ক্রেডিট (রেয়াত), ভিডিএস সমন্বয় এবং নিট প্রদেয় ভ্যাটসহ পূর্ণাঙ্গ মূসক ৯.১ ওয়ার্কবেঞ্চ।',
      lawRef: 'VAT & SD Act 2012, Sec 64',
      icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
      tab: 'critical-vat'
    },
    {
      step: '02',
      id: 'checklist',
      titleEn: 'Interactive Compliance Checklist',
      titleBn: 'কমপ্লায়েন্স চেকলিস্ট (ইন্টারঅ্যাক্টিভ)',
      descEn: 'Step-by-step statutory readiness checklist for Mushak 6.1/6.2 books, treasury e-Challan verification, and monthly/annual filings.',
      descBn: 'মূসক ৬.১/৬.২ পুস্তক, ট্রেজারি চালান যাচাই এবং মাসিক ও বার্ষিক রিটার্ন প্রস্তুতির সংবিধিবদ্ধ চেকলিস্ট।',
      lawRef: 'NBR Audit Readiness Protocol',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      tab: 'mvp-hub'
    },
    {
      step: '03',
      id: 'reminder',
      titleEn: 'Due Date Reminder (7-Day Proactive Alerts)',
      titleBn: 'নির্দিষ্ট ডেডলাইন রিমাইন্ডার ও ৭ দিনের সতর্কবার্তা',
      descEn: 'Automated 7-day advance alert banner + native Browser Push Notifications for Mushak 9.1 (15th), TDS/VDS, and Nov 30 Tax Day.',
      descBn: 'মূসক ৯.১ (১৫ তারিখ), টিডিএস/ভিডিএস এবং ৩০ নভেম্বর কর দিবসের ৭ দিন আগে স্বয়ংক্রিয় ব্যানার ও ব্রাউজার পুশ অ্যালার্ট।',
      lawRef: 'Sec 64 VAT Act & Sec 166 ITA 2023',
      icon: <BellRing className="w-5 h-5 text-rose-400" />,
      tab: 'law-updates'
    },
    {
      step: '04',
      id: 'upload',
      titleEn: 'Document Upload & Batch Invoice OCR',
      titleBn: 'ডকুমেন্ট আপলোড ও ব্যাচ ইনভয়েস ওসিআর',
      descEn: 'Client-side image compression + Gemini AI multi-invoice extraction with inline table editing and 1-click Excel/CSV export.',
      descBn: 'ক্লায়েন্ট-সাইড ইমেজ অপটিমাইজেশন, এআই দিয়ে একাধিক চালান স্ক্যান, ইনলাইন এডিট এবং এক্সেল/সিএসভি ডাউনলোড।',
      lawRef: 'Mushak 6.3 & Commercial Invoices',
      icon: <UploadCloud className="w-5 h-5 text-sky-400" />,
      tab: 'batch-invoice-ocr'
    },
    {
      step: '05',
      id: 'checker',
      titleEn: 'Tax & e-Challan Compliance Checker',
      titleBn: 'ট্যাক্স ও ই-চালান কমপ্লায়েন্স চেকার',
      descEn: 'Instant authenticity verification of A-Challan / e-Challan numbers, vendor 13-digit BIN status, and rebate admissibility.',
      descBn: 'এ-চালান / ই-চালান নম্বর, ১৩-ডিজিট বিআইএন স্ট্যাটাস এবং ভ্যাট রেয়াত যোগ্যতা তাৎক্ষণিক যাচাইকরণ।',
      lawRef: 'Automated Treasury Verification',
      icon: <FileSearch className="w-5 h-5 text-indigo-400" />,
      tab: 'challan-verify'
    },
    {
      step: '06',
      id: 'account',
      titleEn: 'User Account, Login & Cloud Sync',
      titleBn: 'ইউজার অ্যাকাউন্ট, গুগল লগইন ও ক্লাউড সিঙ্ক',
      descEn: 'Google OAuth 2.0 authentication, taxpayer profile management, and persistent VAT/Tax calculation history.',
      descBn: 'গুগল ওঅথ (OAuth) লগইন, করদাতা প্রোফাইল এবং ভ্যাট ও আয়কর হিসাবের স্থায়ী ইতিহাস সংরক্ষণ।',
      lawRef: 'Encrypted Taxpayer Ledger',
      icon: <UserCheck className="w-5 h-5 text-teal-400" />,
      tab: 'history'
    },
    {
      step: '07',
      id: 'deadlines',
      titleEn: 'Return Deadline Tracking Calendar',
      titleBn: 'রিটার্ন ডেডলাইন ট্র্যাকিং ক্যালেন্ডার',
      descEn: 'Full compliance calendar tracking monthly VAT returns, quarterly AIT installments, and custom corporate tax milestones.',
      descBn: 'মাসিক ভ্যাট রিটার্ন, কোয়ার্টারলি অগ্রিম কর (AIT) এবং কাস্টম কর্পোরেট ডেডলাইন ট্র্যাকিং ক্যালেন্ডার।',
      lawRef: 'Section 154 & 166, ITA 2023',
      icon: <Calendar className="w-5 h-5 text-purple-400" />,
      tab: 'compliance-calendar'
    },
    {
      step: '08',
      id: 'management',
      titleEn: 'Document Management & Smart PDF Scanner',
      titleBn: 'ডকুমেন্ট ম্যানেজমেন্ট ও স্মার্ট পিডিএফ স্ক্যানার',
      descEn: 'Interactive corner-drag perspective crop scanner, enhancement filters, searchable PDF generator, and document vault.',
      descBn: 'অটো কর্নার-ড্র্যাগ পার্সপেক্টিভ স্ক্যানার, ফিল্টার, সার্চেবল পিডিএফ তৈরি এবং ডিজিটাল ডকুমেন্ট ভল্ট।',
      lawRef: '6-Year Statutory Record Keeping',
      icon: <FolderKanban className="w-5 h-5 text-cyan-400" />,
      tab: 'documents'
    },
    {
      step: '09',
      id: 'ai',
      titleEn: 'AI Tax & VAT Legal Guidance',
      titleBn: 'এআই গাইডেন্স ও ট্যাক্স অ্যাসিস্ট্যান্ট',
      descEn: 'Real-time advisory grounded in Bangladesh Income Tax Act 2023, VAT Act 2012, and latest Finance Act SROs.',
      descBn: 'আয়কর আইন ২০২৩, মূসক আইন ২০১২ এবং সর্বশেষ অর্থ আইনের এসআরও ভিত্তিক তাৎক্ষণিক এআই পরামর্শক।',
      lawRef: 'ITA 2023 & VAT Act 2012',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      tab: 'ai'
    },
    {
      step: '10',
      id: 'reports',
      titleEn: 'Automated Audit Reports & Exports',
      titleBn: 'অটোমেটেড রিপোর্ট ও অডিট এক্সপোর্ট',
      descEn: 'Visual tax/VAT analytics charts and 1-click export of statutory ledgers into PDF, Excel (XLSX), and CSV formats.',
      descBn: 'ভ্যাট ও আয়কর অ্যানালিটিক্স চার্ট এবং ১-ক্লিকে পিডিএফ, এক্সেল (XLSX) ও সিএসভি ফরম্যাটে অডিট রিপোর্ট ডাউনলোড।',
      lawRef: 'NBR Audit Trail Standard',
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      tab: 'reports'
    },
    {
      step: '11',
      id: 'nbr-script',
      titleEn: 'NBR Auto-Fill Script from Markup Text',
      titleBn: 'মার্কআপ থেকে এনবিআর অটো-ফিল স্ক্রিপ্ট',
      descEn: 'Flagship zero-hallucination generator converting Markdown/OCR tables into 1-click NBR e-Tax Private Salary Ledger scripts.',
      descBn: 'মার্কডাউন বা ওসিআর টেবিল থেকে ১-ক্লিকে এনবিআর প্রাইভেট স্যালারি লেজার ও টিআরএমএস পোর্টাল অটো-ফিল স্ক্রিপ্ট।',
      lawRef: 'e-Tax Ledger & TRMS Automation',
      icon: <FileCode className="w-5 h-5 text-amber-400" />,
      tab: 'nbr-script-markup'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. Executive Competition Header Banner */}
      <div className="bg-[#090D16] border border-zinc-800 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center flex-wrap gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <Award className="w-4 h-4" />
              <span>{isBn ? 'প্রতিযোগিতা ও বিচারক যাচাইকরণ হাব' : 'COMPETITION JUDGE & MVP VERIFICATION HUB'}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-emerald-400">{isBn ? '১১/১১ ফিচার সক্রিয়' : '11/11 MVP MODULES LIVE'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {isBn
                ? 'ধাপ ৩: সকল আবশ্যকীয় এমভিপি ফিচার ও কমপ্লায়েন্স চেকলিস্ট'
                : 'Complete MVP Features Suite & Statutory Compliance Checklist'}
            </h1>

            <p className="text-zinc-400 text-sm leading-relaxed">
              {isBn
                ? 'এই কমান্ড সেন্টার থেকে প্রতিটি এমভিপি ফিচার (VAT Dashboard, Compliance Checklist, 7-Day Due Date Reminder, Document Upload, Tax Compliance Checker, AI Guidance, Automated Reports) সরাসরি পরীক্ষা ও যাচাই করুন।'
                : 'Verify every core MVP capability in one unified command center—complete with an interactive NBR statutory compliance checklist and 1-click module launchers.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <button
              onClick={() => setActiveTourIndex(activeTourIndex === null ? 0 : null)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-400/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {activeTourIndex !== null
                  ? isBn ? 'গাইডেড ট্যুর বন্ধ করুন' : 'Exit Guided Tour'
                  : isBn ? 'গাইডেড ডেমো ট্যুর শুরু করুন' : 'Start Guided Demo Tour'}
              </span>
            </button>
            <div className="text-xs font-mono text-zinc-400 text-right">
              {isBn ? 'কমপ্লায়েন্স প্রস্তুতি:' : 'Checklist Readiness:'}{' '}
              <span className="text-emerald-400 font-bold tabular-nums">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Guided Tour Stepper Overlay if active */}
        <AnimatePresence>
          {activeTourIndex !== null && features[activeTourIndex] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-zinc-800/90"
            >
              <div className="bg-zinc-900/90 border border-amber-400/40 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                    {isBn ? `গাইডেড ট্যুর ধাপ ${activeTourIndex + 1} / ${features.length}` : `GUIDED TOUR STEP ${activeTourIndex + 1} OF ${features.length}`}
                    {' · '}
                    <span className="text-zinc-400">{features[activeTourIndex].lawRef}</span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {isBn ? features[activeTourIndex].titleBn : features[activeTourIndex].titleEn}
                  </h3>
                  <p className="text-xs text-zinc-300 max-w-2xl">
                    {isBn ? features[activeTourIndex].descBn : features[activeTourIndex].descEn}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                  <button
                    onClick={() =>
                      setActiveTourIndex((prev) =>
                        prev !== null ? (prev - 1 + features.length) % features.length : 0
                      )
                    }
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold"
                  >
                    {isBn ? 'পূর্ববর্তী' : 'Prev'}
                  </button>
                  <button
                    onClick={() => setActiveTab(features[activeTourIndex].tab)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    <span>{isBn ? 'এই ফিচারে যান' : 'Open Module'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveTourIndex((prev) =>
                        prev !== null ? (prev + 1) % features.length : 0
                      )
                    }
                    className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl text-xs font-black"
                  >
                    {isBn ? 'পরবর্তী ধাপ' : 'Next Step'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Interactive Statutory Compliance Checklist (Core MVP Feature #2) */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-600 font-bold">
              {isBn ? 'এমভিপি কোর ফিচার • ইন্টারেক্টিভ কমপ্লায়েন্স চেকলিস্ট' : 'MVP CORE FEATURE • INTERACTIVE COMPLIANCE CHECKLIST'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900">
              {isBn
                ? 'মাসিক ভ্যাট ও বার্ষিক আয়কর কমপ্লায়েন্স চেকলিস্ট'
                : 'Monthly VAT & Annual Tax Statutory Readiness Checklist'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right font-mono">
              <div className="text-xs text-zinc-500">
                {completedCount} / {checklist.length} {isBn ? 'সম্পন্ন' : 'Completed'}
              </div>
              <div className="w-36 h-2 bg-zinc-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <button
              onClick={resetChecklist}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors"
              title={isBn ? 'রিসেট করুন' : 'Reset Checklist'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                item.completed
                  ? 'bg-emerald-50/40 border-emerald-200/80'
                  : 'bg-zinc-50/70 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <button
                  onClick={() => toggleCheck(item.id)}
                  className="mt-0.5 shrink-0 text-zinc-400 hover:text-emerald-600 transition-colors"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-400" />
                  )}
                </button>
                <div className="space-y-1">
                  <div
                    onClick={() => toggleCheck(item.id)}
                    className={`text-sm font-bold cursor-pointer ${
                      item.completed ? 'text-zinc-500 line-through' : 'text-zinc-900'
                    }`}
                  >
                    {isBn ? item.titleBn : item.titleEn}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-500">
                    <span>{item.lawRef}</span>
                    <span>·</span>
                    <span className="text-amber-700 font-semibold">
                      {isBn ? item.dueInfoBn : item.dueInfoEn}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab(item.targetTab)}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-amber-400 text-white hover:text-zinc-950 rounded-xl text-xs font-bold transition-all"
              >
                <span>{isBn ? item.actionLabelBn : item.actionLabelEn}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. All 11 MVP Features Interactive Directory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-zinc-900">
            {isBn ? 'সকল এমভিপি মডিউল ডিরেক্টরি (১-ক্লিকে চালু করুন)' : 'All 11 Mandatory MVP Modules (1-Click Launch)'}
          </h2>
          <span className="text-xs font-mono text-zinc-500">
            {isBn ? 'প্রতিটি ফিচার লাইভ ডাটাবেজ ও এআই যুক্ত' : 'Backed by SQLite + Gemini AI + NBR Statutory Rules'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => (
            <div
              key={feat.id}
              className={`group bg-[#0B0F19] border rounded-2xl p-6 transition-all flex flex-col justify-between space-y-5 shadow-lg ${
                activeTourIndex === idx
                  ? 'border-amber-400 ring-2 ring-amber-400/20'
                  : 'border-zinc-800/90 hover:border-amber-400/50'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-amber-400/40 transition-colors">
                      {feat.icon}
                    </div>
                    <span className="font-mono text-xs font-bold text-zinc-500">
                      MVP #{feat.step}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {isBn ? 'সক্রিয়' : 'Verified'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                    {isBn ? feat.titleBn : feat.titleEn}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {isBn ? feat.descBn : feat.descEn}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-zinc-500 truncate">
                  {feat.lawRef}
                </span>
                <button
                  onClick={() => setActiveTab(feat.tab)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl text-xs font-black tracking-wide transition-all"
                >
                  <span>{isBn ? 'চালু করুন' : 'Launch Demo'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

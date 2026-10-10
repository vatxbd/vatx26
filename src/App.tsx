import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  Calendar,
  Receipt, 
  TrendingUp, 
  History, 
  FileText, 
  Settings, 
  ChevronRight, 
  Plus, 
  Download, 
  PieChart as PieChartIcon,
  BarChart3,
  Percent,
  DollarSign,
  Heart,
  Briefcase,
  Database,
  User,
  Building2,
  ArrowRight,
  ArrowRightLeft,
  ShieldCheck,
  ShieldAlert,
  Ship,
  Search,
  Shield,
  Smartphone,
  Book,
  Share2,
  Facebook,
  Linkedin,
  Music2,
  Twitter,
  Folder,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  Send,
  Bot,
  MessageSquare,
  Trash2,
  Printer,
  Copy,
  Save,
  Pencil,
  Layout,
  Info,
  ClipboardCheck,
  Truck,
  Anchor,
  UserPlus,
  Users,
  Bell,
  ExternalLink,
  Code,
  FileCode,
  Github,
  Lock,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Coins,
  Cpu,
  Fingerprint,
  Ticket,
  FileSearch,
  Zap,
  Image as ImageIcon,
  Camera,
  Upload,
  File,
  Loader2,
  Menu,
  Languages,
  Filter,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from './translations';
import { QRCodeSVG } from 'qrcode.react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import Mushak91Form from './components/Mushak91Form';
import DonationCentre from './components/DonationCentre';
import SocialIntegration from './components/SocialIntegration';
import BaseManager from './components/BaseManager';
import XScraper from './components/XScraper';
import WhatsAppAutomation from './components/WhatsAppAutomation';
import OdooAccounting from './components/OdooAccounting';
import DropboxManager from './components/DropboxManager';
import OdooIntegration from './components/OdooIntegration';
import ERPNextIntegration from './components/ERPNextIntegration';
import VatAgentPortal from './components/VatAgentPortal';
import NBRMarkupScriptHub from './components/NBRMarkupScriptHub';
import { NBRScriptModal } from './components/NBRScriptModal';
import { generatePrivateSalaryLedgerScript, generateTRMSScript, generateUniversalETaxScript, formatNBRDate } from './utils/nbrScriptGenerator';
import { parseRobustJson } from './utils/robustJsonParser';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Toggle({ label, checked, onChange, description, compact }: { 
  label: string, 
  checked: boolean, 
  onChange: (val: boolean) => void, 
  description?: string,
  compact?: boolean
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", !compact && "p-4 bg-zinc-50 rounded-2xl border border-zinc-100")}>
      <div className="space-y-0.5">
        <p className={cn("font-bold text-zinc-900", compact ? "text-xs" : "text-sm")}>{label}</p>
        {description && <p className="text-xs text-zinc-500">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
          checked ? "bg-brand-600" : "bg-zinc-200"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

function SectionGuide({ title, steps, language = 'bn' }: { title: string, steps: string[], language?: Language }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-black text-brand-600 uppercase tracking-widest hover:text-brand-700 transition-all"
      >
        <Bot size={16} /> {isOpen ? (language === 'bn' ? 'গাইড বন্ধ করুন' : 'Close Guide') : (language === 'bn' ? 'কিভাবে ব্যবহার করবেন? (গাইড)' : 'How to use? (Guide)')}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-6 bg-brand-50 rounded-3xl border border-brand-100 space-y-4">
              <h4 className="font-bold text-brand-900 flex items-center gap-2">
                <Sparkles size={18} /> {title}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-brand-800 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import LiveAgent from './components/LiveAgent';
import VDSTracker from './components/VDSTracker';
import ComplianceCalendar from './components/ComplianceCalendar';
import AgentMarketplace from './components/AgentMarketplace';
import ChallanVerification from './components/ChallanVerification';
import MFSPayment from './components/MFSPayment';
import TDSTracker from './components/TDSTracker';
import OCRFormAutomation from './components/OCRFormAutomation';
import OCRHistory from './components/OCRHistory';
import TRMSAssistant from './components/TRMSAssistant';
import CorporateTaxAssistant from './components/CorporateTaxAssistant';
import NotificationCenter from './components/NotificationCenter';

type Tab = 'dashboard' | 'nbr-script-markup' | 'vat' | 'tax' | 'tariff' | 'manifest' | 'reports' | 'blog' | 'tools' | 'ai' | 'invoice' | 'history' | 'notices' | 'rebate' | 'hscode' | 'subscription' | 'crypto-tax' | 'blockchain-verify' | 'tokenized-cert' | 'tax-advisory' | 'zakat' | 'final-tax' | 'developer' | 'documents' | 'critical-vat' | 'help' | 'social' | 'base' | 'x-scraper' | 'whatsapp' | 'odoo' | 'dropbox' | 'odoo-erp' | 'erpnext' | 'vat-agents' | 'live-agent' | 'donation' | 'vds-tracker' | 'tds-tracker' | 'compliance-calendar' | 'agent-marketplace' | 'challan-verify' | 'mfs-payment' | 'trms-extractor' | 'corporate-tax' | 'ocr-automation' | 'law-updates' | 'vat-ocr' | 'tax-ocr';

interface TaxNotice {
  id: number;
  title: string;
  link: string;
  category: string;
  createdAt: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];
  const [vatHistory, setVatHistory] = useState<any[]>([]);
  const [taxHistory, setTaxHistory] = useState<any[]>([]);
  const [notices, setNotices] = useState<TaxNotice[]>([]);
  const [showNoticesDropdown, setShowNoticesDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLiveAgent, setShowLiveAgent] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [prefilledInvoice, setPrefilledInvoice] = useState<any>(null);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);

  useEffect(() => {
    checkGoogleAuth();
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsGoogleAuthenticated(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkGoogleAuth = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsGoogleAuthenticated(data.isAuthenticated);
    } catch (e) {
      console.error("Auth check failed", e);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const res = await fetch('/auth/google/url');
      const { url } = await res.json();
      window.open(url, 'google_oauth', 'width=600,height=700');
    } catch (e) {
      console.error("Failed to get auth URL", e);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [isDeveloper, setIsDeveloper] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const next = prev + 1;
      if (next === 5) {
        setIsDeveloper(true);
        return 0;
      }
      return next;
    });
  };

  useEffect(() => {
    const handleChangeTab = (e: any) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('changeTab', handleChangeTab);
    return () => window.removeEventListener('changeTab', handleChangeTab);
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchNotices();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/notices');
      const data = await res.json();
      setNotices(data);
    } catch (err) {
      console.error('Failed to fetch notices', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const [vatRes, taxRes] = await Promise.all([
        fetch('/api/history/vat'),
        fetch('/api/history/tax')
      ]);
      const vatData = await vatRes.json();
      const taxData = await taxRes.json();
      setVatHistory(vatData);
      setTaxHistory(taxData);
      localStorage.setItem('vatHistory', JSON.stringify(vatData));
      localStorage.setItem('taxHistory', JSON.stringify(taxData));
    } catch (err) {
      console.error('Failed to fetch history', err);
      const cachedVat = localStorage.getItem('vatHistory');
      const cachedTax = localStorage.getItem('taxHistory');
      if (cachedVat) setVatHistory(JSON.parse(cachedVat));
      if (cachedTax) setTaxHistory(JSON.parse(cachedTax));
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-zinc-900 font-sans selection:bg-brand-100 selection:text-brand-900 pb-20 md:pb-0">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-zinc-100 z-[60] flex items-center justify-between px-6 md:hidden">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E6B93E] via-[#FFD700] to-[#B8860B] rounded-lg shadow-md" />
            <div className="relative w-4 h-4 flex items-center justify-center">
              <div className="absolute left-0 top-0 w-[45%] h-full bg-[#001D4A] rounded-full origin-bottom rotate-[-25deg] translate-x-0.5" />
              <div className="absolute right-0 top-0 w-[45%] h-full bg-[#00A8E8] rounded-full origin-bottom rotate-[25deg] -translate-x-0.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-0.5 font-display">
            <span className="text-lg font-black tracking-tighter text-[#001D4A]">VAT</span>
            <span className="text-lg font-black tracking-tighter text-[#00A8E8]">X</span>
            <span className="text-lg font-black tracking-tighter text-zinc-400">.BD</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNoticesDropdown(!showNoticesDropdown)}
            className="p-2 text-zinc-500 relative"
          >
            <Bell size={20} />
            {notices.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-zinc-900"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-[110] md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E6B93E] via-[#FFD700] to-[#B8860B] rounded-xl shadow-md" />
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      <div className="absolute left-0 top-0 w-[45%] h-full bg-[#001D4A] rounded-full origin-bottom rotate-[-25deg] translate-x-0.5" />
                      <div className="absolute right-0 top-0 w-[45%] h-full bg-[#00A8E8] rounded-full origin-bottom rotate-[25deg] -translate-x-0.5" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-0.5 font-display">
                    <span className="text-xl font-black tracking-tighter text-[#001D4A]">VAT</span>
                    <span className="text-xl font-black tracking-tighter text-[#00A8E8]">X</span>
                    <span className="text-xl font-black tracking-tighter text-zinc-400">.BD</span>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 pb-12 custom-scrollbar">
                <nav className="space-y-8">
                  {isDeveloper && (
                    <div>
                      <p className="px-4 text-[10px] font-black text-brand-600 uppercase tracking-widest mb-4">Developer Mode</p>
                      <div className="space-y-1">
                        <NavItem icon={<Cpu size={18} />} label="Control Panel" active={activeTab === 'developer'} onClick={() => { setActiveTab('developer'); setIsMobileMenuOpen(false); }} />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Overview</p>
                    <div className="space-y-1">
                      <NavItem icon={<BarChart3 size={18} />} label={t.dashboard} active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<FileCode size={18} className="text-emerald-500" />} label={t.nbrScriptMarkup || "NBR Script from Markup"} badge="Featured" active={activeTab === 'nbr-script-markup'} onClick={() => { setActiveTab('nbr-script-markup'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<FileSearch size={18} />} label={t.documents} badge="Smart" active={activeTab === 'documents'} onClick={() => { setActiveTab('documents'); setIsMobileMenuOpen(false); }} />
                    </div>
                  </div>

                  <div>
                    <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">AI Intelligence</p>
                    <div className="space-y-1">
                      <NavItem icon={<Sparkles size={18} />} label={t.ai} badge="AI" active={activeTab === 'ai'} onClick={() => { setActiveTab('ai'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Bot size={18} className="text-indigo-500" />} label="Gemini Live" badge="Live" active={showLiveAgent} onClick={() => { setShowLiveAgent(true); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Sparkles size={18} />} label={t.advisory} active={activeTab === 'tax-advisory'} onClick={() => { setActiveTab('tax-advisory'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Search size={18} />} label={t.hscode} active={activeTab === 'hscode'} onClick={() => { setActiveTab('hscode'); setIsMobileMenuOpen(false); }} />
                    </div>
                  </div>

                  <div>
                    <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">{t.vatHub}</p>
                    <div className="space-y-1">
                      <NavItem icon={<Receipt size={18} />} label={t.vat} active={activeTab === 'vat'} onClick={() => { setActiveTab('vat'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Calculator size={18} />} label={t.criticalVat} active={activeTab === 'critical-vat'} onClick={() => { setActiveTab('critical-vat'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<ClipboardCheck size={18} />} label="VDS Tracker" active={activeTab === 'vds-tracker'} onClick={() => { setActiveTab('vds-tracker'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<ShieldCheck size={18} />} label="Challan Verify" active={activeTab === 'challan-verify'} onClick={() => { setActiveTab('challan-verify'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Building2 size={18} />} label={t.vatAgents} active={activeTab === 'vat-agents'} onClick={() => { setActiveTab('vat-agents'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<FileSearch size={18} />} label={t.vatOcr} active={activeTab === 'vat-ocr'} onClick={() => { setActiveTab('vat-ocr'); setIsMobileMenuOpen(false); }} />
                    </div>
                  </div>

                  <div>
                    <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">{t.taxHub}</p>
                    <div className="space-y-1">
                      <NavItem icon={<Calculator size={18} />} label={t.tax} active={activeTab === 'tax'} onClick={() => { setActiveTab('tax'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Building2 size={18} />} label={t.corporateTax} badge="New" active={activeTab === 'corporate-tax'} onClick={() => { setActiveTab('corporate-tax'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<FileSearch size={18} />} label={t.trmsExtractor} active={activeTab === 'trms-extractor'} onClick={() => { setActiveTab('trms-extractor'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<FileSearch size={18} />} label={t.taxOcr} active={activeTab === 'tax-ocr'} onClick={() => { setActiveTab('tax-ocr'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Calculator size={18} />} label="TDS Tracker" active={activeTab === 'tds-tracker'} onClick={() => { setActiveTab('tds-tracker'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Shield size={18} />} label={t.finalTax} active={activeTab === 'final-tax'} onClick={() => { setActiveTab('final-tax'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<TrendingUp size={18} />} label={t.rebate} active={activeTab === 'rebate'} onClick={() => { setActiveTab('rebate'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Coins size={18} />} label={t.zakat} active={activeTab === 'zakat'} onClick={() => { setActiveTab('zakat'); setIsMobileMenuOpen(false); }} />
                    </div>
                  </div>

                  <div>
                    <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Compliance Suite</p>
                    <div className="space-y-1">
                      <NavItem icon={<Calendar size={18} />} label="Compliance Calendar" active={activeTab === 'compliance-calendar'} onClick={() => { setActiveTab('compliance-calendar'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Smartphone size={18} />} label={t['mfs-payment'] || "MFS Payment"} active={activeTab === 'mfs-payment'} onClick={() => { setActiveTab('mfs-payment'); setIsMobileMenuOpen(false); }} />
                    </div>
                  </div>

                  <div>
                    <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Business Suite</p>
                    <div className="space-y-1">
                      <NavItem icon={<Receipt size={18} />} label={t.invoice} active={activeTab === 'invoice'} onClick={() => { setActiveTab('invoice'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Settings size={18} />} label="Odoo Setup" active={activeTab === 'odoo'} onClick={() => { setActiveTab('odoo'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Database size={18} />} label="Odoo ERP Integration" active={activeTab === 'odoo-erp'} onClick={() => { setActiveTab('odoo-erp'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Cpu size={18} />} label="ERPNext Automation" active={activeTab === 'erpnext'} onClick={() => { setActiveTab('erpnext'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Folder size={18} />} label="Dropbox Cloud" active={activeTab === 'dropbox'} onClick={() => { setActiveTab('dropbox'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Database size={18} />} label={t.base} active={activeTab === 'base'} onClick={() => { setActiveTab('base'); setIsMobileMenuOpen(false); }} />
                    </div>
                  </div>

                  <div>
                    <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Marketplace & Community</p>
                    <div className="space-y-1">
                      <NavItem icon={<Bell size={18} className="text-amber-500" />} label={language === 'bn' ? 'আইন আপডেট' : 'Law Updates'} active={activeTab === 'law-updates'} onClick={() => { setActiveTab('law-updates'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Building2 size={18} />} label={t.vatAgents} active={activeTab === 'vat-agents'} onClick={() => { setActiveTab('vat-agents'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<FileText size={18} />} label={t.blog} active={activeTab === 'blog'} onClick={() => { setActiveTab('blog'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Bell size={18} />} label={t.notices} active={activeTab === 'notices'} onClick={() => { setActiveTab('notices'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Heart size={18} />} label="Donation Centre" active={activeTab === 'donation'} onClick={() => { setActiveTab('donation'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<MessageSquare size={18} />} label="WhatsApp Automation" active={activeTab === 'whatsapp'} onClick={() => { setActiveTab('whatsapp'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Share2 size={18} />} label={t.social} active={activeTab === 'social'} onClick={() => { setActiveTab('social'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Twitter size={18} />} label="X Intelligence" active={activeTab === 'x-scraper'} onClick={() => { setActiveTab('x-scraper'); setIsMobileMenuOpen(false); }} />
                    </div>
                  </div>

                  <div>
                    <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Web3 & Tech</p>
                    <div className="space-y-1">
                      <NavItem icon={<Coins size={18} />} label={t.crypto} active={activeTab === 'crypto-tax'} onClick={() => { setActiveTab('crypto-tax'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Fingerprint size={18} />} label={t.blockchain} active={activeTab === 'blockchain-verify'} onClick={() => { setActiveTab('blockchain-verify'); setIsMobileMenuOpen(false); }} />
                      <NavItem icon={<Ticket size={18} />} label={t.tokens} active={activeTab === 'tokenized-cert'} onClick={() => { setActiveTab('tokenized-cert'); setIsMobileMenuOpen(false); }} />
                    </div>
                  </div>
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button onClick={() => setActiveTab('dashboard')} className={cn("mobile-nav-item", activeTab === 'dashboard' && "active")}>
          <BarChart3 size={22} />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => setShowLiveAgent(true)} className={cn("mobile-nav-item", showLiveAgent && "active")}>
          <Bot size={22} className="text-indigo-500" />
          <span className="text-[10px] font-bold">Live</span>
        </button>
        <button onClick={() => setActiveTab('ai')} className={cn("mobile-nav-item", activeTab === 'ai' && "active")}>
          <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center text-white -mt-8 shadow-lg shadow-brand-600/30 border-4 border-white">
            <Sparkles size={24} />
          </div>
          <span className="text-[10px] font-bold">AI Bot</span>
        </button>
        <button onClick={() => setActiveTab('tax')} className={cn("mobile-nav-item", activeTab === 'tax' && "active")}>
          <Calculator size={22} />
          <span className="text-[10px] font-bold">Tax</span>
        </button>
        <button onClick={() => setActiveTab('tools')} className={cn("mobile-nav-item", activeTab === 'tools' && "active")}>
          <Layout size={22} />
          <span className="text-[10px] font-bold">Tools</span>
        </button>
      </nav>

      {/* Sidebar (Desktop) */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-zinc-100 z-50 hidden md:flex flex-col">
        <div 
          className="p-8 flex items-center gap-3 cursor-pointer group"
          onClick={handleLogoClick}
        >
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            {/* Gold Background with subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E6B93E] via-[#FFD700] to-[#B8860B] rounded-2xl shadow-lg shadow-yellow-500/20 group-hover:shadow-yellow-500/40 transition-shadow duration-300 rotate-3 group-hover:rotate-0" />
            
            {/* Stylized V using vector bars */}
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute left-0 top-0 w-[45%] h-full bg-[#001D4A] rounded-full origin-bottom rotate-[-25deg] translate-x-1" />
              <div className="absolute right-0 top-0 w-[45%] h-full bg-[#00A8E8] rounded-full origin-bottom rotate-[25deg] -translate-x-1" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-0.5 font-display">
              <span className="text-xl font-black tracking-tighter text-[#001D4A]">VAT</span>
              <span className="text-xl font-black tracking-tighter text-[#00A8E8]">X</span>
              <span className="text-xl font-black tracking-tighter text-zinc-300">.BD</span>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{t.compliance}</span>
          </div>
        </div>

        <nav className="flex-1 mt-4 px-6 space-y-1 overflow-y-auto custom-scrollbar">
          {isDeveloper && (
            <div className="pb-4 mb-4 border-b border-brand-100">
              <p className="px-4 text-[10px] font-black text-brand-600 uppercase tracking-widest mb-4">Developer Mode</p>
              <NavItem 
                icon={<Cpu size={18} />} 
                label="Control Panel" 
                active={activeTab === 'developer'} 
                onClick={() => setActiveTab('developer')} 
              />
            </div>
          )}

          <div className="pb-4">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Overview</p>
            <NavItem 
              icon={<BarChart3 size={18} />} 
              label={t.dashboard} 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <NavItem 
              icon={<FileCode size={18} className="text-emerald-500" />} 
              label={t.nbrScriptMarkup || "NBR Script from Markup"} 
              badge="Featured"
              active={activeTab === 'nbr-script-markup'} 
              onClick={() => setActiveTab('nbr-script-markup')} 
            />
            <NavItem 
              icon={<FileSearch size={18} />} 
              label={t.documents} 
              badge="Smart"
              active={activeTab === 'documents'} 
              onClick={() => setActiveTab('documents')} 
            />
          </div>

          <div className="py-4 border-t border-zinc-50">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">AI Intelligence</p>
            <NavItem 
              icon={<Sparkles size={18} />} 
              label={t.ai} 
              badge="AI"
              active={activeTab === 'ai'} 
              onClick={() => setActiveTab('ai')} 
            />
            <NavItem 
              icon={<Bot size={18} className="text-indigo-500" />} 
              label="Gemini Live" 
              badge="Live"
              active={showLiveAgent} 
              onClick={() => setShowLiveAgent(true)} 
            />
            <NavItem 
              icon={<Sparkles size={18} />} 
              label={t.advisory} 
              active={activeTab === 'tax-advisory'} 
              onClick={() => setActiveTab('tax-advisory')} 
            />
            <NavItem 
              icon={<Search size={18} />} 
              label={t.hscode} 
              active={activeTab === 'hscode'} 
              onClick={() => setActiveTab('hscode')} 
            />
          </div>

          <div className="py-4 border-t border-zinc-50">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">{t.vatHub}</p>
            <NavItem 
              icon={<Receipt size={18} />} 
              label={t.vat} 
              active={activeTab === 'vat'} 
              onClick={() => setActiveTab('vat')} 
            />
            <NavItem 
              icon={<Calculator size={18} />} 
              label={t.criticalVat} 
              active={activeTab === 'critical-vat'} 
              onClick={() => setActiveTab('critical-vat')} 
            />
            <NavItem 
              icon={<ClipboardCheck size={18} />} 
              label="VDS Tracker" 
              active={activeTab === 'vds-tracker'} 
              onClick={() => setActiveTab('vds-tracker')} 
            />
            <NavItem 
              icon={<ShieldCheck size={18} />} 
              label="Challan Verify" 
              active={activeTab === 'challan-verify'} 
              onClick={() => setActiveTab('challan-verify')} 
            />
            <NavItem 
              icon={<Building2 size={18} />} 
              label={t.vatAgents} 
              active={activeTab === 'vat-agents'} 
              onClick={() => setActiveTab('vat-agents')} 
            />
            <NavItem 
              icon={<FileSearch size={18} />} 
              label={t.vatOcr} 
              active={activeTab === 'vat-ocr'} 
              onClick={() => setActiveTab('vat-ocr')} 
            />
          </div>

          <div className="py-4 border-t border-zinc-50">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">{t.taxHub}</p>
            <NavItem 
              icon={<Calculator size={18} />} 
              label={t.tax} 
              active={activeTab === 'tax'} 
              onClick={() => setActiveTab('tax')} 
            />
            <NavItem 
              icon={<Building2 size={18} />} 
              label={t.corporateTax} 
              badge="New"
              active={activeTab === 'corporate-tax'} 
              onClick={() => setActiveTab('corporate-tax')} 
            />
            <NavItem 
              icon={<FileSearch size={18} />} 
              label={t.trmsExtractor} 
              active={activeTab === 'trms-extractor'} 
              onClick={() => setActiveTab('trms-extractor')} 
            />
            <NavItem 
              icon={<FileSearch size={18} />} 
              label={t.taxOcr} 
              active={activeTab === 'tax-ocr'} 
              onClick={() => setActiveTab('tax-ocr')} 
            />
            <NavItem 
              icon={<Calculator size={18} />} 
              label="TDS Tracker" 
              active={activeTab === 'tds-tracker'} 
              onClick={() => setActiveTab('tds-tracker')} 
            />
            <NavItem 
              icon={<Shield size={18} />} 
              label={t.finalTax} 
              active={activeTab === 'final-tax'} 
              onClick={() => setActiveTab('final-tax')} 
            />
            <NavItem 
              icon={<TrendingUp size={18} />} 
              label={t.rebate} 
              active={activeTab === 'rebate'} 
              onClick={() => setActiveTab('rebate')} 
            />
            <NavItem 
              icon={<Coins size={18} />} 
              label={t.zakat} 
              active={activeTab === 'zakat'} 
              onClick={() => setActiveTab('zakat')} 
            />
          </div>

          <div className="py-4 border-t border-zinc-50">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Compliance Suite</p>
            <NavItem 
              icon={<Calendar size={18} />} 
              label="Compliance Calendar" 
              active={activeTab === 'compliance-calendar'} 
              onClick={() => setActiveTab('compliance-calendar')} 
            />
            <NavItem 
              icon={<Smartphone size={18} />} 
              label={t['mfs-payment'] || "MFS Payment"} 
              active={activeTab === 'mfs-payment'} 
              onClick={() => setActiveTab('mfs-payment')} 
            />
          </div>

          <div className="py-4 border-t border-zinc-50">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Business Suite</p>
            <NavItem 
              icon={<Receipt size={18} />} 
              label={t.invoice} 
              active={activeTab === 'invoice'} 
              onClick={() => setActiveTab('invoice')} 
            />
            <NavItem 
              icon={<Settings size={18} />} 
              label="Odoo Setup" 
              active={activeTab === 'odoo'} 
              onClick={() => setActiveTab('odoo')} 
            />
            <NavItem 
              icon={<Database size={18} />} 
              label="Odoo ERP Integration" 
              active={activeTab === 'odoo-erp'} 
              onClick={() => setActiveTab('odoo-erp')} 
            />
            <NavItem 
              icon={<Cpu size={18} />} 
              label="ERPNext Automation" 
              active={activeTab === 'erpnext'} 
              onClick={() => setActiveTab('erpnext')} 
            />
            <NavItem 
              icon={<Folder size={18} />} 
              label="Dropbox Cloud" 
              active={activeTab === 'dropbox'} 
              onClick={() => setActiveTab('dropbox')} 
            />
            <NavItem 
              icon={<Database size={18} />} 
              label={t.base} 
              active={activeTab === 'base'} 
              onClick={() => setActiveTab('base')} 
            />
          </div>

          <div className="py-4 border-t border-zinc-50">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Marketplace & Community</p>
            <NavItem 
              icon={<Bell size={18} className="text-amber-500" />} 
              label={language === 'bn' ? 'আইন আপডেট' : 'Law Updates'} 
              active={activeTab === 'law-updates'} 
              onClick={() => setActiveTab('law-updates')} 
            />
            <NavItem 
              icon={<Building2 size={18} />} 
              label={t.vatAgents} 
              active={activeTab === 'vat-agents'} 
              onClick={() => setActiveTab('vat-agents')} 
            />
            <NavItem 
              icon={<FileText size={18} />} 
              label={t.blog} 
              active={activeTab === 'blog'} 
              onClick={() => setActiveTab('blog')} 
            />
            <NavItem 
              icon={<Bell size={18} />} 
              label={t.notices} 
              active={activeTab === 'notices'} 
              onClick={() => setActiveTab('notices')} 
            />
            <NavItem 
              icon={<Heart size={18} />} 
              label="Donation Centre" 
              active={activeTab === 'donation'} 
              onClick={() => setActiveTab('donation')} 
            />
            <NavItem 
              icon={<MessageSquare size={18} />} 
              label="WhatsApp Automation" 
              active={activeTab === 'whatsapp'} 
              onClick={() => setActiveTab('whatsapp')} 
            />
            <NavItem 
              icon={<Share2 size={18} />} 
              label={t.social} 
              active={activeTab === 'social'} 
              onClick={() => setActiveTab('social')} 
            />
            <NavItem 
              icon={<Twitter size={18} />} 
              label="X Intelligence" 
              active={activeTab === 'x-scraper'} 
              onClick={() => setActiveTab('x-scraper')} 
            />
            <NavItem 
              icon={<History size={18} />} 
              label={t.history} 
              active={activeTab === 'history'} 
              onClick={() => setActiveTab('history')} 
            />
            <NavItem 
              icon={<AlertCircle size={18} />} 
              label={t.help} 
              active={activeTab === 'help'} 
              onClick={() => setActiveTab('help')} 
            />
            <NavItem 
              icon={<Code size={18} />} 
              label="Open Source & Dev" 
              active={activeTab === 'developer'} 
              onClick={() => setActiveTab('developer')} 
            />
          </div>

          <div className="py-4 border-t border-zinc-50">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Web3 & Tech</p>
            <NavItem 
              icon={<Coins size={18} />} 
              label={t.crypto} 
              active={activeTab === 'crypto-tax'} 
              onClick={() => setActiveTab('crypto-tax')} 
            />
            <NavItem 
              icon={<Fingerprint size={18} />} 
              label={t.blockchain} 
              active={activeTab === 'blockchain-verify'} 
              onClick={() => setActiveTab('blockchain-verify')} 
            />
            <NavItem 
              icon={<Ticket size={18} />} 
              label={t.tokens} 
              active={activeTab === 'tokenized-cert'} 
              onClick={() => setActiveTab('tokenized-cert')} 
            />
          </div>
        </nav>

        <div className="p-8">
          <button 
            onClick={() => setActiveTab('subscription')}
            className={cn(
              "w-full p-4 rounded-2xl flex flex-col gap-3 transition-all duration-300 group",
              activeTab === 'subscription' ? "bg-zinc-900 text-white" : "bg-zinc-50 hover:bg-zinc-100 text-zinc-900"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <ShieldCheck size={20} className={activeTab === 'subscription' ? "text-brand-400" : "text-zinc-400"} />
              <div className="px-2 py-0.5 bg-brand-500 text-white text-[8px] font-black uppercase tracking-tighter rounded-full">Pro</div>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold">{t.managePlan}</p>
              <p className={cn("text-[10px]", activeTab === 'subscription' ? "text-zinc-400" : "text-zinc-500")}>{t.upgrade}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Live Agent Overlay */}
      <AnimatePresence>
        {showLiveAgent && (
          <LiveAgent onClose={() => setShowLiveAgent(false)} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="md:ml-72 p-6 md:p-8 lg:p-12 min-h-screen pt-24 md:pt-12">
        <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-12 hidden md:flex">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2 py-0.5 bg-brand-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md">{t.live}</div>
              <span className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em]">{t.compliance}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display capitalize bg-gradient-to-r from-zinc-900 to-zinc-500 bg-clip-text text-transparent">
              {t[activeTab as keyof typeof t] || activeTab.replace('-', ' ')}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              isOnline ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
            )}>
              <div className={cn("w-2 h-2 rounded-full animate-pulse", isOnline ? "bg-emerald-500" : "bg-red-500")} />
              {isOnline ? (language === 'bn' ? 'অনলাইন' : 'Online') : (language === 'bn' ? 'অফলাইন' : 'Offline')}
            </div>
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all text-sm shadow-sm"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              <AnimatePresence>
                {showSearchResults && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowSearchResults(false)} 
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-[#F3F4F6] bg-[#F9FAFB]">
                        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Search Results</p>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {searchResults.length > 0 ? (
                          searchResults.map((result, idx) => (
                            <button
                              key={`${result.type}-${result.id}-${idx}`}
                              onClick={() => {
                                if (result.type === 'notice') {
                                  window.open(result.link, '_blank');
                                } else {
                                  setActiveTab(result.type as Tab);
                                }
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                              className="w-full text-left p-4 hover:bg-gray-50 transition-all border-b border-[#F3F4F6] last:border-0 flex items-center gap-3"
                            >
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                result.type === 'blog' && "bg-blue-50 text-blue-600",
                                result.type === 'client' && "bg-purple-50 text-purple-600",
                                result.type === 'notice' && "bg-emerald-50 text-emerald-600",
                                result.type === 'invoice' && "bg-amber-50 text-amber-600"
                              )}>
                                {result.type === 'blog' && <FileText size={16} />}
                                {result.type === 'client' && <Users size={16} />}
                                {result.type === 'notice' && <Bell size={16} />}
                                {result.type === 'invoice' && <Receipt size={16} />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#111827] line-clamp-1">{result.title}</p>
                                <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">{result.type}</p>
                              </div>
                              <ChevronRight size={14} className="ml-auto text-[#D1D5DB]" />
                            </button>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-sm text-[#6B7280] italic">No results found for "{searchQuery}"</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowNoticesDropdown(!showNoticesDropdown)}
                className="p-2 text-[#6B7280] hover:bg-white hover:shadow-sm rounded-lg transition-all relative"
              >
                <Bell size={20} />
                {notices.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F8F9FA]" />
                )}
              </button>
              
              <AnimatePresence>
                {showNoticesDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] z-[60] overflow-hidden"
                  >
                    <div className="p-4 border-bottom border-[#F3F4F6] flex justify-between items-center bg-[#F9FAFB]">
                      <h4 className="font-bold text-sm">Latest Tax Notices</h4>
                      <button onClick={() => setActiveTab('notices')} className="text-xs text-[#10B981] font-bold hover:underline">View All</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notices.length > 0 ? (
                        notices.slice(0, 5).map((notice) => (
                          <a 
                            key={notice.id} 
                            href={notice.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block p-4 hover:bg-gray-50 transition-all border-b border-[#F3F4F6] last:border-0"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full uppercase">{notice.category}</span>
                              <span className="text-[10px] text-[#9CA3AF]">{new Date(notice.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs font-medium text-[#374151] line-clamp-2">{notice.title}</p>
                          </a>
                        ))
                      ) : (
                        <div className="p-8 text-center text-[#6B7280] text-sm italic">No new notices</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button 
                onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                className="flex items-center gap-2 px-3 py-2 text-xs font-black text-zinc-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-zinc-100"
              >
                <Languages size={16} className="text-brand-500" />
                <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
              </button>
            </div>
            <button className="p-2 text-[#6B7280] hover:bg-white hover:shadow-sm rounded-lg transition-all">
              <Settings size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#10B981] to-[#34D399] flex items-center justify-center text-white font-bold">
              S
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard vatHistory={vatHistory} taxHistory={taxHistory} t={t} notices={notices} language={language} />}
            {activeTab === 'nbr-script-markup' && <NBRMarkupScriptHub language={language} />}
            {activeTab === 'vat-agents' && <VatAgentPortal />}
            {activeTab === 'vat' && (
              <VATCalculator 
                onComplete={fetchHistory} 
                t={t} 
                isGoogleAuthenticated={isGoogleAuthenticated} 
                handleGoogleConnect={handleGoogleConnect} 
              />
            )}
            {activeTab === 'tax' && (
              <TaxCalculator 
                onComplete={fetchHistory} 
                t={t} 
                isGoogleAuthenticated={isGoogleAuthenticated} 
                handleGoogleConnect={handleGoogleConnect} 
              />
            )}
            {activeTab === 'tax-ocr' && (
              <OCRFormAutomation 
                language={language} 
                defaultCategory="INCOME_TAX"
                onInvoiceExtracted={(data) => {
                  setPrefilledInvoice(data);
                  setActiveTab('invoice');
                }} 
              />
            )}
            {activeTab === 'vat-ocr' && (
              <OCRFormAutomation 
                language={language} 
                defaultCategory="VAT"
                onInvoiceExtracted={(data) => {
                  setPrefilledInvoice(data);
                  setActiveTab('invoice');
                }} 
              />
            )}
            {activeTab === 'ocr-automation' && (
              <OCRFormAutomation 
                language={language} 
                onInvoiceExtracted={(data) => {
                  setPrefilledInvoice(data);
                  setActiveTab('invoice');
                }} 
              />
            )}
            {activeTab === 'trms-extractor' && <TRMSAssistant />}
            {activeTab === 'corporate-tax' && <CorporateTaxAssistant t={t} />}
            {activeTab === 'tariff' && <TariffCalculator />}
            {activeTab === 'rebate' && <TaxRebatePlanner />}
            {activeTab === 'hscode' && <HSCodeFinder />}
            {activeTab === 'manifest' && <ManifestView t={t} />}
            {activeTab === 'reports' && <ReportsView vatHistory={vatHistory} taxHistory={taxHistory} t={t} />}
            {activeTab === 'ai' && <AIAssistant />}
            {activeTab === 'invoice' && <InvoiceGenerator initialData={prefilledInvoice} />}
            {activeTab === 'blog' && <BlogView />}
            {activeTab === 'tools' && <ToolsView setActiveTab={setActiveTab} />}
            {activeTab === 'history' && (
              <HistoryView 
                vatHistory={vatHistory} 
                taxHistory={taxHistory} 
                t={t} 
                isGoogleAuthenticated={isGoogleAuthenticated}
                handleGoogleConnect={handleGoogleConnect}
              />
            )}
            {activeTab === 'help' && <HelpCenter setActiveTab={setActiveTab} />}
            {activeTab === 'notices' && <NoticesView notices={notices} onRefresh={fetchNotices} />}
            {activeTab === 'law-updates' && <NotificationCenter language={language} />}
            {activeTab === 'subscription' && <SubscriptionView />}
            {activeTab === 'crypto-tax' && <CryptoTaxAdvisory />}
            {activeTab === 'blockchain-verify' && <BlockchainVerification />}
            {activeTab === 'tokenized-cert' && <TokenizedCertificates />}
            {activeTab === 'tax-advisory' && <IncomeTaxAdvisory />}
            {activeTab === 'final-tax' && <FinalTaxCalculator />}
            {activeTab === 'zakat' && <ZakatCalculator />}
            {activeTab === 'critical-vat' && <Mushak91Form />}
            {activeTab === 'developer' && <DeveloperPanel notices={notices} setNotices={setNotices} />}
            {activeTab === 'documents' && <DocumentCentre language={language} setLanguage={setLanguage} onInvoiceExtracted={(data) => {
              setPrefilledInvoice(data);
              setActiveTab('invoice');
            }} />}
            {activeTab === 'social' && <SocialIntegration />}
            {activeTab === 'base' && <BaseManager />}
            {activeTab === 'x-scraper' && <XScraper />}
            {activeTab === 'whatsapp' && <WhatsAppAutomation />}
            {activeTab === 'odoo' && <OdooAccounting language={language} />}
            {activeTab === 'dropbox' && <DropboxManager />}
            {activeTab === 'odoo-erp' && <OdooIntegration />}
            {activeTab === 'erpnext' && <ERPNextIntegration />}
            {activeTab === 'donation' && <DonationCentre />}
            {activeTab === 'vds-tracker' && <VDSTracker />}
            {activeTab === 'tds-tracker' && <TDSTracker />}
            {activeTab === 'compliance-calendar' && <ComplianceCalendar t={t} />}
            {activeTab === 'agent-marketplace' && <AgentMarketplace />}
            {activeTab === 'challan-verify' && <ChallanVerification />}
            {activeTab === 'mfs-payment' && <MFSPayment />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Footer and Developer Toggle */}
      <footer className="md:ml-72 p-12 border-t border-zinc-100 bg-white/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E6B93E] via-[#FFD700] to-[#B8860B] rounded-lg shadow-md" />
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <div className="absolute left-0 top-0 w-[45%] h-full bg-[#001D4A] rounded-full origin-bottom rotate-[-25deg] translate-x-0.5" />
                  <div className="absolute right-0 top-0 w-[45%] h-full bg-[#00A8E8] rounded-full origin-bottom rotate-[25deg] -translate-x-0.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-0.5 font-display">
                <span className="text-lg font-black tracking-tighter text-[#001D4A]">VAT</span>
                <span className="text-lg font-black tracking-tighter text-[#00A8E8]">X</span>
                <span className="text-lg font-black tracking-tighter text-zinc-400">.BD</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Bangladesh's most advanced AI-powered tax automation platform. Built for compliance, accuracy, and speed.
            </p>
          </div>
          
          <div className="space-y-4">
            <h5 className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em]">{t.vatHub}</h5>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => setActiveTab('vat')} className="text-xs text-zinc-500 hover:text-zinc-900 text-left transition-colors font-medium">Calculation Engine</button>
              <button onClick={() => setActiveTab('hscode')} className="text-xs text-zinc-500 hover:text-zinc-900 text-left transition-colors font-medium">HS Code Database</button>
              <button onClick={() => setActiveTab('corporate-tax')} className="text-xs text-zinc-500 hover:text-zinc-900 text-left transition-colors font-medium">Corporate Solutions</button>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em]">Administrative</h5>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => {
                  if (isDeveloper) {
                    setActiveTab('developer');
                  } else {
                    alert("Developer Mode is hidden. Hint: Click the top-left sidebar LOGO 5 times to enable it.");
                  }
                }} 
                className="text-xs text-zinc-500 hover:text-zinc-900 text-left transition-colors font-medium flex items-center gap-2 group"
              >
                <div className={cn("w-1.5 h-1.5 rounded-full", isDeveloper ? "bg-brand-500" : "bg-zinc-200 group-hover:bg-zinc-400")} />
                Developer & Partner Access
              </button>
              <a href="https://github.com/vatxbd/erpnext" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-zinc-900 text-left transition-colors font-medium">Open Source Github</a>
              <button onClick={() => setActiveTab('subscription')} className="text-xs text-zinc-500 hover:text-zinc-900 text-left transition-colors font-medium">Licensing & Plans</button>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto pt-12 mt-12 border-t border-zinc-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">© 2026 VATX.BD • AI COMPLIANCE ENGINE</p>
          <div className="flex items-center gap-6">
            <button onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')} className="text-xs font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">
              {language === 'bn' ? 'ENGLISH VERSION' : 'বাংলা সংস্করণ'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all duration-300 group relative overflow-hidden",
        active 
          ? "bg-zinc-900 text-white shadow-xl shadow-zinc-900/10 scale-[1.02]" 
          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
      )}
    >
      <span className={cn(
        "transition-all duration-300 relative z-10",
        active ? "text-brand-400 scale-110" : "text-zinc-400 group-hover:text-zinc-900 group-hover:scale-110"
      )}>
        {icon}
      </span>
      <span className="relative z-10 tracking-tight flex-1 text-left">{label}</span>
      {badge && (
        <span className={cn(
          "relative z-10 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
          active ? "bg-white/10 text-brand-400" : "bg-brand-50 text-brand-600"
        )}>
          {badge}
        </span>
      )}
      {active && (
        <motion.div 
          layoutId="active-pill"
          className="absolute inset-0 bg-zinc-900 -z-0"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      {active && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute right-4 w-1.5 h-1.5 bg-brand-400 rounded-full z-10"
        />
      )}
    </button>
  );
}

function DocumentCentre({ language, setLanguage, onInvoiceExtracted }: { language: Language, setLanguage: (l: Language) => void, onInvoiceExtracted: (data: any) => void }) {
  const t = translations[language];
  const [activeSubTab, setActiveSubTab] = useState<'ocr' | 'markup-script' | 'automation' | 'history'>('ocr');
  const [markupEditorText, setMarkupEditorText] = useState<string>('');
  const [modalCustomData, setModalCustomData] = useState<any>(null);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<any>(null);
  const [files, setFiles] = useState<{ 
    file: File; 
    previewUrl?: string;
    ocrResult?: string; 
    structuredData?: any;
    status: 'idle' | 'uploading' | 'processing' | 'done' | 'error';
    progress?: number;
    analysisStep?: string;
  }[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({ 
      file, 
      status: 'idle' as const,
      previewUrl: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    }
  } as any);

  const processOCR = async (index: number) => {
    const fileData = files[index];
    if (!fileData) return;
    
    setActiveFileIndex(index);
    if (fileData.status === 'processing' || fileData.status === 'done') return;

    setFiles(prev => {
      const next = [...prev];
      next[index].status = 'processing';
      next[index].progress = 10;
      next[index].analysisStep = t.stepReading;
      return next;
    });
    setActiveFileIndex(index);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(fileData.file);
      const base64 = await base64Promise;

      setFiles(prev => {
        const next = [...prev];
        next[index].progress = 30;
        next[index].analysisStep = t.stepUploading;
        return next;
      });

      setFiles(prev => {
        const next = [...prev];
        next[index].progress = 60;
        next[index].analysisStep = t.stepExtracting;
        return next;
      });

      const ocrRes = await fetch('/api/gemini/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              inlineData: {
                mimeType: fileData.file.type,
                data: base64
              }
            },
            {
              text: `Extract structured data from this document for Bangladesh Tax (NBR) filing.
            Special focus on the NBR Source Tax Private Salary Ledger (ledger.etaxnbr.gov.bd/#/pages/source-tax/private-salary), Salary Certificate u/s 86, IT-11GA, and TRMS automation.
            
            CRITICAL RULES - ZERO HALLUCINATION & ACTUAL VALUES ONLY:
            - NEVER invent or use sample/placeholder numbers, dates, or company names.
            - Extract ONLY the genuine text, reference numbers, and financial amounts printed in this specific document.
            - DO NOT output fictitious amounts or previously seen sample numbers (like 15000, 27650502, 4131, etc.). Read the actual pixels and digits printed on this specific page.
            - Extract the exact numerical amounts that actually appear in the document for Challan Total and Claimed TDS. If an amount is 4,500, extract 4500. Extract authentic values with 100% precision.
            
            EXTRACT ALL NBR PRIVATE SALARY 7 FORM COLUMNS WITH 100% FAITHFULNESS:
            1. Depositing Authority (Employer / Company / Bank name deducting tax)
            2. Payment Document Type ("Challan", "Certificate", "e-Challan", or "Pay Order")
            3. Challan/ Certificate Reference No. (Extract the FULL reference number without truncating)
            4. Challan/ Certificate Date (Formatted as DD-MM-YYYY)
            5. Challan/ Certificate Amount (Total Deposited Challan Amount in BDT)
            6. Claimed Amount (Specific Tax Deducted at Source TDS relating to this employee/taxpayer)
            7. Taxpayer Name & Employee TIN (12-digit e-TIN)
            8. Assessment Year & Financial Year
            9. Multi-month Table of Challans / Monthly Deductions (if document contains multiple salary deductions or monthly rows):
                - sl (1, 2, 3...)
                - month (e.g. "Jul 2025", "Aug 2025")
                - depositingAuthority
                - paymentDocType ("Challan" or "Certificate")
                - challanRefNo (Full Challan Reference Number)
                - challanDate (Formatted as DD-MM-YYYY)
                - challanAmount (Total challan amount)
                - claimedAmount (Claimed employee TDS amount)

            Return the data in a clean JSON format matching these exact fields.`
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                documentType: { type: "string" },
                taxpayerName: { type: "string" },
                vendorName: { type: "string" },
                depositingAuthority: { type: "string" },
                paymentDocType: { type: "string" },
                challanRefNo: { type: "string" },
                challanDate: { type: "string" },
                challanAmount: { type: "number" },
                claimedAmount: { type: "number" },
                tin: { type: "string" },
                bin: { type: "string" },
                date: { type: "string" },
                assessmentYear: { type: "string" },
                totalAmount: { type: "number" },
                taxAmount: { type: "number" },
                salaryIncome: { type: "number" },
                housePropertyIncome: { type: "number" },
                businessIncome: { type: "number" },
                investmentAmount: { type: "number" },
                currency: { type: "string" },
                summary: { type: "string" },
                confidence: { type: "number" },
                entities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      type: { type: "string" },
                      relevance: { type: "string" }
                    },
                    required: ["name", "type"]
                  }
                },
                challans: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sl: { type: "number" },
                      month: { type: "string" },
                      depositingAuthority: { type: "string" },
                      paymentDocType: { type: "string" },
                      challanRefNo: { type: "string" },
                      challanDate: { type: "string" },
                      claimedAmount: { type: "number" },
                      challanAmount: { type: "number" },
                      challanNo: { type: "string" },
                      date: { type: "string" }
                    }
                  }
                }
              },
              required: ["documentType"]
            }
          }
        })
      });

      if (!ocrRes.ok) {
        const errJson = await ocrRes.json().catch(() => ({}));
        throw new Error(errJson.error || `Server OCR returned HTTP ${ocrRes.status}`);
      }

      const ocrResultData = await ocrRes.json();

      setFiles(prev => {
        const next = [...prev];
        next[index].progress = 90;
        next[index].analysisStep = t.stepFinalizing;
        return next;
      });

      const structuredData = parseRobustJson<any>(ocrResultData.text || "{}", {});

      // Normalize structured data to ensure authentic extracted values are preserved
      const actualAuthority = String(structuredData.depositingAuthority || structuredData.vendorName || '').trim();
      const actualDocType = structuredData.paymentDocType || 'Challan';
      const actualRefNo = String(structuredData.challanRefNo || structuredData.challanNo || '').trim();
      const actualDate = formatNBRDate(structuredData.challanDate || structuredData.date) || '';
      const actualChallanAmt = Number(structuredData.challanAmount !== undefined ? structuredData.challanAmount : (structuredData.totalAmount || 0));
      const actualClaimedAmt = Number(structuredData.claimedAmount !== undefined ? structuredData.claimedAmount : (structuredData.taxAmount || 0));

      structuredData.depositingAuthority = actualAuthority;
      structuredData.paymentDocType = actualDocType;
      structuredData.challanRefNo = actualRefNo;
      structuredData.challanDate = actualDate;
      structuredData.challanAmount = actualChallanAmt;
      structuredData.claimedAmount = actualClaimedAmt;

      if (!structuredData.challans || structuredData.challans.length === 0) {
        if (actualRefNo || actualChallanAmt > 0 || actualClaimedAmt > 0) {
          structuredData.challans = [{
            sl: 1,
            month: structuredData.month || 'Jul',
            depositingAuthority: actualAuthority,
            paymentDocType: actualDocType,
            challanRefNo: actualRefNo,
            challanDate: actualDate,
            challanAmount: actualChallanAmt,
            claimedAmount: actualClaimedAmt
          }];
        } else {
          structuredData.challans = [];
        }
      } else {
        structuredData.challans = structuredData.challans.map((c: any, i: number) => ({
          sl: c.sl || i + 1,
          month: c.month || `Period ${i + 1}`,
          depositingAuthority: String(c.depositingAuthority || actualAuthority).trim(),
          paymentDocType: c.paymentDocType || actualDocType,
          challanRefNo: String(c.challanRefNo || c.challanNo || actualRefNo).trim(),
          challanDate: formatNBRDate(c.challanDate || c.date || actualDate),
          challanAmount: c.challanAmount !== undefined ? Number(c.challanAmount) : actualChallanAmt,
          claimedAmount: c.claimedAmount !== undefined ? Number(c.claimedAmount) : actualClaimedAmt
        }));
      }

      setFiles(prev => {
        const next = [...prev];
        next[index].status = 'done';
        next[index].progress = 100;
        next[index].structuredData = structuredData;
        next[index].ocrResult = ocrResultData.text;
        return next;
      });
    } catch (err) {
      console.error('OCR failed', err);
      setFiles(prev => {
        const next = [...prev];
        next[index].status = 'error';
        return next;
      });
    }
  };

  const generateNBRScript = (data: any) => {
    if (!data) return "";
    const isSalaryLedger = data.challans && data.challans.length > 0;
    if (isSalaryLedger) {
      return generatePrivateSalaryLedgerScript(data);
    }
    return generateTRMSScript(data);
  };

  const activeFile = activeFileIndex !== null ? files[activeFileIndex] : null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex bg-zinc-100 p-1.5 rounded-2xl w-fit flex-wrap gap-1">
          <button
            onClick={() => {
              setSelectedHistoryEntry(null);
              setActiveSubTab('ocr');
            }}
            className={cn(
              "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeSubTab === 'ocr' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <FileSearch size={18} />
            {t.smartOcr || 'Smart OCR'}
          </button>
          <button
            onClick={() => {
              setSelectedHistoryEntry(null);
              setActiveSubTab('markup-script');
            }}
            className={cn(
              "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeSubTab === 'markup-script' ? "bg-white text-emerald-800 shadow-sm font-black" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <FileCode size={18} className={activeSubTab === 'markup-script' ? "text-emerald-600" : ""} />
            {t.nbrScriptMarkup || (language === 'bn' ? 'মার্কআপ থেকে এনবিআর স্ক্রিপ্ট' : 'NBR Script from Markup')}
          </button>
          <button
            onClick={() => {
              setSelectedHistoryEntry(null);
              setActiveSubTab('automation');
            }}
            className={cn(
              "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeSubTab === 'automation' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <Layers size={18} />
            {t.formAutomation || 'Form Automation'}
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={cn(
              "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeSubTab === 'history' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            <History size={18} />
            {language === 'bn' ? 'ইতিহাস' : 'History'}
          </button>
        </div>

        <div className="flex bg-zinc-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setLanguage('en')}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              language === 'en' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('bn')}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              language === 'bn' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            বাংলা
          </button>
        </div>
      </div>

      {activeSubTab === 'markup-script' && (
        <NBRMarkupScriptHub 
          language={language} 
          initialMarkup={markupEditorText || (activeFile?.ocrResult || '')}
          initialData={activeFile?.structuredData}
          onOpenModal={(data) => {
            setModalCustomData(data);
            setIsScriptModalOpen(true);
          }}
        />
      )}

      {activeSubTab === 'automation' && (
        <OCRFormAutomation 
          language={language} 
          onInvoiceExtracted={onInvoiceExtracted} 
          initialData={selectedHistoryEntry}
        />
      )}

      {activeSubTab === 'history' && (
        <div className="max-w-4xl mx-auto w-full">
          <OCRHistory 
            language={language} 
            onSelect={(data) => {
              setSelectedHistoryEntry(data);
              setActiveSubTab('automation');
            }} 
          />
        </div>
      )}

      {activeSubTab === 'ocr' && (
        <>
          <SectionGuide 
            language={language}
            title={t.ocrGuideTitle}
            steps={[
              t.ocrStep1,
              t.ocrStep2,
              t.ocrStep3,
              t.ocrStep4,
              t.ocrStep5
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div 
            {...getRootProps()} 
            className={cn(
              "neo-card p-10 rounded-[3rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4",
              isDragActive ? "border-brand-500 bg-brand-50/50" : "border-zinc-200 bg-white hover:border-brand-400 hover:bg-zinc-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shadow-sm">
              <Upload size={32} />
            </div>
            <div>
              <p className="text-lg font-black font-display tracking-tight">{t.dropDocuments}</p>
              <p className="text-xs text-zinc-500 mt-1 uppercase font-black tracking-widest">{t.fileTypes}</p>
            </div>
          </div>

          <div className="neo-card p-8 rounded-[3rem] bg-white shadow-xl shadow-zinc-200/50 border border-zinc-100">
            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6">{t.recentUploads}</h4>
            <div className="space-y-3">
              {files.map((f, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveFileIndex(i)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3",
                    activeFileIndex === i ? "border-brand-500 ring-2 ring-brand-500/10" : "border-zinc-100",
                    f.status === 'done' ? "bg-emerald-50/50" : "bg-zinc-50 hover:bg-white hover:shadow-md"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    f.status === 'done' ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-500"
                  )}>
                    {f.status === 'processing' ? <Loader2 size={20} className="animate-spin" /> : <File size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-zinc-900 truncate">{f.file.name}</p>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      {(f.file.size / 1024 / 1024).toFixed(2)} MB • {f.status}
                    </p>
                  </div>
                  {f.status === 'idle' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        processOCR(i);
                      }}
                      className="p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all"
                      title="AI Analyze"
                    >
                      <Zap size={14} />
                    </button>
                  )}
                  {f.status === 'done' && <CheckCircle2 size={16} className="text-emerald-600" />}
                </div>
              ))}
              {files.length === 0 && (
                <div className="py-10 text-center text-zinc-400 italic text-xs">{t.noDocuments}</div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="neo-card h-full min-h-[600px] rounded-[3rem] bg-white shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black font-display tracking-tight">{t.nbrAssistant}</h3>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t.dataFilingBridge}</p>
                </div>
              </div>
              {activeFile?.structuredData && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      if (activeFile?.ocrResult) {
                        setMarkupEditorText(activeFile.ocrResult);
                      }
                      setActiveSubTab('markup-script');
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95"
                  >
                    <FileCode size={14} /> {language === 'bn' ? 'মার্কআপ স্ক্রিপ্ট' : 'Markup Script'}
                  </button>
                  <button 
                    onClick={() => setIsScriptModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/20 active:scale-95"
                  >
                    <Code size={14} /> {t.openScriptHub || 'Script & Automation Hub'}
                  </button>
                  <button 
                    onClick={() => {
                      const script = generateNBRScript(activeFile.structuredData);
                      copyToClipboard(script);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                      copied ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-900/20"
                    )}
                  >
                    {copied ? (
                      <>
                        <Check size={14} /> {t.scriptCopied}
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> {t.generateScript}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-zinc-50/20">
              {activeFile?.status === 'processing' ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-6 p-12">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
                    <motion.div 
                      className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-brand-600 font-black text-xs">
                      {activeFile.progress}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black text-zinc-900 uppercase tracking-widest">{activeFile.analysisStep}</p>
                    <div className="w-64 h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-brand-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${activeFile.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : activeFile?.status === 'error' ? (
                <div className="h-full flex items-center justify-center">
                  <AIErrorDisplay 
                    error={t.ocrError}
                    onRetry={() => processOCR(activeFileIndex!)}
                  />
                </div>
              ) : activeFile?.structuredData ? (
                <div className="space-y-8">
                  {activeFile?.previewUrl && (
                    <div className="mb-8 overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-50">
                      <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-white">
                        <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                          <ImageIcon size={14} /> {t.documentPreview}
                        </h5>
                        <a 
                          href={activeFile.previewUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline"
                        >
                          {t.viewFullSize}
                        </a>
                      </div>
                      <div className="p-4 flex justify-center">
                        {activeFile.file.type.includes('image') ? (
                          <img 
                            src={activeFile.previewUrl} 
                            alt="Preview" 
                            className="max-h-[300px] rounded-xl shadow-lg"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="py-12 flex flex-col items-center gap-3 text-zinc-400">
                            <FileText size={48} />
                            <p className="text-xs font-bold uppercase tracking-widest">{t.pdfPreview}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DataPoint label={t.docType} value={activeFile.structuredData.documentType} icon={<FileText size={16} />} />
                    <DataPoint label={t.depositingAuthority || "Depositing Authority"} value={activeFile.structuredData.depositingAuthority || activeFile.structuredData.vendorName} icon={<Building2 size={16} />} />
                    <DataPoint label={t.challanRefNo || "Challan/ Certificate Ref No."} value={activeFile.structuredData.challanRefNo || activeFile.structuredData.challanNo} icon={<Fingerprint size={16} />} />
                    <DataPoint label={t.challanDate || "Challan/ Certificate Date"} value={activeFile.structuredData.challanDate || activeFile.structuredData.date} icon={<History size={16} />} />
                    <DataPoint label={t.paymentDocType || "Payment Document Type"} value={activeFile.structuredData.paymentDocType || "Challan"} icon={<FileText size={16} />} />
                    <DataPoint label={t.taxpayerName} value={activeFile.structuredData.taxpayerName} icon={<User size={16} />} />
                    <DataPoint label={t.tinNumber} value={activeFile.structuredData.tin} icon={<Fingerprint size={16} />} />
                    <DataPoint label={t.assessmentYear} value={activeFile.structuredData.assessmentYear} icon={<History size={16} />} />
                    
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
                      <DataPoint label={t.challanAmount || "Challan Amount"} value={(activeFile.structuredData.challanAmount || activeFile.structuredData.totalAmount) ? `৳${(activeFile.structuredData.challanAmount || activeFile.structuredData.totalAmount).toLocaleString()}` : undefined} icon={<DollarSign size={16} />} />
                      <DataPoint label={t.claimedAmount || "Claimed Amount (TDS)"} value={(activeFile.structuredData.claimedAmount || activeFile.structuredData.taxAmount) ? `৳${(activeFile.structuredData.claimedAmount || activeFile.structuredData.taxAmount).toLocaleString()}` : undefined} icon={<ShieldCheck size={16} />} />
                      <DataPoint label={t.salaryIncome} value={activeFile.structuredData.salaryIncome ? `৳${activeFile.structuredData.salaryIncome.toLocaleString()}` : undefined} icon={<Coins size={16} />} />
                    </div>

                    {activeFile.structuredData.challans && activeFile.structuredData.challans.length > 0 && (
                      <div className="md:col-span-2 mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Database size={14} /> {t.challanTable || "NBR Source Tax Private Salary Table"} ({activeFile.structuredData.challans.length})
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                            7 Columns Formatted
                          </span>
                        </div>
                        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
                          <table className="w-full text-left text-xs min-w-[700px]">
                            <thead className="bg-zinc-50 font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-200">
                              <tr>
                                <th className="p-3 w-12 text-center">{t.sl || "SL."}</th>
                                <th className="p-3">{t.depositingAuthority || "Depositing Authority"}</th>
                                <th className="p-3">{t.paymentDocType || "Type"}</th>
                                <th className="p-3">{t.challanRefNo || "Ref No."}</th>
                                <th className="p-3">{t.challanDate || "Date"}</th>
                                <th className="p-3 text-right">{t.challanAmount || "Challan Total"}</th>
                                <th className="p-3 text-right">{t.claimedAmount || "Claimed (৳)"}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                              {activeFile.structuredData.challans.map((c: any, idx: number) => (
                                <tr key={idx} className="hover:bg-emerald-50/30 transition-all">
                                  <td className="p-3 text-center font-bold text-zinc-400">{c.sl || idx + 1}</td>
                                  <td className="p-3 font-bold text-zinc-800">{c.depositingAuthority || activeFile.structuredData.depositingAuthority || activeFile.structuredData.vendorName || '-'}</td>
                                  <td className="p-3 font-semibold text-zinc-600">{c.paymentDocType || 'Challan'}</td>
                                  <td className="p-3 font-mono font-bold text-sky-700">{c.challanRefNo || c.challanNo || '-'}</td>
                                  <td className="p-3 font-mono text-zinc-700">{c.challanDate || c.date || '-'}</td>
                                  <td className="p-3 text-right text-zinc-600">৳{(c.challanAmount !== undefined ? c.challanAmount : 0).toLocaleString()}</td>
                                  <td className="p-3 text-right font-black text-emerald-600">৳{(c.claimedAmount !== undefined ? c.claimedAmount : 0).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-brand-50 rounded-3xl border border-brand-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="text-brand-600" />
                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">NBR Automation Ready</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full">Updated 2026-2027</span>
                    </div>
                    <p className="text-xs text-brand-900 leading-relaxed font-medium">
                      This extracted data is formatted for <strong>NBR Source Tax Private Salary Ledger</strong> (<code>ledger.etaxnbr.gov.bd/#/pages/source-tax/private-salary</code>) and <strong>TRMS</strong> (<code>trms.nbr.gov.bd</code>).
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => {
                          if (activeFile?.ocrResult) {
                            setMarkupEditorText(activeFile.ocrResult);
                          }
                          setActiveSubTab('markup-script');
                        }}
                        className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10"
                      >
                        <FileCode size={14} /> {language === 'bn' ? 'মার্কআপ স্ক্রিপ্ট হাব' : 'Open in Markup Script Part'}
                      </button>
                      <button
                        onClick={() => setIsScriptModalOpen(true)}
                        className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-all shadow-md shadow-brand-600/10"
                      >
                        <Code size={14} /> Open NBR Script Hub
                      </button>
                      <a
                        href="https://ledger.etaxnbr.gov.bd/#/pages/source-tax/private-salary"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-brand-700 border border-brand-200 rounded-xl text-xs font-bold hover:bg-brand-50 transition-all"
                      >
                        <ExternalLink size={13} /> NBR Private Salary Portal
                      </a>
                    </div>
                  </div>

                  <div className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Users size={16} className="text-zinc-400" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t.relevantEntities}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeFile.structuredData.entities?.map((entity: any, idx: number) => (
                        <div key={idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black text-zinc-900">{entity.name}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-zinc-200 text-zinc-600 rounded-md">{entity.type}</span>
                          </div>
                          {entity.relevance && <p className="text-[10px] text-zinc-500 italic">{entity.relevance}</p>}
                        </div>
                      ))}
                      {(!activeFile.structuredData.entities || activeFile.structuredData.entities.length === 0) && (
                        <p className="text-[10px] text-zinc-400 italic col-span-2">No entities identified</p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare size={16} className="text-zinc-400" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Raw AI Analysis</span>
                    </div>
                    <pre className="text-[10px] font-mono text-zinc-500 bg-zinc-50 p-4 rounded-xl overflow-x-auto">
                      {JSON.stringify(activeFile.structuredData, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                  {activeFile?.previewUrl && (
                    <div className="mb-4 overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-50 max-w-md mx-auto">
                      <div className="p-3 border-b border-zinc-100 flex items-center justify-between bg-white">
                        <h5 className="text-[8px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                          <ImageIcon size={12} /> {t.documentPreview}
                        </h5>
                      </div>
                      <div className="p-4 flex justify-center">
                        {activeFile.file.type.includes('image') ? (
                          <img 
                            src={activeFile.previewUrl} 
                            alt="Preview" 
                            className="max-h-[200px] rounded-lg shadow-md"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="py-8 flex flex-col items-center gap-2 text-zinc-400">
                            <FileText size={32} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">PDF Preview</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="w-16 h-16 bg-brand-50 rounded-[1.5rem] flex items-center justify-center text-brand-600 shadow-xl shadow-brand-500/10">
                    <Sparkles size={32} className="animate-pulse" />
                  </div>
                  <div>
                    <p className="text-lg font-black font-display tracking-tight">{t.aiAnalyze}</p>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Extract key data from your document automatically</p>
                  </div>
                  {activeFileIndex !== null && (
                    <button 
                      onClick={() => processOCR(activeFileIndex!)}
                      className="flex items-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/20 active:scale-95"
                    >
                      <Zap size={20} /> {t.aiAnalyze}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )}

  <NBRScriptModal
    isOpen={isScriptModalOpen}
    onClose={() => {
      setIsScriptModalOpen(false);
      setModalCustomData(null);
    }}
    initialData={modalCustomData || activeFile?.structuredData || {}}
    language={language}
  />
</div>
  );
}

function DataPoint({ label, value, icon }: { label: string, value?: string | number, icon: React.ReactNode }) {
  return (
    <div className="p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black text-zinc-900">{value || 'Not Found'}</p>
      </div>
    </div>
  );
}

function SocialConfigUI() {
  const [settings, setSettings] = useState<any>({
    facebook_access_token: '',
    facebook_page_id: '',
    linkedin_access_token: '',
    linkedin_person_id: '',
    twitter_bearer_token: '',
    tiktok_access_token: '',
    instagram_user_id: '',
    threads_access_token: '',
    auto_publish_on_gen: 'false'
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchLogs();
    fetchSchedules();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        setSettings((prev: any) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("fetchSettings error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/social/publish-logs');
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("fetchLogs error:", err);
      setLogs([]);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/social/schedules');
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        setSchedules(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("fetchSchedules error:", err);
      setSchedules([]);
    }
  };

  const deleteSchedule = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this scheduled post?")) return;
    try {
      await fetch(`/api/social/schedules/${id}`, { method: 'DELETE' });
      fetchSchedules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const verifyFacebook = async () => {
    try {
      const res = await fetch('/api/social/verify/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          facebook_page_id: settings.facebook_page_id,
          facebook_access_token: settings.facebook_access_token
        })
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (res.ok) {
          alert(`Verification Successful!\nConnected Page: ${data.name}\nType: ${data.tokenType}`);
        } else {
          alert(`Verification Failed: ${data.error || 'Unknown error'}`);
        }
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        alert(`Verification Failed: Server returned non-JSON response (Status: ${res.status}). Check console for details.`);
      }
    } catch (err) {
      console.error(err);
      alert('Verification Failed: ' + (err instanceof Error ? err.message : 'Unknown Error'));
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading settings...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Facebook Page ID</label>
              <input 
                type="text" 
                value={settings.facebook_page_id}
                onChange={e => setSettings({ ...settings, facebook_page_id: e.target.value })}
                placeholder="1234567890"
                className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Facebook Access Token</label>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value={settings.facebook_access_token}
                  onChange={e => setSettings({ ...settings, facebook_access_token: e.target.value })}
                  placeholder="EAAB..."
                  className="flex-1 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
                />
                <button 
                  type="button"
                  onClick={verifyFacebook}
                  className="px-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all border border-zinc-800 shadow-xl"
                >
                  Verify
                </button>
              </div>
            </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">LinkedIn Person ID (URN)</label>
            <input 
              type="text" 
              value={settings.linkedin_person_id}
              onChange={e => setSettings({ ...settings, linkedin_person_id: e.target.value })}
              placeholder="ABC_123"
              className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">LinkedIn Access Token</label>
            <input 
              type="password" 
              value={settings.linkedin_access_token}
              onChange={e => setSettings({ ...settings, linkedin_access_token: e.target.value })}
              placeholder="AQV..."
              className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Twitter (X) Bearer Token</label>
            <input 
              type="password" 
              value={settings.twitter_bearer_token}
              onChange={e => setSettings({ ...settings, twitter_bearer_token: e.target.value })}
              placeholder="AAAAAAAAAAAAAAAAAAAA..."
              className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">TikTok Access Token</label>
            <input 
              type="password" 
              value={settings.tiktok_access_token}
              onChange={e => setSettings({ ...settings, tiktok_access_token: e.target.value })}
              placeholder="act.XXXXXX..."
              className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Instagram User ID</label>
            <input 
              type="text" 
              value={settings.instagram_user_id}
              onChange={e => setSettings({ ...settings, instagram_user_id: e.target.value })}
              placeholder="178414..."
              className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Threads Access Token</label>
            <input 
              type="password" 
              value={settings.threads_access_token}
              onChange={e => setSettings({ ...settings, threads_access_token: e.target.value })}
              placeholder="TH..."
              className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
        
        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-900">Auto-publish on generation</p>
            <p className="text-[10px] text-zinc-400">Trigger social post immediately when AI generates notification</p>
          </div>
          <Toggle 
            label="" 
            checked={settings.auto_publish_on_gen === 'true'} 
            onChange={(checked) => setSettings({ ...settings, auto_publish_on_gen: checked ? 'true' : 'false' })} 
            compact
          />
        </div>

        <button 
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-zinc-900/20 active:scale-95 flex items-center justify-center gap-2"
        >
          {saving ? 'Saving...' : 'Save Social Configuration'}
        </button>
      </form>

      <div className="p-8 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 text-zinc-400 space-y-4">
        <h5 className="text-[10px] font-black text-brand-400 uppercase tracking-widest flex items-center gap-2">
          <Info size={14} />
          Configuration Guide
        </h5>
        <div className="space-y-4 text-[11px] leading-relaxed">
          <div className="flex gap-3">
            <span className="w-5 h-5 shrink-0 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center font-bold">1</span>
            <p>Access the <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-white underline">Graph API Explorer</a></p>
          </div>
          <div className="flex gap-3">
            <span className="w-5 h-5 shrink-0 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center font-bold">2</span>
            <p>Select your <strong>App</strong> and choose <strong>User Token</strong> (Recommended). Add scopes: <code className="text-zinc-200">pages_manage_posts</code>, <code className="text-zinc-200">pages_read_engagement</code>, <code className="text-zinc-200">pages_show_list</code>.</p>
          </div>
          <div className="flex gap-3">
            <span className="w-5 h-5 shrink-0 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center font-bold">3</span>
            <p>Paste the <strong>User Token</strong> here. The system will automatically exchange it for the correct Page Token when posting.</p>
          </div>
        </div>
      </div>
    </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} />
              Upcoming Schedules
            </h5>
            <button onClick={fetchSchedules} className="p-2 hover:bg-rose-50 rounded-lg transition-all"><RefreshCw size={14} className="text-rose-400" /></button>
          </div>
          <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {(schedules || []).map(item => (
              <div key={item.id} className="p-4 bg-rose-50/30 rounded-2xl border border-rose-100 space-y-2 group relative">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded text-[8px] font-black uppercase tracking-widest">
                    {item.platform}
                  </span>
                  <button 
                    onClick={() => deleteSchedule(item.id)}
                    className="p-1 text-rose-300 hover:text-rose-600 transition-colors"
                    title="Cancel Schedule"
                  >
                    <ShieldAlert size={14} />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-900 line-clamp-1 font-medium">{item.postContent}</p>
                {item.mediaUrl && (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-rose-100 bg-white">
                      {item.mediaUrl.endsWith('.mp4') || item.mediaUrl.endsWith('.webm') ? (
                        <Music2 size={16} className="m-auto text-rose-300 h-full w-full p-2" />
                      ) : (
                        <img src={item.mediaUrl} alt="Media" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="text-[8px] text-rose-400 truncate max-w-[150px]">{item.mediaUrl}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black text-rose-500 uppercase">Status: {item.status}</span>
                  <span className="text-[8px] font-black text-zinc-400 flex items-center gap-1">
                    <Calendar size={10} />
                    {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
            {(!schedules || schedules.length === 0) && <div className="text-center py-6 text-[10px] text-zinc-400 italic bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">No scheduled posts</div>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Recent Publishing Logs</h5>
            <button onClick={fetchLogs} className="p-2 hover:bg-zinc-100 rounded-lg transition-all"><RefreshCw size={14} className="text-zinc-400" /></button>
          </div>
          <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {(logs || []).map(log => (
            <div key={log.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                  log.platform === 'facebook' ? "bg-blue-100 text-blue-600" : 
                  log.platform === 'linkedin' ? "bg-indigo-100 text-indigo-600" :
                  log.platform === 'twitter' ? "bg-zinc-800 text-white" :
                  log.platform === 'instagram' ? "bg-pink-100 text-pink-600" :
                  log.platform === 'tiktok' ? "bg-zinc-900 text-white" :
                  "bg-zinc-100 text-zinc-600"
                )}>
                  {log.platform}
                </span>
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-widest",
                  log.status === 'success' ? "text-emerald-500" : "text-red-500"
                )}>
                  {log.status}
                </span>
              </div>
              <p className="text-[10px] text-zinc-600 line-clamp-2">{log.postContent}</p>
              {log.mediaUrl && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 bg-white">
                    {log.mediaUrl.endsWith('.mp4') || log.mediaUrl.endsWith('.webm') ? (
                      <Share2 size={12} className="m-auto text-zinc-300 h-full w-full p-1.5" />
                    ) : (
                      <img src={log.mediaUrl} alt="Media" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="text-[8px] text-zinc-400 truncate max-w-[120px]">{log.mediaUrl}</span>
                </div>
              )}
              {log.error && <p className="text-[8px] text-red-400 font-mono italic break-words">{log.error}</p>}
              <p className="text-[8px] text-zinc-400 flex items-center justify-end">{log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}</p>
            </div>
          ))}
          {(!logs || logs.length === 0) && <div className="text-center py-10 text-[10px] text-zinc-400 italic">No logs found</div>}
        </div>
      </div>
    </div>
  </div>
);
}

function DeveloperPanel({ notices, setNotices }: { notices: TaxNotice[], setNotices: (n: TaxNotice[]) => void }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [newNotice, setNewNotice] = useState({ title: '', link: '', category: 'General' });
  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthorized) {
      fetchCerts();
    }
  }, [isAuthorized]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be a server-side check
    if (password === 'vatx_admin_2026') {
      setIsAuthorized(true);
      setError('');
    } else {
      setError('Invalid developer credentials');
    }
  };

  const fetchCerts = async () => {
    try {
      const res = await fetch('/api/blockchain/certificates');
      const data = await res.json();
      setCerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setCerts([]);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-6 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Open Source Info */}
          <div className="neo-card p-12 rounded-[3.5rem] bg-zinc-900 text-white shadow-2xl shadow-zinc-900/20 border border-zinc-800 space-y-8 flex flex-col justify-center">
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-white shadow-xl">
              <Github size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black font-display tracking-tight">Open Source Project</h3>
              <p className="text-xs text-zinc-400 uppercase font-black tracking-widest mt-2">VATX.BD is committed to transparency</p>
            </div>
            <p className="text-sm text-zinc-400 font-medium leading-relaxed">
              Our core VAT and Tax calculation engines are open-source. We believe that tax automation should be transparent, auditable, and community-driven.
            </p>
            <div className="space-y-3">
              <a 
                href="https://github.com/vatxbd/erpnext" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <Database size={20} className="text-blue-400" />
                  <span className="text-sm font-bold">ERPNext Integration</span>
                </div>
                <ExternalLink size={18} className="text-zinc-500 group-hover:text-white transition-colors" />
              </a>
              <a 
                href="https://github.com/vatxbd/erpnext" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <Code size={20} className="text-emerald-400" />
                  <span className="text-sm font-bold">Tax Calculation Engine</span>
                </div>
                <ExternalLink size={18} className="text-zinc-500 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Admin Login */}
          <div className="neo-card p-12 rounded-[3.5rem] bg-white shadow-2xl shadow-zinc-200/50 border border-zinc-100 space-y-8 flex flex-col justify-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-xl shadow-zinc-900/20">
              <Lock size={32} />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black font-display tracking-tight">Admin Access</h3>
              <p className="text-xs text-zinc-400 uppercase font-black tracking-widest mt-2">Authorized Personnel Only</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  type="password" 
                  placeholder="Enter Admin Key" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all"
                />
              </div>
              {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{error}</p>}
              <button 
                type="submit"
                className="w-full bg-zinc-900 text-white p-5 rounded-2xl font-black hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 active:scale-95 flex items-center justify-center gap-2"
              >
                Verify Identity <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  const updateCertStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/blockchain/certificates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchCerts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addNotice = async () => {
    if (newNotice.title && newNotice.link) {
      try {
        const res = await fetch('/api/notices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newNotice)
        });
        if (res.ok) {
          const data = await res.json();
          setNotices([data, ...notices]);
          setNewNotice({ title: '', link: '', category: 'General' });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const removeNotice = async (id: number) => {
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotices(notices.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const publishToSocial = async (notice: TaxNotice, platform: string) => {
    try {
      const res = await fetch('/api/social/publish-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          content: `New Notice: ${notice.title} - ${notice.link} #VAT #Tax #NBR`,
          mediaUrl: notice.link.includes('.jpg') || notice.link.includes('.png') ? notice.link : undefined
        })
      });
      if (res.ok) {
        alert(`Published to ${platform}!`);
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="neo-card p-10 rounded-[3rem] bg-white shadow-xl shadow-zinc-200/50">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Shield size={24} />
            </div>
            Developer Control Panel
          </h3>
          <div className="px-4 py-1.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-zinc-100">Admin Only</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h4 className="text-lg font-black font-display flex items-center gap-2">
              <Bell size={20} className="text-brand-500" />
              Manage Tax Notices
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <input 
                  type="text" 
                  placeholder="Notice Title" 
                  value={newNotice.title}
                  onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all"
                />
                <input 
                  type="text" 
                  placeholder="Notice Link (URL)" 
                  value={newNotice.link}
                  onChange={e => setNewNotice({ ...newNotice, link: e.target.value })}
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all"
                />
                <select 
                  value={newNotice.category}
                  onChange={e => setNewNotice({ ...newNotice, category: e.target.value })}
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all"
                >
                  <option value="General">General</option>
                  <option value="VAT">VAT</option>
                  <option value="Income Tax">Income Tax</option>
                  <option value="Customs">Customs</option>
                </select>
                <button 
                  onClick={addNotice}
                  className="w-full bg-brand-500 text-white p-4 rounded-2xl font-black hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Add New Notice
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-black font-display flex items-center gap-2">
              <History size={20} className="text-brand-500" />
              Current Notices ({(notices || []).length})
            </h4>
            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {(notices || []).map(notice => (
                <div key={notice.id} className="flex items-center justify-between p-5 bg-zinc-50 rounded-3xl border border-zinc-100 group hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 transition-all">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">{notice.category}</span>
                    <p className="font-black text-sm text-zinc-900 line-clamp-1">{notice.title}</p>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={() => publishToSocial(notice, 'facebook')}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-[8px] font-black uppercase tracking-widest flex items-center gap-1"
                        title="Publish to Facebook"
                      >
                        <Facebook size={12} /> FB
                      </button>
                      <button 
                        onClick={() => publishToSocial(notice, 'linkedin')}
                        className="p-1.5 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-all text-[8px] font-black uppercase tracking-widest flex items-center gap-1"
                        title="Publish to LinkedIn"
                      >
                        <Linkedin size={12} /> LI
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeNotice(notice.id)} 
                    className="text-red-500 hover:bg-red-50 p-3 rounded-2xl transition-all active:scale-90"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              {(!notices || notices.length === 0) && (
                <div className="p-10 text-center text-zinc-400 italic text-sm">No notices available</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-12 border-t border-zinc-100">
          <h4 className="text-lg font-black font-display flex items-center gap-2 mb-8">
            <Share2 size={20} className="text-brand-500" />
            Social Media Automation Settings
          </h4>
          <SocialConfigUI />
        </div>

        <div className="mt-12 pt-12 border-t border-zinc-100">
          <h4 className="text-lg font-black font-display flex items-center gap-2 mb-8">
            <Layout size={20} className="text-brand-500" />
            Site Configuration
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Site Maintenance</p>
              <Toggle 
                label="Maintenance Mode" 
                checked={false} 
                onChange={() => {}} 
                description="Disable all user interactions"
                compact
              />
            </div>
            <div className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">AI Features</p>
              <Toggle 
                label="Enable AI Advisor" 
                checked={true} 
                onChange={() => {}} 
                description="Allow users to consult AI"
                compact
              />
            </div>
            <div className="p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Registration</p>
              <Toggle 
                label="New User Signups" 
                checked={true} 
                onChange={() => {}} 
                description="Allow new users to join"
                compact
              />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-12 border-t border-zinc-100">
          <h4 className="text-lg font-black font-display flex items-center gap-2 mb-8">
            <Cpu size={20} className="text-brand-500" />
            Tokenized Certificates Management
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  <th className="px-6 pb-2">Token ID</th>
                  <th className="px-6 pb-2">Owner Address</th>
                  <th className="px-6 pb-2">Type</th>
                  <th className="px-6 pb-2">Issue Date</th>
                  <th className="px-6 pb-2">Status</th>
                  <th className="px-6 pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(certs || []).map(cert => (
                  <tr key={cert.id} className="bg-zinc-50 hover:bg-zinc-100 transition-all group">
                    <td className="px-6 py-4 rounded-l-2xl border-y border-l border-zinc-100">
                      <span className="font-mono text-xs font-black text-zinc-900">{cert.tokenId}</span>
                    </td>
                    <td className="px-6 py-4 border-y border-zinc-100">
                      <span className="font-mono text-[10px] text-zinc-500">{cert.ownerAddress}</span>
                    </td>
                    <td className="px-6 py-4 border-y border-zinc-100">
                      <span className="px-2 py-1 bg-zinc-200 text-zinc-600 text-[8px] font-black uppercase tracking-widest rounded">{cert.certType}</span>
                    </td>
                    <td className="px-6 py-4 border-y border-zinc-100">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 border-y border-zinc-100">
                      <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                        cert.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 rounded-r-2xl border-y border-r border-zinc-100 text-right">
                      <button 
                        onClick={() => updateCertStatus(cert.id, cert.status === 'active' ? 'revoked' : 'active')}
                        className={`p-2 rounded-xl transition-all ${
                          cert.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'
                        }`}
                        title={cert.status === 'active' ? 'Revoke Certificate' : 'Reactivate Certificate'}
                      >
                        {cert.status === 'active' ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                      </button>
                    </td>
                  </tr>
                ))}
                {(!certs || certs.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 italic text-sm bg-zinc-50 rounded-2xl border border-zinc-100">
                      No tokenized certificates issued yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ vatHistory, taxHistory, t, notices, language }: { vatHistory: any[], taxHistory: any[], t: any, notices: any[], language: Language }) {
  const totalVat = vatHistory.reduce((sum, r) => sum + r.vatAmount, 0);
  const totalTax = taxHistory.reduce((sum, r) => sum + r.totalTaxLiability, 0);
  const [showFullMarkupHub, setShowFullMarkupHub] = useState(true);
  const [dashboardModalData, setDashboardModalData] = useState<any>(null);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const isBn = language === 'bn';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 md:space-y-12"
    >
      {/* Welcome Section */}
      <motion.section 
        variants={itemVariants}
        className="relative overflow-hidden rounded-[3rem] bg-zinc-900 p-8 md:p-12 text-white shadow-2xl shadow-zinc-900/20"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-6 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500/20 text-brand-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-500/20"
            >
              <ShieldCheck size={12} /> {t.verifiedCompliance}
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black font-display tracking-tight leading-[0.9]">
              {t.welcome}, <br />
              <span className="text-brand-400">Taxpayer</span>
            </h2>
            <p className="text-zinc-400 text-sm md:text-lg max-w-md leading-relaxed font-medium">
              {t.complianceScore} <span className="text-white font-black">98%</span>. {language === 'bn' ? `আপনার ${notices.length} ${t.pendingNotices} ${t.toReview}` : `You have ${notices.length} ${t.pendingNotices} ${t.toReview}`}.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <button 
                onClick={() => {
                  setShowFullMarkupHub(true);
                  const el = document.getElementById('dashboard-prominent-markup-hub');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-500/30 active:scale-95 flex items-center gap-2.5"
              >
                <FileCode size={18} />
                {isBn ? '★ মার্কআপ থেকে এনবিআর স্ক্রিপ্ট' : '★ NBR Script from Markup'}
              </button>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'vat' }))} 
                className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand-500/30 active:scale-95"
              >
                {t.newVat}
              </button>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'notices' }))} 
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-sm transition-all backdrop-blur-md border border-white/10 active:scale-95"
              >
                {t.viewNotices}
              </button>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-80 h-80 bg-brand-500/20 rounded-full blur-3xl absolute inset-0" 
            />
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                rotate: [12, 15, 12]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-56 h-56 bg-gradient-to-tr from-brand-500 to-emerald-400 rounded-[3.5rem] flex items-center justify-center shadow-2xl shadow-brand-500/40"
            >
              <ShieldCheck size={100} className="text-white -rotate-12 drop-shadow-2xl" />
            </motion.div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />
      </motion.section>

      {/* PROMINENT FEATURE HIGHLIGHT: NBR Script from Markup Text */}
      <motion.section
        id="dashboard-prominent-markup-hub"
        variants={itemVariants}
        className="relative rounded-[3rem] p-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-2xl shadow-emerald-500/15"
      >
        <div className="rounded-[2.85rem] bg-zinc-50/95 backdrop-blur-xl p-6 md:p-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-emerald-500/15 pb-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-600/25">
                  <Sparkles size={12} />
                  {isBn ? '★ প্রধান বৈশিষ্ট্য (ফ্ল্যাগশিপ)' : '★ Prominent Feature'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                  <FileCode size={12} />
                  Microsoft MarkItDown + Zero-Hallucination
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                  7-Column NBR Private Salary Ledger
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight text-zinc-900">
                {isBn
                  ? 'মার্কআপ টেক্সট থেকে এনবিআর স্ক্রিপ্ট জেনারেটর (সরাসরি ড্যাশবোর্ডে)'
                  : 'NBR Script from Markup Text — Flagship Automation'}
              </h3>
              <p className="text-xs md:text-sm text-zinc-600 max-w-3xl font-medium">
                {isBn
                  ? 'যেকোনো স্যালারি ট্যাক্স সার্টিফিকেট (PDF/Word/Image) বা মার্কডাউন টেবিল থেকে আসল চালান নম্বর, তারিখ এবং টিডিএস অংক এক্সট্র্যাক্ট করে ১-ক্লিকে এনবিআর প্রাইভেট স্যালারি লেজার ও টিআরএমএস পোর্টাল অটো-ফিল স্ক্রিপ্ট তৈরি করুন।'
                  : 'Paste any Markdown table, OCR markup text, or upload a Salary Tax Certificate (PDF/DOCX/XLSX/Image) to extract authentic Challan numbers, dates, and exact TDS amounts into a 1-click NBR Private Salary Ledger & TRMS browser script.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  setShowFullMarkupHub(true);
                  setTimeout(() => {
                    const el = document.getElementById('nbr-easy-bangla-guide');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <HelpCircle size={14} />
                <span>📖 সহজ বাংলা গাইড (নতুনদের জন্য)</span>
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'nbr-script-markup' }))}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-md active:scale-95"
              >
                <ExternalLink size={14} className="text-emerald-400" />
                {isBn ? 'ফুল-স্ক্রিন মোড' : 'Full-Screen Workspace'}
              </button>
              <button
                onClick={() => setShowFullMarkupHub(!showFullMarkupHub)}
                className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                {showFullMarkupHub ? (
                  <>
                    <ChevronUp size={15} />
                    {isBn ? 'সংক্ষিপ্ত করুন' : 'Minimize'}
                  </>
                ) : (
                  <>
                    <ChevronDown size={15} />
                    {isBn ? 'এখানেই ব্যবহার করুন' : 'Expand Workbench'}
                  </>
                )}
              </button>
            </div>
          </div>

          {showFullMarkupHub && (
            <NBRMarkupScriptHub
              language={language}
              onOpenModal={(data) => {
                setDashboardModalData(data);
                setIsDashboardModalOpen(true);
              }}
            />
          )}
        </div>

        <NBRScriptModal
          isOpen={isDashboardModalOpen}
          onClose={() => {
            setIsDashboardModalOpen(false);
            setDashboardModalData(null);
          }}
          initialData={dashboardModalData || {}}
          language={language}
        />
      </motion.section>

      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          icon={<Receipt size={28} />} 
          label={t.vatLiability} 
          value={`৳${totalVat.toLocaleString()}`} 
          trend="+12.5%" 
          color="bg-brand-500" 
          description={t.vatLiabilityDesc}
          delay={0.1}
        />
        <StatCard 
          icon={<Calculator size={28} />} 
          label={t.incomeTaxLabel} 
          value={`৳${totalTax.toLocaleString()}`} 
          trend="+5.2%" 
          color="bg-zinc-900" 
          description={t.incomeTaxDesc}
          delay={0.2}
        />
        <StatCard 
          icon={<TrendingUp size={28} />} 
          label={t.complianceScoreLabel} 
          value="98%" 
          trend="Perfect" 
          color="bg-emerald-600" 
          description={t.complianceDesc}
          delay={0.3}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants} className="neo-card p-10 rounded-[3rem] bg-white shadow-xl shadow-zinc-200/50">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                <BarChart3 size={24} />
              </div>
              {t.liabilityDistribution}
            </h3>
            <div className="px-4 py-1.5 bg-zinc-50 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-zinc-100">{t.realTime}</div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={[
                    { name: t.vat, value: totalVat || 1 },
                    { name: t.tax, value: totalTax || 1 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={130}
                  paddingAngle={12}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#18181b" />
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-12 mt-8">
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 rounded-full bg-brand-500 shadow-lg shadow-brand-500/30" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">VAT</span>
                <span className="text-lg font-black">৳{totalVat.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 rounded-full bg-zinc-900 shadow-lg shadow-zinc-900/30" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Income Tax</span>
                <span className="text-lg font-black">৳{totalTax.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="neo-card p-10 rounded-[3rem] bg-white shadow-xl shadow-zinc-200/50">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                <History size={24} />
              </div>
              Recent Activity
            </h3>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'history' }))} 
              className="text-xs text-brand-600 font-black hover:underline px-4 py-2 bg-brand-50 rounded-full transition-all active:scale-95"
            >
              View History
            </button>
          </div>
          <div className="space-y-4">
            {[...vatHistory, ...taxHistory]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-5 bg-zinc-50/50 border border-zinc-100 rounded-3xl group hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-sm",
                      item.vatAmount !== undefined ? "bg-brand-50 text-brand-600" : "bg-zinc-100 text-zinc-900"
                    )}>
                      {item.vatAmount !== undefined ? <Receipt size={24} /> : <Calculator size={24} />}
                    </div>
                    <div>
                      <p className="font-black text-sm text-zinc-900">{item.vatAmount !== undefined ? 'VAT Calculation' : 'Tax Calculation'}</p>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg text-zinc-900">৳{(item.vatAmount || item.totalTaxLiability).toLocaleString()}</p>
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Verified</p>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      </div>

      <motion.div 
        variants={itemVariants}
        className="neo-card p-10 rounded-[3rem] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 text-white relative overflow-hidden group shadow-2xl shadow-zinc-900/20"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/20 text-brand-400 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} className="animate-pulse" /> AI Powered Assistant
            </div>
            <h3 className="text-3xl md:text-4xl font-black font-display leading-tight tracking-tight">
              Stuck with complex <span className="text-brand-400 underline decoration-brand-400/30 underline-offset-8">Tax Laws?</span>
            </h3>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Our AI advisor is trained on the latest Bangladesh Tax Act 2023. Get instant, accurate answers to your VAT and Customs queries.
            </p>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'ai' }))}
              className="w-full md:w-auto px-10 py-5 bg-brand-500 text-white rounded-2xl font-black hover:bg-brand-600 transition-all flex items-center justify-center gap-3 group/btn shadow-xl shadow-brand-500/20 active:scale-95"
            >
              Consult AI Advisor <ArrowRight size={20} className="transition-transform group-hover/btn:translate-x-2" />
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative w-56 h-56 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 flex items-center justify-center shadow-2xl animate-float">
              <Bot size={100} className="text-brand-400" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full -mr-40 -mt-40 blur-3xl" />
      </motion.div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, trend, color, description, delay = 0 }: { icon: React.ReactNode, label: string, value: string, trend: string, color: string, description?: string, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="neo-card p-10 rounded-[3rem] relative overflow-hidden group transition-all duration-500 bg-white shadow-xl shadow-zinc-200/50 cursor-pointer"
    >
      <div className="flex justify-between items-start relative z-10">
        <motion.div 
          whileHover={{ rotate: 12, scale: 1.1 }}
          className={cn("w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500", color)}
        >
          {icon}
        </motion.div>
        <div className="flex flex-col items-end gap-2">
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className={cn(
              "text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm border",
              trend.startsWith('+') 
                ? "bg-red-50 text-red-600 border-red-100" 
                : trend === 'Perfect' 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-emerald-50 text-emerald-600 border-emerald-100"
            )}
          >
            {trend}
          </motion.span>
          <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">vs last month</span>
        </div>
      </div>
      <div className="mt-10 relative z-10">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <h4 className="text-4xl md:text-5xl font-black font-display tracking-tighter text-zinc-900 mb-3">{value}</h4>
        {description && <p className="text-xs text-zinc-400 font-medium leading-relaxed line-clamp-2">{description}</p>}
      </div>
      <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-zinc-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-1000 -z-0" />
    </motion.div>
  );
}

function VATCalculator({ onComplete, t, isGoogleAuthenticated, handleGoogleConnect }: { 
  onComplete: () => void, 
  t: any,
  isGoogleAuthenticated: boolean,
  handleGoogleConnect: () => void
}) {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('15');
  const [includeVAT, setIncludeVAT] = useState(false);
  const [isExport, setIsExport] = useState(false);
  const [isReverseCharge, setIsReverseCharge] = useState(false);
  const [otherCharges, setOtherCharges] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vat/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          rate: parseFloat(rate),
          includeVAT,
          isExport,
          isReverseCharge,
          otherCharges: parseFloat(otherCharges) || 0
        })
      });
      const data = await res.json();
      setResult(data);
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveCalculation = async () => {
    if (!result || !label.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/history/vat/${result.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label })
      });
      onComplete();
      setLabel('');
      alert('Calculation saved successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const saveToDrive = async () => {
    if (!isGoogleAuthenticated) {
      handleGoogleConnect();
      return;
    }

    setIsSavingToDrive(true);
    try {
      const content = `VAT Calculation Result
Date: ${new Date().toLocaleString()}
Label: ${label || 'Untitled'}
Base Amount: ${result.baseAmount}
VAT Rate: ${result.rate}%
VAT Amount: ${result.vatAmount}
Total Amount: ${result.totalAmount}
`;

      const res = await fetch('/api/drive/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          fileName: `VAT_Calculation_${Date.now()}.txt`,
          mimeType: 'text/plain'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`${t.saveSuccess} ${t.viewFile}: ${data.link}`);
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      console.error("Save to Drive failed", e);
      alert(t.saveFailed);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionGuide 
        title="ভ্যাট ক্যালকুলেটর গাইড"
        steps={[
          "পণ্যের নিট মূল্য (Net Amount) লিখুন।",
          "প্রযোজ্য ভ্যাট রেট (৫%, ৭.৫%, ১৫%, ২০%) নির্বাচন করুন।",
          "যদি দামের মধ্যে ভ্যাট অন্তর্ভুক্ত থাকে তবে 'Amount includes VAT' অপশনটি চালু করুন।",
          "এক্সপোর্ট বা রিভার্স চার্জ প্রযোজ্য হলে সংশ্লিষ্ট টগলটি অন করুন।",
          "অন্যান্য খরচ (শিপিং বা সার্ভিস চার্জ) থাকলে তা যোগ করুন।",
          "'Calculate VAT' বাটনে ক্লিক করে ফলাফল দেখুন এবং রেফারেন্স হিসেবে সেভ করুন।"
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="neo-card p-10 rounded-[3rem] space-y-10">
          <div>
            <h3 className="text-2xl font-black font-display tracking-tight mb-2">Input Details</h3>
            <p className="text-sm text-zinc-500 font-medium">Enter your transaction values below</p>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Base Amount (৳)</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-bold transition-colors group-focus-within:text-brand-600">৳</div>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-6 py-5 bg-zinc-50 border border-zinc-100 rounded-[2rem] focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none font-black text-xl transition-all placeholder:text-zinc-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">VAT Rate (%)</label>
              <div className="grid grid-cols-4 gap-4">
                {['5', '7.5', '15', '20'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRate(r)}
                    className={cn(
                      "py-4 rounded-2xl font-black transition-all border text-sm",
                      rate === r 
                        ? "bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-200 scale-[1.02]" 
                        : "bg-white text-zinc-500 border-zinc-100 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50/30"
                    )}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5 p-6 bg-zinc-50/50 rounded-[2rem] border border-zinc-100">
              <Toggle 
                label="Amount includes VAT" 
                checked={includeVAT} 
                onChange={setIncludeVAT} 
                description="Calculate VAT from total price"
              />
              <div className="h-px bg-zinc-100 w-full" />
              <div className="grid grid-cols-2 gap-6">
                <Toggle 
                  label="Export" 
                  checked={isExport} 
                  onChange={setIsExport} 
                  compact
                />
                <Toggle 
                  label="Reverse" 
                  checked={isReverseCharge} 
                  onChange={setIsReverseCharge} 
                  compact
                />
              </div>
            </div>

            <button 
              onClick={calculate}
              disabled={!amount || loading}
              className="w-full py-6 bg-brand-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <Calculator size={24} />}
              Calculate VAT
            </button>
          </div>
        </div>

      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neo-card p-10 rounded-[3rem] bg-zinc-900 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black font-display tracking-tight">Calculation Result</h3>
                  <div className="px-4 py-1.5 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand-500/20">Verified</div>
                </div>

                <div className="space-y-8">
                  <div className="flex justify-between items-center pb-6 border-b border-zinc-800">
                    <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Net Amount</span>
                    <span className="text-2xl font-black">৳{result.netAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-6 border-b border-zinc-800">
                    <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">VAT ({result.rate}%)</span>
                    <span className="text-2xl font-black text-brand-400">৳{result.vatAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-zinc-400 text-sm font-black uppercase tracking-[0.2em]">Total Amount</span>
                    <div className="text-right">
                      <span className="text-5xl font-black font-display text-white block">৳{result.totalAmount.toLocaleString()}</span>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Inclusive of all taxes</span>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-zinc-800 space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Save as Reference</label>
                    <div className="flex gap-3">
                      <input 
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="e.g. Office Supplies"
                        className="flex-1 px-6 py-5 bg-zinc-800 border border-zinc-700 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold transition-all text-sm text-white placeholder:text-zinc-600"
                      />
                      <button 
                        onClick={saveCalculation}
                        disabled={saving || !label.trim()}
                        className="w-16 h-16 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {saving ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={24} />}
                      </button>
                      <button 
                        onClick={saveToDrive}
                        disabled={isSavingToDrive || !result}
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-50",
                          isGoogleAuthenticated 
                            ? "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20" 
                            : "bg-zinc-700 hover:bg-zinc-800 text-white shadow-zinc-700/20"
                        )}
                        title={isGoogleAuthenticated ? t.saveToDrive : t.connectDrive}
                      >
                        {isSavingToDrive ? (
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Cloud size={24} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="neo-card p-10 rounded-[2.5rem] border-dashed border-2 border-zinc-200 flex flex-col items-center justify-center text-center py-32 bg-zinc-50/30">
              <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-300 mb-6">
                <Receipt size={40} />
              </div>
              <h3 className="text-xl font-bold text-zinc-400">No Calculation Yet</h3>
              <p className="text-sm text-zinc-400 mt-2 max-w-[200px]">Enter transaction details to see the breakdown</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
  );
}

function ResultRow({ label, value, highlight, large }: { label: string, value: number, highlight?: boolean, large?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn("text-sm", highlight ? "text-emerald-400 font-bold" : "text-gray-400")}>{label}</span>
      <span className={cn("font-mono", large ? "text-3xl font-bold" : "text-xl font-medium")}>
        ৳{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}

function TaxCalculator({ onComplete, t, isGoogleAuthenticated, handleGoogleConnect }: { 
  onComplete: () => void, 
  t: any,
  isGoogleAuthenticated: boolean,
  handleGoogleConnect: () => void
}) {
  const [income, setIncome] = useState('');
  const [entityType, setEntityType] = useState<'individual' | 'corporate'>('individual');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tax/income/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalIncome: parseFloat(income),
          entityType
        })
      });
      const data = await res.json();
      setResult(data);
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveCalculation = async () => {
    if (!result || !label.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/history/tax/${result.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label })
      });
      onComplete();
      setLabel('');
      alert('Calculation saved successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const saveToDrive = async () => {
    if (!isGoogleAuthenticated) {
      handleGoogleConnect();
      return;
    }

    setIsSavingToDrive(true);
    try {
      const content = `Income Tax Calculation Result
Date: ${new Date().toLocaleString()}
Label: ${label || 'Untitled'}
Total Income: ${result.totalIncome}
Taxable Income: ${result.taxableIncome}
Tax Liability: ${result.totalTaxLiability}
Effective Rate: ${result.effectiveRate}%
`;

      const res = await fetch('/api/drive/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          fileName: `Tax_Calculation_${Date.now()}.txt`,
          mimeType: 'text/plain'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`${t.saveSuccess} ${t.viewFile}: ${data.link}`);
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      console.error("Save to Drive failed", e);
      alert(t.saveFailed);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionGuide 
        title="ট্যাক্স ক্যালকুলেটর গাইড"
        steps={[
          "আপনার বার্ষিক আয়ের তথ্য (Salary, Business, etc.) লিখুন।",
          "আপনার বিনিয়োগ এবং খরচের তথ্য দিন যা ট্যাক্স রেয়াত পেতে সাহায্য করবে।",
          "'Calculate Tax' বাটনে ক্লিক করে আপনার মোট ট্যাক্স লায়াবিলিটি দেখুন।",
          "ফলাফলটি সেভ করে রাখুন ভবিষ্যতের রেফারেন্সের জন্য।"
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="neo-card p-10 rounded-[3rem] space-y-10">
          <div>
            <h3 className="text-2xl font-black font-display tracking-tight mb-2">Tax Parameters</h3>
            <p className="text-sm text-zinc-500 font-medium">Configure your income profile</p>
          </div>

          <div className="space-y-8">
            <div className="flex p-2 bg-zinc-100 rounded-[2rem]">
              <button 
                onClick={() => setEntityType('individual')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black transition-all text-sm",
                  entityType === 'individual' ? "bg-white shadow-xl text-brand-600 scale-[1.02]" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                <User size={20} /> Individual
              </button>
              <button 
                onClick={() => setEntityType('corporate')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black transition-all text-sm",
                  entityType === 'corporate' ? "bg-white shadow-xl text-blue-600 scale-[1.02]" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                <Building2 size={20} /> Corporate
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Annual Gross Income (৳)</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-bold transition-colors group-focus-within:text-brand-600">৳</div>
                <input 
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-6 py-5 bg-zinc-50 border border-zinc-100 rounded-[2rem] focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none font-black text-xl transition-all placeholder:text-zinc-300"
                />
              </div>
            </div>

            <div className="p-8 bg-brand-50/30 rounded-[2.5rem] border border-brand-100 flex gap-5">
              <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 shadow-lg shadow-brand-600/10 shrink-0">
                <FileText size={28} />
              </div>
              <div>
                <p className="text-base font-black text-brand-900">Tax Year 2024-25</p>
                <p className="text-xs text-brand-700/70 mt-1.5 leading-relaxed font-medium">Calculations follow the latest NBR directives for the current financial year.</p>
              </div>
            </div>

            <button 
              onClick={calculate}
              disabled={!income || loading}
              className="w-full py-6 bg-brand-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <Calculator size={24} />}
              Calculate Tax
            </button>
          </div>
        </div>

      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="neo-card p-10 rounded-[3rem] bg-zinc-900 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black font-display tracking-tight">Tax Liability</h3>
                  <div className="px-4 py-1.5 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand-500/20">FY 2024-25</div>
                </div>

                <div className="space-y-8">
                  <div className="flex justify-between items-center pb-6 border-b border-zinc-800">
                    <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Taxable Income</span>
                    <span className="text-2xl font-black">৳{result.taxableIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-6 border-b border-zinc-800">
                    <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Effective Rate</span>
                    <span className="text-2xl font-black text-brand-400">{result.effectiveRate}%</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-zinc-400 text-sm font-black uppercase tracking-[0.2em]">Total Payable</span>
                    <div className="text-right">
                      <span className="text-5xl font-black font-display text-white block">৳{result.totalTaxLiability.toLocaleString()}</span>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">NBR Compliant Calculation</span>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-10 border-t border-zinc-800 space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Save as Reference</label>
                    <div className="flex gap-3">
                      <input 
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="e.g. FY 2024 Final"
                        className="flex-1 px-6 py-5 bg-zinc-800 border border-zinc-700 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold transition-all text-sm text-white placeholder:text-zinc-600"
                      />
                      <button 
                        onClick={saveCalculation}
                        disabled={saving || !label.trim()}
                        className="w-16 h-16 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {saving ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={24} />}
                      </button>
                      <button 
                        onClick={saveToDrive}
                        disabled={isSavingToDrive || !result}
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-50",
                          isGoogleAuthenticated 
                            ? "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20" 
                            : "bg-zinc-700 hover:bg-zinc-800 text-white shadow-zinc-700/20"
                        )}
                        title={isGoogleAuthenticated ? t.saveToDrive : t.connectDrive}
                      >
                        {isSavingToDrive ? (
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Cloud size={24} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-wider font-medium">
                    * Estimate based on standard progressive slabs. Actual liability may vary based on investments and exemptions.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="neo-card p-10 rounded-[2.5rem] border-dashed border-2 border-zinc-200 flex flex-col items-center justify-center text-center py-32 bg-zinc-50/30">
              <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-300 mb-6">
                <Calculator size={40} />
              </div>
              <h3 className="text-xl font-bold text-zinc-400">No Calculation Yet</h3>
              <p className="text-sm text-zinc-400 mt-2 max-w-[200px]">Enter your annual income to see your tax liability</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
  );
}

function HistoryView({ vatHistory, taxHistory, t, isGoogleAuthenticated, handleGoogleConnect }: { 
  vatHistory: any[], 
  taxHistory: any[], 
  t: any,
  isGoogleAuthenticated: boolean,
  handleGoogleConnect: () => void
}) {
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterVatIncluded, setFilterVatIncluded] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);

  const saveToDrive = async () => {
    if (!isGoogleAuthenticated) {
      handleGoogleConnect();
      return;
    }

    setIsSavingToDrive(true);
    try {
      const csvContent = "Date,Label,Type,Base Amount,Liability,Status\n" + 
        filteredHistory.map(item => {
          const type = item.vatAmount !== undefined ? 'VAT' : 'Income Tax';
          const base = item.baseAmount || item.totalIncome;
          const liability = item.vatAmount || item.totalTaxLiability;
          return `${new Date(item.createdAt).toLocaleDateString()},${item.label || 'Untitled'},${type},${base},${liability},Calculated`;
        }).join("\n");

      const res = await fetch('/api/drive/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: csvContent,
          fileName: `Tax_History_${new Date().toISOString().split('T')[0]}.csv`,
          mimeType: 'text/csv'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`${t.saveSuccess} ${t.viewFile}: ${data.link}`);
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      console.error("Save to Drive failed", e);
      alert(t.saveFailed);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const categories = ['All', ...new Set(vatHistory.map(item => item.category).filter(Boolean))];

  const filteredHistory = [...vatHistory, ...taxHistory].filter(item => {
    // Category filter (only applies to VAT records)
    if (filterCategory !== 'All' && item.vatAmount !== undefined) {
      if (item.category !== filterCategory) return false;
    }

    // Date range filter
    if (filterDateStart) {
      if (new Date(item.createdAt) < new Date(filterDateStart)) return false;
    }
    if (filterDateEnd) {
      const endDate = new Date(filterDateEnd);
      endDate.setHours(23, 59, 59, 999);
      if (new Date(item.createdAt) > endDate) return false;
    }

    // VAT Included filter (only applies to VAT records)
    if (filterVatIncluded !== 'All' && item.vatAmount !== undefined) {
      const included = filterVatIncluded === 'Yes' ? 1 : 0;
      if (item.includeVAT !== included) return false;
    }

    return true;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      const valA = a.vatAmount !== undefined ? a.vatAmount : a.totalTaxLiability;
      const valB = b.vatAmount !== undefined ? b.vatAmount : b.totalTaxLiability;
      comparison = valA - valB;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#F3F4F6] overflow-hidden">
      <div className="p-8 border-b border-[#F3F4F6] flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Calculation History</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-4 py-2 border rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                showFilters ? "bg-brand-50 border-brand-200 text-brand-600" : "bg-[#F9FAFB] border-[#E5E7EB] hover:bg-white"
              )}
            >
              <Filter size={16} />
              Filter
            </button>
            <button className="px-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-bold hover:bg-white transition-all flex items-center gap-2">
              <Download size={16} />
              Export CSV
            </button>
            <button 
              onClick={saveToDrive}
              disabled={isSavingToDrive}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                isGoogleAuthenticated 
                  ? "bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100" 
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              )}
            >
              {isSavingToDrive ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Cloud size={16} />
              )}
              {isGoogleAuthenticated ? t.saveToDrive : t.connectDrive}
            </button>
          </div>
        </div>

        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-50"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Category</label>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date Range</label>
              <div className="flex items-center gap-2">
                <input 
                  type="date"
                  value={filterDateStart}
                  onChange={(e) => setFilterDateStart(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-zinc-400">-</span>
                <input 
                  type="date"
                  value={filterDateEnd}
                  onChange={(e) => setFilterDateEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">VAT Included</label>
              <select 
                value={filterVatIncluded}
                onChange={(e) => setFilterVatIncluded(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="All">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => {
                  setFilterCategory('All');
                  setFilterDateStart('');
                  setFilterDateEnd('');
                  setFilterVatIncluded('All');
                }}
                className="w-full px-4 py-2 text-zinc-500 text-sm font-bold hover:text-brand-600 transition-all"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F9FAFB] text-[#6B7280] text-xs font-bold uppercase tracking-wider">
              <th className="px-8 py-4 cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => toggleSort('date')}>
                <div className="flex items-center gap-2">
                  Date
                  {sortBy === 'date' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                </div>
              </th>
              <th className="px-8 py-4">Label</th>
              <th className="px-8 py-4">Type</th>
              <th className="px-8 py-4">Base Amount</th>
              <th className="px-8 py-4 cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => toggleSort('amount')}>
                <div className="flex items-center gap-2">
                  Liability
                  {sortBy === 'amount' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                </div>
              </th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {filteredHistory.map((item, i) => (
                <tr key={i} className="hover:bg-[#F9FAFB] transition-colors group">
                  <td className="px-8 py-5 text-sm font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-[#111827]">
                    {item.label || <span className="text-[#9CA3AF] font-normal italic">Untitled</span>}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.vatAmount !== undefined ? "bg-emerald-500" : "bg-blue-500"
                      )} />
                      <span className="text-sm font-bold">{item.vatAmount !== undefined ? 'VAT' : 'Income Tax'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-mono text-[#6B7280]">
                    ৳{(item.baseAmount || item.totalIncome).toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-sm font-bold">
                    ৳{(item.vatAmount || item.totalTaxLiability).toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase">
                      Calculated
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-[#6B7280] hover:text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HelpCenter({ setActiveTab }: { setActiveTab: (tab: Tab) => void }) {
  const [activeCategory, setActiveCategory] = useState<'guides' | 'faqs'>('guides');
  const [searchQuery, setSearchQuery] = useState('');

  const guides = [
    {
      title: "How to calculate VAT?",
      description: "Learn how to use our VAT calculator for both inclusive and exclusive amounts.",
      steps: [
        "Select the VAT Calculator from the sidebar.",
        "Enter the base amount of your transaction.",
        "Choose the applicable VAT rate (Standard 15%, or others).",
        "Toggle 'VAT Included' if the amount already contains VAT.",
        "Click 'Calculate' to see the breakdown and save to history."
      ]
    },
    {
      title: "Income Tax Assessment",
      description: "A step-by-step guide to estimating your personal income tax liability.",
      steps: [
        "Navigate to the Tax Calculator section.",
        "Enter your total annual income from all sources.",
        "Add any applicable deductions or investments for rebate.",
        "The system will apply the latest NBR tax slabs automatically.",
        "Review your tax liability and effective tax rate."
      ]
    },
    {
      title: "Using the AI Tax Advisor",
      description: "Get instant answers to complex tax questions using our Gemini-powered AI.",
      steps: [
        "Click on the 'AI Tax Advisor' tab.",
        "Type your question in natural language (English or Bangla).",
        "The AI will analyze current NBR regulations and provide a concise answer.",
        "You can ask follow-up questions for more detail."
      ]
    }
  ];

  const faqs = [
    {
      question: "What is the standard VAT rate in Bangladesh?",
      answer: "The standard VAT rate in Bangladesh is 15%. However, there are reduced rates of 5%, 7.5%, and 10% for specific goods and services as per the VAT Act 2012."
    },
    {
      question: "How is the Zakat nisab calculated?",
      answer: "The Zakat nisab is typically based on the value of 52.5 tolas (approx. 612.36 grams) of silver. Our Zakat calculator uses real-time or updated market prices to determine if you are eligible."
    },
    {
      question: "Can I export my calculation history?",
      answer: "Yes, you can export your VAT and Tax calculation history as a CSV file from the 'History' view for your accounting records."
    },
    {
      question: "Is my data secure?",
      answer: "We use industry-standard encryption and secure local storage for your calculations. We do not share your financial data with third parties."
    }
  ];

  const filteredGuides = guides.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="neo-card p-10 rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-emerald-700 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl font-black tracking-tighter">How can we help you?</h2>
          <p className="text-brand-100 max-w-xl">Search our knowledge base for guides, FAQs, and expert tax advice.</p>
          <div className="relative max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-300 group-focus-within:text-white transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search guides or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-brand-200 outline-none focus:ring-4 focus:ring-white/10 transition-all"
            />
          </div>
        </div>
        <AlertCircle className="absolute -right-10 -bottom-10 text-white/10 w-64 h-64 rotate-12" />
      </div>

      <div className="flex gap-4 border-b border-zinc-100 pb-px">
        <button 
          onClick={() => setActiveCategory('guides')}
          className={cn(
            "px-6 py-3 text-sm font-black uppercase tracking-widest transition-all relative",
            activeCategory === 'guides' ? "text-brand-600" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          User Guides
          {activeCategory === 'guides' && <motion.div layoutId="help-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveCategory('faqs')}
          className={cn(
            "px-6 py-3 text-sm font-black uppercase tracking-widest transition-all relative",
            activeCategory === 'faqs' ? "text-brand-600" : "text-zinc-400 hover:text-zinc-600"
          )}
        >
          FAQs
          {activeCategory === 'faqs' && <motion.div layoutId="help-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500 rounded-full" />}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeCategory === 'guides' ? (
          filteredGuides.map((guide, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="neo-card p-8 rounded-[2rem] space-y-6"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-zinc-900">{guide.title}</h3>
                  <p className="text-sm text-zinc-500">{guide.description}</p>
                </div>
                <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
                  <Book size={24} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guide.steps.map((step, si) => (
                  <div key={si} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                      {si + 1}
                    </span>
                    <p className="text-xs text-zinc-700 leading-relaxed font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFaqs.map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="neo-card p-8 rounded-[2rem] space-y-4"
              >
                <div className="flex items-center gap-3 text-brand-600">
                  <MessageSquare size={20} />
                  <h4 className="font-bold">Question</h4>
                </div>
                <p className="text-lg font-bold text-zinc-900 leading-tight">{faq.question}</p>
                <div className="pt-4 border-t border-zinc-50">
                  <p className="text-sm text-zinc-600 leading-relaxed">{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="neo-card p-8 rounded-[2rem] bg-zinc-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-xl font-bold">Still have questions?</h4>
          <p className="text-zinc-400 text-sm">Our support team is available 24/7 to help you with your tax queries.</p>
        </div>
        <button 
          onClick={() => setActiveTab('ai')}
          className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand-500/30 active:scale-95 flex items-center gap-2"
        >
          <Send size={18} />
          Contact Support
        </button>
      </div>
    </div>
  );
}

function TariffCalculator() {
  const [selectedYear, setSelectedYear] = useState('2025-26');
  const tariffUrls: Record<string, string> = {
    '2025-26': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrBZSeQ-YGYBGz66IrcqooOmJ9ErQdDRj3iYqbgRw4hNRvjurOctn7lC83w4LCRtKQdhxsoXhYSEWf/pub?gid=2081232822&single=true&output=csv',
    '2024-25': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrBZSeQ-YGYBGz66IrcqooOmJ9ErQdDRj3iYqbgRw4hNRvjurOctn7lC83w4LCRtKQdhxsoXhYSEWf/pub?gid=2081232822&single=true&output=csv', // Placeholder for other years
  };

  const [csvUrl, setCsvUrl] = useState(tariffUrls['2025-26']);
  const [tariffData, setTariffData] = useState<any[]>([]);
  const [status, setStatus] = useState<{ msg: string; type: 'info' | 'error' | 'success' | null }>({ msg: '', type: null });
  const [searchInput, setSearchInput] = useState('');
  const [assessableValue, setAssessableValue] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(120);
  const [cargoType, setCargoType] = useState<'Ship' | 'Air' | 'Land'>('Ship');
  const [incoterm, setIncoterm] = useState<'FOB' | 'CFR' | 'CIF' | 'CIP'>('FOB');
  const [fobValue, setFobValue] = useState('');
  const [freight, setFreight] = useState('');
  const [insurance, setInsurance] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExchangeRate();
  }, [currency]);

  const fetchExchangeRate = async () => {
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${currency}`);
      const data = await res.json();
      if (data && data.rates && data.rates.BDT) {
        setExchangeRate(data.rates.BDT);
      }
    } catch (err) {
      console.error("Failed to fetch exchange rate", err);
    }
  };

  useEffect(() => {
    loadTariffData();
  }, [csvUrl]);

  const loadTariffData = async () => {
    setLoading(true);
    setStatus({ msg: "Loading tariff data...", type: 'info' });
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error("Failed to load CSV. Ensure the link is public.");
      const csvText = await response.text();
      const parsedData = parseCSV(csvText);
      setTariffData(parsedData);
      setStatus({ msg: `Loaded ${parsedData.length} tariff entries for FY ${selectedYear} successfully!`, type: 'success' });
    } catch (err: any) {
      console.error(err);
      setStatus({ msg: "Error: " + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setCsvUrl(tariffUrls[year]);
  };

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data: any[] = [];

    const hsIndex = headers.indexOf('hs') !== -1 ? headers.indexOf('hs') :
                    headers.indexOf('hscode') !== -1 ? headers.indexOf('hscode') : -1;
    const descIndex = headers.findIndex(h => h.includes('desc') || h.includes('tarriff'));
    const cdIndex = headers.indexOf('cd');
    const sdIndex = headers.indexOf('sd');
    const vatIndex = headers.indexOf('vat');
    const aitIndex = headers.indexOf('ait');
    const rdIndex = headers.indexOf('rd');
    const atIndex = headers.indexOf('at');

    if (hsIndex === -1 || descIndex === -1) {
      throw new Error("CSV must contain 'hs' and 'desc' columns.");
    }

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
      if (row.length < Math.max(hsIndex, descIndex, cdIndex, sdIndex, vatIndex, aitIndex, rdIndex, atIndex) + 1) continue;

      const hs = (row[hsIndex] || '').replace(/"/g, '').trim();
      const desc = (row[descIndex] || '').replace(/"/g, '').trim();
      if (!hs || !desc) continue;

      data.push({
        hs,
        desc,
        cd: parseFloat(row[cdIndex]?.trim()) || 0,
        sd: parseFloat(row[sdIndex]?.trim()) || 0,
        vat: parseFloat(row[vatIndex]?.trim()) || 0,
        ait: parseFloat(row[aitIndex]?.trim()) || 0,
        rd: parseFloat(row[rdIndex]?.trim()) || 0,
        at: parseFloat(row[atIndex]?.trim()) || 0
      });
    }
    return data;
  };

  const calculate = () => {
    const input = searchInput.trim().toLowerCase();
    
    let avBDT = 0;
    const fob = parseFloat(fobValue) || 0;
    const fr = parseFloat(freight) || 0;
    const ins = parseFloat(insurance) || 0;

    if (incoterm === 'FOB') {
      avBDT = (fob + fr + ins) * exchangeRate;
    } else if (incoterm === 'CFR') {
      avBDT = (fob + ins) * exchangeRate;
    } else if (incoterm === 'CIF' || incoterm === 'CIP') {
      avBDT = fob * exchangeRate;
    }

    // Fallback to direct assessable value if provided and others are not
    if (avBDT === 0 && assessableValue) {
      avBDT = parseFloat(assessableValue);
    }

    if (!input) {
      alert("Please enter HS Code or Tariff Description.");
      return;
    }
    if (avBDT <= 0) {
      alert("Please enter valid values to calculate Assessable Value.");
      return;
    }

    let item = null;
    const cleanInput = input.replace(/\s/g, '');

    if (/^\d+$/.test(cleanInput)) {
      item = tariffData.find(d => d.hs.replace(/\s/g, '') === cleanInput);
    }

    if (!item) {
      item = tariffData.find(d =>
        d.desc.toLowerCase().includes(input) ||
        input.includes(d.hs.toLowerCase())
      );
    }

    if (!item) {
      setResult({ error: "No matching tariff found." });
      return;
    }

    const cdRate = item.cd || 0;
    const sdVal = item.sd || 0;
    const vatRate = item.vat || 0;
    const aitRate = item.ait || 0;
    const rdRate = item.rd || 0;
    const atRate = item.at || 0;

    const cdAmount = (cdRate / 100) * avBDT;
    const sdAmount = (sdVal > 100) ? sdVal : (sdVal / 100) * avBDT;
    const customsValue = avBDT + cdAmount + sdAmount;
    const vatAmount = (vatRate / 100) * customsValue;
    const aitAmount = (aitRate / 100) * customsValue;
    const rdAmount = (rdRate / 100) * customsValue;
    const atAmount = (atRate / 100) * customsValue;

    const totalTax = cdAmount + sdAmount + vatAmount + aitAmount + rdAmount + atAmount;
    const totalPayable = avBDT + totalTax;

    setResult({
      ...item,
      cdAmount,
      sdAmount,
      vatAmount,
      aitAmount,
      rdAmount,
      atAmount,
      totalTax,
      totalPayable,
      av: avBDT,
      currency,
      exchangeRate,
      incoterm,
      cargoType
    });
  };

  return (
    <div className="space-y-8">
      <SectionGuide 
        title="ট্যারিফ ক্যালকুলেটর গাইড"
        steps={[
          "পণ্যের এইচএস কোড (HS Code) লিখুন।",
          "পণ্যের মূল্য এবং কারেন্সি নির্বাচন করুন।",
          "সিস্টেম স্বয়ংক্রিয়ভাবে সিডি (CD), আরডি (RD), এসডি (SD), ভ্যাট (VAT) ইত্যাদি হিসাব করবে।",
          "আমদানির ক্ষেত্রে মোট শুল্কের পরিমাণ এক নজরে দেখে নিন।"
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3F4F6] space-y-6">
        <h3 className="text-xl font-bold mb-4">Tariff Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#374151] mb-2">Financial Year</label>
            <div className="flex gap-2">
              <select 
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none text-sm appearance-none"
              >
                <option value="2025-26">FY 2025-26 (Current)</option>
                <option value="2024-25">FY 2024-25</option>
              </select>
              <button 
                onClick={loadTariffData}
                disabled={loading}
                className="px-6 py-3 bg-[#10B981] text-white rounded-2xl font-bold text-sm hover:bg-[#059669] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <History size={16} />}
                {loading ? 'Syncing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {status.msg && (
            <div className={cn(
              "p-4 rounded-2xl flex items-center gap-3 text-sm font-medium",
              status.type === 'error' ? "bg-red-50 text-red-600 border border-red-100" : 
              status.type === 'success' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
              "bg-blue-50 text-blue-600 border border-blue-100"
            )}>
              {status.type === 'error' ? <AlertCircle size={18} /> : 
               status.type === 'success' ? <CheckCircle2 size={18} /> : <FileText size={18} />}
              {status.msg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-2">Currency</label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none text-sm appearance-none"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CNY">CNY - Chinese Yuan</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-2">Exchange Rate (BDT)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">৳</div>
                  <input 
                    type="number" 
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none font-medium text-sm"
                  />
                </div>
                <button 
                  onClick={fetchExchangeRate}
                  className="p-3 bg-zinc-100 hover:bg-zinc-200 rounded-2xl transition-all"
                  title="Refresh Rate"
                >
                  <Zap size={16} className="text-brand-600" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-2">Cargo Type</label>
              <select 
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value as any)}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none text-sm appearance-none"
              >
                <option value="Ship">🚢 Ship (Sea)</option>
                <option value="Air">✈️ Air</option>
                <option value="Land">🚛 Land (Road/Rail)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-2">Incoterm</label>
              <select 
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value as any)}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none text-sm appearance-none"
              >
                <option value="FOB">FOB - Free On Board</option>
                <option value="CFR">CFR - Cost and Freight</option>
                <option value="CIF">CIF - Cost, Insurance, Freight</option>
                <option value="CIP">CIP - Carriage & Insurance Paid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-2">Value ({incoterm})</label>
              <input 
                type="number" 
                value={fobValue}
                onChange={(e) => setFobValue(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none font-medium text-sm"
                placeholder="0.00"
              />
            </div>
            {incoterm === 'FOB' && (
              <div>
                <label className="block text-sm font-bold text-[#374151] mb-2">Freight</label>
                <input 
                  type="number" 
                  value={freight}
                  onChange={(e) => setFreight(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none font-medium text-sm"
                  placeholder="0.00"
                />
              </div>
            )}
            {(incoterm === 'FOB' || incoterm === 'CFR') && (
              <div>
                <label className="block text-sm font-bold text-[#374151] mb-2">Insurance</label>
                <input 
                  type="number" 
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none font-medium text-sm"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          <div className="h-px bg-[#F3F4F6] my-6" />

          <div>
            <label className="block text-sm font-bold text-[#374151] mb-2">Search HS Code or Description</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                disabled={tariffData.length === 0}
                className="w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none font-medium disabled:opacity-50"
                placeholder="e.g., 48119021 or Paper"
              />
            </div>
          </div>

          <div className="h-px bg-[#F3F4F6] my-6" />

          <div>
            <label className="block text-sm font-bold text-[#374151] mb-2">Manual Assessable Value (BDT) - Optional</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">৳</div>
              <input 
                type="number" 
                value={assessableValue}
                onChange={(e) => setAssessableValue(e.target.value)}
                disabled={tariffData.length === 0}
                className="w-full pl-10 pr-4 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none font-medium disabled:opacity-50 text-sm"
                placeholder="Overwrites FOB calculation if provided"
              />
            </div>
          </div>

          <button 
            onClick={calculate}
            disabled={tariffData.length === 0 || !searchInput || (fobValue === '' && assessableValue === '')}
            className="w-full py-4 bg-[#10B981] text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-[#059669] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Calculator size={20} /> Calculate Duties
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {result ? (
          result.error ? (
            <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h4 className="font-bold text-red-900">No Match Found</h4>
              <p className="text-sm text-red-700 mt-2">We couldn't find a tariff entry matching your search.</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#111827] text-white p-8 rounded-3xl shadow-xl space-y-6"
            >
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-lg font-bold text-emerald-400 mb-1">HS Code: {result.hs}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">{result.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider">
                    {result.cargoType}
                  </span>
                  <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider">
                    {result.incoterm}
                  </span>
                  <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider">
                    1 {result.currency} = {result.exchangeRate.toFixed(2)} BDT
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <TariffRow label={`CD (${result.cd}%)`} value={result.cdAmount} />
                <TariffRow label={`SD (${result.sd > 100 ? 'Fixed' : result.sd + '%'})`} value={result.sdAmount} />
                <TariffRow label={`VAT (${result.vat}%)`} value={result.vatAmount} />
                <TariffRow label={`AIT (${result.ait}%)`} value={result.aitAmount} />
                <TariffRow label={`RD (${result.rd}%)`} value={result.rdAmount} />
                <TariffRow label={`AT (${result.at}%)`} value={result.atAmount} />
                
                <div className="h-px bg-white/10 my-4" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-400 font-bold">Total Duties</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">৳{result.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Payable</span>
                  <span className="text-xl font-medium font-mono">৳{result.totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all text-sm">
                  <Download size={16} /> Export
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-all text-sm">
                  <Plus size={16} /> Save Record
                </button>
              </div>
            </motion.div>
          )
        ) : (
          <div className="h-full bg-white border-2 border-dashed border-[#E5E7EB] rounded-3xl flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
              <Ship size={32} />
            </div>
            <h4 className="font-bold text-[#374151]">Ready to Calculate</h4>
            <p className="text-sm text-[#6B7280] mt-2 max-w-[200px]">Load tariff data and enter HS code to see duty breakdown.</p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}

function TariffRow({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-mono">৳{value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
    </div>
  );
}

function BlogView() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Tax News' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      if (res.ok) {
        setNewPost({ title: '', content: '', category: 'Tax News' });
        setShowForm(false);
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { title: "আয়কর আইন ২০২৩", link: "http://bdlaws.minlaw.gov.bd/act-details-1429.html", icon: <Book className="text-blue-500" /> },
          { title: "আয়কর নির্দেশিকা ২০২৫-২৬", link: "#", icon: <FileText className="text-emerald-500" /> },
          { title: "আয়কর পরিপত্র ২০২৫-২৬", link: "#", icon: <Shield className="text-purple-500" /> }
        ].map((res, i) => (
          <a key={i} href={res.link} target="_blank" rel="noopener noreferrer" className="neo-card p-6 rounded-3xl flex items-center gap-4 hover:scale-[1.02] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center">
              {res.icon}
            </div>
            <div>
              <h4 className="font-bold text-sm">{res.title}</h4>
              <p className="text-[10px] text-zinc-500">অফিসিয়াল রিসোর্স দেখুন</p>
            </div>
          </a>
        ))}
      </div>

      <div className="neo-card p-10 rounded-[2.5rem] bg-zinc-900 text-white mb-12">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="text-brand-400" />
          ২০২৫-২৬ কর বছরের মূল পরিবর্তনসমূহ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-sm font-bold text-brand-400 mb-2">করমুক্ত আয়ের সীমা বৃদ্ধি</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">সাধারণ করদাতাদের জন্য করমুক্ত সীমা ৩,৫০,০০০ টাকা থেকে বাড়িয়ে ৩,৭৫,০০০ টাকা করা হয়েছে। নারী ও ৬৫+ বয়স্কদের জন্য ৪,২৫,০০০ টাকা।</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-sm font-bold text-brand-400 mb-2">বিনিয়োগ রেয়াত (Rebate)</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">বিনিয়োগের ওপর ১৫% রেয়াত পাওয়া যাবে, তবে তা মোট আয়ের ৩% বা প্রকৃত বিনিয়োগের ১৫% বা ১০ লক্ষ টাকার মধ্যে যেটি কম তার সমান হবে।</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-sm font-bold text-brand-400 mb-2">সারচার্জ (Surcharge)</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">নিট সম্পদ ৪ কোটি টাকা অতিক্রম করলে ১০% সারচার্জ প্রযোজ্য হবে। সম্পদ ৫০ কোটি টাকার বেশি হলে ৩৫% পর্যন্ত সারচার্জ হতে পারে।</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-sm font-bold text-brand-400 mb-2">ন্যূনতম কর (Minimum Tax)</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">ঢাকা ও চট্টগ্রাম সিটি কর্পোরেশন এলাকার জন্য ৫,০০০ টাকা, অন্যান্য সিটি কর্পোরেশনের জন্য ৪,০০০ টাকা এবং এর বাইরে ৩,০০০ টাকা।</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Latest Updates & Blogs</h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-[#10B981] text-white rounded-2xl font-bold shadow-lg hover:bg-[#059669] transition-all flex items-center gap-2"
        >
          <Plus size={20} /> {showForm ? 'Cancel' : 'New Post'}
        </button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3F4F6]"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-2">Title</label>
              <input 
                type="text" 
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-2">Category</label>
              <select 
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none"
              >
                <option>Tax News</option>
                <option>VAT Updates</option>
                <option>Compliance Tips</option>
                <option>Regulatory Changes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-2">Content</label>
              <textarea 
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none min-h-[150px]"
                required
              />
            </div>
            <button type="submit" className="w-full py-4 bg-[#10B981] text-white rounded-2xl font-bold shadow-lg hover:bg-[#059669] transition-all">
              Publish Post
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <motion.div 
            key={post.id}
            layout
            className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3F4F6] hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase">
                {post.category}
              </span>
              <span className="text-xs text-[#6B7280]">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h4 className="text-xl font-bold mb-4">{post.title}</h4>
            <p className="text-[#6B7280] text-sm leading-relaxed mb-6 line-clamp-3">
              {post.content}
            </p>
            <div className="flex items-center justify-between pt-6 border-t border-[#F3F4F6]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-[#10B981]">
                  {post.author[0]}
                </div>
                <span className="text-xs font-bold text-[#374151]">{post.author}</span>
              </div>
              <button className="text-[#10B981] text-sm font-bold flex items-center gap-1 hover:underline">
                Read More <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ToolsView({ setActiveTab }: { setActiveTab: (tab: Tab) => void }) {
  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold">Additional Compliance Tools</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ToolCard 
          icon={<ArrowRightLeft size={24} />}
          title="Currency Converter"
          description="Real-time exchange rates for international transactions."
          color="emerald"
        />
        <ToolCard 
          icon={<FileText size={24} />}
          title="Tax Calendar"
          description="Never miss a deadline with our automated tax alerts."
          color="blue"
        />
        <ToolCard 
          icon={<Building2 size={24} />}
          title="Company Search"
          description="Verify BIN and TIN numbers of business partners."
          color="purple"
        />
        <ToolCard 
          icon={<ShieldCheck size={24} />}
          title="Audit Assistant"
          description="Prepare for tax audits with our automated checklist."
          color="orange"
        />
        <ToolCard 
          icon={<Receipt size={24} />}
          title="Invoice Generator"
          description="Create VAT-compliant invoices for your customers."
          color="pink"
          onClick={() => setActiveTab('invoice')}
        />
        <ToolCard 
          icon={<Heart size={24} />}
          title="Donation Centre"
          description="Support foundations like Mastul and Assunnah with secure payments."
          color="red"
          onClick={() => setActiveTab('donation')}
        />
        <ToolCard 
          icon={<TrendingUp size={24} />}
          title="Profit Estimator"
          description="Calculate net profit after all tax deductions."
          color="indigo"
        />
      </div>
    </div>
  );
}

function ToolCard({ icon, title, description, color, onClick }: { icon: React.ReactNode, title: string, description: string, color: string, onClick?: () => void }) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    pink: "bg-pink-50 text-pink-600 border-pink-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    red: "bg-red-50 text-red-600 border-red-100"
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3F4F6] hover:shadow-md transition-all group cursor-pointer"
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border transition-transform group-hover:scale-110", colors[color])}>
        {icon}
      </div>
      <h4 className="text-lg font-bold mb-2">{title}</h4>
      <p className="text-sm text-[#6B7280] leading-relaxed">{description}</p>
      <div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#10B981] opacity-0 group-hover:opacity-100 transition-all">
        Launch Tool <ChevronRight size={16} />
      </div>
    </div>
  );
}

function AIErrorDisplay({ onRetry, error, className }: { onRetry: () => void, error?: string, className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center p-10 text-center gap-6 bg-red-50/30 rounded-[3rem] border border-red-100/50 backdrop-blur-sm",
        className
      )}
    >
      <div className="w-20 h-20 bg-red-100 rounded-[2rem] flex items-center justify-center text-red-600 shadow-xl shadow-red-200/40 relative">
        <ShieldAlert size={40} />
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
        </div>
      </div>
      <div className="space-y-3 max-w-sm">
        <h4 className="text-xl font-black font-display tracking-tight text-red-900">Connection Interrupted</h4>
        <p className="text-xs text-red-600/70 font-bold leading-relaxed uppercase tracking-wider">
          {error || "We encountered a temporary issue connecting to the AI engine. This could be due to network instability or service maintenance."}
        </p>
      </div>
      <button 
        onClick={onRetry}
        className="group flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95"
      >
        <Zap size={16} className="group-hover:animate-pulse" /> Try Reconnecting
      </button>
    </motion.div>
  );
}

function AIAssistant() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; isError?: boolean }[]>(() => {
    const saved = localStorage.getItem('vatx_ai_chat');
    return saved ? JSON.parse(saved) : [
      { role: 'ai', text: "Hello! I'm your dedicated AI Tax Advisor. I can provide concise, actionable answers about Bangladesh's tax laws, VAT regulations, and customs duties. How can I help you today?" }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('vatx_ai_chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, error]);

  const exportChat = () => {
    const content = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VATX_AI_Consultation_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSend = async (customMessage?: string) => {
    const userMessage = customMessage || input.trim();
    if (!userMessage || loading) return;

    if (!customMessage) setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const chatRes = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          systemInstruction: `You are an expert Tax, VAT, and Customs consultant for Bangladesh. 
          Your goal is to provide concise, actionable, and accurate information based on the National Board of Revenue (NBR) regulations, the Income Tax Act 2023, and the Value Added Tax and Supplementary Duty Act, 2012 (with latest amendments including Finance Act 2024).
          
          Key VAT Law Context (Bangladesh):
          - Primary Law: Value Added Tax and Supplementary Duty Act, 2012.
          - Standard VAT Rate: 15%.
          - Reduced Rates: 5%, 7.5%, 10% for specific goods/services.
          - Registration Threshold: Annual turnover exceeding 3 Crore BDT.
          - Enlistment Threshold: Annual turnover between 50 Lakh and 3 Crore BDT (Turnover Tax at 4%).
          - VDS (VAT Deducted at Source): Applicable to specific services and government/semi-government entities.
          - Mushak 9.1: The mandatory monthly VAT return form.
          - EFD/SDC: Electronic Fiscal Devices are mandatory for specific retail and service sectors.
          
          Guidelines:
          - Be professional and direct.
          - Use bullet points for clarity when explaining regulations.
          - If a query is about VAT, mention relevant SROs if applicable.
          - If a query is about Customs, mention HS code importance.
          - Always include a disclaimer that for complex legal matters, users should consult a certified professional.
          - Keep answers concise but comprehensive enough to be actionable.`
        })
      });

      if (!chatRes.ok) throw new Error(`HTTP ${chatRes.status}`);
      const chatData = await chatRes.json();
      const aiText = chatData.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (err) {
      console.error(err);
      setError("I'm having trouble connecting to my knowledge base. Please check your connection or try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickQueries = [
    { label: "Tax Slabs 2025", query: "What are the current income tax slabs for individuals in Bangladesh for FY 2025-26?" },
    { label: "VAT Law 2024", query: "What are the key changes in the Finance Act 2024 regarding VAT in Bangladesh?" },
    { label: "VAT on Software", query: "What is the VAT rate for software development and IT enabled services in Bangladesh?" },
    { label: "Customs Duty", query: "How is customs duty calculated for imported electronics in Bangladesh?" },
    { label: "Tax Rebate", query: "What are the rules for investment tax rebate in Bangladesh according to the 2023 Act?" }
  ];

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-180px)] flex flex-col gap-6">
      <div className="flex-1 flex flex-col bg-white md:rounded-[3rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden relative">
        {/* Chat Header */}
        <div className="p-6 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-brand-600 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
              <Bot size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black font-display tracking-tight">Tax Advisor AI</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Now</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={exportChat}
              className="p-3 text-zinc-400 hover:text-brand-600 hover:bg-brand-50 rounded-2xl transition-all"
              title="Export Conversation"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('vatx_ai_chat');
                setMessages([{ role: 'ai', text: "Chat history cleared. How can I assist you now?" }]);
              }}
              className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
              title="Clear Chat"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar bg-zinc-50/30"
        >
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-4 max-w-[85%] md:max-w-[75%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                msg.role === 'ai' ? "bg-white text-brand-600 border border-zinc-100" : "bg-brand-600 text-white"
              )}>
                {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className={cn(
                "p-5 rounded-[2rem] text-sm leading-relaxed shadow-sm relative group/msg",
                msg.role === 'ai' 
                  ? "bg-white text-zinc-800 border border-zinc-100 rounded-tl-none" 
                  : "bg-brand-600 text-white rounded-tr-none shadow-brand-600/20"
              )}>
                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-li:my-1 prose-headings:font-black">
                  <Markdown>{msg.text}</Markdown>
                </div>
                {msg.role === 'ai' && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(msg.text);
                    }}
                    className="absolute top-2 right-2 p-2 bg-zinc-50 rounded-xl opacity-0 group-hover/msg:opacity-100 transition-all hover:bg-zinc-100 shadow-sm"
                    title="Copy to Clipboard"
                  >
                    <Copy size={14} className="text-zinc-500" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          
          {error && (
            <AIErrorDisplay 
              error={error} 
              onRetry={() => handleSend(messages[messages.length - 1]?.text)} 
              className="my-4"
            />
          )}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-brand-600 shadow-sm">
                <Bot size={20} />
              </div>
              <div className="bg-white p-5 rounded-[2rem] rounded-tl-none border border-zinc-100 shadow-sm flex gap-1.5">
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Chat Input Area */}
        <div className="p-6 md:p-8 bg-white border-t border-zinc-100">
          <div className="flex flex-wrap gap-2 mb-6">
            {quickQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.query)}
                className="px-4 py-2 bg-zinc-50 hover:bg-brand-50 hover:text-brand-700 border border-zinc-100 hover:border-brand-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                {q.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about tax, VAT, or customs..."
              className="flex-1 pl-6 pr-16 py-5 bg-zinc-50 border border-zinc-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 bottom-2 w-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center hover:bg-brand-700 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-brand-600/20 active:scale-90"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 text-center mt-4 font-bold uppercase tracking-widest">
            Verify critical info with official NBR gazettes.
          </p>
        </div>
      </div>
    </div>
  );
}

const PRODUCT_CATEGORIES = [
  { name: 'Standard Goods/Services', rate: 15 },
  { name: 'IT Enabled Services', rate: 5 },
  { name: 'Construction Services', rate: 7.5 },
  { name: 'Essential Commodities', rate: 0 },
  { name: 'Export Items', rate: 0 },
  { name: 'Other (Manual)', rate: 15 }
];

function Mushak63View({ invoice, onClose }: { invoice: any, onClose: () => void }) {
  const subtotal = invoice.items.reduce((sum: number, item: any) => sum + (item.qty * item.price), 0);
  const totalVat = invoice.items.reduce((sum: number, item: any) => sum + (item.qty * item.price * (item.vatRate / 100)), 0);
  const total = subtotal + totalVat;

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-[2.5rem] shadow-2xl max-w-4xl w-full relative print:p-0 print:shadow-none print:rounded-none"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-all print:hidden"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold uppercase">Government of the People's Republic of Bangladesh</h2>
          <h3 className="text-lg font-bold uppercase">National Board of Revenue</h3>
          <div className="mt-2 inline-block border-2 border-black px-4 py-1 font-black text-xl uppercase">Mushak - 6.3</div>
          <p className="mt-1 font-bold">[See Clauses (C) and (F) of Sub-rule (1) of Rule 40]</p>
          <h4 className="mt-2 text-xl font-black uppercase">Tax Invoice</h4>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 border-b-2 border-black pb-8">
          <div className="space-y-2">
            <p><span className="font-bold">Name of Registered Person:</span> {invoice.seller.name}</p>
            <p><span className="font-bold">BIN of Registered Person:</span> {invoice.seller.bin}</p>
            <p><span className="font-bold">Address:</span> {invoice.seller.address}</p>
          </div>
          <div className="space-y-2 text-right">
            <p><span className="font-bold">Invoice No:</span> {invoice.number}</p>
            <p><span className="font-bold">Date of Issue:</span> {invoice.date}</p>
            <p><span className="font-bold">Time of Issue:</span> {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="mb-8 border-b-2 border-black pb-8">
          <p><span className="font-bold">Name of Purchaser:</span> {invoice.buyer.name}</p>
          <p><span className="font-bold">BIN of Purchaser:</span> {invoice.buyer.bin}</p>
          <p><span className="font-bold">Address of Destination:</span> {invoice.buyer.address}</p>
        </div>

        <table className="w-full border-collapse border-2 border-black mb-8 text-sm">
          <thead>
            <tr className="bg-zinc-50">
              <th className="border-2 border-black p-2">SL</th>
              <th className="border-2 border-black p-2">Description of Goods/Services</th>
              <th className="border-2 border-black p-2">Unit</th>
              <th className="border-2 border-black p-2">Qty</th>
              <th className="border-2 border-black p-2">Unit Value (৳)</th>
              <th className="border-2 border-black p-2">Total Value (৳)</th>
              <th className="border-2 border-black p-2">SD Rate (%)</th>
              <th className="border-2 border-black p-2">SD Amount (৳)</th>
              <th className="border-2 border-black p-2">VAT Rate (%)</th>
              <th className="border-2 border-black p-2">VAT Amount (৳)</th>
              <th className="border-2 border-black p-2">Total (৳)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: any, i: number) => {
              const itemTotal = item.qty * item.price;
              const itemVat = itemTotal * (item.vatRate / 100);
              return (
                <tr key={item.id}>
                  <td className="border-2 border-black p-2 text-center">{i + 1}</td>
                  <td className="border-2 border-black p-2">{item.desc}</td>
                  <td className="border-2 border-black p-2 text-center">Pcs/Unit</td>
                  <td className="border-2 border-black p-2 text-center">{item.qty}</td>
                  <td className="border-2 border-black p-2 text-right">{item.price.toLocaleString()}</td>
                  <td className="border-2 border-black p-2 text-right">{itemTotal.toLocaleString()}</td>
                  <td className="border-2 border-black p-2 text-center">0</td>
                  <td className="border-2 border-black p-2 text-right">0</td>
                  <td className="border-2 border-black p-2 text-center">{item.vatRate}%</td>
                  <td className="border-2 border-black p-2 text-right">{itemVat.toLocaleString()}</td>
                  <td className="border-2 border-black p-2 text-right">{(itemTotal + itemVat).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-zinc-50">
              <td colSpan={5} className="border-2 border-black p-2 text-right">Total</td>
              <td className="border-2 border-black p-2 text-right">{subtotal.toLocaleString()}</td>
              <td className="border-2 border-black p-2"></td>
              <td className="border-2 border-black p-2 text-right">0</td>
              <td className="border-2 border-black p-2"></td>
              <td className="border-2 border-black p-2 text-right">{totalVat.toLocaleString()}</td>
              <td className="border-2 border-black p-2 text-right">{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div className="grid grid-cols-2 gap-20 mt-20">
          <div className="text-center border-t-2 border-black pt-2">
            <p className="font-bold">Name of Authorized Person</p>
            <p className="text-xs text-zinc-500">(Signature with Seal)</p>
          </div>
          <div className="text-center border-t-2 border-black pt-2">
            <p className="font-bold">Purchaser's Signature</p>
            <p className="text-xs text-zinc-500">(Where applicable)</p>
          </div>
        </div>

        <div className="mt-12 flex justify-center print:hidden">
          <button 
            onClick={() => window.print()}
            className="px-10 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-2"
          >
            <Printer size={20} /> Print Mushak 6.3
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function InvoiceGenerator({ initialData }: { initialData?: any }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showMushak63, setShowMushak63] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [editingClient, setEditingClient] = useState<any>(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [editClientForm, setEditClientForm] = useState({ name: '', address: '', bin: '', mobile: '', tin: '' });
  const [newClientForm, setNewClientForm] = useState({ name: '', address: '', bin: '', mobile: '', tin: '' });
  const [invoice, setInvoice] = useState(initialData || {
    number: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    recurring: 'none',
    seller: { name: '', address: '', bin: '' },
    buyer: { name: '', address: '', bin: '' },
    items: [{ id: 1, desc: '', category: 'Standard Goods/Services', qty: 1, price: 0, vatRate: 15 }]
  });

  useEffect(() => {
    if (initialData) {
      setInvoice(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    fetchTemplates();
    fetchClients();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/invoice/templates');
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const saveClient = async () => {
    const clientToSave = showAddClientModal ? newClientForm : {
      name: invoice.buyer.name,
      address: invoice.buyer.address,
      bin: invoice.buyer.bin,
      mobile: '',
      tin: ''
    };

    if (!clientToSave.name.trim()) {
      alert("Please enter a client name.");
      return;
    }
    
    if (!showAddClientModal && !confirm(`Are you sure you want to save "${clientToSave.name}" as a new client?`)) return;
    
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientToSave)
      });
      if (res.ok) {
        alert("Client saved successfully!");
        setShowAddClientModal(false);
        setNewClientForm({ name: '', address: '', bin: '', mobile: '', tin: '' });
        fetchClients();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateClient = async () => {
    if (!editClientForm.name.trim()) {
      alert("Please enter a client name.");
      return;
    }
    try {
      const res = await fetch(`/api/clients/${editingClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editClientForm)
      });
      if (res.ok) {
        alert("Client updated successfully!");
        setEditingClient(null);
        fetchClients();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectClient = (c: any) => {
    setInvoice({
      ...invoice,
      buyer: { name: c.name, address: c.address, bin: c.bin || c.tin }
    });
  };

  const deleteClient = async (id: number) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      alert("Please enter a template name.");
      return;
    }
    try {
      const res = await fetch('/api/invoice/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          sellerName: invoice.seller.name,
          sellerAddress: invoice.seller.address,
          sellerBin: invoice.seller.bin,
          buyerName: invoice.buyer.name,
          buyerAddress: invoice.buyer.address,
          buyerBin: invoice.buyer.bin,
          items: invoice.items
        })
      });
      if (res.ok) {
        setTemplateName('');
        setShowTemplateModal(false);
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTemplate = (t: any) => {
    setInvoice({
      ...invoice,
      seller: { name: t.sellerName, address: t.sellerAddress, bin: t.sellerBin },
      buyer: { name: t.buyerName, address: t.buyerAddress, bin: t.buyerBin },
      items: t.items.map((item: any, idx: number) => ({ ...item, id: Date.now() + idx }))
    });
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await fetch(`/api/invoice/templates/${id}`, { method: 'DELETE' });
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { id: Date.now(), desc: '', category: 'Standard Goods/Services', qty: 1, price: 0, vatRate: 15 }]
    });
  };

  const removeItem = (id: number) => {
    if (invoice.items.length === 1) return;
    setInvoice({
      ...invoice,
      items: invoice.items.filter(item => item.id !== id)
    });
  };

  const updateItem = (id: number, field: string, value: any) => {
    setInvoice({
      ...invoice,
      items: invoice.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'category') {
            const category = PRODUCT_CATEGORIES.find(c => c.name === value);
            if (category && value !== 'Other (Manual)') {
              updatedItem.vatRate = category.rate;
            }
          }
          return updatedItem;
        }
        return item;
      })
    });
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const totalVat = invoice.items.reduce((sum, item) => sum + (item.qty * item.price * (item.vatRate / 100)), 0);
  const total = subtotal + totalVat;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-32">
      <SectionGuide 
        title="ইনভয়েস জেনারেটর গাইড"
        steps={[
          "বিক্রেতা (Seller) এবং ক্রেতার (Buyer) তথ্য পূরণ করুন।",
          "ইনভয়েস আইটেমগুলো (Description, Qty, Price) যোগ করুন।",
          "ভ্যাট হার এবং ডিসকাউন্ট প্রযোজ্য হলে তা উল্লেখ করুন।",
          "'Generate Invoice' বাটনে ক্লিক করে প্রফেশনাল পিডিএফ ডাউনলোড বা প্রিন্ট করুন।"
        ]}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div>
          <h3 className="text-3xl font-bold font-display">Invoice Studio</h3>
          <p className="text-sm text-zinc-500 mt-1">Create VAT-compliant professional invoices</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setShowTemplateModal(true)}
            className="px-6 py-3 bg-white border border-zinc-200 text-zinc-700 rounded-2xl font-bold shadow-sm hover:bg-zinc-50 transition-all flex items-center gap-2 text-sm"
          >
            <Layout size={18} className="text-brand-500" /> Templates
          </button>
          <button 
            onClick={() => setShowClientModal(true)}
            className="px-6 py-3 bg-white border border-zinc-200 text-zinc-700 rounded-2xl font-bold shadow-sm hover:bg-zinc-50 transition-all flex items-center gap-2 text-sm"
          >
            <Users size={18} className="text-blue-500" /> Clients
          </button>
          <button 
            onClick={handlePrint}
            className="px-6 py-3 btn-primary flex items-center gap-2 text-sm"
          >
            <Printer size={18} /> Print Invoice
          </button>
          <button 
            onClick={() => setShowMushak63(true)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-sm hover:bg-emerald-700 transition-all flex items-center gap-2 text-sm"
          >
            <FileText size={18} /> Mushak 6.3
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showTemplateModal && (
          <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full space-y-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mx-auto mb-6">
                  <Layout size={32} />
                </div>
                <h4 className="text-2xl font-bold font-display">Save Template</h4>
                <p className="text-sm text-zinc-500 mt-2">Reuse these business details for future invoices</p>
              </div>
              
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Template Name</label>
                <input 
                  type="text" 
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Monthly Retainer"
                  className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none font-medium transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveTemplate}
                  className="flex-1 py-4 btn-primary text-sm"
                >
                  Save Template
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showClientModal && (
          <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-2xl w-full space-y-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-2xl font-bold font-display">{editingClient ? 'Edit Client' : 'Client Directory'}</h4>
                  <p className="text-sm text-zinc-500 mt-1">Manage your customer database</p>
                </div>
                <button 
                  onClick={() => { setShowClientModal(false); setEditingClient(null); }} 
                  className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                {editingClient ? (
                  <div className="space-y-6 bg-zinc-50 p-8 rounded-3xl border border-zinc-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Client Name</label>
                        <input 
                          type="text"
                          value={editClientForm.name}
                          onChange={(e) => setEditClientForm({ ...editClientForm, name: e.target.value })}
                          className="w-full px-5 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all"
                        />
                      </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">BIN</label>
                        <input 
                          type="text"
                          value={editClientForm.bin}
                          onChange={(e) => setEditClientForm({ ...editClientForm, bin: e.target.value })}
                          className="w-full px-5 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">TIN</label>
                        <input 
                          type="text"
                          value={editClientForm.tin}
                          onChange={(e) => setEditClientForm({ ...editClientForm, tin: e.target.value })}
                          className="w-full px-5 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mobile Number</label>
                      <input 
                        type="text"
                        value={editClientForm.mobile}
                        onChange={(e) => setEditClientForm({ ...editClientForm, mobile: e.target.value })}
                        className="w-full px-5 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all"
                      />
                    </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Address</label>
                      <textarea 
                        value={editClientForm.address}
                        onChange={(e) => setEditClientForm({ ...editClientForm, address: e.target.value })}
                        className="w-full px-5 py-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all min-h-[100px]"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => setEditingClient(null)}
                        className="flex-1 py-4 bg-white border border-zinc-200 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-50 transition-all text-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={updateClient}
                        className="flex-1 py-4 btn-primary text-sm"
                      >
                        Update Client
                      </button>
                    </div>
                  </div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                    <Users size={48} className="text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">No clients saved yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {clients.map(c => (
                      <div key={c.id} className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl flex justify-between items-center group hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-400 font-bold text-lg border border-zinc-100">
                            {c.name[0]}
                          </div>
                          <div>
                            <h5 className="font-bold text-zinc-900">{c.name}</h5>
                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{c.address}</p>
                            {c.bin && <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-md">BIN: {c.bin}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => { selectClient(c); setShowClientModal(false); }}
                            className="p-2.5 bg-white text-zinc-600 rounded-xl hover:text-brand-600 border border-zinc-100 shadow-sm transition-all"
                            title="Select Client"
                          >
                            <Copy size={18} />
                          </button>
                          <button 
                            onClick={() => { setEditingClient(c); setEditClientForm({ name: c.name, address: c.address, bin: c.bin || '', mobile: c.mobile || '', tin: c.tin || '' }); }}
                            className="p-2.5 bg-white text-zinc-600 rounded-xl hover:text-blue-600 border border-zinc-100 shadow-sm transition-all"
                            title="Edit Client"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => deleteClient(c.id)}
                            className="p-2.5 bg-white text-zinc-600 rounded-xl hover:text-red-600 border border-zinc-100 shadow-sm transition-all"
                            title="Delete Client"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {!editingClient && (
                <button 
                  onClick={() => setShowClientModal(false)}
                  className="w-full py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all text-sm"
                >
                  Close Directory
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Client Modal */}
      <AnimatePresence>
        {showAddClientModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddClientModal(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-zinc-900">Add New Client</h3>
                <button onClick={() => setShowAddClientModal(false)} className="p-2 text-zinc-400 hover:text-zinc-900">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Client Name</label>
                  <input 
                    type="text" 
                    value={newClientForm.name}
                    onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                    className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-bold"
                    placeholder="Enter client name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Address</label>
                  <textarea 
                    value={newClientForm.address}
                    onChange={(e) => setNewClientForm({ ...newClientForm, address: e.target.value })}
                    className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all min-h-[100px] font-bold"
                    placeholder="Enter address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">BIN</label>
                    <input 
                      type="text" 
                      value={newClientForm.bin}
                      onChange={(e) => setNewClientForm({ ...newClientForm, bin: e.target.value })}
                      className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-bold"
                      placeholder="Enter BIN"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">TIN</label>
                    <input 
                      type="text" 
                      value={newClientForm.tin}
                      onChange={(e) => setNewClientForm({ ...newClientForm, tin: e.target.value })}
                      className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-bold"
                      placeholder="Enter TIN"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mobile Number</label>
                  <input 
                    type="text" 
                    value={newClientForm.mobile}
                    onChange={(e) => setNewClientForm({ ...newClientForm, mobile: e.target.value })}
                    className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-bold"
                    placeholder="Enter mobile number"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowAddClientModal(false)}
                    className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveClient}
                    className="flex-1 py-4 btn-primary text-sm"
                  >
                    Save Client
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Input Form */}
        <div className="lg:col-span-2 space-y-8 print:hidden">
          {templates.length > 0 && (
            <div className="neo-card p-8 rounded-[2rem] space-y-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <Layout size={16} className="text-brand-500" />
                Quick Templates
              </div>
              <div className="flex flex-wrap gap-3">
                {templates.map(t => (
                  <div key={t.id} className="group relative">
                    <button 
                      onClick={() => loadTemplate(t)}
                      className="px-5 py-2.5 bg-zinc-50 text-zinc-700 border border-zinc-100 rounded-xl text-xs font-bold hover:bg-white hover:shadow-lg hover:shadow-zinc-200/50 transition-all flex items-center gap-2"
                    >
                      <Copy size={14} className="text-zinc-400" /> {t.name}
                    </button>
                    <button 
                      onClick={() => deleteTemplate(t.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-75 group-hover:scale-100"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="neo-card p-10 rounded-[2.5rem] space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Invoice Number</label>
                <input 
                  type="text" 
                  value={invoice.number || ""}
                  onChange={(e) => setInvoice({ ...invoice, number: e.target.value })}
                  className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none text-sm font-medium transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Issue Date</label>
                <input 
                  type="date" 
                  value={invoice.date || ""}
                  onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                  className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none text-sm font-medium transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Frequency</label>
                <select 
                  value={invoice.recurring}
                  onChange={(e) => setInvoice({ ...invoice, recurring: e.target.value })}
                  className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none text-sm font-medium transition-all appearance-none"
                >
                  <option value="none">One-time Invoice</option>
                  <option value="weekly">Weekly Recurring</option>
                  <option value="monthly">Monthly Recurring</option>
                  <option value="yearly">Yearly Recurring</option>
                </select>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600">
                    <Building2 size={16} />
                  </div>
                  <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Seller Details</h4>
                </div>
                <div className="space-y-4">
                  <input 
                    placeholder="Business Name"
                    value={invoice.seller.name || ""}
                    onChange={(e) => setInvoice({ ...invoice, seller: { ...invoice.seller, name: e.target.value }})}
                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none text-sm font-medium transition-all"
                  />
                  <textarea 
                    placeholder="Business Address"
                    value={invoice.seller.address || ""}
                    onChange={(e) => setInvoice({ ...invoice, seller: { ...invoice.seller, address: e.target.value }})}
                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none text-sm font-medium transition-all min-h-[100px]"
                  />
                  <input 
                    placeholder="BIN (Business Identification Number)"
                    value={invoice.seller.bin || ""}
                    onChange={(e) => setInvoice({ ...invoice, seller: { ...invoice.seller, bin: e.target.value }})}
                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <User size={16} />
                    </div>
                    <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Buyer Details</h4>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowAddClientModal(true)}
                      className="text-[10px] font-black text-brand-600 hover:text-brand-700 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                    >
                      <Plus size={14} /> Add New Client
                    </button>
                    <button 
                      onClick={saveClient}
                      className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                      title="Save this buyer as a client"
                    >
                      <UserPlus size={14} /> Save
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      placeholder="Customer Name"
                      value={invoice.buyer.name || ""}
                      onChange={(e) => setInvoice({ ...invoice, buyer: { ...invoice.buyer, name: e.target.value }})}
                      className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none text-sm font-medium transition-all pr-12"
                    />
                    {clients.length > 0 && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <select 
                          onChange={(e) => {
                            const client = clients.find(c => c.id === parseInt(e.target.value));
                            if (client) selectClient(client);
                          }}
                          className="w-8 h-8 opacity-0 absolute inset-0 cursor-pointer"
                        >
                          <option value="">Select Client</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <div className="w-8 h-8 bg-white border border-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 pointer-events-none">
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    )}
                  </div>
                  <textarea 
                    placeholder="Customer Address"
                    value={invoice.buyer.address || ""}
                    onChange={(e) => setInvoice({ ...invoice, buyer: { ...invoice.buyer, address: e.target.value }})}
                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none text-sm font-medium transition-all min-h-[100px]"
                  />
                  <input 
                    placeholder="BIN / TIN"
                    value={invoice.buyer.bin || ""}
                    onChange={(e) => setInvoice({ ...invoice, buyer: { ...invoice.buyer, bin: e.target.value }})}
                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none text-sm font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Line Items</h4>
                <button 
                  onClick={addItem}
                  className="text-xs font-black text-brand-600 hover:text-brand-700 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>
              
              <div className="space-y-4">
                {invoice.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-start p-6 bg-zinc-50/50 border border-zinc-100 rounded-3xl group transition-all hover:bg-white hover:shadow-lg hover:shadow-zinc-200/30">
                    <div className="col-span-4 space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Description</label>
                      <input 
                        placeholder="Item name or service"
                        value={item.desc || ""}
                        onChange={(e) => updateItem(item.id, 'desc', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none transition-all"
                      />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Category</label>
                      <select 
                        value={item.category}
                        onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none transition-all appearance-none"
                      >
                        {PRODUCT_CATEGORIES.map(cat => (
                          <option key={cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center block">Qty</label>
                      <input 
                        type="number"
                        value={item.qty ?? 0}
                        onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-center focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none transition-all"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right block">Price</label>
                      <input 
                        type="number"
                        value={item.price ?? 0}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-right focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none transition-all"
                      />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center block">VAT</label>
                      <select 
                        value={item.vatRate}
                        onChange={(e) => updateItem(item.id, 'vatRate', parseFloat(e.target.value))}
                        className="w-full px-2 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none transition-all appearance-none text-center"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={7.5}>7.5%</option>
                        <option value={10}>10%</option>
                        <option value={15}>15%</option>
                      </select>
                    </div>
                    <div className="col-span-1 flex justify-center pt-8">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="w-10 h-10 bg-white text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl border border-zinc-100 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1 print:col-span-3">
          <div className="neo-card p-10 rounded-[2.5rem] bg-white sticky top-8 print:static print:shadow-none print:border-none print:p-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 blur-2xl print:hidden" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-2xl font-black text-brand-600 tracking-tighter font-display">VATX.BD</h2>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-black">Tax Compliance</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold uppercase text-zinc-900 font-display">Invoice</h3>
                  <p className="text-xs text-zinc-500 mt-1">#{invoice.number}</p>
                  <p className="text-xs text-zinc-500">{invoice.date}</p>
                  {invoice.recurring !== 'none' && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-brand-50 text-brand-600 text-[10px] font-black rounded uppercase tracking-widest">
                      {invoice.recurring}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                  <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-3">From</h4>
                  <p className="text-sm font-bold text-zinc-900">{invoice.seller.name || 'Your Business'}</p>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed whitespace-pre-wrap">{invoice.seller.address || 'Your Address'}</p>
                  {invoice.seller.bin && <p className="text-[10px] text-brand-600 font-black mt-2 uppercase tracking-widest">BIN: {invoice.seller.bin}</p>}
                </div>
                <div className="text-right">
                  <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-3">To</h4>
                  <p className="text-sm font-bold text-zinc-900">{invoice.buyer.name || 'Customer Name'}</p>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed whitespace-pre-wrap">{invoice.buyer.address || 'Customer Address'}</p>
                  {invoice.buyer.bin && <p className="text-[10px] text-blue-600 font-black mt-2 uppercase tracking-widest">BIN/TIN: {invoice.buyer.bin}</p>}
                </div>
              </div>

              <div className="space-y-4 mb-12">
                <div className="grid grid-cols-12 gap-4 pb-3 border-b border-zinc-100 text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-4 text-right">Total</div>
                </div>
                {invoice.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 text-sm items-center">
                    <div className="col-span-6">
                      <p className="font-bold text-zinc-900">{item.desc || 'Item Description'}</p>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">{item.category}</p>
                    </div>
                    <div className="col-span-2 text-center text-zinc-500 font-medium">{item.qty}</div>
                    <div className="col-span-4 text-right font-bold text-zinc-900">৳{(item.qty * item.price).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-zinc-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Subtotal</span>
                  <span className="text-sm font-bold text-zinc-900">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Total VAT</span>
                  <span className="text-sm font-bold text-brand-600">৳{totalVat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-sm font-black text-zinc-900 uppercase tracking-widest">Grand Total</span>
                  <span className="text-3xl font-bold text-brand-600 font-display">৳{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-12 flex flex-col items-center justify-center gap-4">
                <div className="p-3 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                  <QRCodeSVG 
                    value={`Invoice: ${invoice.number}\nAmount: ৳${total.toLocaleString()}\nSeller: ${invoice.seller.name}\nBuyer: ${invoice.buyer.name}`}
                    size={100}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">Scan to Verify Invoice</p>
              </div>

              <div className="mt-12 pt-12 border-t border-zinc-100 text-center">
                <p className="text-[10px] text-zinc-300 uppercase font-black tracking-[0.3em]">Thank you for your business</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showMushak63 && (
        <Mushak63View 
          invoice={invoice} 
          onClose={() => setShowMushak63(false)} 
        />
      )}
    </div>
  );
}

function ManifestView({ t }: { t: any }) {
  const [activeSubTab, setActiveSubTab] = useState<'igm' | 'checklist' | 'declaration'>('igm');
  const [checklist, setChecklist] = useState([
    { title: 'Bill of Lading / Airway Bill', desc: 'Proof of contract of carriage and ownership.', done: false },
    { title: 'Commercial Invoice', desc: 'Detailed list of goods and their value.', done: false },
    { title: 'Packing List', desc: 'Breakdown of contents in each package.', done: false },
    { title: 'Certificate of Origin', desc: 'Proof of where the goods were manufactured.', done: false },
    { title: 'Import/Export Permit (IRC/ERC)', desc: 'Valid registration with the NBR/Commerce Ministry.', done: false },
    { title: 'Insurance Cover Note', desc: 'Required for assessment of assessable value.', done: false },
    { title: 'Letter of Credit (L/C)', desc: 'Bank document for payment and compliance.', done: false },
    { title: 'Proforma Invoice', desc: 'Initial quote used for L/C opening.', done: false },
    { title: 'VAT Registration Certificate', desc: 'Proof of being a registered VAT payer.', done: false },
    { title: 'Special Permits (L/A, NOC)', desc: 'Required for restricted or controlled items.', done: false }
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <SectionGuide 
        title="মেনিফেস্ট গাইড"
        steps={[
          "আপনার কার্গো বা শিপিং মেনিফেস্টের তথ্য আপলোড বা এন্ট্রি করুন।",
          "বিল অফ লেডিং (B/L) এবং কন্টেইনার নম্বর ট্র্যাক করুন।",
          "কাস্টমস ক্লিয়ারেন্সের স্ট্যাটাস আপডেট করুন।",
          "আপনার সমস্ত শিপমেন্টের একটি সুশৃঙ্খল তালিকা বজায় রাখুন।"
        ]}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Manifest & Cargo Declaration</h3>
          <p className="text-sm text-[#6B7280]">Compliance tools for Bangladesh Customs (Asycuda World)</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-[#F3F4F6] shadow-sm">
          <button 
            onClick={() => setActiveSubTab('igm')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all",
              activeSubTab === 'igm' ? "bg-[#10B981] text-white shadow-md" : "text-[#6B7280] hover:bg-gray-50"
            )}
          >
            IGM/EGM Guide
          </button>
          <button 
            onClick={() => setActiveSubTab('checklist')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all",
              activeSubTab === 'checklist' ? "bg-[#10B981] text-white shadow-md" : "text-[#6B7280] hover:bg-gray-50"
            )}
          >
            Checklist
          </button>
          <button 
            onClick={() => setActiveSubTab('declaration')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all",
              activeSubTab === 'declaration' ? "bg-[#10B981] text-white shadow-md" : "text-[#6B7280] hover:bg-gray-50"
            )}
          >
            Cargo Declaration
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'igm' && (
          <motion.div 
            key="igm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3F4F6] space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Anchor size={20} />
                </div>
                <h4 className="text-lg font-bold">Import General Manifest (IGM)</h4>
              </div>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                The IGM must be submitted electronically to Bangladesh Customs before the arrival of the vessel or aircraft.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <h5 className="text-xs font-bold text-blue-700 uppercase mb-1">Submission Timeline</h5>
                  <ul className="text-xs text-blue-600 space-y-1 list-disc ml-4">
                    <li>Sea: 24 hours before arrival at the first port of call.</li>
                    <li>Air: Immediately upon departure from the last airport.</li>
                    <li>Land: Upon arrival at the border station.</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-[#374151] uppercase">Key Requirements</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {['Vessel/Flight Details', 'Port of Loading/Discharge', 'Consignee & Notifier Info', 'Container & Seal Numbers', 'Description of Goods', 'Gross Weight & Measurement'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#6B7280]">
                        <CheckCircle2 size={14} className="text-emerald-500" /> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3F4F6] space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <h4 className="text-lg font-bold">Export General Manifest (EGM)</h4>
              </div>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                The EGM is submitted after the departure of the vessel or aircraft to confirm the goods actually exported.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <h5 className="text-xs font-bold text-emerald-700 uppercase mb-1">Submission Timeline</h5>
                  <ul className="text-xs text-emerald-600 space-y-1 list-disc ml-4">
                    <li>Sea: Within 24 hours of vessel departure.</li>
                    <li>Air: Within 12 hours of flight departure.</li>
                    <li>Land: Immediately after crossing the border.</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-[#374151] uppercase">Key Requirements</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {['Export Bill of Entry Ref', 'Shipping Bill Details', 'Final Destination Port', 'Container Loading List', 'Vessel Departure Confirmation', 'Authorized Agent Signature'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#6B7280]">
                        <CheckCircle2 size={14} className="text-emerald-500" /> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'checklist' && (
          <motion.div 
            key="checklist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-10 rounded-3xl shadow-sm border border-[#F3F4F6]"
          >
            <h4 className="text-xl font-bold mb-6">Cargo Declaration Necessaries (Checklist)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h5 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Mandatory Documents</h5>
                <div className="space-y-4">
                  {checklist.slice(0, 5).map((doc, i) => (
                    <div 
                      key={i} 
                      onClick={() => toggleCheck(i)}
                      className={cn(
                        "flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
                        doc.done ? "bg-blue-50 border-blue-200" : "bg-white border-[#F3F4F6] hover:border-blue-200"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all",
                        doc.done ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
                      )}>
                        {doc.done ? <CheckCircle2 size={14} /> : i + 1}
                      </div>
                      <div>
                        <h6 className={cn("text-sm font-bold transition-all", doc.done && "text-blue-700 line-through")}>{doc.title}</h6>
                        <p className="text-xs text-[#6B7280]">{doc.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <h5 className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Additional Requirements</h5>
                <div className="space-y-4">
                  {checklist.slice(5).map((doc, i) => (
                    <div 
                      key={i + 5} 
                      onClick={() => toggleCheck(i + 5)}
                      className={cn(
                        "flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
                        doc.done ? "bg-emerald-50 border-emerald-200" : "bg-white border-[#F3F4F6] hover:border-emerald-200"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all",
                        doc.done ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {doc.done ? <CheckCircle2 size={14} /> : i + 6}
                      </div>
                      <div>
                        <h6 className={cn("text-sm font-bold transition-all", doc.done && "text-emerald-700 line-through")}>{doc.title}</h6>
                        <p className="text-xs text-[#6B7280]">{doc.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'declaration' && (
          <motion.div 
            key="declaration"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-10 rounded-3xl shadow-sm border border-[#F3F4F6] space-y-8"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-bold">Cargo Declaration (Bill of Entry) Helper</h4>
              <span className="text-xs font-bold text-[#6B7280]">Asycuda World Format</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[#374151] uppercase">Customs Office</label>
                <select className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none text-sm">
                  <option>Chittagong Customs House (301)</option>
                  <option>Dhaka Customs House (101)</option>
                  <option>Mongla Customs House (401)</option>
                  <option>ICD Kamalapur (302)</option>
                  <option>Benapole Land Port (501)</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[#374151] uppercase">Declaration Type</label>
                <select className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none text-sm">
                  <option>IM4 - Import for Home Consumption</option>
                  <option>EX1 - Export</option>
                  <option>IM7 - Warehousing</option>
                  <option>TR - Transit</option>
                </select>
              </div>
            </div>

            <div className="h-px bg-[#F3F4F6]" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[#374151] uppercase">Manifest Number</label>
                <input placeholder="e.g., 2024/1234" className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none text-sm" />
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[#374151] uppercase">Line Number</label>
                <input placeholder="e.g., 0045" className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none text-sm" />
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[#374151] uppercase">B/L or AWB No</label>
                <input placeholder="e.g., COSU6123456" className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none text-sm" />
              </div>
            </div>

            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
              <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
              <div className="space-y-1">
                <p className="text-sm font-bold text-amber-900">Important Note for Declarants</p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Ensure all HS Codes match the current FY 2025-26 Tariff Schedule. Any discrepancy between the Manifest and the Cargo Declaration may lead to physical examination (Red Channel) or penalties under the Customs Act.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-8 py-4 bg-[#10B981] text-white rounded-2xl font-bold shadow-lg hover:bg-[#059669] transition-all flex items-center gap-2">
                <ClipboardCheck size={20} /> Validate Declaration Data
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportsView({ vatHistory, taxHistory, t }: { vatHistory: any[], taxHistory: any[], t: any }) {
  const [checklist, setChecklist] = useState([
    { label: 'VAT Return Filed (Current Month)', status: vatHistory.length > 0 },
    { label: 'Income Tax Assessment Completed', status: taxHistory.length > 0 },
    { label: 'BIN/TIN Information Updated', status: true },
    { label: 'Recent Invoice Generation', status: true },
    { label: 'Customs Tariff Compliance Check', status: true },
    { label: 'E-Return Submission Ready', status: false }
  ]);

  const toggleCheck = (index: number) => {
    const item = checklist[index];
    if (!item.status) {
      if (!confirm(t.confirmTaskComplete)) return;
    }
    const next = [...checklist];
    next[index].status = !next[index].status;
    setChecklist(next);
  };

  const totalVat = vatHistory.reduce((sum, h) => sum + (h.result?.vatAmount || 0), 0);
  const totalIncomeTax = taxHistory.reduce((sum, h) => sum + (h.result?.taxLiability || 0), 0);
  
  const complianceScore = Math.min(100, (vatHistory.length + taxHistory.length) * 10 + checklist.filter(c => c.status).length * 5);
  
  const combinedHistory = [
    ...vatHistory.map(h => ({ ...h, type: 'VAT' })),
    ...taxHistory.map(h => ({ ...h, type: 'Income Tax' }))
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const monthlyData = combinedHistory.reduce((acc: any[], h) => {
    const month = new Date(h.timestamp).toLocaleString('default', { month: 'short' });
    const existing = acc.find(d => d.month === month);
    const value = h.type === 'VAT' ? (h.result?.vatAmount || 0) : (h.result?.taxLiability || 0);
    
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ month, value });
    }
    return acc;
  }, []).slice(-6);

  const typeDistribution = [
    { name: 'VAT', value: totalVat },
    { name: 'Income Tax', value: totalIncomeTax }
  ];

  const COLORS = ['#10B981', '#3B82F6'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Compliance & Tax Reports</h3>
          <p className="text-sm text-[#6B7280]">Summary of your tax activities and compliance status</p>
        </div>
        <button className="px-6 py-3 bg-white border border-[#E5E7EB] text-[#374151] rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
          <FileText size={20} /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3F4F6] space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <TrendingUp size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Total VAT Collected</span>
          </div>
          <p className="text-3xl font-black text-[#111827]">৳{totalVat.toLocaleString()}</p>
          <p className="text-xs text-[#6B7280]">Based on {vatHistory.length} calculations</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3F4F6] space-y-2">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <TrendingUp size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Total Income Tax</span>
          </div>
          <p className="text-3xl font-black text-[#111827]">৳{totalIncomeTax.toLocaleString()}</p>
          <p className="text-xs text-[#6B7280]">Based on {taxHistory.length} calculations</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3F4F6] space-y-2">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <ClipboardCheck size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Compliance Score</span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-black text-[#111827]">{complianceScore}%</p>
            <span className="text-xs font-bold text-emerald-500 mb-1">Good</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${complianceScore}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3F4F6] space-y-6">
          <h4 className="text-lg font-bold">Tax Liability Trend</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3F4F6] space-y-6">
          <h4 className="text-lg font-bold">Tax Distribution</h4>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {typeDistribution.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs font-bold text-[#374151]">{d.name}</span>
                  <span className="text-xs text-[#6B7280]">৳{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3F4F6] space-y-6">
        <h4 className="text-lg font-bold">Compliance Checklist Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checklist.map((item, i) => (
            <div 
              key={i} 
              onClick={() => toggleCheck(i)}
              className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] cursor-pointer hover:bg-white hover:shadow-md transition-all"
            >
              <span className="text-sm font-medium text-[#374151]">{item.label}</span>
              {item.status ? (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase">Completed</span>
              ) : (
                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full uppercase">Pending</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NoticesView({ notices, onRefresh }: { notices: TaxNotice[], onRefresh: () => void }) {
  const [filter, setFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summaries, setSummaries] = useState<Record<number, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Record<number, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const categories = ['All', ...new Set(notices.map(n => n.category))];

  const fetchSummary = async (id: number) => {
    if (summaries[id] || loadingSummaries[id]) return;
    
    setLoadingSummaries(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/notices/summarize/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.summary) {
        setSummaries(prev => ({ ...prev, [id]: data.summary }));
      }
    } catch (err) {
      console.error("Failed to fetch summary", err);
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/notices/refresh', { method: 'POST' });
      onRefresh();
    } catch (err) {
      console.error("Refresh failed", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredNotices = notices.filter(n => {
    const matchesFilter = filter === 'All' || n.category === filter;
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const noticeDate = new Date(n.createdAt);
    const matchesStartDate = !startDate || noticeDate >= new Date(startDate);
    const matchesEndDate = !endDate || noticeDate <= new Date(endDate);
    
    return matchesFilter && matchesSearch && matchesStartDate && matchesEndDate;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black text-zinc-900 tracking-tighter font-display">Regulatory Notices</h2>
        <p className="text-zinc-500 max-w-xl mx-auto text-lg">Stay updated with the latest circulars, SROs, and compliance updates from the National Board of Revenue (NBR).</p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex bg-zinc-100 p-1.5 rounded-2xl overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={clsx(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  filter === cat ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notices..."
                className="w-full pl-12 pr-6 py-3.5 bg-zinc-100 border-none rounded-2xl focus:ring-4 focus:ring-brand-500/10 outline-none text-sm transition-all"
              />
            </div>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3.5 bg-zinc-100 text-zinc-600 rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-50"
              title="Refresh from NBR"
            >
              <ArrowRightLeft size={20} className={cn(isRefreshing && "animate-spin")} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-zinc-50 p-4 rounded-3xl border border-zinc-100">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-zinc-400" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <span className="text-zinc-300">to</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          {(startDate || endDate || filter !== 'All' || searchTerm) && (
            <button 
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setFilter('All');
                setSearchTerm('');
              }}
              className="ml-auto text-[10px] font-black text-brand-600 uppercase tracking-widest hover:text-brand-700 transition-all flex items-center gap-1"
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <motion.div 
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="neo-card p-8 rounded-[2.5rem] group hover:border-brand-500/30 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-48 shrink-0 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      notice.category === 'VAT' ? "bg-emerald-50 text-emerald-600" :
                      notice.category === 'Income Tax' ? "bg-blue-50 text-blue-600" :
                      "bg-amber-50 text-amber-600"
                    )}>
                      {notice.category}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-zinc-400">
                    {new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-xl font-bold text-zinc-900 group-hover:text-brand-600 transition-colors">{notice.title}</h3>
                  
                  <AnimatePresence>
                    {summaries[notice.id] && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 bg-brand-50/50 border border-brand-100 rounded-2xl text-sm text-zinc-700 leading-relaxed italic">
                          <div className="flex items-center gap-2 text-brand-600 mb-2 font-black text-[10px] uppercase tracking-widest">
                            <Sparkles size={14} /> AI Summary
                          </div>
                          {summaries[notice.id]}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button 
                      onClick={() => fetchSummary(notice.id)}
                      disabled={loadingSummaries[notice.id]}
                      className="inline-flex items-center gap-2 text-xs font-black text-brand-600 uppercase tracking-widest hover:gap-3 transition-all disabled:opacity-50"
                    >
                      {loadingSummaries[notice.id] ? (
                        <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                      ) : <Sparkles size={16} />}
                      AI Summarize
                    </button>
                    <a 
                      href={notice.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-all"
                    >
                      View Original <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-200">
              <Search size={40} />
            </div>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No notices found matching your search</p>
          </div>
        )}
      </div>

      <div className="neo-card p-10 rounded-[2.5rem] bg-zinc-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 bg-brand-500/20 text-brand-400 rounded-2xl flex items-center justify-center shrink-0">
            <Sparkles size={32} />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl font-bold font-display">AI-Powered Compliance Monitoring</h4>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
              Our system automatically monitors NBR portals and official gazettes every 2 hours. Use the <span className="text-brand-400 font-bold">AI Summarize</span> feature to quickly understand the impact of new regulations on your specific business sector.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaxRebatePlanner() {
  const [income, setIncome] = useState('');
  const [currentInvestment, setCurrentInvestment] = useState('');
  const [result, setResult] = useState<any>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', url: '', description: '' });
  const [isAddingPartner, setIsAddingPartner] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await fetch('/api/investment-partners');
      const data = await res.json();
      setPartners(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addPartner = async () => {
    if (!newPartner.name || !newPartner.url) return;
    setIsAddingPartner(true);
    try {
      const res = await fetch('/api/investment-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPartner)
      });
      if (res.ok) {
        setNewPartner({ name: '', url: '', description: '' });
        fetchPartners();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingPartner(false);
    }
  };

  const deletePartner = async (id: number) => {
    try {
      await fetch(`/api/investment-partners/${id}`, { method: 'DELETE' });
      fetchPartners();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateRebate = () => {
    const inc = parseFloat(income);
    const inv = parseFloat(currentInvestment) || 0;

    if (isNaN(inc) || inc <= 0) {
      alert("Please enter a valid annual income.");
      return;
    }

    // Bangladesh Tax Rebate Logic (Simplified)
    // Max Investment allowed for rebate: 20% of total income or 1 Crore (whichever is less)
    const maxInvestmentAllowed = Math.min(inc * 0.20, 10000000);
    
    // Rebate is usually 15% of the actual investment (if within limits)
    const actualInvestmentForRebate = Math.min(inv, maxInvestmentAllowed);
    const rebateAmount = actualInvestmentForRebate * 0.15;
    
    const potentialMaxRebate = maxInvestmentAllowed * 0.15;
    const additionalInvestmentNeeded = Math.max(0, maxInvestmentAllowed - inv);

    // Generate suggestions in Bangla
    const suggestions = [];
    if (additionalInvestmentNeeded > 0) {
      suggestions.push({
        title: "ডিপিএস (ডিপোজিট পেনশন স্কিম)",
        description: "ব্যাংক ডিপিএস-এ বার্ষিক ৬০,০০০ টাকা পর্যন্ত বিনিয়োগ করে এই পরিমাণের ওপর পূর্ণ কর রেয়াত পান। এটি ছোট অংকের নিয়মিত সঞ্চয়ের জন্য সেরা।",
        impact: "উচ্চ"
      });
      suggestions.push({
        title: "সঞ্চয়পত্র (Sanchaypatra)",
        description: "৫ বছর মেয়াদী বাংলাদেশ সঞ্চয়পত্র কিনুন। এটি অন্যতম নিরাপদ বিনিয়োগ মাধ্যম এবং মুনাফার হারও বেশ ভালো।",
        impact: "খুব উচ্চ"
      });
      suggestions.push({
        title: "শেয়ার বাজার ও মিউচুয়াল ফান্ড",
        description: "বিও অ্যাকাউন্টের মাধ্যমে পুঁজিবাজারে তালিকাভুক্ত শেয়ার বা মিউচুয়াল ফান্ডে বিনিয়োগ করুন। লভ্যাংশ ৫০,০০০ টাকা পর্যন্ত করমুক্ত।",
        impact: "মাঝারি"
      });
      suggestions.push({
        title: "জীবন বীমা প্রিমিয়াম",
        description: "নিজের, স্বামী/স্ত্রী বা সন্তানদের জীবন বীমার প্রিমিয়াম কর রেয়াতের জন্য যোগ্য। এটি একই সাথে সুরক্ষা এবং কর সাশ্রয় নিশ্চিত করে।",
        impact: "উচ্চ"
      });
      suggestions.push({
        title: "ট্রেজারি বন্ড (Treasury Bond)",
        description: "সরকারি ট্রেজারি বন্ডে বিনিয়োগ করে নিশ্চিত মুনাফা এবং কর সুবিধা গ্রহণ করুন। এটি দীর্ঘমেয়াদী সঞ্চয়ের জন্য উপযোগী।",
        impact: "উচ্চ"
      });
    }

    setResult({
      maxInvestmentAllowed,
      actualInvestmentForRebate,
      rebateAmount,
      potentialMaxRebate,
      additionalInvestmentNeeded,
      gap: potentialMaxRebate - rebateAmount,
      suggestions
    });
  };

  return (
    <div className="space-y-8">
      <SectionGuide 
        title="ট্যাক্স রিবেট প্ল্যানার গাইড"
        steps={[
          "আপনার মোট আয় এবং বর্তমান বিনিয়োগের তথ্য দিন।",
          "সিস্টেম আপনাকে জানাবে আপনি সর্বোচ্চ কত টাকা ট্যাক্স রেয়াত পেতে পারেন।",
          "আমাদের ভেরিফাইড পার্টনারদের মাধ্যমে বিনিয়োগ করে ট্যাক্স সাশ্রয় করুন।",
          "আপনার ট্যাক্স প্ল্যানিং আরও উন্নত করতে এআই পরামর্শ নিন।"
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3F4F6]">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <TrendingUp className="text-[#10B981]" />
            রেয়াত প্যারামিটার (Rebate Parameters)
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#374151] mb-2">বার্ষিক করযোগ্য আয় (Annual Taxable Income - BDT)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">৳</div>
                <input 
                  type="number" 
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none font-medium"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#374151] mb-2">বর্তমান বিনিয়োগ (Current Investment - BDT)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">৳</div>
                <input 
                  type="number" 
                  value={currentInvestment}
                  onChange={(e) => setCurrentInvestment(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none font-medium"
                  placeholder="ডিপিএস, সঞ্চয়পত্র, শেয়ার ইত্যাদি"
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-xs text-emerald-700 leading-relaxed">
                <strong>পরামর্শ:</strong> বাংলাদেশে আপনি আপনার বিনিয়োগের ওপর ১৫% পর্যন্ত কর রেয়াত পেতে পারেন। সাধারণ যোগ্য খাতগুলোর মধ্যে রয়েছে ডিপিএস, জীবন বীমা, সঞ্চয়পত্র এবং তালিকাভুক্ত শেয়ার।
              </p>
            </div>

            <button 
              onClick={calculateRebate}
              className="w-full py-4 bg-[#10B981] text-white rounded-2xl font-bold shadow-lg hover:bg-[#059669] transition-all flex items-center justify-center gap-2"
            >
              <Calculator size={20} /> রেয়াত পরিকল্পনা করুন (Plan My Rebate)
            </button>
        </div>
      </div>

      <div className="space-y-6">
        {result ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111827] text-white p-8 rounded-3xl shadow-xl space-y-8"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-emerald-400">রেয়াত সারাংশ (Rebate Summary)</h3>
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Optimized
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">বর্তমান রেয়াত (Current Rebate)</p>
                <p className="text-2xl font-bold font-mono">৳{result.rebateAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">সর্বোচ্চ সম্ভাব্য (Max Potential)</p>
                <p className="text-2xl font-bold font-mono text-emerald-400">৳{result.potentialMaxRebate.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">অনুমোদিত বিনিয়োগের সীমা (Investment Limit)</span>
                <span className="font-mono">৳{result.maxInvestmentAllowed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">বিনিয়োগের ঘাটতি (Investment Gap)</span>
                <span className="font-mono text-amber-400">৳{result.additionalInvestmentNeeded.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">ট্যাক্স সাশ্রয়ের সুযোগ (Savings Opportunity)</span>
                <span className="font-mono text-emerald-400">৳{result.gap.toLocaleString()}</span>
              </div>
            </div>

            {result.gap > 0 ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <p className="text-xs text-amber-200 leading-relaxed">
                  <AlertCircle size={14} className="inline mr-1 mb-0.5" />
                  আপনি <strong>৳{result.gap.toLocaleString()}</strong> ট্যাক্স সাশ্রয় মিস করছেন। কর বছর শেষ হওয়ার আগে অতিরিক্ত <strong>৳{result.additionalInvestmentNeeded.toLocaleString()}</strong> বিনিয়োগ করুন।
                </p>
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <p className="text-xs text-emerald-200 leading-relaxed">
                  <CheckCircle2 size={14} className="inline mr-1 mb-0.5" />
                  অভিনন্দন! আপনি আপনার আয়ের স্তরের জন্য সর্বোচ্চ ট্যাক্স রেয়াত নিশ্চিত করেছেন।
                </p>
              </div>
            )}

            {result.suggestions && result.suggestions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <Sparkles size={16} /> রেয়াত পরামর্শ (Rebate Suggestions)
                </h4>
                <div className="space-y-3">
                  {result.suggestions.map((s: any, i: number) => (
                    <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-bold text-white">{s.title}</p>
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md uppercase font-bold">{s.impact}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed">{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                  <Building2 size={16} /> Investment Partners
                </h4>
                <button 
                  onClick={() => setShowPartnerModal(true)}
                  className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-white transition-all"
                >
                  Manage
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {partners.map((p) => (
                  <a 
                    key={p.id}
                    href={p.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex flex-col gap-1"
                  >
                    <p className="text-[10px] font-bold text-white">{p.name}</p>
                    <p className="text-[8px] text-gray-400">{p.description}</p>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-full bg-white border-2 border-dashed border-[#E5E7EB] rounded-3xl flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
              <TrendingUp size={32} />
            </div>
            <h4 className="font-bold text-[#374151]">Plan Your Savings</h4>
            <p className="text-sm text-[#6B7280] mt-2 max-w-[200px]">Calculate how much you can save on taxes through smart investments.</p>
            <button 
              onClick={() => setShowPartnerModal(true)}
              className="mt-6 text-xs font-bold text-brand-600 hover:underline flex items-center gap-2"
            >
              <Plus size={14} /> Manage Investment Partners
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPartnerModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPartnerModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-zinc-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Investment Partners</h3>
                  <p className="text-sm text-zinc-500">Add or remove verified financial institutions</p>
                </div>
                <button onClick={() => setShowPartnerModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Partner Name</label>
                      <input 
                        type="text"
                        value={newPartner.name}
                        onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                        placeholder="e.g. MetLife"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Website URL</label>
                      <input 
                        type="text"
                        value={newPartner.url}
                        onChange={(e) => setNewPartner({ ...newPartner, url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Description</label>
                    <input 
                      type="text"
                      value={newPartner.description}
                      onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
                      placeholder="e.g. Life Insurance & Savings"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    />
                  </div>
                  <button 
                    onClick={addPartner}
                    disabled={isAddingPartner || !newPartner.name || !newPartner.url}
                    className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add Partner
                  </button>
                </div>

                <div className="h-px bg-zinc-100" />

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {partners.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div>
                        <p className="font-bold text-sm text-zinc-900">{p.name}</p>
                        <p className="text-xs text-zinc-500">{p.url}</p>
                      </div>
                      <button 
                        onClick={() => deletePartner(p.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
}

function HSCodeFinder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fobValue, setFobValue] = useState<number>(0);
  const [insurance, setInsurance] = useState<number>(1); // Default 1%
  const [freight, setFreight] = useState<number>(0);

  const calculateTotalDuty = (item: any) => {
    const cfr = fobValue + freight;
    const insuranceValue = (cfr * insurance) / 100;
    const assessableValue = cfr + insuranceValue;
    
    const cd = (assessableValue * item.cd) / 100;
    const rd = (assessableValue * item.rd) / 100;
    const sd = ((assessableValue + cd + rd) * item.sd) / 100;
    const vat = ((assessableValue + cd + rd + sd) * item.vat) / 100;
    const ait = (assessableValue * item.ait) / 100;
    const at = (assessableValue * item.at) / 100;
    
    return cd + rd + sd + vat + ait + at;
  };

  const searchHSCode = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/hscode/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError("We couldn't connect to the HS Code database. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionGuide 
        title="এইচএস কোড ফাইন্ডার গাইড"
        steps={[
          "আপনার পণ্যের নাম বা বিবরণ (Description) লিখুন।",
          "এআই সার্চ ইঞ্জিন আপনাকে সবচেয়ে সঠিক এইচএস কোডটি খুঁজে দেবে।",
          "কোডের সাথে সংশ্লিষ্ট শুল্কের হারগুলোও দেখে নিন।",
          "ভুল এইচএস কোড ব্যবহারের ঝুঁকি এড়ান।"
        ]}
      />
      <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100">
            <Cpu size={12} /> Asycuda BI System
          </div>
        </div>
        
        <h3 className="text-2xl font-black font-display tracking-tight mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <Search size={24} />
          </div>
          AI-Powered HS Code Finder
        </h3>

        <div className="space-y-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchHSCode()}
                placeholder="Search by product name (e.g., 'solar panel', 'electric motor')..."
                className="w-full pl-14 pr-4 py-5 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium text-sm"
              />
            </div>
            <button 
              onClick={searchHSCode}
              disabled={loading || !query.trim()}
              className="px-10 py-5 bg-brand-500 text-white rounded-2xl font-black shadow-xl shadow-brand-500/20 hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center gap-3 active:scale-95"
            >
              {loading ? 'Searching...' : <><Search size={20} /> Find Codes</>}
            </button>
          </div>

          {error && (
            <AIErrorDisplay 
              error={error} 
              onRetry={searchHSCode} 
              className="mt-8"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-50">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">FoB Value (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input 
                  type="number" 
                  value={fobValue || ''}
                  onChange={(e) => setFobValue(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Insurance (%)</label>
              <div className="relative">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input 
                  type="number" 
                  value={insurance || ''}
                  onChange={(e) => setInsurance(Number(e.target.value))}
                  placeholder="1.0"
                  className="w-full pl-10 pr-4 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Freight (USD)</label>
              <div className="relative">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input 
                  type="number" 
                  value={freight || ''}
                  onChange={(e) => setFreight(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {results.length > 0 ? (
          results.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-[#F3F4F6] hover:border-[#10B981] transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold font-mono">
                      {item.hsCode}
                    </span>
                    <span className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Bangladesh Customs Tariff</span>
                  </div>
                  <h4 className="text-lg font-bold text-[#111827] mb-2">{item.description}</h4>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  <DutyBadge label="CD" value={item.cd} />
                  <DutyBadge label="SD" value={item.sd} />
                  <DutyBadge label="VAT" value={item.vat} />
                  <DutyBadge label="AIT" value={item.ait} />
                  <DutyBadge label="RD" value={item.rd} />
                  <DutyBadge label="AT" value={item.at} />
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Estimated Total Duty</p>
                    <p className="text-lg font-black text-zinc-900">
                      {fobValue > 0 ? `৳${calculateTotalDuty(item).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : 'Enter FoB to calculate'}
                    </p>
                  </div>
                </div>
                <button className="w-full md:w-auto px-6 py-3 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                  Apply to Manifest <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          ))
        ) : !loading && query && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mx-auto mb-6">
              <Search size={40} />
            </div>
            <h4 className="text-lg font-bold text-[#374151]">No results yet</h4>
            <p className="text-[#6B7280] max-w-xs mx-auto mt-2">Try searching for a specific product category or item name.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DutyBadge({ label, value }: { label: string, value: number }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-bold text-[#6B7280] mb-1">{label}</p>
      <div className="w-12 h-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex items-center justify-center font-bold text-sm text-[#111827]">
        {value}%
      </div>
    </div>
  );
}

function CryptoTaxAdvisory() {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Welcome to the Web3 Crypto Tax Advisory. I am your Bloomberg-level expert on blockchain taxation. How can I assist you with your digital asset compliance today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const advRes = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [...messages, { role: 'user', text: userMsg }].map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
          systemInstruction: "You are a world-class Web3 and Blockchain Tax Expert with Bloomberg-level insights. Provide detailed, professional advice on crypto taxation, DeFi, NFTs, and cross-border digital asset compliance. Use technical terminology accurately."
        })
      });

      if (!advRes.ok) throw new Error(`HTTP ${advRes.status}`);
      const advData = await advRes.json();
      
      setMessages(prev => [...prev, { role: 'model', text: advData.text || "I apologize, but I couldn't process that request." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to the advisory network. Please check your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      <SectionGuide 
        title="ক্রিপ্টো ট্যাক্স অ্যাডভাইজরি গাইড"
        steps={[
          "আপনার ক্রিপ্টোকারেন্সি বা ডিজিটাল অ্যাসেট সংক্রান্ত যেকোনো ট্যাক্স প্রশ্ন নিচে লিখুন।",
          "আমাদের এআই অ্যাডভাইজার ব্লুমবার্গ-লেভেল এক্সপার্ট হিসেবে আপনাকে পরামর্শ দেবে।",
          "DeFi স্ট্যাকিং, NFT ক্যাপিটাল গেইনস বা ক্রস-বর্ডার ট্রানজ্যাকশন সম্পর্কে বিস্তারিত জানতে পারবেন।",
          "পরামর্শগুলো সাধারণ নির্দেশিকা হিসেবে ব্যবহার করুন এবং জটিল ক্ষেত্রে পেশাদার পরামর্শ নিন।"
        ]}
      />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-zinc-900 tracking-tighter font-display">Crypto Tax Advisory</h2>
          <p className="text-zinc-500">Bloomberg-level insights for digital asset compliance.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
          <Zap size={14} className="animate-pulse" /> Live Web3 Node
        </div>
      </div>

      <div className="neo-card h-[600px] flex flex-col overflow-hidden rounded-[2.5rem]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {messages.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex",
                m.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[80%] p-5 rounded-3xl text-sm leading-relaxed",
                m.role === 'user' 
                  ? "bg-zinc-900 text-white rounded-tr-none shadow-xl" 
                  : "bg-zinc-100 text-zinc-900 rounded-tl-none border border-zinc-200"
              )}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-100 p-5 rounded-3xl rounded-tl-none border border-zinc-200 flex gap-1">
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>
        <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex gap-4">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about DeFi yield, NFT capital gains, or cross-chain tax..."
            className="flex-1 px-6 py-4 bg-white border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-brand-500/10 outline-none text-sm transition-all"
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-4 bg-zinc-900 text-white rounded-2xl hover:bg-black transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function BlockchainVerification() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState('');
  const [manualHash, setManualHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'manual'>('upload');
  const [historySearch, setHistorySearch] = useState('');
  const [isAutoChecking, setIsAutoChecking] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/blockchain/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setResult(null);
    setIsAutoChecking(true);
    
    try {
      const buffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setHash(hashHex);

      // Auto-check if already exists
      const res = await fetch('/api/blockchain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileHash: hashHex,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          checkOnly: true // We can add this flag to server if we want to avoid auto-anchoring, 
                         // but current server logic is fine as it returns existing if found.
        })
      });
      const data = await res.json();
      if (data.anchored === false) {
        // It was already there, so we show the result immediately
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAutoChecking(false);
    }
  };

  const verifyOnChain = async (targetHash: string, name?: string, size?: number) => {
    if (!targetHash || verifying) return;
    setVerifying(true);
    try {
      const res = await fetch('/api/blockchain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileHash: targetHash,
          fileName: name || 'Manual Entry',
          fileSize: size || 0
        })
      });
      const data = await res.json();
      setResult(data);
      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const filteredHistory = history.filter(h => 
    h.fileName.toLowerCase().includes(historySearch.toLowerCase()) ||
    h.txHash.toLowerCase().includes(historySearch.toLowerCase()) ||
    h.fileHash.toLowerCase().includes(historySearch.toLowerCase())
  );

  const downloadHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "blockchain_verification_history.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      <SectionGuide 
        title="ব্লকচেইন ভেরিফিকেশন গাইড"
        steps={[
          "আপনার ট্যাক্স ডকুমেন্ট বা ইনভয়েস ফাইলটি (PDF, Image) ড্রপ করুন বা আপলোড করুন।",
          "সিস্টেম স্বয়ংক্রিয়ভাবে ফাইলের SHA-256 ক্রিপ্টোগ্রাফিক ফিঙ্গারপ্রিন্ট তৈরি করবে এবং এটি আগে থেকেই ভেরিফাইড কি না তা পরীক্ষা করবে।",
          "যদি ফাইলটি নতুন হয়, তবে 'Verify & Anchor' বাটনে ক্লিক করে এটি ব্লকচেইনে সিকিউরলি অ্যাঙ্কর করুন।",
          "ভবিষ্যতে যেকোনো সময় একই ফাইল আপলোড করে বা হ্যাশ কোড দিয়ে এর সত্যতা যাচাই করতে পারবেন।"
        ]}
      />
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
          <Zap size={14} className="animate-pulse" /> Decentralized Trust Engine
        </div>
        <h2 className="text-5xl font-black text-zinc-900 tracking-tighter font-display">Blockchain Verification</h2>
        <p className="text-zinc-500 max-w-xl mx-auto text-lg">Anchor your critical documents to the Ethereum blockchain for immutable proof of integrity.</p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-zinc-100 rounded-2xl shadow-inner">
          <button 
            onClick={() => { setActiveSubTab('upload'); setResult(null); }}
            className={cn(
              "px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeSubTab === 'upload' ? "bg-white text-zinc-900 shadow-lg" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <FileText size={18} /> File Upload
          </button>
          <button 
            onClick={() => { setActiveSubTab('manual'); setResult(null); }}
            className={cn(
              "px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeSubTab === 'manual' ? "bg-white text-zinc-900 shadow-lg" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <Fingerprint size={18} /> Manual Hash
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="neo-card p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            
            {activeSubTab === 'upload' ? (
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Anchor Document</h3>
                  {file && (
                    <button 
                      onClick={() => { setFile(null); setHash(''); setResult(null); }}
                      className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <X size={14} /> Clear
                    </button>
                  )}
                </div>
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-[2.5rem] p-16 text-center transition-all cursor-pointer group relative overflow-hidden",
                    file ? "border-brand-500 bg-brand-50/30" : "border-zinc-200 bg-zinc-50/50 hover:border-brand-500"
                  )}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input 
                    id="file-upload"
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <div className={cn(
                    "w-24 h-24 rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6 transition-all duration-700",
                    file ? "bg-brand-500 text-white rotate-0 scale-110" : "bg-white text-zinc-400 group-hover:rotate-12 group-hover:scale-110"
                  )}>
                    {isAutoChecking ? (
                      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
                    ) : file ? <Check size={48} className="stroke-[3]" /> : <FileSearch size={48} />}
                  </div>
                  <p className="text-xl font-black text-zinc-900">{file ? file.name : 'Drop file here'}</p>
                  <p className="text-sm text-zinc-400 mt-2 font-medium">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, DOCX, or Image (Max 10MB)'}
                  </p>
                </div>

                {hash && !result && !isAutoChecking && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-6 bg-zinc-900 text-white rounded-3xl space-y-4 relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Fingerprint size={100} />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 relative z-10">Cryptographic Hash Generated</p>
                      </div>
                      <p className="text-xs font-mono break-all leading-relaxed relative z-10 text-zinc-300">{hash}</p>
                    </div>
                    <button 
                      onClick={() => verifyOnChain(hash, file?.name, file?.size)}
                      disabled={verifying}
                      className="w-full py-6 bg-brand-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-brand-500/30 hover:bg-brand-700 hover:translate-y-[-2px] active:translate-y-[1px] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {verifying ? (
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      ) : <Fingerprint size={24} />}
                      Anchor on Blockchain
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 relative z-10">
                <h3 className="text-xl font-bold">Manual Verification</h3>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Enter SHA-256 Hash</label>
                  <div className="relative">
                    <textarea 
                      value={manualHash}
                      onChange={(e) => setManualHash(e.target.value)}
                      placeholder="Paste the 64-character hex hash here..."
                      className="w-full px-8 py-6 bg-zinc-50 border border-zinc-100 rounded-3xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none font-mono text-sm min-h-[150px] transition-all resize-none"
                    />
                    <div className="absolute bottom-4 right-4 text-[10px] font-mono text-zinc-300">
                      {manualHash.length}/64
                    </div>
                  </div>
                  <button 
                    onClick={() => verifyOnChain(manualHash)}
                    disabled={verifying || manualHash.length < 64}
                    className="w-full py-6 bg-zinc-900 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-black hover:translate-y-[-2px] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {verifying ? (
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : <Search size={24} />}
                    Verify Document Hash
                  </button>
                </div>
              </div>
            )}
          </div>

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="neo-card p-10 rounded-[2.5rem] bg-emerald-50 border-emerald-100 space-y-8 relative overflow-hidden shadow-2xl shadow-emerald-500/10"
            >
              <div className="absolute top-0 right-0 p-10 text-emerald-200/30">
                <ShieldCheck size={150} />
              </div>
              <div className="flex items-center gap-6 text-emerald-600 relative z-10">
                <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h4 className="text-2xl font-black tracking-tight">Verification Successful</h4>
                  <p className="text-sm text-emerald-700 font-medium mt-1">Immutable proof of integrity confirmed.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 relative z-10">
                <ResultDetail label="Status" value={result.anchored ? "Newly Anchored" : "Previously Verified"} color="text-emerald-700" />
                <ResultDetail label="Network" value={result.data.network} />
                <ResultDetail label="Timestamp" value={new Date(result.data.createdAt).toLocaleString()} />
                <div className="pt-6 space-y-3">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Blockchain Transaction Hash</p>
                  <div className="p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-100 font-mono text-xs break-all leading-relaxed shadow-inner">
                    {result.data.txHash}
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4 relative z-10">
                <button className="flex-1 py-4 bg-white text-emerald-700 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
                  <Download size={18} /> Download Certificate
                </button>
                <button className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
                  <ExternalLink size={18} /> View on Explorer
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <History size={24} className="text-brand-500" />
              Verification Log
            </h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={downloadHistory}
                className="p-2.5 bg-white border border-zinc-100 text-zinc-400 rounded-xl hover:text-brand-500 hover:border-brand-500 transition-all shadow-sm"
                title="Export History"
              >
                <Download size={18} />
              </button>
              <span className="px-4 py-1.5 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                {history.length} Records
              </span>
            </div>
          </div>

          <div className="px-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text"
                placeholder="Search by filename, hash, or transaction..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none text-sm font-medium transition-all shadow-sm"
              />
            </div>
          </div>
          
          <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar px-1">
            {filteredHistory.length > 0 ? filteredHistory.map((h, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="neo-card p-6 rounded-[2rem] flex items-center gap-6 group hover:border-brand-500/30 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500"
              >
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-all duration-700 group-hover:rotate-6 shadow-inner">
                  <Shield size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-zinc-900 truncate group-hover:text-brand-600 transition-colors">{h.fileName}</p>
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-400 rounded text-[8px] font-black uppercase tracking-widest shrink-0">
                      {(h.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-zinc-400 font-mono truncate max-w-[120px]">{h.txHash}</p>
                      <div className="w-1 h-1 bg-zinc-200 rounded-full" />
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{h.network}</p>
                    </div>
                    <p className="text-[9px] text-zinc-300 font-mono truncate">Hash: {h.fileHash}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5 justify-end text-emerald-600 mb-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-bold">{new Date(h.createdAt).toLocaleDateString()}</p>
                  <p className="text-[9px] text-zinc-300 mt-0.5">{new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-32 bg-zinc-50/50 rounded-[3rem] border-2 border-dashed border-zinc-200">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-200 shadow-xl">
                  <Fingerprint size={48} />
                </div>
                <h4 className="text-xl font-black text-zinc-400">No Records Found</h4>
                <p className="text-sm text-zinc-400 mt-2 max-w-[250px] mx-auto font-medium">Try adjusting your search or upload a new document to verify.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultDetail({ label, value, color = "text-zinc-900" }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-emerald-100/50 last:border-0">
      <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">{label}</span>
      <span className={cn("text-xs font-bold", color)}>{value}</span>
    </div>
  );
}

function TokenizedCertificates() {
  const [certs, setCerts] = useState<any[]>([]);
  const [minting, setMinting] = useState(false);
  const [address, setAddress] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    try {
      const res = await fetch('/api/blockchain/certificates');
      const data = await res.json();
      setCerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setCerts([]);
    }
  };

  const mintCert = async (type: string) => {
    if (!address || address.length < 42) {
      alert("Please enter a valid wallet address first.");
      return;
    }
    setMinting(true);
    try {
      const res = await fetch('/api/blockchain/certificates/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerAddress: address, certType: type })
      });
      if (res.ok) {
        fetchCerts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMinting(false);
    }
  };

  const handleUpdateAddress = () => {
    if (tempAddress.startsWith('0x') && tempAddress.length === 42) {
      setAddress(tempAddress);
      setIsEditingAddress(false);
    } else {
      alert("Please enter a valid Ethereum-style address (0x...)");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      <SectionGuide 
        title="কমপ্লায়েন্স এনএফটি (SBT) গাইড"
        steps={[
          "প্রথমে আপনার ওয়ালেট অ্যাড্রেসটি নিশ্চিত করুন। আপনি চাইলে অ্যাড্রেসটি পরিবর্তন করতে পারেন।",
          "আপনার ট্যাক্স কমপ্লায়েন্স স্ট্যাটাস অনুযায়ী সঠিক সার্টিফিকেট টাইপ নির্বাচন করুন।",
          "'Mint SBT Certificate' বাটনে ক্লিক করে আপনার ডিজিটাল সার্টিফিকেট তৈরি করুন।",
          "এটি একটি Soulbound Token (SBT) হিসেবে আপনার ওয়ালেটে ইস্যু করা হবে যা ট্রান্সফার করা যায় না।",
          "আপনার পোর্টফোলিওতে থাকা এনএফটি-টি যেকোনো থার্ড-পার্টিকে আপনার ট্যাক্স ক্লিয়ারেন্সের প্রমাণ হিসেবে দেখাতে পারবেন।"
        ]}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-zinc-900 tracking-tighter font-display">Compliance NFTs</h2>
          <p className="text-zinc-500 max-w-xl text-lg">Tokenized tax compliance certificates issued as Soulbound Tokens (SBTs) for immutable proof of standing.</p>
        </div>
        
        <div className="p-6 bg-zinc-900 text-white rounded-[2rem] shadow-2xl space-y-4 min-w-[300px]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Cpu size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Active Wallet</p>
                <p className="text-xs font-mono">{address.slice(0, 6)}...{address.slice(-4)}</p>
              </div>
            </div>
            <button 
              onClick={() => { setIsEditingAddress(true); setTempAddress(address); }}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
            >
              <Pencil size={14} />
            </button>
          </div>

          {isEditingAddress && (
            <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
              <input 
                type="text"
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-mono focus:border-brand-500 outline-none"
                placeholder="0x..."
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingAddress(false)}
                  className="flex-1 py-2 bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateAddress}
                  className="flex-1 py-2 bg-brand-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-600"
                >
                  Update
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'VAT Compliance', desc: 'Verified VAT standing for FY 2025-26', icon: <Percent size={24} />, color: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
          { title: 'Tax Clearance', desc: 'Full individual income tax clearance', icon: <ShieldCheck size={24} />, color: 'bg-blue-500', glow: 'shadow-blue-500/20' },
          { title: 'Export Merit', desc: 'Certified export-oriented business status', icon: <Ship size={24} />, color: 'bg-purple-500', glow: 'shadow-purple-500/20' }
        ].map((item, i) => (
          <div key={i} className="neo-card p-10 rounded-[2.5rem] space-y-8 group hover:scale-[1.02] transition-all relative overflow-hidden">
            <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl relative z-10", item.color, item.glow)}>
              {item.icon}
            </div>
            <div className="space-y-3 relative z-10">
              <h3 className="text-2xl font-bold">{item.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
            </div>
            <button 
              onClick={() => mintCert(item.title)}
              disabled={minting}
              className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-50 relative z-10 flex items-center justify-center gap-3"
            >
              {minting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : <Ticket size={18} />}
              Mint SBT Certificate
            </button>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-zinc-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 blur-3xl" />
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Ticket size={24} className="text-brand-500" />
            Your Tokenized Portfolio
          </h3>
          <span className="px-4 py-1.5 bg-zinc-100 text-zinc-500 rounded-full text-[10px] font-black uppercase tracking-widest">
            {certs.length} Certificates
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certs.length > 0 ? certs.map((c, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative aspect-[3/4] rounded-[3rem] overflow-hidden group shadow-2xl hover:shadow-brand-500/10 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black" />
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              
              <div className="absolute top-0 right-0 p-8">
                <div className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                  <Ticket size={24} className="text-brand-500" />
                </div>
              </div>

              <div className="absolute inset-0 p-10 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.4em]">Soulbound Token</p>
                  </div>
                  <h4 className="text-3xl font-black text-white tracking-tighter leading-tight">{c.certType}</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Official Compliance Record</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all">
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">Owner Address</p>
                      <p className="text-[10px] font-mono text-zinc-300 break-all">{c.ownerAddress}</p>
                    </div>
                    <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all">
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">Token Identity</p>
                      <p className="text-xs font-mono text-white font-bold">{c.tokenId}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Issue Date</p>
                      <p className="text-xs text-white font-medium">{new Date(c.issueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                        <ShieldCheck size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Holographic effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/0 via-brand-500/5 to-brand-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </motion.div>
          )) : (
            <div className="col-span-full py-32 text-center bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-200 shadow-sm">
                <Ticket size={40} />
              </div>
              <h4 className="text-xl font-bold text-zinc-400">No Certificates Found</h4>
              <p className="text-sm text-zinc-400 mt-2 max-w-[250px] mx-auto">Select a certificate type above to mint your first Soulbound Token.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IncomeTaxAdvisory() {
  const [income, setIncome] = useState({
    salary: '',
    houseProperty: '',
    business: '',
    capitalGains: '',
    otherSources: '',
    investments: ''
  });
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [estimation, setEstimation] = useState<any>(null);

  const calculateTax = () => {
    const incomeValues = Object.values(income) as string[];
    const totalIncome = incomeValues.reduce((acc: number, val: string) => acc + (parseFloat(val) || 0), 0) - (parseFloat(income.investments) || 0);
    
    // Basic Bangladesh Tax Slab (Simplified for 2024-25/2025-26)
    // 0-3.5L: 0%
    // 3.5-4.5L: 5%
    // 4.5-7.5L: 10%
    // 7.5-11.5L: 15%
    // 11.5-16.5L: 20%
    // Above 16.5L: 25%
    
    let tax = 0;
    let remaining = totalIncome;
    
    const slabs = [
      { limit: 350000, rate: 0 },
      { limit: 100000, rate: 0.05 },
      { limit: 300000, rate: 0.10 },
      { limit: 400000, rate: 0.15 },
      { limit: 500000, rate: 0.20 },
      { limit: Infinity, rate: 0.25 }
    ];

    for (const slab of slabs) {
      if (remaining <= 0) break;
      const taxableInSlab = Math.min(remaining, slab.limit);
      tax += taxableInSlab * slab.rate;
      remaining -= taxableInSlab;
    }

    setEstimation({
      totalIncome,
      tax,
      monthly: tax / 12
    });
  };

  const getAIAdvice = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `As a professional tax advisor in Bangladesh, analyze this income profile and provide tax-saving advice and compliance tips. 
        Income Details:
        - Salary: ${income.salary} BDT
        - House Property: ${income.houseProperty} BDT
        - Business: ${income.business} BDT
        - Capital Gains: ${income.capitalGains} BDT
        - Other: ${income.otherSources} BDT
        - Investments: ${income.investments} BDT
        
        Provide advice in a structured format with bullet points.`
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAdvice(data.text || 'No advice received.');
    } catch (err) {
      console.error(err);
      setAdvice('Error fetching advice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const scanRes = await fetch('/api/gemini/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: "Extract income and investment details from this document image. Return a JSON object with keys: salary, houseProperty, business, capitalGains, otherSources, investments. Use 0 if not found.",
              images: [{ mimeType: file.type, base64: base64Data }],
              config: { responseMimeType: "application/json" }
            })
          });

          if (!scanRes.ok) throw new Error(`HTTP ${scanRes.status}`);
          const scanData = await scanRes.json();
          const extracted = parseRobustJson<any>(scanData.text || '{}', {});
          if (extracted && typeof extracted === 'object' && Object.keys(extracted).length > 0) {
            setIncome(prev => ({ ...prev, ...extracted }));
          }
        } catch (scanErr) {
          console.error(scanErr);
          alert('OCR failed. Please try manual entry.');
        } finally {
          setOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('OCR failed. Please try manual entry.');
      setOcrLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      <SectionGuide 
        title="ইনকাম ট্যাক্স অ্যাডভাইজরি গাইড"
        steps={[
          "আপনার আয়ের বিভিন্ন উৎস অনুযায়ী টাকার পরিমাণ লিখুন।",
          "আপনার যদি কোনো বিনিয়োগ (Investment) থাকে তবে তা উল্লেখ করুন যা কর রেয়াত পেতে সাহায্য করবে।",
          "আপনার ট্যাক্স ডকুমেন্টের ছবি আপলোড করে স্বয়ংক্রিয়ভাবে তথ্য পূরণ করতে পারেন (OCR)।",
          "'Get AI Advice' বাটনে ক্লিক করে আপনার আয়ের ওপর ভিত্তি করে বিশেষজ্ঞ পরামর্শ গ্রহণ করুন।"
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="neo-card p-10 rounded-[2.5rem] space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Income Details</h3>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleOCR} 
                  className="hidden" 
                  id="ocr-upload" 
                />
                <label 
                  htmlFor="ocr-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-brand-100 transition-all"
                >
                  {ocrLoading ? <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /> : <Camera size={16} />}
                  {ocrLoading ? 'Scanning...' : 'Scan Document'}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Annual Salary', key: 'salary' },
                { label: 'House Property', key: 'houseProperty' },
                { label: 'Business Income', key: 'business' },
                { label: 'Capital Gains', key: 'capitalGains' },
                { label: 'Other Sources', key: 'otherSources' },
                { label: 'Investments', key: 'investments' },
              ].map((item) => (
                <div key={item.key} className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{item.label}</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">৳</div>
                    <input 
                      type="number"
                      value={income[item.key as keyof typeof income]}
                      onChange={(e) => setIncome({ ...income, [item.key]: e.target.value })}
                      className="w-full pl-10 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={calculateTax}
                className="flex-1 py-5 bg-zinc-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all"
              >
                Estimate Tax
              </button>
              <button 
                onClick={getAIAdvice}
                disabled={loading}
                className="flex-1 py-5 bg-brand-500 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
                Get AI Advice
              </button>
            </div>
          </div>

          {estimation && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="neo-card p-10 rounded-[2.5rem] bg-zinc-900 text-white space-y-8"
            >
              <h4 className="text-xl font-bold text-zinc-400">Tax Estimation</h4>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Taxable Income</p>
                  <p className="text-3xl font-black tracking-tighter">৳{estimation.totalIncome.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Estimated Annual Tax</p>
                  <p className="text-3xl font-black tracking-tighter text-brand-400">৳{estimation.tax.toLocaleString()}</p>
                </div>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-zinc-400">Monthly Tax Liability</span>
                  <span className="text-xl font-bold">৳{Math.round(estimation.monthly).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-8">
          <div className="neo-card p-10 rounded-[2.5rem] min-h-[600px] flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-500">
                <Bot size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">AI Tax Advisor</h3>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Personalized Compliance Strategy</p>
              </div>
            </div>

            {advice ? (
              <div className="flex-1 prose prose-zinc max-w-none">
                <div className="p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                  <div className="markdown-body whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
                    {advice}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center">
                  <MessageSquare size={48} className="text-zinc-300" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold">No Advice Yet</h4>
                  <p className="text-sm max-w-[250px] mx-auto">Fill in your income details and click 'Get AI Advice' to receive personalized tax tips.</p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-zinc-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <ShieldCheck size={14} />
                Confidential Analysis
              </div>
              <button className="p-3 bg-zinc-50 text-zinc-400 rounded-xl hover:text-brand-500 transition-all">
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinalTaxCalculator() {
  const [inputs, setInputs] = useState({
    taxYear: '2026-27',
    category: 'general',
    location: 'dhaka-ctg',
    salaryIncome: '',
    businessIncome: '',
    businessExpenses: '',
    capitalGains: '',
    rentalIncome: '',
    interestIncome: '',
    dividendIncome: '',
    customDeductions: '',
    investment: '',
    netWealth: ''
  });
  const [result, setResult] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const getAIAnalysis = async (taxData: any) => {
    setIsAiLoading(true);
    try {
      const anaRes = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `As a Bangladeshi Tax Expert, analyze this tax calculation based on Finance Bill 2026-27 (আয়কর পরিপত্র ২৬-২৭, ও আয়কর নির্দেশিকা ২৬-২৭) and provide advice in Bangla. 
            Assessment Year: ${inputs.taxYear}
            Detailed Income Breakdown:
            - Salary: ${inputs.salaryIncome} BDT
            - Business: ${inputs.businessIncome} BDT (Expenses: ${inputs.businessExpenses} BDT)
            - Capital Gains: ${inputs.capitalGains} BDT
            - Rent: ${inputs.rentalIncome} BDT
            - Interest: ${inputs.interestIncome} BDT
            - Dividends: ${inputs.dividendIncome} BDT
            - Custom Deductions: ${inputs.customDeductions} BDT
            - Investment: ${inputs.investment} BDT
            - Net Wealth: ${inputs.netWealth} BDT
            
            Calculation Results:
            - Gross Tax: ${taxData.grossTax} BDT
            - Rebate: ${taxData.rebate} BDT
            - Net Tax: ${taxData.netTax} BDT
            - Surcharge: ${taxData.surcharge} BDT
            - Total Payable: ${taxData.totalPayable} BDT
            
            Please provide:
            1. A summary of the tax liability under Finance Bill 26-27.
            2. Suggestions for further tax savings if possible.
            3. Specific compliance notes based on Income Tax Circular 26-27 and Income Tax Act 2023.`
        })
      });

      if (!anaRes.ok) throw new Error(`HTTP ${anaRes.status}`);
      const anaData = await anaRes.json();
      setAiAnalysis(anaData.text || '');
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAiAnalysis("দুঃখিত, এই মুহূর্তে এআই বিশ্লেষণ পাওয়া যাচ্ছে না। অনুগ্রহ করে পরে চেষ্টা করুন।");
    } finally {
      setIsAiLoading(false);
    }
  };

  const calculateFinalTax = () => {
    const salary = parseFloat(inputs.salaryIncome) || 0;
    const business = parseFloat(inputs.businessIncome) || 0;
    const businessExp = parseFloat(inputs.businessExpenses) || 0;
    const capGains = parseFloat(inputs.capitalGains) || 0;
    const rent = parseFloat(inputs.rentalIncome) || 0;
    const interest = parseFloat(inputs.interestIncome) || 0;
    const dividend = parseFloat(inputs.dividendIncome) || 0;
    const customDed = parseFloat(inputs.customDeductions) || 0;
    
    const income = salary + Math.max(0, business - businessExp) + capGains + rent + interest + dividend - customDed;
    
    const investment = parseFloat(inputs.investment) || 0;
    const wealth = parseFloat(inputs.netWealth) || 0;

    // 1. Determine Exemption Threshold (Finance Bill 26-27 / পরিপত্র ২৬-২৭)
    let threshold = 375000;
    if (inputs.category === 'female-senior') threshold = 425000;
    if (inputs.category === 'disabled') threshold = 500000;
    if (inputs.category === 'veteran') threshold = 525000;

    // 2. Calculate Gross Tax based on Finance Bill 26-27 Slabs
    let tax = 0;
    let remaining = income;

    const slabs = [
      { limit: threshold, rate: 0 },
      { limit: 100000, rate: 0.05 },
      { limit: 400000, rate: 0.10 },
      { limit: 500000, rate: 0.15 },
      { limit: 500000, rate: 0.20 },
      { limit: Infinity, rate: 0.25 }
    ];

    for (const slab of slabs) {
      if (remaining <= 0) break;
      const taxableInSlab = Math.min(remaining, slab.limit);
      tax += taxableInSlab * slab.rate;
      remaining -= taxableInSlab;
    }

    // 3. Calculate Rebate (Circular 26-27 Page 60)
    // Rebate = 15% of investment, limited by 3% of total income or 10L
    const rebateLimit1 = income * 0.03;
    const rebateLimit2 = investment * 0.15;
    const rebateLimit3 = 1000000;
    const rebate = Math.min(rebateLimit1, rebateLimit2, rebateLimit3);

    let netTax = Math.max(0, tax - rebate);

    // 4. Minimum Tax (NBR City Corp Rules)
    let minTax = 3000;
    if (inputs.location === 'dhaka-ctg') minTax = 5000;
    if (inputs.location === 'other-city') minTax = 4000;

    if (income > threshold && netTax < minTax) {
      netTax = minTax;
    }

    // 5. Surcharge (Finance Bill 26-27 Net Wealth Rules)
    let surcharge = 0;
    if (wealth > 40000000) { // > 4 Crore
      if (wealth <= 100000000) surcharge = netTax * 0.10;
      else if (wealth <= 200000000) surcharge = netTax * 0.20;
      else if (wealth <= 500000000) surcharge = netTax * 0.30;
      else surcharge = netTax * 0.35;
    }

    const totalPayable = netTax + surcharge;

    setResult({
      totalTaxableIncome: income,
      grossTax: tax,
      rebate,
      netTax,
      surcharge,
      totalPayable,
      threshold
    });

    // Auto-trigger AI analysis
    getAIAnalysis({
      totalTaxableIncome: income,
      grossTax: tax,
      rebate,
      netTax,
      surcharge,
      totalPayable,
      threshold
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      <SectionGuide 
        title="চূড়ান্ত ট্যাক্স ক্যালকুলেটর (আইন ও পরিপত্র ২০২৫-২৬)"
        steps={[
          "আপনার করদাতার ক্যাটাগরি এবং অবস্থান নির্বাচন করুন।",
          "আপনার মোট বার্ষিক আয় এবং বিনিয়োগের পরিমাণ লিখুন।",
          "আপনার নিট সম্পদের পরিমাণ দিন (সারচার্জ হিসাবের জন্য)।",
          "সিস্টেম আয়কর আইন ২০২৩ এবং ২০২৫-২৬ এর পরিপত্র অনুযায়ী সঠিক ট্যাক্স হিসাব করবে।"
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="neo-card p-10 rounded-[2.5rem] space-y-8">
          <h3 className="text-2xl font-bold">Tax Parameters</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Taxpayer Category</label>
                <select 
                  value={inputs.category}
                  onChange={(e) => setInputs({ ...inputs, category: e.target.value })}
                  className="w-full px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium appearance-none"
                >
                  <option value="general">General (সাধারণ)</option>
                  <option value="female-senior">Female / Senior (65+)</option>
                  <option value="disabled">Disabled / Third Gender</option>
                  <option value="veteran">War-wounded Veteran</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Location</label>
                <select 
                  value={inputs.location}
                  onChange={(e) => setInputs({ ...inputs, location: e.target.value })}
                  className="w-full px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium appearance-none"
                >
                  <option value="dhaka-ctg">Dhaka/Ctg City Corp</option>
                  <option value="other-city">Other City Corp</option>
                  <option value="outside">Outside City Corp</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest border-b border-zinc-100 pb-2">Income Sources</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Salary Income</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">৳</div>
                    <input 
                      type="number"
                      value={inputs.salaryIncome}
                      onChange={(e) => setInputs({ ...inputs, salaryIncome: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Rental Income</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">৳</div>
                    <input 
                      type="number"
                      value={inputs.rentalIncome}
                      onChange={(e) => setInputs({ ...inputs, rentalIncome: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Business Income</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">৳</div>
                    <input 
                      type="number"
                      value={inputs.businessIncome}
                      onChange={(e) => setInputs({ ...inputs, businessIncome: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Business Expenses</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">৳</div>
                    <input 
                      type="number"
                      value={inputs.businessExpenses}
                      onChange={(e) => setInputs({ ...inputs, businessExpenses: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Interest Income</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">৳</div>
                    <input 
                      type="number"
                      value={inputs.interestIncome}
                      onChange={(e) => setInputs({ ...inputs, interestIncome: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dividend Income</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">৳</div>
                    <input 
                      type="number"
                      value={inputs.dividendIncome}
                      onChange={(e) => setInputs({ ...inputs, dividendIncome: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Capital Gains</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">৳</div>
                    <input 
                      type="number"
                      value={inputs.capitalGains}
                      onChange={(e) => setInputs({ ...inputs, capitalGains: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Custom Deductions</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">৳</div>
                    <input 
                      type="number"
                      value={inputs.customDeductions}
                      onChange={(e) => setInputs({ ...inputs, customDeductions: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Investment</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">৳</div>
                <input 
                  type="number"
                  value={inputs.investment}
                  onChange={(e) => setInputs({ ...inputs, investment: e.target.value })}
                  className="w-full pl-10 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Net Wealth (নিট সম্পদ)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">৳</div>
                <input 
                  type="number"
                  value={inputs.netWealth}
                  onChange={(e) => setInputs({ ...inputs, netWealth: e.target.value })}
                  className="w-full pl-10 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[10px] text-zinc-500 italic">* ৪ কোটি টাকার বেশি সম্পদ থাকলে সারচার্জ প্রযোজ্য হবে।</p>
            </div>

            <button 
              onClick={calculateFinalTax}
              className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              {isAiLoading ? <Zap className="animate-pulse" /> : <Calculator size={18} />}
              Calculate Final Tax & AI Analysis
            </button>

            <div className="pt-4 border-t border-zinc-100">
              <a 
                href="https://chat.qwen.ai/s/deploy/t_c3dc4eaf-5703-45b2-91b1-a60551a1efb4"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-brand-50 text-brand-700 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand-100 transition-all flex items-center justify-center gap-2 border border-brand-200"
              >
                <ExternalLink size={14} />
                Consult Qwen AI (External)
              </a>
              <p className="text-[10px] text-zinc-400 text-center mt-2 italic">Qwen AI এর মাধ্যমে আরও বিস্তারিত পরামর্শ পেতে পারেন।</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="neo-card p-10 rounded-[2.5rem] bg-zinc-900 text-white space-y-10"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] mb-2">Detailed Calculation</h4>
                  <p className="text-3xl font-black tracking-tighter">Tax Summary</p>
                </div>
                <div className="px-4 py-2 bg-brand-500/20 text-brand-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                  FY 2025-26
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Taxable Income</p>
                    <p className="text-xl font-bold">৳{result.totalTaxableIncome.toLocaleString()}</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Gross Tax</p>
                    <p className="text-xl font-bold">৳{result.grossTax.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tax Rebate</p>
                    <p className="text-xl font-bold text-emerald-400">৳{result.rebate.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Net Tax (After Rebate)</p>
                    <p className="text-2xl font-black">৳{result.netTax.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Surcharge</p>
                    <p className="text-xl font-bold text-amber-400">৳{result.surcharge.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-8 bg-brand-500 rounded-[2rem] shadow-lg shadow-brand-500/20">
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Total Payable Tax</p>
                  <p className="text-5xl font-black tracking-tighter">৳{result.totalPayable.toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-4">
                <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                  * এই হিসাবটি আয়কর আইন ২০২৩ এবং ২০২৫-২৬ এর পরিপত্র অনুযায়ী করা হয়েছে। চূড়ান্ত রিটার্ন দাখিলের আগে বিশেষজ্ঞের পরামর্শ নিন।
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="neo-card p-10 rounded-[2.5rem] h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center">
                <Calculator size={48} className="text-zinc-300" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold">Ready to Calculate</h4>
                <p className="text-sm max-w-[250px] mx-auto">Enter your income, investment, and wealth details for a compliant tax calculation.</p>
              </div>
            </div>
          )}

          {aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="neo-card p-8 rounded-[2.5rem] bg-brand-50 border border-brand-100 space-y-4"
            >
              <div className="flex items-center gap-2 text-brand-700">
                <Sparkles size={20} />
                <h4 className="font-bold uppercase tracking-wider text-xs">AI Tax Advisor Analysis</h4>
              </div>
              <div className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap font-medium">
                {aiAnalysis}
              </div>
              <div className="pt-4 border-t border-brand-200 flex items-center justify-between">
                <span className="text-[10px] text-brand-600 font-bold uppercase">Powered by Gemini & Qwen Context</span>
                <Bot size={16} className="text-brand-400" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function ZakatCalculator() {
  const [assets, setAssets] = useState({
    cash: '',
    bank: '',
    gold: '',
    silver: '',
    investments: '',
    businessAssets: '',
    receivables: '',
    debts: ''
  });
  
  const [prices, setPrices] = useState({
    goldPerGram: '8500', // Approx BDT per gram
    silverPerGram: '150'  // Approx BDT per gram
  });

  const [result, setResult] = useState<any>(null);

  const verses = [
    {
      source: "Quran 2:43",
      arabic: "وَأَقِيمُوا۟ ٱلصَّلَوٰةَ وَءَاتُوا۟ ٱلزَّكَوٰةَ وَٱرْكَعُوا۟ مَعَ ٱلرَّٰكِعِينَ",
      english: "And establish prayer and give zakah and bow with those who bow [in worship and obedience].",
      bangla: "আর তোমরা সালাত কায়েম কর, যাকাত দাও এবং রুকুকারীদের সাথে রুকু কর।"
    },
    {
      source: "Quran 9:60",
      arabic: "إِنَّمَا ٱلصَّدَقَـٰتُ لِلْفُقَرَآءِ وَٱلْمَسَـٰكِينِ وَٱلْعَـٰমِلِينَ عَلَيْهَا وَٱلْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِى ٱلرِّقَابِ وَٱلْغَـٰرِمِينَ وَفِى سَبِيلِ ٱللَّهِ وَٱبْنِ ٱلسَّبِিলِ ۖ فَرِيضَةًۭ مِّنَ ٱللَّهِ ۗ وَٱللَّهُ عَلِيمٌ حَكِيمٌۭ",
      english: "Zakah expenditures are only for the poor and for the needy and for those employed to collect [zakah] and for bringing hearts together [for Islam] and for freeing captives [or slaves] and for those in debt and for the cause of Allah and for the [stranded] traveler - an obligation [imposed] by Allah . And Allah is Knowing and Wise.",
      bangla: "সাদাকাহ (যাকাত) তো কেবল ফকীর, মিসকীন, যাকাত আদায়কারী কর্মচারী, যাদের চিত্ত আকর্ষণ করা প্রয়োজন তাদের জন্য, দাসমুক্তিতে, ঋণগ্রস্তদের জন্য, আল্লাহর পথে এবং মুসাফিরদের জন্য। এটা আল্লাহর পক্ষ থেকে নির্ধারিত ফরয। আর আল্লাহ সর্বজ্ঞ, প্রজ্ঞাময়।"
    },
    {
      source: "Hadith (Bukhari)",
      arabic: "بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ",
      english: "Islam is based on five (pillars): To testify that none has the right to be worshipped but Allah and Muhammad is Allah's Messenger, to offer the (compulsory congregational) prayers dutifully and perfectly, to pay Zakat, to perform Hajj and to observe fast during the month of Ramadan.",
      bangla: "ইসলামের ভিত্তি পাঁচটি: এই সাক্ষ্য দেয়া যে, আল্লাহ ছাড়া কোনো ইলাহ নেই এবং মুহাম্মাদ আল্লাহর রাসূল, সালাত কায়েম করা, যাকাত প্রদান করা, হাজ্জ পালন করা এবং রমযানের সিয়াম পালন করা।"
    }
  ];

  const calculateZakat = () => {
    const cashVal = parseFloat(assets.cash) || 0;
    const bankVal = parseFloat(assets.bank) || 0;
    const goldVal = (parseFloat(assets.gold) || 0) * (parseFloat(prices.goldPerGram) || 0);
    const silverVal = (parseFloat(assets.silver) || 0) * (parseFloat(prices.silverPerGram) || 0);
    const investVal = parseFloat(assets.investments) || 0;
    const businessVal = parseFloat(assets.businessAssets) || 0;
    const receiveVal = parseFloat(assets.receivables) || 0;
    const debtVal = parseFloat(assets.debts) || 0;

    const totalWealth = cashVal + bankVal + goldVal + silverVal + investVal + businessVal + receiveVal;
    const netWealth = totalWealth - debtVal;

    // Nisab calculation
    // 52.5 Tola Silver = 612.36 grams
    const nisabSilver = 612.36 * (parseFloat(prices.silverPerGram) || 0);
    
    const isEligible = netWealth >= nisabSilver;
    const zakatPayable = isEligible ? netWealth * 0.025 : 0;

    setResult({
      totalWealth,
      netWealth,
      nisabSilver,
      isEligible,
      zakatPayable
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      <SectionGuide 
        title="যাকাত ক্যালকুলেটর গাইড"
        steps={[
          "আপনার কাছে থাকা নগদ টাকা এবং ব্যাংকে জমানো টাকার পরিমাণ লিখুন।",
          "স্বর্ণ ও রূপার ওজন (গ্রামে) প্রদান করুন। বর্তমান বাজার মূল্য অনুযায়ী নিসাব হিসাব করা হবে।",
          "ব্যবসায়িক পণ্য এবং বিনিয়োগের বর্তমান বাজার মূল্য যোগ করুন।",
          "আপনার যদি কোনো ঋণ থাকে তবে তা বাদ দিন।",
          "সিস্টেম স্বয়ংক্রিয়ভাবে ২.৫% হারে আপনার প্রদেয় যাকাতের পরিমাণ হিসাব করবে।"
        ]}
      />

      {/* Quran & Hadith Verses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {verses.map((v, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="neo-card p-6 rounded-3xl bg-white/50 backdrop-blur-sm border border-brand-100/50 space-y-4"
          >
            <div className="flex items-center gap-2 text-brand-600 mb-2">
              <Book size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{v.source}</span>
            </div>
            <p className="text-lg font-arabic text-right leading-relaxed text-zinc-800" dir="rtl">
              {v.arabic}
            </p>
            <div className="space-y-3 pt-2 border-t border-zinc-100">
              <p className="text-xs text-zinc-600 leading-relaxed italic">
                "{v.english}"
              </p>
              <p className="text-xs text-zinc-800 font-medium leading-relaxed">
                "{v.bangla}"
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="neo-card p-10 rounded-[2.5rem] space-y-8">
            <h3 className="text-2xl font-bold">Wealth Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cash in Hand</label>
                <input 
                  type="number"
                  value={assets.cash}
                  onChange={(e) => setAssets({ ...assets, cash: e.target.value })}
                  className="w-full px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cash in Bank</label>
                <input 
                  type="number"
                  value={assets.bank}
                  onChange={(e) => setAssets({ ...assets, bank: e.target.value })}
                  className="w-full px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Gold (Grams)</label>
                <input 
                  type="number"
                  value={assets.gold}
                  onChange={(e) => setAssets({ ...assets, gold: e.target.value })}
                  className="w-full px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Silver (Grams)</label>
                <input 
                  type="number"
                  value={assets.silver}
                  onChange={(e) => setAssets({ ...assets, silver: e.target.value })}
                  className="w-full px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Investments (Stocks/Bonds)</label>
                <input 
                  type="number"
                  value={assets.investments}
                  onChange={(e) => setAssets({ ...assets, investments: e.target.value })}
                  className="w-full px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Business Assets</label>
                <input 
                  type="number"
                  value={assets.businessAssets}
                  onChange={(e) => setAssets({ ...assets, businessAssets: e.target.value })}
                  className="w-full px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-red-400 uppercase tracking-widest">Debts & Liabilities</label>
                <input 
                  type="number"
                  value={assets.debts}
                  onChange={(e) => setAssets({ ...assets, debts: e.target.value })}
                  className="w-full px-4 py-4 bg-red-50/30 border border-red-100 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-medium"
                  placeholder="0.00"
                />
              </div>
            </div>

            <button 
              onClick={calculateZakat}
              className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all"
            >
              Calculate Zakat
            </button>
          </div>

          <div className="neo-card p-10 rounded-[2.5rem] space-y-6">
            <h3 className="text-xl font-bold">Market Rates (BDT)</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Gold Price / Gram</label>
                <input 
                  type="number"
                  value={prices.goldPerGram}
                  onChange={(e) => setPrices({ ...prices, goldPerGram: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Silver Price / Gram</label>
                <input 
                  type="number"
                  value={prices.silverPerGram}
                  onChange={(e) => setPrices({ ...prices, silverPerGram: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="neo-card p-10 rounded-[2.5rem] bg-zinc-900 text-white space-y-10"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] mb-2">Calculation Result</h4>
                  <p className="text-3xl font-black tracking-tighter">
                    {result.isEligible ? 'Eligible for Zakat' : 'Below Nisab Threshold'}
                  </p>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest",
                  result.isEligible ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                )}>
                  {result.isEligible ? 'Must Pay' : 'Not Required'}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Net Wealth</p>
                  <p className="text-4xl font-black tracking-tighter">৳{result.netWealth.toLocaleString()}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Nisab (Silver)</p>
                    <p className="text-xl font-bold">৳{Math.round(result.nisabSilver).toLocaleString()}</p>
                  </div>
                  <div className="p-6 bg-brand-500 rounded-3xl">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Zakat Payable</p>
                    <p className="text-2xl font-black">৳{result.zakatPayable.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed italic">
                  * Zakat is calculated at 2.5% of your net wealth if it exceeds the Nisab threshold. The Nisab is calculated based on the current market price of 52.5 Tola (612.36g) of Silver.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="neo-card p-10 rounded-[2.5rem] h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center">
                <Coins size={48} className="text-zinc-300" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold">Ready to Calculate</h4>
                <p className="text-sm max-w-[250px] mx-auto">Enter your assets and liabilities to see your Zakat eligibility and amount.</p>
              </div>
            </div>
          )}

          <div className="neo-card p-10 rounded-[2.5rem] space-y-6">
            <h4 className="text-lg font-bold">Important Notes</h4>
            <ul className="space-y-4">
              {[
                "যাকাত ফরজ হওয়ার জন্য সম্পদ নিসাব পরিমাণ হতে হবে এবং তা এক বছর স্থায়ী হতে হবে।",
                "ব্যক্তিগত ব্যবহারের অলঙ্কার (স্বর্ণ/রূপা) যাকাতের অন্তর্ভুক্ত হবে যদি তা নিসাব স্পর্শ করে।",
                "ব্যবসায়িক পণ্যের বর্তমান বাজার মূল্যের ওপর যাকাত হিসাব করতে হবে।",
                "ঋণ থাকলে তা মোট সম্পদ থেকে বাদ দিয়ে নিসাব হিসাব করতে হবে।"
              ].map((note, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionView() {
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'bank' | 'crypto'>('online');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const plans = [
    { name: 'Basic', price: 999, features: ['VAT Calculator', 'Tax History', 'Basic Reports'], color: 'bg-blue-500' },
    { name: 'Pro', price: 2499, features: ['All Basic features', 'AI Tax Advisor', 'HS Code Finder', 'Priority Support'], color: 'bg-emerald-500', popular: true },
    { name: 'Enterprise', price: 9999, features: ['All Pro features', 'Custom Compliance Audit', 'Multi-user Access', 'API Integration'], color: 'bg-purple-500' }
  ];

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription');
      const data = await res.json();
      setCurrentSub(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if ((paymentMethod === 'online' || paymentMethod === 'crypto') && !transactionId) {
      alert(`Please enter ${paymentMethod === 'online' ? 'Transaction ID' : 'Transaction Hash'} for payment.`);
      return;
    }
    setSubmitting(true);
    try {
      const endpoint = paymentMethod === 'online' ? '/api/subscription/subscribe' : 
                      paymentMethod === 'bank' ? '/api/subscription/bank-payment' :
                      '/api/subscription/subscribe'; // Crypto also uses subscribe for now
      
      const body = { 
        planName: selectedPlan.name, 
        paymentMethod, 
        amount: selectedPlan.price, 
        transactionId: transactionId || 'BANK_SLIP_PENDING' 
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        alert(paymentMethod === 'bank' ? 'Payment submitted for verification.' : 'Subscription activated!');
        setShowPaymentModal(false);
        fetchSubscription();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-12">
      <SectionGuide 
        title="সাবস্ক্রিপশন গাইড"
        steps={[
          "আপনার প্রয়োজন অনুযায়ী বেসিক, প্রো বা এন্টারপ্রাইজ প্ল্যান বেছে নিন।",
          "অনলাইন পেমেন্ট (বিকাশ/নগদ), ব্যাংক ট্রান্সফার বা ক্রিপ্টোকারেন্সি ব্যবহার করে পে করুন।",
          "পেমেন্ট কনফার্ম হওয়ার পর আপনার প্রো ফিচারগুলো আনলক হয়ে যাবে।",
          "আপনার সাবস্ক্রিপশন হিস্ট্রি এবং রিনিউয়াল ডেট এখান থেকে ম্যানেজ করুন।"
        ]}
      />
      {currentSub && currentSub.status === 'active' ? (
        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-emerald-900">Active Subscription: {currentSub.planName}</h3>
            <p className="text-emerald-700 mt-1">Your plan expires on {new Date(currentSub.expiresAt).toLocaleDateString()}</p>
          </div>
          <div className="px-6 py-2 bg-emerald-500 text-white rounded-full font-bold text-sm">
            PRO STATUS
          </div>
        </div>
      ) : currentSub && currentSub.status === 'pending' ? (
        <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-amber-900">Payment Pending Verification</h3>
          <p className="text-amber-700 mt-1">We are reviewing your bank payment for the {currentSub.planName} plan. This usually takes 24 hours.</p>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Choose Your Plan</h2>
          <p className="text-[#6B7280]">Unlock advanced tax tools and AI insights.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.name} className={cn(
            "bg-white p-8 rounded-3xl shadow-sm border-2 transition-all relative overflow-hidden",
            plan.popular ? "border-[#10B981] scale-105" : "border-[#F3F4F6]"
          )}>
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-[#10B981] text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
                Most Popular
              </div>
            )}
            <div className={cn("w-12 h-12 rounded-2xl mb-6 flex items-center justify-center text-white", plan.color)}>
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-bold">৳{plan.price}</span>
              <span className="text-[#6B7280] text-sm">/year</span>
            </div>
            <ul className="space-y-4 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-[#374151]">
                  <CheckCircle2 size={16} className="text-[#10B981]" />
                  {f}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => { setSelectedPlan(plan); setShowPaymentModal(true); }}
              className={cn(
                "w-full py-4 rounded-2xl font-bold transition-all",
                plan.popular ? "bg-[#10B981] text-white shadow-lg" : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
              )}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-[#F3F4F6] bg-[#F9FAFB]">
                <h3 className="text-xl font-bold">Complete Subscription</h3>
                <p className="text-sm text-[#6B7280] mt-1">Plan: {selectedPlan?.name} (৳{selectedPlan?.price})</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex p-1 bg-[#F3F4F6] rounded-2xl">
                  <button 
                    onClick={() => setPaymentMethod('online')}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                      paymentMethod === 'online' ? "bg-white shadow-sm text-[#10B981]" : "text-[#6B7280]"
                    )}
                  >
                    Online Payment
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('bank')}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                      paymentMethod === 'bank' ? "bg-white shadow-sm text-[#3B82F6]" : "text-[#6B7280]"
                    )}
                  >
                    Bank Transfer
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('crypto')}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                      paymentMethod === 'crypto' ? "bg-white shadow-sm text-amber-500" : "text-[#6B7280]"
                    )}
                  >
                    Crypto
                  </button>
                </div>

                {paymentMethod === 'online' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-xs text-emerald-800 font-medium">Pay via bKash/Nagad/Rocket to: <strong>01917179881</strong></p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-2 uppercase tracking-wider">Transaction ID</label>
                      <input 
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter your TrxID"
                        className="w-full px-4 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#10B981] outline-none font-medium"
                      />
                    </div>
                  </div>
                ) : paymentMethod === 'bank' ? (
                  <div className="space-y-4">
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                      <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Bank Details</p>
                      <div className="space-y-1">
                        <p className="text-sm font-bold">VATX.BD</p>
                        <p className="text-sm">Bank: City Bank</p>
                        <p className="text-sm">A/C: 1234567890</p>
                        <p className="text-sm">Branch: Gulshan</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#6B7280] italic text-center">Please upload your payment slip or email it to billing@vatx.bd after transfer.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 space-y-3">
                      <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Crypto Payment (USDT/USDC)</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-500">Network</span>
                          <span className="font-bold">Polygon / ERC20</span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-amber-200 break-all text-[10px] font-mono">
                          0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#374151] mb-2 uppercase tracking-wider">Transaction Hash</label>
                      <input 
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                      />
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleSubscribe}
                  disabled={submitting}
                  className="w-full py-4 bg-[#111827] text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

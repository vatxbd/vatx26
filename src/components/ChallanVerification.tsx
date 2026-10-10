import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Calendar, 
  CreditCard,
  Download,
  ExternalLink,
  History,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VerificationResult {
  challanNo: string;
  bankName: string;
  branchName: string;
  amount: number;
  verificationDate: string;
  status: 'verified' | 'failed';
}

export default function ChallanVerification() {
  const [challanNo, setChallanNo] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [history, setHistory] = useState<VerificationResult[]>([]);

  const handleVerify = async () => {
    if (!challanNo) return;
    setIsVerifying(true);
    setResult(null);
    
    try {
      const res = await fetch('/api/challan/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challanNo }),
      });
      const data = await res.json();
      setResult(data.data);
      setHistory([data.data, ...history.slice(0, 4)]);
    } catch (err) {
      console.error('Failed to verify challan', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-brand-50 rounded-[2rem] flex items-center justify-center text-brand-600 mx-auto shadow-sm">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-4xl font-black tracking-tight text-zinc-900">i-Challan Verification</h2>
        <p className="text-zinc-500 max-w-lg mx-auto">Verify your VAT and Tax challans against NBR databases for authenticity and compliance.</p>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 space-y-8">
        <div className="relative">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 block">Enter Challan Number</label>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={24} />
              <input 
                type="text"
                value={challanNo}
                onChange={(e) => setChallanNo(e.target.value)}
                placeholder="e.g. 12345678901234567"
                className="w-full pl-16 pr-6 py-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-xl font-mono focus:ring-8 focus:ring-brand-500/5 outline-none transition-all"
              />
            </div>
            <button 
              onClick={handleVerify}
              disabled={isVerifying || !challanNo}
              className="px-10 py-6 bg-brand-600 text-white rounded-[2rem] font-black text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/20 disabled:opacity-50 disabled:shadow-none flex items-center gap-3"
            >
              {isVerifying ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <History size={24} />
                </motion.div>
              ) : <ShieldCheck size={24} />}
              Verify Now
            </button>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-emerald-600">
                  <CheckCircle2 size={32} />
                  <span className="text-2xl font-black tracking-tight">Authentic Challan</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-3 bg-white text-zinc-600 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-all shadow-sm">
                    <Download size={20} />
                  </button>
                  <button className="p-3 bg-white text-zinc-600 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-all shadow-sm">
                    <ExternalLink size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-400 shadow-sm">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Bank Name</p>
                      <p className="font-bold text-zinc-900">{result.bankName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-400 shadow-sm">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Branch</p>
                      <p className="font-bold text-zinc-900">{result.branchName}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-400 shadow-sm">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount Paid</p>
                      <p className="text-2xl font-black text-brand-600">৳{result.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-400 shadow-sm">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payment Date</p>
                      <p className="font-bold text-zinc-900">{new Date(result.verificationDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
          <History className="text-zinc-400" size={24} /> Recent Verifications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((h, i) => (
            <div key={i} className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm flex items-center justify-between group hover:border-brand-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="font-bold text-zinc-900 font-mono">{h.challanNo}</p>
                  <p className="text-[10px] text-zinc-400">{new Date(h.verificationDate).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="font-black text-brand-600">৳{h.amount.toLocaleString()}</p>
            </div>
          ))}
          {history.length === 0 && (
            <div className="col-span-full py-12 text-center bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
              <p className="text-zinc-400 text-sm italic">No verification history yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MapPin({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
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
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

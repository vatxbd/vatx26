import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  CreditCard, 
  Building2, 
  User, 
  History,
  TrendingUp,
  Download,
  Share2,
  Copy,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Recipient {
  id: string;
  name: string;
  type: 'foundation' | 'personal';
  description: string;
  logo: string;
  verified: boolean;
  stats?: {
    beneficiaries: string;
    projects: number;
  };
}

const RECIPIENTS: Recipient[] = [
  {
    id: 'mastul',
    name: 'Mastul Foundation',
    type: 'foundation',
    description: 'Empowering underprivileged communities through education, health, and sustainable livelihood projects across Bangladesh.',
    logo: 'https://picsum.photos/seed/mastul/200/200',
    verified: true,
    stats: { beneficiaries: '500k+', projects: 12 }
  },
  {
    id: 'assunnah',
    name: 'As-Sunnah Foundation',
    type: 'foundation',
    description: 'A non-profit organization dedicated to serving humanity through social welfare, education, and religious guidance.',
    logo: 'https://picsum.photos/seed/sunnah/200/200',
    verified: true,
    stats: { beneficiaries: '1M+', projects: 45 }
  },
  {
    id: 'personal',
    name: 'Personal bKash (Admin)',
    type: 'personal',
    description: 'Direct support for the platform maintenance and development of new VAT/Tax automation tools for Bangladesh.',
    logo: 'https://picsum.photos/seed/personal/200/200',
    verified: true
  }
];

type PaymentMethod = 'bkash' | 'nagad' | 'cellfin';

interface PaymentGateway {
  id: PaymentMethod;
  name: string;
  color: string;
  textColor: string;
  logo: string;
}

const GATEWAYS: PaymentGateway[] = [
  { id: 'bkash', name: 'bKash', color: '#E2136E', textColor: '#FFFFFF', logo: 'https://picsum.photos/seed/bkash/100/100' },
  { id: 'nagad', name: 'Nagad', color: '#F7941D', textColor: '#FFFFFF', logo: 'https://picsum.photos/seed/nagad/100/100' },
  { id: 'cellfin', name: 'CellFin', color: '#0054A6', textColor: '#FFFFFF', logo: 'https://picsum.photos/seed/cellfin/100/100' }
];

export default function DonationCentre() {
  const [step, setStep] = useState<'select' | 'amount' | 'payment' | 'processing' | 'success'>('select');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('vatx_donations');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleRecipientSelect = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setStep('amount');
  };

  const handleAmountSubmit = () => {
    if (parseFloat(amount) > 0) {
      setStep('payment');
    }
  };

  const handlePayment = async (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setStep('processing');

    // Simulate real gateway interaction
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newTx = {
      id: `TXN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      recipient: selectedRecipient?.name,
      amount: parseFloat(amount),
      gateway: gateway.name,
      date: new Date().toISOString(),
      status: 'success'
    };

    setTransactionId(newTx.id);
    const newHistory = [newTx, ...history];
    setHistory(newHistory);
    localStorage.setItem('vatx_donations', JSON.stringify(newHistory));
    setStep('success');
  };

  const reset = () => {
    setStep('select');
    setSelectedRecipient(null);
    setAmount('');
    setSelectedGateway(null);
    setTransactionId('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black font-display tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm">
              <Heart size={28} fill="currentColor" />
            </div>
            Donation Centre
          </h2>
          <p className="text-zinc-500 font-medium mt-1">Support meaningful causes across Bangladesh</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setStep('select')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              step === 'select' ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            )}
          >
            Donate
          </button>
          <button 
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-all"
          >
            History
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'select' && (
          <motion.div 
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {RECIPIENTS.map((recipient) => (
              <motion.div
                key={recipient.id}
                whileHover={{ y: -5 }}
                onClick={() => handleRecipientSelect(recipient)}
                className="group cursor-pointer bg-white border border-zinc-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/30 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden mb-6 shadow-md border-2 border-white">
                    <img src={recipient.logo} alt={recipient.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-black text-zinc-800">{recipient.name}</h3>
                    {recipient.verified && (
                      <div className="text-blue-500" title="Verified Foundation">
                        <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                        <CheckCircle2 size={16} className="absolute inset-0" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-zinc-500 leading-relaxed mb-6 line-clamp-3">
                    {recipient.description}
                  </p>

                  {recipient.stats && (
                    <div className="flex gap-4 mb-6">
                      <div>
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Impact</div>
                        <div className="text-sm font-black text-rose-500">{recipient.stats.beneficiaries}</div>
                      </div>
                      <div className="w-px h-8 bg-zinc-100" />
                      <div>
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Projects</div>
                        <div className="text-sm font-black text-zinc-800">{recipient.stats.projects}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 group-hover:gap-4 transition-all">
                    Donate Now <ArrowRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {step === 'amount' && selectedRecipient && (
          <motion.div 
            key="amount"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md mx-auto bg-white border border-zinc-100 rounded-[3rem] p-10 shadow-2xl shadow-rose-500/5 text-center"
          >
            <div className="w-20 h-20 rounded-3xl overflow-hidden mx-auto mb-6 shadow-lg">
              <img src={selectedRecipient.logo} alt={selectedRecipient.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            
            <h3 className="text-xl font-black text-zinc-800 mb-2">Donating to {selectedRecipient.name}</h3>
            <p className="text-sm text-zinc-500 mb-8">Enter the amount you wish to contribute</p>

            <div className="relative mb-8">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-zinc-300">৳</div>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-16 pr-8 py-6 bg-zinc-50 border border-zinc-100 rounded-3xl text-4xl font-black focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 transition-all text-zinc-800"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[500, 1000, 5000].map(val => (
                <button
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  className={cn(
                    "py-3 rounded-2xl text-sm font-black transition-all",
                    amount === val.toString() ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                  )}
                >
                  ৳{val}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setStep('select')}
                className="flex-1 py-4 bg-zinc-100 text-zinc-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleAmountSubmit}
                disabled={!amount || parseFloat(amount) <= 0}
                className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div 
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white border border-zinc-100 rounded-[3rem] p-8 shadow-2xl shadow-rose-500/5 mb-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Donation</div>
                  <div className="text-3xl font-black text-zinc-800">৳{parseFloat(amount).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Recipient</div>
                  <div className="text-sm font-black text-rose-500">{selectedRecipient?.name}</div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Select Payment Method</p>
                {GATEWAYS.map((gateway) => (
                  <button
                    key={gateway.id}
                    onClick={() => handlePayment(gateway)}
                    className="w-full group relative flex items-center justify-between p-5 bg-zinc-50 border border-zinc-100 rounded-3xl hover:border-rose-500/30 hover:bg-white hover:shadow-xl hover:shadow-rose-500/5 transition-all overflow-hidden"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-zinc-100 bg-white p-2">
                        <img src={gateway.logo} alt={gateway.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-zinc-800">{gateway.name}</div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Instant Confirmation</div>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-zinc-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all relative z-10" />
                    
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity"
                      style={{ backgroundColor: gateway.color }}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setStep('amount')}
              className="w-full py-4 bg-zinc-100 text-zinc-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all"
            >
              Change Amount
            </button>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-20"
          >
            <div className="relative w-32 h-32 mx-auto mb-10">
              <div className="absolute inset-0 border-8 border-rose-100 rounded-full" />
              <motion.div 
                className="absolute inset-0 border-8 border-rose-500 rounded-full border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Smartphone size={40} className="text-rose-500 animate-pulse" />
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-zinc-800 mb-4">Connecting to {selectedGateway?.name}</h3>
            <p className="text-zinc-500 font-medium max-w-xs mx-auto">
              Please check your mobile device and authorize the transaction using your PIN.
            </p>
            
            <div className="mt-12 flex items-center justify-center gap-2 px-6 py-3 bg-rose-50 rounded-2xl text-rose-600 text-xs font-black uppercase tracking-widest inline-flex">
              <ShieldCheck size={16} /> Secure 256-bit Encryption
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-white border border-zinc-100 rounded-[3rem] p-10 shadow-2xl shadow-emerald-500/5 text-center"
          >
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={48} />
            </div>
            
            <h3 className="text-3xl font-black text-zinc-800 mb-2">Donation Successful!</h3>
            <p className="text-zinc-500 font-medium mb-8">
              Thank you for your generous contribution of <span className="text-zinc-800 font-black">৳{parseFloat(amount).toLocaleString()}</span> to <span className="text-rose-500 font-black">{selectedRecipient?.name}</span>.
            </p>

            <div className="bg-zinc-50 rounded-3xl p-6 mb-8 text-left space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Transaction ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-zinc-800">{transactionId}</span>
                  <button className="p-1.5 bg-white rounded-lg border border-zinc-100 text-zinc-400 hover:text-zinc-800 transition-all">
                    <Copy size={12} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payment Method</span>
                <span className="text-sm font-bold text-zinc-800">{selectedGateway?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date & Time</span>
                <span className="text-sm font-bold text-zinc-800">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="flex items-center justify-center gap-2 py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-900 transition-all">
                <Download size={14} /> Receipt
              </button>
              <button className="flex items-center justify-center gap-2 py-4 bg-zinc-100 text-zinc-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all">
                <Share2 size={14} /> Share
              </button>
            </div>

            <button 
              onClick={reset}
              className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all"
            >
              Make Another Donation
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Section */}
      {history.length > 0 && step === 'select' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-16"
        >
          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <History size={14} /> Recent Contributions
          </h4>
          
          <div className="space-y-3">
            {history.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-5 bg-white border border-zinc-100 rounded-3xl hover:shadow-lg hover:shadow-zinc-500/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                    <Heart size={18} fill="currentColor" />
                  </div>
                  <div>
                    <div className="font-black text-zinc-800">{tx.recipient}</div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      {new Date(tx.date).toLocaleDateString()} via {tx.gateway}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-zinc-800">৳{tx.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Successful</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, 
  CreditCard, Smartphone, Building2, Download, Printer, 
  ArrowRight, Sparkles, Check, Info, Lock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: number;
  onSuccess: (receipt: any) => void;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

interface PaymentChannel {
  id: string;
  name: string;
  category: 'mfs' | 'card' | 'netbanking';
  color: string;
  badge: string;
  logoText: string;
  subtitle: string;
}

const CHANNELS: PaymentChannel[] = [
  // MFS
  { id: 'bkash', name: 'bKash (বিকাশ)', category: 'mfs', color: '#E2136E', badge: 'Fastest', logoText: 'bKash', subtitle: 'Personal / Merchant' },
  { id: 'nagad', name: 'Nagad (নগদ)', category: 'mfs', color: '#F7941D', badge: 'Popular', logoText: 'নগদ', subtitle: 'Post Office Digital' },
  { id: 'rocket', name: 'DBBL Rocket', category: 'mfs', color: '#8C3494', badge: 'DBBL', logoText: 'Rocket', subtitle: 'Mobile Banking' },
  { id: 'upay', name: 'UCB Upay', category: 'mfs', color: '#005696', badge: 'UCB', logoText: 'upay', subtitle: 'United Commercial' },
  // Cards
  { id: 'visa', name: 'Visa Debit / Credit', category: 'card', color: '#1A1F71', badge: 'Global', logoText: 'VISA', subtitle: 'All Bangladeshi Banks' },
  { id: 'mastercard', name: 'Mastercard', category: 'card', color: '#EB001B', badge: 'Global', logoText: 'MC', subtitle: 'International & Local' },
  { id: 'nexus', name: 'DBBL Nexus / NexusPay', category: 'card', color: '#00833E', badge: 'Local', logoText: 'Nexus', subtitle: 'Dutch-Bangla Bank' },
  // Internet Banking
  { id: 'citytouch', name: 'City Bank Citytouch', category: 'netbanking', color: '#D9232D', badge: 'Net Banking', logoText: 'City', subtitle: 'Instant Transfer' },
  { id: 'ibbl', name: 'Islami Bank i-Banking', category: 'netbanking', color: '#006A4E', badge: 'Shariah', logoText: 'IBBL', subtitle: 'Mobicash Portal' }
];

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  planName,
  amount,
  onSuccess,
  customerInfo = { name: 'Corporate Taxpayer', email: 'taxpayer@vatx.bd', phone: '01712345678' }
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'mfs' | 'card' | 'netbanking'>('mfs');
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>(CHANNELS[0]);
  const [mobileNumber, setMobileNumber] = useState(customerInfo.phone || '01712345678');
  const [otpCode, setOtpCode] = useState('123456');
  const [pinCode, setPinCode] = useState('•••••');
  
  // Flow states
  const [stage, setStage] = useState<'checkout' | 'processing' | 'success' | 'failed'>('checkout');
  const [tranId, setTranId] = useState<string>('');
  const [isSandbox, setIsSandbox] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Initialize or reset session when modal opens
  useEffect(() => {
    if (isOpen) {
      setStage('checkout');
      setErrorMessage('');
      setReceiptData(null);
      initiateSession();
    }
  }, [isOpen, planName, amount]);

  const initiateSession = async () => {
    setIsLoadingSession(true);
    try {
      const res = await fetch('/api/payments/aggregator/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName,
          amount,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: mobileNumber
        })
      });
      const data = await res.json();
      if (data.success) {
        setTranId(data.tran_id);
        setIsSandbox(data.isSandbox ?? true);
      }
    } catch (err) {
      console.error("Session init failed:", err);
      // Fallback local transaction ID
      setTranId(`VATX_${Date.now().toString().slice(-8)}_DEMO`);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleSimulate = async (action: 'success' | 'failed' | 'cancel') => {
    setStage('processing');
    setErrorMessage('');

    try {
      const res = await fetch('/api/payments/aggregator/simulate-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tran_id: tranId,
          action,
          channel: selectedChannel.id,
          mobileNumber
        })
      });

      const data = await res.json();

      setTimeout(() => {
        if (data.success && data.status === 'VALID') {
          setReceiptData(data);
          setStage('success');
          onSuccess(data);
        } else {
          setErrorMessage(data.reason || 'Payment could not be authorized.');
          setStage('failed');
        }
      }, 1200);
    } catch (err: any) {
      setTimeout(() => {
        setErrorMessage(err.message || 'Payment simulation failed.');
        setStage('failed');
      }, 1000);
    }
  };

  if (!isOpen) return null;

  const filteredChannels = CHANNELS.filter(c => c.category === selectedCategory);
  const vatAmount = Math.round(amount - (amount / 1.15));
  const subtotal = amount - vatAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl text-white overflow-hidden my-8"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100">Bangladesh Multi-Channel Gateway</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  SSLCOMMERZ / AamarPay PSO
                </span>
              </div>
              <p className="text-xs text-zinc-400">PCI-DSS Level 1 Encrypted Multi-Wallet Gateway</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSandbox && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sandbox Simulator Active
              </span>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Stages */}
        <div className="p-6 md:p-8">
          {stage === 'checkout' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Order Summary */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Order Summary</span>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold text-white">{planName} Plan License</h4>
                      <p className="text-xs text-zinc-400">12 Months Full Compliance & Tax Access</p>
                    </div>
                    <span className="text-2xl font-black text-amber-400">৳{amount.toLocaleString()}</span>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Base Plan Subtotal:</span>
                      <span className="text-zinc-200">৳{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Statutory VAT (15% Included):</span>
                      <span className="text-zinc-200">৳{vatAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Gateway Processing Fee:</span>
                      <span className="text-emerald-400 font-semibold">FREE (0%)</span>
                    </div>
                    <div className="pt-2 border-t border-zinc-800 flex justify-between font-bold text-sm text-zinc-100">
                      <span>Total Payable:</span>
                      <span className="text-amber-400">৳{amount.toLocaleString()} BDT</span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-3">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Taxpayer Details</span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Name:</span>
                      <span className="text-zinc-200 font-medium">{customerInfo.name}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Email:</span>
                      <span className="text-zinc-200 font-medium">{customerInfo.email}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Transaction Ref:</span>
                      <span className="text-amber-400 font-mono text-[11px]">{tranId || 'Initializing...'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/80 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    Complies with NBR Mushak 6.3 digital e-receipt regulations. Your subscription tier unlocks immediately upon confirmation.
                  </p>
                </div>
              </div>

              {/* Right Column: Payment Channels & Sandbox Simulator */}
              <div className="lg:col-span-7 space-y-6">
                {/* Method Category Selector */}
                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <button
                    onClick={() => {
                      setSelectedCategory('mfs');
                      setSelectedChannel(CHANNELS[0]);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === 'mfs'
                        ? 'bg-amber-500 text-zinc-950 shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile (MFS)</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCategory('card');
                      setSelectedChannel(CHANNELS[4]);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === 'card'
                        ? 'bg-amber-500 text-zinc-950 shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cards (Debit/Credit)</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCategory('netbanking');
                      setSelectedChannel(CHANNELS[7]);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === 'netbanking'
                        ? 'bg-amber-500 text-zinc-950 shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* Channel Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  {filteredChannels.map(channel => {
                    const isSelected = selectedChannel.id === channel.id;
                    return (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel)}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/10 shadow-lg'
                            : 'border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span 
                            className="px-2.5 py-1 rounded-lg text-xs font-black tracking-wider text-white shadow-sm"
                            style={{ backgroundColor: channel.color }}
                          >
                            {channel.logoText}
                          </span>
                          <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800/70 px-2 py-0.5 rounded-full">
                            {channel.badge}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{channel.name}</p>
                          <p className="text-[11px] text-zinc-400">{channel.subtitle}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Channel Interactive Sandbox Area */}
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: selectedChannel.color }} 
                      />
                      <span className="text-xs font-bold text-zinc-200">
                        Paying via {selectedChannel.name}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-amber-400 font-bold">
                      ৳{amount.toLocaleString()} BDT
                    </span>
                  </div>

                  {selectedCategory === 'mfs' && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-zinc-400 mb-1 font-medium">MFS Account Number</label>
                        <input
                          type="text"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none"
                          placeholder="01XXXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 mb-1 font-medium">OTP Verification</label>
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none"
                          placeholder="123456"
                        />
                      </div>
                    </div>
                  )}

                  {selectedCategory === 'card' && (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-zinc-400 mb-1 font-medium">Card Number (Sandbox Auto-filled)</label>
                        <input
                          type="text"
                          readOnly
                          value="4111 •••• •••• 9842"
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-400 mb-1 font-medium">Expiry</label>
                          <input
                            type="text"
                            readOnly
                            value="12 / 28"
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 mb-1 font-medium">CVV / CVC</label>
                          <input
                            type="password"
                            readOnly
                            value="•••"
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCategory === 'netbanking' && (
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
                      Redirecting to {selectedChannel.name} secure internet banking portal. Sandbox simulation will auto-generate authentic bank authorization token.
                    </div>
                  )}

                  {/* Sandbox Simulator Action Buttons */}
                  <div className="pt-2 space-y-2">
                    <p className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Sandbox Testing Scenarios:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => handleSimulate('success')}
                        disabled={isLoadingSession}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simulate Success</span>
                      </button>

                      <button
                        onClick={() => handleSimulate('failed')}
                        disabled={isLoadingSession}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Simulate Decline</span>
                      </button>

                      <button
                        onClick={() => handleSimulate('cancel')}
                        disabled={isLoadingSession}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <X className="w-4 h-4" />
                        <span>Simulate Cancel</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage: Processing */}
          {stage === 'processing' && (
            <div className="py-16 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
                <div className="w-20 h-20 rounded-full border-4 border-amber-500 border-t-transparent animate-spin flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Connecting with Bangladesh Bank PSO...</h4>
                <p className="text-sm text-zinc-400 mt-1">Authorizing transaction with {selectedChannel.name} gateway</p>
                <p className="text-xs font-mono text-amber-400/80 mt-2">Ref: {tranId}</p>
              </div>
            </div>
          )}

          {/* Stage: Failed / Declined */}
          {stage === 'failed' && (
            <div className="py-12 max-w-lg mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 mx-auto flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white">Payment Unsuccessful</h4>
                <p className="text-sm text-rose-400 mt-2 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                  {errorMessage}
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setStage('checkout')}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again / Change Method
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Stage: Success & Mushak 6.3 Tax Receipt */}
          {stage === 'success' && receiptData && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-black text-white">Payment Confirmed & License Activated!</h4>
                <p className="text-xs text-emerald-400 font-semibold">
                  Your account has been upgraded to <span className="font-bold underline">{receiptData.planName}</span> status.
                </p>
              </div>

              {/* Digital Tax Invoice (Mushak 6.3 Compliant) */}
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5 text-xs print:text-black print:bg-white">
                <div className="flex justify-between items-start pb-4 border-b border-zinc-800">
                  <div>
                    <h5 className="font-bold text-sm text-white">VATX.BD TECHNOLOGIES LTD.</h5>
                    <p className="text-[11px] text-zinc-400">National Tax & VAT Compliance Suite</p>
                    <p className="text-[11px] text-zinc-400">BIN: 003891048-0101 | Dhaka, Bangladesh</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                      PAID / পরিশোধিত
                    </span>
                    <p className="text-[11px] font-mono text-zinc-400 mt-1">Invoice: {receiptData.invoice?.invoiceNumber || 'MUSHAK-6.3'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div>
                    <span className="text-zinc-500 uppercase font-bold block mb-1">Taxpayer Details</span>
                    <p className="font-semibold text-zinc-200">{customerInfo.name}</p>
                    <p className="text-zinc-400">{customerInfo.email}</p>
                    <p className="text-zinc-400">{mobileNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-500 uppercase font-bold block mb-1">Payment Reference</span>
                    <p className="font-mono text-amber-400">{receiptData.tran_id}</p>
                    <p className="text-zinc-400">Bank Auth: {receiptData.bank_tran_id}</p>
                    <p className="text-zinc-400">Method: {receiptData.card_type}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-zinc-500 text-[10px] uppercase border-b border-zinc-800">
                        <th className="py-2">Description</th>
                        <th className="py-2 text-right">Subtotal</th>
                        <th className="py-2 text-right">VAT (15%)</th>
                        <th className="py-2 text-right">Total (BDT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                      <tr>
                        <td className="py-2.5 font-medium">{receiptData.planName} Annual Pro License</td>
                        <td className="py-2.5 text-right font-mono">৳{subtotal.toLocaleString()}</td>
                        <td className="py-2.5 text-right font-mono">৳{vatAmount.toLocaleString()}</td>
                        <td className="py-2.5 text-right font-bold font-mono text-amber-400">৳{amount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white rounded-lg">
                      <QRCodeSVG value={`https://vatx.bd/verify/${receiptData.tran_id}`} size={42} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-300">NBR Verified Electronic Receipt</p>
                      <p className="text-[9px] text-zinc-500">Scan QR to verify statutory tax authenticity</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-400">License Valid Until</p>
                    <p className="text-xs font-bold text-emerald-400">
                      {new Date(receiptData.expiresAt || Date.now() + 365*24*60*60*1000).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Print / Download Mushak 6.3
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-2 transition-all shadow-lg font-black"
                >
                  <span>Continue to Pro Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="px-6 py-3 border-t border-zinc-900 bg-zinc-950/80 flex flex-wrap items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              256-Bit SSL Encryption
            </span>
            <span>•</span>
            <span>Bangladesh Bank Licensed Aggregator</span>
            <span>•</span>
            <span>Instant Webhook Reconciliation</span>
          </div>
          <div className="font-mono text-[10px] text-zinc-600">
            SSLCOMMERZ / AamarPay Unified Engine v4.2
          </div>
        </div>
      </motion.div>
    </div>
  );
};

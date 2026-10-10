import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, CreditCard, QrCode, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const MFSPayment: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket' | null>(null);
  const [step, setStep] = useState<'input' | 'method' | 'qr' | 'success'>('input');
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = async () => {
    if (step === 'input' && amount) setStep('method');
    else if (step === 'method' && method) {
      setIsProcessing(true);
      try {
        const response = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, method })
        });
        const data = await response.json();
        if (data.success) {
          setPaymentId(data.paymentId);
          setStep('qr');
        }
      } catch (err) {
        console.error("Payment Init Error:", err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handlePaymentComplete = async () => {
    if (!paymentId) return;
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/payments/verify/${paymentId}`);
      const data = await response.json();
      if (data.success && data.status === 'success') {
        setTransactionId(data.transactionId);
        setStep('success');
      }
    } catch (err) {
      console.error("Payment Verify Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">MFS Payment</h1>
          <p className="text-gray-500">Pay your VAT and Tax directly via bKash, Nagad, or Rocket</p>
        </div>
        <div className="bg-orange-100 p-3 rounded-full">
          <Smartphone className="w-8 h-8 text-orange-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`p-4 rounded-xl border-2 transition-all ${step === 'input' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'input' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <span className="font-semibold">Enter Amount</span>
          </div>
        </div>
        <div className={`p-4 rounded-xl border-2 transition-all ${step === 'method' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'method' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <span className="font-semibold">Select Method</span>
          </div>
        </div>
        <div className={`p-4 rounded-xl border-2 transition-all ${step === 'qr' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'qr' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
            <span className="font-semibold">Pay & Verify</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
      >
        {step === 'input' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount (BDT)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 text-2xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
            <button
              onClick={handleNext}
              disabled={!amount}
              className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continue to Payment Method <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 'method' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">Select your preferred MFS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setMethod('bkash')}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${method === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-gray-100 hover:border-pink-200'}`}
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/BKash_logo.svg/1200px-BKash_logo.svg.png" alt="bKash" className="w-12 h-auto" />
                </div>
                <span className="font-bold text-pink-600">bKash</span>
              </button>
              <button
                onClick={() => setMethod('nagad')}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${method === 'nagad' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nagad_Logo.svg/1200px-Nagad_Logo.svg.png" alt="Nagad" className="w-12 h-auto" />
                </div>
                <span className="font-bold text-orange-600">Nagad</span>
              </button>
              <button
                onClick={() => setMethod('rocket')}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${method === 'rocket' ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-purple-200'}`}
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Rocket_logo.svg/1200px-Rocket_logo.svg.png" alt="Rocket" className="w-12 h-auto" />
                </div>
                <span className="font-bold text-purple-600">Rocket</span>
              </button>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep('input')} className="flex-1 py-4 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors">Back</button>
              <button
                onClick={handleNext}
                disabled={!method || isProcessing}
                className="flex-[2] bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> Processing...</> : 'Generate QR Code'}
              </button>
            </div>
          </div>
        )}

        {step === 'qr' && (
          <div className="text-center space-y-6">
            <div className="bg-gray-50 p-6 rounded-2xl inline-block mb-4">
              <QRCodeSVG value={`https://i-challan.gov.bd/pay?amount=${amount}&method=${method}`} size={200} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Scan to Pay ৳{amount}</h3>
              <p className="text-gray-500 mt-2">Open your {method} app and scan this QR code to complete the payment for i-Challan</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 text-left max-w-md mx-auto">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-700">
                After payment, the system will automatically verify the transaction. Do not close this window.
              </p>
            </div>
            <button
              onClick={handlePaymentComplete}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> Verifying...</> : <>I have completed the payment <CheckCircle2 className="w-5 h-5" /></>}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Payment Successful!</h2>
              <p className="text-gray-500 mt-2">Your VAT/Tax payment has been processed successfully.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl max-w-md mx-auto text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono font-bold">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold">৳{amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Method:</span>
                <span className="font-bold capitalize">{method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-bold">{new Date().toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-4 max-w-md mx-auto">
              <button className="flex-1 py-4 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors">Download Receipt</button>
              <button onClick={() => { setStep('input'); setAmount(''); setMethod(null); }} className="flex-1 bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors">New Payment</button>
            </div>
          </div>
        )}
      </motion.div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-orange-500" />
            Direct i-Challan Integration
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            VATX.BD is integrated with the NBR i-Challan system. Your payments are directly reflected in the government database within 24 hours.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            Secure Transactions
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            All MFS transactions are secured with end-to-end encryption and multi-factor authentication provided by the respective MFS providers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MFSPayment;

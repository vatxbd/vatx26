import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Lock, Mail, Phone, Building2, Fingerprint, ShieldCheck,
  CheckCircle2, Sparkles, LogOut, ArrowRight, CreditCard, Edit3, Save, KeyRound
} from 'lucide-react';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  tin?: string;
  bin?: string;
  companyName?: string;
  role?: string;
  createdAt?: string;
}

interface AuthAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  subscription: any;
  language: 'en' | 'bn';
  onAuthSuccess: (user: UserProfile, subscription?: any) => void;
  onLogout: () => void;
  onNavigateToSubscription: () => void;
  onNavigateToHistory: () => void;
}

export const AuthAccountModal: React.FC<AuthAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  subscription,
  language,
  onAuthSuccess,
  onLogout,
  onNavigateToSubscription,
  onNavigateToHistory
}) => {
  const isBn = language === 'bn';
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>('login');
  const [identifier, setIdentifier] = useState('taxpayer@vatx.bd');
  const [password, setPassword] = useState('123456');

  // Registration & Profile states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [tin, setTin] = useState('');
  const [bin, setBin] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('Corporate Taxpayer');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      if (currentUser) {
        setMode('profile');
        setName(currentUser.name || '');
        setPhone(currentUser.phone || '');
        setTin(currentUser.tin || '');
        setBin(currentUser.bin || '');
        setCompanyName(currentUser.companyName || '');
      } else {
        setMode('login');
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent, isDemo: boolean = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isDemo
            ? { isDemo: true }
            : { identifier, password }
        )
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }
      localStorage.setItem('vatx_user', JSON.stringify(data.user));
      onAuthSuccess(data.user, data.subscription);
      setMode('profile');
      setSuccessMsg(isBn ? 'সফলভাবে লগইন সম্পন্ন হয়েছে!' : 'Signed in successfully!');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password: regPassword,
          phone,
          tin,
          bin,
          companyName,
          role
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }
      localStorage.setItem('vatx_user', JSON.stringify(data.user));
      onAuthSuccess(data.user, data.subscription);
      setMode('profile');
      setSuccessMsg(isBn ? 'নতুন অ্যাকাউন্ট তৈরি ও লগইন সম্পন্ন হয়েছে!' : 'Account created and signed in!');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name,
          phone,
          tin,
          bin,
          companyName
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('vatx_user', JSON.stringify(data.user));
        onAuthSuccess(data.user, subscription);
        setIsEditingProfile(false);
        setSuccessMsg(isBn ? 'প্রোফাইল আপডেট করা হয়েছে!' : 'Taxpayer profile updated!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('vatx_user');
    onLogout();
    setMode('login');
  };

  const activePlanName = subscription?.status === 'active' ? subscription.planName : 'Standard';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl text-white overflow-hidden my-8"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white">
                {currentUser
                  ? (isBn ? 'ট্যাক্সপেয়ার অ্যাকাউন্ট ও লাইসেন্স পোর্টাল' : 'Taxpayer Account & License Portal')
                  : (isBn ? 'ইউজার লগইন ও রেজিস্ট্রেশন' : 'Taxpayer Sign In & Registration')}
              </h3>
              <p className="text-xs text-zinc-400">
                {isBn ? 'এনবিআর ই-ট্যাক্স ও মূসক ৯.১ ক্লাউড প্রোফাইল' : 'NBR e-Tax, BIN & Subscription Identity Management'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Mode Tabs when not logged in */}
          {!currentUser && (
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`py-2.5 rounded-xl font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {isBn ? 'লগইন করুন (Sign In)' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`py-2.5 rounded-xl font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {isBn ? 'নতুন অ্যাকাউন্ট (Register)' : 'Create Account'}
              </button>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {!currentUser && mode === 'login' && (
            <form onSubmit={(e) => handleLogin(e, false)} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-zinc-300 font-bold">
                  {isBn ? 'ইমেইল, মোবাইল অথবা ১২-ডিজিট ই-টিআইএন (e-TIN)' : 'Email, Mobile, or 12-Digit e-TIN'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="taxpayer@vatx.bd or 198475632109"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-300 font-bold">
                  {isBn ? 'পাসওয়ার্ড (Password)' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Signing In...' : (isBn ? 'লগইন করুন' : 'Sign In to Account')}</span>
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="border-t border-zinc-800 w-full" />
                <span className="bg-zinc-950 px-3 text-[10px] text-zinc-500 uppercase font-mono">OR</span>
                <div className="border-t border-zinc-800 w-full" />
              </div>

              {/* 1-Click Demo Taxpayer Login */}
              <button
                type="button"
                onClick={() => handleLogin(undefined, true)}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>
                  {isBn
                    ? '১-ক্লিক ডেমো কর্পোরেট লগইন (Abdur Rahman FCA)'
                    : '1-Click Demo Taxpayer Login (Abdur Rahman FCA)'}
                </span>
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {!currentUser && mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kamal Hossain"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.bd"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">12-Digit e-TIN</label>
                  <input
                    type="text"
                    value={tin}
                    onChange={(e) => setTin(e.target.value)}
                    placeholder="198475632109"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">13-Digit VAT BIN</label>
                  <input
                    type="text"
                    value={bin}
                    onChange={(e) => setBin(e.target.value)}
                    placeholder="003891048-0101"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Knitwear Ltd."
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Individual Taxpayer">Individual Taxpayer</option>
                    <option value="Corporate Taxpayer">Corporate Taxpayer</option>
                    <option value="VAT Consultant / CA">VAT Consultant / CA</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black uppercase tracking-wider transition-all shadow-lg"
              >
                {loading ? 'Creating Account...' : (isBn ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'Create Taxpayer Account')}
              </button>
            </form>
          )}

          {/* LOGGED IN TAXPAYER PROFILE */}
          {currentUser && (
            <div className="space-y-6 text-xs">
              {/* Top Identity & Subscription Banner */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-950 font-black text-lg flex items-center justify-center shadow-md">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-white">{currentUser.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {currentUser.role || 'Taxpayer'}
                      </span>
                    </div>
                    <p className="text-zinc-400">{currentUser.email}</p>
                    {currentUser.companyName && (
                      <p className="text-amber-400/90 font-semibold mt-0.5">{currentUser.companyName}</p>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">Active License</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400/15 text-amber-400 border border-amber-400/30 mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {activePlanName.toUpperCase()} PLAN
                  </span>
                </div>
              </div>

              {/* Statutory Identifiers or Edit Form */}
              {!isEditingProfile ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">12-Digit e-TIN</span>
                    <span className="text-sm font-mono font-bold text-white mt-0.5 block">
                      {currentUser.tin || 'Not Provided'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">13-Digit VAT BIN</span>
                    <span className="text-sm font-mono font-bold text-amber-400 mt-0.5 block">
                      {currentUser.bin || 'Not Provided'}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Company</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">e-TIN</label>
                      <input
                        type="text"
                        value={tin}
                        onChange={(e) => setTin(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">VAT BIN</label>
                      <input
                        type="text"
                        value={bin}
                        onChange={(e) => setBin(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-1.5 rounded-lg bg-amber-400 text-zinc-950 font-bold flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Quick Actions for Subscription & Filing History */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToSubscription();
                  }}
                  className="p-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black transition-all flex items-center justify-between shadow-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5" />
                    <div className="text-left">
                      <span className="block text-xs uppercase tracking-wider">Subscription & Plans</span>
                      <span className="block text-[10px] font-semibold opacity-80">bKash, Nagad, Cards & Invoices</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToHistory();
                  }}
                  className="p-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Fingerprint className="w-5 h-5 text-emerald-400" />
                    <div className="text-left">
                      <span className="block text-xs">Filing & Tax History</span>
                      <span className="block text-[10px] text-zinc-400">Saved VAT & Tax Records</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {/* Footer Profile Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold flex items-center gap-1.5 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBn ? 'টিআইএন/বিআইএন সম্পাদনা' : 'Edit e-TIN / BIN Profile'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold flex items-center gap-1.5 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isBn ? 'লগআউট' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  FileText, 
  Settings, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Phone,
  Layout,
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WhatsAppNumber {
  id: string;
  verified_name: string;
  display_phone_number: string;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  status: string;
  category: string;
  language: string;
  components: any[];
}

export default function WhatsAppAutomation() {
  const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'numbers' | 'settings'>('send');
  const [numbers, setNumbers] = useState<WhatsAppNumber[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchNumbers();
    fetchTemplates();
  }, []);

  const fetchNumbers = async () => {
    try {
      const res = await fetch('/api/whatsapp/numbers');
      const data = await res.json();
      if (data.success && data.data) {
        setNumbers(data.data);
        if (data.data.length > 0) setSelectedNumber(data.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch numbers', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/whatsapp/templates');
      const data = await res.json();
      if (data.success && data.data) {
        setTemplates(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch templates', err);
    }
  };

  const handleSendMessage = async () => {
    if (!recipient || !message || !selectedNumber) {
      setStatus({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setIsLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          body: message,
          phone_number_id: selectedNumber
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: 'Message sent successfully!' });
        setMessage('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send message' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Connection error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
      {/* Sidebar Nav */}
      <aside className="w-full lg:w-64 space-y-2">
        <button 
          onClick={() => setActiveTab('send')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
            activeTab === 'send' ? "bg-zinc-900 text-white shadow-lg" : "bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-100"
          )}
        >
          <Send size={18} /> Send Message
        </button>
        <button 
          onClick={() => setActiveTab('templates')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
            activeTab === 'templates' ? "bg-zinc-900 text-white shadow-lg" : "bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-100"
          )}
        >
          <Layout size={18} /> Templates
        </button>
        <button 
          onClick={() => setActiveTab('numbers')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
            activeTab === 'numbers' ? "bg-zinc-900 text-white shadow-lg" : "bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-100"
          )}
        >
          <Phone size={18} /> Phone Numbers
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
            activeTab === 'settings' ? "bg-zinc-900 text-white shadow-lg" : "bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-100"
          )}
        >
          <Settings size={18} /> Settings
        </button>

        <div className="mt-8 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-700 mb-2">
            <CheckCircle2 size={16} />
            <span className="text-xs font-black uppercase tracking-widest">Connected</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium leading-relaxed">
            WhatsApp Business API is active via Rube MCP. 24-hour window rules apply.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'send' && (
            <motion.div 
              key="send"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 space-y-8"
            >
              <div>
                <h3 className="text-2xl font-black tracking-tight text-zinc-900">Send WhatsApp Message</h3>
                <p className="text-sm text-zinc-500">Reach your clients instantly with automated messaging</p>
              </div>

              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">From Number</label>
                    <select 
                      value={selectedNumber}
                      onChange={(e) => setSelectedNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                    >
                      {numbers.map(n => (
                        <option key={n.id} value={n.id}>{n.verified_name} ({n.display_phone_number})</option>
                      ))}
                      {numbers.length === 0 && <option value="">No numbers available</option>}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Recipient (E.164)</label>
                    <input 
                      type="text"
                      placeholder="+8801700000000"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Message Content</label>
                  <textarea 
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/10 outline-none transition-all resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-zinc-400 font-medium italic">
                      Note: Free-form messages only work within the 24-hour window.
                    </p>
                    <span className="text-[10px] font-bold text-zinc-400">{message.length} characters</span>
                  </div>
                </div>

                {status && (
                  <div className={cn(
                    "p-4 rounded-2xl flex items-center gap-3 text-sm font-bold",
                    status.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                  )}>
                    {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {status.message}
                  </div>
                )}

                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  Send Message Now
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div 
              key="templates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-zinc-900">Message Templates</h3>
                  <p className="text-sm text-zinc-500">Manage pre-approved business templates</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-all">
                  <Plus size={16} /> Create Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(t => (
                  <div key={t.id} className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl hover:border-brand-200 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                        t.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {t.status}
                      </span>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t.category}</span>
                    </div>
                    <h4 className="text-lg font-black text-zinc-900 mb-2">{t.name}</h4>
                    <p className="text-xs text-zinc-500 mb-4">Language: {t.language}</p>
                    <button className="w-full py-2 bg-white border border-zinc-200 text-zinc-900 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
                      Use Template <Send size={14} />
                    </button>
                  </div>
                ))}
                {templates.length === 0 && (
                  <div className="col-span-2 py-20 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                    <Layout size={32} className="text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-400 text-sm italic">No templates found. Syncing with Meta...</p>
                    <button onClick={fetchTemplates} className="mt-4 text-brand-600 text-xs font-bold flex items-center gap-2 mx-auto">
                      <RefreshCw size={14} /> Refresh List
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'numbers' && (
            <motion.div 
              key="numbers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 space-y-8"
            >
              <div>
                <h3 className="text-2xl font-black tracking-tight text-zinc-900">Registered Numbers</h3>
                <p className="text-sm text-zinc-500">Manage your WhatsApp Business phone numbers</p>
              </div>

              <div className="space-y-4">
                {numbers.map(n => (
                  <div key={n.id} className="p-6 bg-white border border-zinc-100 rounded-3xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                        <Phone size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-zinc-900">{n.verified_name}</h4>
                        <p className="text-sm text-zinc-500">{n.display_phone_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg uppercase tracking-widest">Active</span>
                      <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
                        <Settings size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {numbers.length === 0 && (
                  <div className="py-20 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                    <Phone size={32} className="text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-400 text-sm italic">No phone numbers linked yet.</p>
                    <a href="https://business.facebook.com/" target="_blank" rel="noopener noreferrer" className="mt-4 text-brand-600 text-xs font-bold flex items-center gap-2 mx-auto justify-center">
                      Go to Meta Business Suite <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 space-y-8"
            >
              <div>
                <h3 className="text-2xl font-black tracking-tight text-zinc-900">Automation Settings</h3>
                <p className="text-sm text-zinc-500">Configure webhooks and global automation rules</p>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                  <h4 className="font-black text-zinc-900 mb-4">Webhook Configuration</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Callback URL</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value="https://vatx.bd/api/webhooks/whatsapp" 
                          className="flex-1 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-mono text-zinc-500"
                        />
                        <button className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold">Copy</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-black text-zinc-900 text-sm">Auto-Reply</h4>
                      <div className="w-10 h-5 bg-brand-600 rounded-full relative">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">Automatically reply to incoming messages after business hours.</p>
                  </div>
                  <div className="p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-black text-zinc-900 text-sm">Read Receipts</h4>
                      <div className="w-10 h-5 bg-zinc-200 rounded-full relative">
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">Send read receipts when messages are viewed in the dashboard.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

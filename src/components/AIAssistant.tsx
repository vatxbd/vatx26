import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { Bot, User, Download, Trash2, Copy, Send } from 'lucide-react';
import AIErrorDisplay from './AIErrorDisplay';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AIAssistant() {
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

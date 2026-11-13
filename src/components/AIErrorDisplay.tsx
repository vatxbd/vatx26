import { motion } from 'motion/react';
import { ShieldAlert, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AIErrorDisplay({ onRetry, error, className }: { onRetry: () => void, error?: string, className?: string }) {
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

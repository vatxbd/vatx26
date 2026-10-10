import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  Phone, 
  Mail, 
  ExternalLink, 
  Filter,
  CheckCircle2,
  Award,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Agent {
  id: number;
  name: string;
  firmName: string;
  licenseNo: string;
  location: string;
  specialization: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  imageUrl: string;
}

export default function AgentMarketplace() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      console.error('Failed to fetch agents', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Users className="text-brand-500" size={32} /> VAT Agent Marketplace
          </h2>
          <p className="text-zinc-500">Connect with verified VAT Agents and Income Tax Practitioners in Bangladesh</p>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, location, or specialization..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-100 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/5 outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAgents.map((agent, idx) => (
          <motion.div 
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="relative">
                  <div className="w-20 h-20 bg-zinc-100 rounded-2xl overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                    <img 
                      src={agent.imageUrl || `https://picsum.photos/seed/${agent.id}/200/200`} 
                      alt={agent.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {agent.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-lg border-2 border-white shadow-sm">
                      <ShieldCheck size={14} />
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-amber-500 mb-1">
                    <Star size={16} fill="currentColor" />
                    <span className="font-black text-sm">{agent.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{agent.reviewCount} Reviews</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-zinc-900 group-hover:text-brand-600 transition-colors">{agent.name}</h3>
                <p className="text-sm font-bold text-zinc-500 flex items-center gap-1 mt-1">
                  <Briefcase size={14} className="text-zinc-400" /> {agent.firmName}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <MapPin size={14} className="text-zinc-400" /> {agent.location}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Award size={14} className="text-zinc-400" /> License: {agent.licenseNo}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {agent.specialization.split(',').map(spec => (
                    <span key={spec} className="px-3 py-1 bg-zinc-50 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-zinc-100">
                      {spec.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button className="flex items-center justify-center gap-2 py-3 bg-zinc-50 text-zinc-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-100 transition-all border border-zinc-100">
                  <MessageSquare size={16} /> Chat
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20">
                  <Phone size={16} /> Contact
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredAgents.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-4">
              <Users size={32} />
            </div>
            <p className="text-zinc-400 text-sm italic">No agents found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Scale, 
  Cpu, 
  Settings, 
  Database, 
  BarChart3, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  ShieldCheck,
  Zap,
  Building2,
  ChevronRight,
  TrendingUp,
  DollarSign,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AgentTab = 'dashboard' | 'clients' | 'mushak' | 'subscriptions' | 'settings';

export default function VatAgentPortal() {
  const [activeTab, setActiveTab] = useState<AgentTab>('dashboard');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showAddClient, setShowAddClient] = useState(false);
  const [clients, setClients] = useState([
    { name: "Dhaka Textiles Ltd.", bin: "000123456-0101", contact: "Arif Hossain", circle: "Dhaka North", status: "active" },
    { name: "Ruposhi Fashions", bin: "000234567-0201", contact: "Shahin Alam", circle: "Dhaka South", status: "active" },
    { name: "Agrani Foods Co.", bin: "000345678-0301", contact: "Nargis Begum", circle: "Chittagong", status: "active" },
    { name: "Bengal Steel Works", bin: "000456789-0401", contact: "Kamrul Islam", circle: "Dhaka North", status: "active" },
  ]);

  const [newClient, setNewClient] = useState({ name: '', bin: '', contact: '', circle: '', address: '', mobile: '', tin: '' });
  const [clientSearch, setClientSearch] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.bin.includes(clientSearch)
  );

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.bin) return;
    setClients([...clients, { ...newClient, status: 'active' }]);
    setNewClient({ name: '', bin: '', contact: '', circle: '', address: '', mobile: '', tin: '' });
    setShowAddClient(false);
  };

  const stats = [
    { label: 'Total Clients', value: '48', sub: '+3 this month', icon: <Building2 className="text-cyan-400" />, color: 'cyan' },
    { label: 'Pending Returns', value: '11', sub: 'Due by 15th March', icon: <Clock className="text-yellow-400" />, color: 'yellow' },
    { label: 'VAT Payable', value: '৳42.6L', sub: 'Across all clients', icon: <DollarSign className="text-emerald-400" />, color: 'green' },
    { label: 'Active BINs', value: '63', sub: 'Multi-BIN clients: 9', icon: <Zap className="text-cyan-400" />, color: 'cyan' },
  ];

  const plans = [
    {
      name: 'Starter Agent',
      monthly: 2500,
      yearly: 25000,
      features: ['Up to 10 Clients', 'Basic Mushak Forms', 'Email Support', 'Standard Reports'],
      recommended: false
    },
    {
      name: 'Professional Agent',
      monthly: 5000,
      yearly: 50000,
      features: ['Up to 50 Clients', 'All Mushak Forms', 'Priority Support', 'Advanced Analytics', 'OCR Scanner (100/mo)'],
      recommended: true
    },
    {
      name: 'Enterprise Firm',
      monthly: 12000,
      yearly: 120000,
      features: ['Unlimited Clients', 'Custom API Access', 'Dedicated Account Manager', 'White-label Reports', 'Unlimited OCR'],
      recommended: false
    }
  ];

  const paymentMethods = [
    { id: 'bkash', name: 'bKash', icon: 'https://logos-world.net/wp-content/uploads/2022/07/BKash-Logo.png' },
    { id: 'nagad', name: 'Nagad', icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Nagad_Logo.svg/1200px-Nagad_Logo.svg.png' },
    { id: 'bank', name: 'Bank Transfer', icon: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png' }
  ];

  return (
    <div className="flex flex-col gap-8 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-zinc-800">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  Agent Workspace
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                  <ShieldCheck size={14} className="text-emerald-400" /> Verified Firm
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                For VAT <span className="text-cyan-400">Agents</span>
              </h1>
              <p className="text-zinc-400 font-medium max-w-xl">
                Professional compliance management for tax consultants and accounting firms in Bangladesh.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveTab('subscriptions')}
                className="px-6 py-3 bg-cyan-500 text-zinc-900 rounded-2xl font-black text-sm hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-900/20 active:scale-95"
              >
                Upgrade Plan
              </button>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
            <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <TabButton active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={<Users size={18} />} label="Clients" />
            <TabButton active={activeTab === 'mushak'} onClick={() => setActiveTab('mushak')} icon={<FileText size={18} />} label="Mushak Forms" />
            <TabButton active={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')} icon={<CreditCard size={18} />} label="Subscriptions" />
            <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18} />} label="Firm Settings" />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                    <TrendingUp size={16} className="text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-zinc-900 mb-1">{stat.value}</h3>
                  <p className="text-[10px] font-bold text-zinc-500">{stat.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-zinc-900">Monthly VAT Performance</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Lakhs BDT — Last 6 Months</p>
                  </div>
                  <select className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-4 focus:ring-cyan-500/10">
                    <option>FY 2025-26</option>
                    <option>FY 2024-25</option>
                  </select>
                </div>
                <div className="h-[300px]">
                  <Bar 
                    data={{
                      labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                      datasets: [
                        { label: 'VAT Payable', data: [38, 42, 35, 47, 44, 51], backgroundColor: '#06b6d4', borderRadius: 8 },
                        { label: 'VAT Filed', data: [36, 42, 35, 45, 42, 0], backgroundColor: '#10b981', borderRadius: 8 },
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { grid: { display: false }, ticks: { font: { weight: 'bold' } } },
                        x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col">
                <h3 className="text-xl font-black text-zinc-900 mb-8">Filing Status</h3>
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="w-full max-w-[200px]">
                    <Doughnut 
                      data={{
                        labels: ['Filed', 'Pending', 'Overdue'],
                        datasets: [{
                          data: [33, 11, 4],
                          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                          borderWidth: 0,
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '75%',
                        plugins: { legend: { display: false } }
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-zinc-900">48</span>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Returns</span>
                  </div>
                </div>
                <div className="mt-8 space-y-3">
                  <StatusRow label="Filed" value="33" color="bg-emerald-500" />
                  <StatusRow label="Pending" value="11" color="bg-yellow-500" />
                  <StatusRow label="Overdue" value="4" color="bg-red-500" />
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                <h3 className="text-xl font-black text-zinc-900">Upcoming Deadlines</h3>
                <button className="text-xs font-black text-cyan-600 uppercase tracking-widest hover:underline">View Calendar</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50">
                      <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Client</th>
                      <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">BIN</th>
                      <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Form</th>
                      <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Due Date</th>
                      <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    <DeadlineRow client="Dhaka Textiles Ltd." bin="000123456-0101" form="Mushak 6.4" date="15 Mar 2026" status="pending" />
                    <DeadlineRow client="Ruposhi Fashions" bin="000234567-0201" form="Mushak 6.4" date="15 Mar 2026" status="filed" />
                    <DeadlineRow client="Agrani Foods Co." bin="000345678-0301" form="Mushak 6.1" date="15 Mar 2026" status="overdue" />
                    <DeadlineRow client="Bengal Steel Works" bin="000456789-0401" form="Mushak 6.3" date="20 Mar 2026" status="pending" />
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'subscriptions' && (
          <motion.div 
            key="subscriptions"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
          >
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-4xl font-black text-zinc-900 mb-4">Professional Agent Plans</h2>
              <p className="text-zinc-500 font-medium">Choose the plan that fits your firm's size. Save 20% with yearly billing.</p>
              
              <div className="mt-8 inline-flex items-center p-1 bg-zinc-100 rounded-2xl">
                <button 
                  onClick={() => setBillingCycle('monthly')}
                  className={cn(
                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    billingCycle === 'monthly' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setBillingCycle('yearly')}
                  className={cn(
                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    billingCycle === 'yearly' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "bg-white p-10 rounded-[3rem] border transition-all relative flex flex-col",
                    plan.recommended ? "border-cyan-500 shadow-2xl shadow-cyan-100 scale-105 z-10" : "border-zinc-100 shadow-sm hover:shadow-xl"
                  )}
                >
                  {plan.recommended && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-black text-zinc-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black text-zinc-900">৳{billingCycle === 'monthly' ? plan.monthly.toLocaleString() : (plan.yearly / 12).toLocaleString()}</span>
                    <span className="text-zinc-400 font-bold text-sm">/mo</span>
                  </div>
                  
                  <div className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm font-medium text-zinc-600">
                        <CheckCircle2 size={18} className="text-cyan-500 shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <button className={cn(
                    "w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95",
                    plan.recommended ? "bg-cyan-500 text-white shadow-xl shadow-cyan-900/20 hover:bg-cyan-400" : "bg-zinc-900 text-white hover:bg-zinc-800"
                  )}>
                    Select Plan
                  </button>
                </div>
              ))}
            </div>

            {/* Payment Modalities */}
            <div className="bg-zinc-900 rounded-[3rem] p-12 text-white border border-zinc-800 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-black mb-4">Flexible Payment Modalities</h3>
                  <p className="text-zinc-400 font-medium leading-relaxed mb-8">
                    We support all major payment gateways in Bangladesh. Choose the method that works best for your firm.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 mb-4">
                        <TrendingUp size={20} />
                      </div>
                      <h4 className="font-black mb-1">Instant Activation</h4>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Mobile Banking</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-4">
                        <FileText size={20} />
                      </div>
                      <h4 className="font-black mb-1">Invoice Billing</h4>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Bank Transfer</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10">
                  <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6">Supported Methods</h4>
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl overflow-hidden p-2 flex items-center justify-center">
                            <img src={method.icon} alt={method.name} className="max-w-full max-h-full object-contain" />
                          </div>
                          <span className="font-black">{method.name}</span>
                        </div>
                        <ChevronRight size={20} className="text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'mushak' && (
          <motion.div 
            key="mushak"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MushakFormCard 
                title="Mushak 6.1" 
                desc="Purchase Register" 
                icon={<Receipt className="text-cyan-500" />} 
              />
              <MushakFormCard 
                title="Mushak 6.2" 
                desc="Sales Register" 
                icon={<TrendingUp className="text-emerald-500" />} 
              />
              <MushakFormCard 
                title="Mushak 6.3" 
                desc="Tax Invoice" 
                icon={<FileText className="text-purple-500" />} 
              />
              <MushakFormCard 
                title="Mushak 6.4" 
                desc="Contractual Production" 
                icon={<Settings className="text-zinc-500" />} 
              />
              <MushakFormCard 
                title="Mushak 6.6" 
                desc="VDS Certificate" 
                icon={<ShieldCheck className="text-blue-500" />} 
              />
              <MushakFormCard 
                title="Mushak 9.1" 
                desc="VAT Return Form" 
                icon={<LayoutDashboard className="text-orange-500" />} 
                highlight
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-12"
          >
            <h3 className="text-2xl font-black text-zinc-900 mb-8">Firm Configuration</h3>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Firm Name</label>
                  <input type="text" defaultValue="Elite Tax Consultants" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-cyan-500/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Agent License No.</label>
                  <input type="text" defaultValue="VAT-AGT-2024-0892" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-cyan-500/10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Office Address</label>
                <textarea rows={3} defaultValue="Suite 402, Navana Tower, Gulshan-1, Dhaka" className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 resize-none" />
              </div>
              <div className="flex items-center justify-between p-6 bg-cyan-50 rounded-3xl border border-cyan-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-white">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-cyan-900">Verification Status</h4>
                    <p className="text-xs font-bold text-cyan-700">Your firm is fully verified by NBR.</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white text-cyan-600 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm">View Certificate</button>
              </div>
              <div className="pt-4">
                <button className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm hover:bg-zinc-800 transition-all active:scale-95">
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'clients' && (
          <motion.div 
            key="clients"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden"
          >
            <div className="p-8 border-b border-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50/30">
              <div>
                <h3 className="text-xl font-black text-zinc-900">Client Management</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">48 Registered Clients</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search BIN or Name..."
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 w-64"
                  />
                </div>
                <button 
                  onClick={() => setShowAddClient(true)}
                  className="p-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Business Name</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">BIN</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Contact</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Circle</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filteredClients.map((client, i) => (
                    <ClientRow key={i} {...client} />
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Client Modal */}
      <AnimatePresence>
        {showAddClient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddClient(false)}
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
                <button onClick={() => setShowAddClient(false)} className="p-2 text-zinc-400 hover:text-zinc-900">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddClient} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Business Name</label>
                  <input 
                    type="text" 
                    required
                    value={newClient.name}
                    onChange={e => setNewClient({...newClient, name: e.target.value})}
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-cyan-500/10" 
                    placeholder="Enter business name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Address</label>
                  <textarea 
                    value={newClient.address}
                    onChange={e => setNewClient({...newClient, address: e.target.value})}
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 min-h-[100px] resize-none" 
                    placeholder="Enter full address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">BIN</label>
                    <input 
                      type="text" 
                      required
                      value={newClient.bin}
                      onChange={e => setNewClient({...newClient, bin: e.target.value})}
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-cyan-500/10" 
                      placeholder="Enter BIN"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">TIN</label>
                    <input 
                      type="text" 
                      value={newClient.tin}
                      onChange={e => setNewClient({...newClient, tin: e.target.value})}
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-cyan-500/10" 
                      placeholder="Enter TIN"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mobile Number</label>
                    <input 
                      type="text" 
                      value={newClient.mobile}
                      onChange={e => setNewClient({...newClient, mobile: e.target.value})}
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-cyan-500/10" 
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Contact Person</label>
                    <input 
                      type="text" 
                      value={newClient.contact}
                      onChange={e => setNewClient({...newClient, contact: e.target.value})}
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-cyan-500/10" 
                      placeholder="Enter contact name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Circle / Area</label>
                  <input 
                    type="text" 
                    value={newClient.circle}
                    onChange={e => setNewClient({...newClient, circle: e.target.value})}
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-cyan-500/10" 
                    placeholder="Enter circle or area"
                  />
                </div>
                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddClient(false)}
                    className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-cyan-500 text-white rounded-2xl font-black text-sm hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-900/20"
                  >
                    Add Client
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
        active ? "bg-white text-zinc-900 shadow-lg" : "text-zinc-400 hover:text-white hover:bg-white/5"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StatusRow({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <span className="text-xs font-bold text-zinc-600">{label}</span>
      </div>
      <span className="text-sm font-black text-zinc-900">{value}</span>
    </div>
  );
}

function DeadlineRow({ client, bin, form, date, status }: { client: string, bin: string, form: string, date: string, status: 'pending' | 'filed' | 'overdue' }) {
  const statusStyles = {
    pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    filed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    overdue: 'bg-red-50 text-red-600 border-red-100'
  };

  return (
    <tr className="hover:bg-zinc-50/50 transition-colors group">
      <td className="px-8 py-4">
        <div className="font-black text-zinc-900 text-sm">{client}</div>
      </td>
      <td className="px-8 py-4 font-mono text-[10px] font-bold text-zinc-400">{bin}</td>
      <td className="px-8 py-4 text-xs font-bold text-zinc-500">{form}</td>
      <td className="px-8 py-4 text-xs font-bold text-zinc-500">{date}</td>
      <td className="px-8 py-4">
        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", statusStyles[status])}>
          {status}
        </span>
      </td>
      <td className="px-8 py-4 text-right">
        <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
          <ExternalLink size={16} />
        </button>
      </td>
    </tr>
  );
}

function ClientRow({ name, bin, contact, circle, status }: { name: string, bin: string, contact: string, circle: string, status: string }) {
  return (
    <tr className="hover:bg-zinc-50/50 transition-colors group">
      <td className="px-8 py-4">
        <div className="font-black text-zinc-900 text-sm">{name}</div>
      </td>
      <td className="px-8 py-4 font-mono text-[10px] font-bold text-zinc-400">{bin}</td>
      <td className="px-8 py-4 text-xs font-bold text-zinc-500">{contact}</td>
      <td className="px-8 py-4 text-xs font-bold text-zinc-500">{circle}</td>
      <td className="px-8 py-4">
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
          {status}
        </span>
      </td>
      <td className="px-8 py-4 text-right">
        <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </td>
    </tr>
  );
}

function MoreHorizontal({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function MushakFormCard({ title, desc, icon, highlight }: { title: string, desc: string, icon: React.ReactNode, highlight?: boolean }) {
  return (
    <div className={cn(
      "bg-white p-8 rounded-[2.5rem] border transition-all group flex flex-col",
      highlight ? "border-cyan-500 shadow-xl shadow-cyan-100" : "border-zinc-100 shadow-sm hover:shadow-xl"
    )}>
      <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-xl font-black text-zinc-900 mb-1">{title}</h4>
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">{desc}</p>
      
      <div className="flex items-center gap-2 mt-auto">
        <button className="flex-1 py-3 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">
          Generate
        </button>
        <button className="p-3 bg-zinc-50 text-zinc-400 rounded-xl hover:text-zinc-900 transition-all">
          <Download size={16} />
        </button>
      </div>
    </div>
  );
}

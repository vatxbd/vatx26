import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Download,
  FileText,
  ExternalLink,
  Save,
  X,
  Calculator,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TDSRecord {
  id: number;
  payeeName: string;
  payeeTin: string;
  payeeBin: string;
  payeeCategory: string;
  paymentType: string;
  invoiceNo: string;
  invoiceDate: string;
  grossAmount: number;
  tdsRate: number;
  tdsAmount: number;
  challanNo: string;
  challanDate: string;
  bankName: string;
  bankBranch: string;
  certificateNo: string;
  status: 'pending' | 'paid' | 'certificate_issued';
  createdAt: string;
}

interface TDSRate {
  id: number;
  category: string;
  section: string;
  rateWithTin: number;
  rateWithoutTin: number;
  description: string;
}

export default function TDSTracker() {
  const [records, setRecords] = useState<TDSRecord[]>([]);
  const [rates, setRates] = useState<TDSRate[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRates, setShowRates] = useState(false);
  const [showQuickCalc, setShowQuickCalc] = useState(false);
  const [calcGross, setCalcGross] = useState<number>(0);
  const [calcRate, setCalcRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isManagingRates, setIsManagingRates] = useState(false);
  const [editingRate, setEditingRate] = useState<TDSRate | null>(null);
  const [newRate, setNewRate] = useState({
    category: '',
    section: '',
    rateWithTin: 0,
    rateWithoutTin: 0,
    description: ''
  });
  const [newRecord, setNewRecord] = useState({
    payeeName: '',
    payeeTin: '',
    payeeBin: '',
    payeeCategory: 'Company',
    paymentType: 'Supply of Goods',
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    grossAmount: 0,
    tdsRate: 3,
    tdsAmount: 0,
  });

  const stats = {
    totalGross: records.reduce((sum, r) => sum + r.grossAmount, 0),
    totalTDS: records.reduce((sum, r) => sum + r.tdsAmount, 0),
    pendingCount: records.filter(r => r.status === 'pending').length,
    paidCount: records.filter(r => r.status === 'paid').length,
  };

  const calcResult = (calcGross * calcRate) / 100;

  useEffect(() => {
    fetchRecords();
    fetchRates();
  }, []);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tds');
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch TDS records', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/tds/rates');
      const data = await res.json();
      setRates(data);
    } catch (err) {
      console.error('Failed to fetch TDS rates', err);
    }
  };

  const handleAddRate = async () => {
    if (!newRate.category) return;
    try {
      await fetch('/api/tds/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRate),
      });
      setNewRate({ category: '', section: '', rateWithTin: 0, rateWithoutTin: 0, description: '' });
      setIsManagingRates(false);
      fetchRates();
    } catch (err) {
      console.error('Failed to add TDS rate', err);
    }
  };

  const handleUpdateRate = async () => {
    if (!editingRate) return;
    try {
      await fetch(`/api/tds/rates/${editingRate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRate),
      });
      setEditingRate(null);
      fetchRates();
    } catch (err) {
      console.error('Failed to update TDS rate', err);
    }
  };

  const handleDeleteRate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this TDS rate?')) return;
    try {
      await fetch(`/api/tds/rates/${id}`, { method: 'DELETE' });
      fetchRates();
    } catch (err) {
      console.error('Failed to delete TDS rate', err);
    }
  };

  const handleAddRecord = async () => {
    if (!newRecord.payeeName) return;
    try {
      await fetch('/api/tds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
      setShowAddForm(false);
      setNewRecord({
        payeeName: '',
        payeeTin: '',
        payeeBin: '',
        payeeCategory: 'Company',
        paymentType: 'Supply of Goods',
        invoiceNo: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        grossAmount: 0,
        tdsRate: 3,
        tdsAmount: 0,
      });
      fetchRecords();
    } catch (err) {
      console.error('Failed to add TDS record', err);
    }
  };

  const updateStatus = async (record: TDSRecord, newStatus: TDSRecord['status']) => {
    let challanNo = record.challanNo;
    let challanDate = record.challanDate;
    let bankName = record.bankName;
    let bankBranch = record.bankBranch;
    let certificateNo = record.certificateNo;

    if (newStatus === 'paid' && !challanNo) {
      const cNo = prompt("Enter i-Challan Number:");
      if (!cNo) return;
      challanNo = cNo;
      
      const bName = prompt("Enter Bank Name:", "Sonali Bank PLC");
      if (bName) bankName = bName;
      
      const bBranch = prompt("Enter Branch Name:");
      if (bBranch) bankBranch = bBranch;
      
      challanDate = new Date().toISOString().split('T')[0];
    }

    if (newStatus === 'certificate_issued' && !certificateNo) {
      const input = prompt("Enter TDS Certificate Number:");
      if (!input) return;
      certificateNo = input;
    }

    try {
      await fetch(`/api/tds/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, challanNo, challanDate, certificateNo, bankName, bankBranch }),
      });
      fetchRecords();
    } catch (err) {
      console.error('Failed to update TDS status', err);
    }
  };

  const calculateTDS = (amount: number, rate: number) => {
    return (amount * rate) / 100;
  };

  const exportToCSV = () => {
    if (records.length === 0) return;

    const headers = [
      'Payee Name',
      'Payee Category',
      'Payee TIN',
      'Payee BIN',
      'Payment Type',
      'Invoice No',
      'Invoice Date',
      'Gross Amount',
      'TDS Rate (%)',
      'TDS Amount',
      'Challan No',
      'Challan Date',
      'Bank Name',
      'Bank Branch',
      'Certificate No',
      'Status',
      'Created At'
    ];

    const csvRows = [
      headers.join(','),
      ...records.map(record => [
        `"${record.payeeName}"`,
        `"${record.payeeCategory}"`,
        `"${record.payeeTin}"`,
        `"${record.payeeBin || ''}"`,
        `"${record.paymentType}"`,
        `"${record.invoiceNo}"`,
        `"${record.invoiceDate}"`,
        record.grossAmount,
        record.tdsRate,
        record.tdsAmount,
        `"${record.challanNo || ''}"`,
        `"${record.challanDate || ''}"`,
        `"${record.bankName || ''}"`,
        `"${record.bankBranch || ''}"`,
        `"${record.certificateNo || ''}"`,
        `"${record.status}"`,
        `"${record.createdAt}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tds_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Calculator className="text-blue-500" size={32} /> TDS Tracker
          </h2>
          <p className="text-zinc-500">Manage Tax Deducted at Source, Challans, and Certificates</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowQuickCalc(!showQuickCalc)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 border rounded-2xl font-bold transition-all shadow-sm",
              showQuickCalc ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            )}
          >
            <Calculator size={20} />
            Quick Calc
          </button>
          <button 
            onClick={() => setShowRates(!showRates)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 text-zinc-700 rounded-2xl font-bold hover:bg-zinc-50 transition-all shadow-sm"
          >
            <BookOpen size={20} className="text-blue-500" />
            TDS Rates
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
          >
            {showAddForm ? <X size={20} /> : <Plus size={20} />}
            {showAddForm ? 'Cancel' : 'New TDS Entry'}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Gross</p>
          <p className="text-2xl font-black text-zinc-900">৳{stats.totalGross.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 shadow-sm">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total TDS</p>
          <p className="text-2xl font-black text-blue-700">৳{stats.totalTDS.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm">
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Pending Payment</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-black text-amber-700">{stats.pendingCount}</p>
            <p className="text-xs font-bold text-amber-600 mb-1">Records</p>
          </div>
        </div>
        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Paid Records</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-black text-emerald-700">{stats.paidCount}</p>
            <p className="text-xs font-bold text-emerald-600 mb-1">Records</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showQuickCalc && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <Calculator size={20} /> Quick TDS Calculator
                  </h3>
                  <button onClick={() => setShowQuickCalc(false)} className="text-white/60 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Gross Amount (৳)</label>
                    <input 
                      type="number" 
                      value={calcGross || ''}
                      onChange={(e) => setCalcGross(parseFloat(e.target.value) || 0)}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:bg-white/20 transition-all text-white placeholder:text-white/30 text-xl font-bold"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Select TDS Rate / Category</label>
                    <select 
                      onChange={(e) => setCalcRate(parseFloat(e.target.value))}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:bg-white/20 transition-all text-white text-lg font-bold appearance-none"
                    >
                      <option value="0" className="text-zinc-900">Choose a rate...</option>
                      {rates.map(r => (
                        <optgroup key={r.id} label={r.category} className="text-zinc-900 font-bold">
                          <option value={r.rateWithTin} className="text-zinc-900">With TIN ({r.rateWithTin}%)</option>
                          <option value={r.rateWithoutTin} className="text-zinc-900">No TIN ({r.rateWithoutTin}%)</option>
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Deducted TDS Amount</label>
                    <div className="w-full p-4 bg-white text-blue-600 rounded-2xl text-xl font-black shadow-inner flex items-center justify-between">
                      <span>৳</span>
                      <span>{calcResult.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4 text-xs font-bold text-blue-100/60 italic">
                  <AlertCircle size={14} />
                  <span>Calculated based on standard NBR rates. Use "New TDS Entry" to save this to your records.</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showRates && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-blue-900">TDS Rates Reference (FY 2024-25)</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsManagingRates(!isManagingRates)}
                    className="p-2 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all"
                    title="Add New Rate"
                  >
                    <Plus size={18} />
                  </button>
                  <button onClick={() => setShowRates(false)} className="text-blue-400 hover:text-blue-600">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {isManagingRates && (
                <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm space-y-4">
                  <h4 className="font-bold text-zinc-900">Add New TDS Rate</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      type="text" 
                      placeholder="Category (e.g. Salary)" 
                      value={newRate.category}
                      onChange={(e) => setNewRate({...newRate, category: e.target.value})}
                      className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="Section (e.g. 50)" 
                      value={newRate.section}
                      onChange={(e) => setNewRate({...newRate, section: e.target.value})}
                      className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="Description" 
                      value={newRate.description}
                      onChange={(e) => setNewRate({...newRate, description: e.target.value})}
                      className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">With TIN %</label>
                      <input 
                        type="number" 
                        value={newRate.rateWithTin}
                        onChange={(e) => setNewRate({...newRate, rateWithTin: parseFloat(e.target.value)})}
                        className="flex-1 p-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">No TIN %</label>
                      <input 
                        type="number" 
                        value={newRate.rateWithoutTin}
                        onChange={(e) => setNewRate({...newRate, rateWithoutTin: parseFloat(e.target.value)})}
                        className="flex-1 p-3 bg-zinc-50 border border-zinc-100 rounded-xl outline-none"
                      />
                    </div>
                    <button 
                      onClick={handleAddRate}
                      className="p-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                    >
                      Save Rate
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rates.map(rate => (
                  <div key={rate.id} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-2 relative group">
                    {editingRate?.id === rate.id ? (
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          value={editingRate.category}
                          onChange={(e) => setEditingRate({...editingRate, category: e.target.value})}
                          className="w-full p-2 text-sm border rounded"
                        />
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            value={editingRate.rateWithTin}
                            onChange={(e) => setEditingRate({...editingRate, rateWithTin: parseFloat(e.target.value)})}
                            className="w-1/2 p-2 text-sm border rounded"
                            placeholder="With TIN"
                          />
                          <input 
                            type="number" 
                            value={editingRate.rateWithoutTin}
                            onChange={(e) => setEditingRate({...editingRate, rateWithoutTin: parseFloat(e.target.value)})}
                            className="w-1/2 p-2 text-sm border rounded"
                            placeholder="No TIN"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleUpdateRate} className="flex-1 p-2 bg-emerald-600 text-white text-xs rounded font-bold">Save</button>
                          <button onClick={() => setEditingRate(null)} className="flex-1 p-2 bg-zinc-100 text-zinc-600 text-xs rounded font-bold">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-zinc-900">{rate.category}</h4>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black">Sec {rate.section}</span>
                            <div className="hidden group-hover:flex items-center gap-1 ml-2">
                              <button onClick={() => setEditingRate(rate)} className="p-1 text-zinc-400 hover:text-blue-600"><FileText size={14} /></button>
                              <button onClick={() => handleDeleteRate(rate.id)} className="p-1 text-zinc-400 hover:text-red-600"><X size={14} /></button>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500">{rate.description}</p>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="p-2 bg-emerald-50 rounded-lg text-center">
                            <p className="text-[10px] text-emerald-600 font-bold uppercase">With TIN</p>
                            <p className="text-lg font-black text-emerald-700">{rate.rateWithTin}%</p>
                          </div>
                          <div className="p-2 bg-red-50 rounded-lg text-center">
                            <p className="text-[10px] text-red-600 font-bold uppercase">No TIN</p>
                            <p className="text-lg font-black text-red-700">{rate.rateWithoutTin}%</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {showAddForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Payee Name</label>
                  <input 
                    type="text"
                    value={newRecord.payeeName}
                    onChange={(e) => setNewRecord({...newRecord, payeeName: e.target.value})}
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Payee Category</label>
                  <select 
                    value={newRecord.payeeCategory}
                    onChange={(e) => setNewRecord({...newRecord, payeeCategory: e.target.value})}
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                  >
                    <option value="Company">Company</option>
                    <option value="Individual">Individual</option>
                    <option value="Firm">Partnership Firm</option>
                    <option value="Association">Association of Persons</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Payee TIN</label>
                  <input 
                    type="text"
                    value={newRecord.payeeTin}
                    onChange={(e) => setNewRecord({...newRecord, payeeTin: e.target.value})}
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                    placeholder="12-digit TIN"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Payee BIN (Optional)</label>
                  <input 
                    type="text"
                    value={newRecord.payeeBin}
                    onChange={(e) => setNewRecord({...newRecord, payeeBin: e.target.value})}
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                    placeholder="BIN Number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Payment Type</label>
                  <select 
                    value={newRecord.paymentType}
                    onChange={(e) => {
                      const type = e.target.value;
                      const rateObj = rates.find(r => r.category === type);
                      const rate = newRecord.payeeTin ? (rateObj?.rateWithTin || 0) : (rateObj?.rateWithoutTin || 0);
                      setNewRecord({
                        ...newRecord, 
                        paymentType: type,
                        tdsRate: rate,
                        tdsAmount: calculateTDS(newRecord.grossAmount, rate)
                      });
                    }}
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 outline-none transition-all appearance-none"
                  >
                    {rates.map(r => (
                      <option key={r.id} value={r.category}>{r.category}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Gross Amount</label>
                  <input 
                    type="number"
                    value={newRecord.grossAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setNewRecord({
                        ...newRecord, 
                        grossAmount: val,
                        tdsAmount: calculateTDS(val, newRecord.tdsRate)
                      });
                    }}
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">TDS Rate (%)</label>
                  <input 
                    type="number"
                    value={newRecord.tdsRate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setNewRecord({
                        ...newRecord, 
                        tdsRate: val,
                        tdsAmount: calculateTDS(newRecord.grossAmount, val)
                      });
                    }}
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">TDS Amount</label>
                  <input 
                    type="number"
                    value={newRecord.tdsAmount}
                    readOnly
                    className="w-full p-4 bg-zinc-100 border border-zinc-100 rounded-2xl outline-none font-bold text-blue-600"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleAddRecord}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  Save TDS Record
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text"
              placeholder="Search by payee or TIN..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/5 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 text-zinc-500 hover:bg-zinc-50 rounded-xl transition-all">
              <Filter size={20} />
            </button>
            <button 
              onClick={exportToCSV}
              className="p-3 text-zinc-500 hover:bg-zinc-50 rounded-xl transition-all"
              title="Export to CSV"
            >
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payee / TIN</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payment Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Amounts (৳)</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Challan / Cert</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {records.map(record => (
                <tr key={record.id} className="group hover:bg-zinc-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-zinc-900">{record.payeeName}</p>
                    <p className="text-[10px] font-mono text-zinc-400">{record.payeeCategory} • {record.payeeTin || 'No TIN'}</p>
                    {record.payeeBin && <p className="text-[10px] text-zinc-300">BIN: {record.payeeBin}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-zinc-700">{record.paymentType}</p>
                    <p className="text-[10px] text-zinc-400">Inv: {record.invoiceNo || 'N/A'} • {record.invoiceDate}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="space-y-0.5">
                      <p className="text-xs text-zinc-400">Gross: ৳{record.grossAmount.toLocaleString()}</p>
                      <p className="text-sm font-black text-blue-600">TDS ({record.tdsRate}%): ৳{record.tdsAmount.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {record.challanNo ? (
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Challan: {record.challanNo}
                          </p>
                          <p className="text-[9px] text-emerald-400 ml-3.5">{record.bankName} - {record.bankBranch}</p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                          <Clock size={10} /> Challan Missing
                        </p>
                      )}
                      {record.certificateNo ? (
                        <p className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                          <FileText size={10} /> Cert: {record.certificateNo}
                        </p>
                      ) : (
                        <p className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                          <Clock size={10} /> Cert Missing
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      record.status === 'certificate_issued' ? "bg-emerald-100 text-emerald-700" : 
                      record.status === 'paid' ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {record.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {record.status === 'pending' && (
                        <button 
                          onClick={() => updateStatus(record, 'paid')}
                          className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Mark as Paid"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      {record.status === 'paid' && (
                        <button 
                          onClick={() => updateStatus(record, 'certificate_issued')}
                          className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Issue Certificate"
                        >
                          <FileText size={18} />
                        </button>
                      )}
                      <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all">
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {records.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300">
                        <Calculator size={32} />
                      </div>
                      <p className="text-zinc-400 text-sm italic">No TDS records found. Add your first entry above.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

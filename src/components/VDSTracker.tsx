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
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VDSRecord {
  id: number;
  vendorName: string;
  vendorBin: string;
  invoiceNo: string;
  invoiceDate: string;
  totalAmount: number;
  vatAmount: number;
  vdsAmount: number;
  mushak66No: string;
  mushak66Date: string;
  status: 'pending' | 'collected';
  createdAt: string;
}

export default function VDSTracker() {
  const [records, setRecords] = useState<VDSRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newRecord, setNewRecord] = useState({
    vendorName: '',
    vendorBin: '',
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    totalAmount: 0,
    vatAmount: 0,
    vdsAmount: 0,
    mushak66No: '',
    mushak66Date: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/vds');
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch VDS records', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecord = async () => {
    if (!newRecord.vendorName) return;
    try {
      await fetch('/api/vds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
      setShowAddForm(false);
      setNewRecord({
        vendorName: '',
        vendorBin: '',
        invoiceNo: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        vatAmount: 0,
        vdsAmount: 0,
        mushak66No: '',
        mushak66Date: ''
      });
      fetchRecords();
    } catch (err) {
      console.error('Failed to add VDS record', err);
    }
  };

  const toggleStatus = async (record: VDSRecord) => {
    const newStatus = record.status === 'pending' ? 'collected' : 'pending';
    let mushak66No = record.mushak66No;
    let mushak66Date = record.mushak66Date;

    if (newStatus === 'collected' && !mushak66No) {
      const input = prompt("Enter Mushak 6.6 Certificate Number:");
      if (!input) return;
      mushak66No = input;
      mushak66Date = new Date().toISOString().split('T')[0];
    }

    try {
      await fetch(`/api/vds/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, mushak66No, mushak66Date }),
      });
      fetchRecords();
    } catch (err) {
      console.error('Failed to update VDS status', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <ClipboardCheck className="text-brand-500" size={32} /> VDS Tracker
          </h2>
          <p className="text-zinc-500">Track VAT Deducted at Source and Mushak 6.6 certificates</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
        >
          {showAddForm ? <X size={20} /> : <Plus size={20} />}
          {showAddForm ? 'Cancel' : 'New VDS Entry'}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Vendor Name</label>
                  <input 
                    type="text"
                    value={newRecord.vendorName}
                    onChange={(e) => setNewRecord({...newRecord, vendorName: e.target.value})}
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Vendor BIN</label>
                  <input 
                    type="text"
                    value={newRecord.vendorBin}
                    onChange={(e) => setNewRecord({...newRecord, vendorBin: e.target.value})}
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                    placeholder="000000000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Invoice No</label>
                  <input 
                    type="text"
                    value={newRecord.invoiceNo}
                    onChange={(e) => setNewRecord({...newRecord, invoiceNo: e.target.value})}
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                    placeholder="INV-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Total Amount</label>
                  <input 
                    type="number"
                    value={newRecord.totalAmount}
                    onChange={(e) => setNewRecord({...newRecord, totalAmount: parseFloat(e.target.value)})}
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">VAT Amount</label>
                  <input 
                    type="number"
                    value={newRecord.vatAmount}
                    onChange={(e) => setNewRecord({...newRecord, vatAmount: parseFloat(e.target.value)})}
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">VDS Amount</label>
                  <input 
                    type="number"
                    value={newRecord.vdsAmount}
                    onChange={(e) => setNewRecord({...newRecord, vdsAmount: parseFloat(e.target.value)})}
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleAddRecord}
                  className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-black hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
                >
                  Save VDS Record
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
              placeholder="Search by vendor or invoice..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-4 focus:ring-brand-500/5 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 text-zinc-500 hover:bg-zinc-50 rounded-xl transition-all">
              <Filter size={20} />
            </button>
            <button className="p-3 text-zinc-500 hover:bg-zinc-50 rounded-xl transition-all">
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Vendor / BIN</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Invoice Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Amounts (৳)</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mushak 6.6</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {records.map(record => (
                <tr key={record.id} className="group hover:bg-zinc-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-zinc-900">{record.vendorName}</p>
                    <p className="text-[10px] font-mono text-zinc-400">{record.vendorBin || 'No BIN'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-zinc-700">{record.invoiceNo}</p>
                    <p className="text-[10px] text-zinc-400">{new Date(record.invoiceDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="space-y-0.5">
                      <p className="text-xs text-zinc-400">Total: ৳{record.totalAmount.toLocaleString()}</p>
                      <p className="text-sm font-black text-brand-600">VDS: ৳{record.vdsAmount.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {record.mushak66No ? (
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={12} /> {record.mushak66No}
                        </p>
                        <p className="text-[10px] text-zinc-400">{new Date(record.mushak66Date).toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-500 font-bold flex items-center gap-1">
                        <Clock size={12} /> Missing
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      record.status === 'collected' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleStatus(record)}
                        className="p-2 text-zinc-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                        title={record.status === 'pending' ? "Mark as Collected" : "Mark as Pending"}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all">
                        <FileText size={18} />
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
                        <ClipboardCheck size={32} />
                      </div>
                      <p className="text-zinc-400 text-sm italic">No VDS records found. Add your first entry above.</p>
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

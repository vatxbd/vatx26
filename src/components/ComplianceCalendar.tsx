import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Info,
  ExternalLink,
  Plus,
  X,
  RefreshCw,
  Trash2,
  Repeat
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Deadline {
  id: number;
  title: string;
  deadlineDate: string;
  category: string;
  isCompleted: boolean;
  description: string;
}

interface RecurringTask {
  id: number;
  title: string;
  category: string;
  frequency: string;
  dayOfMonth: number;
  description: string;
  reminderDays: number;
}

export default function ComplianceCalendar({ t }: { t: any }) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [activeView, setActiveView] = useState<'calendar' | 'recurring'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'VAT',
    description: ''
  });
  const [newRecurringTask, setNewRecurringTask] = useState({
    title: '',
    category: 'VAT',
    frequency: 'monthly',
    dayOfMonth: 15,
    description: '',
    reminderDays: 3
  });

  useEffect(() => {
    fetchDeadlines();
    fetchRecurringTasks();
  }, []);

  const fetchDeadlines = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/compliance');
      const data = await res.json();
      setDeadlines(data);
    } catch (err) {
      console.error('Failed to fetch deadlines', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecurringTasks = async () => {
    try {
      const res = await fetch('/api/recurring-tasks');
      const data = await res.json();
      setRecurringTasks(data);
    } catch (err) {
      console.error('Failed to fetch recurring tasks', err);
    }
  };

  const generateDeadlines = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/compliance/generate', { method: 'POST' });
      fetchDeadlines();
    } catch (err) {
      console.error('Failed to generate deadlines', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecurringTask = async () => {
    if (!newRecurringTask.title) return;
    try {
      await fetch('/api/recurring-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecurringTask),
      });
      setShowRecurringForm(false);
      setNewRecurringTask({
        title: '',
        category: 'VAT',
        frequency: 'monthly',
        dayOfMonth: 15,
        description: '',
        reminderDays: 3
      });
      fetchRecurringTasks();
      generateDeadlines();
    } catch (err) {
      console.error('Failed to add recurring task', err);
    }
  };

  const deleteRecurringTask = async (id: number) => {
    try {
      await fetch(`/api/recurring-tasks/${id}`, { method: 'DELETE' });
      fetchRecurringTasks();
    } catch (err) {
      console.error('Failed to delete recurring task', err);
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification("Reminders Enabled", { body: "You will now receive tax deadline reminders." });
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("Reminders Enabled", { body: "You will now receive tax deadline reminders." });
      }
    }
  };

  const toggleComplete = async (id: number) => {
    try {
      await fetch(`/api/compliance/${id}`, { method: 'PATCH' });
      fetchDeadlines();
    } catch (err) {
      console.error('Failed to toggle deadline status', err);
    }
  };

  const handleAddDeadline = async () => {
    if (!newDeadline.title || !newDeadline.date) return;
    try {
      await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeadline),
      });
      setShowAddForm(false);
      setNewDeadline({
        title: '',
        date: new Date().toISOString().split('T')[0],
        category: 'VAT',
        description: ''
      });
      fetchDeadlines();
    } catch (err) {
      console.error('Failed to add deadline', err);
    }
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const startDay = firstDayOfMonth(currentMonth);

    // Empty spaces for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-32 border-b border-r border-zinc-50 bg-zinc-50/20" />);
    }

    // Actual days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const dateStr = date.toISOString().split('T')[0];
      const dayDeadlines = deadlines.filter(d => d.deadlineDate === dateStr);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div 
          key={i} 
          onClick={() => setSelectedDate(date)}
          className={cn(
            "h-24 md:h-32 p-2 border-b border-r border-zinc-50 transition-all cursor-pointer hover:bg-zinc-50/50 relative group",
            isToday && "bg-brand-50/30"
          )}
        >
          <span className={cn(
            "text-xs font-black w-6 h-6 flex items-center justify-center rounded-full",
            isToday ? "bg-brand-600 text-white" : "text-zinc-400 group-hover:text-zinc-900"
          )}>
            {i}
          </span>
          <div className="mt-1 space-y-1 overflow-hidden">
            {dayDeadlines.map(d => (
              <div 
                key={d.id} 
                className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] md:text-[10px] font-bold truncate",
                  d.isCompleted ? "bg-emerald-100 text-emerald-700 line-through" : "bg-brand-100 text-brand-700"
                )}
              >
                {d.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  const selectedDeadlines = selectedDate 
    ? deadlines.filter(d => d.deadlineDate === selectedDate.toISOString().split('T')[0])
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <CalendarIcon className="text-brand-500" size={32} /> {t['compliance-calendar']}
              </h2>
              <p className="text-zinc-500">Stay ahead of tax and VAT deadlines in Bangladesh</p>
            </div>
            <div className="flex bg-zinc-100 p-1 rounded-2xl">
              <button 
                onClick={() => setActiveView('calendar')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeView === 'calendar' ? "bg-white text-brand-600 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                Calendar
              </button>
              <button 
                onClick={() => setActiveView('recurring')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeView === 'recurring' ? "bg-white text-brand-600 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                {t.recurringTasks}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm">
            {activeView === 'calendar' ? (
              <>
                <button onClick={() => setShowAddForm(!showAddForm)} className="p-2 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-xl transition-all flex items-center gap-2 px-4 font-bold text-xs">
                  <Plus size={16} /> New Deadline
                </button>
                <button onClick={generateDeadlines} className="p-2 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all flex items-center gap-2 px-4 font-bold text-xs">
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Sync
                </button>
                <div className="h-8 w-px bg-zinc-100 mx-2" />
                <button onClick={prevMonth} className="p-2 hover:bg-zinc-50 rounded-xl transition-all"><ChevronLeft size={20} /></button>
                <span className="px-4 font-black text-sm uppercase tracking-widest text-zinc-900">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={nextMonth} className="p-2 hover:bg-zinc-50 rounded-xl transition-all"><ChevronRight size={20} /></button>
              </>
            ) : (
              <button onClick={() => setShowRecurringForm(!showRecurringForm)} className="p-2 bg-brand-600 text-white hover:bg-brand-700 rounded-xl transition-all flex items-center gap-2 px-4 font-bold text-xs">
                <Plus size={16} /> {t.addRecurringTask}
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showRecurringForm && activeView === 'recurring' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 space-y-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Task Title</label>
                    <input 
                      type="text"
                      value={newRecurringTask.title}
                      onChange={(e) => setNewRecurringTask({...newRecurringTask, title: e.target.value})}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                      placeholder="e.g. Monthly VAT Return"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">{t.frequency}</label>
                    <select 
                      value={newRecurringTask.frequency}
                      onChange={(e) => setNewRecurringTask({...newRecurringTask, frequency: e.target.value})}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all appearance-none"
                    >
                      <option value="monthly">{t.monthly}</option>
                      <option value="quarterly">{t.quarterly}</option>
                      <option value="annually">{t.annually}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">{t.dayOfMonth}</label>
                    <input 
                      type="number"
                      min="1"
                      max="31"
                      value={newRecurringTask.dayOfMonth}
                      onChange={(e) => setNewRecurringTask({...newRecurringTask, dayOfMonth: parseInt(e.target.value)})}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Category</label>
                    <select 
                      value={newRecurringTask.category}
                      onChange={(e) => setNewRecurringTask({...newRecurringTask, category: e.target.value})}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all appearance-none"
                    >
                      <option value="VAT">VAT</option>
                      <option value="Tax">Income Tax</option>
                      <option value="Customs">Customs</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">{t.reminderDays}</label>
                    <input 
                      type="number"
                      value={newRecurringTask.reminderDays}
                      onChange={(e) => setNewRecurringTask({...newRecurringTask, reminderDays: parseInt(e.target.value)})}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Description</label>
                    <input 
                      type="text"
                      value={newRecurringTask.description}
                      onChange={(e) => setNewRecurringTask({...newRecurringTask, description: e.target.value})}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                      placeholder="Brief description..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setShowRecurringForm(false)}
                    className="px-6 py-3 text-zinc-500 font-bold hover:bg-zinc-50 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddRecurringTask}
                    className="px-8 py-3 bg-brand-600 text-white rounded-xl font-black hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
                  >
                    {t.addRecurringTask}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeView === 'calendar' ? (
          <>
            <AnimatePresence>
              {showAddForm && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 space-y-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Deadline Title</label>
                    <input 
                      type="text"
                      value={newDeadline.title}
                      onChange={(e) => setNewDeadline({...newDeadline, title: e.target.value})}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                      placeholder="e.g. VAT Return Submission"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Deadline Date</label>
                    <input 
                      type="date"
                      value={newDeadline.date}
                      onChange={(e) => setNewDeadline({...newDeadline, date: e.target.value})}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Category</label>
                    <select 
                      value={newDeadline.category}
                      onChange={(e) => setNewDeadline({...newDeadline, category: e.target.value})}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all appearance-none"
                    >
                      <option value="VAT">VAT</option>
                      <option value="Tax">Income Tax</option>
                      <option value="Customs">Customs</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Description</label>
                    <input 
                      type="text"
                      value={newDeadline.description}
                      onChange={(e) => setNewDeadline({...newDeadline, description: e.target.value})}
                      className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-4 focus:ring-brand-500/5 outline-none transition-all"
                      placeholder="Brief description..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 text-zinc-500 font-bold hover:bg-zinc-50 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddDeadline}
                    className="px-8 py-3 bg-brand-600 text-white rounded-xl font-black hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
                  >
                    Add Deadline
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-7 border-b border-zinc-100 bg-zinc-50/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-3 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {renderCalendarDays()}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-brand-50 p-6 rounded-[2rem] border border-brand-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-600 shadow-sm">
                  <Bell size={24} />
                </div>
                <div>
                  <h4 className="font-black text-brand-900">Browser Notifications</h4>
                  <p className="text-xs text-brand-700/70 font-medium">Get alerted before your deadlines arrive.</p>
                </div>
              </div>
              <button 
                onClick={requestNotificationPermission}
                className="px-6 py-2 bg-brand-600 text-white rounded-xl font-black text-xs hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
              >
                Enable Reminders
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recurringTasks.map(task => (
                <div key={task.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm relative group overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center">
                        <Repeat size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-zinc-900">{task.title}</h4>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{task.category} • {task.frequency}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteRecurringTask(task.id)}
                      className="p-2 text-zinc-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-zinc-500 mb-6 leading-relaxed">{task.description}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-zinc-400" />
                      <span className="text-xs font-bold text-zinc-600">Day {task.dayOfMonth} of period</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bell size={14} className="text-brand-500" />
                      <span className="text-xs font-bold text-brand-600">{task.reminderDays} days before</span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-500/10 transition-all" />
                </div>
              ))}
              {recurringTasks.length === 0 && (
                <div className="col-span-full py-20 text-center bg-zinc-50/50 rounded-[3rem] border-2 border-dashed border-zinc-200">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-6 shadow-sm">
                    <Repeat size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-400">No Recurring Tasks</h3>
                  <p className="text-sm text-zinc-400 mt-2">Automate your monthly and quarterly compliance tasks.</p>
                  <button 
                    onClick={() => setShowRecurringForm(true)}
                    className="mt-8 px-8 py-3 bg-brand-600 text-white rounded-xl font-black hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
                  >
                    {t.addRecurringTask}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-zinc-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black tracking-tight">{t.reminders}</h3>
            <Bell size={20} className="text-brand-400" />
          </div>
          <div className="space-y-4">
            {deadlines.filter(d => {
              if (d.isCompleted) return false;
              const deadlineDate = new Date(d.deadlineDate);
              const today = new Date();
              const diffTime = deadlineDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              // Find matching recurring task to get reminderDays
              const recurringTask = recurringTasks.find(rt => rt.title === d.title);
              const reminderDays = recurringTask ? recurringTask.reminderDays : 3;
              
              return diffDays <= reminderDays && diffDays >= 0;
            }).map(d => (
              <div key={d.id} className="p-4 bg-brand-500/10 rounded-2xl border border-brand-500/20 hover:bg-brand-500/20 transition-all cursor-pointer relative overflow-hidden group">
                <div className="flex items-start justify-between gap-2 mb-2 relative z-10">
                  <span className="px-2 py-0.5 bg-brand-500 text-white rounded text-[10px] font-bold uppercase tracking-widest">
                    Due Soon
                  </span>
                  <span className="text-[10px] font-mono text-brand-300">
                    {new Date(d.deadlineDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-bold text-sm mb-1 relative z-10">{d.title}</p>
                <p className="text-xs text-zinc-400 line-clamp-2 relative z-10">{d.description}</p>
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/20 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-brand-500/30 transition-all" />
              </div>
            ))}
            {deadlines.filter(d => !d.isCompleted).length === 0 && (
              <div className="py-8 text-center">
                <p className="text-zinc-500 text-xs italic">No active reminders.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black tracking-tight">
              {selectedDate ? selectedDate.toLocaleDateString('default', { day: 'numeric', month: 'long' }) : 'Select a date'}
            </h3>
            {selectedDate && <button onClick={() => setSelectedDate(null)} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>}
          </div>

          <div className="space-y-4">
            {selectedDeadlines.length > 0 ? (
              selectedDeadlines.map(d => (
                <div key={d.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-zinc-900">{d.title}</p>
                    <button 
                      onClick={() => toggleComplete(d.id)}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        d.isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-zinc-200 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-500"
                      )}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mb-3">{d.description}</p>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 py-2 bg-white border border-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
                      <Info size={14} /> Details
                    </button>
                    <button className="flex-1 py-2 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-sm">
                      <ExternalLink size={14} /> File Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-4">
                  <Clock size={24} />
                </div>
                <p className="text-zinc-400 text-sm italic">No deadlines for this date.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

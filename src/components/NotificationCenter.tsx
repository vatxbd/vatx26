import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Bell, 
  Share2, 
  RefreshCw, 
  ExternalLink, 
  Facebook, 
  Linkedin, 
  Twitter,
  Instagram,
  Music2, 
  MessageCircle, 
  Copy, 
  Check, 
  ShieldAlert,
  Calendar,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Info,
  Upload,
  Image as ImageIcon,
  X,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  Plus,
  CheckCircle2,
  Circle,
  FileText,
  Volume2,
  BookmarkCheck,
  Send,
  SlidersHorizontal,
  BellRing,
  AlertCircle,
  AlarmClock,
  Zap,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { generateLawUpdates, generateSocialPost, TaxUpdate } from '../services/aiService';

export interface DeadlineAlert {
  id: number;
  title: string;
  deadlineDate: string;
  category: 'VAT' | 'TDS/VDS' | 'Income Tax' | string;
  description: string;
  isCompleted: boolean;
  daysRemaining: number;
  urgency: 'critical' | 'upcoming' | 'overdue' | 'future';
  targetTab: string;
  statutoryRef: string;
  penaltyWarning: string;
  autoSnooze?: boolean;
  isSnoozed?: boolean;
  retriggered?: boolean;
  snoozedAt?: string | null;
  snoozeNote?: string | null;
}

interface NotificationCenterProps {
  language: 'en' | 'bn';
  onNavigate?: (tab: string) => void;
}

export default function NotificationCenter({ language, onNavigate }: NotificationCenterProps) {
  // Main view switcher
  const [activeView, setActiveView] = useState<'deadlines' | 'law-updates'>('deadlines');

  // Deadline and alert states
  const [alerts, setAlerts] = useState<DeadlineAlert[]>([]);
  const [allDeadlines, setAllDeadlines] = useState<DeadlineAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(true);
  const [currentAlertIndex, setCurrentAlertIndex] = useState<number>(0);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  
  // Filters for Deadlines
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Add new deadline modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('VAT');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newAutoSnooze, setNewAutoSnooze] = useState<boolean>(true);
  const [submittingNew, setSubmittingNew] = useState<boolean>(false);

  // Auto-Snooze Toast feedback
  const [snoozeToast, setSnoozeToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Desktop notification permission
  const [desktopPermission, setDesktopPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [desktopNotifiedIds, setDesktopNotifiedIds] = useState<Set<string>>(new Set());

  // Existing Law Updates & Social Post states
  const [updates, setUpdates] = useState<TaxUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState<boolean>(true);
  const [generatingPost, setGeneratingPost] = useState<string | null>(null);
  const [socialPost, setSocialPost] = useState<string | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<TaxUpdate | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState<'facebook' | 'linkedin' | 'twitter' | 'tiktok' | 'instagram' | 'threads' | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [showScheduler, setShowScheduler] = useState<boolean>(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  // Fetch upcoming alerts & deadlines from server
  const fetchComplianceAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const res = await fetch('/api/compliance/upcoming-alerts?days=7');
      if (res.ok) {
        const data = await res.json();
        const incomingAlerts: DeadlineAlert[] = data.alerts || [];
        const incomingAll: DeadlineAlert[] = data.allDeadlines || [];
        setAlerts(incomingAlerts);
        setAllDeadlines(incomingAll);

        // If desktop notification permission is granted, push notifications
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          incomingAlerts.forEach((alert) => {
            const notifKey = `${alert.id}-${alert.retriggered ? 'retrigger48h' : 'initial'}`;
            if (!desktopNotifiedIds.has(notifKey) && !alert.isCompleted) {
              // If alert is auto-snoozed and has NOT retriggered yet (>48h remaining), suppress notification
              if (alert.isSnoozed && !alert.retriggered) {
                return;
              }

              let titleText = `NBR Tax Alert: ${alert.title}`;
              let bodyText = '';

              if (alert.retriggered) {
                titleText = language === 'bn' 
                  ? `⚡ ৪৮ ঘণ্টার জরুরি রিমাইন্ডার: ${alert.title}` 
                  : `⚡ 48h Final Reminder: ${alert.title}`;
                bodyText = language === 'bn'
                  ? `অটো-স্নুজ সময় শেষ! শেষ সময়সীমার ৪৮ ঘণ্টা বাকি এবং রিটার্ন দাখিল এখনও সম্পন্ন হয়নি। ${alert.penaltyWarning}`
                  : `Auto-Snooze expired: 48 hours remaining before deadline and task is still incomplete! ${alert.penaltyWarning}`;
              } else {
                bodyText = alert.daysRemaining <= 0
                  ? (language === 'bn' ? `আজই শেষ সময় বা মেয়াদ উত্তীর্ণ! ${alert.penaltyWarning}` : `Due today or overdue! ${alert.penaltyWarning}`)
                  : (language === 'bn' ? `আর মাত্র ${alert.daysRemaining} দিন বাকি! ${alert.penaltyWarning}` : `Only ${alert.daysRemaining} days remaining! ${alert.penaltyWarning}`);
              }

              new Notification(titleText, {
                body: bodyText,
                icon: '/favicon.ico',
                tag: `vatx-compliance-${alert.id}-${alert.deadlineDate}-${alert.retriggered ? '48h' : '7d'}`
              });

              setDesktopNotifiedIds((prev) => new Set([...prev, notifKey]));
            }
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch compliance alerts:', err);
    } finally {
      setLoadingAlerts(false);
    }
  }, [language, desktopNotifiedIds]);

  // Request browser desktop push permission
  const handleRequestPushPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert(language === 'bn' ? 'আপনার ব্রাউজার ডেস্কটপ নোটিফিকেশন সমর্থন করে না।' : 'Your browser does not support desktop notifications.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setDesktopPermission(perm);
      if (perm === 'granted') {
        new Notification(
          language === 'bn' ? 'ভ্যাটএক্স (VatX) নোটিফিকেশন সক্রিয় হয়েছে' : 'VatX Desktop Alerts Activated', 
          {
            body: language === 'bn' 
              ? 'এনবিআরের সকল মূসক ৯.১ এবং ট্যাক্স ডেডলাইনের ৭ দিন আগেই আপনি স্বয়ংক্রিয় সতর্কবার্তা পাবেন।' 
              : 'You will receive proactive alerts 7 days before NBR VAT Mushak 9.1 and income tax deadlines.',
            icon: '/favicon.ico'
          }
        );
      }
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  // Test push notification trigger
  const handleSendTestNotification = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Notification API not supported.');
      return;
    }

    if (Notification.permission !== 'granted') {
      handleRequestPushPermission();
      return;
    }

    new Notification(
      language === 'bn' ? '🔔 টেস্ট নোটিফিকেশন: এনবিআর ভ্যাট রিটার্ন সময়সীমা' : '🔔 Test Alert: NBR VAT 9.1 Return Deadline', 
      {
        body: language === 'bn' 
          ? 'আগামী ১৫ তারিখে মাসিক ভ্যাট রিটার্ন (মূসক ৯.১) দাখিল বাধ্যতামূলক। বিলম্ব ফি ১০,০০০ টাকা।' 
          : 'Monthly Mushak 9.1 filing due by the 15th under VAT Act 2012 Sec 64. Avoid BDT 10k penalty.',
        icon: '/favicon.ico'
      }
    );
  };

  // Toggle deadline completion
  const handleToggleCompletion = async (id: number) => {
    try {
      const res = await fetch(`/api/compliance/${id}`, { method: 'PATCH' });
      if (res.ok) {
        await fetchComplianceAlerts();
      }
    } catch (err) {
      console.error('Failed to toggle completion status:', err);
    }
  };

  // Toggle Auto-Snooze (re-triggers alert 48 hours before deadline if incomplete)
  const handleToggleAutoSnooze = async (id: number, currentStatus?: boolean) => {
    try {
      const res = await fetch(`/api/compliance/${id}/auto-snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentStatus })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchComplianceAlerts();
        setSnoozeToast({
          message: data.autoSnooze
            ? (language === 'bn' 
                ? 'অটো-স্নুজ সক্রিয়: কাজ সম্পন্ন না হলে ডেডলাইনের ৪৮ ঘণ্টা পূর্বে সতর্কবার্তাটি পুনরায় বাজবে।' 
                : 'Auto-Snooze enabled: alert will automatically re-trigger 48 hours before deadline if incomplete.')
            : (language === 'bn'
                ? 'অটো-স্নুজ নিষ্ক্রিয় করা হয়েছে।'
                : 'Auto-Snooze disabled.'),
          type: 'success'
        });
        setTimeout(() => setSnoozeToast(null), 5000);
      }
    } catch (err) {
      console.error('Failed to toggle auto snooze:', err);
    }
  };

  // Bulk Auto-Snooze all pending 7-day deadlines to 48 hours
  const handleAutoSnoozeAll = async (enable: boolean = true) => {
    try {
      const res = await fetch('/api/compliance/auto-snooze-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable })
      });
      if (res.ok) {
        await fetchComplianceAlerts();
        setSnoozeToast({
          message: enable
            ? (language === 'bn' 
                ? 'সকল ৭-দিনের অ্যালার্টে ৪৮-ঘণ্টা অটো-স্নুজ সক্রিয় হয়েছে। অসমাপ্ত থাকলে ৪৮ ঘণ্টা আগে পুনরায় অ্যালার্ট পাবেন।' 
                : 'All 7-day alerts auto-snoozed until 48 hours before deadlines. Will re-trigger if incomplete.')
            : (language === 'bn'
                ? 'সকল অটো-স্নুজ বন্ধ করা হয়েছে।'
                : 'Auto-snooze disabled for all alerts.'),
          type: 'info'
        });
        setTimeout(() => setSnoozeToast(null), 5000);
      }
    } catch (err) {
      console.error('Failed to auto snooze all:', err);
    }
  };

  // Add custom compliance deadline
  const handleAddDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) {
      alert(language === 'bn' ? 'অনুগ্রহ করে শিরোনাম এবং তারিখ প্রদান করুন।' : 'Please enter title and date.');
      return;
    }

    setSubmittingNew(true);
    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          date: newDate,
          category: newCategory,
          description: newDescription.trim(),
          autoSnooze: newAutoSnooze
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewTitle('');
        setNewDate('');
        setNewDescription('');
        await fetchComplianceAlerts();
      } else {
        alert('Failed to save compliance deadline.');
      }
    } catch (err) {
      console.error('Error saving deadline:', err);
      alert('Failed to save deadline.');
    } finally {
      setSubmittingNew(false);
    }
  };

  // File upload for social media
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  };

  const uploadMedia = async (): Promise<string | null> => {
    if (!mediaFile) return null;
    const formData = new FormData();
    formData.append('media', mediaFile);
    const res = await fetch('/api/upload-media', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.url;
  };

  const handleDirectPublish = async () => {
    if (!socialPost || !currentPlatform) return;
    setPublishing(currentPlatform);
    try {
      let mediaUrl = null;
      if (mediaFile) {
        mediaUrl = await uploadMedia();
      }

      const res = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: currentPlatform,
          content: socialPost,
          mediaUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`${currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1)} post published successfully!`);
      } else {
        alert(`Failed to publish: ${data.error}`);
      }
    } catch (error) {
      console.error('Publishing error:', error);
      alert('Failed to publish due to a network or server error.');
    } finally {
      setPublishing(null);
    }
  };

  const handleSchedulePost = async () => {
    if (!socialPost || !currentPlatform || !scheduledAt) {
      alert('Please select a date and time for scheduling.');
      return;
    }
    
    setPublishing('scheduling');
    try {
      let mediaUrl = null;
      if (mediaFile) {
        mediaUrl = await uploadMedia();
      }

      const res = await fetch('/api/social/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: currentPlatform,
          content: socialPost,
          mediaUrl,
          scheduledAt: new Date(scheduledAt).toISOString()
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Post scheduled successfully!');
        setShowScheduler(false);
        setScheduledAt('');
      } else {
        alert(`Failed to schedule: ${data.error}`);
      }
    } catch (error) {
      console.error('Scheduling error:', error);
      alert('Failed to schedule due to a network or server error.');
    } finally {
      setPublishing(null);
    }
  };

  const fetchUpdates = async () => {
    setLoadingUpdates(true);
    try {
      const data = await generateLawUpdates(language);
      setUpdates(data);
    } catch (error) {
      console.error('Failed to fetch updates:', error);
    } finally {
      setLoadingUpdates(false);
    }
  };

  useEffect(() => {
    fetchComplianceAlerts();
    fetchUpdates();
  }, [language, fetchComplianceAlerts]);

  const handleGeneratePost = async (update: TaxUpdate, platform: 'facebook' | 'linkedin' | 'twitter' | 'tiktok' | 'instagram' | 'threads') => {
    setGeneratingPost(update.id);
    setSelectedUpdate(update);
    setCurrentPlatform(platform);
    try {
      const post = await generateSocialPost(update, platform);
      setSocialPost(post);
    } catch (error) {
      console.error('Failed to generate social post:', error);
    } finally {
      setGeneratingPost(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered deadlines list
  const filteredDeadlines = useMemo(() => {
    return allDeadlines.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (statusFilter === 'pending' && item.isCompleted) return false;
      if (statusFilter === 'completed' && !item.isCompleted) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.deadlineDate.toLowerCase().includes(q) ||
          item.statutoryRef.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allDeadlines, categoryFilter, statusFilter, searchQuery]);

  const activeAlert = alerts[currentAlertIndex] || alerts[0];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* 1. Header & Segmented Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-900 text-amber-400 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                {language === 'bn' ? 'নোটিফিকেশন ও এনবিআর কমপ্লায়েন্স' : 'Compliance & Deadline Alerts'}
              </h1>
              <p className="text-sm text-zinc-500 font-medium mt-0.5">
                {language === 'bn' 
                  ? 'মূসক ৯.১, টিডিএস/ভিডিএস ও আয়কর রিটার্নের ৭ দিন আগের স্বয়ংক্রিয় সতর্কবার্তা' 
                  : 'Automated 7-day proactive statutory alerts for VAT 9.1, TDS/VDS, and Income Tax'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Push Settings */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => handleAutoSnoozeAll(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-700 rounded-xl transition-all shadow-sm"
            title={language === 'bn' ? 'সকল ৭-দিনের অ্যালার্টে ৪৮-ঘণ্টা অটো-স্নুজ সক্রিয় করুন' : 'Auto-Snooze all alerts until 48 hours before deadline'}
          >
            <AlarmClock className="w-4 h-4 text-amber-400" />
            <span>{language === 'bn' ? 'সকল অ্যালার্ট ৪৮ ঘণ্টায় স্নুজ' : 'Auto-Snooze All (48h)'}</span>
          </button>

          {desktopPermission !== 'granted' ? (
            <button
              onClick={handleRequestPushPermission}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl transition-all shadow-sm"
              title="Enable Desktop Push Alerts"
            >
              <BellRing className="w-4 h-4 text-amber-400" />
              {language === 'bn' ? 'পুশ নোটিফিকেশন চালু করুন' : 'Enable Push Alerts'}
            </button>
          ) : (
            <button
              onClick={handleSendTestNotification}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-all"
              title="Test Push Notification"
            >
              <Volume2 className="w-4 h-4 text-emerald-600" />
              {language === 'bn' ? 'টেস্ট নোটিফিকেশন' : 'Test Alert'}
            </button>
          )}

          <button
            onClick={() => {
              fetchComplianceAlerts();
              fetchUpdates();
            }}
            disabled={loadingAlerts || loadingUpdates}
            className="p-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", (loadingAlerts || loadingUpdates) && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Auto-Snooze Toast Notification */}
      <AnimatePresence>
        {snoozeToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-zinc-950 border border-amber-400/60 text-white flex items-center justify-between gap-3 text-xs shadow-xl shadow-amber-400/5"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400">
                <AlarmClock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-amber-300">{language === 'bn' ? 'অটো-স্নুজ আপডেট' : 'Auto-Snooze Engine'}</p>
                <p className="text-zinc-300 text-xs mt-0.5">{snoozeToast.message}</p>
              </div>
            </div>
            <button 
              onClick={() => setSnoozeToast(null)} 
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Prominent Top Banner: Upcoming 7-Day Deadline Alerts */}
      <AnimatePresence>
        {!bannerDismissed && alerts.length > 0 && activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "relative overflow-hidden border rounded-2xl shadow-xl transition-all",
              activeAlert.retriggered
                ? "bg-zinc-950 border-amber-500 ring-2 ring-amber-500/30 text-white"
                : activeAlert.daysRemaining < 0
                ? "bg-rose-950 border-rose-800 text-white"
                : activeAlert.daysRemaining <= 2
                ? "bg-zinc-950 border-rose-600/60 text-white"
                : activeAlert.isSnoozed
                ? "bg-zinc-950 border-amber-500/40 text-white"
                : "bg-zinc-950 border-amber-500/50 text-white"
            )}
          >
            {/* Top status accent stripe */}
            <div 
              className={cn(
                "h-1.5 w-full",
                activeAlert.retriggered
                  ? "bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 animate-pulse"
                  : activeAlert.daysRemaining < 0 
                  ? "bg-rose-500" 
                  : activeAlert.daysRemaining <= 2 
                  ? "bg-rose-500" 
                  : activeAlert.isSnoozed
                  ? "bg-amber-500/50"
                  : "bg-amber-400"
              )} 
            />

            <div className="p-5 sm:p-7 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left: Urgent indicator and deadline info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center flex-wrap gap-2 text-xs font-mono uppercase tracking-wider">
                    {activeAlert.retriggered ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/50 animate-pulse">
                        <Zap className="w-4 h-4 shrink-0 text-amber-400" />
                        {language === 'bn' 
                          ? '⚡ অটো-স্নুজ পুনরায় সক্রিয় (৪৮ ঘণ্টা বাকি — টাস্ক এখনও অসম্পূর্ণ!)' 
                          : '⚡ AUTO-SNOOZE RE-TRIGGERED (48H REMAINING — INCOMPLETE TASK!)'}
                      </span>
                    ) : activeAlert.isSnoozed ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-amber-300 bg-zinc-900 px-2.5 py-1 rounded-lg border border-amber-400/30">
                        <AlarmClock className="w-4 h-4 shrink-0 text-amber-400" />
                        {language === 'bn' 
                          ? '⏰ অটো-স্নুজ সক্রিয় (৪৮ ঘণ্টা পূর্বে পুনরায় সতর্ক করবে)' 
                          : '⏰ AUTO-SNOOZED (RE-TRIGGERS 48H BEFORE DEADLINE)'}
                      </span>
                    ) : activeAlert.daysRemaining < 0 ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-rose-400">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                        {language === 'bn' ? 'বিলম্বিত / মেয়াদ উত্তীর্ণ' : 'OVERDUE STATUTORY DEADLINE'}
                      </span>
                    ) : activeAlert.daysRemaining <= 2 ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-rose-400">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                        {language === 'bn' ? 'জরুরি সময়সীমা: ২ দিনের মধ্যে দাখিল আবশ্যক' : 'CRITICAL ALERT: DUE WITHIN 48 HOURS'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-bold text-amber-400">
                        <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                        {language === 'bn' ? 'আসন্ন সময়সীমা: আগামী ৭ দিনের মধ্যে' : 'UPCOMING STATUTORY DEADLINE (≤ 7 DAYS)'}
                      </span>
                    )}

                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-300 font-sans font-semibold">{activeAlert.category}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-400">{activeAlert.statutoryRef}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>{activeAlert.title}</span>
                    {activeAlert.autoSnooze && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 font-bold uppercase">
                        Auto-Snooze
                      </span>
                    )}
                  </h2>

                  <p className="text-zinc-300 text-sm max-w-3xl leading-relaxed">
                    {activeAlert.description}
                  </p>

                  {activeAlert.snoozeNote && (
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
                      <AlarmClock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{activeAlert.snoozeNote}</span>
                    </div>
                  )}

                  <div className="pt-1 flex items-center gap-2 text-xs text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span className="font-medium">{activeAlert.penaltyWarning}</span>
                  </div>
                </div>

                {/* Right: Countdown & Direct Action Button */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                  <div className="text-left lg:text-right font-mono">
                    <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-sans">
                      {language === 'bn' ? 'শেষ তারিখ' : 'Due Date'}
                    </div>
                    <div className="text-xl font-bold text-white tabular-nums">
                      {activeAlert.deadlineDate}
                    </div>
                    <div className={cn(
                      "text-xs font-bold tabular-nums",
                      activeAlert.daysRemaining < 0 ? "text-rose-400" : activeAlert.daysRemaining <= 2 ? "text-rose-400" : "text-amber-400"
                    )}>
                      {activeAlert.daysRemaining < 0
                        ? (language === 'bn' ? `${Math.abs(activeAlert.daysRemaining)} দিন মেয়াদোত্তীর্ণ` : `${Math.abs(activeAlert.daysRemaining)} days overdue`)
                        : activeAlert.daysRemaining === 0
                        ? (language === 'bn' ? 'আজই শেষ দিন!' : 'Due today!')
                        : (language === 'bn' ? `আর মাত্র ${activeAlert.daysRemaining} দিন বাকি` : `${activeAlert.daysRemaining} days remaining`)}
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
                    {/* Auto-Snooze 48h Toggle Button */}
                    <button
                      onClick={() => handleToggleAutoSnooze(activeAlert.id, activeAlert.autoSnooze)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border",
                        activeAlert.autoSnooze
                          ? "bg-amber-400/20 text-amber-300 border-amber-400/50 hover:bg-amber-400/30 shadow-md shadow-amber-400/10"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                      )}
                      title={language === 'bn' 
                        ? 'টাস্ক সম্পন্ন না হলে ডেডলাইনের ৪৮ ঘণ্টা পূর্বে সতর্কবার্তাটি পুনরায় বাজবে' 
                        : 'Auto-Snooze: Re-trigger alert 48 hours before deadline if task remains incomplete'}
                    >
                      <AlarmClock className={cn("w-4 h-4", activeAlert.autoSnooze ? "text-amber-400 animate-pulse" : "text-zinc-400")} />
                      <span>
                        {activeAlert.autoSnooze
                          ? (activeAlert.retriggered 
                              ? (language === 'bn' ? '৪৮ঘ অ্যালার্ট সক্রিয়' : '48h Triggered')
                              : (language === 'bn' ? 'অটো-স্নুজ সক্রিয় (৪৮ঘ)' : 'Auto-Snooze (48h)'))
                          : (language === 'bn' ? 'অটো-স্নুজ (৪৮ঘ)' : 'Auto-Snooze (48h)')
                        }
                      </span>
                    </button>

                    {onNavigate && (
                      <button
                        onClick={() => onNavigate(activeAlert.targetTab)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-400/20"
                      >
                        {activeAlert.category === 'VAT' 
                          ? (language === 'bn' ? 'মূসক ৯.১ দাখিল করুন' : 'File Mushak 9.1')
                          : activeAlert.category === 'TDS/VDS'
                          ? (language === 'bn' ? 'ভিডিএস রেকর্ড খুলুন' : 'Open VDS Tracker')
                          : (language === 'bn' ? 'ট্যাক্স ফাইল করুন' : 'File Return Now')}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleCompletion(activeAlert.id)}
                      className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-all"
                      title={language === 'bn' ? 'সম্পন্ন হিসেবে চিহ্নিত করুন' : 'Mark as Completed'}
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Banner Footer: Pager if multiple alerts */}
              {alerts.length > 1 && (
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span>{language === 'bn' ? 'সতর্কবার্তা' : 'Alert'}</span>
                    <span className="text-white font-bold">{currentAlertIndex + 1}</span>
                    <span>/</span>
                    <span>{alerts.length}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentAlertIndex((prev) => (prev > 0 ? prev - 1 : alerts.length - 1))}
                      className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-300 transition-colors"
                      title="Previous Alert"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentAlertIndex((prev) => (prev < alerts.length - 1 ? prev + 1 : 0))}
                      className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-300 transition-colors"
                      title="Next Alert"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Dedicated Tab Switcher (Deadlines & 7-Day Alerts vs Law & SRO Updates) */}
      <div className="flex items-center justify-between border-b border-zinc-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('deadlines')}
            className={cn(
              "relative pb-3 pt-1 px-4 text-sm font-bold transition-all flex items-center gap-2",
              activeView === 'deadlines'
                ? "text-zinc-950 border-b-2 border-zinc-900"
                : "text-zinc-400 hover:text-zinc-700"
            )}
          >
            <Calendar className="w-4 h-4" />
            <span>{language === 'bn' ? 'আসন্ন সময়সীমা ও ডেডলাইন' : 'Statutory Deadlines & 7-Day Alerts'}</span>
            {alerts.length > 0 && (
              <span className="font-mono text-[11px] px-1.5 py-0.5 bg-rose-100 text-rose-700 font-bold rounded">
                {alerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('law-updates')}
            className={cn(
              "relative pb-3 pt-1 px-4 text-sm font-bold transition-all flex items-center gap-2",
              activeView === 'law-updates'
                ? "text-zinc-950 border-b-2 border-zinc-900"
                : "text-zinc-400 hover:text-zinc-700"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'bn' ? 'আইন ও এসআরও আপডেট' : 'NBR Law & SRO Updates'}</span>
          </button>
        </div>

        {activeView === 'deadlines' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-all mb-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'কাস্টম ডেডলাইন যোগ করুন' : 'Add Custom Deadline'}</span>
          </button>
        )}
      </div>

      {/* 4. Tab 1: Statutory Deadlines & Automated Alerts View */}
      {activeView === 'deadlines' && (
        <div className="space-y-6">
          {/* Statutory Law Reference Cards (Bangladesh Compliance Constitution) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                {language === 'bn' ? 'মূসক আইন ২০১২ ধারা ৬৪' : 'VAT & SD Act 2012, Sec 64'}
              </div>
              <div className="text-base font-black text-zinc-900">
                {language === 'bn' ? 'মাসিক মূসক ৯.১ রিটার্ন (১৫ তারিখ)' : 'Monthly Mushak 9.1 (15th)'}
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {language === 'bn' 
                  ? 'পূর্ববর্তী কর মেয়াদের জন্য প্রতি মাসের ১৫ তারিখের মধ্যে দাখিল বাধ্যতামূলক। অন্যথায় ১০,০০০ টাকা বিলম্ব ফি ও ২% মাসিক সুদ।'
                  : 'Mandatory return submission within 15 days following tax period close. Late submission triggers BDT 10k fine + 2% monthly interest.'}
              </p>
              <div className="pt-2">
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('critical-vat')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
                  >
                    {language === 'bn' ? 'মূসক ৯.১ ফর্মে যান' : 'Open Mushak 9.1 Form'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                {language === 'bn' ? 'মূসক ও আয়কর কর্তন বিধি' : 'Withholding & Treasury Deposit'}
              </div>
              <div className="text-base font-black text-zinc-900">
                {language === 'bn' ? 'টিডিএস ও ভিডিএস চালান জমা (১৫ তারিখ)' : 'TDS & VDS Challan (15th)'}
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {language === 'bn'
                  ? 'উৎস কর্তনকৃত মূসক ও অগ্রিম কর পরবর্তী মাসের ১৫ তারিখের মধ্যে সরকারি কোষাগারে ই-চালান/এ-চালানে জমা দিয়ে সার্টিফিকেট জারি করতে হবে।'
                  : 'Deducted withholding tax and VAT must be deposited via e-Challan into Bangladesh Treasury by the 15th to maintain expense admissibility.'}
              </p>
              <div className="pt-2">
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('vds-tracker')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
                  >
                    {language === 'bn' ? 'ভিডিএস ট্র্যাকার দেখুন' : 'Open VDS Tracker'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                {language === 'bn' ? 'আয়কর আইন ২০২৩ ধারা ১৬৬' : 'Income Tax Act 2023, Sec 166'}
              </div>
              <div className="text-base font-black text-zinc-900">
                {language === 'bn' ? 'ট্যাক্স ডে (৩০ নভেম্বর)' : 'National Tax Day (Nov 30)'}
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {language === 'bn'
                  ? 'ব্যক্তি করদাতাদের বার্ষিক আয়কর রিটার্ন দাখিলের সংবিধিবদ্ধ শেষ দিন ৩০ নভেম্বর। কোয়ার্টারলি অগ্রিম কর ১৫ মার্চ, ১৫ জুন, ১৫ সেপ্টেম্বর ও ১৫ ডিসেম্বর।'
                  : 'Statutory individual Tax Day is Nov 30. Advance Income Tax installments due on 15th of March, June, September, and December.'}
              </p>
              <div className="pt-2">
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('tax')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
                  >
                    {language === 'bn' ? 'ট্যাক্স ক্যালকুলেটর' : 'Income Tax Engine'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mr-1">
                {language === 'bn' ? 'ক্যাটাগরি:' : 'Category:'}
              </span>
              {['all', 'VAT', 'TDS/VDS', 'Income Tax'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                    categoryFilter === cat
                      ? "bg-zinc-900 text-white"
                      : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  )}
                >
                  {cat === 'all' ? (language === 'bn' ? 'সব' : 'All') : cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mr-1">
                {language === 'bn' ? 'স্ট্যাটাস:' : 'Status:'}
              </span>
              {[
                { key: 'all', label: language === 'bn' ? 'সকল' : 'All' },
                { key: 'pending', label: language === 'bn' ? 'বাকি' : 'Pending' },
                { key: 'completed', label: language === 'bn' ? 'সম্পন্ন' : 'Completed' }
              ].map((st) => (
                <button
                  key={st.key}
                  onClick={() => setStatusFilter(st.key as any)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                    statusFilter === st.key
                      ? "bg-zinc-900 text-white"
                      : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  )}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadlines Table / List */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                    <th className="py-3.5 px-4 w-12 text-center">Status</th>
                    <th className="py-3.5 px-4">Deadline & Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Statutory Reference</th>
                    <th className="py-3.5 px-4 font-mono text-right">Due Date</th>
                    <th className="py-3.5 px-4 text-center">Countdown</th>
                    <th className="py-3.5 px-4 text-center">Auto-Snooze (48h)</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loadingAlerts ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                        {language === 'bn' ? 'ডেডলাইন লোড হচ্ছে...' : 'Loading compliance deadlines...'}
                      </td>
                    </tr>
                  ) : filteredDeadlines.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400">
                        {language === 'bn' ? 'কোনো ডেডলাইন পাওয়া যায়নি।' : 'No compliance deadlines match your criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredDeadlines.map((item) => (
                      <tr 
                        key={item.id} 
                        className={cn(
                          "hover:bg-zinc-50/80 transition-colors",
                          item.isCompleted && "bg-zinc-50/50 opacity-60"
                        )}
                      >
                        {/* Checkbox status */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleToggleCompletion(item.id)}
                            className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-700 transition-colors"
                            title={item.isCompleted ? 'Mark Pending' : 'Mark Completed'}
                          >
                            {item.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-zinc-300 hover:text-zinc-500" />
                            )}
                          </button>
                        </td>

                        {/* Title & Description */}
                        <td className="py-4 px-4 max-w-md">
                          <div className={cn("font-bold text-zinc-900", item.isCompleted && "line-through text-zinc-400")}>
                            {item.title}
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                            {item.description}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs text-zinc-700 font-semibold">
                            {item.category}
                          </span>
                        </td>

                        {/* Statutory reference */}
                        <td className="py-4 px-4 text-xs text-zinc-500 max-w-xs">
                          {item.statutoryRef || 'NBR statutory obligation'}
                        </td>

                        {/* Due Date */}
                        <td className="py-4 px-4 whitespace-nowrap font-mono tabular-nums text-right text-zinc-800 font-medium">
                          {item.deadlineDate}
                        </td>

                        {/* Countdown */}
                        <td className="py-4 px-4 whitespace-nowrap text-center">
                          {item.isCompleted ? (
                            <span className="text-xs font-mono font-bold text-emerald-700">
                              {language === 'bn' ? 'সম্পন্ন' : 'Completed'}
                            </span>
                          ) : item.daysRemaining < 0 ? (
                            <span className="text-xs font-mono font-bold text-rose-600">
                              {Math.abs(item.daysRemaining)}d overdue
                            </span>
                          ) : item.daysRemaining <= 2 ? (
                            <span className="text-xs font-mono font-bold text-rose-600">
                              {item.daysRemaining === 0 ? 'Today!' : `${item.daysRemaining}d left!`}
                            </span>
                          ) : item.daysRemaining <= 7 ? (
                            <span className="text-xs font-mono font-bold text-amber-600">
                              {item.daysRemaining}d left
                            </span>
                          ) : (
                            <span className="text-xs font-mono text-zinc-500">
                              {item.daysRemaining}d
                            </span>
                          )}
                        </td>

                        {/* Auto-Snooze Column */}
                        <td className="py-4 px-4 whitespace-nowrap text-center">
                          {item.isCompleted ? (
                            <span className="text-xs text-zinc-400 font-mono">-</span>
                          ) : (
                            <button
                              onClick={() => handleToggleAutoSnooze(item.id, item.autoSnooze)}
                              className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border",
                                item.retriggered
                                  ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
                                  : item.isSnoozed
                                  ? "bg-amber-50 border-amber-300 text-amber-800"
                                  : item.autoSnooze
                                  ? "bg-amber-50/50 border-amber-200 text-amber-700"
                                  : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                              )}
                              title={
                                item.retriggered
                                  ? (language === 'bn' ? 'টাস্ক অসম্পূর্ণ থাকায় ৪৮ ঘণ্টা আগে অ্যালার্ট পুনরায় সক্রিয় হয়েছে' : 'Re-triggered at 48 hours because task is incomplete')
                                  : item.isSnoozed
                                  ? (language === 'bn' ? '৪৮ ঘণ্টা পূর্ব পর্যন্ত অ্যালার্ট স্নুজ করা আছে' : 'Snoozed until 48 hours before deadline')
                                  : (language === 'bn' ? '৪৮ ঘণ্টা পূর্বে স্বয়ংক্রিয় রি-ট্রিগার সক্রিয় করতে ক্লিক করুন' : 'Click to enable Auto-Snooze to 48 hours')
                              }
                            >
                              <AlarmClock className={cn("w-3.5 h-3.5", (item.retriggered || item.autoSnooze) ? "text-amber-500" : "text-zinc-400")} />
                              <span>
                                {item.retriggered
                                  ? (language === 'bn' ? '⚡ পুনরায় সক্রিয়' : '⚡ 48h Triggered')
                                  : item.isSnoozed
                                  ? (language === 'bn' ? '⏰ ৪৮ঘ স্নুজড' : '⏰ 48h Snoozed')
                                  : item.autoSnooze
                                  ? (language === 'bn' ? 'সক্রিয় (৪৮ঘ)' : 'On (48h)')
                                  : (language === 'bn' ? 'স্নুজ (৪৮ঘ)' : 'Enable 48h')}
                              </span>
                            </button>
                          )}
                        </td>

                        {/* Action Link */}
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          {onNavigate && !item.isCompleted && (
                            <button
                              onClick={() => onNavigate(item.targetTab)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-900 hover:text-amber-600 transition-colors"
                            >
                              <span>{language === 'bn' ? 'দাখিল' : 'File'}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: NBR Law & SRO Updates (Original Feature Intact) */}
      {activeView === 'law-updates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Updates List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {loadingUpdates ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 animate-pulse h-40" />
                ))
              ) : (
                updates.map((update, index) => (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="group bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-lg transition-all border-l-4"
                    style={{ borderLeftColor: update.impact === 'high' ? '#ef4444' : update.impact === 'medium' ? '#f59e0b' : '#3b82f6' }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-800">
                          {update.type}
                        </span>
                        <span className="text-zinc-400">·</span>
                        <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {update.date}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button 
                          onClick={() => handleGeneratePost(update, 'facebook')}
                          disabled={generatingPost === update.id}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors disabled:opacity-50"
                          title="Generate FB Post"
                        >
                          <Facebook size={18} />
                        </button>
                        <button 
                          onClick={() => handleGeneratePost(update, 'linkedin')}
                          disabled={generatingPost === update.id}
                          className="p-2 hover:bg-sky-50 text-sky-600 rounded-xl transition-colors disabled:opacity-50"
                          title="Generate LinkedIn Post"
                        >
                          <Linkedin size={18} />
                        </button>
                        <button 
                          onClick={() => handleGeneratePost(update, 'twitter')}
                          disabled={generatingPost === update.id}
                          className="p-2 hover:bg-zinc-100 text-zinc-900 rounded-xl transition-colors disabled:opacity-50"
                          title="Generate Twitter Post"
                        >
                          <Twitter size={18} />
                        </button>
                        <button 
                          onClick={() => handleGeneratePost(update, 'instagram')}
                          disabled={generatingPost === update.id}
                          className="p-2 hover:bg-pink-50 text-pink-600 rounded-xl transition-colors disabled:opacity-50"
                          title="Generate Instagram Post"
                        >
                          <Instagram size={18} />
                        </button>
                        <button 
                          onClick={() => handleGeneratePost(update, 'threads')}
                          disabled={generatingPost === update.id}
                          className="p-2 hover:bg-zinc-100 text-zinc-800 rounded-xl transition-colors disabled:opacity-50"
                          title="Generate Threads Post"
                        >
                          <MessageCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleGeneratePost(update, 'tiktok')}
                          disabled={generatingPost === update.id}
                          className="p-2 hover:bg-zinc-100 text-pink-500 rounded-xl transition-colors disabled:opacity-50"
                          title="Generate TikTok Post"
                        >
                          <Music2 size={18} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-zinc-900 mb-2 leading-tight">
                      {update.title}
                    </h3>
                    <p className="text-zinc-600 text-sm leading-relaxed mb-4">
                      {update.content}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                        <Info size={14} />
                        Impact: <span className={
                          update.impact === 'high' ? 'text-red-500 font-mono' : 
                          update.impact === 'medium' ? 'text-amber-500 font-mono' : 'text-blue-500 font-mono'
                        }>{update.impact.toUpperCase()}</span>
                      </div>
                      {generatingPost === update.id && (
                        <div className="flex items-center gap-2 text-xs font-black text-blue-600 italic">
                          <Sparkles size={14} className="animate-spin" />
                          AI is writing post...
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar / Social Post Studio */}
          <div className="space-y-6">
            <div className="bg-zinc-900 text-white rounded-2xl p-6 space-y-6 sticky top-8 shadow-2xl">
              <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                <Share2 className="text-amber-400" size={20} />
                {language === 'bn' ? 'সোশ্যাল পোস্ট ক্রিয়েটর' : 'Social Publishing Studio'}
              </h3>

              {socialPost ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="bg-white/5 rounded-xl p-5 relative group border border-white/10">
                    <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {socialPost}
                    </p>
                    <button 
                      onClick={() => copyToClipboard(socialPost)}
                      className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                    >
                      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    <Sparkles size={12} className="text-amber-400" />
                    AI Formatted for {currentPlatform?.toUpperCase()}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Attach Media (Optional)</label>
                    <div 
                      className={cn(
                        "relative border border-dashed border-white/20 rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5",
                        mediaPreview && "p-0 overflow-hidden border-none aspect-video"
                      )}
                      onClick={() => document.getElementById('media-upload-notif')?.click()}
                    >
                      {mediaPreview ? (
                        <>
                          {mediaFile?.type.startsWith('video') ? (
                            <video src={mediaPreview} className="w-full h-full object-cover" controls />
                          ) : (
                            <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setMediaFile(null);
                              setMediaPreview(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/90 rounded-lg text-white transition-all"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-zinc-400">
                            <ImageIcon size={18} />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-zinc-200">Upload Media Attachment</p>
                            <p className="text-[10px] text-zinc-500">Image or Video</p>
                          </div>
                        </>
                      )}
                      <input 
                        id="media-upload-notif"
                        type="file" 
                        accept="image/*,video/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2.5">
                    <button 
                      onClick={handleDirectPublish}
                      disabled={!!publishing}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      {publishing === currentPlatform ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Share2 size={16} />
                          Direct Publish to {currentPlatform ? currentPlatform.toUpperCase() : 'Social'}
                        </>
                      )}
                    </button>

                    <div>
                      {!showScheduler ? (
                        <button 
                          onClick={() => setShowScheduler(true)}
                          className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <Calendar size={14} />
                          Schedule Post
                        </button>
                      ) : (
                        <div className="space-y-2 pt-2">
                          <input 
                            type="datetime-local" 
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full p-2.5 bg-white/10 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={handleSchedulePost}
                              disabled={!!publishing || !scheduledAt}
                              className="flex-1 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => setShowScheduler(false)}
                              className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-zinc-400 rounded-xl font-bold text-xs transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => setSocialPost(null)}
                      className="w-full py-2 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 border border-zinc-800 rounded-2xl border-dashed">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                    <Share2 size={24} />
                  </div>
                  <div className="px-4">
                    <p className="text-xs font-bold text-zinc-300">Select any law update to generate a post</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Ready for Facebook, LinkedIn, Twitter</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3">
              <h4 className="font-black text-zinc-900 border-b border-zinc-100 pb-3">Statutory Highlights</h4>
              <div className="space-y-3">
                <LawTip tip="Corporate tax rate for non-listed companies: 27.5%" bnTip="অ-তালিকাভুক্ত কোম্পানির জন্য কর হার: ২৭.৫%" lang={language} />
                <LawTip tip="Cash transactions limit for tax benefits: BDT 5 Lakh" bnTip="কর সুবিধার জন্য নগদ লেনদেনের সীমা: ৫ লক্ষ টাকা" lang={language} />
                <LawTip tip="Mandatory PSR for 43 services in Bangladesh" bnTip="৪৩টি সেবার জন্য বাধ্যতামূলক PSR দাখিল" lang={language} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Custom Deadline Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-black text-zinc-900">
                    {language === 'bn' ? 'নতুন কমপ্লায়েন্স ডেডলাইন যোগ করুন' : 'Add Compliance Deadline'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddDeadline} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 mb-1">
                    {language === 'bn' ? 'শিরোনাম' : 'Deadline Title'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'bn' ? 'উদা: অডিট ফাইল প্রস্তুতকরণ' : 'e.g. Audit documentation preparation'}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-900 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 mb-1">
                      {language === 'bn' ? 'তারিখ' : 'Due Date'}
                    </label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 mb-1">
                      {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-900 font-medium"
                    >
                      <option value="VAT">VAT (মূসক)</option>
                      <option value="Income Tax">Income Tax (আয়কর)</option>
                      <option value="TDS/VDS">TDS/VDS (উৎস কর/মূসক)</option>
                      <option value="Audit">Audit & Regulatory</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 mb-1">
                    {language === 'bn' ? 'বিবরণ (ঐচ্ছিক)' : 'Description (Optional)'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={language === 'bn' ? 'আইনি ধারা বা প্রাসঙ্গিক নোট...' : 'Statutory section or notes...'}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-900 font-medium"
                  />
                </div>

                {/* Auto-Snooze Option */}
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <AlarmClock className="w-4 h-4 text-amber-500" />
                      <span>{language === 'bn' ? '৪৮-ঘণ্টা অটো-স্নুজ সক্রিয় করুন' : 'Enable 48-Hour Auto-Snooze'}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      {language === 'bn'
                        ? 'কাজ সম্পন্ন না হলে ডেডলাইনের ৪৮ ঘণ্টা পূর্বে সতর্কবার্তাটি স্বয়ংক্রিয়ভাবে পুনরায় বাজবে।'
                        : 'If task is not marked as complete, automatically re-trigger alert 48 hours before deadline.'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={newAutoSnooze}
                    onChange={(e) => setNewAutoSnooze(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded border-zinc-300 focus:ring-amber-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingNew}
                    className="px-5 py-2.5 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition-all disabled:opacity-50"
                  >
                    {submittingNew ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Deadline')}
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

function LawTip({ tip, bnTip, lang }: { tip: string; bnTip: string; lang: 'en' | 'bn' }) {
  return (
    <div className="flex items-start gap-2.5 group">
      <div className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500" />
      <p className="text-xs font-medium text-zinc-600 leading-relaxed">
        {lang === 'bn' ? bnTip : tip}
      </p>
    </div>
  );
}

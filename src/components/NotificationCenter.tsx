import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Share2, 
  RefreshCw, 
  ExternalLink, 
  Facebook, 
  Linkedin, 
  Twitter,
  Instagram,
  Music2, // TikTok icon
  MessageCircle, // Threads icon
  Copy, 
  Check, 
  ShieldAlert,
  Calendar,
  Sparkles,
  ChevronRight,
  Info,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { generateLawUpdates, generateSocialPost, TaxUpdate } from '../services/aiService';

export default function NotificationCenter({ language }: { language: 'en' | 'bn' }) {
  const [updates, setUpdates] = useState<TaxUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPost, setGeneratingPost] = useState<string | null>(null);
  const [socialPost, setSocialPost] = useState<string | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<TaxUpdate | null>(null);
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState<'facebook' | 'linkedin' | 'twitter' | 'tiktok' | 'instagram' | 'threads' | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

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
      console.error("Publishing error:", error);
      alert("Failed to publish due to a network or server error.");
    } finally {
      setPublishing(null);
    }
  };

  const handleSchedulePost = async () => {
    if (!socialPost || !currentPlatform || !scheduledAt) {
      alert("Please select a date and time for scheduling.");
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
        alert("Post scheduled successfully!");
        setShowScheduler(false);
        setScheduledAt('');
      } else {
        alert(`Failed to schedule: ${data.error}`);
      }
    } catch (error) {
      console.error("Scheduling error:", error);
      alert("Failed to schedule due to a network or server error.");
    } finally {
      setPublishing(null);
    }
  };

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const data = await generateLawUpdates(language);
      setUpdates(data);
    } catch (error) {
      console.error("Failed to fetch updates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [language]);

  const handleGeneratePost = async (update: TaxUpdate, platform: 'facebook' | 'linkedin' | 'twitter' | 'tiktok' | 'instagram' | 'threads') => {
    setGeneratingPost(update.id);
    setSelectedUpdate(update);
    setCurrentPlatform(platform);
    try {
      const post = await generateSocialPost(update, platform);
      setSocialPost(post);
    } catch (error) {
      console.error("Failed to generate social post:", error);
    } finally {
      setGeneratingPost(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <Bell className="text-amber-500" fill="currentColor" size={32} />
            {language === 'bn' ? 'আইন ও বিধি আপডেট' : 'Law & Compliance Updates'}
          </h2>
          <p className="text-zinc-500 mt-1">
            {language === 'bn' 
              ? 'এনবিআরের ট্যাক্স এবং ভ্যাট সংক্রান্ত সর্বশেষ পরিবর্তনগুলো জানুন' 
              : 'Stay informed with the latest NBR tax and VAT law changes'}
          </p>
        </div>
        <button 
          onClick={fetchUpdates}
          className="p-3 hover:bg-zinc-100 rounded-2xl transition-colors text-zinc-400 hover:text-zinc-900"
          title="Refresh Updates"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Updates List */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-zinc-50 border border-zinc-100 rounded-[2rem] p-6 animate-pulse h-40" />
              ))
            ) : (
              updates.map((update, index) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white border border-zinc-100 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-zinc-200/50 transition-all border-l-4"
                  style={{ borderLeftColor: update.impact === 'high' ? '#ef4444' : update.impact === 'medium' ? '#f59e0b' : '#3b82f6' }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        update.type === 'tax' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {update.type}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
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

                  <h3 className="text-xl font-black text-zinc-900 mb-2 leading-tight">
                    {update.title}
                  </h3>
                  <p className="text-zinc-600 text-sm leading-relaxed mb-4">
                    {update.content}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <Info size={14} />
                      Impact: <span className={
                        update.impact === 'high' ? 'text-red-500' : 
                        update.impact === 'medium' ? 'text-amber-500' : 'text-blue-500'
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

        {/* Sidebar / Post Preview */}
        <div className="space-y-6">
          <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 space-y-6 sticky top-8 shadow-2xl shadow-zinc-300">
            <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
              <Share2 className="text-blue-400" size={24} />
              {language === 'bn' ? 'সোশ্যাল পোস্ট' : 'Social Ready'}
            </h3>

            {socialPost ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="bg-white/5 rounded-2xl p-6 relative group border border-white/10">
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {socialPost}
                  </p>
                  <button 
                    onClick={() => copyToClipboard(socialPost)}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  >
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2 group">
                  <Sparkles size={12} className="text-amber-500 group-hover:scale-125 transition-transform" />
                  AI Generated in Bengali
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Attach Media (Images/Video)</label>
                  <div 
                    className={cn(
                      "relative border-2 border-dashed border-white/10 rounded-2xl p-4 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5",
                      mediaPreview && "p-0 overflow-hidden border-none aspect-video"
                    )}
                    onClick={() => document.getElementById('media-upload')?.click()}
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
                          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 rounded-lg text-white transition-all"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-500">
                          <ImageIcon size={20} />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-zinc-300">Click to upload media</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Required for Instagram/TikTok</p>
                        </div>
                      </>
                    )}
                    <input 
                      id="media-upload"
                      type="file" 
                      accept="image/*,video/*" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <button 
                    onClick={handleDirectPublish}
                    disabled={!!publishing}
                    className={cn(
                      "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2",
                      currentPlatform === 'facebook' ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20" : 
                      currentPlatform === 'linkedin' ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20" :
                      currentPlatform === 'twitter' ? "bg-zinc-100 text-zinc-900 hover:bg-white shadow-zinc-100/20" :
                      currentPlatform === 'instagram' ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white hover:opacity-90 shadow-red-500/20" :
                      currentPlatform === 'tiktok' ? "bg-black text-white hover:bg-zinc-900 shadow-zinc-900/20" :
                      "bg-zinc-800 text-white hover:bg-zinc-900 shadow-zinc-800/20"
                    )}
                  >
                    {publishing === currentPlatform ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Share2 size={18} />
                        Direct Publish to {currentPlatform ? currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1) : 'Social'}
                      </>
                    )}
                  </button>

                  <div className="pt-2 border-t border-white/5">
                    {!showScheduler ? (
                      <button 
                        onClick={() => setShowScheduler(true)}
                        className="w-full py-3 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Calendar size={14} />
                        Schedule for Later
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Choose Date & Time</label>
                          <input 
                            type="datetime-local" 
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full p-3 bg-white/10 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleSchedulePost}
                            disabled={!!publishing || !scheduledAt}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {publishing === 'scheduling' ? <RefreshCw size={14} className="animate-spin" /> : 'Confirm Schedule'}
                          </button>
                          <button 
                            onClick={() => setShowScheduler(false)}
                            className="px-4 py-3 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <button 
                    onClick={() => setSocialPost(null)}
                    className="w-full py-4 text-zinc-500 hover:text-white text-xs font-bold transition-colors"
                  >
                    Clear Preview
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 border border-zinc-800 rounded-3xl border-dashed">
                <div className="w-16 h-16 bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-600">
                  <Share2 size={32} />
                </div>
                <div className="px-6">
                  <p className="text-sm font-bold text-zinc-400">Select an update to generate a post</p>
                  <p className="text-[10px] text-zinc-600 mt-2 uppercase tracking-widest">Supports Facebook & LinkedIn</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-zinc-100 rounded-[2rem] p-8 space-y-4">
            <h4 className="font-black text-zinc-900 border-b border-zinc-50 pb-4">Tax Highlights 2024</h4>
            <div className="space-y-4">
              <LawTip tip="Corporate tax rate for non-listed companies: 27.5%" bnTip="অ-তালিকাভুক্ত কোম্পানির জন্য কর হার: ২৭.৫%" lang={language} />
              <LawTip tip="Cash transactions limit for tax benefits: BDT 5 Lakh" bnTip="কর সুবিধার জন্য নগদ লেনদেনের সীমা: ৫ লক্ষ টাকা" lang={language} />
              <LawTip tip="Mandatory PSR for 43 services in Bangladesh" bnTip="৪৩টি সেবার জন্য বাধ্যতামূলক PSR দাখিল" lang={language} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LawTip({ tip, bnTip, lang }: { tip: string, bnTip: string, lang: 'en' | 'bn' }) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-150 transition-transform" />
      <p className="text-xs font-medium text-zinc-600 leading-relaxed">
        {lang === 'bn' ? bnTip : tip}
      </p>
    </div>
  );
}

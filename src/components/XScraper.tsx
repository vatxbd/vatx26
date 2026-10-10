import React, { useState, useEffect } from 'react';
import { 
  Twitter, 
  Search, 
  TrendingUp, 
  User, 
  MessageSquare, 
  Heart, 
  Repeat, 
  Eye, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  Hash,
  Filter,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Tweet {
  id: string;
  text: string;
  author: {
    username: string;
    name: string;
    profile_image_url: string;
  };
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    impression_count: number;
  };
  created_at: string;
}

interface XUser {
  id: string;
  name: string;
  username: string;
  description: string;
  profile_image_url: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
}

interface Trend {
  name: string;
  query: string;
  tweet_volume: number | null;
}

export default function XScraper() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [user, setUser] = useState<XUser | null>(null);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'user' | 'trends'>('search');

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const res = await fetch('/api/x/trends');
      const data = await res.json();
      setTrends(data.trends || []);
    } catch (err) {
      console.error('Failed to fetch trends', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/x/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (res.ok) {
        setTweets(data.data || []);
        setActiveTab('search');
      } else {
        setError(data.error || 'Failed to search tweets');
      }
    } catch (err) {
      setError('Failed to connect to X Scraper');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserLookup = async (username: string) => {
    const cleanUsername = username.replace('@', '');
    if (!cleanUsername) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/x/user/${cleanUsername}`);
      const data = await res.json();
      if (res.ok) {
        setUser(data.data);
        setActiveTab('user');
      } else {
        setError(data.error || 'User not found');
      }
    } catch (err) {
      setError('Failed to lookup user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Twitter className="text-[#1DA1F2]" /> X Intelligence
            </h2>
            <p className="text-sm text-zinc-500">Search, analyze, and monitor X (Twitter) data for compliance and insights</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text"
                placeholder="Search tweets or @username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
              />
            </div>
            <button 
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Search
            </button>
          </div>
        </div>

        <div className="flex gap-4 border-b border-zinc-100">
          <button 
            onClick={() => setActiveTab('search')}
            className={cn(
              "pb-4 text-sm font-bold transition-all relative",
              activeTab === 'search' ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            Search Results
            {activeTab === 'search' && <motion.div layoutId="x-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />}
          </button>
          <button 
            onClick={() => setActiveTab('user')}
            className={cn(
              "pb-4 text-sm font-bold transition-all relative",
              activeTab === 'user' ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            User Profile
            {activeTab === 'user' && <motion.div layoutId="x-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />}
          </button>
          <button 
            onClick={() => setActiveTab('trends')}
            className={cn(
              "pb-4 text-sm font-bold transition-all relative",
              activeTab === 'trends' ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            Trending
            {activeTab === 'trends' && <motion.div layoutId="x-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
              >
                <AlertCircle size={20} />
                <p className="text-sm font-bold">{error}</p>
              </motion.div>
            )}

            {activeTab === 'search' && (
              <motion.div 
                key="search-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {tweets.map(tweet => (
                  <div key={tweet.id} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:border-brand-200 transition-all group">
                    <div className="flex gap-4">
                      <img 
                        src={tweet.author.profile_image_url} 
                        alt={tweet.author.name} 
                        className="w-12 h-12 rounded-full border border-zinc-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className="font-black text-zinc-900">{tweet.author.name}</span>
                            <button 
                              onClick={() => handleUserLookup(tweet.author.username)}
                              className="text-sm text-zinc-500 ml-2 hover:text-brand-600"
                            >
                              @{tweet.author.username}
                            </button>
                          </div>
                          <span className="text-xs text-zinc-400">
                            {new Date(tweet.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-zinc-800 text-sm leading-relaxed mb-4">{tweet.text}</p>
                        <div className="flex items-center gap-6 text-zinc-400">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <MessageSquare size={14} /> {tweet.public_metrics.reply_count}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Repeat size={14} /> {tweet.public_metrics.retweet_count}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Heart size={14} /> {tweet.public_metrics.like_count}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Eye size={14} /> {tweet.public_metrics.impression_count}
                          </div>
                          <a 
                            href={`https://x.com/${tweet.author.username}/status/${tweet.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto p-2 bg-zinc-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:text-brand-600"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {tweets.length === 0 && !isLoading && (
                  <div className="py-20 text-center bg-white rounded-3xl border border-zinc-100">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-4">
                      <Search size={32} />
                    </div>
                    <p className="text-zinc-400 text-sm italic">Search for something to see tweets</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'user' && user && (
              <motion.div 
                key="user-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm"
              >
                <div className="h-32 bg-zinc-100" />
                <div className="px-8 pb-8">
                  <div className="relative -mt-12 mb-6">
                    <img 
                      src={user.profile_image_url.replace('_normal', '_400x400')} 
                      alt={user.name} 
                      className="w-24 h-24 rounded-full border-4 border-white shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-zinc-900">{user.name}</h3>
                    <p className="text-zinc-500 font-bold">@{user.username}</p>
                  </div>
                  <p className="text-zinc-700 mb-8 leading-relaxed max-w-2xl">{user.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Followers</p>
                      <p className="text-xl font-black text-zinc-900">{user.public_metrics.followers_count.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Following</p>
                      <p className="text-xl font-black text-zinc-900">{user.public_metrics.following_count.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tweets</p>
                      <p className="text-xl font-black text-zinc-900">{user.public_metrics.tweet_count.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Listed</p>
                      <p className="text-xl font-black text-zinc-900">{user.public_metrics.listed_count.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <a 
                      href={`https://x.com/${user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all flex items-center gap-2"
                    >
                      View on X <ExternalLink size={16} />
                    </a>
                    <button 
                      onClick={() => {
                        setSearchQuery(`from:${user.username}`);
                        handleSearch();
                      }}
                      className="px-8 py-3 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-all flex items-center gap-2"
                    >
                      View Tweets <BarChart3 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'trends' && (
              <motion.div 
                key="trends-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {trends.map((trend, i) => (
                  <button 
                    key={trend.name}
                    onClick={() => {
                      setSearchQuery(trend.query);
                      handleSearch();
                    }}
                    className="p-6 bg-white rounded-3xl border border-zinc-100 text-left hover:border-brand-200 transition-all group shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Trend #{i + 1}</span>
                      <TrendingUp size={16} className="text-brand-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <h4 className="text-lg font-black text-zinc-900 mb-1">{trend.name}</h4>
                    {trend.tweet_volume && (
                      <p className="text-xs text-zinc-500 font-bold">{trend.tweet_volume.toLocaleString()} Tweets</p>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-6">
          <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <BarChart3 className="text-brand-400" size={20} /> Analysis Tools
            </h3>
            <div className="space-y-4">
              <button className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 transition-all flex items-center justify-between group">
                <div>
                  <p className="text-sm font-bold">Sentiment Analysis</p>
                  <p className="text-[10px] text-white/40">Analyze public perception</p>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-all" />
              </button>
              <button className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 transition-all flex items-center justify-between group">
                <div>
                  <p className="text-sm font-bold">Compliance Monitor</p>
                  <p className="text-[10px] text-white/40">Track regulatory mentions</p>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-all" />
              </button>
              <button className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 transition-all flex items-center justify-between group">
                <div>
                  <p className="text-sm font-bold">Influencer Network</p>
                  <p className="text-[10px] text-white/40">Map key opinion leaders</p>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-all" />
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <h3 className="text-lg font-black text-zinc-900 mb-4 flex items-center gap-2">
              <Filter className="text-brand-500" size={20} /> Quick Filters
            </h3>
            <div className="flex flex-wrap gap-2">
              {['#VAT', '#TaxBD', '#NBR', '#Budget2024', '#CryptoTax', '#Compliance'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    handleSearch();
                  }}
                  className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

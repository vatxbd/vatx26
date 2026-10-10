import React, { useState, useEffect } from 'react';
import { 
  Github, 
  File, 
  Folder, 
  GitCommit, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ExternalLink,
  History,
  Code,
  BookOpen,
  ArrowRight,
  Clock,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RepoItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  download_url: string | null;
}

interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
}

export default function GitBooks() {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState<RepoItem[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'files' | 'history'>('files');

  const REPO_OWNER = 'vatxbd';
  const REPO_NAME = 'books';

  useEffect(() => {
    if (activeView === 'files') {
      fetchContents(currentPath);
    } else {
      fetchCommits();
    }
  }, [currentPath, activeView]);

  const fetchContents = async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/github/contents?owner=${REPO_OWNER}&repo=${REPO_NAME}&path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.success && data.data) {
        // GitHub API returns an array for directories
        const content = Array.isArray(data.data) ? data.data : [data.data];
        setItems(content);
      } else {
        setError(data.error || 'Failed to load repository contents');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/github/commits?owner=${REPO_OWNER}&repo=${REPO_NAME}`);
      const data = await res.json();
      if (data.success && data.data) {
        setCommits(data.data);
      } else {
        setError(data.error || 'Failed to load commit history');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white">
              <Github size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-zinc-900">Accounting Books</h2>
              <p className="text-xs text-zinc-500 font-medium">Version controlled accounting records via Git</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveView('files')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                activeView === 'files' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <Code size={14} /> Files
            </button>
            <button 
              onClick={() => setActiveView('history')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                activeView === 'history' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              <History size={14} /> History
            </button>
          </div>
        </div>

        {activeView === 'files' && (
          <div className="mt-6 flex items-center gap-2 text-sm font-bold text-zinc-400 overflow-x-auto pb-2">
            <button 
              onClick={() => setCurrentPath('')}
              className={cn("hover:text-zinc-900 transition-colors", currentPath === '' && "text-zinc-900")}
            >
              Root
            </button>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                <ChevronRight size={14} />
                <button 
                  onClick={() => setCurrentPath(breadcrumbs.slice(0, i + 1).join('/'))}
                  className={cn(
                    "hover:text-zinc-900 transition-colors whitespace-nowrap",
                    i === breadcrumbs.length - 1 && "text-zinc-900"
                  )}
                >
                  {crumb}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center gap-4"
            >
              <Loader2 size={40} className="text-zinc-900 animate-spin" />
              <p className="text-sm font-bold text-zinc-400">Fetching from GitHub...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center justify-center gap-4 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                <AlertCircle size={32} />
              </div>
              <div>
                <p className="text-lg font-black text-zinc-900">GitHub Sync Failed</p>
                <p className="text-sm text-zinc-500">{error}</p>
              </div>
              <button 
                onClick={() => activeView === 'files' ? fetchContents(currentPath) : fetchCommits()}
                className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
              >
                Retry Sync
              </button>
            </motion.div>
          ) : activeView === 'files' ? (
            <motion.div 
              key="files-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="divide-y divide-zinc-50"
            >
              {items.map((item) => (
                <div 
                  key={item.path}
                  className="group flex items-center justify-between p-4 hover:bg-zinc-50 transition-all cursor-pointer"
                  onClick={() => item.type === 'dir' && setCurrentPath(item.path)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      item.type === 'dir' ? "bg-blue-50 text-blue-600" : "bg-zinc-50 text-zinc-400"
                    )}>
                      {item.type === 'dir' ? <Folder size={20} /> : <File size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{item.name}</p>
                      <p className="text-[10px] text-zinc-400 font-medium">
                        {item.type === 'dir' ? 'Directory' : `${(item.size / 1024).toFixed(2)} KB`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    {item.download_url && (
                      <a 
                        href={item.download_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-white rounded-lg transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <ChevronRight size={16} className="text-zinc-300" />
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-sm font-bold text-zinc-400">No files found in this directory</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="history-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="divide-y divide-zinc-50"
            >
              {commits.map((commit) => (
                <div 
                  key={commit.sha}
                  className="p-6 hover:bg-zinc-50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <GitCommit size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 leading-tight mb-1">{commit.commit.message}</p>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1"><User size={12} /> {commit.commit.author.name}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(commit.commit.author.date).toLocaleDateString()}</span>
                          <span className="font-mono text-zinc-300">{commit.sha.substring(0, 7)}</span>
                        </div>
                      </div>
                    </div>
                    <a 
                      href={commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white border border-zinc-100 text-zinc-400 hover:text-zinc-900 rounded-xl transition-all shadow-sm opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Repo Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 text-white p-6 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-zinc-800 transition-all">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Repository</p>
            <h3 className="text-lg font-black">vatxbd / books</h3>
          </div>
          <Github size={32} className="text-zinc-700 group-hover:text-zinc-500 transition-colors" />
        </div>
        
        <div className="bg-white border border-zinc-100 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Status</p>
            <h3 className="text-lg font-black text-zinc-900">Live Sync</h3>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <History size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Last Update</p>
            <h3 className="text-lg font-black text-zinc-900">
              {commits[0] ? new Date(commits[0].commit.author.date).toLocaleDateString() : 'Syncing...'}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

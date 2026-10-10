import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  Search, 
  Share2, 
  Upload, 
  Download, 
  MoreVertical, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  FileArchive,
  ExternalLink,
  Plus,
  Grid,
  List as ListIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DropboxItem {
  ".tag": "file" | "folder";
  id: string;
  name: string;
  path_display: string;
  path_lower: string;
  size?: number;
  client_modified?: string;
}

export default function DropboxManager() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [items, setItems] = useState<DropboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchItems(currentPath);
  }, [currentPath]);

  const fetchItems = async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dropbox/list?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setItems(data.data.entries || []);
      } else {
        setError(data.error || 'Failed to load files');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchItems(currentPath);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dropbox/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success && data.data) {
        // Search results might have a different structure, mapping for consistency
        const results = data.data.matches.map((m: any) => m.metadata.metadata);
        setItems(results);
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (path: string) => {
    try {
      const res = await fetch('/api/dropbox/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      const data = await res.json();
      if (data.success) {
        const url = data.data.url;
        navigator.clipboard.writeText(url);
        setStatus({ type: 'success', message: 'Shared link copied to clipboard!' });
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to create link' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Sharing failed' });
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '--';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (tag: string, name: string) => {
    if (tag === 'folder') return <Folder className="text-blue-500 fill-blue-500/10" size={20} />;
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'png', 'gif', 'webp'].includes(ext || '')) return <ImageIcon className="text-purple-500" size={20} />;
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) return <FileText className="text-emerald-500" size={20} />;
    if (['zip', 'rar', '7z'].includes(ext || '')) return <FileArchive className="text-amber-500" size={20} />;
    return <File className="text-zinc-400" size={20} />;
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Folder size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-zinc-900">Dropbox Cloud</h2>
              <p className="text-xs text-zinc-500 font-medium">Manage your compliance documents and reports</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all w-64"
              />
            </div>
            <button className="p-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10">
              <Upload size={18} />
            </button>
            <button className="p-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-all">
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 overflow-x-auto pb-2 scrollbar-hide">
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
                onClick={() => setCurrentPath('/' + breadcrumbs.slice(0, i + 1).join('/'))}
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
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded-lg transition-all", viewMode === 'list' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600")}
            >
              <ListIcon size={18} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded-lg transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600")}
            >
              <Grid size={18} />
            </button>
          </div>
          <div className="text-xs font-black text-zinc-400 uppercase tracking-widest">
            {items.length} Items
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 flex flex-col items-center justify-center gap-4"
              >
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-sm font-bold text-zinc-400">Syncing with Dropbox...</p>
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
                  <p className="text-lg font-black text-zinc-900">Oops! Something went wrong</p>
                  <p className="text-sm text-zinc-500">{error}</p>
                </div>
                <button 
                  onClick={() => fetchItems(currentPath)}
                  className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
                >
                  Try Again
                </button>
              </motion.div>
            ) : items.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center gap-4 text-center"
              >
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300">
                  <Folder size={32} />
                </div>
                <div>
                  <p className="text-lg font-black text-zinc-900">This folder is empty</p>
                  <p className="text-sm text-zinc-500">Upload documents to get started</p>
                </div>
              </motion.div>
            ) : viewMode === 'list' ? (
              <motion.div 
                key="list-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1"
              >
                {items.map((item) => (
                  <div 
                    key={item.id}
                    className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-50 transition-all cursor-pointer border border-transparent hover:border-zinc-100"
                    onClick={() => item[".tag"] === 'folder' && setCurrentPath(item.path_display)}
                  >
                    <div className="shrink-0">
                      {getFileIcon(item[".tag"], item.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-zinc-400 font-medium">
                        {item[".tag"] === 'file' ? `${formatSize(item.size)} • ${new Date(item.client_modified!).toLocaleDateString()}` : 'Folder'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(item.path_display); }}
                        className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Share"
                      >
                        <Share2 size={16} />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all">
                        <Download size={16} />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="grid-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              >
                {items.map((item) => (
                  <div 
                    key={item.id}
                    className="group p-4 bg-zinc-50/50 border border-zinc-100 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50 transition-all cursor-pointer text-center relative"
                    onClick={() => item[".tag"] === 'folder' && setCurrentPath(item.path_display)}
                  >
                    <div className="mb-4 flex justify-center scale-125 group-hover:scale-150 transition-transform duration-300">
                      {getFileIcon(item[".tag"], item.name)}
                    </div>
                    <p className="text-xs font-bold text-zinc-900 truncate px-2">{item.name}</p>
                    <p className="text-[10px] text-zinc-400 font-medium mt-1">
                      {item[".tag"] === 'file' ? formatSize(item.size) : 'Folder'}
                    </p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(item.path_display); }}
                        className="p-1.5 bg-white shadow-sm border border-zinc-100 rounded-lg text-zinc-400 hover:text-blue-600"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status Toasts */}
      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50",
              status.type === 'success' ? "bg-emerald-900 text-white" : "bg-red-900 text-white"
            )}
          >
            {status.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertCircle size={20} className="text-red-400" />}
            <span className="text-sm font-bold">{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

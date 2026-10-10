import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table as TableIcon, 
  Play, 
  Download, 
  Search, 
  Code, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  FileSpreadsheet,
  Info,
  RefreshCw,
  Trash2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Table {
  name: string;
}

interface SchemaColumn {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export default function BaseManager() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableSchema, setTableSchema] = useState<SchemaColumn[]>([]);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'tables' | 'queries'>('tables');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/base/tables');
      const data = await res.json();
      setTables(data);
    } catch (err) {
      console.error('Failed to fetch tables', err);
    }
  };

  const fetchTableDetails = async (name: string) => {
    setIsLoading(true);
    setSelectedTable(name);
    setActiveView('tables');
    try {
      const res = await fetch(`/api/base/table/${name}`);
      const data = await res.json();
      setTableSchema(data.schema);
      setTableData(data.data);
    } catch (err) {
      console.error('Failed to fetch table details', err);
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) return;
    setIsLoading(true);
    setQueryError(null);
    setQueryResult(null);
    try {
      const res = await fetch('/api/base/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlQuery }),
      });
      const data = await res.json();
      if (res.ok) {
        setQueryResult(Array.isArray(data) ? data : [data]);
      } else {
        setQueryError(data.error);
      }
    } catch (err) {
      setQueryError('Failed to execute query');
    } finally {
      setIsLoading(false);
    }
  };

  const exportTable = (name: string) => {
    window.open(`/api/base/export/${name}`, '_blank');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-200px)]">
      {/* Sidebar - Table List */}
      <aside className="w-full lg:w-72 bg-white rounded-3xl border border-zinc-100 p-6 flex flex-col shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Database className="text-brand-500" size={20} /> Base
          </h2>
          <button 
            onClick={fetchTables}
            className="p-2 text-zinc-400 hover:text-brand-600 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <button 
            onClick={() => setActiveView('tables')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeView === 'tables' ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
            )}
          >
            <TableIcon size={18} /> Tables
          </button>
          <button 
            onClick={() => setActiveView('queries')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
              activeView === 'queries' ? "bg-zinc-900 text-white" : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
            )}
          >
            <Code size={18} /> SQL Console
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 px-4">Available Tables</p>
          <div className="space-y-1">
            {tables.map(table => (
              <button
                key={table.name}
                onClick={() => fetchTableDetails(table.name)}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group",
                  selectedTable === table.name && activeView === 'tables' ? "bg-brand-50 text-brand-700" : "text-zinc-500 hover:bg-zinc-50"
                )}
              >
                <span className="truncate">{table.name}</span>
                <ChevronRight size={14} className={cn("transition-transform", selectedTable === table.name ? "rotate-90" : "opacity-0 group-hover:opacity-100")} />
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
        {activeView === 'tables' && selectedTable ? (
          <>
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div>
                <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <TableIcon className="text-brand-500" size={20} /> {selectedTable}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">{tableData.length} records shown (max 100)</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => exportTable(selectedTable)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
                >
                  <Download size={16} /> Export Excel
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Schema Info */}
              <div className="p-4 bg-zinc-50 border-b border-zinc-100 flex gap-4 overflow-x-auto custom-scrollbar">
                {tableSchema.map(col => (
                  <div key={col.name} className="shrink-0 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg flex items-center gap-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">{col.type}</span>
                    <span className="text-xs font-bold text-zinc-900">{col.name}</span>
                    {col.pk === 1 && <div className="w-2 h-2 bg-amber-500 rounded-full" title="Primary Key" />}
                  </div>
                ))}
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr>
                      {tableSchema.map(col => (
                        <th key={col.name} className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 bg-white">
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0">
                        {tableSchema.map(col => (
                          <td key={col.name} className="px-6 py-4 text-xs text-zinc-600 font-medium">
                            {row[col.name] === null ? <span className="text-zinc-300 italic">null</span> : String(row[col.name])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tableData.length === 0 && (
                  <div className="p-20 text-center">
                    <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-4">
                      <Search size={24} />
                    </div>
                    <p className="text-zinc-400 text-sm italic">No data in this table</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : activeView === 'queries' ? (
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Code className="text-brand-500" size={20} /> SQL Console
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Execute raw SQL queries against the database</p>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Query Editor</label>
                  <button 
                    onClick={executeQuery}
                    disabled={isLoading || !sqlQuery.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-all disabled:opacity-50"
                  >
                    <Play size={16} /> Run Query
                  </button>
                </div>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="SELECT * FROM vat_records WHERE amount > 1000..."
                  className="flex-1 p-6 bg-zinc-900 text-brand-400 font-mono text-sm rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 resize-none shadow-inner"
                />
              </div>

              <div className="h-1/2 flex flex-col gap-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Result</label>
                <div className="flex-1 bg-zinc-50 rounded-2xl border border-zinc-100 overflow-auto custom-scrollbar p-6">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <RefreshCw className="text-brand-500 animate-spin" size={32} />
                    </div>
                  ) : queryError ? (
                    <div className="flex items-center gap-3 text-red-600">
                      <AlertCircle size={20} />
                      <p className="text-sm font-bold">{queryError}</p>
                    </div>
                  ) : queryResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-emerald-600 mb-4">
                        <CheckCircle2 size={18} />
                        <p className="text-xs font-bold">Query executed successfully</p>
                      </div>
                      <pre className="text-xs font-mono text-zinc-600 bg-white p-4 rounded-xl border border-zinc-200 overflow-x-auto">
                        {JSON.stringify(queryResult, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-300">
                      <Info size={32} className="mb-2" />
                      <p className="text-sm italic">Run a query to see results</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-200 mb-6 rotate-3">
              <Database size={48} />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 mb-2">Database Manager</h3>
            <p className="text-zinc-500 max-w-md mx-auto">
              Select a table from the sidebar to browse data, or use the SQL console to perform advanced queries and data operations.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
              <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 text-left">
                <h4 className="font-bold text-zinc-900 flex items-center gap-2 mb-2">
                  <TableIcon size={16} className="text-brand-500" /> Browse Tables
                </h4>
                <p className="text-xs text-zinc-500">View schema and records for all system tables.</p>
              </div>
              <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 text-left">
                <h4 className="font-bold text-zinc-900 flex items-center gap-2 mb-2">
                  <Code size={16} className="text-brand-500" /> SQL Console
                </h4>
                <p className="text-xs text-zinc-500">Run custom SQL queries for data analysis and reporting.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

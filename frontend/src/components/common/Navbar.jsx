import React, { useState } from 'react';
import { Menu, Upload, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { endpoints } from '../../services/api';

export default function Navbar({ onOpenSidebar, onOpenUpload, onRefreshData }) {
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState(null);

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      setSeedStatus(null);
      const res = await endpoints.seedDemoData();
      setSeedStatus({ type: 'success', msg: `Seeded ${res.transactions_created} transactions!` });
      if (onRefreshData) onRefreshData();
      setTimeout(() => setSeedStatus(null), 4000);
    } catch (err) {
      setSeedStatus({ type: 'error', msg: err.message });
      setTimeout(() => setSeedStatus(null), 4000);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">
          Overview & Insights
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Seed demo data button */}
        <button
          onClick={handleSeedDemo}
          disabled={seeding}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition disabled:opacity-50"
          title="Seed 6 months of realistic Indian transactions"
        >
          <Database className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{seeding ? 'Seeding...' : 'Load Demo Data'}</span>
          <span className="sm:hidden">Demo</span>
        </button>

        {/* Upload Statement CSV button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 transition"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload CSV</span>
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <ThemeToggle />
      </div>

      {/* Floating toast notification for seed status */}
      {seedStatus && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-medium border animate-in slide-in-from-bottom duration-300 ${
          seedStatus.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
        }`}>
          {seedStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span>{seedStatus.msg}</span>
        </div>
      )}
    </header>
  );
}

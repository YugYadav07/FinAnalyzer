import React, { useState, useEffect } from 'react';
import TransactionTable from '../components/transactions/TransactionTable';
import ManualTransactionModal from '../components/transactions/ManualTransactionModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { endpoints } from '../services/api';
import {
  Search,
  Plus,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Upload,
} from 'lucide-react';

export default function TransactionsPage({ onOpenUpload, refreshTrigger }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ transactions: [], total: 0, page: 1, total_pages: 1 });
  const [categories, setCategories] = useState([]);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(1);

  const fetchCategories = async () => {
    try {
      const cats = await endpoints.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await endpoints.getTransactions({
        page,
        limit: 15,
        q: search || undefined,
        category: selectedCategory || undefined,
        type: selectedType || undefined,
      });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, search, selectedCategory, selectedType, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await endpoints.deleteTransaction(id);
      fetchTransactions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateCategory = async (id, newCategory) => {
    try {
      await endpoints.updateTransaction(id, { category: newCategory });
      fetchTransactions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    const url = endpoints.exportTransactionsUrl({
      category: selectedCategory || undefined,
      type: selectedType || undefined,
    });
    window.open(url, '_blank');
  };

  const handleResetTransactions = async () => {
    try {
      setResetting(true);
      await endpoints.clearAllTransactions();
      setShowResetConfirm(false);
      // Refresh the table (will show empty)
      fetchTransactions();
      // Open the upload modal so user can re-import CSV
      if (onOpenUpload) onOpenUpload();
    } catch (err) {
      alert('Failed to reset transactions: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Transactions Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, filter, edit categories (feedback learning active), or export to CSV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/30 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset & Re-upload</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Manual</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description, merchant, or notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id || c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type filter */}
        <div className="w-full md:w-36">
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Types</option>
            <option value="debit">Debit (Expense)</option>
            <option value="credit">Credit (Income)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" count={8} />
          </div>
        ) : (
          <>
            <TransactionTable
              transactions={data.transactions}
              categories={categories}
              onDelete={handleDelete}
              onUpdateCategory={handleUpdateCategory}
            />

            {/* Pagination footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                Showing page {data.page} of {data.total_pages} ({data.total} total transactions)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={data.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={data.page >= data.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Manual Transaction Modal */}
      <ManualTransactionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        categories={categories}
        onSuccess={fetchTransactions}
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !resetting && setShowResetConfirm(false)}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md mx-4 animate-in">
            {/* Warning Icon */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/40">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">
              Reset All Transactions?
            </h3>

            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-2">
              This will permanently delete <span className="font-semibold text-red-600 dark:text-red-400">all {data.total} transactions</span> from the database.
            </p>

            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
              After deletion, the CSV upload modal will open so you can import fresh data.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={resetting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetTransactions}
                disabled={resetting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-70"
              >
                {resetting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete All & Re-upload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

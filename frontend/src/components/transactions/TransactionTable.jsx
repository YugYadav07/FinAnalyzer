import React, { useState } from 'react';
import {
  formatINR,
  formatDate,
  getCategoryColor,
} from '../../utils/formatters';
import {
  Trash2,
  AlertTriangle,
  Repeat,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Check,
  X,
} from 'lucide-react';

export default function TransactionTable({
  transactions = [],
  categories = [],
  onDelete,
  onUpdateCategory,
}) {
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const startEdit = (txn) => {
    setEditingId(txn.id);
    setSelectedCategory(txn.category || 'Other');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSelectedCategory('');
  };

  const saveEdit = (id) => {
    if (onUpdateCategory) {
      onUpdateCategory(id, selectedCategory);
    }
    setEditingId(null);
  };

  if (transactions.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-400 text-sm">No transactions found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200/80 dark:border-slate-700/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4">Description</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4 text-right">Amount</th>
            <th className="py-3 px-4 text-center">Tags</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
          {transactions.map((txn) => {
            const isDebit = txn.type === 'debit';
            const isEditing = editingId === txn.id;

            return (
              <tr
                key={txn.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
              >
                {/* Date */}
                <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                  {formatDate(txn.date)}
                </td>

                {/* Description */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isDebit
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isDebit ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100 text-xs sm:text-sm line-clamp-1">
                        {txn.clean_description || txn.description}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {txn.description}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category with inline editing for feedback learning */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-xs py-1 px-2 rounded-lg border border-indigo-400 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id || c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => saveEdit(txn.id)}
                        className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400"
                        title="Save & Train Categorizer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: `${getCategoryColor(txn.category)}15`,
                          borderColor: `${getCategoryColor(txn.category)}35`,
                          color: getCategoryColor(txn.category),
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: getCategoryColor(txn.category) }}
                        />
                        {txn.category || 'Other'}
                      </span>
                      <button
                        onClick={() => startEdit(txn)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition"
                        title="Change Category (trains system)"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </td>

                {/* Amount */}
                <td
                  className={`py-3.5 px-4 whitespace-nowrap text-right font-bold text-xs sm:text-sm ${
                    isDebit
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isDebit ? '-' : '+'}
                  {formatINR(txn.amount)}
                </td>

                {/* Tags (Recurring / Anomaly) */}
                <td className="py-3.5 px-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1">
                    {txn.is_recurring && (
                      <span
                        className="inline-flex items-center p-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px]"
                        title="Recurring subscription / bill"
                      >
                        <Repeat className="w-3 h-3" />
                      </span>
                    )}
                    {txn.is_anomaly && (
                      <span
                        className="inline-flex items-center p-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-[10px]"
                        title={txn.anomaly_reason || 'Anomaly detected'}
                      >
                        <AlertTriangle className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => onDelete(txn.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

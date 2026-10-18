import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

export default function EditBudgetModal({
  isOpen,
  onClose,
  budget,
  categories = [],
  currentMonth,
  onSave,
}) {
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    if (budget) {
      setCategory(budget.category);
      setLimit(budget.monthly_limit);
    } else {
      setCategory(categories[0]?.name || 'Food');
      setLimit('');
    }
  }, [budget, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!limit || isNaN(limit)) return;
    onSave({
      category,
      monthly_limit: parseFloat(limit),
      month_year: currentMonth,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budget ? `Edit ${budget.category} Budget` : 'Set Category Budget Limit'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Category
          </label>
          <select
            disabled={!!budget}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 disabled:opacity-60"
          >
            {categories.map((c) => (
              <option key={c.id || c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Monthly Limit (₹)
          </label>
          <input
            type="number"
            required
            min="100"
            step="100"
            placeholder="e.g. 8000"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Applicable Month
          </label>
          <input
            type="text"
            disabled
            value={currentMonth}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-xs text-slate-500 opacity-70"
          />
        </div>

        <div className="pt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            Save Budget
          </button>
        </div>
      </form>
    </Modal>
  );
}

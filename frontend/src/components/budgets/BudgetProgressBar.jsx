import React from 'react';
import Card from '../common/Card';
import { formatINR, formatPercent, getCategoryColor } from '../../utils/formatters';
import { AlertCircle, CheckCircle, Edit, Trash2 } from 'lucide-react';

export default function BudgetProgressBar({ budget, onEdit, onDelete }) {
  const isOver = budget.status === 'red' || budget.percentage >= 100;
  const isWarning = budget.status === 'yellow' || (budget.percentage >= 80 && budget.percentage < 100);

  const getStatusColor = () => {
    if (isOver) return 'bg-rose-500';
    if (isWarning) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStatusBadge = () => {
    if (isOver) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
          <AlertCircle className="w-3 h-3" /> Over Budget
        </span>
      );
    }
    if (isWarning) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-3 h-3" /> Approaching Limit (80%+)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
        <CheckCircle className="w-3 h-3" /> On Track
      </span>
    );
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: getCategoryColor(budget.category) }}
          />
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
            {budget.category}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button
            onClick={() => onEdit(budget)}
            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Edit limit"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Delete budget"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Amounts */}
      <div className="flex justify-between items-baseline mt-3 text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          Spent: <strong className="text-slate-800 dark:text-slate-200">{formatINR(budget.spent)}</strong>
        </span>
        <span className="text-slate-500 dark:text-slate-400">
          Limit: <strong className="text-slate-800 dark:text-slate-200">{formatINR(budget.monthly_limit)}</strong>
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getStatusColor()}`}
          style={{ width: `${Math.min(100, budget.percentage || 0)}%` }}
        />
      </div>

      <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
        <span>{formatPercent(budget.percentage)} used</span>
        <span>
          {budget.monthly_limit > budget.spent
            ? `${formatINR(budget.monthly_limit - budget.spent)} remaining`
            : `${formatINR(budget.spent - budget.monthly_limit)} over limit`}
        </span>
      </div>
    </div>
  );
}

import React from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export default function SummaryCard({ title, amount, type = 'neutral', subtitle, icon }) {
  const isPositive = type === 'income' || type === 'savings';
  const isExpense = type === 'expense';

  const getTheme = () => {
    switch (type) {
      case 'income':
        return {
          bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
          border: 'border-emerald-200/60 dark:border-emerald-800/40',
          text: 'text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
          Icon: ArrowDownRight,
        };
      case 'expense':
        return {
          bg: 'bg-rose-50/70 dark:bg-rose-950/30',
          border: 'border-rose-200/60 dark:border-rose-800/40',
          text: 'text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
          Icon: ArrowUpRight,
        };
      case 'savings':
        return {
          bg: 'bg-indigo-50/70 dark:bg-indigo-950/30',
          border: 'border-indigo-200/60 dark:border-indigo-800/40',
          text: 'text-indigo-600 dark:text-indigo-400',
          badge: 'bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
          Icon: Wallet,
        };
      default:
        return {
          bg: 'bg-slate-50/80 dark:bg-slate-800/40',
          border: 'border-slate-200/60 dark:border-slate-700/50',
          text: 'text-slate-700 dark:text-slate-300',
          badge: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
          Icon: Wallet,
        };
    }
  };

  const theme = getTheme();
  const IconComponent = icon || theme.Icon;

  return (
    <div className={`p-5 rounded-2xl border ${theme.bg} ${theme.border} backdrop-blur-sm shadow-sm transition hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${theme.badge}`}>
          <IconComponent className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {formatINR(amount)}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

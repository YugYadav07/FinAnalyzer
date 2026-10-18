import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Repeat,
  BarChart2,
} from 'lucide-react';

export default function InsightCard({ card }) {
  const getTheme = () => {
    switch (card.type) {
      case 'warning':
        return {
          bg: 'bg-amber-50/70 dark:bg-amber-950/30',
          border: 'border-amber-200/60 dark:border-amber-800/40',
          title: 'text-amber-800 dark:text-amber-300',
          icon: AlertTriangle,
          iconColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'danger':
        return {
          bg: 'bg-rose-50/70 dark:bg-rose-950/30',
          border: 'border-rose-200/60 dark:border-rose-800/40',
          title: 'text-rose-800 dark:text-rose-300',
          icon: AlertTriangle,
          iconColor: 'text-rose-600 dark:text-rose-400',
        };
      case 'success':
        return {
          bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
          border: 'border-emerald-200/60 dark:border-emerald-800/40',
          title: 'text-emerald-800 dark:text-emerald-300',
          icon: CheckCircle,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
        };
      default:
        return {
          bg: 'bg-indigo-50/70 dark:bg-indigo-950/30',
          border: 'border-indigo-200/60 dark:border-indigo-800/40',
          title: 'text-indigo-800 dark:text-indigo-300',
          icon: Info,
          iconColor: 'text-indigo-600 dark:text-indigo-400',
        };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.icon;

  return (
    <div className={`p-4 rounded-2xl border ${theme.bg} ${theme.border} flex items-start gap-3.5 transition hover:shadow-sm`}>
      <div className={`p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 ${theme.iconColor} shrink-0`}>
        <IconComponent className="w-4 h-4" />
      </div>
      <div>
        <h4 className={`text-xs font-bold uppercase tracking-wider ${theme.title}`}>
          {card.title}
        </h4>
        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
          {card.message}
        </p>
      </div>
    </div>
  );
}

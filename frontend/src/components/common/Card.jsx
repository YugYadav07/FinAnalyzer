import React from 'react';

export default function Card({ children, className = '', title, subtitle, action }) {
  return (
    <div className={`bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 transition-all ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between mb-5">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

import React from 'react';

export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className="w-full space-y-3 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-700/60 rounded-xl" />
        {items.map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
        ))}
      </div>
    );
  }

  if (type === 'summary') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((_, i) => (
          <div key={i} className="h-32 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((_, i) => (
        <div key={i} className="h-28 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

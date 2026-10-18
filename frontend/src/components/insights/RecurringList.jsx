import React from 'react';
import Card from '../common/Card';
import { formatINR, formatDate, getCategoryColor } from '../../utils/formatters';
import { Calendar, Repeat } from 'lucide-react';

export default function RecurringList({ recurring = [] }) {
  return (
    <Card
      title="Recurring Subscriptions & Fixed Payments"
      subtitle="Detected from periodic payment intervals (Rent, Bills, OTT)"
    >
      {recurring.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">
          No recurring patterns found yet. Upload statements spanning 2+ months.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {recurring.map((item) => (
            <div
              key={item.merchant}
              className="py-3.5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                      {item.merchant}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${getCategoryColor(item.category)}15`,
                        borderColor: `${getCategoryColor(item.category)}35`,
                        color: getCategoryColor(item.category),
                      }}
                    >
                      {item.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                      {item.frequency}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Next due: <strong className="text-slate-600 dark:text-slate-300">{formatDate(item.next_expected)}</strong>
                    </span>
                    <span>• {item.count} occurrences</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  {formatINR(item.avg_amount)}
                </span>
                <p className="text-[10px] text-slate-400">avg per cycle</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

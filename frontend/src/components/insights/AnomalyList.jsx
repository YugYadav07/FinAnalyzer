import React from 'react';
import Card from '../common/Card';
import { formatINR, formatDate, getCategoryColor } from '../../utils/formatters';
import { AlertCircle } from 'lucide-react';

export default function AnomalyList({ anomalies = [] }) {
  return (
    <Card
      title="Spending Anomalies (Z-Score & Isolation Forest)"
      subtitle="Outliers and unusual spikes detected by statistical models"
    >
      {anomalies.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">
          No spending anomalies detected. All transactions align with normal spending patterns!
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {anomalies.map((item) => (
            <div key={item.id} className="py-3.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                      {item.description}
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
                  </div>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                    {item.reason}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(item.date)}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                  {formatINR(item.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

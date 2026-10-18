import React from 'react';
import Card from '../common/Card';
import { formatINR } from '../../utils/formatters';
import { Store } from 'lucide-react';

export default function TopMerchants({ merchants = [] }) {
  return (
    <Card title="Top 5 Merchants" subtitle="Where your money goes most">
      {merchants.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          No merchant data available
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60 mt-1">
          {merchants.map((m, index) => (
            <div key={m.merchant} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-bold">
                  #{index + 1}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {m.merchant}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {m.count} transaction{m.count > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {formatINR(m.total)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

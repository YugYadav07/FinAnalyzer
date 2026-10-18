import React from 'react';
import Card from '../common/Card';
import { formatINR, formatPercent, getCategoryColor } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

export default function ForecastCard({ forecast }) {
  if (!forecast || !forecast.breakdown || forecast.breakdown.length === 0) {
    return (
      <Card
        title="Next Month Spending Forecast"
        subtitle="AI Linear Regression & Moving Average model"
      >
        <div className="py-10 text-center text-xs text-slate-400">
          Not enough historical data to generate forecast. Need at least 2 months of transactions.
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Next Month Spending Forecast"
      subtitle="Linear Regression & Weighted Moving Average Prediction"
      action={
        <div className="text-right">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Projected</span>
          <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
            {formatINR(forecast.total_forecasted)}
          </div>
        </div>
      }
    >
      <div className="divide-y divide-slate-100 dark:divide-slate-700/60 mt-2">
        {forecast.breakdown.map((item) => {
          const isHigher = item.change_pct > 0;
          return (
            <div key={item.category} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getCategoryColor(item.category) }}
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {item.category}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Current: {formatINR(item.current_month)}</span>
                    <span>• Conf: {Math.round(item.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {formatINR(item.forecasted)}
                </div>
                <div className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                  isHigher ? 'text-rose-500' : 'text-emerald-500'
                }`}>
                  {isHigher ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{Math.abs(item.change_pct)}% vs this month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

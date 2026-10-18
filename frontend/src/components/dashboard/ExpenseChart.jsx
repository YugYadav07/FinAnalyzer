import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '../common/Card';
import { formatCompactINR, formatINR } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
        <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatINR(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ExpenseChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card title="Income vs Expenses Trend" subtitle="Monthly cashflow analysis">
        <div className="h-64 flex items-center justify-center text-xs text-slate-400">
          No trend data available yet
        </div>
      </Card>
    );
  }

  return (
    <Card title="Income vs Expenses Trend" subtitle="Monthly cashflow comparison">
      <div className="h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1', opacity: 0.5 }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickFormatter={(v) => formatCompactINR(v)}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="circle"
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              dataKey="expense"
              name="Expense"
              fill="#f43f5e"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

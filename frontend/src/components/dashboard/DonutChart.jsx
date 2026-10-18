import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Card from '../common/Card';
import { formatINR, formatPercent } from '../../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          {data.category}
        </div>
        <div className="mt-1 flex justify-between gap-4 text-slate-600 dark:text-slate-300">
          <span>{formatINR(data.amount)}</span>
          <span className="font-semibold text-slate-400">({formatPercent(data.percentage)})</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DonutChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Card title="Category Breakdown" subtitle="Spending distribution">
        <div className="h-64 flex items-center justify-center text-xs text-slate-400">
          No expense categories recorded yet
        </div>
      </Card>
    );
  }

  return (
    <Card title="Category Breakdown" subtitle="Spending distribution by category">
      <div className="h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="amount"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '11px', maxHeight: '60px', overflowY: 'auto' }}
              iconType="circle"
              formatter={(value, entry) => (
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

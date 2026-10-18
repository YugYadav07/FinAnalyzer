import React, { useState, useEffect } from 'react';
import SummaryCard from '../components/dashboard/SummaryCard';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import DonutChart from '../components/dashboard/DonutChart';
import TopMerchants from '../components/dashboard/TopMerchants';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import InsightCard from '../components/insights/InsightCard';
import { endpoints } from '../services/api';
import { Calendar, Filter, Sparkles, TrendingUp, TrendingDown, Percent, Wallet } from 'lucide-react';

export default function DashboardPage({ refreshTrigger }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = selectedMonth ? { month: selectedMonth } : {};
      const [sumRes, chartRes, cardRes] = await Promise.all([
        endpoints.getSummary(params),
        endpoints.getCharts(),
        endpoints.getInsightCards(),
      ]);
      setSummary(sumRes);
      setCharts(chartRes);
      setCards(cardRes);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, refreshTrigger]);

  return (
    <div className="space-y-6">
      {/* Page Header with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Financial Health Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time tracking of cashflow, savings velocity, and expenditure patterns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none"
            />
            {selectedMonth && (
              <button
                onClick={() => setSelectedMonth('')}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline ml-1"
              >
                All Time
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <LoadingSkeleton type="summary" count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LoadingSkeleton count={2} />
          </div>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <SummaryCard
              title="Total Income"
              amount={summary?.total_income || 0}
              type="income"
              subtitle="All credits & salaries"
            />
            <SummaryCard
              title="Total Expenses"
              amount={summary?.total_expenses || 0}
              type="expense"
              subtitle="Debits across all categories"
            />
            <SummaryCard
              title="Net Savings"
              amount={summary?.net_savings || 0}
              type="savings"
              subtitle="Income retained this period"
            />
            <SummaryCard
              title="Savings Rate"
              amount={0}
              type="neutral"
              icon={Percent}
              subtitle={
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {summary?.savings_rate || 0}% of earnings
                </span>
              }
            />
          </div>

          {/* Quick AI Insight Cards */}
          {cards.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Smart Highlights</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {cards.slice(0, 3).map((card, i) => (
                  <InsightCard key={i} card={card} />
                ))}
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseChart data={charts?.monthly_trend || []} />
            <DonutChart data={charts?.category_breakdown || []} />
          </div>

          {/* Top Merchants Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Secondary category details or highlights */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10 space-y-2">
                  <span className="text-xs uppercase font-bold tracking-widest text-indigo-300">
                    Smart Tip
                  </span>
                  <h3 className="text-lg font-bold">
                    Need deep insights into your spending anomalies?
                  </h3>
                  <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                    Our AI models continuously analyze transactions with Z-Score and Isolation Forest algorithms to pinpoint irregular expenses and recurring billing cycles.
                  </p>
                </div>
                <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl" />
              </div>
            </div>

            <TopMerchants merchants={charts?.top_merchants || []} />
          </div>
        </>
      )}
    </div>
  );
}

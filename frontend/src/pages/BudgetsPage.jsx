import React, { useState, useEffect } from 'react';
import BudgetProgressBar from '../components/budgets/BudgetProgressBar';
import EditBudgetModal from '../components/budgets/EditBudgetModal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import Card from '../components/common/Card';
import { endpoints } from '../services/api';
import { formatINR } from '../utils/formatters';
import { Plus, Calendar, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function BudgetsPage({ refreshTrigger }) {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, cRes] = await Promise.all([
        endpoints.getBudgets(currentMonth),
        endpoints.getCategories(),
      ]);
      setBudgets(bRes);
      setCategories(cRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth, refreshTrigger]);

  const handleSaveBudget = async (budgetData) => {
    try {
      await endpoints.saveBudget(budgetData);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Delete this budget limit?')) return;
    try {
      await endpoints.deleteBudget(id);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const openNewBudget = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const openEditBudget = (b) => {
    setEditingBudget(b);
    setIsModalOpen(true);
  };

  // Overall totals
  const totalLimit = budgets.reduce((acc, b) => acc + b.monthly_limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const overallPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const overBudgetCount = budgets.filter((b) => b.percentage >= 100).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Category Budgets & Thresholds
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set monthly spending caps per category and track alerts (Green &lt; 80%, Yellow 80-100%, Red &gt; 100%).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <button
            onClick={openNewBudget}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : (
        <>
          {/* Overall Monthly Budget Summary Bar */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Monthly Budget Target ({currentMonth})
                </span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatINR(totalSpent)}{' '}
                  <span className="text-sm font-normal text-slate-400">
                    of {formatINR(totalLimit)} allocated
                  </span>
                </div>
              </div>

              {overBudgetCount > 0 ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>{overBudgetCount} category is over limit!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>All category budgets within limits</span>
                </div>
              )}
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPercentage >= 100
                    ? 'bg-rose-500'
                    : overallPercentage >= 80
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>{overallPercentage.toFixed(1)}% total consumed</span>
              <span>
                {totalLimit > totalSpent
                  ? `${formatINR(totalLimit - totalSpent)} remaining`
                  : `${formatINR(totalSpent - totalLimit)} exceeded`}
              </span>
            </div>
          </Card>

          {/* Category Budgets Grid */}
          {budgets.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                No budgets set for {currentMonth}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Create limits for food, rent, shopping, and bills to stay in control of your expenditures.
              </p>
              <button
                onClick={openNewBudget}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm"
              >
                Create First Budget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {budgets.map((b) => (
                <BudgetProgressBar
                  key={b.id}
                  budget={b}
                  onEdit={openEditBudget}
                  onDelete={handleDeleteBudget}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit / Create Budget Modal */}
      <EditBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        budget={editingBudget}
        categories={categories}
        currentMonth={currentMonth}
        onSave={handleSaveBudget}
      />
    </div>
  );
}

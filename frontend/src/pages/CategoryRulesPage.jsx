import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { endpoints } from '../services/api';
import { getCategoryColor } from '../utils/formatters';
import { Tag, Plus, Trash2, Shield, Sparkles, AlertCircle } from 'lucide-react';

export default function CategoryRulesPage({ refreshTrigger }) {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('Food');
  const [error, setError] = useState(null);

  const fetchRulesAndCategories = async () => {
    try {
      setLoading(true);
      const [rRes, cRes] = await Promise.all([
        endpoints.getRules(),
        endpoints.getCategories(),
      ]);
      setRules(rRes);
      setCategories(cRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRulesAndCategories();
  }, [refreshTrigger]);

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    try {
      setError(null);
      await endpoints.createRule({
        keyword: newKeyword.trim().toLowerCase(),
        category: newCategory,
        priority: 2,
      });
      setNewKeyword('');
      fetchRulesAndCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await endpoints.deleteRule(id);
      fetchRulesAndCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const customRules = rules.filter((r) => r.is_custom);
  const defaultRules = rules.filter((r) => !r.is_custom);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Categorization Engine & Rules
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Smart merchant keyword mapping tuned for Indian payment gateways and feedback learning rules.
        </p>
      </div>

      {/* Add Custom Rule Form */}
      <Card title="Add Custom Categorization Rule" subtitle="Keywords match against transaction descriptions">
        <form onSubmit={handleAddRule} className="space-y-3">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Merchant / Description Keyword
              </label>
              <input
                type="text"
                required
                placeholder="e.g. blr-cafe, salon, gym, petrol"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Assign Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Keyword Rule</span>
            </button>
          </div>
        </form>
      </Card>

      {loading ? (
        <LoadingSkeleton count={2} />
      ) : (
        <div className="space-y-6">
          {/* Custom & Learned Rules */}
          <Card
            title={`Learned & Custom Rules (${customRules.length})`}
            subtitle="Rules generated from manual edits (Feedback Learning) or manually created"
          >
            {customRules.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                No custom rules yet. When you change any transaction's category in the transactions table, the engine will automatically learn it and save it here!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {customRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="w-3 h-3" />
                      </span>
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                          {rule.keyword}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          &rarr; {rule.category}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="Delete rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Built-in Indian Merchant Rules */}
          <Card
            title={`Built-in Indian Merchant Dictionary (${defaultRules.length} rules)`}
            subtitle="Pre-configured rules for Swiggy, Zomato, Uber, IRCTC, D-Mart, Electricity, etc."
          >
            <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto p-1">
              {defaultRules.map((rule) => (
                <span
                  key={rule.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 text-slate-700 dark:text-slate-300"
                >
                  <strong className="text-slate-900 dark:text-slate-100">{rule.keyword}</strong>
                  <span className="text-[10px] text-slate-400">&rarr;</span>
                  <span
                    className="font-medium text-[11px]"
                    style={{ color: getCategoryColor(rule.category) }}
                  >
                    {rule.category}
                  </span>
                </span>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

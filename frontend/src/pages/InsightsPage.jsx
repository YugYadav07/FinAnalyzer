import React, { useState, useEffect } from 'react';
import InsightCard from '../components/insights/InsightCard';
import AnomalyList from '../components/insights/AnomalyList';
import RecurringList from '../components/insights/RecurringList';
import ForecastCard from '../components/insights/ForecastCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { endpoints } from '../services/api';
import { Sparkles, Brain, Cpu } from 'lucide-react';

export default function InsightsPage({ refreshTrigger }) {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [forecast, setForecast] = useState(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const [cardsRes, anomRes, recRes, foreRes] = await Promise.all([
        endpoints.getInsightCards(),
        endpoints.getAnomalies(),
        endpoints.getRecurring(),
        endpoints.getForecast(),
      ]);
      setCards(cardsRes);
      setAnomalies(anomRes);
      setRecurring(recRes);
      setForecast(foreRes);
    } catch (err) {
      console.error('Insights error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [refreshTrigger]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Smart Insights & ML Analytics
            <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Brain className="w-5 h-5" />
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Z-Score anomaly detection, Isolation Forest outliers, interval-based recurring patterns, and Linear Regression forecasts.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <LoadingSkeleton count={3} />
        </div>
      ) : (
        <>
          {/* Plain English Insights Grid */}
          {cards.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                AI Summary & Highlights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {cards.map((c, i) => (
                  <InsightCard key={i} card={c} />
                ))}
              </div>
            </div>
          )}

          {/* Forecast Section */}
          <ForecastCard forecast={forecast} />

          {/* Anomalies and Recurring side-by-side or stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnomalyList anomalies={anomalies} />
            <RecurringList recurring={recurring} />
          </div>
        </>
      )}
    </div>
  );
}

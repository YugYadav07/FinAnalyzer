/**
 * Formatters for Indian Currency (INR), Dates, and Metrics.
 */

// Formatter for Indian Rupee with Indian number grouping (1,23,456.78)
export const formatINR = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '₹0.00';
  const num = Number(value);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
};

// Compact INR format (e.g. ₹1.2L, ₹45K)
export const formatCompactINR = (value) => {
  if (!value || isNaN(value)) return '₹0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  }
  return formatINR(value);
};

// Date formatter (DD MMM YYYY, e.g. 15 Apr 2025)
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

// Percentage formatter
export const formatPercent = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0%';
  return `${Number(val).toFixed(1)}%`;
};

// Category colors for badges and charts
export const CATEGORY_COLORS = {
  Food: '#f97316',
  Transport: '#3b82f6',
  Shopping: '#8b5cf6',
  Bills: '#06b6d4',
  Rent: '#ec4899',
  Entertainment: '#f59e0b',
  Health: '#10b981',
  Education: '#6366f1',
  Income: '#22c55e',
  Transfers: '#64748b',
  Other: '#94a3b8',
};

export const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || '#94a3b8';
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogIn, Eye, EyeOff, Mail, Lock, IndianRupee, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900" />

        {/* Animated orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <IndianRupee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                FinAnalyzer
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-indigo-200 border border-white/20">INR</span>
              </h1>
              <p className="text-xs text-indigo-200/70">Personal Finance AI</p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
            Master your
            <br />
            <span className="bg-gradient-to-r from-indigo-200 to-cyan-200 bg-clip-text text-transparent">
              financial future
            </span>
          </h2>
          <p className="text-indigo-100/70 text-base leading-relaxed max-w-md mb-10">
            AI-powered insights, anomaly detection, and spending forecasts — all running locally on your machine with zero cloud leakage.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {['Smart Categorization', 'Anomaly Detection', 'Spending Forecasts', 'Zero Cloud'].map((feature) => (
              <div key={feature} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-xs text-indigo-100">
                <Sparkles className="w-3 h-3 text-indigo-300" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Theme toggle */}
          <div className="flex justify-end mb-8">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <img
                src={darkMode ? "/light-mode.ico" : "/dark-mode.ico"}
                alt="Toggle theme"
                className="w-5 h-5"
              />
            </button>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                FinAnalyzer
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">INR</span>
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Personal Finance AI</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Sign in to your account to continue analyzing your finances
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-sm animate-in slide-in-from-top">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">New here?</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            id="go-to-register"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm border border-slate-200/80 dark:border-slate-700 transition-all duration-200"
          >
            Create an account
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Footer */}
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-8">
            Your data stays local. Zero cloud leakage. 🔒
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserPlus, Eye, EyeOff, Mail, Lock, User, IndianRupee, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-emerald-500' };
    return { level: 4, label: 'Strong', color: 'bg-indigo-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(email, fullName, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900" />

        {/* Animated orbs */}
        <div className="absolute top-32 right-20 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-16 w-72 h-72 bg-indigo-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 left-1/2 w-56 h-56 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
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
            Start your
            <br />
            <span className="bg-gradient-to-r from-violet-200 to-emerald-200 bg-clip-text text-transparent">
              wealth journey
            </span>
          </h2>
          <p className="text-indigo-100/70 text-base leading-relaxed max-w-md mb-10">
            Join thousands of users who've taken control of their financial health with AI-powered analysis — completely private, completely local.
          </p>

          {/* Benefits list */}
          <div className="space-y-4">
            {[
              'Automatic transaction categorization',
              'Spending anomaly alerts',
              'Monthly saving forecasts',
              'CSV import from any bank',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-sm text-indigo-100/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Theme toggle */}
          <div className="flex justify-end mb-6">
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
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Create account
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Get started with your free personal finance dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-sm animate-in slide-in-from-top">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            {/* Full Name */}
            <div>
              <label htmlFor="register-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="register-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
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
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          bar <= strength.level ? strength.color : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[11px] font-medium ${
                    strength.level <= 1 ? 'text-rose-500' :
                    strength.level <= 2 ? 'text-amber-500' :
                    strength.level <= 3 ? 'text-emerald-500' : 'text-indigo-500'
                  }`}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirm" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="register-confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter your password"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-sm ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-rose-300 dark:border-rose-700 focus:border-rose-500'
                      : confirmPassword && confirmPassword === password
                      ? 'border-emerald-300 dark:border-emerald-700 focus:border-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                  }`}
                />
                {confirmPassword && confirmPassword === password && (
                  <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="register-submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group mt-1"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Already have an account?</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            id="go-to-login"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm border border-slate-200/80 dark:border-slate-700 transition-all duration-200"
          >
            Sign in instead
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Footer */}
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-6">
            Your data stays local. Zero cloud leakage. 🔒
          </p>
        </div>
      </div>
    </div>
  );
}

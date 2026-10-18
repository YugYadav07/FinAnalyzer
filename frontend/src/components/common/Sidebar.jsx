import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ReceiptText,
  Sparkles,
  PieChart,
  Tag,
  IndianRupee,
  ShieldCheck,
  LogOut,
  Users,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ReceiptText },
  { name: 'Smart Insights', path: '/insights', icon: Sparkles },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Category Rules', path: '/rules', icon: Tag },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800/80">
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

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Card / User + Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-2.5 px-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/50 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Local SQLite DB</p>
              <p className="text-[11px] text-slate-400">Zero Cloud Leakage</p>
            </div>
          </div>

          <NavLink
            to="/developers"
            onClick={onClose}
            className={({ isActive }) =>
              `rounded-xl p-3 border flex items-center gap-2.5 transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/50'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/50 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20'
              }`
            }
          >
            <Users className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Meet Our Developers</p>
              <p className="text-[11px] text-slate-400">The team behind this app</p>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
}


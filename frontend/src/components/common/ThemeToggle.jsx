import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <img
        src={darkMode ? "/light-mode.ico" : "/dark-mode.ico"}
        alt={darkMode ? "Dark mode" : "Light mode"}
        className="w-5 h-5"
      />
    </button>
  );
}

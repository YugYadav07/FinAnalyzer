import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import UploadModal from './components/transactions/UploadModal';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import InsightsPage from './pages/InsightsPage';
import BudgetsPage from './pages/BudgetsPage';
import CategoryRulesPage from './pages/CategoryRulesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DevelopersPage from './pages/DevelopersPage';

/* -------------------------------------------------- */
/*  Protected wrapper: redirects to /login if no auth  */
/* -------------------------------------------------- */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/* -------------------------------------------------- */
/*  Guest route: redirects to / if already logged in   */
/* -------------------------------------------------- */
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-3 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

/* -------------------------------------------------- */
/*  Main app layout (sidebar + navbar + content)       */
/* -------------------------------------------------- */
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex">
      {/* Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenUpload={() => setUploadModalOpen(true)}
          onRefreshData={handleDataRefresh}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route
              path="/"
              element={<DashboardPage refreshTrigger={refreshTrigger} />}
            />
            <Route
              path="/transactions"
              element={
                <TransactionsPage
                  onOpenUpload={() => setUploadModalOpen(true)}
                  refreshTrigger={refreshTrigger}
                />
              }
            />
            <Route
              path="/insights"
              element={<InsightsPage refreshTrigger={refreshTrigger} />}
            />
            <Route
              path="/budgets"
              element={<BudgetsPage refreshTrigger={refreshTrigger} />}
            />
            <Route
              path="/rules"
              element={<CategoryRulesPage refreshTrigger={refreshTrigger} />}
            />
            <Route
              path="/developers"
              element={<DevelopersPage />}
            />
          </Routes>
        </main>
      </div>

      {/* Global CSV Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleDataRefresh}
      />
    </div>
  );
}

/* -------------------------------------------------- */
/*  Root App component                                 */
/* -------------------------------------------------- */
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth pages (guest only) */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

            {/* Protected app routes */}
            <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

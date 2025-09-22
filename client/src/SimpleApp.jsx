import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuthStore } from './store/useAuthStore';
import { useSettingsStore } from './store/useSettingsStore';

import Sidebar from './components/Sidebar';
import PWAInstallBanner from './components/PWAInstallBanner';
import SimpleNavbar from './components/SimpleNavbar';

import Dashboard from './pages/Dashboard.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import BudgetsPage from './pages/BudgetsPage.jsx';
import AccountsPage from './pages/AccountsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import SimpleLoginPage from './pages/SimpleLoginPage.jsx';
import SimpleSignupPage from './pages/SimpleSignupPage.jsx';

// Theme hook
function useTheme() {
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };
  return { toggleTheme };
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function SimpleApp() {
  const { user, isAuthenticated, initialize, isLoading } = useAuthStore();
  const { preferences } = useSettingsStore();
  const { toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth on app start
  useEffect(() => {
    console.log('🔥 APP - Initializing application...');
    initialize();
    setIsInitialized(true);
  }, [initialize]);

  // Handle mobile detection
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Show loading until initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }
  
  const isMinimal = ['/login', '/signup', '/landing'].includes(location.pathname);

  return (
    <div className="min-h-screen w-full font-sans flex bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {!isMinimal && isAuthenticated && (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          
          {/* Mobile Sidebar */}
          {isMobileSidebarOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
              </div>
            </>
          )}
        </>
      )}

      <div className="flex-1 flex min-h-screen flex-col">
        {!isMinimal && isAuthenticated && (
          <SimpleNavbar 
            user={user}
            onToggleTheme={toggleTheme}
            onToggleSidebar={() => setIsMobileSidebarOpen(true)}
            isMobile={isMobile}
          />
        )}

        <main className={isMinimal ? 'flex-1 p-0' : 'flex-1 p-4 md:p-6 lg:p-8'}>
          <Routes>
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />} 
            />
            
            <Route 
              path="/landing" 
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
            />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SimpleLoginPage />} 
            />
            <Route 
              path="/signup" 
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SimpleSignupPage />} 
            />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
            <Route path="/budgets" element={<ProtectedRoute><BudgetsPage /></ProtectedRoute>} />
            <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/landing"} replace />} />
          </Routes>
        </main>
      </div>
      
      <PWAInstallBanner />
      
      <ToastContainer
        position={isMobile ? "bottom-center" : "top-right"}
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={preferences?.theme === 'dark' ? 'dark' : 'light'}
        className={isMobile ? "!bottom-20" : ""}
      />
    </div>
  );
}

export default SimpleApp;
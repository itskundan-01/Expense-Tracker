import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ChevronDown, Bell, Menu, X, Loader2 } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuthStore } from './store/useAuthStore';
import { useSettingsStore } from './store/useSettingsStore';

import Sidebar from './components/Sidebar';
import PWAInstallBanner from './components/PWAInstallBanner';

import Dashboard from './pages/Dashboard.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import BudgetsPage from './pages/BudgetsPage.jsx';
import AccountsPage from './pages/AccountsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';

/* Theme hook: class-based dark mode with system fallback + persistence */
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

const Navbar = ({ user, onToggleTheme, onToggleSidebar, isMobile }) => (
  <header className="h-16 md:h-20 bg-white flex items-center justify-between px-4 md:px-8 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
    <div className="flex items-center space-x-4">
      {isMobile && (
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      <div className="hidden md:block">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Welcome back, {user.name}!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Here's your financial overview for today.</p>
      </div>
      <div className="md:hidden">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Expense Tracker</h2>
      </div>
    </div>
    
    <div className="flex items-center space-x-2 md:space-x-3">
      <button
        className="p-2 rounded-full bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50
                   dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 relative
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-600 dark:text-gray-300" />
        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500" />
      </button>

      <button
        onClick={onToggleTheme}
        className="hidden md:block px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50
                   dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        Toggle theme
      </button>

      <div className="flex items-center">
        <img src={user.avatarUrl} alt="User Avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
        <button
          className="ml-2 md:ml-3 flex items-center bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 rounded-lg px-2 md:px-3 py-1 md:py-2
                     dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span className="font-medium text-sm md:text-base hidden sm:block">{user.name}</span>
          <ChevronDown size={16} className="ml-1" />
        </button>
      </div>
    </div>
  </header>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  
  console.log('ProtectedRoute check:', { isAuthenticated, isLoading, user: user?.email });
  
  if (isLoading) {
    console.log('ProtectedRoute: Still loading, showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    console.log('ProtectedRoute: User is authenticated, showing protected content');
    return children;
  } else {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
};

function App() {
  const { user, isAuthenticated, initialize, isLoading } = useAuthStore();
  const { preferences } = useSettingsStore();
  const { toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Add logging to debug authentication state
  useEffect(() => {
    console.log('App state changed:', {
      isAuthenticated,
      isLoading,
      isInitializing,
      user: user ? `${user.firstName} ${user.lastName}` : null,
      location: location.pathname
    });
  }, [isAuthenticated, isLoading, isInitializing, user, location.pathname]);

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔥 APP - Initializing authentication...');
        const hasAuth = initialize();
        console.log('🔥 APP - Auth initialized:', hasAuth);
        
        // Test API connectivity
        try {
          const response = await fetch('/api/health');
          if (response.ok) {
            const health = await response.json();
            console.log('🔥 APP - Backend connectivity test: SUCCESS', health);
          } else {
            console.log('🔥 APP - Backend connectivity test:', {
              path: '/api/health',
              error: response.statusText,
              message: 'Access denied. Please provide valid authentication credentials.',
              status: response.status
            });
          }
        } catch (apiError) {
          console.error('🔥 APP - Backend connectivity failed:', apiError);
        }
      } catch (error) {
        console.error('🔥 APP - Failed to initialize auth:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    // Small delay to ensure proper initialization
    setTimeout(initializeAuth, 100);
  }, []); // No dependencies needed since initialize doesn't change

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

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Show loading screen during initial auth check
  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">Initializing application...</p>
        </div>
      </div>
    );
  }
  
  const mockUser = user ? {
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User',
    avatarUrl: user.profileImage || `https://placehold.co/40x40/E2E8F0/4A5568?text=${(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}`
  } : {
    name: 'User',
    avatarUrl: 'https://placehold.co/40x40/E2E8F0/4A5568?text=U'
  };
  
  const isMinimal =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/landing';

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen w-full font-sans flex bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100 overflow-x-hidden">
      {!isMinimal && (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          
          {/* Mobile Sidebar Overlay */}
          {isMobileSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}
          
          {/* Mobile Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ease-in-out ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="relative">
              <Sidebar />
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex-1 flex min-h-screen flex-col min-w-0">
        {!isMinimal && (
          <Navbar 
            user={mockUser} 
            onToggleTheme={toggleTheme}
            onToggleSidebar={toggleMobileSidebar}
            isMobile={isMobile}
          />
        )}

        <main className={isMinimal 
          ? 'flex-1 p-0' 
          : 'flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto min-h-0'
        }>
          <div className="w-full max-w-full">
            <Routes>
              {/* Default route - redirect based on auth status */}
              <Route 
                path="/" 
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />
                } 
              />

              {/* Public routes */}
              <Route 
                path="/landing" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
              />
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
              />
              <Route 
                path="/signup" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />} 
              />

              {/* Protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
              <Route path="/budgets" element={<ProtectedRoute><BudgetsPage /></ProtectedRoute>} />
              <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/landing"} replace />} />
            </Routes>
          </div>
        </main>
      </div>
      
      {/* PWA Install Banner */}
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

export default App;

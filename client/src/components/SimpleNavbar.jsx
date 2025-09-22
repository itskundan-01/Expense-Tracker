import React from 'react';
import { ChevronDown, Bell, Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Navbar = ({ user, onToggleTheme, onToggleSidebar, isMobile }) => {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
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
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Welcome back, {user?.firstName || user?.email || 'User'}!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Here's your financial overview for today.</p>
        </div>
        <div className="md:hidden">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Expense Tracker</h2>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-3">
        <button
          className="p-2 rounded-full bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 relative"
          aria-label="Notifications"
        >
          <Bell size={20} className="text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500" />
        </button>

        <button
          onClick={onToggleTheme}
          className="hidden md:block px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Toggle theme
        </button>

        <div className="flex items-center">
          <img 
            src={`https://placehold.co/40x40/E2E8F0/4A5568?text=${(user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}`} 
            alt="User Avatar" 
            className="w-8 h-8 md:w-10 md:h-10 rounded-full" 
          />
          <button
            onClick={handleLogout}
            className="ml-2 md:ml-3 flex items-center bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 rounded-lg px-2 md:px-3 py-1 md:py-2 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <span className="font-medium text-sm md:text-base hidden sm:block">
              {user?.firstName || 'User'}
            </span>
            <LogOut size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
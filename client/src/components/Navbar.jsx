import React from 'react';
import { ChevronDown, Bell } from 'lucide-react';

const Navbar = ({
  user = { name: 'Guest', avatarUrl: 'https://placehold.co/40x40/E2E8F0/4A5568?text=G' },
  onToggleTheme = () => {},
}) => (
  <header className="h-16 bg-white border-b flex items-center justify-between px-8
                     dark:bg-gray-900 dark:border-gray-800">
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Welcome back, {user.name}!</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">Here's your financial overview for today.</p>
    </div>
    <div className="flex items-center space-x-3">
      <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700
                         dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100" aria-label="Notifications">
        <Bell size={22} />
      </button>
      <button
        onClick={onToggleTheme}
        className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50
                   dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        Toggle theme
      </button>
      <div className="flex items-center">
        <img src={user.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full" />
        <button className="ml-3 flex items-center text-gray-700 font-semibold dark:text-gray-200">
          <span>{user.name}</span>
          <ChevronDown size={20} className="ml-1" />
        </button>
      </div>
    </div>
  </header>
);

export default Navbar;

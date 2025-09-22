import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, BarChart2, Settings, Landmark, BarChartHorizontal, LogOut, PieChart } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate(); // for logout navigation [React Router]
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Wallet, label: 'Transactions', to: '/transactions' },
    { icon: BarChart2, label: 'Budgets', to: '/budgets' },
    { icon: Landmark, label: 'Accounts', to: '/accounts' },
    { icon: PieChart, label: 'Reports', to: '/reports' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg flex-shrink-0 flex flex-col sticky top-0 min-h-screen dark:bg-gray-900">
      {/* logo */}
      <div className="h-20 flex items-center justify-center">
        <BarChartHorizontal size={28} className="text-indigo-600" />
        <h1 className="text-2xl font-bold ml-2 text-gray-800 dark:text-gray-100">FinTrack</h1>
      </div>

      {/* main nav */}
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400'
                      : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400'
                  }`
                }
              >
                <item.icon size={22} />
                <span className="ml-4 font-semibold">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* logout pinned to bottom */}
      <div className="mt-auto p-4">
        <button
          onClick={() => navigate('/landing', { replace: true })}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg
                     text-gray-600 hover:bg-gray-100 hover:text-gray-900
                     dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                     focus-visible:ring-offset-2 ring-offset-white dark:focus-visible:ring-offset-gray-900"
          aria-label="Log out"
        >
          <LogOut size={18} />
          <span className="font-semibold">Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

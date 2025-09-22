import React from 'react';
import { Landmark, PlusCircle, MoreVertical } from 'lucide-react';

// INR formatter (₹ with Indian digit grouping, 2 decimals)
const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

// Mock data for user's accounts (keep as numbers)
const mockAccounts = [
  { id: 1, name: 'Checking Account', type: 'Checking', balance: 4250.75, lastFour: '...1234' },
  { id: 2, name: 'Savings Account', type: 'Savings', balance: 15500.2, lastFour: '...5678' },
  { id: 3, name: 'Credit Card', type: 'Credit', balance: -850.4, lastFour: '...9876' },
  { id: 4, name: 'Investment Portfolio', type: 'Investment', balance: 22730.0, lastFour: '...4321' },
];

const AccountCard = ({ account }) => {
  const isNegative = account.balance < 0;
  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 flex justify-between items-center
                    dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center">
        <div className="bg-indigo-100 p-3 rounded-full mr-4">
          <Landmark className="text-indigo-600" size={24} />
        </div>
        <div>
          <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{account.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {account.type} • {account.lastFour}
          </p>
        </div>
      </div>
      <div className="text-right flex items-center">
        <p className={`text-xl font-semibold mr-4 ${isNegative ? 'text-red-500' : 'text-gray-800 dark:text-gray-100'}`}>
          {formatINR(account.balance)}
        </p>
        <button className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-200">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};

const AccountsPage = () => {
  return (
    <div className="p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Your Accounts</h3>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors">
          <PlusCircle size={18} className="mr-2" />
          Add New Account
        </button>
      </div>
      <div className="space-y-4">
        {mockAccounts.map((acc) => (
          <AccountCard key={acc.id} account={acc} />
        ))}
      </div>
    </div>
  );
};

export default AccountsPage;

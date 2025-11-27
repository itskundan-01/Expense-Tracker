import React, { useEffect, useState } from 'react';
import { Landmark, PlusCircle, MoreVertical, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { useAccountStore } from '../store/useAccountStore';
import AccountForm from '../components/AccountForm';

// INR formatter (₹ with Indian digit grouping, 2 decimals)
const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

// Account type display names
const TYPE_LABELS = {
  checking: 'Checking',
  savings: 'Savings',
  credit: 'Credit Card',
  investment: 'Investment',
  cash: 'Cash',
};

// Account type colors
const TYPE_COLORS = {
  checking: 'bg-blue-100 text-blue-600',
  savings: 'bg-green-100 text-green-600',
  credit: 'bg-red-100 text-red-600',
  investment: 'bg-purple-100 text-purple-600',
  cash: 'bg-yellow-100 text-yellow-600',
};

const AccountCard = ({ account, onDelete }) => {
  const isNegative = parseFloat(account.balance) < 0;
  const [showMenu, setShowMenu] = useState(false);
  
  const lastFour = account.accountNumber 
    ? `...${account.accountNumber.slice(-4)}` 
    : '';

  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 flex justify-between items-center
                    dark:bg-gray-900 dark:border-gray-800 relative">
      <div className="flex items-center">
        <div className={`p-3 rounded-full mr-4 ${TYPE_COLORS[account.type] || 'bg-gray-100 text-gray-600'}`}>
          <Landmark size={24} />
        </div>
        <div>
          <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{account.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {TYPE_LABELS[account.type] || account.type}
            {lastFour && ` • ${lastFour}`}
            {account.bankName && ` • ${account.bankName}`}
          </p>
        </div>
      </div>
      <div className="text-right flex items-center">
        <p className={`text-xl font-semibold mr-4 ${isNegative ? 'text-red-500' : 'text-gray-800 dark:text-gray-100'}`}>
          {formatINR(account.balance)}
        </p>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-200 p-1"
          >
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-20 py-1 min-w-32">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(account.id);
                  }}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AccountsPage = () => {
  const { accounts, isLoading, error, fetchAccounts, createAccount, deleteAccount, getTotalBalance } = useAccountStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleCreateAccount = async (accountData) => {
    await createAccount(accountData);
  };

  const handleDeleteAccount = async (id) => {
    if (deleteConfirm === id) {
      await deleteAccount(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Auto-clear confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const totalBalance = getTotalBalance();

  return (
    <div className="p-6 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Your Accounts</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total Balance: <span className={`font-semibold ${totalBalance < 0 ? 'text-red-500' : 'text-green-600'}`}>
              {formatINR(totalBalance)}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => fetchAccounts()}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh accounts"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Add New Account
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg mb-4 flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && accounts.length === 0 && (
        <div className="text-center py-12">
          <RefreshCw size={32} className="animate-spin mx-auto text-indigo-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading accounts...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && accounts.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Landmark size={48} className="mx-auto text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No accounts yet</h4>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add your first account to start tracking your finances
          </p>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg inline-flex items-center hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Add Your First Account
          </button>
        </div>
      )}

      {/* Account list */}
      <div className="space-y-4">
        {accounts.map((account) => (
          <div key={account.id}>
            <AccountCard account={account} onDelete={handleDeleteAccount} />
            {deleteConfirm === account.id && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
                <span className="text-red-700 dark:text-red-300 text-sm">
                  Are you sure you want to delete this account?
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Account Form Modal */}
      <AccountForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateAccount}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AccountsPage;

import React, { useState } from 'react';
import { PlusCircle, ArrowUp, ArrowDown, Filter, Search, Edit2, Trash2 } from 'lucide-react';

import { useTransactionStore } from '../store/useTransactionStore';
import { useAccountStore } from '../store/useAccountStore';
import { formatINR } from '../utils/currency';
import { formatRelativeDate } from '../utils/dateUtils';
import { showSuccess, showError } from '../utils/notifications';
import TransactionForm from '../components/TransactionForm';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';



const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  const { categories } = useTransactionStore();
  const { accounts } = useAccountStore();
  
  const category = categories.find(c => c.id === transaction.categoryId);
  const account = accounts.find(a => a.id === transaction.accountId);

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50
                    dark:border-gray-800 dark:hover:bg-gray-800 group">
      <div className="flex items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
            transaction.type === 'income' 
              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
              : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
          }`}
        >
          {transaction.type === 'income' ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            {category && <span className="text-lg">{category.icon}</span>}
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {category?.name || 'Unknown Category'}
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-400 dark:text-gray-500">
            <span>{account?.name || 'Unknown Account'}</span>
            <span>{formatRelativeDate(transaction.date)}</span>
            {transaction.tags && transaction.tags.length > 0 && (
              <span className="text-indigo-600 dark:text-indigo-400">
                {transaction.tags.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-gray-800 dark:text-gray-100'}`}>
            {transaction.type === 'income' 
              ? `+${formatINR(transaction.amount)}` 
              : `-${formatINR(Math.abs(transaction.amount))}`
            }
          </p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(transaction)}
          >
            <Edit2 size={14} />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(transaction.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

const TransactionsPage = () => {
  const { transactions, deleteTransaction, getFilteredTransactions, filters, setFilters } = useTransactionStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = getFilteredTransactions().filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        deleteTransaction(transactionId);
        showSuccess('Transaction deleted successfully');
      } catch (error) {
        showError('Failed to delete transaction');
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6">
      <Card
        title="All Transactions"
        subtitle={`${filteredTransactions.length} transactions found`}
        actions={
          <Button
            onClick={() => setIsFormOpen(true)}
            variant="primary"
          >
            <PlusCircle size={18} className="mr-2" />
            Add Transaction
          </Button>
        }
      >
        {/* Search and Filter Bar */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} className="mr-2" />
              Filters
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters({ startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters({ endDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600"
                  value={filters.type || ''}
                  onChange={(e) => setFilters({ type: e.target.value || null })}
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">
              {searchTerm ? 'No transactions found matching your search' : 'No transactions yet'}
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {!searchTerm && "Start by adding your first transaction"}
            </p>
          </div>
        ) : (
          <div className="border-t border-gray-200 dark:border-gray-800 -mx-6">
            {filteredTransactions
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            }
          </div>
        )}
      </Card>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        transaction={editingTransaction}
      />
    </div>
  );
};

export default TransactionsPage;

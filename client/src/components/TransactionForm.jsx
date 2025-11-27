import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus, Minus } from 'lucide-react';
import Select from 'react-select';

import Modal from './UI/Modal';
import Button from './UI/Button';
import Input from './UI/Input';
import { useTransactionStore } from '../store/useTransactionStore';
import { useAccountStore } from '../store/useAccountStore';
import { formatCurrency } from '../utils/currency';
import { showSuccess, showError } from '../utils/notifications';

const TransactionForm = ({ isOpen, onClose, transaction = null }) => {
  const { addTransaction, updateTransaction, categories, fetchCategories } = useTransactionStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactionType, setTransactionType] = useState('expense');
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: transaction || {
      type: 'expense',
      amount: '',
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
      categoryId: '',
      accountId: '',
      notes: '',
    },
  });

  const watchedType = watch('type');

  // Fetch categories and accounts when form opens
  React.useEffect(() => {
    if (isOpen) {
      // Fetch categories if empty
      if (!categories || categories.length === 0) {
        fetchCategories();
      }
      // Fetch accounts if empty
      if (!accounts || accounts.length === 0) {
        fetchAccounts();
      }
    }
  }, [isOpen, categories, accounts, fetchCategories, fetchAccounts]);

  React.useEffect(() => {
    if (transaction && isOpen) {
      // Reset form with transaction values when editing
      reset({
        type: transaction.type || 'expense',
        amount: transaction.amount || '',
        description: transaction.description || '',
        transactionDate: transaction.transactionDate || transaction.date || new Date().toISOString().split('T')[0],
        categoryId: transaction.categoryId || '',
        accountId: transaction.accountId || '',
        notes: transaction.notes || '',
      });
      
      setTransactionType(transaction.type || 'expense');
      
      const category = categories.find(c => c.id === transaction.categoryId);
      const account = accounts.find(a => a.id === transaction.accountId);
      
      if (category) {
        setSelectedCategory({
          value: category.id,
          label: category.name,
          color: category.color,
          icon: category.icon,
        });
      }
      
      if (account) {
        setSelectedAccount({
          value: account.id,
          label: account.name,
          type: account.type,
        });
      }
    } else if (!transaction && isOpen) {
      // Reset to defaults for new transaction
      reset({
        type: 'expense',
        amount: '',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
        categoryId: '',
        accountId: '',
        notes: '',
      });
      setTransactionType('expense');
      setSelectedCategory(null);
      setSelectedAccount(null);
    }
  }, [transaction, categories, accounts, isOpen, reset]);

  const filteredCategories = categories
    .filter(cat => cat.type === transactionType)
    .map(cat => ({
      value: cat.id,
      label: cat.name,
      color: cat.color,
      icon: cat.icon,
    }));

  const accountOptions = accounts
    .filter(acc => acc.isActive !== false)
    .map(acc => ({
      value: acc.id,
      label: `${acc.name} (${formatCurrency(acc.balance, acc.currency || 'INR')})`,
      type: acc.type,
    }));

  const onSubmit = async (data) => {
    try {
      if (!selectedCategory) {
        showError('Please select a category');
        return;
      }

      if (!selectedAccount) {
        showError('Please select an account');
        return;
      }

      const transactionData = {
        description: data.description,
        amount: parseFloat(data.amount),
        type: data.type,
        categoryId: selectedCategory.value,
        accountId: selectedAccount.value,
        transactionDate: data.transactionDate,
        notes: data.notes || null,
      };

      console.log('📤 Sending transaction data:', transactionData);

      if (transaction) {
        await updateTransaction(transaction.id, transactionData);
        showSuccess('Transaction updated successfully');
      } else {
        await addTransaction(transactionData);
        showSuccess('Transaction added successfully');
      }
      
      // Refresh accounts to get updated balances
      fetchAccounts();
      
      handleClose();
    } catch (error) {
      console.error('Transaction error:', error);
      showError(error.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleClose = () => {
    reset();
    setSelectedCategory(null);
    setSelectedAccount(null);
    setTransactionType('expense');
    onClose();
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #6366f1' : 'none',
      '&:hover': {
        borderColor: '#6366f1',
      },
    }),
    option: (base, { data, isSelected, isFocused }) => ({
      ...base,
      backgroundColor: isSelected
        ? '#6366f1'
        : isFocused
        ? '#f3f4f6'
        : 'white',
      ':before': data.icon ? {
        content: `"${data.icon}"`,
        marginRight: '8px',
      } : {},
    }),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={transaction ? 'Edit Transaction' : 'Add New Transaction'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transaction Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="expense"
                {...register('type')}
                onChange={(e) => {
                  setValue('type', e.target.value);
                  setTransactionType(e.target.value);
                  setSelectedCategory(null);
                }}
                className="mr-2"
              />
              <Minus className="w-4 h-4 text-red-500 mr-1" />
              <span>Expense</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="income"
                {...register('type')}
                onChange={(e) => {
                  setValue('type', e.target.value);
                  setTransactionType(e.target.value);
                  setSelectedCategory(null);
                }}
                className="mr-2"
              />
              <Plus className="w-4 h-4 text-green-500 mr-1" />
              <span>Income</span>
            </label>
          </div>
        </div>

        {/* Amount */}
        <Input
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          required
          {...register('amount', {
            required: 'Amount is required',
            min: { value: 0.01, message: 'Amount must be greater than 0' },
          })}
          error={errors.amount?.message}
        />

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={filteredCategories}
            styles={customSelectStyles}
            placeholder="Select a category"
            formatOptionLabel={(option) => (
              <div className="flex items-center">
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </div>
            )}
          />
        </div>

        {/* Account - Required for balance tracking */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Account *
          </label>
          {accounts.length === 0 ? (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
              No accounts found. Please add an account first from the Accounts page.
            </div>
          ) : (
            <Select
              value={selectedAccount}
              onChange={setSelectedAccount}
              options={accountOptions}
              styles={customSelectStyles}
              placeholder="Select an account"
            />
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Select the account for this transaction. Balance will be updated automatically.
          </p>
        </div>

        {/* Description */}
        <Input
          label="Description"
          placeholder="Enter transaction description"
          required
          {...register('description', {
            required: 'Description is required',
          })}
          error={errors.description?.message}
        />

        {/* Date */}
        <Input
          label="Date"
          type="date"
          required
          {...register('transactionDate', {
            required: 'Date is required',
          })}
          error={errors.transactionDate?.message}
        />

        {/* Notes */}
        <Input
          label="Notes"
          placeholder="Enter additional notes (optional)"
          {...register('notes')}
          helper="Optional: Add notes for more details"
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            variant="primary"
          >
            {transaction ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionForm;
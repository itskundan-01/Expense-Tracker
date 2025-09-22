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
  const { addTransaction, updateTransaction, categories } = useTransactionStore();
  const { accounts } = useAccountStore();
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
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
      accountId: '',
      tags: '',
    },
  });

  const watchedType = watch('type');

  React.useEffect(() => {
    if (transaction) {
      setTransactionType(transaction.type);
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
    }
  }, [transaction, categories, accounts]);

  const filteredCategories = categories
    .filter(cat => cat.type === transactionType)
    .map(cat => ({
      value: cat.id,
      label: cat.name,
      color: cat.color,
      icon: cat.icon,
    }));

  const accountOptions = accounts
    .filter(acc => acc.isActive)
    .map(acc => ({
      value: acc.id,
      label: `${acc.name} (${formatCurrency(acc.balance, acc.currency)})`,
      type: acc.type,
    }));

  const onSubmit = async (data) => {
    try {
      if (!selectedCategory || !selectedAccount) {
        showError('Please select both category and account');
        return;
      }

      const transactionData = {
        ...data,
        amount: parseFloat(data.amount),
        categoryId: selectedCategory.value,
        accountId: selectedAccount.value,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      if (transaction) {
        updateTransaction(transaction.id, transactionData);
        showSuccess('Transaction updated successfully');
      } else {
        addTransaction(transactionData);
        showSuccess('Transaction added successfully');
      }
      
      handleClose();
    } catch (error) {
      showError('Failed to save transaction');
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

        {/* Account */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Account *
          </label>
          <Select
            value={selectedAccount}
            onChange={setSelectedAccount}
            options={accountOptions}
            styles={customSelectStyles}
            placeholder="Select an account"
          />
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
          {...register('date', {
            required: 'Date is required',
          })}
          error={errors.date?.message}
        />

        {/* Tags */}
        <Input
          label="Tags"
          placeholder="Enter tags separated by commas"
          {...register('tags')}
          helper="Optional: Add tags for better organization"
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
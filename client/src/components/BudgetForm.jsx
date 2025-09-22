import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Select from 'react-select';

import Modal from './UI/Modal';
import Button from './UI/Button';
import Input from './UI/Input';
import { useBudgetStore } from '../store/useBudgetStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { formatCurrency } from '../utils/currency';
import { showSuccess, showError } from '../utils/notifications';

const BudgetForm = ({ isOpen, onClose, budget = null }) => {
  const { addBudget, updateBudget } = useBudgetStore();
  const { categories } = useTransactionStore();
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: budget || {
      name: '',
      amount: '',
      categoryId: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      alertThreshold: 80,
    },
  });

  React.useEffect(() => {
    if (budget) {
      const category = categories.find(c => c.id === budget.categoryId);
      if (category) {
        setSelectedCategory({
          value: category.id,
          label: category.name,
          color: category.color,
          icon: category.icon,
        });
      }
    }
  }, [budget, categories]);

  const expenseCategories = categories
    .filter(cat => cat.type === 'expense')
    .map(cat => ({
      value: cat.id,
      label: cat.name,
      color: cat.color,
      icon: cat.icon,
    }));

  const onSubmit = async (data) => {
    try {
      if (!selectedCategory) {
        showError('Please select a category');
        return;
      }

      const budgetData = {
        ...data,
        amount: parseFloat(data.amount),
        categoryId: selectedCategory.value,
        alertThreshold: parseInt(data.alertThreshold),
        name: data.name || selectedCategory.label,
      };

      if (budget) {
        updateBudget(budget.id, budgetData);
        showSuccess('Budget updated successfully');
      } else {
        addBudget(budgetData);
        showSuccess('Budget created successfully');
      }
      
      handleClose();
    } catch (error) {
      showError('Failed to save budget');
    }
  };

  const handleClose = () => {
    reset();
    setSelectedCategory(null);
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
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={budget ? 'Edit Budget' : 'Create New Budget'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Budget Name */}
        <Input
          label="Budget Name"
          placeholder="Enter budget name (optional)"
          {...register('name')}
          helper="Leave empty to use category name"
        />

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={expenseCategories}
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

        {/* Budget Amount */}
        <Input
          label="Budget Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          required
          {...register('amount', {
            required: 'Budget amount is required',
            min: { value: 0.01, message: 'Amount must be greater than 0' },
          })}
          error={errors.amount?.message}
        />

        {/* Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Budget Period
          </label>
          <select
            {...register('period')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* Start Date */}
        <Input
          label="Start Date"
          type="date"
          required
          {...register('startDate', {
            required: 'Start date is required',
          })}
          error={errors.startDate?.message}
        />

        {/* Alert Threshold */}
        <div>
          <Input
            label="Alert Threshold (%)"
            type="number"
            min="1"
            max="100"
            placeholder="80"
            {...register('alertThreshold', {
              min: { value: 1, message: 'Threshold must be at least 1%' },
              max: { value: 100, message: 'Threshold cannot exceed 100%' },
            })}
            error={errors.alertThreshold?.message}
            helper="Get notified when spending reaches this percentage"
          />
        </div>

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
            {budget ? 'Update Budget' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetForm;
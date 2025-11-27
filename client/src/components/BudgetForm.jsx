import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Modal from './UI/Modal';
import Button from './UI/Button';
import Input from './UI/Input';
import { useBudgetStore } from '../store/useBudgetStore';
import { categoriesAPI } from '../api/endpoints';
import { showSuccess, showError } from '../utils/notifications';

const BudgetForm = ({ isOpen, onClose, budget = null }) => {
  const { addBudget, updateBudget } = useBudgetStore();
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: budget || {
      name: '',
      amount: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      alertThreshold: 80,
    },
  });

  // Fetch categories directly from API when form opens
  useEffect(() => {
    const loadCategories = async () => {
      if (!isOpen) return;
      
      setLoadingCategories(true);
      try {
        const data = await categoriesAPI.getAll();
        console.log('📦 BudgetForm - Raw categories from API:', data);
        
        // Handle both array and wrapped response
        const categoriesData = Array.isArray(data) ? data : (data?.data || []);
        console.log('📦 BudgetForm - Processed categories:', categoriesData);
        
        setCategories(categoriesData);
        
        // If editing, set the selected category
        if (budget && budget.categoryId) {
          setSelectedCategoryId(String(budget.categoryId));
        }
      } catch (error) {
        console.error('📦 BudgetForm - Failed to load categories:', error);
        showError('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, [isOpen, budget]);

  // Filter for expense categories only
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  console.log('📦 BudgetForm - Expense categories:', expenseCategories);

  const onSubmit = async (data) => {
    try {
      if (!selectedCategoryId) {
        showError('Please select a category');
        return;
      }

      const selectedCategory = categories.find(c => String(c.id) === selectedCategoryId);
      
      const budgetData = {
        ...data,
        amount: parseFloat(data.amount),
        categoryId: parseInt(selectedCategoryId),
        alertThreshold: parseInt(data.alertThreshold),
        name: data.name || selectedCategory?.name || 'Budget',
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
      console.error('Failed to save budget:', error);
      showError('Failed to save budget');
    }
  };

  const handleClose = () => {
    reset();
    setSelectedCategoryId('');
    onClose();
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
          {loadingCategories ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
              Loading categories...
            </div>
          ) : (
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              required
            >
              <option value="">Select a category</option>
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          )}
          {expenseCategories.length === 0 && !loadingCategories && (
            <p className="mt-1 text-sm text-red-500">
              No expense categories found. Please create categories first.
            </p>
          )}
        </div>

        {/* Budget Amount */}
        <Input
          label="Budget Amount *"
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
            variant="primary"
            loading={isSubmitting}
          >
            {budget ? 'Update Budget' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetForm;

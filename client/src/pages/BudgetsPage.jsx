import React, { useState, useEffect } from 'react';
import { PlusCircle, Target, AlertTriangle, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

import { useBudgetStore } from '../store/useBudgetStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { formatINR } from '../utils/currency';
import { showSuccess, showError } from '../utils/notifications';
import BudgetForm from '../components/BudgetForm';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const { categories } = useTransactionStore();
  const category = categories.find(c => c.id === budget.categoryId);
  const progress = Math.min((budget.spent / budget.amount) * 100, 100);
  const isOverBudget = budget.spent > budget.amount;
  const isNearLimit = progress >= budget.alertThreshold;

  return (
    <Card hover className="group">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            {category && <span className="text-2xl">{category.icon}</span>}
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-100 text-lg">
                {budget.name || category?.name || 'Unknown Category'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {budget.period} budget
              </p>
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(budget)}>
              <Edit2 size={14} />
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDelete(budget.id)}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        {/* Amount and Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Spent</span>
            <div className="text-right">
              <span className={`font-bold text-lg ${
                isOverBudget ? 'text-red-500' : 'text-gray-800 dark:text-gray-100'
              }`}>
                {formatINR(budget.spent)}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                / {formatINR(budget.amount)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all ${
                isOverBudget 
                  ? 'bg-red-500' 
                  : isNearLimit 
                  ? 'bg-yellow-500' 
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Status Messages */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {progress.toFixed(1)}% used
            </span>
            {isOverBudget && (
              <div className="flex items-center space-x-1 text-red-500">
                <AlertTriangle size={12} />
                <span className="text-xs">Over budget!</span>
              </div>
            )}
            {!isOverBudget && isNearLimit && (
              <div className="flex items-center space-x-1 text-yellow-600">
                <AlertTriangle size={12} />
                <span className="text-xs">Near limit</span>
              </div>
            )}
          </div>

          {/* Remaining Amount */}
          <div className="mt-2 text-sm">
            {isOverBudget ? (
              <p className="text-red-600 dark:text-red-400">
                Exceeded by {formatINR(budget.spent - budget.amount)}
              </p>
            ) : (
              <p className="text-green-600 dark:text-green-400">
                {formatINR(budget.amount - budget.spent)} remaining
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

const BudgetsPage = () => {
  const { budgets, deleteBudget, updateBudgetSpending } = useBudgetStore();
  const { transactions, categories, fetchCategories } = useTransactionStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Fetch categories when component mounts
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  useEffect(() => {
    // Update budget spending when component mounts or transactions change
    updateBudgetSpending(transactions);
  }, [transactions, updateBudgetSpending]);

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleDelete = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        deleteBudget(budgetId);
        showSuccess('Budget deleted successfully');
      } catch (error) {
        showError('Failed to delete budget');
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBudget(null);
  };

  const overBudgetCount = budgets.filter(b => b.spent > b.amount).length;
  const nearLimitCount = budgets.filter(b => 
    (b.spent / b.amount) * 100 >= b.alertThreshold && b.spent <= b.amount
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Budgets</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {budgets.length}
                </p>
              </div>
              <Target className="w-8 h-8 text-indigo-600" />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Over Budget</p>
                <p className="text-2xl font-semibold text-red-600">
                  {overBudgetCount}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Near Limit</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {nearLimitCount}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Main Budgets Section */}
      <Card
        title="Your Budgets"
        subtitle={budgets.length > 0 ? `${budgets.length} budgets created` : undefined}
        actions={
          <Button onClick={() => setIsFormOpen(true)} variant="primary">
            <PlusCircle size={18} className="mr-2" />
            Create New Budget
          </Button>
        }
      >
        {budgets.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No budgets yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first budget to start managing your expenses
            </p>
            <Button onClick={() => setIsFormOpen(true)} variant="primary">
              <PlusCircle size={18} className="mr-2" />
              Create Your First Budget
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 -mx-6 -mb-6">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </Card>

      <BudgetForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        budget={editingBudget}
      />
    </div>
  );
};

export default BudgetsPage;

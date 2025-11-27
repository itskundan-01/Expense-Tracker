import React, { useState } from 'react';
import { X } from 'lucide-react';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'investment', label: 'Investment' },
  { value: 'cash', label: 'Cash' },
];

const AccountForm = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    balance: '',
    currency: 'INR',
    bankName: '',
    accountNumber: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Account name must be at least 2 characters';
    }
    if (!formData.type) {
      newErrors.type = 'Account type is required';
    }
    if (formData.balance === '' || formData.balance === null) {
      newErrors.balance = 'Initial balance is required';
    } else if (isNaN(parseFloat(formData.balance))) {
      newErrors.balance = 'Balance must be a valid number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const accountData = {
      name: formData.name.trim(),
      type: formData.type,
      balance: parseFloat(formData.balance),
      currency: formData.currency || 'INR',
      bankName: formData.bankName.trim() || null,
      accountNumber: formData.accountNumber.trim() || null,
      description: formData.description.trim() || null,
    };

    try {
      await onSubmit(accountData);
      // Reset form on success
      setFormData({
        name: '',
        type: 'checking',
        balance: '',
        currency: 'INR',
        bankName: '',
        accountNumber: '',
        description: '',
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating account:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to create account' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Add New Account
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {errors.submit && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., My Savings Account"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-red-500 text-xs mt-1">{errors.type}</p>
            )}
          </div>

          {/* Initial Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Initial Balance *
            </label>
            <input
              type="number"
              name="balance"
              value={formData.balance}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                ${errors.balance ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.balance && (
              <p className="text-red-500 text-xs mt-1">{errors.balance}</p>
            )}
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              For credit cards, enter negative balance if you owe money
            </p>
          </div>

          {/* Bank Name (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bank Name (Optional)
            </label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="e.g., State Bank of India"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Account Number (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Number (Optional)
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Last 4 digits or full number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Additional notes about this account"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
                dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;

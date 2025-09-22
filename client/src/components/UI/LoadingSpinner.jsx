import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 ${sizes[size]}`} />
    </div>
  );
};

export const LoadingCard = ({ title = 'Loading...', className = '' }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 p-6 ${className}`}>
    <div className="flex items-center justify-center space-x-3">
      <LoadingSpinner size="md" />
      <span className="text-gray-600 dark:text-gray-400">{title}</span>
    </div>
  </div>
);

export const LoadingOverlay = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 flex items-center space-x-3">
      <LoadingSpinner size="lg" />
      <span className="text-gray-900 dark:text-gray-100 text-lg">{message}</span>
    </div>
  </div>
);

export default LoadingSpinner;
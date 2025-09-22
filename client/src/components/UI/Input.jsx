import React from 'react';

const Input = ({
  label,
  error,
  helper,
  type = 'text',
  className = '',
  required = false,
  ...props
}) => {
  const inputClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
    dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-300 dark:text-gray-100
    ${error 
      ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 text-gray-900'
    } ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={inputClasses}
        {...props}
      />
      {helper && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helper}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;
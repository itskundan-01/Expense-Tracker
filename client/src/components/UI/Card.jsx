import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  actions, 
  className = '',
  hover = false,
  ...props 
}) => {
  const cardClasses = `bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 ${className}`;
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';
  
  const CardComponent = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { y: -2 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  } : {};

  return (
    <CardComponent 
      className={`${cardClasses} ${hoverClasses}`}
      {...motionProps}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </CardComponent>
  );
};

export default Card;
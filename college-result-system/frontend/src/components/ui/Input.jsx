import React from 'react';

const Input = ({ 
  label, 
  error, 
  id, 
  className = '', 
  wrapperClassName = '',
  type = 'text',
  icon,
  ...props 
}) => {
  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm 
            focus:ring-brand focus:border-brand sm:text-sm 
            disabled:bg-gray-50 disabled:text-gray-500
            transition-colors duration-200 py-3
            ${icon ? 'pl-10' : 'px-4'}
            ${error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600 animate-fade-in">{error}</p>}
    </div>
  );
};

export default Input;

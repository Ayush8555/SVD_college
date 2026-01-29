import React, { useState, useRef, useEffect } from 'react';

/**
 * Enhanced Input Component
 * - Animated label float
 * - Focus glow effect
 * - Error shake animation
 * - Success state
 * - Improved accessibility
 */
const Input = ({ 
  label, 
  error, 
  success,
  id, 
  className = '', 
  wrapperClassName = '',
  type = 'text',
  icon,
  rightIcon,
  onFocus,
  onBlur,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
  const inputRef = useRef(null);
  const [showError, setShowError] = useState(false);

  // Trigger error shake animation
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    onBlur?.(e);
  };

  const handleChange = (e) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  const getBorderColor = () => {
    if (error) return 'border-red-400 focus-within:border-red-500';
    if (success) return 'border-green-400 focus-within:border-green-500';
    if (isFocused) return 'border-primary-500';
    return 'border-gray-300 hover:border-gray-400';
  };

  const getRingColor = () => {
    if (error) return 'ring-red-500/20';
    if (success) return 'ring-green-500/20';
    return 'ring-primary-500/20';
  };

  return (
    <div className={`w-full ${wrapperClassName}`}>
      <div 
        className={`
          relative rounded-lg transition-all duration-200
          ${isFocused ? `ring-4 ${getRingColor()}` : ''}
          ${showError ? 'animate-shake' : ''}
        `}
      >
        {/* Floating label */}
        {label && (
          <label 
            htmlFor={id} 
            className={`
              absolute left-3 transition-all duration-200 pointer-events-none z-10
              ${icon ? 'left-10' : 'left-3'}
              ${(isFocused || hasValue) 
                ? '-top-2.5 text-xs bg-white px-1 font-medium' 
                : 'top-1/2 -translate-y-1/2 text-sm'
              }
              ${error ? 'text-red-500' : isFocused ? 'text-primary-600' : 'text-gray-500'}
            `}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className={`
          relative flex items-center rounded-lg border-2 bg-white
          transition-colors duration-200
          ${getBorderColor()}
        `}>
          {/* Left icon */}
          {icon && (
            <div className={`
              absolute left-3 flex items-center pointer-events-none
              transition-colors duration-200
              ${error ? 'text-red-400' : isFocused ? 'text-primary-500' : 'text-gray-400'}
            `}>
              {icon}
            </div>
          )}

          {/* Input element */}
          <input
            ref={inputRef}
            id={id}
            type={type}
            className={`
              block w-full bg-transparent outline-none
              py-3 text-gray-900 placeholder-transparent
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              transition-colors duration-200
              ${icon ? 'pl-10' : 'pl-4'}
              ${rightIcon ? 'pr-10' : 'pr-4'}
              ${className}
            `}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />

          {/* Right icon / Success indicator */}
          {(rightIcon || success) && (
            <div className={`
              absolute right-3 flex items-center
              transition-all duration-200
              ${success ? 'text-green-500' : 'text-gray-400'}
            `}>
              {success ? (
                <svg className="w-5 h-5 animate-scaleIn" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : rightIcon}
            </div>
          )}
        </div>
      </div>

      {/* Error message with animation */}
      {error && (
        <p 
          id={`${id}-error`}
          className="mt-1.5 text-sm text-red-600 flex items-center gap-1 animate-fadeInUp"
          role="alert"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;

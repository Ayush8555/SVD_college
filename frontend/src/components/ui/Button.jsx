import React, { useState, useRef, useEffect } from 'react';
import { useUIIntelligence } from '../../context/UIIntelligenceContext';

/**
 * Enhanced Button Component
 * - Ripple effect on click
 * - Magnetic hover behavior
 * - Loading state with spinner
 * - Focus ring with keyboard navigation
 * - ARIA attributes for accessibility
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false, 
  disabled = false,
  magnetic = false,
  ...props 
}) => {
  const [ripples, setRipples] = useState([]);
  const [isPressed, setIsPressed] = useState(false);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const { getTransitionTiming } = useUIIntelligence?.() || { getTransitionTiming: () => 'duration-200' };

  // Ripple effect handler
  const createRipple = (e) => {
    if (disabled || isLoading) return;
    
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;
    
    const newRipple = { x, y, size, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);
    
    // Cleanup ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  // Magnetic effect handler
  const handleMouseMove = (e) => {
    if (!magnetic || disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) * 0.15;
    const y = (e.clientY - centerY) * 0.15;
    setMagneticOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMagneticOffset({ x: 0, y: 0 });
  };
  
  const baseStyles = `
    relative inline-flex items-center justify-center font-medium font-sans 
    transition-all ${getTransitionTiming()} 
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    rounded-lg overflow-hidden
    active:scale-[0.97] 
    tracking-wide select-none
  `.trim().replace(/\s+/g, ' ');
  
  const variants = {
    primary: `
      bg-primary-900 text-white 
      hover:bg-primary-800 hover:shadow-lg hover:shadow-primary-900/25
      focus-visible:ring-primary-500
      border border-transparent shadow-md
    `,
    secondary: `
      bg-white text-primary-900 
      border border-primary-200 
      hover:bg-primary-50 hover:border-primary-300 hover:shadow-md
      focus-visible:ring-primary-200
    `,
    outline: `
      bg-transparent text-primary-700 
      border border-primary-600 
      hover:bg-primary-50 hover:shadow-md
      focus-visible:ring-primary-500
    `,
    danger: `
      bg-red-600 text-white 
      hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/25
      focus-visible:ring-red-500 shadow-sm
    `,
    ghost: `
      text-gray-600 
      hover:text-gray-900 hover:bg-gray-100/80
      shadow-none border-transparent
      focus-visible:ring-gray-400
    `,
    success: `
      bg-accent text-white 
      hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/25
      focus-visible:ring-accent shadow-md
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3.5 text-base gap-2.5',
  };

  return (
    <button
      ref={buttonRef}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      onMouseDown={(e) => { createRipple(e); setIsPressed(true); }}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => { handleMouseLeave(); setIsPressed(false); }}
      onMouseMove={handleMouseMove}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      data-cursor="pointer"
      style={{
        transform: `translate3d(${magneticOffset.x}px, ${magneticOffset.y}px, 0) scale(${isPressed ? 0.97 : 1})`,
      }}
      {...props}
    >
      {/* Ripple container */}
      <span className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}
      </span>
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <svg 
              className="animate-spin h-4 w-4 text-current" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
};

export default Button;

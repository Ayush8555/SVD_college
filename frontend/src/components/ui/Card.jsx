import React, { useRef, useState } from 'react';

/**
 * Enhanced Card Component
 * - Subtle tilt on hover (3D effect)
 * - Smooth shadow transitions
 * - Focus states for keyboard navigation
 */
const Card = ({ 
  children, 
  className = '', 
  title, 
  subTitle, 
  actions, 
  noPadding = false,
  interactive = false,
  onClick,
  as: Component = 'div',
  ...props 
}) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!interactive) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientY - centerY) / 20;
    const y = (centerX - e.clientX) / 20;
    setTilt({ x: Math.max(-5, Math.min(5, x)), y: Math.max(-5, Math.min(5, y)) });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const isClickable = onClick || interactive;

  return (
    <Component
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        bg-white rounded-xl border border-gray-200/80 
        overflow-hidden transition-all duration-300 ease-out
        ${isClickable ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2' : ''}
        ${isHovered && interactive ? 'shadow-xl shadow-gray-200/50' : 'shadow-sm'}
        ${className}
      `}
      style={{
        transform: interactive 
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`
          : undefined,
        transformStyle: 'preserve-3d',
      }}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.(e);
        }
      }}
      {...props}
    >
      {/* Subtle shine effect on hover */}
      {interactive && (
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-100' : ''}`}
          style={{ transform: 'translateZ(1px)' }}
        />
      )}
      
      {(title || actions) && (
        <div className="px-5 py-4 border-b border-gray-100/80 flex justify-between items-center bg-white relative z-10">
          <div>
            {title && <h3 className="text-base font-bold text-gray-800 uppercase tracking-wide">{title}</h3>}
            {subTitle && <p className="text-xs text-gray-500 mt-0.5">{subTitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className={`relative z-10 ${noPadding ? '' : 'p-5'}`}>
        {children}
      </div>
    </Component>
  );
};

export default Card;

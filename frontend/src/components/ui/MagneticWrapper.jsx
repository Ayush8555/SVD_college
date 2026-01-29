import React, { useRef, useEffect, useState } from 'react';

/**
 * Magnetic Button Wrapper
 * Creates a subtle magnetic pull effect on hover
 * The button content follows the cursor within bounds
 */
const MagneticWrapper = ({ 
  children, 
  strength = 0.3, 
  radius = 100,
  className = '',
  as: Component = 'div',
  ...props 
}) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < radius) {
        setPosition({
          x: distX * strength,
          y: distY * strength,
        });
        setIsHovered(true);
      } else {
        setPosition({ x: 0, y: 0 });
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
      setIsHovered(false);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, radius]);

  return (
    <Component
      ref={ref}
      className={`${className}`}
      data-cursor="magnetic"
      {...props}
    >
      <div
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: isHovered ? 'transform 0.15s ease-out' : 'transform 0.4s ease-out',
        }}
      >
        {children}
      </div>
    </Component>
  );
};

export default MagneticWrapper;

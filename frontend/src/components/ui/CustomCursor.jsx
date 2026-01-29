import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Premium Custom Cursor System
 * - Morphs based on element context
 * - Magnetic effect for interactive elements
 * - State-based feedback (hover, click, loading)
 * - Graceful mobile fallback
 */
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState('default'); // default, pointer, text, loading, magnetic
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // Position tracking with lerp for smooth movement
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  useEffect(() => {
    // Detect touch device
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();

    if (isTouchDevice) return;

    // Animation loop with lerp for buttery smooth movement
    const lerp = (start, end, factor) => start + (end - start) * factor;
    
    const animate = () => {
      // Outer cursor - slower follow (luxury feel)
      cursorPos.current.x = lerp(cursorPos.current.x, mousePos.current.x, 0.15);
      cursorPos.current.y = lerp(cursorPos.current.y, mousePos.current.y, 0.15);
      
      // Inner dot - faster follow (precise feel)
      dotPos.current.x = lerp(dotPos.current.x, mousePos.current.x, 0.35);
      dotPos.current.y = lerp(dotPos.current.y, mousePos.current.y, 0.35);
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0)`;
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      }
      
      rafId.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Detect element types for cursor morphing
    const handleElementHover = (e) => {
      const target = e.target;
      
      // Check for interactive elements
      if (target.closest('button, a, [role="button"], .cursor-pointer, [data-cursor="pointer"]')) {
        setCursorState('pointer');
      } else if (target.closest('input, textarea, [contenteditable="true"]')) {
        setCursorState('text');
      } else if (target.closest('[data-cursor="magnetic"]')) {
        setCursorState('magnetic');
      } else if (target.closest('[data-loading="true"]')) {
        setCursorState('loading');
      } else {
        setCursorState('default');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleElementHover);
    
    animate();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleElementHover);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible, isTouchDevice]);

  // Hide on touch devices
  if (isTouchDevice) return null;

  const getCursorSize = () => {
    switch (cursorState) {
      case 'pointer': return 'w-12 h-12';
      case 'text': return 'w-1 h-6';
      case 'magnetic': return 'w-16 h-16';
      case 'loading': return 'w-10 h-10';
      default: return 'w-8 h-8';
    }
  };

  const getDotSize = () => {
    switch (cursorState) {
      case 'pointer': return 'w-2 h-2';
      case 'text': return 'w-0.5 h-4';
      default: return 'w-1.5 h-1.5';
    }
  };

  return (
    <>
      {/* Hide default cursor globally */}
      <style>{`
        * { cursor: none !important; }
        @media (pointer: coarse) { * { cursor: auto !important; } }
      `}</style>
      
      {/* Outer cursor ring */}
      <div
        ref={cursorRef}
        className={`
          fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2
          ${getCursorSize()}
          border-2 rounded-full
          transition-all duration-200 ease-out
          ${cursorState === 'pointer' ? 'border-primary-500/60 bg-primary-500/10' : ''}
          ${cursorState === 'text' ? 'border-primary-600 rounded-none' : ''}
          ${cursorState === 'magnetic' ? 'border-accent-500/50 bg-accent-500/5' : ''}
          ${cursorState === 'loading' ? 'border-primary-500/40 border-t-primary-600 animate-spin' : ''}
          ${cursorState === 'default' ? 'border-gray-400/50' : ''}
          ${isClicking ? 'scale-90' : 'scale-100'}
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ willChange: 'transform' }}
      />
      
      {/* Inner dot */}
      <div
        ref={cursorDotRef}
        className={`
          fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2
          ${getDotSize()}
          rounded-full bg-primary-600
          transition-all duration-150 ease-out
          ${isClicking ? 'scale-150 bg-accent-500' : 'scale-100'}
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${cursorState === 'loading' ? 'opacity-0' : ''}
        `}
        style={{ willChange: 'transform' }}
      />
    </>
  );
};

export default CustomCursor;

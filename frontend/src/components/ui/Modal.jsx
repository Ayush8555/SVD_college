import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Enhanced Modal Component
 * - Smooth scale + fade entrance animation
 * - Focus trap for accessibility
 * - Backdrop blur with opacity transition
 * - Keyboard navigation (Escape to close)
 * - Body scroll lock
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-md',
  closeOnBackdrop = true,
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Focus trap: keep focus within modal
  const handleTabKey = useCallback((e) => {
    if (!modalRef.current) return;
    
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') handleTabKey(e);
    };

    if (isOpen) {
      // Save current focus
      previousActiveElement.current = document.activeElement;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
      
      // Focus first focusable element
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 50);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose, handleTabKey]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div 
        ref={modalRef}
        className={`
          relative w-full ${maxWidth} 
          bg-white rounded-2xl shadow-2xl
          transform transition-all duration-300 ease-out
          animate-modalEnter
          border border-gray-100
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 
            id="modal-title" 
            className="text-lg font-heading font-semibold text-gray-900"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="
              rounded-full p-2 text-gray-400 
              hover:bg-gray-100 hover:text-gray-600 
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
              transition-all duration-200
              active:scale-95
            "
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body
  return createPortal(modalContent, document.body);
};

export default Modal;

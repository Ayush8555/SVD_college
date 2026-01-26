import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const ToastContainer = ({ toasts, removeToast }) => {
  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto min-w-[300px] max-w-sm rounded-xl shadow-lg border p-4 flex items-start animate-slide-in-right ${
            toast.type === 'success' ? 'bg-white border-green-100 text-green-900' :
            toast.type === 'error' ? 'bg-white border-red-100 text-red-900' :
            toast.type === 'warning' ? 'bg-white border-orange-100 text-orange-900' :
            'bg-white border-gray-100 text-gray-900'
          }`}
        >
          <div className={`mr-3 text-xl ${
             toast.type === 'success' ? 'text-green-500' :
             toast.type === 'error' ? 'text-red-500' :
             toast.type === 'warning' ? 'text-orange-500' :
             'text-blue-500'
          }`}>
            {toast.type === 'success' ? '✓' :
             toast.type === 'error' ? '✕' :
             toast.type === 'warning' ? '⚠' : 'ℹ'}
          </div>
          <div className="flex-1">
             <h4 className="font-semibold text-sm">{toast.title}</h4>
             <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>
          </div>
          <button 
            onClick={() => removeToast(toast.id)} 
            className="ml-3 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now().toString();
    if (!title) {
        title = type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info';
    }
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = (msg) => addToast(msg, 'success');
  const error = (msg) => addToast(msg, 'error');
  const warning = (msg) => addToast(msg, 'warning');
  const info = (msg) => addToast(msg, 'info');

  return (
    <ToastContext.Provider value={{ addToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// src/components/ui/Toast.jsx
import { useEffect, useState } from 'react';

const toastTypes = {
  success: {
    icon: '✓',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    iconColor: 'text-emerald-500',
  },
  error: {
    icon: '✕',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
  },
  info: {
    icon: 'ℹ',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
  },
  warning: {
    icon: '⚠',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    iconColor: 'text-amber-500',
  },
};

export const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = toastTypes[type];

  return (
    <div className={`fixed bottom-4 right-4 z-50 animate-slide-up ${styles.bgColor} border ${styles.borderColor} rounded-lg shadow-lg p-4 max-w-sm`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-5 h-5 rounded-full ${styles.iconColor} font-bold flex items-center justify-center`}>
          {styles.icon}
        </div>
        <p className={`text-sm ${styles.textColor} flex-1`}>{message}</p>
        <button onClick={onClose} className={`${styles.textColor} hover:opacity-70`}>
          ✕
        </button>
      </div>
    </div>
  );
};

// Toast container component
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Toast hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
};
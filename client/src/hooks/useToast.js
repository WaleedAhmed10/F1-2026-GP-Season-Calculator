import { useState, useCallback } from 'react';

/**
 * Toast notification hook for displaying temporary messages
 * Supports multiple toast types: success, error, info, warning
 */

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = toastId++;
    const toast = { id, message, type };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    return addToast(message, type, duration);
  }, [addToast]);

  const showSuccess = useCallback((message, duration = 3000) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message, duration = 5000) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const showInfo = useCallback((message, duration = 4000) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration = 4000) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const toast = {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast
  };

  return toast;
}

/**
 * Toast Container Component
 */
export function ToastContainer({ toasts, removeToast }) {
  const getStyles = (type) => {
    const baseStyle = {
      position: 'fixed',
      padding: '12px 16px',
      borderRadius: '4px',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minWidth: '250px',
      maxWidth: '400px',
      wordWrap: 'break-word',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-in-out'
    };

    const typeStyles = {
      success: {
        backgroundColor: '#4caf50',
        color: 'white'
      },
      error: {
        backgroundColor: '#f44336',
        color: 'white'
      },
      info: {
        backgroundColor: '#2196f3',
        color: 'white'
      },
      warning: {
        backgroundColor: '#ff9800',
        color: 'white'
      }
    };

    return { ...baseStyle, ...typeStyles[type] };
  };

  return (
    <div style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 9999 }}>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `}</style>
      {toasts.map((toast) => (
        <div key={toast.id} style={getStyles(toast.type)}>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

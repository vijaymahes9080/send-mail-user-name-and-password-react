import React, { useEffect } from 'react';

/**
 * Toast Notification Banner.
 * Displays animated system alerts (Success or Error).
 * Standardized with a 5000ms autohide timer, manual dismiss triggers,
 * and matching visual theme.
 */
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon" aria-hidden="true">
        {type === 'success' ? '✨' : '⚠️'}
      </span>
      <div className="toast-message">{message}</div>
      <button 
        className="toast-close" 
        onClick={onClose} 
        aria-label="Dismiss alert"
      >
        &times;
      </button>
    </div>
  );
};

export default Toast;

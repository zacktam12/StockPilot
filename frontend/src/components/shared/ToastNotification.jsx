import React, { useEffect } from 'react';

const ToastNotification = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-notification ${type}`}>
      {message}
      <button onClick={onClose}>×</button>
    </div>
  );
};

export default ToastNotification;

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const NotificationItem = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(notification.id), 300); // Allow fade out animation
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        ${getStyles()}
        border-l-4 p-4 rounded-lg shadow-lg max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        hover:shadow-xl
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {notification.title}
          </h3>
          {notification.description && (
            <p className="mt-1 text-sm opacity-90">
              {notification.description}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onClose(notification.id)}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationContainer = ({ notifications, onClose }) => {
  // Only show on desktop (>=768px) - mobile will use banner
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return null;
  }

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

// Mobile Banner Component
const MobileBanner = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(notification.id), 300);
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id, onClose]);

  // Only show on mobile screens
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return null;
  }

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-300">
      <div
        className={`
          px-4 py-3 flex items-center justify-center gap-3 shadow-lg border-b-2
          ${notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-600' 
            : notification.type === 'error'
            ? 'bg-red-50 text-red-800 border-red-600'
            : 'bg-yellow-50 text-yellow-800 border-yellow-600'
          }
        `}
        style={{
          borderRadius: '0 0 8px 8px',
        }}
      >
        <div className="flex items-center gap-3">
          <div className={`
            flex items-center justify-center w-6 h-6 rounded-full
            ${notification.type === 'success' 
              ? 'bg-green-600' 
              : notification.type === 'error'
              ? 'bg-red-600'
              : 'bg-yellow-600'
            }
          `}>
            {notification.type === 'success' ? (
              <CheckCircle className="text-white text-sm" />
            ) : notification.type === 'error' ? (
              <XCircle className="text-white text-sm" />
            ) : (
              <AlertCircle className="text-white text-sm" />
            )}
          </div>
          <span className="font-medium text-sm">{notification.title}</span>
          {notification.description && (
            <span className="text-xs opacity-75">{notification.description}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export { NotificationContainer, MobileBanner };

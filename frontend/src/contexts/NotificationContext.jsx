import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { NotificationContainer, MobileBanner } from '../components/shared/NotificationSystem';
import notificationService from '../services/notificationService';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [mobileNotification, setMobileNotification] = useState(null);

  // Listen to notification service changes
  useEffect(() => {
    const unsubscribe = notificationService.subscribe(({ notifications: serviceNotifications, mobileNotification: serviceMobileNotification }) => {
      setNotifications(serviceNotifications);
      setMobileNotification(serviceMobileNotification);
    });

    return unsubscribe;
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 4000,
      ...notification,
    };

    // Check if it's mobile view
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileNotification(newNotification);
    } else {
      setNotifications(prev => [...prev, newNotification]);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    if (mobileNotification && mobileNotification.id === id) {
      setMobileNotification(null);
    }
    // Also remove from service
    notificationService.removeNotification(id);
  }, [mobileNotification]);

  const showSuccess = useCallback((title, description, duration = 4000) => {
    notificationService.showSuccess(title, description, duration);
  }, []);

  const showError = useCallback((title, description, duration = 5000) => {
    notificationService.showError(title, description, duration);
  }, []);

  const showWarning = useCallback((title, description, duration = 4000) => {
    notificationService.showWarning(title, description, duration);
  }, []);

  const showInfo = useCallback((title, description, duration = 4000) => {
    notificationService.showInfo(title, description, duration);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setMobileNotification(null);
    notificationService.clearAll();
  }, []);

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    addNotification,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification} 
      />
      {mobileNotification && (
        <MobileBanner 
          notification={mobileNotification} 
          onClose={removeNotification} 
        />
      )}
    </NotificationContext.Provider>
  );
};

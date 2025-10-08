// Notification service for consistent notification handling
class NotificationService {
  constructor() {
    this.notifications = [];
    this.mobileNotification = null;
    this.listeners = [];
  }

  // Subscribe to notification changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  notify() {
    this.listeners.forEach(listener => listener({
      notifications: this.notifications,
      mobileNotification: this.mobileNotification
    }));
  }

  // Add a notification
  addNotification(notification) {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 4000,
      ...notification,
    };

    // Check if it's mobile view
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.mobileNotification = newNotification;
    } else {
      this.notifications.push(newNotification);
    }

    this.notify();

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, newNotification.duration);
    }
  }

  // Remove a notification
  removeNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    if (this.mobileNotification && this.mobileNotification.id === id) {
      this.mobileNotification = null;
    }
    this.notify();
  }

  // Show success notification
  showSuccess(title, description, duration = 4000) {
    this.addNotification({
      type: 'success',
      title,
      description,
      duration,
    });
  }

  // Show error notification
  showError(title, description, duration = 5000) {
    this.addNotification({
      type: 'error',
      title,
      description,
      duration,
    });
  }

  // Show warning notification
  showWarning(title, description, duration = 4000) {
    this.addNotification({
      type: 'warning',
      title,
      description,
      duration,
    });
  }

  // Show info notification
  showInfo(title, description, duration = 4000) {
    this.addNotification({
      type: 'info',
      title,
      description,
      duration,
    });
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.mobileNotification = null;
    this.notify();
  }

  // Get current notifications
  getNotifications() {
    return {
      notifications: this.notifications,
      mobileNotification: this.mobileNotification
    };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Export convenience functions
export const showSuccess = (title, description, duration) => 
  notificationService.showSuccess(title, description, duration);

export const showError = (title, description, duration) => 
  notificationService.showError(title, description, duration);

export const showWarning = (title, description, duration) => 
  notificationService.showWarning(title, description, duration);

export const showInfo = (title, description, duration) => 
  notificationService.showInfo(title, description, duration);

export const clearAllNotifications = () => 
  notificationService.clearAll();

export default notificationService;

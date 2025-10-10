import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../../../config';
import {
  fetchDashboardStats,
  fetchActivities,
  fetchLowStockAlerts,
  fetchRevenueData,
  fetchProductDistribution,
  setSocketUpdates,
} from '../../../store/slices/dashboardSlice';

const useRealTimeData = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Get current data from Redux store
  const {
    stats,
    activities,
    lowStockAlerts,
    revenue,
    distribution,
    lastUpdated,
  } = useSelector((state) => state.dashboard);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (socketRef.current?.connected) return;

    // Check if WebSocket is supported and available (optional feature)
        
    try {
      socketRef.current = io(API_BASE_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 3, // Only try 3 times
        reconnectionDelay: 5000, // Wait 5 seconds between attempts
        forceNew: true,
      });

      // Connection events
      socketRef.current.on('connect', () => {
              });

      socketRef.current.on('disconnect', (reason) => {
        // Only log if it was a manual disconnect
        if (reason === 'io client disconnect') {
                  }
      });

      socketRef.current.on('connect_error', (error) => {
        // Silently fail - WebSocket is optional
        // Only log once to avoid spam
        if (!socketRef.current?._connectErrorLogged) {
          if (socketRef.current) {
            socketRef.current._connectErrorLogged = true;
          }
        }
        // Stop trying after first error
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      });
    } catch (error) {
            return null;
    }

    // Dashboard update events (only add if socket was created successfully)
    if (socketRef.current) {
      socketRef.current.on('dashboard-update', (data) => {
                dispatch(setSocketUpdates(data));
      });

      socketRef.current.on('stats-update', (statsData) => {
                dispatch(setSocketUpdates({ stats: statsData }));
      });

      socketRef.current.on('activity-update', (activityData) => {
                dispatch(setSocketUpdates({ activities: activityData }));
      });

      socketRef.current.on('stock-alert', (alertData) => {
                dispatch(setSocketUpdates({ lowStockAlerts: alertData }));
      });

      socketRef.current.on('sale-update', (saleData) => {
                // Only refresh revenue data if it's been more than 30 seconds since last update
        const now = Date.now();
        const lastRevenueUpdate = lastUpdated.revenue ? new Date(lastUpdated.revenue).getTime() : 0;
        if (now - lastRevenueUpdate > 30000) { // 30 seconds
          dispatch(fetchRevenueData());
        }
      });

      socketRef.current.on('product-update', (productData) => {
                // Only refresh product distribution if it's been more than 30 seconds since last update
        const now = Date.now();
        const lastDistributionUpdate = lastUpdated.distribution ? new Date(lastUpdated.distribution).getTime() : 0;
        if (now - lastDistributionUpdate > 30000) { // 30 seconds
          dispatch(fetchProductDistribution());
        }
      });
    }

    return socketRef.current;
  }, [dispatch]);

  // Cleanup socket connection
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
            socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  // Setup periodic data refresh as fallback
  const setupPeriodicRefresh = useCallback(() => {
    if (intervalRef.current) return;

        intervalRef.current = setInterval(() => {
            
      // Only refresh if data is older than 5 minutes
      const now = Date.now();
      const lastUpdate = Math.max(...Object.values(lastUpdated).map(time => time ? new Date(time).getTime() : 0));
      
      if (now - lastUpdate > 5 * 60 * 1000) { // 5 minutes
        dispatch(fetchDashboardStats());
        dispatch(fetchActivities({ page: 1, limit: 10 }));
        dispatch(fetchLowStockAlerts({ page: 1, limit: 10 }));
      }
    }, 10 * 60 * 1000); // Check every 10 minutes
  }, [dispatch, lastUpdated]);

  // Cleanup periodic refresh
  const clearPeriodicRefresh = useCallback(() => {
    if (intervalRef.current) {
            clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Manual refresh function with throttling
  const refreshAllData = useCallback(async () => {
    const now = Date.now();
    const lastRefresh = window.lastDashboardRefresh || 0;
    
    // Throttle refreshes to prevent too frequent calls
    if (now - lastRefresh < 30000) { // 30 seconds minimum between refreshes
      return;
    }
    
    window.lastDashboardRefresh = now;
        
    try {
      await Promise.all([
        dispatch(fetchDashboardStats()),
        dispatch(fetchActivities({ page: 1, limit: 10 })),
        dispatch(fetchLowStockAlerts({ page: 1, limit: 10 })),
        dispatch(fetchRevenueData()),
        dispatch(fetchProductDistribution()),
      ]);
          } catch (error) {
          }
  }, [dispatch]);

  // Initialize real-time data on mount
  useEffect(() => {
        
    // Setup real-time connection
    initializeSocket();
    
    // Setup periodic refresh as fallback
    setupPeriodicRefresh();

    // Cleanup on unmount
    return () => {
            disconnectSocket();
      clearPeriodicRefresh();
    };
  }, []); // Remove all dependencies to prevent re-initialization

  // Handle visibility change to pause/resume updates
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
                disconnectSocket();
        clearPeriodicRefresh();
      } else {
                initializeSocket();
        setupPeriodicRefresh();
        // Only refresh data if it's been more than 1 minute since last update
        const now = Date.now();
        const lastUpdate = Math.max(...Object.values(lastUpdated).map(time => time ? new Date(time).getTime() : 0));
        if (now - lastUpdate > 60000) { // 1 minute
          refreshAllData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Remove dependencies to prevent re-registration

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    if (!socketRef.current) return 'disconnected';
    return socketRef.current.connected ? 'connected' : 'disconnected';
  }, []);

  // Get last update times
  const getLastUpdateTimes = useCallback(() => {
    return {
      stats: lastUpdated.stats ? new Date(lastUpdated.stats) : null,
      activities: lastUpdated.activities ? new Date(lastUpdated.activities) : null,
      lowStockAlerts: lastUpdated.lowStockAlerts ? new Date(lastUpdated.lowStockAlerts) : null,
      revenue: lastUpdated.revenue ? new Date(lastUpdated.revenue) : null,
      distribution: lastUpdated.distribution ? new Date(lastUpdated.distribution) : null,
    };
  }, [lastUpdated]);

  return {
    // Data
    stats,
    activities,
    lowStockAlerts,
    revenue,
    distribution,
    
    // Status
    connectionStatus: getConnectionStatus(),
    lastUpdateTimes: getLastUpdateTimes(),
    
    // Actions
    refreshAllData,
    initializeSocket,
    disconnectSocket,
    
    // Real-time status
    isConnected: getConnectionStatus() === 'connected',
    hasRealTimeData: Object.values(lastUpdated).some(time => time !== null),
  };
};

export default useRealTimeData;


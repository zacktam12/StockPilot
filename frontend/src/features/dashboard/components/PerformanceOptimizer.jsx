import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/shared/Card';
import {
  Activity,
  Cpu,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const PerformanceOptimizer = ({ onOptimize }) => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    cacheHitRate: 0,
    componentCount: 0,
    dataSize: 0,
  });

  const [optimizations, setOptimizations] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Performance monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Simulate performance metrics collection
      setMetrics(prev => ({
        renderTime: Math.random() * 100 + 50,
        memoryUsage: Math.random() * 50 + 20,
        networkLatency: Math.random() * 200 + 50,
        cacheHitRate: Math.random() * 30 + 70,
        componentCount: Math.floor(Math.random() * 20) + 15,
        dataSize: Math.floor(Math.random() * 1000) + 500,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Calculate performance score
  const performanceScore = useMemo(() => {
    const score = Math.round(
      (100 - metrics.renderTime / 2) * 0.3 +
      (100 - metrics.memoryUsage * 2) * 0.2 +
      (100 - metrics.networkLatency / 3) * 0.2 +
      metrics.cacheHitRate * 0.3
    );
    return Math.max(0, Math.min(100, score));
  }, [metrics]);

  // Generate optimization suggestions
  const generateOptimizations = useCallback(() => {
    const suggestions = [];

    if (metrics.renderTime > 100) {
      suggestions.push({
        id: 'render-time',
        type: 'warning',
        title: 'High Render Time',
        description: 'Consider using React.memo for expensive components',
        impact: 'high',
        icon: TrendingUp,
      });
    }

    if (metrics.memoryUsage > 40) {
      suggestions.push({
        id: 'memory-usage',
        type: 'error',
        title: 'Memory Usage High',
        description: 'Implement component cleanup and lazy loading',
        impact: 'critical',
        icon: AlertTriangle,
      });
    }

    if (metrics.networkLatency > 200) {
      suggestions.push({
        id: 'network-latency',
        type: 'warning',
        title: 'Network Latency High',
        description: 'Optimize API calls and implement caching',
        impact: 'medium',
        icon: WifiOff,
      });
    }

    if (metrics.cacheHitRate < 80) {
      suggestions.push({
        id: 'cache-hit-rate',
        type: 'info',
        title: 'Low Cache Hit Rate',
        description: 'Improve caching strategy for better performance',
        impact: 'medium',
        icon: Database,
      });
    }

    if (metrics.componentCount > 25) {
      suggestions.push({
        id: 'component-count',
        type: 'info',
        title: 'High Component Count',
        description: 'Consider component consolidation',
        impact: 'low',
        icon: Activity,
      });
    }

    setOptimizations(suggestions);
  }, [metrics]);

  useEffect(() => {
    generateOptimizations();
  }, [generateOptimizations]);

  const handleOptimize = (optimizationId) => {
    console.log('Applying optimization:', optimizationId);
    if (onOptimize) {
      onOptimize(optimizationId);
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPerformanceStatus = (score) => {
    if (score >= 90) return { label: 'Excellent', icon: CheckCircle, color: 'text-green-600' };
    if (score >= 70) return { label: 'Good', icon: TrendingUp, color: 'text-yellow-600' };
    return { label: 'Needs Attention', icon: AlertTriangle, color: 'text-red-600' };
  };

  const performanceStatus = getPerformanceStatus(performanceScore);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
            Performance Monitor
          </CardTitle>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isMonitoring
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title={isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            >
              <Activity className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Performance Score */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              performanceScore >= 90 ? 'bg-green-100 dark:bg-green-900/20' :
              performanceScore >= 70 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
              'bg-red-100 dark:bg-red-900/20'
            }`}>
              <span className={`text-lg font-bold ${getPerformanceColor(performanceScore)}`}>
                {performanceScore}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <performanceStatus.icon className={`w-4 h-4 ${performanceStatus.color}`} />
                <span className={`text-sm font-medium ${performanceStatus.color}`}>
                  {performanceStatus.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Performance Score
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Render Time</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {metrics.renderTime.toFixed(1)}ms
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Memory</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {metrics.memoryUsage.toFixed(1)}MB
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Latency</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {metrics.networkLatency.toFixed(0)}ms
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Cache Hit</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {metrics.cacheHitRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Optimization Suggestions */}
        {optimizations.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Optimization Suggestions
            </h4>
            <div className="space-y-2">
              {optimizations.map((optimization) => {
                const Icon = optimization.icon;
                return (
                  <div
                    key={optimization.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${
                        optimization.type === 'error' ? 'text-red-600 dark:text-red-400' :
                        optimization.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {optimization.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {optimization.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOptimize(optimization.id)}
                      className="px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                    >
                      Optimize
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Components: {metrics.componentCount} | Data: {metrics.dataSize}KB
            </span>
            <button
              onClick={() => generateOptimizations()}
              className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors duration-200"
            >
              Refresh Analysis
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceOptimizer;


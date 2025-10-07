// Sidebar Enhancement Demo Component
import React, { useState } from 'react';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Crown, 
  Activity, 
  TrendingUp,
  Bell,
  Star,
  Award,
  Target,
  X
} from 'lucide-react';

const SidebarDemo = () => {
  const [showDemo, setShowDemo] = useState(false);

  const demoFeatures = [
    {
      icon: <Sparkles size={20} />,
      title: "Enhanced Animations",
      description: "Smooth transitions and micro-interactions",
      color: "text-purple-500"
    },
    {
      icon: <Zap size={20} />,
      title: "Performance Optimized",
      description: "Fast rendering and smooth scrolling",
      color: "text-yellow-500"
    },
    {
      icon: <Shield size={20} />,
      title: "Role-Based Access",
      description: "Secure navigation based on user roles",
      color: "text-green-500"
    },
    {
      icon: <Crown size={20} />,
      title: "Professional Design",
      description: "Modern UI with glass morphism effects",
      color: "text-blue-500"
    },
    {
      icon: <Activity size={20} />,
      title: "Real-time Updates",
      description: "Live status indicators and notifications",
      color: "text-red-500"
    },
    {
      icon: <TrendingUp size={20} />,
      title: "Analytics Ready",
      description: "Built-in metrics and insights",
      color: "text-indigo-500"
    }
  ];

  if (!showDemo) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDemo(true)}
          className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
        >
          <Sparkles size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Sparkles size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Enhanced Sidebar Features
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Professional navigation with modern design
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDemo(false)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Key Improvements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enhanced animations and transitions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Professional gradient designs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Advanced search functionality</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Role-based navigation</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mobile-responsive design</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Custom scrollbars</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Status indicators</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Glass morphism effects</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarDemo;

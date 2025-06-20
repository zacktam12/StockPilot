// ...Tabs component for settings and other pages...

import React, { useState } from "react";

// Tabs context for managing active tab
const TabsContext = React.createContext();

export function Tabs({ defaultValue, className = "", children }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children }) {
  return (
    <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-4">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }) {
  const { value: active, setValue } = React.useContext(TabsContext);
  const isActive = value === active;
  return (
    <button
      type="button"
      className={`px-4 py-2 rounded-t-md font-medium transition-colors
        ${
          isActive
            ? "bg-white dark:bg-gray-800 border-b-2 border-[#3f51b5] text-[#3f51b5] dark:text-blue-300"
            : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }
      `}
      onClick={() => setValue(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }) {
  const { value: active } = React.useContext(TabsContext);
  if (value !== active) return null;
  return <div className="pt-2">{children}</div>;
}

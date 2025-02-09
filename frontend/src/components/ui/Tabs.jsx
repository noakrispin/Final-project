import React from 'react';

/**
 * Tabs component that serves as the container for the tab navigation and content.
 * 
 * Props:
 * - defaultValue: The default active tab value.
 * - children: The tab navigation and content components.
 * - onValueChange: Function to call when the active tab changes.
 * - className: Additional class names for the tabs container.
 */
export const Tabs = ({ defaultValue, children, onValueChange, className = '' }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (onValueChange) {
      onValueChange(value);
    }
  };

  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (!child) return null;
        
        return React.cloneElement(child, {
          activeTab,
          onTabChange: handleTabChange,
        });
      })}
    </div>
  );
};

/**
 * TabsList component that serves as the container for the tab triggers.
 * 
 * Props:
 * - children: The tab trigger components.
 * - className: Additional class names for the tabs list.
 */
export const TabsList = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
      {children}
    </div>
  );
};

/**
 * TabsTrigger component that serves as the trigger for switching tabs.
 * 
 * Props:
 * - value: The value of the tab.
 * - children: The content of the tab trigger.
 * - activeTab: The currently active tab value.
 * - onTabChange: Function to call when the tab is clicked.
 * - className: Additional class names for the tab trigger.
 */
export const TabsTrigger = ({ value, children, activeTab, onTabChange, className = '' }) => {
  const isActive = activeTab === value;
  
  return (
    <button
      onClick={() => onTabChange(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 
        text-sm font-medium transition-all focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-gray-400 
        disabled:pointer-events-none disabled:opacity-50
        ${isActive ? 'bg-white text-gray-950 shadow-sm' : 'hover:bg-gray-50'}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

/**
 * TabsContent component that serves as the content area for a tab.
 * 
 * Props:
 * - value: The value of the tab.
 * - children: The content of the tab.
 * - activeTab: The currently active tab value.
 * - className: Additional class names for the tab content.
 */
export const TabsContent = ({ value, children, activeTab, className = '' }) => {
  if (activeTab !== value) return null;
  
  return (
    <div className={`mt-2 focus-visible:outline-none ${className}`}>
      {children}
    </div>
  );
};

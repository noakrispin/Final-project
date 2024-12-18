import React from 'react';

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

export const TabsList = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
      {children}
    </div>
  );
};

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

export const TabsContent = ({ value, children, activeTab, className = '' }) => {
  if (activeTab !== value) return null;
  
  return (
    <div className={`mt-2 focus-visible:outline-none ${className}`}>
      {children}
    </div>
  );
};


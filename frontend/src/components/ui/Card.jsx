import React from 'react';

export const Card = ({ className, children, ...props }) => {
  return (
    <div 
      className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};


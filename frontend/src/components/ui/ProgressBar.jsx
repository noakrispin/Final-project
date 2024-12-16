import React from 'react';

export const ProgressBar = ({ 
  value, 
  max, 
  label,
  showPercentage = true,
  barColor = 'bg-blue-500',
  bgColor = 'bg-gray-200',
  height = 'h-2',
  labelPosition = 'top',
  className = ''
}) => {
  const percentage = Math.round((value / max) * 100) || 0;
  
  const renderLabel = () => (
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium text-gray-700">
        {label || `${value}/${max}`}
      </span>
      {showPercentage && (
        <span className="text-sm font-medium text-gray-500">
          {percentage}%
        </span>
      )}
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {labelPosition === 'top' && renderLabel()}
      <div className={`w-full ${bgColor} ${height} rounded-full`}>
        <div
          className={`${height} ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {labelPosition === 'bottom' && renderLabel()}
    </div>
  );
};


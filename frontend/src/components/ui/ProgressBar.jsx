import React from 'react';
import PropTypes from 'prop-types';

/**
 * This component renders a progress bar with customizable styles and labels.
 * 
 * Props:
 * - value: The current value of the progress.
 * - max: The maximum value of the progress.
 * - label: The label to display alongside the progress bar.
 * - showPercentage: Boolean indicating if the percentage should be displayed.
 * - barColor: The color of the progress bar.
 * - bgColor: The background color of the progress bar container.
 * - height: The height of the progress bar.
 * - labelPosition: The position of the label ('top' or 'bottom').
 * - className: Additional class names for the progress bar container.
 */
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

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  label: PropTypes.string,
  showPercentage: PropTypes.bool,
  barColor: PropTypes.string,
  bgColor: PropTypes.string,
  height: PropTypes.string,
  labelPosition: PropTypes.oneOf(['top', 'bottom']),
  className: PropTypes.string,
};

ProgressBar.defaultProps = {
  showPercentage: true,
  barColor: 'bg-blue-500',
  bgColor: 'bg-gray-200',
  height: 'h-2',
  labelPosition: 'top',
  className: '',
};

import React from 'react';

export const StatusBadge = ({ value, statusType }) => {
  const getStatusColor = () => {
    switch (value) {
      case statusType.OVERDUE:
      case statusType.NOT_SUBMITTED:
        return 'bg-red-100 text-red-800';
      case statusType.COMPLETED:
      case statusType.SUBMITTED:
        return 'bg-green-100 text-green-800';
      case statusType.PENDING:
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor()}`}>
      {value}
    </span>
  );
};
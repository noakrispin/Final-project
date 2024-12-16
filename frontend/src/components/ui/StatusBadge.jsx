import React from 'react';

const statusColors = {
  'Submitted': 'bg-green-100 text-green-800',
  'Not Submitted': 'bg-red-100 text-red-800',
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Overdue': 'bg-orange-100 text-orange-800',
  'Completed': 'bg-blue-100 text-blue-800',
};

export const StatusBadge = ({ status }) => {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
};


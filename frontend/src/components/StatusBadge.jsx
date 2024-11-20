import React from 'react';

export const StatusBadge = ({ value, statusType }) => {
  const classes = {
    [statusType.COMPLETED]: 'bg-[#e4ffe1] text-[#686b80] border-[#92e799]',
    [statusType.OVERDUE]: 'bg-[#ffe1e1] text-[#686b80] border-[#e79292]',
    [statusType.PENDING]: 'bg-[#efefef] text-[#686b80] border-[#8c8c8c]',
    [statusType.SUBMITTED]: 'bg-[#e4ffe1] text-[#686b80] border-[#92e799]',
    [statusType.NOT_SUBMITTED]: 'bg-[#ffe1e1] text-[#686b80] border-[#e79292]'
  };

  return <span className={`px-2 py-0.5 rounded text-xs ${classes[value]}`}>{value}</span>;
};
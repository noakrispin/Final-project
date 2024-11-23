import React from 'react';

export const Actions = React.memo(({ onNavigate }) => (
  <div className="text-right">
    <button
      onClick={onNavigate}
      className="text-[#686b80] text-sm hover:underline focus:outline-none"
    >
      View/Edit Evaluation
    </button>
  </div>
));
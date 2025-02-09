import React from 'react';
import { Button } from './Button';

/**
 * This component renders a pagination control with "Previous" and "Next" buttons.
 * It allows users to navigate between pages.
 * 
 * Props:
 * - currentPage: The current page number.
 * - totalPages: The total number of pages.
 * - onPageChange: Function to call when the page changes.
 */
export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center mt-4 space-x-2">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
      >
        Previous
      </Button>
      <span className="py-2 px-4 bg-gray-100 rounded">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
      >
        Next
      </Button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

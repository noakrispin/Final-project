import React from 'react';

const Spinner = ({ size = 'h-16 w-16', color = 'border-blue-500' }) => (
  <div
    className={`animate-spin rounded-full ${size} border-t-4 border-b-4 ${color} ease-linear`}
    role="status"
    aria-label="Loading"
  />
);

const LoadingScreen = ({ isLoading, description = "Loading, please wait..." }) => {
  if (isLoading) {
    return (
      <div
        className="flex flex-col justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
        aria-live="polite"
        aria-label={description}
      >
        <div className="animate-spin rounded-full h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 border-t-4 border-b-4 border-blue-500 ease-linear" />
        <p className="mt-4 text-sm sm:text-base md:text-lg">{description}</p>
      </div>
    );
  }
  return null;
};


export default LoadingScreen;

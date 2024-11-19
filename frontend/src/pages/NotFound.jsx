import React from 'react';
// Import React to create a functional component.

import { Link } from 'react-router-dom';
// Import Link from React Router for navigation within the app.

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      {/* Center content vertically and horizontally on the screen */}
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      {/* Large heading displaying the error code */}
      
      <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
      {/* Subheading with a descriptive message */}
      
      <Link to="/" className="text-blue-500 underline">
        Go Back Home
      </Link>
      {/* Link to navigate back to the home page */}
    </div>
  );
};

export default NotFound;
// Export NotFound component as default.

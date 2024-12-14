import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // Redirect to login if no user is logged in
    return <Navigate to="/login" />;
  }

  // Render children (the protected page) if the user is logged in
  return children;
};

export default ProtectedRoute;

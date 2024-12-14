import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth(); // Get user info from AuthContext
  const location = useLocation();

  if (!user) {
    // If no user is logged in, redirect to the login page
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user is logged in but doesn't have the required role, redirect to home
    return <Navigate to="/" replace />;
  }

  // If user is logged in and has the correct role, render the children
  return children;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired,
};

ProtectedRoute.defaultProps = {
  allowedRoles: null, // Default to null (no role restriction)
};

export default ProtectedRoute;

import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useRedirect } from '../../hooks/useRedirect';

const ProtectedRoute = ({ allowedRoles, element, ...props }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isLoading = false; // Replace with your actual loading state
  const location = useLocation();

  useRedirect(user, isLoading, allowedRoles, location);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user && allowedRoles.includes(user.role) ? (
    element
  ) : (
    <Navigate to="/login" state={{ from: location.pathname }} replace />
  );
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

ProtectedRoute.defaultProps = {
  allowedRoles: ["Student", "Supervisor"],
};

export default ProtectedRoute;


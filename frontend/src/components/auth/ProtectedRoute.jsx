/**
 * This component protects routes by ensuring the user is authenticated.
 * 
 * Props:
 * - children: The components to render if the user is authenticated.
 * - adminOnly: Boolean indicating if the route is restricted to admin users.
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Display a loading spinner or placeholder
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;

import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Show a loading spinner or placeholder
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Admin-only routes
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/unauthorized" />;
  }

  // All other routes (default for Supervisor role)
  return children;
};

export default ProtectedRoute;

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wrap any route element with this to require login and (optionally) a specific role.
 * Usage: <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, role }) {
  const { token, role: userRole } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;

  return children;
}

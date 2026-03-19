import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDefaultDashboardRoute } from "./roleRoutes";

export default function ProtectedRoute({ children, roles, allowedRoles }) {
  const { user, loading } = useAuth();
  const effectiveRoles = allowedRoles || roles;

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (effectiveRoles && !effectiveRoles.includes(user.role)) {
    return <Navigate to={getDefaultDashboardRoute(user.role)} replace />;
  }

  return children;
}

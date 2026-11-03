import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, admin = false }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="page container">Cargando...</div>;
  if (!user) return <Navigate to="/cuenta" replace />;
  if (admin && profile?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

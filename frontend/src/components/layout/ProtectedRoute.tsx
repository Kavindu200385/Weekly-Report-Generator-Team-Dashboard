import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "@/types";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ roles, fallback = "/my-report" }: { roles?: Role[]; fallback?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={fallback} replace />;

  return <Outlet />;
}

export function ManagerRoute() {
  return <ProtectedRoute roles={["manager"]} fallback="/my-report" />;
}

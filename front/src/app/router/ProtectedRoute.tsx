import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/features/auth/model/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="screen-loader">Проверяем авторизацию…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

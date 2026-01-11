import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

import type { RootState } from "@/store";
import { clearAuth } from "@/store/slices/authSlice";

// Basic role-based protection
export const ProtectedRoute = ({ requiredRole }: { requiredRole?: string }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  console.log(
    "ProtectedRoute - isAuthenticated:",
    isAuthenticated,
    "user role:",
    user?.role,
    "requiredRole:",
    requiredRole,
  );

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(clearAuth());
    }
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    console.log("Wrong role. User:", user?.role, "Required:", requiredRole);
    // Redirect to appropriate dashboard based on actual role or home
    if (user?.role === "PLATFORM_ADMIN") return <Navigate to="/admin" replace />;
    if (user?.role === "TENANT_ADMIN") return <Navigate to="/tenant" replace />;
    if (user?.role === "OPERATIONS_MANAGER") return <Navigate to="/ops-manager" replace />;
    return <Navigate to="/" replace />;
  }

  console.log("Access granted to route");
  return <Outlet />;
};

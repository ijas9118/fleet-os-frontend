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
    if (user?.role === "DRIVER") {
      return user?.isOnboardingComplete ? (
        <Navigate to="/driver" replace />
      ) : (
        <Navigate to="/driver/onboarding" replace />
      );
    }
    return <Navigate to="/" replace />;
  }

  // Special check for drivers: if they haven't completed onboarding, redirect to onboarding page
  // Unless they're already on the onboarding page
  if (user?.role === "DRIVER" && !user?.isOnboardingComplete) {
    const currentPath = window.location.pathname;
    if (!currentPath.includes("/driver/onboarding")) {
      console.log("Driver hasn't completed onboarding, redirecting");
      return <Navigate to="/driver/onboarding" replace />;
    }
  }

  console.log("Access granted to route");
  return <Outlet />;
};

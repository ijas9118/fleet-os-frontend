import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

import type { RootState } from "@/store";

export const PublicRoute = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  if (isAuthenticated) {
    if (user?.role === "PLATFORM_ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    if (user?.role === "TENANT_ADMIN") {
      return <Navigate to="/tenant" replace />;
    }
    if (user?.role === "OPERATIONS_MANAGER") {
      return <Navigate to="/ops-manager" replace />;
    }
    if (user?.role === "DRIVER") {
      // Redirect driver based on onboarding status
      return user?.isOnboardingComplete ? (
        <Navigate to="/driver" replace />
      ) : (
        <Navigate to="/driver/onboarding" replace />
      );
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

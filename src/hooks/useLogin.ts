import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { authService } from "@/services/authService";
import { setAuth } from "@/store/slices/authSlice";
import type { LoginFormValues } from "@/types/auth.types";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const login = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      if (response.data?.data?.accessToken) {
        const token = response.data.data.accessToken;
        const decoded = jwtDecode<{
          role?: string;
          email?: string;
          id?: string;
          tenantId?: string;
          tenantName?: string;
          isOnboardingComplete?: boolean;
        }>(token);

        dispatch(
          setAuth({
            token,
            user: {
              id: decoded.id,
              email: decoded.email,
              role: decoded.role,
              isOnboardingComplete: decoded.isOnboardingComplete,
              tenant: decoded.tenantId
                ? {
                    id: decoded.tenantId,
                    name: decoded.tenantName || "Unknown Tenant",
                  }
                : undefined,
            },
          }),
        );

        console.log("Login - Decoded role:", decoded.role);
        if (decoded.role === "PLATFORM_ADMIN") {
          console.log("Navigating to /admin");
          navigate("/admin");
        } else if (decoded.role === "TENANT_ADMIN") {
          console.log("Navigating to /tenant");
          navigate("/tenant");
        } else if (decoded.role === "OPERATIONS_MANAGER") {
          console.log("Navigating to /ops-manager");
          navigate("/ops-manager");
        } else if (decoded.role === "DRIVER") {
          console.log("Navigating to driver portal", { isOnboardingComplete: decoded.isOnboardingComplete });
          // Redirect based on onboarding status
          if (decoded.isOnboardingComplete) {
            navigate("/driver");
          } else {
            navigate("/driver/onboarding");
          }
        } else {
          console.log("Navigating to /");
          navigate("/");
        }
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || "Login failed. Please check your credentials.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}

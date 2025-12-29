import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { setAuth } from "@/store/slices/authSlice";
import { authService } from "@/services/authService";
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
        const decoded = jwtDecode<{ role?: string; email?: string; id?: string; tenantId?: string }>(token);
        
        dispatch(setAuth({ 
          token, 
          user: {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            tenantId: decoded.tenantId
          }
        }));

        if (decoded.role === 'PLATFORM_ADMIN') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      const error = err as { response?: { data?: {error?: { message?: string }} } };
      setError(error.response?.data?.error?.message || "Login failed. Please check your credentials.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}

import { store } from '@/store';
import { clearAuth, setAuth } from '@/store/slices/authSlice';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't retried yet
    // Also ensure we don't get into an infinite loop if the refresh endpoint itself returns 401
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;
      
      try {
        // Use a new axios instance or the global axios to avoid this interceptor
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.tokens;
        
        if (accessToken) {
          const decoded = jwtDecode<{ role?: string; email?: string; id?: string; tenantId?: string }>(accessToken);
          
          store.dispatch(setAuth({ 
            token: accessToken, 
            user: {
              id: decoded.id,
              email: decoded.email,
              role: decoded.role,
              tenantId: decoded.tenantId
            }
          }));

          // Update the header of the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, log out
        store.dispatch(clearAuth());
        // Optionally redirect to login page, though clearing auth state might trigger a redirect if protected route
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

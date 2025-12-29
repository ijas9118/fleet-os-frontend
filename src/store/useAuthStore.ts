import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id?: string;
  email?: string;
  role?: string;
  tenantId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  
  setAuth: (token: string, user?: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,

      setAuth: (token, user) => set({ 
        isAuthenticated: true, 
        accessToken: token,
        user: user || null
      }),

      clearAuth: () => set({ 
        isAuthenticated: false, 
        accessToken: null, 
        user: null 
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }), // Only persist token
    }
  )
);

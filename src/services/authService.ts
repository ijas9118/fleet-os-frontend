import { api } from './api';

// Types based on Auth Service DTOs
export interface LoginResponse {
  message: string;
  data: { accessToken: string };
}

export interface RegisterTenantResponse {
  message: string;
}

export interface VerifyOtpResponse {
  message: string;
  result: unknown; // Using unknown for now, refine later
}

// Service methods
export const authService = {
  login: async (data: unknown) => {
    return api.post<LoginResponse>('/auth/login', data);
  },
  
  registerTenant: async (data: unknown) => {
    // Ensure nested address object is strictly typed if needed, 
    // but for now passing through as verified by Zod on frontend
    return api.post<RegisterTenantResponse>('/auth/register-tenant', data);
  },

  verifyOtp: async (data: { email: string; otp: string; type: 'tenant' | 'user' }) => {
    return api.post<VerifyOtpResponse>('/auth/verify-otp', data);
  },

  resendOtp: async (email: string) => {
    return api.post('/auth/resend-otp', { email });
  },

  acceptInvite: async (data: { token: string; password: string }) => {
    return api.post('/auth/accept-invite', data);
  },
  
  logout: async () => {
    return api.post('/auth/logout');
  }
};

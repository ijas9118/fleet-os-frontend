import type { 
  LoginFormValues, 
  LoginResponse,
  RegisterTenantResponse,
  VerifyOtpResponse,
  RefreshTokenResponse,
  RegisterFormValues
} from '@/types/auth.types';
import { api } from './api';

export const authService = {
  login: async (data: LoginFormValues) => {
    return api.post<LoginResponse>('/auth/login', data);
  },
  
  registerTenant: async (data: RegisterFormValues) => {
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
  },

  refreshToken: async () => {
    return api.post<RefreshTokenResponse>('/auth/refresh');
  }
};



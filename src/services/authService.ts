import type { 
  LoginFormValues, 
  LoginResponse,
  PaginatedResult,
  PaginationParams,
  RefreshTokenResponse,
  RegisterTenantRequest,
  RegisterTenantResponse,
  TenantResponse,
  VerifyOtpResponse,
} from '@/types/auth.types';

import { api } from './api';

export const authService = {
  login: async (data: LoginFormValues) => {
    return api.post<LoginResponse>('/auth/login', data);
  },
  
  registerTenant: async (data: RegisterTenantRequest) => {
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
  },

  getPendingTenants: async (params?: PaginationParams) => {
    return api.get<{ result: PaginatedResult<TenantResponse> }>('/auth/tenants/pending', { params });
  },

  getTenants: async (params?: PaginationParams) => {
    return api.get<{ result: PaginatedResult<TenantResponse> }>('/auth/tenants', { params });
  },

  getRejectedTenants: async (params?: PaginationParams) => {
    return api.get<{ result: PaginatedResult<TenantResponse> }>('/auth/tenants/rejected', { params });
  },

  verifyTenant: async (tenantId: string) => {
    return api.post(`/auth/verify-tenant`, { tenantId });
  },

  rejectTenant: async (tenantId: string) => {
    return api.post(`/auth/reject-tenant`, { tenantId });
  }
};



import type {
  AdminRegisterResponse,
  LoginFormValues,
  LoginResponse,
  PaginatedResult,
  PaginationParams,
  RefreshTokenResponse,
  RegisterAdminRequest,
  RegisterTenantRequest,
  RegisterTenantResponse,
  TenantResponse,
  UserResponse,
  VerifyOtpResponse,
} from "@/types/auth.types";

import { api } from "./api";

export const authService = {
  login: async (data: LoginFormValues) => {
    return api.post<LoginResponse>("/auth/login", data);
  },

  registerTenant: async (data: RegisterTenantRequest) => {
    return api.post<RegisterTenantResponse>("/tenants/register", data);
  },

  registerTenantAdmin: async (data: RegisterAdminRequest) => {
    return api.post<AdminRegisterResponse>("/auth/register-admin", data);
  },

  verifyOtp: async (data: { email: string; otp: string; type: "tenant" | "user" }) => {
    return api.post<VerifyOtpResponse>("/auth/verify-otp", data);
  },

  resendOtp: async (email: string) => {
    return api.post("/auth/resend-otp", { email });
  },

  acceptInvite: async (data: { token: string; password: string }) => {
    return api.post("/auth/accept-invite", data);
  },

  logout: async () => {
    return api.post("/auth/logout");
  },

  refreshToken: async () => {
    return api.post<RefreshTokenResponse>("/auth/refresh");
  },

  getPendingTenants: async (params?: PaginationParams) => {
    return api.get<{ result: PaginatedResult<TenantResponse> }>("/tenants/pending", { params });
  },

  getTenants: async (params?: PaginationParams) => {
    return api.get<{ result: PaginatedResult<TenantResponse> }>("/tenants", { params });
  },

  getRejectedTenants: async (params?: PaginationParams) => {
    return api.get<{ result: PaginatedResult<TenantResponse> }>("/tenants/rejected", { params });
  },

  verifyTenant: async (tenantId: string) => {
    return api.post(`/tenants/verify`, { tenantId });
  },

  rejectTenant: async (tenantId: string) => {
    return api.post(`/tenants/reject`, { tenantId });
  },

  getUsers: async (params?: PaginationParams) => {
    return api.get<{ result: PaginatedResult<UserResponse> }>("/users", { params });
  },

  blockUser: async (userId: string) => {
    return api.post("/users/block", { userId });
  },

  unblockUser: async (userId: string) => {
    return api.post("/users/unblock", { userId });
  },
};

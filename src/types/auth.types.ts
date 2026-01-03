import * as z from "zod";

import { 
  AcceptInviteSchema, 
  LoginSchema, 
  TenantRegisterSchema, 
  VerifyOtpSchema} from "@/schemas/auth.schema";

export type LoginFormValues = z.infer<typeof LoginSchema>;
export type RegisterFormValues = z.infer<typeof TenantRegisterSchema>;
export type VerifyOtpFormValues = z.infer<typeof VerifyOtpSchema>;
export type AcceptInviteFormValues = z.infer<typeof AcceptInviteSchema>;

export interface RegisterTenantRequest {
  name: string;
  industry?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface LoginResponse {
  message: string;
  data: { accessToken: string };
}

export interface RegisterTenantResponse {
  message: string;
}

export interface VerifyOtpResponse {
  message: string;
  result: unknown;
}

export interface RefreshTokenResponse {
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface TenantResponse {
  tenantId: string;
  name: string;
  contactEmail: string;
  industry?: string;
  contactPhone?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  status: string;
  createdAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

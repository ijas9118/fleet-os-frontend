import * as z from "zod";
import { 
  LoginSchema, 
  TenantRegisterSchema, 
  VerifyOtpSchema, 
  AcceptInviteSchema 
} from "@/schemas/auth.schema";

export type LoginFormValues = z.infer<typeof LoginSchema>;
export type RegisterFormValues = z.infer<typeof TenantRegisterSchema>;
export type VerifyOtpFormValues = z.infer<typeof VerifyOtpSchema>;
export type AcceptInviteFormValues = z.infer<typeof AcceptInviteSchema>;

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

import * as z from "zod";

export const LoginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const TenantRegisterSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  industry: z.string().optional(),
  contactEmail: z.email("Invalid email address"),
  contactPhone: z.string().optional(),
  // Flattening address for simplification in form, will structure for API
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export const VerifyOtpSchema = z.object({
  email: z.email(),
  otp: z.string().min(6, "OTP must be 6 characters"),
});

export const AcceptInviteSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

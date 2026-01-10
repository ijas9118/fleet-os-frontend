import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VerifyOtpSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/authService";
import type { VerifyOtpFormValues } from "@/types/auth.types";
// Fallback to standard Input for OTP if component missing

// Only adding shadcn input-otp manually or fallback to text input for now as it wasn't installed
// Fallback layout: Standard Input for OTP

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get email/type from router state or user input
  const initialEmail = location.state?.email || "";
  const type = location.state?.type || "tenant"; // 'tenant' or 'user'

  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(VerifyOtpSchema),
    defaultValues: {
      email: initialEmail,
      otp: "",
    },
  });

  async function onSubmit(data: VerifyOtpFormValues) {
    setIsLoading(true);
    setError(null);
    try {
      await authService.verifyOtp({
        email: data.email,
        otp: data.otp,
        type: type,
      });

      // Verification successful, redirect to login
      navigate("/auth/login", { replace: true });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleResendOtp = async () => {
    const email = form.getValues("email");
    if (!email) {
      setError("Please enter your email to resend OTP");
      return;
    }
    setError(null);
    try {
      await authService.resendOtp(email);
      alert("OTP Resent!");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
        <CardDescription>Enter the code sent to your email</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="mb-4 text-sm text-destructive">{error}</div>}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} disabled={!!initialEmail || isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>One-Time Password</FormLabel>
                  <FormControl>
                    {/* Using standard input for simplicity if OTP component missing */}
                    <Input
                      placeholder="123456"
                      maxLength={6}
                      {...field}
                      disabled={isLoading}
                      className="text-center text-lg tracking-widest"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>

            <Button type="button" variant="link" className="w-full" onClick={handleResendOtp} disabled={isLoading}>
              Resend Code
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type DriverOnboardingFormValues, DriverOnboardingSchema } from "@/schemas/driver.schema";
import { authService } from "@/services/authService";
import { driverService } from "@/services/driverService";
import { setAuth } from "@/store/slices/authSlice";

export default function DriverOnboardingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DriverOnboardingFormValues>({
    resolver: zodResolver(DriverOnboardingSchema),
    defaultValues: {
      licenseNumber: "",
      licenseExpiryDate: "",
      phoneNumber: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
    },
  });

  async function onSubmit(data: DriverOnboardingFormValues) {
    setIsLoading(true);
    try {
      await driverService.completeOnboarding(data);
      toast.success("Onboarding completed successfully!");

      // Refresh the token to get updated JWT with isOnboardingComplete: true
      try {
        const refreshResponse = await authService.refreshToken();
        console.log("Refresh response:", refreshResponse);

        // The response structure is: { data: { message: "...", data: { accessToken: "...", refreshToken: "..." } } }
        const tokens = refreshResponse.data?.data;
        console.log("Tokens from response:", tokens);

        if (tokens?.accessToken) {
          const token = tokens.accessToken;
          const decoded = jwtDecode<{
            role?: string;
            email?: string;
            id?: string;
            tenantId?: string;
            tenantName?: string;
            isOnboardingComplete?: boolean;
          }>(token);

          console.log("Decoded token:", decoded);
          console.log("isOnboardingComplete status:", decoded.isOnboardingComplete);

          dispatch(
            setAuth({
              token,
              user: {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                isOnboardingComplete: decoded.isOnboardingComplete,
                tenant: decoded.tenantId
                  ? {
                      id: decoded.tenantId,
                      name: decoded.tenantName || "Unknown Tenant",
                    }
                  : undefined,
              },
            }),
          );

          console.log("Redux state updated, redirecting to /driver");
          // Redirect to dashboard after successful token refresh
          navigate("/driver");
        } else {
          console.error("No access token in response:", refreshResponse);
          toast.error("Token refresh failed. Please log in again.");
          navigate("/auth/login");
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Even if refresh fails, the onboarding is complete
        // User can re-login to get updated token
        toast.info("Please log in again to access your dashboard");
        navigate("/auth/login");
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as Record<string, unknown>)?.response?.data?.message ||
        "Failed to complete onboarding. Please try again.";
      toast.error(String(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Complete Your Driver Onboarding</CardTitle>
          <CardDescription>Please provide your information to complete your driver profile</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* License Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">License Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="DL1234567890" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licenseExpiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Expiry Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province *</FormLabel>
                          <FormControl>
                            <Input placeholder="NY" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country *</FormLabel>
                          <FormControl>
                            <Input placeholder="United States" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Emergency Contact</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyContactRelationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship *</FormLabel>
                          <FormControl>
                            <Input placeholder="Spouse, Parent, etc." {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 987-6543" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Complete Onboarding"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

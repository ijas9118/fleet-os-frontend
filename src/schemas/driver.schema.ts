import * as z from "zod";

export const DriverOnboardingSchema = z.object({
  licenseNumber: z.string().min(5, "License number must be at least 5 characters"),
  licenseExpiryDate: z.string().min(1, "License expiry date is required"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),

  // Address fields
  street: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),

  // Emergency contact
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactRelationship: z.string().min(2, "Relationship is required"),
  emergencyContactPhone: z
    .string()
    .min(10, "Emergency contact phone must be at least 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
});

export type DriverOnboardingFormValues = z.infer<typeof DriverOnboardingSchema>;

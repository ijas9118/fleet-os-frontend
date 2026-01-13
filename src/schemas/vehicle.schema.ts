import { FuelType, VehicleType } from "@ahammedijas/fleet-os-shared";
import { z } from "zod";

export const createVehicleSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required").max(20),
  make: z.string().min(1, "Make is required").max(50),
  vehicleModel: z.string().min(1, "Model is required").max(50),
  year: z
    .number()
    .min(1900, "Year must be after 1900")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  vin: z.string().min(1, "VIN is required").max(17, "VIN must be 17 characters or less"),
  type: z.enum(VehicleType),
  fuelType: z.enum(FuelType),
  mileage: z.number().min(0, "Mileage cannot be negative"),
  insuranceExpiryDate: z.string().min(1, "Insurance expiry date is required"),
  registrationExpiryDate: z.string().min(1, "Registration expiry date is required"),
  notes: z.string().optional(),
});

export type CreateVehicleFormValues = z.infer<typeof createVehicleSchema>;

import { MaintenanceType } from "@ahammedijas/fleet-os-shared";
import { z } from "zod";

export const scheduleMaintenanceSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  type: z.enum(MaintenanceType),
  description: z.string().min(5, "Description must be at least 5 characters").max(500, "Description is too long"),
  cost: z.number().min(0, "Cost cannot be negative").optional(),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  notes: z.string().max(1000, "Notes are too long").optional(),
});

export type ScheduleMaintenanceFormValues = z.infer<typeof scheduleMaintenanceSchema>;

export const completeMaintenanceSchema = z.object({
  performedBy: z.string().min(2, "Name must be at least 2 characters"),
  mileageAtMaintenance: z.number().min(0, "Mileage cannot be negative"),
  actualCost: z.number().min(0, "Cost cannot be negative").optional(),
  notes: z.string().max(1000, "Notes are too long").optional(),
});

export type CompleteMaintenanceFormValues = z.infer<typeof completeMaintenanceSchema>;

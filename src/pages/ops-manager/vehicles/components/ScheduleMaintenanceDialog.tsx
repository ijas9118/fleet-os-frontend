import { MaintenanceType } from "@ahammedijas/fleet-os-shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ScheduleMaintenanceFormValues } from "@/schemas/maintenance.schema";
import { scheduleMaintenanceSchema } from "@/schemas/maintenance.schema";
import { maintenanceService } from "@/services/maintenanceService";

interface ScheduleMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string;
  vehicleRegistration: string;
  onSuccess: () => void;
}

const maintenanceTypeLabels: Record<MaintenanceType, string> = {
  [MaintenanceType.OIL_CHANGE]: "Oil Change",
  [MaintenanceType.TIRE_ROTATION]: "Tire Rotation",
  [MaintenanceType.BRAKE_SERVICE]: "Brake Service",
  [MaintenanceType.ENGINE_SERVICE]: "Engine Service",
  [MaintenanceType.TRANSMISSION_SERVICE]: "Transmission Service",
  [MaintenanceType.BATTERY_REPLACEMENT]: "Battery Replacement",
  [MaintenanceType.AIR_FILTER_REPLACEMENT]: "Air Filter Replacement",
  [MaintenanceType.GENERAL_INSPECTION]: "General Inspection",
  [MaintenanceType.REPAIR]: "Repair",
  [MaintenanceType.OTHER]: "Other",
};

export function ScheduleMaintenanceDialog({
  open,
  onOpenChange,
  vehicleId,
  vehicleRegistration,
  onSuccess,
}: ScheduleMaintenanceDialogProps) {
  const form = useForm<ScheduleMaintenanceFormValues>({
    resolver: zodResolver(scheduleMaintenanceSchema),
    defaultValues: {
      vehicleId,
      type: undefined,
      description: "",
      cost: undefined,
      scheduledDate: "",
      notes: "",
    },
  });

  const onSubmit = async (data: ScheduleMaintenanceFormValues) => {
    try {
      await maintenanceService.scheduleMaintenance({
        vehicleId: data.vehicleId,
        type: data.type,
        description: data.description,
        cost: data.cost,
        scheduledDate: data.scheduledDate,
        notes: data.notes,
      });

      toast.success(`Maintenance scheduled for ${vehicleRegistration}`);
      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to schedule maintenance";
      toast.error(message);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!form.formState.isSubmitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        form.reset();
      }
    }
  };

  // Reset form with correct vehicleId when dialog opens
  useEffect(() => {
    if (open && vehicleId) {
      form.reset({
        vehicleId,
        type: undefined,
        description: "",
        cost: undefined,
        scheduledDate: "",
        notes: "",
      });
    }
  }, [open, vehicleId, form]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Schedule Maintenance</DialogTitle>
          <DialogDescription>
            Schedule maintenance for vehicle <span className="font-semibold">{vehicleRegistration}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={form.formState.isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select maintenance type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(maintenanceTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the maintenance work needed..."
                      {...field}
                      disabled={form.formState.isSubmitting}
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={form.formState.isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or instructions..."
                      {...field}
                      disabled={form.formState.isSubmitting}
                      className="resize-none"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Scheduling..." : "Schedule Maintenance"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

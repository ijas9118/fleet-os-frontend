import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import type { CompleteMaintenanceFormValues } from "@/schemas/maintenance.schema";
import { completeMaintenanceSchema } from "@/schemas/maintenance.schema";
import { maintenanceService } from "@/services/maintenanceService";

interface CompleteMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceId: string;
  vehicleInfo: {
    id: string;
    registration: string;
  };
  onSuccess: () => void;
}

export function CompleteMaintenanceDialog({
  open,
  onOpenChange,
  maintenanceId,
  vehicleInfo,
  onSuccess,
}: CompleteMaintenanceDialogProps) {
  const form = useForm<CompleteMaintenanceFormValues>({
    resolver: zodResolver(completeMaintenanceSchema),
    defaultValues: {
      performedBy: "",
      mileageAtMaintenance: undefined,
      actualCost: undefined,
      notes: "",
    },
  });

  const onSubmit = async (data: CompleteMaintenanceFormValues) => {
    try {
      await maintenanceService.completeMaintenance(maintenanceId, {
        performedBy: data.performedBy,
        mileageAtMaintenance: data.mileageAtMaintenance,
        actualCost: data.actualCost,
        notes: data.notes,
      });

      toast.success(`Maintenance completed for ${vehicleInfo.registration}`);
      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to complete maintenance";
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Maintenance</DialogTitle>
          <DialogDescription>
            Record completion details for vehicle <span className="font-semibold">{vehicleInfo.registration}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="performedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Performed By *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Name of mechanic or technician"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mileageAtMaintenance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mileage (km) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Cost</FormLabel>
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
                  <FormLabel>Completion Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Work performed, parts replaced, observations..."
                      {...field}
                      disabled={form.formState.isSubmitting}
                      className="resize-none"
                      rows={4}
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
                {form.formState.isSubmitting ? "Completing..." : "Complete Maintenance"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

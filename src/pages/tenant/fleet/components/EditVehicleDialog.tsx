import { FuelType, VehicleType } from "@ahammedijas/fleet-os-shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { vehicleService } from "@/services/vehicleService";
import type { Vehicle } from "@/types/vehicle.types";

const editVehicleSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required").max(20),
  make: z.string().min(1, "Make is required").max(50),
  vehicleModel: z.string().min(1, "Model is required").max(50),
  year: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  vin: z.string().min(1, "VIN is required").max(17),
  type: z.nativeEnum(VehicleType),
  fuelType: z.nativeEnum(FuelType),
  mileage: z.number().min(0),
  insuranceExpiryDate: z.string().min(1, "Insurance expiry date is required"),
  registrationExpiryDate: z.string().min(1, "Registration expiry date is required"),
  notes: z.string().optional(),
});

type EditVehicleFormValues = z.infer<typeof editVehicleSchema>;

interface EditVehicleDialogProps {
  vehicle: Vehicle;
  onVehicleUpdated: () => void;
  trigger?: React.ReactNode;
}

export function EditVehicleDialog({ vehicle, onVehicleUpdated, trigger }: EditVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditVehicleFormValues>({
    resolver: zodResolver(editVehicleSchema),
    defaultValues: {
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make,
      vehicleModel: vehicle.vehicleModel,
      year: vehicle.year,
      vin: vehicle.vin,
      type: vehicle.type,
      fuelType: vehicle.fuelType,
      mileage: vehicle.mileage,
      insuranceExpiryDate: vehicle.insuranceExpiryDate?.split("T")[0] || "",
      registrationExpiryDate: vehicle.registrationExpiryDate?.split("T")[0] || "",
      notes: vehicle.notes || "",
    },
  });

  // Reset form when dialog opens with updated vehicle data
  useEffect(() => {
    if (open) {
      form.reset({
        registrationNumber: vehicle.registrationNumber,
        make: vehicle.make,
        vehicleModel: vehicle.vehicleModel,
        year: vehicle.year,
        vin: vehicle.vin,
        type: vehicle.type,
        fuelType: vehicle.fuelType,
        mileage: vehicle.mileage,
        insuranceExpiryDate: vehicle.insuranceExpiryDate?.split("T")[0] || "",
        registrationExpiryDate: vehicle.registrationExpiryDate?.split("T")[0] || "",
        notes: vehicle.notes || "",
      });
    }
  }, [open, vehicle, form]);

  const onSubmit = async (data: EditVehicleFormValues) => {
    setIsSubmitting(true);
    try {
      await vehicleService.updateVehicle(vehicle.id, data);
      toast.success("Vehicle updated successfully");
      setOpen(false);
      onVehicleUpdated();
    } catch (error: unknown) {
      let message = "Failed to update vehicle";
      if (isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Pencil className="w-4 h-4 mr-2" />
            Edit Vehicle
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Vehicle</DialogTitle>
          <DialogDescription className="text-base">
            Update vehicle information. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Registration Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="KL-07-AB-1234" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">VIN *</FormLabel>
                      <FormControl>
                        <Input placeholder="Vehicle Identification Number" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Make *</FormLabel>
                      <FormControl>
                        <Input placeholder="Toyota" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Model *</FormLabel>
                      <FormControl>
                        <Input placeholder="Camry" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Year *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Current Mileage (km) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Type & Fuel Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <h3 className="text-lg font-semibold">Type & Fuel</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Vehicle Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(VehicleType).map((type) => (
                            <SelectItem key={type} value={type} className="capitalize">
                              {type}
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
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Fuel Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(FuelType).map((type) => (
                            <SelectItem key={type} value={type} className="capitalize">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Legal & Compliance Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <h3 className="text-lg font-semibold">Legal & Compliance</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="insuranceExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Insurance Expiry Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Registration Expiry Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about the vehicle..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

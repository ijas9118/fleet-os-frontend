import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { useState } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { inventoryService } from "@/services/inventoryService";
import type { Warehouse } from "@/types/warehouse";

const warehouseFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  address: z.object({
    line1: z.string().min(1, "Address line 1 is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),
});

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

interface EditWarehouseDialogProps {
  warehouse: Warehouse;
  onWarehouseUpdated: () => void;
}

export function EditWarehouseDialog({ warehouse, onWarehouseUpdated }: EditWarehouseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: warehouse.name,
      code: warehouse.code,
      address: {
        line1: warehouse.address.line1,
        city: warehouse.address.city,
        state: warehouse.address.state || "",
        postalCode: warehouse.address.postalCode || "",
        country: warehouse.address.country,
        coordinates: warehouse.address.coordinates,
      },
    },
  });

  const onSubmit = async (data: WarehouseFormValues) => {
    setIsSubmitting(true);
    try {
      await inventoryService.updateWarehouse(warehouse.id, data);
      toast.success("Warehouse updated successfully");
      setOpen(false);
      onWarehouseUpdated();
    }
    catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update warehouse";
      toast.error(message);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="w-4 h-4 mr-2" />
          Edit Warehouse
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Warehouse</DialogTitle>
          <DialogDescription className="text-base">
            Update warehouse information. All fields marked with * are required.
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Warehouse Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Main Distribution Center" 
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Warehouse Code *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="WH-001" 
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <h3 className="text-lg font-semibold">Address Information</h3>
              </div>
              
              <FormField
                control={form.control}
                name="address.line1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Street Address *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123 Main Street, Building A" 
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">City *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Mumbai" 
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">State / Province</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Maharashtra" 
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Postal Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="400001" 
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Country *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="India" 
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Coordinates Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <h3 className="text-lg font-semibold">Geographic Coordinates</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address.coordinates.lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Latitude</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="12.9716" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="h-10 font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.coordinates.lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Longitude</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="77.5946" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="h-10 font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
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

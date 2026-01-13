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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { shipmentService } from "@/services/shipmentService";
import type { Shipment } from "@/types/shipment";

// Update shipment schema (simplified - only fields that can be updated)
const updateShipmentSchema = z.object({
  customer: z.object({
    name: z.string().min(1, "Customer name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().optional(),
  }),
  destinationAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().min(1, "Country is required"),
  }),
  notes: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
});

type UpdateShipmentFormValues = z.infer<typeof updateShipmentSchema>;

interface UpdateShipmentDialogProps {
  shipment: Shipment;
  onShipmentUpdated: () => void;
}

export function UpdateShipmentDialog({ shipment, onShipmentUpdated }: UpdateShipmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateShipmentFormValues>({
    resolver: zodResolver(updateShipmentSchema),
    defaultValues: {
      customer: {
        name: shipment.customer.name,
        email: shipment.customer.email,
        phone: shipment.customer.phone || "",
      },
      destinationAddress: {
        street: shipment.destinationAddress.street,
        city: shipment.destinationAddress.city,
        state: shipment.destinationAddress.state || "",
        postalCode: shipment.destinationAddress.postalCode || "",
        country: shipment.destinationAddress.country,
      },
      notes: shipment.notes || "",
      estimatedDeliveryDate: shipment.estimatedDeliveryDate
        ? new Date(shipment.estimatedDeliveryDate).toISOString().split("T")[0]
        : "",
    },
  });

  const onSubmit = async (data: UpdateShipmentFormValues) => {
    setIsSubmitting(true);
    try {
      // Transform the data to match backend schema
      const updateData = {
        customer: {
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone || undefined,
        },
        destinationAddress: {
          line1: data.destinationAddress.street,
          city: data.destinationAddress.city,
          state: data.destinationAddress.state || undefined,
          postalCode: data.destinationAddress.postalCode || undefined,
          country: data.destinationAddress.country,
        },
        notes: data.notes || undefined,
        estimatedDeliveryDate: data.estimatedDeliveryDate
          ? new Date(data.estimatedDeliveryDate).toISOString()
          : undefined,
      };

      await shipmentService.updateShipment(shipment.id!, updateData);
      toast.success("Shipment updated successfully");
      setOpen(false);
      onShipmentUpdated();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update shipment";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="w-4 h-4 mr-2" />
          Edit Shipment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Shipment</DialogTitle>
          <DialogDescription className="text-base">
            Update shipment information. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Customer Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <h3 className="text-lg font-semibold">Customer Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Customer Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="customer.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 8900" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Destination Address */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <h3 className="text-lg font-semibold">Destination Address</h3>
              </div>

              <FormField
                control={form.control}
                name="destinationAddress.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Street Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="destinationAddress.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">City *</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destinationAddress.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="destinationAddress.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destinationAddress.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <h3 className="text-lg font-semibold">Additional Details</h3>
              </div>

              <FormField
                control={form.control}
                name="estimatedDeliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Estimated Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Notes</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Additional notes or special instructions..."
                        {...field}
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

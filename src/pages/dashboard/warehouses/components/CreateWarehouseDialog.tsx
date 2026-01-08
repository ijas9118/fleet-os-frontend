import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { inventoryService } from "@/services/inventoryService";

import { CoordinatePickerMap } from "./CoordinatePickerMap";

const createWarehouseSchema = z.object({
  name: z.string().min(1, "Warehouse name is required"),
  code: z.string().min(1, "Warehouse code is required"),
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
      .optional()
      .refine((val) => val !== undefined, {
        message: "Please select a location on the map",
      }),
  }),
});

type CreateWarehouseFormValues = z.infer<typeof createWarehouseSchema>;

interface CreateWarehouseDialogProps {
  onWarehouseCreated: () => void;
}

export function CreateWarehouseDialog({ onWarehouseCreated }: CreateWarehouseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateWarehouseFormValues>({
    resolver: zodResolver(createWarehouseSchema),
    defaultValues: {
      name: "",
      code: "",
      address: {
        line1: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        coordinates: undefined,
      },
    },
  });

  const onSubmit = async (data: CreateWarehouseFormValues) => {
    setIsSubmitting(true);
    try {
      await inventoryService.createWarehouse(data);
      toast.success("Warehouse created successfully");
      setOpen(false);
      form.reset();
      onWarehouseCreated();
    }
    catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create warehouse";
      toast.error(message);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleCoordinatesChange = (coords: { lat: number; lng: number }) => {
    form.setValue("address.coordinates", coords, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Warehouse
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Warehouse</DialogTitle>
          <DialogDescription>
            Add a new warehouse location to your organization. Click on the map to set the coordinates.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Distribution Center" {...field} />
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
                    <FormLabel>Warehouse Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="WH-001" {...field} />
                    </FormControl>
                    <FormDescription>Unique identifier for this warehouse</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Address Information</h4>
              
              <FormField
                control={form.control}
                name="address.line1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1 *</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mumbai" {...field} />
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
                      <FormLabel>State / Province</FormLabel>
                      <FormControl>
                        <Input placeholder="Maharashtra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="400001" {...field} />
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
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="India" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="address.coordinates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location on Map *</FormLabel>
                  <FormControl>
                    <CoordinatePickerMap
                      coordinates={field.value}
                      onCoordinatesChange={handleCoordinatesChange}
                    />
                  </FormControl>
                  {field.value && (
                    <FormDescription className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        📍 Lat: {field.value.lat.toFixed(6)}, Lng: {field.value.lng.toFixed(6)}
                      </span>
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Warehouse
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

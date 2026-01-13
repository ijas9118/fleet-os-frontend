import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Minus, Plus, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { inventoryService } from "@/services/inventoryService";
import { shipmentService } from "@/services/shipmentService";
import type { InventoryItem } from "@/types/inventoryItem";
import type { Warehouse } from "@/types/warehouse";

// Shipment item schema
const ShipmentItemSchema = z.object({
  inventoryItemId: z.string().min(1, "Please select an item"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

// Main create shipment schema
const createShipmentSchema = z.object({
  warehouseId: z.string().min(1, "Please select a warehouse"),
  items: z.array(ShipmentItemSchema).min(1, "At least one item is required"),
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

type CreateShipmentFormValues = z.infer<typeof createShipmentSchema>;

interface CreateShipmentDialogProps {
  onShipmentCreated: () => void;
}

export function CreateShipmentDialog({ onShipmentCreated }: CreateShipmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateShipmentFormValues>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      warehouseId: "",
      items: [{ inventoryItemId: "", quantity: 1 }],
      customer: {
        name: "",
        email: "",
        phone: "",
      },
      destinationAddress: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      notes: "",
      estimatedDeliveryDate: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch warehouses and inventory items when dialog opens
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [warehousesRes, itemsRes] = await Promise.all([
            inventoryService.getWarehouses({ page: 1, limit: 100 }),
            inventoryService.getInventoryItems({ page: 1, limit: 100 }),
          ]);

          setWarehouses(warehousesRes.data.result.data);
          setInventoryItems(itemsRes.data.result.data);
        } catch (error) {
          console.error("Failed to fetch data:", error);
          toast.error("Failed to load warehouses and items");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [open]);

  const onSubmit = async (data: CreateShipmentFormValues) => {
    setIsSubmitting(true);
    try {
      // Transform the data to match backend schema
      const shipmentData = {
        warehouseId: data.warehouseId,
        items: data.items.map((item) => {
          const inventoryItem = inventoryItems.find((i) => i.id === item.inventoryItemId);
          return {
            inventoryItemId: item.inventoryItemId,
            sku: inventoryItem?.sku || "",
            name: inventoryItem?.name || "",
            quantity: item.quantity,
            unit: inventoryItem?.unit || "units",
          };
        }),
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

      await shipmentService.createShipment(shipmentData);
      toast.success("Shipment created successfully");
      setOpen(false);
      form.reset();
      onShipmentCreated();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create shipment";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Shipment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Truck className="w-6 h-6" />
            Create New Shipment
          </DialogTitle>
          <DialogDescription className="text-base">
            Create a new shipment for delivery. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Warehouse Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <h3 className="text-lg font-semibold">Warehouse</h3>
                </div>

                <FormField
                  control={form.control}
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Select Warehouse *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name} ({warehouse.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Shipment Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    <h3 className="text-lg font-semibold">Items</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ inventoryItemId: "", quantity: 1 })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.inventoryItemId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Inventory Item *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select item" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {inventoryItems.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                      {item.name} ({item.sku})
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
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Quantity *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="mt-8"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                          <Input placeholder="John Doe" {...field} />
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
                          <Input type="email" placeholder="john@example.com" {...field} />
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
                        <Input placeholder="+1 234 567 8900" {...field} />
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
                        <Input placeholder="123 Main Street" {...field} />
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
                          <Input placeholder="New York" {...field} />
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
                          <Input placeholder="NY" {...field} />
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
                          <Input placeholder="10001" {...field} />
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
                          <Input placeholder="United States" {...field} />
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
                        <Input type="date" {...field} />
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
                <Button type="submit" disabled={isSubmitting || loading}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Shipment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

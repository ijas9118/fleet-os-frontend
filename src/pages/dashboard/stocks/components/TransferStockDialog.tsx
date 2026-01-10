import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { inventoryService } from "@/services/inventoryService";
import type { Warehouse } from "@/types/warehouse";

interface TransferStockDialogProps {
  sourceWarehouseId: string;
  sourceWarehouseName?: string;
  inventoryItemId: string;
  inventoryItemName?: string;
  currentQuantity: number;
  onStockTransfer: () => void;
}

export function TransferStockDialog({
  sourceWarehouseId,
  sourceWarehouseName,
  inventoryItemId,
  currentQuantity,
  onStockTransfer,
}: TransferStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [destinationWarehouseId, setDestinationWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [referenceId, setReferenceId] = useState("");

  const fetchWarehouses = async () => {
    try {
      const response = await inventoryService.getWarehouses({ page: 1, limit: 100 });
      // Filter out the source warehouse
      setWarehouses(response.data.result.data.filter((w) => w.id !== sourceWarehouseId));
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
      toast.error("Failed to load destination warehouses");
    }
  };

  useEffect(() => {
    if (open) {
      fetchWarehouses();
    }
  }, [open, sourceWarehouseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qty = Number.parseInt(quantity, 10);
    if (Number.isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid positive quantity");
      return;
    }

    if (qty > currentQuantity) {
      toast.error(`Cannot transfer ${qty} units. Only ${currentQuantity} units available.`);
      return;
    }

    if (!destinationWarehouseId) {
      toast.error("Please select a destination warehouse");
      return;
    }

    setLoading(true);
    try {
      await inventoryService.transferStock({
        sourceWarehouseId,
        destinationWarehouseId,
        inventoryItemId,
        quantity: qty,
        notes: notes || undefined,
        referenceId: referenceId || undefined,
      });

      toast.success(`Successfully transferred ${qty} units`);
      setOpen(false);
      resetForm();
      onStockTransfer();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to transfer stock";
      toast.error(errorMessage);
      console.error("Failed to transfer stock:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDestinationWarehouseId("");
    setQuantity("");
    setNotes("");
    setReferenceId("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowRight className="mr-2 h-4 w-4" />
          Transfer Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Transfer Stock</DialogTitle>
            <DialogDescription>
              Move stock from {sourceWarehouseName || "this warehouse"} to another warehouse.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Source Warehouse</Label>
                <div className="p-2 border rounded-md bg-muted text-sm text-muted-foreground truncate">
                  {sourceWarehouseName || sourceWarehouseId}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Current Quantity</Label>
                <div className="p-2 border rounded-md bg-muted text-sm text-muted-foreground font-mono">
                  {currentQuantity} available
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="destination">Destination Warehouse *</Label>
              <Select value={destinationWarehouseId} onValueChange={setDestinationWarehouseId} required>
                <SelectTrigger id="destination">
                  <SelectValue placeholder="Select destination warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.code})
                    </SelectItem>
                  ))}
                  {warehouses.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">No other warehouses available</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity to Transfer *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={currentQuantity}
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              {quantity && Number.parseInt(quantity, 10) > currentQuantity && (
                <p className="text-sm text-destructive">Cannot exceed available quantity ({currentQuantity})</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reference-id">Reference ID</Label>
              <Input
                id="reference-id"
                placeholder="e.g. TR-123"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Reason for transfer"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading || !destinationWarehouseId || (!!quantity && Number.parseInt(quantity, 10) > currentQuantity)
              }
            >
              {loading ? "Transferring..." : "Transfer Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

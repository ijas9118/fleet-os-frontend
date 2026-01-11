import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { inventoryService } from "@/services/inventoryService";

interface RemoveStockDialogProps {
  stockId: string;
  warehouseId: string;
  inventoryItemId: string;
  currentQuantity: number;
  onStockRemoved: () => void;
}

export function RemoveStockDialog({
  warehouseId,
  inventoryItemId,
  currentQuantity,
  onStockRemoved,
}: RemoveStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [referenceId, setReferenceId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qty = Number.parseInt(quantity, 10);
    if (Number.isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid positive quantity");
      return;
    }

    if (qty > currentQuantity) {
      toast.error(`Cannot remove ${qty} units. Only ${currentQuantity} units available.`);
      return;
    }

    setLoading(true);
    try {
      await inventoryService.removeStock({
        warehouseId,
        inventoryItemId,
        quantity: qty,
        notes: notes || undefined,
        referenceId: referenceId || undefined,
      });

      toast.success(`Successfully removed ${qty} units from stock`);
      setOpen(false);
      resetForm();
      onStockRemoved();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove stock";
      toast.error(errorMessage);
      console.error("Failed to remove stock:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
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
        <Button variant="destructive">Remove Stock</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Remove Stock</DialogTitle>
            <DialogDescription>
              Decrease the stock quantity for this item. An OUT transaction will be created.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="warehouse-id">Warehouse ID</Label>
              <Input id="warehouse-id" value={warehouseId} disabled className="font-mono text-sm" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-id">Inventory Item ID</Label>
              <Input id="item-id" value={inventoryItemId} disabled className="font-mono text-sm" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="current-qty">Current Quantity</Label>
              <Input id="current-qty" value={currentQuantity.toLocaleString()} disabled className="font-semibold" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity to Remove *</Label>
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
                placeholder="e.g. SO-123, SHIP-456"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes about this removal"
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
              variant="destructive"
              disabled={loading || (!!quantity && Number.parseInt(quantity, 10) > currentQuantity)}
            >
              {loading ? "Removing..." : "Remove Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

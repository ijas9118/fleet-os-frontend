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

interface AdjustStockDialogProps {
  stockId: string;
  warehouseId: string;
  inventoryItemId: string;
  currentQuantity: number;
  onStockAdjusted: () => void;
}

export function AdjustStockDialog({
  warehouseId,
  inventoryItemId,
  currentQuantity,
  onStockAdjusted,
}: AdjustStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adjustment, setAdjustment] = useState("");
  const [notes, setNotes] = useState("");
  const [referenceId, setReferenceId] = useState("");

  const adjustmentNum = Number.parseInt(adjustment, 10) || 0;
  const resultingQuantity = currentQuantity + adjustmentNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Number.isNaN(adjustmentNum) || adjustmentNum === 0) {
      toast.error("Please enter a non-zero adjustment value");
      return;
    }

    if (resultingQuantity < 0) {
      toast.error(
        `Adjustment would result in negative quantity. Current: ${currentQuantity}, Adjustment: ${adjustmentNum}`,
      );
      return;
    }

    setLoading(true);
    try {
      await inventoryService.adjustStock({
        warehouseId,
        inventoryItemId,
        adjustment: adjustmentNum,
        notes: notes || undefined,
        referenceId: referenceId || undefined,
      });

      const action = adjustmentNum > 0 ? "increased" : "decreased";
      toast.success(`Successfully ${action} stock by ${Math.abs(adjustmentNum)} units`);
      setOpen(false);
      resetForm();
      onStockAdjusted();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to adjust stock";
      toast.error(errorMessage);
      console.error("Failed to adjust stock:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAdjustment("");
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
        <Button variant="secondary">Adjust Stock</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Make a positive or negative adjustment to stock. Use + for increase, - for decrease.
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
              <Label htmlFor="adjustment">Adjustment (+ or -) *</Label>
              <Input
                id="adjustment"
                type="number"
                placeholder="e.g. +50 or -25"
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Enter a positive number to increase, negative to decrease</p>
            </div>
            {adjustment && !Number.isNaN(adjustmentNum) && adjustmentNum !== 0 && (
              <div className="grid gap-2 p-3 bg-muted rounded-lg">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Preview</Label>
                <div className="flex items-center justify-between text-sm">
                  <span>Current Quantity:</span>
                  <span className="font-semibold">{currentQuantity.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Adjustment:</span>
                  <span className={`font-semibold ${adjustmentNum > 0 ? "text-green-600" : "text-red-600"}`}>
                    {adjustmentNum > 0 ? "+" : ""}
                    {adjustmentNum.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm border-t pt-2">
                  <span>Resulting Quantity:</span>
                  <span className={`font-bold text-base ${resultingQuantity < 0 ? "text-destructive" : ""}`}>
                    {resultingQuantity.toLocaleString()}
                  </span>
                </div>
                {resultingQuantity < 0 && (
                  <p className="text-sm text-destructive mt-1">⚠️ Adjustment would result in negative quantity</p>
                )}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="reference-id">Reference ID</Label>
              <Input
                id="reference-id"
                placeholder="e.g. ADJ-123, AUDIT-456"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Reason for adjustment"
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
            <Button type="submit" disabled={loading || resultingQuantity < 0}>
              {loading ? "Adjusting..." : "Adjust Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

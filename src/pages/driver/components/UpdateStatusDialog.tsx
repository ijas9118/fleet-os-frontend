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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { shipmentService } from "@/services/shipmentService";

interface UpdateStatusDialogProps {
  shipmentId: string;
  currentStatus: string;
  onSuccess: () => void;
  onClose: () => void;
}

// Define allowed status transitions for drivers
const STATUS_TRANSITIONS: Record<string, { value: string; label: string }[]> = {
  CONFIRMED: [{ value: "PICKED", label: "Picked" }],
  PICKED: [{ value: "IN_TRANSIT", label: "In Transit" }],
  IN_TRANSIT: [
    { value: "DELIVERED", label: "Delivered" },
    { value: "RETURNED", label: "Returned" },
  ],
};

export function UpdateStatusDialog({ shipmentId, currentStatus, onSuccess, onClose }: UpdateStatusDialogProps) {
  const [newStatus, setNewStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableStatuses = STATUS_TRANSITIONS[currentStatus] || [];

  const handleSubmit = async () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    setIsSubmitting(true);

    try {
      await shipmentService.updateStatus(shipmentId, newStatus, notes);
      toast.success("Status updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update shipment status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Shipment Status</DialogTitle>
          <DialogDescription>
            Current status: <span className="font-medium">{currentStatus}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select new status..." />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No status transitions available</div>
                ) : (
                  availableStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !newStatus}>
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

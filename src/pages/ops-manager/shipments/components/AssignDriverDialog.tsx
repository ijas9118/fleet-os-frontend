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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { shipmentService } from "@/services/shipmentService";

interface Driver {
  id: string;
  name: string;
  email: string;
}

interface AssignDriverDialogProps {
  shipmentId: string;
  trackingId: string;
  drivers: Driver[];
  onAssignmentSuccess: () => void;
}

export function AssignDriverDialog({ shipmentId, trackingId, drivers, onAssignmentSuccess }: AssignDriverDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAssign = async () => {
    if (!selectedDriverId) {
      toast.error("Please select a driver");
      return;
    }

    const selectedDriver = drivers.find((d) => d.id === selectedDriverId);
    if (!selectedDriver) {
      toast.error("Driver not found");
      return;
    }

    setIsSubmitting(true);

    try {
      await shipmentService.assignToDriver(shipmentId, selectedDriverId, selectedDriver.name);
      toast.success(`Shipment ${trackingId} assigned to ${selectedDriver.name}`);
      setOpen(false);
      setSelectedDriverId("");
      onAssignmentSuccess();
    } catch (error) {
      console.error("Failed to assign driver:", error);
      toast.error("Failed to assign driver to shipment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Assign Driver
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
          <DialogDescription>
            Assign a driver to shipment <span className="font-mono font-medium">{trackingId}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="driver">Select Driver</Label>
            <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
              <SelectTrigger id="driver">
                <SelectValue placeholder="Choose a driver..." />
              </SelectTrigger>
              <SelectContent>
                {drivers.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No drivers available</div>
                ) : (
                  drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{driver.name}</span>
                        <span className="text-xs text-muted-foreground">{driver.email}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isSubmitting || !selectedDriverId}>
            {isSubmitting ? "Assigning..." : "Assign Driver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

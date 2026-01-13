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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authService } from "@/services/authService";
import { vehicleService } from "@/services/vehicleService";

interface Driver {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface AssignDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string;
  vehicleRegistration: string;
  onSuccess: () => void;
}

export function AssignDriverDialog({
  open,
  onOpenChange,
  vehicleId,
  vehicleRegistration,
  onSuccess,
}: AssignDriverDialogProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingDrivers, setFetchingDrivers] = useState(false);

  // Fetch available drivers when dialog opens
  useEffect(() => {
    if (open) {
      fetchDrivers();
    }
  }, [open]);

  const fetchDrivers = async () => {
    setFetchingDrivers(true);
    try {
      const response = await authService.getDrivers({
        page: 1,
        limit: 100, // Get all drivers for dropdown
        status: "active", // Only active drivers
      });

      const { data } = response.data.result;
      setDrivers(
        data.map((d) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          isActive: d.isActive,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
      toast.error("Failed to load drivers");
    } finally {
      setFetchingDrivers(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDriverId) {
      toast.error("Please select a driver");
      return;
    }

    setLoading(true);
    try {
      await vehicleService.assignVehicleToDriver(vehicleId, selectedDriverId);
      const selectedDriver = drivers.find((d) => d.id === selectedDriverId);
      toast.success(`Vehicle ${vehicleRegistration} assigned to ${selectedDriver?.name || "driver"}`);
      onSuccess();
      onOpenChange(false);
      setSelectedDriverId(""); // Reset selection
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to assign vehicle";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setSelectedDriverId(""); // Reset on close
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
          <DialogDescription>
            Assign a driver to vehicle <span className="font-semibold">{vehicleRegistration}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="driver">Select Driver</Label>
            {fetchingDrivers ? (
              <div className="text-sm text-muted-foreground">Loading drivers...</div>
            ) : drivers.length === 0 ? (
              <div className="text-sm text-muted-foreground">No active drivers available</div>
            ) : (
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId} disabled={loading}>
                <SelectTrigger id="driver">
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      <div className="flex flex-col">
                        <span>{driver.name}</span>
                        <span className="text-xs text-muted-foreground">{driver.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selectedDriverId || fetchingDrivers}>
            {loading ? "Assigning..." : "Assign Driver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { VehicleStatus, VehicleType } from "@ahammedijas/fleet-os-shared";
import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Vehicle } from "@/types/vehicle.types";

import { CreateVehicleDialog } from "./CreateVehicleDialog";
import { getVehicleColumns } from "./VehicleColumns";

interface VehicleListPresenterProps {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  pageCount: number;
  onPaginationChange: OnChangeFn<PaginationState>;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  onClearFilters: () => void;
  onStatusUpdate: (vehicleId: string, newStatus: VehicleStatus) => Promise<{ success: boolean; error?: string }>;
  onArchiveVehicle: (vehicleId: string) => Promise<{ success: boolean; error?: string }>;
  onVehicleCreated: () => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: VehicleStatus.AVAILABLE, label: "Available" },
  { value: VehicleStatus.ASSIGNED, label: "Assigned" },
  { value: VehicleStatus.MAINTENANCE, label: "Maintenance" },
  { value: VehicleStatus.OUT_OF_SERVICE, label: "Out of Service" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: VehicleType.SEDAN, label: "Sedan" },
  { value: VehicleType.SUV, label: "SUV" },
  { value: VehicleType.TRUCK, label: "Truck" },
  { value: VehicleType.VAN, label: "Van" },
  { value: VehicleType.PICKUP, label: "Pickup" },
];

export function VehicleListPresenter({
  vehicles,
  loading,
  error,
  pagination,
  pageCount,
  onPaginationChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  onClearFilters,
  onStatusUpdate,
  onArchiveVehicle,
  onVehicleCreated,
}: VehicleListPresenterProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "status" | "archive";
    vehicle: Vehicle | null;
    newStatus?: VehicleStatus;
  }>({
    open: false,
    type: "status",
    vehicle: null,
  });

  const navigate = useNavigate();

  const handleStatusChange = (vehicle: Vehicle, newStatus: VehicleStatus) => {
    setConfirmDialog({
      open: true,
      type: "status",
      vehicle,
      newStatus,
    });
  };

  const handleArchiveClick = (vehicle: Vehicle) => {
    setConfirmDialog({
      open: true,
      type: "archive",
      vehicle,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.vehicle) return { success: false };

    if (confirmDialog.type === "status" && confirmDialog.newStatus) {
      const result = await onStatusUpdate(confirmDialog.vehicle.id, confirmDialog.newStatus);
      if (result.success) {
        toast.success(`Vehicle status updated to ${confirmDialog.newStatus}`);
        setConfirmDialog({ open: false, type: "status", vehicle: null });
      } else {
        toast.error(result.error || "Failed to update vehicle status");
      }
      return result;
    } else if (confirmDialog.type === "archive") {
      const result = await onArchiveVehicle(confirmDialog.vehicle.id);
      if (result.success) {
        toast.success("Vehicle archived successfully");
        setConfirmDialog({ open: false, type: "archive", vehicle: null });
      } else {
        toast.error(result.error || "Failed to archive vehicle");
      }
      return result;
    }

    return { success: false };
  };

  const getConfirmMessage = () => {
    if (!confirmDialog.vehicle) return "";

    const { registrationNumber, make, vehicleModel } = confirmDialog.vehicle;
    const vehicleName = `${make} ${vehicleModel} (${registrationNumber})`;

    if (confirmDialog.type === "archive") {
      return `Are you sure you want to archive "${vehicleName}"? This vehicle will no longer be available for operations.`;
    }

    if (confirmDialog.type === "status" && confirmDialog.newStatus) {
      const status = confirmDialog.newStatus;
      if (status === VehicleStatus.OUT_OF_SERVICE) {
        return `Set "${vehicleName}" out of service? This vehicle will be unavailable for assignment.`;
      }
      if (status === VehicleStatus.MAINTENANCE) {
        return `Set "${vehicleName}" to maintenance mode? This vehicle will be temporarily unavailable.`;
      }
      return `Set "${vehicleName}" to ${status} status?`;
    }

    return "";
  };

  const columns = useMemo(
    () =>
      getVehicleColumns({
        onStatusChange: handleStatusChange,
        onViewDetails: (id) => navigate(`/tenant/vehicles/${id}`),
        onArchiveVehicle: handleArchiveClick,
      }),
    [navigate],
  );

  const hasActiveFilters = search || statusFilter !== "all" || typeFilter !== "all";

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
            <p className="text-muted-foreground">Manage your fleet vehicles.</p>
          </div>
          <CreateVehicleDialog onVehicleCreated={onVehicleCreated} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Vehicles</CardTitle>
            <CardDescription>View and manage all vehicles in your fleet.</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {error && <div className="mb-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

            <DataTable
              columns={columns}
              data={vehicles}
              pagination={pagination}
              pageCount={pageCount}
              onPaginationChange={onPaginationChange}
              searchElement={
                <div className="flex items-center gap-4 flex-1 flex-wrap">
                  <Input
                    placeholder="Search by registration, make, or model..."
                    value={search}
                    onChange={onSearchChange}
                    className="max-w-sm"
                  />
                  <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={onTypeFilterChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasActiveFilters && (
                    <button
                      onClick={onClearFilters}
                      className="text-sm text-muted-foreground hover:text-foreground underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmationModal
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        onConfirm={handleConfirmAction}
        title={confirmDialog.type === "archive" ? "Confirm Archive" : "Confirm Status Change"}
        description={getConfirmMessage()}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </>
  );
}

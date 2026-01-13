import { VehicleStatus, VehicleType } from "@ahammedijas/fleet-os-shared";
import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { Car, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Vehicle } from "@/types/vehicle.types";

import { AssignDriverDialog } from "./AssignDriverDialog";
import { getOpsManagerVehicleColumns } from "./OpsManagerVehicleColumns";

interface OpsManagerVehicleListPresenterProps {
  vehicles: Vehicle[];
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
  onUnassignVehicle: (vehicleId: string) => Promise<{ success: boolean; error?: string }>;
  onRefresh?: () => void;
}

export function OpsManagerVehicleListPresenter({
  vehicles,
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
  onUnassignVehicle,
  onRefresh,
}: OpsManagerVehicleListPresenterProps) {
  const navigate = useNavigate();

  // State for assign driver dialog
  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    vehicleId: string;
    vehicleRegistration: string;
  }>({
    open: false,
    vehicleId: "",
    vehicleRegistration: "",
  });

  const handleAssignClick = useCallback((vehicle: Vehicle) => {
    setAssignDialog({
      open: true,
      vehicleId: vehicle.id,
      vehicleRegistration: vehicle.registrationNumber,
    });
  }, []);

  const handleUnassignClick = useCallback(
    async (vehicle: Vehicle) => {
      const result = await onUnassignVehicle(vehicle.id);
      if (result.success) {
        toast.success(`Vehicle ${vehicle.registrationNumber} unassigned successfully`);
      } else {
        toast.error(result.error || "Failed to unassign vehicle");
      }
    },
    [onUnassignVehicle],
  );

  const columns = useMemo(
    () =>
      getOpsManagerVehicleColumns({
        onViewDetails: (id) => navigate(`/ops-manager/vehicles/${id}`),
        onAssignDriver: handleAssignClick,
        onUnassignVehicle: handleUnassignClick,
      }),
    [navigate, handleAssignClick, handleUnassignClick],
  );

  const hasFilters = search || statusFilter !== "all" || typeFilter !== "all";

  const stats = useMemo(() => {
    const total = vehicles.length;
    const available = vehicles.filter((v) => !v.assignedDriverId && v.status === VehicleStatus.AVAILABLE).length;
    const assigned = vehicles.filter((v) => !!v.assignedDriverId).length;
    const maintenance = vehicles.filter((v) => v.status === VehicleStatus.MAINTENANCE).length;

    return { total, available, assigned, maintenance };
  }, [vehicles]);

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vehicle Management</h2>
        <p className="text-muted-foreground">View and manage vehicle assignments for your fleet</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Badge variant="default">Ready</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <Badge variant="secondary">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Badge variant="outline">Service</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.maintenance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vehicles</CardTitle>
              <CardDescription>View and manage vehicle assignments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by registration, make, or model..."
                value={search}
                onChange={onSearchChange}
                className="h-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-[180px] h-10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={VehicleStatus.AVAILABLE}>Available</SelectItem>
                <SelectItem value={VehicleStatus.ASSIGNED}>Assigned</SelectItem>
                <SelectItem value={VehicleStatus.MAINTENANCE}>Maintenance</SelectItem>
                <SelectItem value={VehicleStatus.OUT_OF_SERVICE}>Out of Service</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={onTypeFilterChange}>
              <SelectTrigger className="w-full sm:w-[180px] h-10">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={VehicleType.SEDAN}>Sedan</SelectItem>
                <SelectItem value={VehicleType.VAN}>Van</SelectItem>
                <SelectItem value={VehicleType.TRUCK}>Truck</SelectItem>
                <SelectItem value={VehicleType.PICKUP}>Pickup</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" onClick={onClearFilters} size="sm" className="h-10">
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          <DataTable
            columns={columns}
            data={vehicles}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
          />
        </CardContent>
      </Card>

      {/* Assign Driver Dialog */}
      <AssignDriverDialog
        open={assignDialog.open}
        onOpenChange={(open) => setAssignDialog((prev) => ({ ...prev, open }))}
        vehicleId={assignDialog.vehicleId}
        vehicleRegistration={assignDialog.vehicleRegistration}
        onSuccess={() => {
          onRefresh?.();
          setAssignDialog({ open: false, vehicleId: "", vehicleRegistration: "" });
        }}
      />
    </div>
  );
}

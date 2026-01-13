import { MaintenanceStatus } from "@ahammedijas/fleet-os-shared";
import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { Search, Wrench, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { maintenanceService } from "@/services/maintenanceService";
import type { MaintenanceRecord } from "@/types/maintenance.types";

import { CompleteMaintenanceDialog } from "../../vehicles/components/CompleteMaintenanceDialog";
import { getOpsManagerMaintenanceColumns } from "./OpsManagerMaintenanceColumns";

interface OpsManagerMaintenanceListPresenterProps {
  maintenanceRecords: MaintenanceRecord[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  pageCount: number;
  onPaginationChange: OnChangeFn<PaginationState>;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
  onViewDetails: (maintenanceId: string) => void;
  onRefresh: () => void;
}

export function OpsManagerMaintenanceListPresenter({
  maintenanceRecords,
  loading,
  error,
  pagination,
  pageCount,
  onPaginationChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
  onViewDetails,
  onRefresh,
}: OpsManagerMaintenanceListPresenterProps) {
  const [completeDialog, setCompleteDialog] = useState<{
    open: boolean;
    maintenanceId: string;
    vehicleId: string;
    vehicleRegistration: string;
  }>({ open: false, maintenanceId: "", vehicleId: "", vehicleRegistration: "" });

  // Show error toast when error state changes
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCompleteMaintenance = useCallback((maintenance: MaintenanceRecord) => {
    setCompleteDialog({
      open: true,
      maintenanceId: maintenance.id!,
      vehicleId: maintenance.vehicleId,
      vehicleRegistration: "N/A", // We don't have vehicle reg here, could fetch if needed
    });
  }, []);

  const handleUpdateStatus = useCallback(
    async (maintenanceId: string, status: MaintenanceStatus) => {
      try {
        await maintenanceService.updateMaintenanceStatus(maintenanceId, status);
        toast.success("Maintenance status updated successfully");
        onRefresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update status";
        toast.error(message);
      }
    },
    [onRefresh],
  );

  const columns = useMemo(
    () =>
      getOpsManagerMaintenanceColumns({
        onViewDetails,
        onCompleteMaintenance: handleCompleteMaintenance,
        onUpdateStatus: handleUpdateStatus,
      }),
    [onViewDetails, handleCompleteMaintenance, handleUpdateStatus],
  );

  const hasActiveFilters = statusFilter !== "all" || search !== "";

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Maintenance</h2>
          <p className="text-muted-foreground">View and manage vehicle maintenance records</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Maintenance Records</CardTitle>
            <CardDescription>
              {maintenanceRecords.length} record{maintenanceRecords.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            <DataTable
              columns={columns}
              data={maintenanceRecords}
              pagination={pagination}
              pageCount={pageCount}
              onPaginationChange={onPaginationChange}
              searchElement={
                <div className="flex items-center gap-3 flex-1">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by vehicle..."
                      value={search}
                      onChange={onSearchChange}
                      className="pl-9"
                    />
                  </div>

                  <div className="h-8 w-px bg-border" />

                  {/* Filter Dropdowns */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-medium">Filter:</span>

                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-background hover:bg-accent/50 transition-colors">
                      <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                        <SelectTrigger className="h-8 border-0 bg-transparent px-2 hover:bg-transparent focus:ring-0 focus:ring-offset-0">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value={MaintenanceStatus.SCHEDULED}>Scheduled</SelectItem>
                          <SelectItem value={MaintenanceStatus.IN_PROGRESS}>In Progress</SelectItem>
                          <SelectItem value={MaintenanceStatus.COMPLETED}>Completed</SelectItem>
                          <SelectItem value={MaintenanceStatus.CANCELLED}>Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8">
                      <X className="h-3.5 w-3.5 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Complete Maintenance Dialog */}
      <CompleteMaintenanceDialog
        open={completeDialog.open}
        onOpenChange={(open) => setCompleteDialog((prev) => ({ ...prev, open }))}
        maintenanceId={completeDialog.maintenanceId}
        vehicleInfo={{
          id: completeDialog.vehicleId,
          registration: completeDialog.vehicleRegistration,
        }}
        onSuccess={() => {
          onRefresh();
          setCompleteDialog({ open: false, maintenanceId: "", vehicleId: "", vehicleRegistration: "" });
        }}
      />
    </>
  );
}

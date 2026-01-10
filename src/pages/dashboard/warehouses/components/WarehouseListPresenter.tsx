import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Warehouse } from "@/types/warehouse";

import { CreateWarehouseDialog } from "./CreateWarehouseDialog";
import { getWarehouseColumns } from "./WarehouseColumns";

interface WarehouseListPresenterProps {
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  pageCount: number;
  onPaginationChange: OnChangeFn<PaginationState>;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  includeArchived: boolean;
  onToggleArchived: () => void;
  onClearFilters: () => void;
  onStatusUpdate: (warehouseId: string, newStatus: string) => Promise<{ success: boolean; error?: string }>;
  onWarehouseCreated: () => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "CLOSED", label: "Closed" },
];

export function WarehouseListPresenter({
  warehouses,
  loading,
  error,
  pagination,
  pageCount,
  onPaginationChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  includeArchived,
  onToggleArchived,
  onClearFilters,
  onStatusUpdate,
  onWarehouseCreated,
}: WarehouseListPresenterProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    warehouse: Warehouse | null;
    newStatus: string;
  }>({
    open: false,
    warehouse: null,
    newStatus: "",
  });

  const navigate = useNavigate();

  const handleStatusChange = (warehouse: Warehouse, newStatus: string) => {
    setConfirmDialog({
      open: true,
      warehouse,
      newStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmDialog.warehouse) return { success: false };

    const result = await onStatusUpdate(confirmDialog.warehouse.id!, confirmDialog.newStatus);

    if (result.success) {
      toast.success(`Warehouse status updated to ${confirmDialog.newStatus}`);
      setConfirmDialog({ open: false, warehouse: null, newStatus: "" });
    } else {
      toast.error(result.error || "Failed to update warehouse status");
    }

    return result;
  };

  const getStatusChangeMessage = () => {
    if (!confirmDialog.warehouse) return "";

    const { name, code } = confirmDialog.warehouse;
    const status = confirmDialog.newStatus;

    if (status === "CLOSED") {
      return `Are you sure you want to close "${name}" (${code})? This warehouse will no longer be available for operations.`;
    }
    if (status === "MAINTENANCE") {
      return `Set "${name}" (${code}) to maintenance mode? This warehouse will be temporarily unavailable.`;
    }
    return `Set "${name}" (${code}) to active status?`;
  };

  const columns = useMemo(
    () =>
      getWarehouseColumns({
        onStatusChange: handleStatusChange,
        onViewDetails: (id) => navigate(`/tenant/warehouses/${id}`),
      }),
    [navigate],
  );

  const hasActiveFilters = search || statusFilter !== "all" || includeArchived;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Warehouses</h2>
            <p className="text-muted-foreground">Manage your warehouse locations.</p>
          </div>
          <CreateWarehouseDialog onWarehouseCreated={onWarehouseCreated} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Warehouses</CardTitle>
            <CardDescription>View and manage all warehouse locations across your organization.</CardDescription>
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
              data={warehouses}
              pagination={pagination}
              pageCount={pageCount}
              onPaginationChange={onPaginationChange}
              searchElement={
                <div className="flex items-center gap-4 flex-1 flex-wrap">
                  <Input
                    placeholder="Search warehouses..."
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
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeArchived}
                      onChange={onToggleArchived}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-muted-foreground">Include Archived</span>
                  </label>
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
        onConfirm={handleConfirmStatusChange}
        title="Confirm Status Change"
        description={getStatusChangeMessage()}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </>
  );
}

import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ShipmentListItem } from "@/types/shipment";
import type { Warehouse } from "@/types/warehouse";

import { CreateShipmentDialog } from "./CreateShipmentDialog";
import { getShipmentColumns } from "./ShipmentColumns";

interface ShipmentListPresenterProps {
  shipments: ShipmentListItem[];
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  pageCount: number;
  onPaginationChange: OnChangeFn<PaginationState>;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  warehouseFilter: string;
  onWarehouseFilterChange: (value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  onShipmentCreated: () => void;
}

export function ShipmentListPresenter({
  shipments,
  warehouses,
  loading,
  error,
  pagination,
  pageCount,
  onPaginationChange,
  statusFilter,
  onStatusFilterChange,
  warehouseFilter,
  onWarehouseFilterChange,
  searchTerm,
  onSearchChange,
  onClearFilters,
  onShipmentCreated,
}: ShipmentListPresenterProps) {
  const navigate = useNavigate();

  const columns = useMemo(
    () =>
      getShipmentColumns({
        onViewDetails: (id) => navigate(`/tenant/shipments/${id}`),
      }),
    [navigate],
  );

  const hasActiveFilters = statusFilter || warehouseFilter || searchTerm;

  // Available status options based on backend enum
  const shipmentStatuses = [
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "IN_TRANSIT", label: "In Transit" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shipment Management</h2>
          <p className="text-muted-foreground">Track and manage all shipments across your warehouses.</p>
        </div>
        <CreateShipmentDialog onShipmentCreated={onShipmentCreated} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Shipments</CardTitle>
          <CardDescription>View and manage shipments with real-time tracking information.</CardDescription>
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
            data={shipments}
            pagination={pagination}
            pageCount={pageCount}
            onPaginationChange={onPaginationChange}
            searchElement={
              <div className="flex items-center gap-4 flex-1 flex-wrap">
                <Input
                  placeholder="Search by tracking ID or customer..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="max-w-sm"
                />

                <Select value={statusFilter || "all"} onValueChange={onStatusFilterChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {shipmentStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={warehouseFilter || "all"} onValueChange={onWarehouseFilterChange}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Filter by warehouse..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
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
  );
}

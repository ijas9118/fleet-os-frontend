import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { InventoryItem } from "@/types/inventoryItem";
import type { Stock } from "@/types/stock";
import type { Warehouse } from "@/types/warehouse";

import { getStockColumns } from "./StockColumns";

interface StockListPresenterProps {
  stocks: Stock[];
  warehouses: Warehouse[];
  inventoryItems: InventoryItem[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  pageCount: number;
  onPaginationChange: OnChangeFn<PaginationState>;
  warehouseFilter: string;
  onWarehouseFilterChange: (value: string) => void;
  itemFilter: string;
  onItemFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export function StockListPresenter({
  stocks,
  warehouses,
  inventoryItems,
  loading,
  error,
  pagination,
  pageCount,
  onPaginationChange,
  warehouseFilter,
  onWarehouseFilterChange,
  itemFilter,
  onItemFilterChange,
  onClearFilters,
}: StockListPresenterProps) {
  const navigate = useNavigate();

  const columns = useMemo(
    () =>
      getStockColumns({
        onViewDetails: (id) => navigate(`/tenant/stocks/${id}`),
      }),
    [navigate],
  );

  const hasActiveFilters = warehouseFilter || itemFilter;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stock Management</h2>
          <p className="text-muted-foreground">View and manage stock levels across warehouses.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Stock Records</CardTitle>
          <CardDescription>Track inventory quantities across all warehouse locations.</CardDescription>
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
            data={stocks}
            pagination={pagination}
            pageCount={pageCount}
            onPaginationChange={onPaginationChange}
            searchElement={
              <div className="flex items-center gap-4 flex-1 flex-wrap">
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

                <Select value={itemFilter || "all"} onValueChange={onItemFilterChange}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Filter by item..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.sku})
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

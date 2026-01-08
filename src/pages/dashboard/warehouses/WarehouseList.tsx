import { useCallback, useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { inventoryService } from "@/services/inventoryService";
import type { Warehouse } from "@/types/warehouse";

import { WarehouseListPresenter } from "./components/WarehouseListPresenter";

export default function WarehouseList() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 500);

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        includeArchived: includeArchived || undefined,
      };

      const response = await inventoryService.getWarehouses(params);
      const { data, meta } = response.data.result;

      setWarehouses(data);
      setPageCount(meta.totalPages);
    }
    catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load warehouses";
      setError(errorMessage);
      console.error("Failed to fetch warehouses:", err);
    }
    finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, statusFilter, includeArchived]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleToggleArchived = () => {
    setIncludeArchived((prev) => !prev);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setIncludeArchived(false);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleStatusUpdate = async (warehouseId: string, newStatus: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await inventoryService.updateWarehouseStatus(warehouseId, newStatus);
      fetchWarehouses();
      return { success: true };
    }
    catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update warehouse status";
      return { success: false, error: errorMessage };
    }
  };

  return (
    <WarehouseListPresenter
      warehouses={warehouses}
      loading={loading}
      error={error}
      pagination={pagination}
      pageCount={pageCount}
      onPaginationChange={setPagination}
      search={search}
      onSearchChange={handleSearch}
      statusFilter={statusFilter}
      onStatusFilterChange={handleStatusFilterChange}
      includeArchived={includeArchived}
      onToggleArchived={handleToggleArchived}
      onClearFilters={handleClearFilters}
      onStatusUpdate={handleStatusUpdate}
      onWarehouseCreated={fetchWarehouses}
    />
  );
}

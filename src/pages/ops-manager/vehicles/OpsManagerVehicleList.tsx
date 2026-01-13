import { useCallback, useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { vehicleService } from "@/services/vehicleService";
import type { Vehicle } from "@/types/vehicle.types";

import { OpsManagerVehicleListPresenter } from "./components/OpsManagerVehicleListPresenter";

export default function OpsManagerVehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 500);

  const fetchVehicles = useCallback(async () => {
    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
      };

      const response = await vehicleService.getVehicles(params);
      const { data, meta } = response.data.data;

      setVehicles(data);
      setPageCount(meta.totalPages);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load vehicles";
      setError(errorMessage);
      console.error("Failed to fetch vehicles:", err);
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, statusFilter, typeFilter]);

  useEffect(() => {
    const load = async () => {
      await fetchVehicles();
    };
    void load();
  }, [fetchVehicles]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleUnassignVehicle = async (vehicleId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await vehicleService.unassignVehicle(vehicleId);
      fetchVehicles();
      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to unassign vehicle";
      return { success: false, error: errorMessage };
    }
  };

  return (
    <OpsManagerVehicleListPresenter
      vehicles={vehicles}
      error={error}
      pagination={pagination}
      pageCount={pageCount}
      onPaginationChange={setPagination}
      search={search}
      onSearchChange={handleSearch}
      statusFilter={statusFilter}
      onStatusFilterChange={handleStatusFilterChange}
      typeFilter={typeFilter}
      onTypeFilterChange={handleTypeFilterChange}
      onClearFilters={handleClearFilters}
      onUnassignVehicle={handleUnassignVehicle}
      onRefresh={fetchVehicles}
    />
  );
}

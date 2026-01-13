import type { VehicleStatus } from "@ahammedijas/fleet-os-shared";
import { useCallback, useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { vehicleService } from "@/services/vehicleService";
import type { Vehicle } from "@/types/vehicle.types";

import { VehicleListPresenter } from "./components/VehicleListPresenter";

export default function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    setError(null);
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
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, statusFilter, typeFilter]);

  useEffect(() => {
    fetchVehicles();
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

  const handleStatusUpdate = async (
    vehicleId: string,
    newStatus: VehicleStatus,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await vehicleService.updateVehicleStatus(vehicleId, newStatus);
      fetchVehicles();
      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update vehicle status";
      return { success: false, error: errorMessage };
    }
  };

  const handleArchiveVehicle = async (vehicleId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await vehicleService.archiveVehicle(vehicleId);
      fetchVehicles();
      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to archive vehicle";
      return { success: false, error: errorMessage };
    }
  };

  const handleCreateVehicle = () => {
    // TODO: Open create vehicle dialog/navigate to create page
    console.log("Create vehicle clicked");
  };

  return (
    <VehicleListPresenter
      vehicles={vehicles}
      loading={loading}
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
      onStatusUpdate={handleStatusUpdate}
      onArchiveVehicle={handleArchiveVehicle}
      onCreateVehicle={handleCreateVehicle}
    />
  );
}

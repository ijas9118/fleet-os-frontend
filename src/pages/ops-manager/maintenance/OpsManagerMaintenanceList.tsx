import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDebounce } from "@/hooks/useDebounce";
import { maintenanceService } from "@/services/maintenanceService";
import type { MaintenanceRecord } from "@/types/maintenance.types";

import { OpsManagerMaintenanceListPresenter } from "./components/OpsManagerMaintenanceListPresenter";

export default function OpsManagerMaintenanceList() {
  const navigate = useNavigate();
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebounce(search, 500);
  const [error, setError] = useState<string | null>(null);

  const fetchMaintenanceRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { page: number; limit: number; vehicleId?: string; status?: string } = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };

      if (debouncedSearch) {
        params.vehicleId = debouncedSearch;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await maintenanceService.getMaintenanceRecords(params);
      const { data, meta } = response.data.data;

      setMaintenanceRecords(data);
      setPageCount(meta.totalPages);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load maintenance records";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, statusFilter]);

  useEffect(() => {
    const load = async () => {
      await fetchMaintenanceRecords();
    };
    void load();
  }, [fetchMaintenanceRecords]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleViewDetails = (maintenanceId: string) => {
    navigate(`/ops-manager/maintenance/${maintenanceId}`);
  };

  return (
    <OpsManagerMaintenanceListPresenter
      maintenanceRecords={maintenanceRecords}
      loading={loading}
      error={error}
      pagination={pagination}
      pageCount={pageCount}
      onPaginationChange={setPagination}
      search={search}
      onSearchChange={handleSearch}
      statusFilter={statusFilter}
      onStatusFilterChange={handleStatusFilterChange}
      onClearFilters={handleClearFilters}
      onViewDetails={handleViewDetails}
      onRefresh={fetchMaintenanceRecords}
    />
  );
}

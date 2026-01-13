import { useCallback, useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { authService } from "@/services/authService";

import type { Driver } from "../../tenant/team/drivers/components/DriverColumns";
import { OpsManagerDriverListPresenter } from "./components/OpsManagerDriverListPresenter";

export default function OpsManagerDriverList() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
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

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await authService.getDrivers(params);
      const { data, meta } = response.data.result;

      const mappedDrivers: Driver[] = data.map((d) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        role: d.role,
        tenantId: d.tenantId,
        isActive: d.isActive,
        createdAt: d.createdAt,
        lastLoginAt: d.lastLoginAt,
      }));

      setDrivers(mappedDrivers);
      setPageCount(meta.totalPages);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load drivers";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

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

  return (
    <OpsManagerDriverListPresenter
      drivers={drivers}
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
    />
  );
}

import { useCallback, useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { authService } from "@/services/authService";

import type { Driver } from "./components/DriverColumns";
import { DriverListPresenter } from "./components/DriverListPresenter";

export default function DriverList() {
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

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "block" | "unblock";
    driver: Driver | null;
    loading: boolean;
  }>({
    open: false,
    type: "block",
    driver: null,
    loading: false,
  });

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

  const handleBlockDriver = (driver: Driver) => {
    setConfirmModal({
      open: true,
      type: "block",
      driver,
      loading: false,
    });
  };

  const handleUnblockDriver = (driver: Driver) => {
    setConfirmModal({
      open: true,
      type: "unblock",
      driver,
      loading: false,
    });
  };

  const [inviteModal, setInviteModal] = useState({
    open: false,
    loading: false,
  });

  const handleInviteDriver = async (data: { name: string; email: string }) => {
    setInviteModal((prev) => ({ ...prev, loading: true }));

    try {
      await authService.inviteUser({
        name: data.name,
        email: data.email,
        role: "DRIVER",
      });

      setInviteModal({ open: false, loading: false });
      fetchDrivers();
      return { success: true, email: data.email };
    } catch (error: unknown) {
      setInviteModal((prev) => ({ ...prev, loading: false }));
      const message = error instanceof Error ? error.message : "Failed to send invitation";
      return { success: false, error: message };
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.driver) return { success: false, error: "No driver selected" };

    setConfirmModal((prev) => ({ ...prev, loading: true }));

    try {
      if (confirmModal.type === "block") {
        await authService.blockDriver(confirmModal.driver.id);
      } else {
        await authService.unblockDriver(confirmModal.driver.id);
      }

      setConfirmModal({ open: false, type: "block", driver: null, loading: false });
      fetchDrivers();
      return { success: true, driverName: confirmModal.driver.name, action: confirmModal.type };
    } catch (error: unknown) {
      setConfirmModal((prev) => ({ ...prev, loading: false }));
      const message = error instanceof Error ? error.message : `Failed to ${confirmModal.type} driver`;
      return { success: false, error: message };
    }
  };

  return (
    <DriverListPresenter
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
      onBlockDriver={handleBlockDriver}
      onUnblockDriver={handleUnblockDriver}
      confirmModal={confirmModal}
      onConfirmModalChange={(open) => setConfirmModal((prev) => ({ ...prev, open }))}
      onConfirmAction={handleConfirmAction}
      inviteModal={inviteModal}
      onInviteModalChange={(open) => setInviteModal((prev) => ({ ...prev, open }))}
      onInviteDriver={handleInviteDriver}
    />
  );
}

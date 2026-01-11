import { useCallback, useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { authService } from "@/services/authService";

import type { OperationsManager } from "./components/OperationsManagerColumns";
import { OperationsManagerListPresenter } from "./components/OperationsManagerListPresenter";

export default function OperationsManagerList() {
  const [users, setUsers] = useState<OperationsManager[]>([]);
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
    user: OperationsManager | null;
    loading: boolean;
  }>({
    open: false,
    type: "block",
    user: null,
    loading: false,
  });

  const fetchOperationsManagers = useCallback(async () => {
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

      const response = await authService.getOperationsManagers(params);
      const { data, meta } = response.data.result;

      const mappedUsers: OperationsManager[] = data.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        tenantId: u.tenantId,
        isActive: u.isActive,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
      }));

      setUsers(mappedUsers);
      setPageCount(meta.totalPages);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load operations managers";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchOperationsManagers();
  }, [fetchOperationsManagers]);

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

  const handleBlockUser = (user: OperationsManager) => {
    setConfirmModal({
      open: true,
      type: "block",
      user,
      loading: false,
    });
  };

  const handleUnblockUser = (user: OperationsManager) => {
    setConfirmModal({
      open: true,
      type: "unblock",
      user,
      loading: false,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.user) return { success: false, error: "No user selected" };

    setConfirmModal((prev) => ({ ...prev, loading: true }));

    try {
      if (confirmModal.type === "block") {
        await authService.blockOperationsManager(confirmModal.user.id);
      } else {
        await authService.unblockOperationsManager(confirmModal.user.id);
      }

      setConfirmModal({ open: false, type: "block", user: null, loading: false });
      fetchOperationsManagers();
      return { success: true, userName: confirmModal.user.name, action: confirmModal.type };
    } catch (error: unknown) {
      setConfirmModal((prev) => ({ ...prev, loading: false }));
      const message = error instanceof Error ? error.message : `Failed to ${confirmModal.type} user`;
      return { success: false, error: message };
    }
  };

  return (
    <OperationsManagerListPresenter
      users={users}
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
      onBlockUser={handleBlockUser}
      onUnblockUser={handleUnblockUser}
      confirmModal={confirmModal}
      onConfirmModalChange={(open) => setConfirmModal((prev) => ({ ...prev, open }))}
      onConfirmAction={handleConfirmAction}
    />
  );
}

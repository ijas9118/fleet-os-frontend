import { useCallback, useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { authService } from "@/services/authService";

import type { User } from "./components/UserColumns";
import { UserListPresenter } from "./components/UserListPresenter";

interface Tenant {
  id: string;
  name: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tenantFilter, setTenantFilter] = useState("all");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const debouncedSearch = useDebounce(search, 500);
  const [error, setError] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "block" | "unblock";
    user: User | null;
    loading: boolean;
  }>({
    open: false,
    type: "block",
    user: null,
    loading: false,
  });

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await authService.getTenants({ page: 1, limit: 100 });
        const mappedTenants: Tenant[] = response.data.result.data.map((t) => ({
          id: t.tenantId,
          name: t.name,
        }));
        setTenants(mappedTenants);
      } catch (error) {
        console.error("Failed to fetch tenants:", error);
      }
    };

    fetchTenants();
  }, []);

  const fetchUsers = useCallback(async () => {
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

      if (roleFilter !== "all") {
        params.role = roleFilter;
      }

      if (tenantFilter !== "all") {
        params.tenantId = tenantFilter;
      }

      if (statusFilter !== "all") {
        params.isActive = statusFilter === "active" ? "true" : "false";
      }

      const response = await authService.getUsers(params);
      const { data, meta } = response.data.result;

      const mappedUsers: User[] = data.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        tenantId: u.tenantId,
        isActive: u.isActive,
        createdAt: u.createdAt,
      }));

      setUsers(mappedUsers);
      setPageCount(meta.totalPages);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load users";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, roleFilter, tenantFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleTenantFilterChange = (value: string) => {
    setTenantFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setTenantFilter("all");
    setStatusFilter("all");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleBlockUser = (user: User) => {
    setConfirmModal({
      open: true,
      type: "block",
      user,
      loading: false,
    });
  };

  const handleUnblockUser = (user: User) => {
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
        await authService.blockUser(confirmModal.user.id);
      } else {
        await authService.unblockUser(confirmModal.user.id);
      }

      setConfirmModal({ open: false, type: "block", user: null, loading: false });
      fetchUsers();
      return { success: true, userName: confirmModal.user.name, action: confirmModal.type };
    } catch (error: unknown) {
      setConfirmModal((prev) => ({ ...prev, loading: false }));
      const message = error instanceof Error ? error.message : `Failed to ${confirmModal.type} user`;
      return { success: false, error: message };
    }
  };

  return (
    <UserListPresenter
      users={users}
      loading={loading}
      error={error}
      pagination={pagination}
      pageCount={pageCount}
      onPaginationChange={setPagination}
      search={search}
      onSearchChange={handleSearch}
      roleFilter={roleFilter}
      onRoleFilterChange={handleRoleFilterChange}
      statusFilter={statusFilter}
      onStatusFilterChange={handleStatusFilterChange}
      tenantFilter={tenantFilter}
      onTenantFilterChange={handleTenantFilterChange}
      tenants={tenants}
      onClearFilters={handleClearFilters}
      onBlockUser={handleBlockUser}
      onUnblockUser={handleUnblockUser}
      confirmModal={confirmModal}
      onConfirmModalChange={(open) => setConfirmModal((prev) => ({ ...prev, open }))}
      onConfirmAction={handleConfirmAction}
    />
  );
}

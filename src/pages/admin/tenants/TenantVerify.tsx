import { useCallback, useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { authService } from "@/services/authService";

import type { PendingTenant } from "./components/TenantColumns";
import { TenantVerifyPresenter } from "./components/TenantVerifyPresenter";

export default function TenantVerify() {
  const [pendingTenants, setPendingTenants] = useState<PendingTenant[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "rejected">("pending");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPagination({
      pageIndex: 0,
      pageSize: 10,
    });
    setSearch("");
  }, [activeTab]);


  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch,
      };

      const response = activeTab === "pending" 
        ? await authService.getPendingTenants(params) 
        : await authService.getRejectedTenants(params);

      const { data, meta } = response.data.result;

      const mappedTenants: PendingTenant[] = data.map((t) => ({
        id: t.tenantId,
        name: t.name,
        email: t.contactEmail,
        submittedAt: new Date(t.createdAt).toLocaleDateString(),
        status: t.status === "ACTIVE" ? "Verified" : t.status
      }));
      setPendingTenants(mappedTenants);
      setPageCount(meta.totalPages);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch tenants";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.pageIndex, pagination.pageSize, debouncedSearch]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleApprove = async (tenant: PendingTenant) => {
    try {
      await authService.verifyTenant(tenant.id);
      setPendingTenants((prev) => prev.filter((t) => t.id !== tenant.id));
      return { success: true, tenantName: tenant.name };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to approve tenant";
      return { success: false, error: message };
    }
  };

  const confirmReject = async () => {
    if (!rejectId) return { success: false, error: "No tenant selected" };
    
    const tenant = pendingTenants.find(t => t.id === rejectId);
    try {
      await authService.rejectTenant(rejectId);
      setPendingTenants((prev) => prev.filter((t) => t.id !== rejectId));
      return { success: true, tenantName: tenant?.name || "Tenant" };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to reject tenant";
      return { success: false, error: message };
    } finally {
      setRejectId(null);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <TenantVerifyPresenter
      tenants={pendingTenants}
      loading={loading}
      error={error}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      pagination={pagination}
      pageCount={pageCount}
      onPaginationChange={setPagination}
      search={search}
      onSearchChange={handleSearch}
      onApprove={handleApprove}
      onReject={setRejectId}
      rejectId={rejectId}
      onRejectConfirm={confirmReject}
      onRejectCancel={(open) => !open && setRejectId(null)}
    />
  );
}

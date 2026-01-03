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

  useEffect(() => {
    setPagination({
      pageIndex: 0,
      pageSize: 10,
    });
    setSearch("");
  }, [activeTab]);


  const fetchTenants = useCallback(async () => {
    setLoading(true);
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
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.pageIndex, pagination.pageSize, debouncedSearch]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleApprove = async (id: string) => {
    try {
      await authService.verifyTenant(id);
      setPendingTenants((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to approve tenant:", error);
    }
  };

  const confirmReject = async () => {
    if (!rejectId) return;
    try {
      await authService.rejectTenant(rejectId);
      setPendingTenants((prev) => prev.filter((t) => t.id !== rejectId));
    } catch (error) {
      console.error("Failed to reject tenant:", error);
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

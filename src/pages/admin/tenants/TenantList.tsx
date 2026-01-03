import { useCallback, useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { authService } from "@/services/authService";

import type { Tenant } from "./components/TenantColumns";
import { TenantListPresenter } from "./components/TenantListPresenter";

export default function TenantList() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);


  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authService.getTenants({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch,
      });
      const { data, meta } = response.data.result;
      
      const mappedTenants: Tenant[] = data.map((t) => ({
        id: t.tenantId,
        name: t.name,
        email: t.contactEmail,
        status: t.status,
        industry: t.industry || "-",
      }));
      
      setTenants(mappedTenants);
      setPageCount(meta.totalPages);
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page on search
  };

  return (
    <TenantListPresenter
      tenants={tenants}
      loading={loading}
      pagination={pagination}
      pageCount={pageCount}
      onPaginationChange={setPagination}
      search={search}
      onSearchChange={handleSearch}
    />
  );
}

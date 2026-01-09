import { useCallback, useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { inventoryService } from "@/services/inventoryService";
import type { InventoryItem } from "@/types/inventoryItem";

import { InventoryItemListPresenter } from "./components/InventoryItemListPresenter";

export default function InventoryItemList() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 500);

  const fetchInventoryItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        includeArchived: includeArchived || undefined,
      };

      const response = await inventoryService.getInventoryItems(params);
      const { data, meta } = response.data.result;

      setItems(data);
      setPageCount(meta.totalPages);

      // Extract unique categories from items
      const uniqueCategories = Array.from(
        new Set(data.map(item => item.category).filter(Boolean) as string[])
      ).sort();
      setCategories(uniqueCategories);
    }
    catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load inventory items";
      setError(errorMessage);
      console.error("Failed to fetch inventory items:", err);
    }
    finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, statusFilter, categoryFilter, includeArchived]);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleToggleArchived = () => {
    setIncludeArchived((prev) => !prev);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setIncludeArchived(false);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleStatusUpdate = async (itemId: string, newStatus: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await inventoryService.updateInventoryItemStatus(itemId, newStatus);
      fetchInventoryItems();
      return { success: true };
    }
    catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update item status";
      return { success: false, error: errorMessage };
    }
  };

  const handleItemCreated = () => {
    fetchInventoryItems();
  };

  return (
    <InventoryItemListPresenter
      items={items}
      loading={loading}
      error={error}
      pagination={pagination}
      pageCount={pageCount}
      onPaginationChange={setPagination}
      search={search}
      onSearchChange={handleSearch}
      statusFilter={statusFilter}
      onStatusFilterChange={handleStatusFilterChange}
      categoryFilter={categoryFilter}
      onCategoryFilterChange={handleCategoryFilterChange}
      categories={categories}
      includeArchived={includeArchived}
      onToggleArchived={handleToggleArchived}
      onClearFilters={handleClearFilters}
      onStatusUpdate={handleStatusUpdate}
      onItemCreated={handleItemCreated}
    />
  );
}

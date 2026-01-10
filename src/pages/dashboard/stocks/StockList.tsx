import { useCallback, useEffect, useState } from "react";

import { inventoryService } from "@/services/inventoryService";
import type { InventoryItem } from "@/types/inventoryItem";
import type { Stock } from "@/types/stock";
import type { Warehouse } from "@/types/warehouse";

import { StockListPresenter } from "./components/StockListPresenter";

export default function StockList() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch warehouses and inventory items for dropdowns
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [warehousesRes, itemsRes] = await Promise.all([
          inventoryService.getWarehouses({ page: 1, limit: 100 }),
          inventoryService.getInventoryItems({ page: 1, limit: 100 }),
        ]);

        setWarehouses(warehousesRes.data.result.data);
        setInventoryItems(itemsRes.data.result.data);
      } catch (err) {
        console.error("Failed to fetch filter options:", err);
      }
    };

    fetchFilterOptions();
  }, []);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        warehouseId: warehouseFilter || undefined,
        inventoryItemId: itemFilter || undefined,
      };

      const response = await inventoryService.listStock(params);
      const { data, meta } = response.data.result;

      setStocks(data);
      setPageCount(meta.totalPages);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load stock records";
      setError(errorMessage);
      console.error("Failed to fetch stocks:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, warehouseFilter, itemFilter]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleWarehouseFilterChange = (value: string) => {
    setWarehouseFilter(value === "all" ? "" : value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleItemFilterChange = (value: string) => {
    setItemFilter(value === "all" ? "" : value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearFilters = () => {
    setWarehouseFilter("");
    setItemFilter("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <StockListPresenter
      stocks={stocks}
      warehouses={warehouses}
      inventoryItems={inventoryItems}
      loading={loading}
      error={error}
      pagination={pagination}
      pageCount={pageCount}
      onPaginationChange={setPagination}
      warehouseFilter={warehouseFilter}
      onWarehouseFilterChange={handleWarehouseFilterChange}
      itemFilter={itemFilter}
      onItemFilterChange={handleItemFilterChange}
      onClearFilters={handleClearFilters}
    />
  );
}

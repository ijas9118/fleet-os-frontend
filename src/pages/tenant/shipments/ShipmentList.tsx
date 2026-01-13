import { useCallback, useEffect, useState } from "react";

import { inventoryService } from "@/services/inventoryService";
import { shipmentService } from "@/services/shipmentService";
import type { ShipmentListItem } from "@/types/shipment";
import type { Warehouse } from "@/types/warehouse";

import { ShipmentListPresenter } from "./components/ShipmentListPresenter";

export default function ShipmentList() {
  const [shipments, setShipments] = useState<ShipmentListItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch warehouses for dropdown filter
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await inventoryService.getWarehouses({ page: 1, limit: 100 });
        setWarehouses(response.data.result.data);
      } catch (err) {
        console.error("Failed to fetch warehouses:", err);
      }
    };

    fetchWarehouses();
  }, []);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        status: statusFilter || undefined,
        warehouseId: warehouseFilter || undefined,
        search: searchTerm || undefined,
      };

      const response = await shipmentService.listShipments(params);
      const { data, meta } = response.data.result;

      setShipments(data);
      setPageCount(meta.totalPages);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load shipments";
      setError(errorMessage);
      console.error("Failed to fetch shipments:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, statusFilter, warehouseFilter, searchTerm]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? "" : value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleWarehouseFilterChange = (value: string) => {
    setWarehouseFilter(value === "all" ? "" : value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setWarehouseFilter("");
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <ShipmentListPresenter
      shipments={shipments}
      warehouses={warehouses}
      loading={loading}
      error={error}
      pagination={pagination}
      pageCount={pageCount}
      onPaginationChange={setPagination}
      statusFilter={statusFilter}
      onStatusFilterChange={handleStatusFilterChange}
      warehouseFilter={warehouseFilter}
      onWarehouseFilterChange={handleWarehouseFilterChange}
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      onClearFilters={handleClearFilters}
      onShipmentCreated={fetchShipments}
    />
  );
}

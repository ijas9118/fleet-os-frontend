import { useCallback, useEffect, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { authService } from "@/services/authService";
import { inventoryService } from "@/services/inventoryService";
import { shipmentService } from "@/services/shipmentService";
import type { UserResponse } from "@/types/auth.types";
import type { ShipmentListItem } from "@/types/shipment";
import type { Warehouse } from "@/types/warehouse";

import { OpsManagerShipmentListPresenter } from "./OpsManagerShipmentListPresenter";

interface Driver {
  id: string;
  name: string;
  email: string;
}

export default function OpsManagerShipmentList() {
  const [shipments, setShipments] = useState<ShipmentListItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 500);

  // Fetch warehouses for filter
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

  // Fetch drivers for assignment
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await authService.getDrivers({ page: 1, limit: 100, status: "active" });
        const mappedDrivers: Driver[] = response.data.result.data.map((d: UserResponse) => ({
          id: d.id,
          name: d.name,
          email: d.email,
        }));
        setDrivers(mappedDrivers);
      } catch (err) {
        console.error("Failed to fetch drivers:", err);
      }
    };
    fetchDrivers();
  }, []);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        // Filter out PENDING status - only show CONFIRMED, IN_TRANSIT, DELIVERED, CANCELLED
        status: statusFilter !== "all" ? statusFilter : undefined,
        warehouseId: warehouseFilter !== "all" ? warehouseFilter : undefined,
      };

      const response = await shipmentService.listShipments(params);
      const { data, meta } = response.data.result;

      // Additional client-side filter to exclude PENDING shipments
      const nonPendingShipments = data.filter((shipment) => shipment.status !== "PENDING");

      setShipments(nonPendingShipments);
      setPageCount(meta.totalPages);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load shipments";
      setError(errorMessage);
      console.error("Failed to fetch shipments:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, statusFilter, warehouseFilter]);

  useEffect(() => {
    const load = async () => {
      await fetchShipments();
    };
    void load();
  }, [fetchShipments]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleWarehouseFilterChange = (value: string) => {
    setWarehouseFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setWarehouseFilter("all");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <OpsManagerShipmentListPresenter
      shipments={shipments}
      warehouses={warehouses}
      drivers={drivers}
      loading={loading}
      error={error}
      pagination={pagination}
      pageCount={pageCount}
      onPaginationChange={setPagination}
      statusFilter={statusFilter}
      onStatusFilterChange={handleStatusFilterChange}
      warehouseFilter={warehouseFilter}
      onWarehouseFilterChange={handleWarehouseFilterChange}
      searchTerm={search}
      onSearchChange={handleSearchChange}
      onClearFilters={handleClearFilters}
      onShipmentCreated={fetchShipments}
      readOnlyMode={true}
    />
  );
}

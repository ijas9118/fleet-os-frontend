import { api } from "@/services/api";
import type { GetWarehousesParams, Warehouse, WarehousesResponse } from "@/types/warehouse";

export const inventoryService = {
  /**
   * Get paginated list of warehouses with optional search and status filter
   */
  getWarehouses: async (params: GetWarehousesParams) => {
    return api.get<WarehousesResponse>("/warehouses", { params });
  },

  /**
   * Create a new warehouse
   */
  createWarehouse: async (data: Partial<Omit<Warehouse, "id" | "tenantId" | "createdAt" | "updatedAt">>) => {
    return api.post("/warehouses", data);
  },

  /**
   * Get warehouse by ID
   */
  getWarehouseById: async (warehouseId: string) => {
    return api.get<{ message: string; data: Warehouse }>(`/warehouses/${warehouseId}`);
  },

  /**
   * Update warehouse status
   */
  updateWarehouseStatus: async (warehouseId: string, status: string) => {
    return api.patch(`/warehouses/${warehouseId}/status`, { status });
  },

  /**
   * Update warehouse details
   */
  updateWarehouse: async (warehouseId: string, data: Partial<Omit<Warehouse, "id" | "tenantId" | "createdAt" | "updatedAt">>) => {
    return api.put(`/warehouses/${warehouseId}`, data);
  },

  /**
   * Archive (soft delete) warehouse
   */
  archiveWarehouse: async (warehouseId: string) => {
    return api.delete(`/warehouses/${warehouseId}`);
  },
};


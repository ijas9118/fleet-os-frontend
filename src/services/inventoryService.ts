import { api } from "@/services/api";
import type { GetInventoryItemsParams, InventoryItem, InventoryItemsResponse } from "@/types/inventoryItem";
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

  // ============ Inventory Item Operations ============

  /**
   * Get paginated list of inventory items with optional search and filters
   */
  getInventoryItems: async (params: GetInventoryItemsParams) => {
    return api.get<InventoryItemsResponse>("/inventory-items", { params });
  },

  /**
   * Get inventory item by ID
   */
  getInventoryItemById: async (itemId: string) => {
    return api.get<{ message: string; data: InventoryItem }>(`/inventory-items/${itemId}`);
  },

  /**
   * Create a new inventory item
   */
  createInventoryItem: async (data: Partial<Omit<InventoryItem, "id" | "tenantId" | "createdAt" | "updatedAt">>) => {
    return api.post("/inventory-items", data);
  },

  /**
   * Update inventory item details
   */
  updateInventoryItem: async (itemId: string, data: Partial<Omit<InventoryItem, "id" | "tenantId" | "createdAt" | "updatedAt">>) => {
    return api.put(`/inventory-items/${itemId}`, data);
  },

  /**
   * Update inventory item status
   */
  updateInventoryItemStatus: async (itemId: string, status: string) => {
    return api.patch(`/inventory-items/${itemId}/status`, { status });
  },

  /**
   * Archive (soft delete) inventory item
   */
  archiveInventoryItem: async (itemId: string) => {
    return api.delete(`/inventory-items/${itemId}`);
  },
};


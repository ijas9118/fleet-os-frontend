import { api } from "@/services/api";
import type { GetInventoryItemsParams, InventoryItem, InventoryItemsResponse } from "@/types/inventoryItem";
import type {
  AddStockDTO,
  AdjustStockDTO,
  CreateStockRecordDTO,
  ListStockParams,
  RemoveStockDTO,
  StockListResponse,
  StockResponse,
  TransferStockDTO,
  TransferStockResponse,
} from "@/types/stock";
import type {
  ListStockTransactionsParams,
  StockTransactionResponse,
  StockTransactionsListResponse,
} from "@/types/stockTransaction";
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
  updateWarehouse: async (
    warehouseId: string,
    data: Partial<Omit<Warehouse, "id" | "tenantId" | "createdAt" | "updatedAt">>,
  ) => {
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
  updateInventoryItem: async (
    itemId: string,
    data: Partial<Omit<InventoryItem, "id" | "tenantId" | "createdAt" | "updatedAt">>,
  ) => {
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

  // ============ Stock Operations ============

  /**
   * Get paginated list of stock records with optional filters
   */
  listStock: async (params: ListStockParams) => {
    return api.get<StockListResponse>("/stocks", { params });
  },

  /**
   * Create a new stock record
   */
  createStockRecord: async (data: CreateStockRecordDTO) => {
    return api.post<StockResponse>("/stocks", data);
  },

  /**
   * Get single stock record by ID
   */
  getStock: async (stockId: string) => {
    return api.get<StockResponse>(`/stocks/${stockId}`);
  },

  /**
   * Get all stock for a specific warehouse
   */
  getWarehouseStock: async (warehouseId: string, params: { page: number; limit: number }) => {
    return api.get<StockListResponse>(`/stocks/warehouse/${warehouseId}`, { params });
  },

  /**
   * Add stock (IN transaction)
   */
  addStock: async (data: AddStockDTO) => {
    return api.post<StockResponse>("/stocks/add", data);
  },

  /**
   * Remove stock (OUT transaction)
   */
  removeStock: async (data: RemoveStockDTO) => {
    return api.post<StockResponse>("/stocks/remove", data);
  },

  /**
   * Adjust stock (ADJUSTMENT transaction)
   */
  adjustStock: async (data: AdjustStockDTO) => {
    return api.post<StockResponse>("/stocks/adjust", data);
  },

  /**
   * Transfer stock between warehouses
   */
  transferStock: async (data: TransferStockDTO) => {
    return api.post<TransferStockResponse>("/stocks/transfer", data);
  },

  // ============ Stock Transaction Operations ============

  /**
   * Get paginated list of stock transactions with optional filters
   */
  listStockTransactions: async (params: ListStockTransactionsParams) => {
    return api.get<StockTransactionsListResponse>("/stock-transactions", { params });
  },

  /**
   * Get single stock transaction by ID
   */
  getStockTransaction: async (transactionId: string) => {
    return api.get<StockTransactionResponse>(`/stock-transactions/${transactionId}`);
  },
};

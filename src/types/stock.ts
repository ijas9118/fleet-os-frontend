import { StockTransactionType } from "@ahammedijas/fleet-os-shared";

/**
 * Core Stock entity representing stock levels at a warehouse for a specific inventory item
 */
export interface Stock {
  id: string;
  tenantId: string;
  warehouseId: string;
  warehouse?: {
    id: string;
    name: string;
    code: string;
    status: string;
  };
  inventoryItemId: string;
  inventoryItem?: {
    id: string;
    sku: string;
    name: string;
    category?: string;
    unit: string;
  };
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing stocks with pagination and filters
 */
export interface ListStockParams {
  page: number;
  limit: number;
  warehouseId?: string;
  inventoryItemId?: string;
}

/**
 * Response from stock list endpoint
 */
export interface StockListResponse {
  message: string;
  result: {
    data: Stock[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Response from single stock endpoint
 */
export interface StockResponse {
  message: string;
  data: Stock;
}

/**
 * DTO for creating a stock record
 */
export interface CreateStockRecordDTO {
  warehouseId: string;
  inventoryItemId: string;
  initialQuantity?: number;
}

/**
 * DTO for adding stock (IN transaction)
 */
export interface AddStockDTO {
  warehouseId: string;
  inventoryItemId: string;
  quantity: number;
  notes?: string;
  referenceId?: string;
}

/**
 * DTO for removing stock (OUT transaction)
 */
export interface RemoveStockDTO {
  warehouseId: string;
  inventoryItemId: string;
  quantity: number;
  notes?: string;
  referenceId?: string;
}

/**
 * DTO for adjusting stock (ADJUSTMENT transaction)
 */
export interface AdjustStockDTO {
  warehouseId: string;
  inventoryItemId: string;
  adjustment: number; // Positive or negative
  notes?: string;
  referenceId?: string;
}

/**
 * DTO for transferring stock between warehouses
 */
export interface TransferStockDTO {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  inventoryItemId: string;
  quantity: number;
  notes?: string;
  referenceId?: string;
}

/**
 * Response from transfer stock operation
 */
export interface TransferStockResponse {
  message: string;
  data: {
    source: {
      id: string;
      warehouseId: string;
      quantity: number;
    };
    destination: {
      id: string;
      warehouseId: string;
      quantity: number;
    };
  };
}

// Re-export the StockTransactionType from shared package
export { StockTransactionType };

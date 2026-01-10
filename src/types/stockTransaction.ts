import { StockTransactionType } from "@ahammedijas/fleet-os-shared";

/**
 * Stock Transaction represents a record of stock movements (IN, OUT, TRANSFER, ADJUSTMENT)
 */
export interface StockTransaction {
  id: string;
  tenantId: string;
  warehouseId: string;
  warehouse: {
    id: string;
    name: string;
    code: string;
    status: string;
  };
  inventoryItemId: string;
  inventoryItem: {
    id: string;
    sku: string;
    name: string;
    category?: string;
    unit: string;
  };
  type: StockTransactionType;
  quantity: number;
  notes?: string;
  referenceId?: string;
  relatedTransactionId?: string; // For transfers (links OUT to IN)
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for listing stock transactions with pagination and filters
 */
export interface ListStockTransactionsParams {
  page: number;
  limit: number;
  warehouseId?: string;
  inventoryItemId?: string;
  type?: StockTransactionType;
  startDate?: string;
  endDate?: string;
}

/**
 * Response from stock transactions list endpoint
 */
export interface StockTransactionsListResponse {
  message: string;
  result: {
    data: StockTransaction[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Response from single stock transaction endpoint
 */
export interface StockTransactionResponse {
  message: string;
  data: StockTransaction;
}

// Re-export the StockTransactionType from shared package
export { StockTransactionType };

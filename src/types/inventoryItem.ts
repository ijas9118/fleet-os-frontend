import { InventoryItemStatus } from "@ahammedijas/fleet-os-shared";

export interface InventoryItem {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  status: InventoryItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GetInventoryItemsParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  category?: string;
}

export interface InventoryItemsResponse {
  message: string;
  result: {
    data: InventoryItem[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

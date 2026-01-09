import { WarehouseStatus } from "@ahammedijas/fleet-os-shared";

export interface Address {
  line1: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: Address;
  status: WarehouseStatus;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetWarehousesParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  includeArchived?: boolean;
}

export interface WarehousesResponse {
  message: string;
  result: {
    data: Warehouse[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

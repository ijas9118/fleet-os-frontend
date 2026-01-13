export interface Shipment {
  id: string;
  tenantId: string;
  warehouseId: string;
  trackingId: string;
  status: string;
  items: ShipmentItem[];
  customer: Customer;
  destinationAddress: Address;
  inventoryReservationId?: string;
  notes?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ShipmentItem {
  inventoryItemId: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Customer {
  name: string;
  email: string;
  phone?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface ShipmentListItem {
  id: string;
  tenantId: string;
  warehouseId: string;
  trackingId: string;
  status: string;
  itemCount: number;
  customerName: string;
  customerEmail: string;
  destinationCity: string;
  destinationCountry: string;
  inventoryReservationId?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ListShipmentsParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  warehouseId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  includeDeleted?: boolean;
}

export interface ShipmentsResponse {
  success: boolean;
  message: string;
  result: {
    data: ShipmentListItem[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ShipmentResponse {
  success: boolean;
  message: string;
  data: Shipment;
}

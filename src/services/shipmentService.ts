import { api } from "@/services/api";
import type { ListShipmentsParams, ShipmentResponse, ShipmentsResponse } from "@/types/shipment";

export const shipmentService = {
  /**
   * Get paginated list of shipments with optional search and filters
   */
  listShipments: async (params: ListShipmentsParams) => {
    return api.get<ShipmentsResponse>("/shipments", { params });
  },

  /**
   * Get shipment by ID
   */
  getShipment: async (shipmentId: string) => {
    return api.get<ShipmentResponse>(`/shipments/${shipmentId}`);
  },

  /**
   * Create a new shipment
   */
  createShipment: async (data: unknown) => {
    return api.post<ShipmentResponse>("/shipments", data);
  },

  /**
   * Update shipment details
   */
  updateShipment: async (shipmentId: string, data: unknown) => {
    return api.put<ShipmentResponse>(`/shipments/${shipmentId}`, data);
  },

  /**
   * Confirm shipment
   */
  confirmShipment: async (shipmentId: string) => {
    return api.post<ShipmentResponse>(`/shipments/${shipmentId}/confirm`);
  },

  /**
   * Delete shipment
   */
  deleteShipment: async (shipmentId: string) => {
    return api.delete(`/shipments/${shipmentId}`);
  },
};

import { api } from "@/services/api";
import type { GetVehiclesParams, Vehicle, VehicleFormData, VehiclesResponse } from "@/types/vehicle.types";

export const vehicleService = {
  /**
   * Get paginated list of vehicles with optional search and filters
   */
  getVehicles: async (params: GetVehiclesParams) => {
    return api.get<VehiclesResponse>("/fleet/vehicles", { params });
  },

  /**
   * Get vehicle by ID
   */
  getVehicleById: async (vehicleId: string) => {
    return api.get<{ message: string; data: Vehicle }>(`/fleet/vehicles/${vehicleId}`);
  },

  /**
   * Create a new vehicle
   */
  createVehicle: async (data: VehicleFormData) => {
    return api.post("/fleet/vehicles", data);
  },

  /**
   * Update vehicle details
   */
  updateVehicle: async (vehicleId: string, data: Partial<VehicleFormData>) => {
    return api.put(`/fleet/vehicles/${vehicleId}`, data);
  },

  /**
   * Update vehicle status
   */
  updateVehicleStatus: async (vehicleId: string, status: string) => {
    return api.patch(`/fleet/vehicles/${vehicleId}/status`, { status });
  },

  /**
   * Archive (soft delete) vehicle
   */
  archiveVehicle: async (vehicleId: string) => {
    return api.delete(`/fleet/vehicles/${vehicleId}`);
  },

  /**
   * Assign vehicle to driver
   */
  assignVehicleToDriver: async (vehicleId: string, driverId: string) => {
    return api.post(`/fleet/vehicles/${vehicleId}/assign`, { driverId });
  },

  /**
   * Unassign vehicle from driver
   */
  unassignVehicle: async (vehicleId: string) => {
    return api.post(`/fleet/vehicles/${vehicleId}/unassign`);
  },
};

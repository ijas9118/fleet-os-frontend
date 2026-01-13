import { api } from "@/services/api";
import type {
  CompleteMaintenanceFormData,
  GetMaintenanceRecordsParams,
  MaintenanceRecord,
  MaintenanceRecordsResponse,
  ScheduleMaintenanceFormData,
} from "@/types/maintenance.types";

export const maintenanceService = {
  /**
   * Get paginated list of maintenance records with optional filters
   */
  getMaintenanceRecords: async (params: GetMaintenanceRecordsParams) => {
    return api.get<MaintenanceRecordsResponse>("/fleet/maintenance", { params });
  },

  /**
   * Get maintenance record by ID
   */
  getMaintenanceRecordById: async (maintenanceId: string) => {
    return api.get<{ message: string; data: MaintenanceRecord }>(`/fleet/maintenance/${maintenanceId}`);
  },

  /**
   * Get maintenance history for a specific vehicle
   */
  getVehicleMaintenanceHistory: async (vehicleId: string) => {
    return api.get<{ message: string; data: MaintenanceRecord[] }>(`/fleet/vehicles/${vehicleId}/maintenance`);
  },

  /**
   * Schedule new maintenance for a vehicle
   */
  scheduleMaintenance: async (data: ScheduleMaintenanceFormData) => {
    return api.post("/fleet/maintenance", data);
  },

  /**
   * Complete a scheduled maintenance
   */
  completeMaintenance: async (maintenanceId: string, data: CompleteMaintenanceFormData) => {
    return api.patch(`/fleet/maintenance/${maintenanceId}/complete`, data);
  },

  /**
   * Update maintenance status
   */
  updateMaintenanceStatus: async (maintenanceId: string, status: string) => {
    return api.patch(`/fleet/maintenance/${maintenanceId}/status`, { status });
  },
};

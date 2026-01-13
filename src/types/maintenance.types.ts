import { MaintenanceStatus, MaintenanceType } from "@ahammedijas/fleet-os-shared";

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  tenantId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  description: string;
  cost?: number;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  performedBy?: string;
  mileageAtMaintenance?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetMaintenanceRecordsParams {
  page: number;
  limit: number;
  vehicleId?: string;
  status?: string;
}

export interface MaintenanceRecordsResponse {
  message: string;
  data: {
    data: MaintenanceRecord[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ScheduleMaintenanceFormData {
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  cost?: number;
  scheduledDate: string;
  notes?: string;
}

export interface CompleteMaintenanceFormData {
  performedBy: string;
  mileageAtMaintenance: number;
  actualCost?: number;
  notes?: string;
}

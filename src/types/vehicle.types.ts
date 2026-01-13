import { FuelType, VehicleStatus, VehicleType } from "@ahammedijas/fleet-os-shared";

export interface Vehicle {
  id: string;
  tenantId: string;
  registrationNumber: string;
  make: string;
  vehicleModel: string;
  year: number;
  vin: string;
  type: VehicleType;
  fuelType: FuelType;
  status: VehicleStatus;
  mileage: number;
  assignedDriverId?: string | null;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  insuranceExpiryDate: string;
  registrationExpiryDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface GetVehiclesParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  type?: string;
  assignedDriverId?: string;
}

export interface VehiclesResponse {
  success: boolean;
  message: string;
  data: {
    data: Vehicle[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface VehicleFormData {
  registrationNumber: string;
  make: string;
  vehicleModel: string;
  year: number;
  vin: string;
  type: VehicleType;
  fuelType: FuelType;
  mileage?: number;
  insuranceExpiryDate: string;
  registrationExpiryDate: string;
  notes?: string;
}

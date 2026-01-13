import { VehicleStatus } from "@ahammedijas/fleet-os-shared";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import { AlertTriangle, ArrowLeft, Car, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { vehicleService } from "@/services/vehicleService";
import type { Vehicle } from "@/types/vehicle.types";

import { EditVehicleDialog } from "./components/EditVehicleDialog";

const getStatusVariant = (status: VehicleStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case VehicleStatus.AVAILABLE:
      return "default";
    case VehicleStatus.ASSIGNED:
      return "secondary";
    case VehicleStatus.MAINTENANCE:
      return "destructive";
    case VehicleStatus.OUT_OF_SERVICE:
      return "outline";
    default:
      return "outline";
  }
};

const getExpiryWarning = (expiryDate: string) => {
  const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());

  if (daysUntilExpiry < 0) {
    return { variant: "destructive" as const, message: "Expired" };
  } else if (daysUntilExpiry <= 30) {
    return { variant: "destructive" as const, message: `Expires in ${daysUntilExpiry} days` };
  } else if (daysUntilExpiry <= 60) {
    return { variant: "default" as const, message: `Expires in ${daysUntilExpiry} days` };
  }
  return null;
};

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicleDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await vehicleService.getVehicleById(id);
      setVehicle(response.data.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load vehicle details";
      setError(errorMessage);
      console.error("Failed to fetch vehicle:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVehicleDetails();
  }, [fetchVehicleDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/tenant/vehicles")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vehicles
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error || "Vehicle not found"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const insuranceWarning = getExpiryWarning(vehicle.insuranceExpiryDate);
  const registrationWarning = getExpiryWarning(vehicle.registrationExpiryDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => navigate("/tenant/vehicles")}
            className="mb-2 pl-0 hover:pl-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vehicles
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">
              {vehicle.make} {vehicle.vehicleModel}
            </h2>
            <Badge variant={getStatusVariant(vehicle.status)} className="mt-1">
              {vehicle.status}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono flex items-center gap-2">
            <Car className="w-4 h-4" />
            {vehicle.registrationNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EditVehicleDialog vehicle={vehicle} onVehicleUpdated={fetchVehicleDetails} />
        </div>
      </div>

      {/* Expiry Warnings */}
      {(insuranceWarning || registrationWarning) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {insuranceWarning && <div>Insurance {insuranceWarning.message.toLowerCase()}</div>}
            {registrationWarning && <div>Registration {registrationWarning.message.toLowerCase()}</div>}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Vehicle Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>Technical details and specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase">Basic Details</h4>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Registration Number</p>
                    <p className="text-base font-medium font-mono">{vehicle.registrationNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">VIN</p>
                    <p className="text-base font-medium font-mono">{vehicle.vin}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Make & Model</p>
                    <p className="text-base font-medium">
                      {vehicle.make} {vehicle.vehicleModel}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="text-base font-medium">{vehicle.year}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="secondary">{vehicle.type}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fuel Type</p>
                    <Badge variant="secondary">{vehicle.fuelType}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={getStatusVariant(vehicle.status)}>{vehicle.status}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Mileage</p>
                    <p className="text-base font-medium">{vehicle.mileage?.toLocaleString()} km</p>
                  </div>
                </div>

                {vehicle.notes && (
                  <div className="space-y-1 pt-2">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-base leading-relaxed">{vehicle.notes}</p>
                  </div>
                )}
              </div>

              {/* Compliance Section */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase">Legal & Compliance</h4>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Insurance Expiry</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                      {new Date(vehicle.insuranceExpiryDate).toLocaleDateString()}
                    </p>
                    {insuranceWarning && (
                      <Badge variant={insuranceWarning.variant} className="mt-2 text-xs">
                        {insuranceWarning.message}
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Registration Expiry</p>
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                      {new Date(vehicle.registrationExpiryDate).toLocaleDateString()}
                    </p>
                    {registrationWarning && (
                      <Badge variant={registrationWarning.variant} className="mt-2 text-xs">
                        {registrationWarning.message}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata Section */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Created</h4>
                  <p className="text-sm font-medium">
                    {formatDistanceToNow(new Date(vehicle.createdAt), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(vehicle.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Last Updated</h4>
                  <p className="text-sm font-medium">
                    {formatDistanceToNow(new Date(vehicle.updatedAt), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(vehicle.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Assigned Driver Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Driver</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.assignedDriverId ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Driver ID: {vehicle.assignedDriverId}</p>
                    <p className="text-xs text-muted-foreground">Currently assigned</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No driver assigned</p>
                  <p className="text-xs text-muted-foreground">This vehicle is available for assignment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maintenance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicle.lastMaintenanceDate && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Last Maintenance</p>
                    <p className="text-sm font-medium">
                      {formatDistanceToNow(new Date(vehicle.lastMaintenanceDate), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(vehicle.lastMaintenanceDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {vehicle.nextMaintenanceDate && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Next Maintenance</p>
                    <p className="text-sm font-medium">
                      {formatDistanceToNow(new Date(vehicle.nextMaintenanceDate), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(vehicle.nextMaintenanceDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {!vehicle.lastMaintenanceDate && !vehicle.nextMaintenanceDate && (
                  <p className="text-sm text-muted-foreground text-center py-4">No maintenance records available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

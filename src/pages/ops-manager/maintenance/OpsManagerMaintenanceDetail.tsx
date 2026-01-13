import { MaintenanceStatus, MaintenanceType } from "@ahammedijas/fleet-os-shared";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Calendar, Car, CheckCircle2, Clock, DollarSign, User, Wrench, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { maintenanceService } from "@/services/maintenanceService";
import type { MaintenanceRecord } from "@/types/maintenance.types";

import { CompleteMaintenanceDialog } from "../vehicles/components/CompleteMaintenanceDialog";

const getStatusBadge = (status: MaintenanceStatus) => {
  switch (status) {
    case MaintenanceStatus.SCHEDULED:
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          Scheduled
        </Badge>
      );
    case MaintenanceStatus.IN_PROGRESS:
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
          <Wrench className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    case MaintenanceStatus.COMPLETED:
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    case MaintenanceStatus.CANCELLED:
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const maintenanceTypeLabels: Record<MaintenanceType, string> = {
  [MaintenanceType.OIL_CHANGE]: "Oil Change",
  [MaintenanceType.TIRE_ROTATION]: "Tire Rotation",
  [MaintenanceType.BRAKE_SERVICE]: "Brake Service",
  [MaintenanceType.ENGINE_SERVICE]: "Engine Service",
  [MaintenanceType.TRANSMISSION_SERVICE]: "Transmission Service",
  [MaintenanceType.BATTERY_REPLACEMENT]: "Battery Replacement",
  [MaintenanceType.AIR_FILTER_REPLACEMENT]: "Air Filter Replacement",
  [MaintenanceType.GENERAL_INSPECTION]: "General Inspection",
  [MaintenanceType.REPAIR]: "Repair",
  [MaintenanceType.OTHER]: "Other",
};

export default function OpsManagerMaintenanceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [maintenance, setMaintenance] = useState<MaintenanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [completeDialog, setCompleteDialog] = useState({
    open: false,
    maintenanceId: "",
    vehicleId: "",
    vehicleRegistration: "",
  });

  const fetchMaintenanceDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await maintenanceService.getMaintenanceRecordById(id);
      setMaintenance(response.data.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load maintenance details";
      setError(errorMessage);
      console.error("Failed to fetch maintenance:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMaintenanceDetails();
  }, [fetchMaintenanceDetails]);

  const handleUpdateStatus = async (status: MaintenanceStatus) => {
    if (!maintenance) return;

    try {
      await maintenanceService.updateMaintenanceStatus(maintenance.id!, status);
      toast.success("Maintenance status updated successfully");
      fetchMaintenanceDetails();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update status";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !maintenance) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/ops-manager/maintenance")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Maintenance
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error || "Maintenance record not found"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canComplete =
    maintenance.status === MaintenanceStatus.SCHEDULED || maintenance.status === MaintenanceStatus.IN_PROGRESS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => navigate("/ops-manager/maintenance")}
            className="mb-2 pl-0 hover:pl-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Maintenance
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{maintenanceTypeLabels[maintenance.type]}</h2>
            {getStatusBadge(maintenance.status)}
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <Car className="w-4 h-4" />
            Vehicle: {maintenance.vehicleId.slice(0, 8)}...
          </p>
        </div>
        <div className="flex items-center gap-2">
          {maintenance.status === MaintenanceStatus.SCHEDULED && (
            <Button variant="outline" onClick={() => handleUpdateStatus(MaintenanceStatus.IN_PROGRESS)}>
              <Wrench className="w-4 h-4 mr-2" />
              Mark In Progress
            </Button>
          )}
          {canComplete && (
            <Button
              onClick={() =>
                setCompleteDialog({
                  open: true,
                  maintenanceId: maintenance.id!,
                  vehicleId: maintenance.vehicleId,
                  vehicleRegistration: "N/A",
                })
              }
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Maintenance
            </Button>
          )}
          {(maintenance.status === MaintenanceStatus.SCHEDULED ||
            maintenance.status === MaintenanceStatus.IN_PROGRESS) && (
            <Button variant="destructive" onClick={() => handleUpdateStatus(MaintenanceStatus.CANCELLED)}>
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Maintenance Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Information</CardTitle>
              <CardDescription>Details about this maintenance record</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase">Basic Details</h4>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="secondary" className="text-sm">
                      {maintenanceTypeLabels[maintenance.type]}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(maintenance.status)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Scheduled Date</p>
                    <p className="text-base font-medium">
                      {new Date(maintenance.scheduledDate).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(maintenance.scheduledDate), { addSuffix: true })}
                    </p>
                  </div>
                  {maintenance.completedAt && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Completed Date</p>
                      <p className="text-base font-medium">
                        {new Date(maintenance.completedAt).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(maintenance.completedAt), { addSuffix: true })}
                      </p>
                    </div>
                  )}
                </div>

                {maintenance.description && (
                  <div className="space-y-1 pt-2">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-base leading-relaxed">{maintenance.description}</p>
                  </div>
                )}
              </div>

              {/* Cost Section */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase">Cost Details</h4>

                <div className="grid grid-cols-2 gap-6">
                  {maintenance.cost !== undefined && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                      <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Estimated Cost</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        ${maintenance.cost.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              {(maintenance.performedBy || maintenance.mileageAtMaintenance || maintenance.notes) && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Additional Information</h4>

                  <div className="grid grid-cols-2 gap-6">
                    {maintenance.performedBy && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Performed By</p>
                        <p className="text-base font-medium">{maintenance.performedBy}</p>
                      </div>
                    )}
                    {maintenance.mileageAtMaintenance !== undefined && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Mileage at Maintenance</p>
                        <p className="text-base font-medium">{maintenance.mileageAtMaintenance.toLocaleString()} km</p>
                      </div>
                    )}
                  </div>

                  {maintenance.notes && (
                    <div className="space-y-1 pt-2">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-base leading-relaxed">{maintenance.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Metadata Section */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Created</h4>
                  <p className="text-sm font-medium">
                    {formatDistanceToNow(new Date(maintenance.createdAt!), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(maintenance.createdAt!).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Last Updated</h4>
                  <p className="text-sm font-medium">
                    {formatDistanceToNow(new Date(maintenance.updatedAt!), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(maintenance.updatedAt!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${maintenance.createdAt ? "bg-blue-500" : "bg-gray-300"}`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Scheduled</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(maintenance.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      maintenance.status === MaintenanceStatus.IN_PROGRESS ||
                      maintenance.status === MaintenanceStatus.COMPLETED
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">In Progress</p>
                    <p className="text-xs text-muted-foreground">
                      {maintenance.status === MaintenanceStatus.IN_PROGRESS ||
                      maintenance.status === MaintenanceStatus.COMPLETED
                        ? "Started"
                        : "Not started"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      maintenance.status === MaintenanceStatus.COMPLETED ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-xs text-muted-foreground">
                      {maintenance.completedAt
                        ? new Date(maintenance.completedAt).toLocaleDateString()
                        : "Not completed"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Scheduled For</span>
                </div>
                <span className="text-sm font-medium">
                  {formatDistanceToNow(new Date(maintenance.scheduledDate), { addSuffix: true })}
                </span>
              </div>

              {maintenance.cost !== undefined && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Estimated</span>
                  </div>
                  <span className="text-sm font-medium">${maintenance.cost.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Performed By</span>
                </div>
                <span className="text-sm font-medium">{maintenance.performedBy || "Not assigned"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Complete Maintenance Dialog */}
      <CompleteMaintenanceDialog
        open={completeDialog.open}
        onOpenChange={(open) => setCompleteDialog((prev) => ({ ...prev, open }))}
        maintenanceId={completeDialog.maintenanceId}
        vehicleInfo={{
          id: completeDialog.vehicleId,
          registration: completeDialog.vehicleRegistration,
        }}
        onSuccess={() => {
          fetchMaintenanceDetails();
          setCompleteDialog({ open: false, maintenanceId: "", vehicleId: "", vehicleRegistration: "" });
        }}
      />
    </div>
  );
}

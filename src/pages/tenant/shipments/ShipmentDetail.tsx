import { format } from "date-fns";
import { ArrowLeft, CheckCircle, MapPin, Package, Truck, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { shipmentService } from "@/services/shipmentService";
import type { Shipment } from "@/types/shipment";

import { UpdateShipmentDialog } from "./components/UpdateShipmentDialog";

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "delivered":
      return "default";
    case "in_transit":
    case "confirmed":
      return "secondary";
    case "pending":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
};

const formatStatus = (status: string): string => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function ShipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const fetchShipmentDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await shipmentService.getShipment(id);
      setShipment(response.data.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load shipment details";
      setError(errorMessage);
      console.error("Failed to fetch shipment:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleConfirmShipment = async () => {
    if (!id) return;

    setIsConfirming(true);
    try {
      await shipmentService.confirmShipment(id);
      toast.success("Shipment confirmed successfully");
      setShowConfirmModal(false);
      await fetchShipmentDetails(); // Refresh to get updated status
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to confirm shipment";
      toast.error(errorMessage);
      console.error("Failed to confirm shipment:", err);
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    fetchShipmentDetails();
  }, [fetchShipmentDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/tenant/shipments")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shipments
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error || "Shipment not found"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canConfirm = shipment.status === "PENDING";

  return (
    <div className="space-y-6">
      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title="Confirm Shipment"
        description={
          <div className="space-y-2">
            <p>Are you sure you want to confirm this shipment?</p>
            <p className="text-sm">
              <strong>Tracking ID:</strong> {shipment.trackingId}
            </p>
            <p className="text-sm text-muted-foreground">
              This will change the shipment status from Pending to Confirmed and prepare it for dispatch.
            </p>
          </div>
        }
        confirmText="Confirm Shipment"
        cancelText="Cancel"
        onConfirm={handleConfirmShipment}
        variant="default"
        loading={isConfirming}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => navigate("/tenant/shipments")}
            className="mb-2 pl-0 hover:pl-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shipments
          </Button>
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-muted-foreground" />
            <h2 className="text-3xl font-bold tracking-tight">{shipment.trackingId}</h2>
            <Badge variant={getStatusVariant(shipment.status)} className="mt-1">
              {formatStatus(shipment.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">Shipment Details</p>
        </div>
        <div className="flex items-center gap-2">
          {canConfirm && (
            <Button onClick={() => setShowConfirmModal(true)} variant="default">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Shipment
            </Button>
          )}
          <UpdateShipmentDialog shipment={shipment} onShipmentUpdated={fetchShipmentDetails} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Details about the recipient</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <User className="w-5 h-5 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{shipment.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{shipment.customer.email}</p>
                    {shipment.customer.phone && (
                      <p className="text-sm text-muted-foreground">{shipment.customer.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Destination Address</h4>
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <MapPin className="w-5 h-5 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{shipment.destinationAddress.street}</p>
                      <p className="text-muted-foreground">
                        {shipment.destinationAddress.city}
                        {shipment.destinationAddress.state && `, ${shipment.destinationAddress.state}`}
                        {shipment.destinationAddress.postalCode && ` ${shipment.destinationAddress.postalCode}`}
                      </p>
                      <p className="text-muted-foreground">{shipment.destinationAddress.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipment Items Card */}
          <Card>
            <CardHeader>
              <CardTitle>Shipment Items</CardTitle>
              <CardDescription>Items included in this shipment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shipment.items.map((item, index) => (
                  <div key={index} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-start gap-3 flex-1">
                      <Package className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-base">{item.name}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">SKU:</span> <span className="font-mono">{item.sku}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Quantity:</span> {item.quantity} {item.unit}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          ID: <span className="font-mono">{item.inventoryItemId}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Details Card */}
          {shipment.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{shipment.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Side Column for stats/info */}
        <div className="space-y-6">
          {/* Shipment Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Warehouse ID</span>
                  <span className="font-mono font-medium">{shipment.warehouseId}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-semibold">{shipment.items.length}</span>
                </div>
                {shipment.inventoryReservationId && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Reservation ID</span>
                    <span className="font-mono text-xs">{shipment.inventoryReservationId.slice(0, 8)}...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shipment.estimatedDeliveryDate && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Estimated Delivery</h4>
                  <p className="text-sm font-medium">
                    {format(new Date(shipment.estimatedDeliveryDate), "MMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(shipment.estimatedDeliveryDate), "EEEE, h:mm a")}
                  </p>
                </div>
              )}
              {shipment.actualDeliveryDate && (
                <div className="space-y-1 pt-2 border-t">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Actual Delivery</h4>
                  <p className="text-sm font-medium">{format(new Date(shipment.actualDeliveryDate), "MMM dd, yyyy")}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(shipment.actualDeliveryDate), "EEEE, h:mm a")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shipment.createdAt && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Created</h4>
                  <p className="text-sm font-medium">{format(new Date(shipment.createdAt), "MMM dd, yyyy")}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(shipment.createdAt), "h:mm a")}</p>
                </div>
              )}
              {shipment.updatedAt && (
                <div className="space-y-1 pt-2 border-t">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Last Updated</h4>
                  <p className="text-sm font-medium">{format(new Date(shipment.updatedAt), "MMM dd, yyyy")}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(shipment.updatedAt), "h:mm a")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

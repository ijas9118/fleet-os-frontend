import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MapPin, Package, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ShipmentListItem } from "@/types/shipment";

interface DriverShipmentColumnsProps {
  onUpdateStatus?: (shipmentId: string, currentStatus: string) => void;
}

/**
 * Get status badge variant based on shipment status
 */
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "delivered":
      return "default";
    case "in_transit":
    case "picked":
      return "secondary";
    case "confirmed":
      return "outline";
    case "cancelled":
    case "returned":
      return "destructive";
    default:
      return "outline";
  }
};

/**
 * Format status text for display
 */
const formatStatus = (status: string): string => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const getDriverShipmentColumns = ({
  onUpdateStatus,
}: DriverShipmentColumnsProps): ColumnDef<ShipmentListItem>[] => {
  return [
    {
      accessorKey: "trackingId",
      header: "Tracking ID",
      cell: ({ row }) => {
        const trackingId = row.getValue("trackingId") as string;
        return (
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono font-medium">{trackingId}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant={getStatusVariant(status)}>{formatStatus(status)}</Badge>;
      },
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const shipment = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{shipment.customerName}</span>
            <span className="text-xs text-muted-foreground">{shipment.customerEmail}</span>
          </div>
        );
      },
    },
    {
      id: "destination",
      header: "Destination",
      cell: ({ row }) => {
        const shipment = row.original;
        return (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="font-medium">{shipment.destinationCity}</span>
              <span className="text-xs text-muted-foreground">{shipment.destinationCountry}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "itemCount",
      header: "Items",
      cell: ({ row }) => {
        const itemCount = row.getValue("itemCount") as number;
        return (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{itemCount}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "estimatedDeliveryDate",
      header: "Est. Delivery",
      cell: ({ row }) => {
        const date = row.getValue("estimatedDeliveryDate") as Date | undefined;
        if (!date) return <span className="text-muted-foreground">-</span>;
        return <span className="text-sm">{format(new Date(date), "MMM dd, yyyy")}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const shipment = row.original;

        return (
          <div className="flex items-center gap-2">
            {onUpdateStatus && (
              <Button variant="outline" size="sm" onClick={() => onUpdateStatus(shipment.id, shipment.status)}>
                Update Status
              </Button>
            )}
          </div>
        );
      },
    },
  ];
};

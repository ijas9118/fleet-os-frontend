import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, Package, Truck, UserCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ShipmentListItem } from "@/types/shipment";

import { AssignDriverDialog } from "./AssignDriverDialog";

interface Driver {
  id: string;
  name: string;
  email: string;
}

interface OpsManagerShipmentColumnsProps {
  onViewDetails: (shipmentId: string) => void;
  drivers: Driver[];
  onAssignmentSuccess: () => void;
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
    case "confirmed":
    case "picked":
      return "secondary";
    case "pending":
      return "outline";
    case "cancelled":
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

export const getOpsManagerShipmentColumns = ({
  onViewDetails,
  drivers,
  onAssignmentSuccess,
}: OpsManagerShipmentColumnsProps): ColumnDef<ShipmentListItem>[] => {
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
      id: "driver",
      header: "Assigned Driver",
      cell: ({ row }) => {
        const shipment = row.original;
        if (shipment.driverName) {
          return (
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="font-medium">{shipment.driverName}</span>
            </div>
          );
        }
        return <span className="text-muted-foreground text-sm">Not assigned</span>;
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
          <div className="flex flex-col">
            <span className="font-medium">{shipment.destinationCity}</span>
            <span className="text-xs text-muted-foreground">{shipment.destinationCountry}</span>
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
        const isConfirmed = shipment.status === "CONFIRMED";
        const hasDriver = !!shipment.driverId;

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(shipment.id)} className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
              <span className="sr-only">View details</span>
            </Button>
            {isConfirmed && !hasDriver && (
              <AssignDriverDialog
                shipmentId={shipment.id}
                trackingId={shipment.trackingId}
                drivers={drivers}
                onAssignmentSuccess={onAssignmentSuccess}
              />
            )}
          </div>
        );
      },
    },
  ];
};

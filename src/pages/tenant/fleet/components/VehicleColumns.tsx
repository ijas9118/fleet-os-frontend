import { VehicleStatus, VehicleType } from "@ahammedijas/fleet-os-shared";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Car, Eye, MoreHorizontal, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Vehicle } from "@/types/vehicle.types";

const getStatusVariant = (status: VehicleStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case VehicleStatus.AVAILABLE:
      return "default";
    case VehicleStatus.ASSIGNED:
      return "secondary";
    case VehicleStatus.MAINTENANCE:
      return "outline";
    case VehicleStatus.OUT_OF_SERVICE:
      return "destructive";
    default:
      return "outline";
  }
};

const getTypeIcon = (type: VehicleType) => {
  switch (type) {
    case VehicleType.TRUCK:
    case VehicleType.VAN:
    case VehicleType.PICKUP:
      return <Truck className="w-4 h-4" />;
    default:
      return <Car className="w-4 h-4" />;
  }
};

interface VehicleColumnsProps {
  onStatusChange: (vehicle: Vehicle, newStatus: VehicleStatus) => void;
  onViewDetails: (vehicleId: string) => void;
  onArchiveVehicle: (vehicle: Vehicle) => void;
}

export const getVehicleColumns = ({
  onStatusChange,
  onViewDetails,
  onArchiveVehicle,
}: VehicleColumnsProps): ColumnDef<Vehicle>[] => {
  return [
    {
      accessorKey: "registrationNumber",
      header: "Registration",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <div className="flex items-center gap-2 font-medium">
            {getTypeIcon(type)}
            <span>{row.getValue("registrationNumber")}</span>
          </div>
        );
      },
    },
    {
      id: "vehicle",
      header: "Vehicle",
      cell: ({ row }) => {
        const { make, vehicleModel, year } = row.original;
        return (
          <div>
            <div className="font-medium">
              {make} {vehicleModel}
            </div>
            <div className="text-sm text-muted-foreground">{year}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return <span className="text-sm capitalize">{type.replace(/_/g, " ")}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as VehicleStatus;
        return (
          <Badge variant={getStatusVariant(status)} className="capitalize">
            {status.replace(/_/g, " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "mileage",
      header: "Mileage",
      cell: ({ row }) => {
        const mileage = row.getValue("mileage") as number;
        return <span className="text-sm">{mileage.toLocaleString()} km</span>;
      },
    },
    {
      id: "assignment",
      header: "Assignment",
      cell: ({ row }) => {
        const assignedDriverId = row.original.assignedDriverId;
        return <span className="text-sm text-muted-foreground">{assignedDriverId ? "Assigned" : "Unassigned"}</span>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(date), { addSuffix: true })}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const vehicle = row.original;
        const currentStatus = vehicle.status;

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(vehicle.id)} className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
              <span className="sr-only">View details</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {currentStatus !== VehicleStatus.AVAILABLE && (
                  <DropdownMenuItem onClick={() => onStatusChange(vehicle, VehicleStatus.AVAILABLE)}>
                    Set as Available
                  </DropdownMenuItem>
                )}
                {currentStatus !== VehicleStatus.MAINTENANCE && (
                  <DropdownMenuItem onClick={() => onStatusChange(vehicle, VehicleStatus.MAINTENANCE)}>
                    Set as Maintenance
                  </DropdownMenuItem>
                )}
                {currentStatus !== VehicleStatus.OUT_OF_SERVICE && (
                  <DropdownMenuItem
                    onClick={() => onStatusChange(vehicle, VehicleStatus.OUT_OF_SERVICE)}
                    className="text-destructive focus:text-destructive"
                  >
                    Set Out of Service
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onArchiveVehicle(vehicle)}
                  className="text-destructive focus:text-destructive"
                >
                  Archive Vehicle
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
};

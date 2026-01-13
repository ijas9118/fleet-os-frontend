import { VehicleStatus, VehicleType } from "@ahammedijas/fleet-os-shared";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Car, Eye, MoreHorizontal, Truck, UserCheck, UserMinus } from "lucide-react";

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

interface OpsManagerVehicleColumnsProps {
  onViewDetails: (vehicleId: string) => void;
  onAssignDriver: (vehicle: Vehicle) => void;
  onUnassignVehicle: (vehicle: Vehicle) => void;
  onScheduleMaintenance: (vehicle: Vehicle) => void;
}

export const getOpsManagerVehicleColumns = ({
  onViewDetails,
  onAssignDriver,
  onUnassignVehicle,
  onScheduleMaintenance,
}: OpsManagerVehicleColumnsProps): ColumnDef<Vehicle>[] => {
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
      id: "assignment",
      header: "Assignment",
      cell: ({ row }) => {
        const assignedDriverId = row.original.assignedDriverId;
        return (
          <div className="flex items-center gap-2">
            {assignedDriverId ? (
              <>
                <UserCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Assigned</span>
              </>
            ) : (
              <>
                <UserMinus className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Available</span>
              </>
            )}
          </div>
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
        const isAssigned = !!vehicle.assignedDriverId;

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
                <DropdownMenuLabel>Driver Assignment</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isAssigned && vehicle.status === VehicleStatus.AVAILABLE && (
                  <DropdownMenuItem onClick={() => onAssignDriver(vehicle)}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Assign Driver
                  </DropdownMenuItem>
                )}
                {isAssigned && (
                  <DropdownMenuItem
                    onClick={() => onUnassignVehicle(vehicle)}
                    className="text-orange-600 focus:text-orange-600"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Unassign Driver
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onScheduleMaintenance(vehicle)}>
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Schedule Maintenance
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
};

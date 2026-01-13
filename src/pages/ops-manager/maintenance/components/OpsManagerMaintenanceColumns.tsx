import { MaintenanceStatus, MaintenanceType } from "@ahammedijas/fleet-os-shared";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Clock, Eye, MoreHorizontal, Wrench, XCircle } from "lucide-react";

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
import type { MaintenanceRecord } from "@/types/maintenance.types";

interface OpsManagerMaintenanceColumnsProps {
  onViewDetails: (maintenanceId: string) => void;
  onCompleteMaintenance: (maintenance: MaintenanceRecord) => void;
  onUpdateStatus: (maintenanceId: string, status: MaintenanceStatus) => void;
}

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

export const getOpsManagerMaintenanceColumns = ({
  onViewDetails,
  onCompleteMaintenance,
  onUpdateStatus,
}: OpsManagerMaintenanceColumnsProps): ColumnDef<MaintenanceRecord>[] => [
  {
    accessorKey: "vehicleId",
    header: "Vehicle",
    cell: ({ row }) => {
      const vehicleId = row.getValue("vehicleId") as string;
      return <div className="font-medium font-mono text-sm">{vehicleId.slice(0, 8)}...</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as MaintenanceType;
      return <Badge variant="secondary">{maintenanceTypeLabels[type]}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as MaintenanceStatus;
      return getStatusBadge(status);
    },
  },
  {
    accessorKey: "scheduledDate",
    header: "Scheduled Date",
    cell: ({ row }) => {
      const date = row.getValue("scheduledDate") as string;
      return (
        <div>
          <div className="text-sm">{new Date(date).toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(date), { addSuffix: true })}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => {
      const cost = row.getValue("cost") as number | undefined;
      return cost ? `$${cost.toFixed(2)}` : "-";
    },
  },
  {
    accessorKey: "performedBy",
    header: "Performed By",
    cell: ({ row }) => {
      const performedBy = row.getValue("performedBy") as string | undefined;
      return performedBy || "-";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const maintenance = row.original;
      const canComplete =
        maintenance.status === MaintenanceStatus.SCHEDULED || maintenance.status === MaintenanceStatus.IN_PROGRESS;

      return (
        <div className="flex items-center gap-2 justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(maintenance.id!)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {maintenance.status === MaintenanceStatus.SCHEDULED && (
                <DropdownMenuItem onClick={() => onUpdateStatus(maintenance.id!, MaintenanceStatus.IN_PROGRESS)}>
                  <Wrench className="mr-2 h-4 w-4" />
                  Mark In Progress
                </DropdownMenuItem>
              )}

              {canComplete && (
                <DropdownMenuItem onClick={() => onCompleteMaintenance(maintenance)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete Maintenance
                </DropdownMenuItem>
              )}

              {(maintenance.status === MaintenanceStatus.SCHEDULED ||
                maintenance.status === MaintenanceStatus.IN_PROGRESS) && (
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(maintenance.id!, MaintenanceStatus.CANCELLED)}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Maintenance
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

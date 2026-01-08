import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Eye, MapPin, MoreHorizontal } from "lucide-react";

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
import type { Warehouse } from "@/types/warehouse";

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "MAINTENANCE":
      return "secondary";
    case "CLOSED":
      return "destructive";
    case "ARCHIVED":
      return "outline";
    default:
      return "outline";
  }
};

interface WarehouseColumnsProps {
  onStatusChange: (warehouse: Warehouse, newStatus: string) => void;
  onViewDetails: (warehouseId: string) => void;
}

export const getWarehouseColumns = ({ onStatusChange, onViewDetails }: WarehouseColumnsProps): ColumnDef<Warehouse>[] => {
  return [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => {
        return <span>{row.getValue("code")}</span>;
      },
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      id: "location",
      header: "Location",
      cell: ({ row }) => {
        const { city, country } = row.original.address;
        return (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{city}, {country}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={getStatusVariant(status)}>
            {status}
          </Badge>
        );
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
        const warehouse = row.original;
        const currentStatus = warehouse.status;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(warehouse.id!)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">View details</span>
            </Button>
            
            {warehouse.status !== "ARCHIVED" && (
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
                  {currentStatus !== "ACTIVE" && (
                    <DropdownMenuItem onClick={() => onStatusChange(warehouse, "ACTIVE")}>
                      Set as Active
                    </DropdownMenuItem>
                  )}
                  {currentStatus !== "MAINTENANCE" && (
                    <DropdownMenuItem onClick={() => onStatusChange(warehouse, "MAINTENANCE")}>
                      Set as Maintenance
                    </DropdownMenuItem>
                  )}
                  {currentStatus !== "CLOSED" && (
                    <DropdownMenuItem 
                      onClick={() => onStatusChange(warehouse, "CLOSED")}
                      className="text-destructive focus:text-destructive"
                    >
                      Close Warehouse
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      },
    },
  ];
};


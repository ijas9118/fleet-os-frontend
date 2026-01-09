import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Package } from "lucide-react";

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
import type { InventoryItem } from "@/types/inventoryItem";

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "DISCONTINUED":
      return "destructive";
    case "ARCHIVED":
      return "outline";
    default:
      return "outline";
  }
};

interface InventoryItemColumnsProps {
  onStatusChange: (item: InventoryItem, newStatus: string) => void;
  onViewDetails: (itemId: string) => void;
}

export const getInventoryItemColumns = ({ onStatusChange, onViewDetails }: InventoryItemColumnsProps): ColumnDef<InventoryItem>[] => {
  return [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{row.getValue("sku")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("name")}</span>;
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string | undefined;
        return category ? (
          <Badge variant="secondary" className="font-normal">
            {category}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ row }) => {
        return <span className="text-sm">{row.getValue("unit")}</span>;
      },
    },
    {
      id: "stockLevels",
      header: "Stock Levels",
      cell: ({ row }) => {
        const { minStockLevel, maxStockLevel, reorderPoint } = row.original;
        
        return (
          <div className="text-sm space-y-0.5">
            {minStockLevel !== undefined && (
              <div className="text-muted-foreground">
                Min: <span className="font-medium text-foreground">{minStockLevel}</span>
              </div>
            )}
            {maxStockLevel !== undefined && (
              <div className="text-muted-foreground">
                Max: <span className="font-medium text-foreground">{maxStockLevel}</span>
              </div>
            )}
            {reorderPoint !== undefined && (
              <div className="text-muted-foreground">
                Reorder: <span className="font-medium text-foreground">{reorderPoint}</span>
              </div>
            )}
            {minStockLevel === undefined && maxStockLevel === undefined && reorderPoint === undefined && (
              <span className="text-muted-foreground">—</span>
            )}
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
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        const currentStatus = item.status;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(item.id)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">View details</span>
            </Button>
            
            {item.status !== "ARCHIVED" && (
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
                    <DropdownMenuItem onClick={() => onStatusChange(item, "ACTIVE")}>
                      Set as Active
                    </DropdownMenuItem>
                  )}
                  {currentStatus !== "DISCONTINUED" && (
                    <DropdownMenuItem 
                      onClick={() => onStatusChange(item, "DISCONTINUED")}
                      className="text-destructive focus:text-destructive"
                    >
                      Discontinue Item
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

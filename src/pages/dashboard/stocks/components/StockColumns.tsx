import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, AlertTriangle, Eye, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Stock } from "@/types/stock";

interface StockColumnsProps {
  onViewDetails: (stockId: string) => void;
}

/**
 * Get visual indicator based on stock quantity levels
 * Yellow if below reorderPoint, Red if below minStockLevel
 * Note: minStockLevel and reorderPoint are not in the Stock entity yet
 * This will be enhanced when backend populates item details
 */
const getQuantityIndicator = (quantity: number) => {
  // For now, simple indicators based on quantity
  // Will be enhanced when we have minStockLevel and reorderPoint from inventory item
  if (quantity === 0) {
    return {
      icon: AlertCircle,
      className: "text-destructive",
      label: "Out of stock",
    };
  }
  if (quantity < 50) {
    return {
      icon: AlertTriangle,
      className: "text-yellow-600 dark:text-yellow-500",
      label: "Low stock",
    };
  }
  return {
    icon: Package,
    className: "text-muted-foreground",
    label: "In stock",
  };
};

export const getStockColumns = ({ onViewDetails }: StockColumnsProps): ColumnDef<Stock>[] => {
  return [
    {
      id: "warehouse",
      header: "Warehouse",
      cell: ({ row }) => {
        const stock = row.original;
        if (stock.warehouse) {
          return (
            <div className="flex flex-col">
              <span className="font-medium">{stock.warehouse.name}</span>
              <span className="text-xs text-muted-foreground font-mono">{stock.warehouse.code}</span>
            </div>
          );
        }
        return <span className="font-mono text-sm text-muted-foreground">{stock.warehouseId}</span>;
      },
    },
    {
      id: "inventoryItem",
      header: "Inventory Item",
      cell: ({ row }) => {
        const stock = row.original;
        if (stock.inventoryItem) {
          return (
            <div className="flex flex-col">
              <span className="font-medium">{stock.inventoryItem.name}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{stock.inventoryItem.sku}</span>
                {stock.inventoryItem.category && (
                  <>
                    <span>•</span>
                    <span>{stock.inventoryItem.category}</span>
                  </>
                )}
              </div>
            </div>
          );
        }
        return <span className="font-mono text-sm text-muted-foreground">{stock.inventoryItemId}</span>;
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => {
        const quantity = row.getValue("quantity") as number;
        const unit = row.original.inventoryItem?.unit || "units";
        const indicator = getQuantityIndicator(quantity);
        const Icon = indicator.icon;

        return (
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${indicator.className}`} />
            <div className="flex flex-col">
              <span className="font-semibold">{quantity.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
            {quantity < 50 && (
              <Badge variant={quantity === 0 ? "destructive" : "secondary"} className="ml-2">
                {indicator.label}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string;
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
        const stock = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(stock.id)} className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
              <span className="sr-only">View details</span>
            </Button>
          </div>
        );
      },
    },
  ];
};

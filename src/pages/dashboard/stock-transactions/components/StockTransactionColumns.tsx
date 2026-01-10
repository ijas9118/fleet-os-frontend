import { StockTransactionType } from "@ahammedijas/fleet-os-shared";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownCircle, ArrowRightCircle, ArrowUpCircle, Eye, type LucideIcon, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StockTransaction } from "@/types/stockTransaction";

interface GetStockTransactionColumnsProps {
  onViewDetails: (id: string) => void;
}

export const getStockTransactionColumns = ({
  onViewDetails,
}: GetStockTransactionColumnsProps): ColumnDef<StockTransaction>[] => {
  return [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as StockTransactionType;
        let icon: LucideIcon;
        let variant: "default" | "destructive" | "secondary" | "outline" = "default";
        let label: string = type;

        switch (type) {
          case StockTransactionType.IN:
            icon = ArrowDownCircle;
            variant = "default";
            label = "IN (Add)";
            break;
          case StockTransactionType.OUT:
            icon = ArrowUpCircle;
            variant = "destructive";
            label = "OUT (Remove)";
            break;
          case StockTransactionType.ADJUSTMENT:
            icon = RefreshCw;
            variant = "secondary";
            label = "ADJUSTMENT";
            break;
          case StockTransactionType.TRANSFER_IN:
            icon = ArrowRightCircle;
            variant = "default";
            label = "TRANSFER IN";
            break;
          case StockTransactionType.TRANSFER_OUT:
            icon = ArrowRightCircle;
            variant = "outline";
            label = "TRANSFER OUT";
            break;
          default:
            icon = ArrowDownCircle;
        }

        const Icon = icon;

        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <Badge variant={variant} className="capitalize">
              {label}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "warehouse",
      header: "Warehouse",
      cell: ({ row }) => {
        const stockTx = row.original;
        if (stockTx.warehouse) {
          return (
            <div className="flex flex-col">
              <span className="font-medium">{stockTx.warehouse.name}</span>
              <span className="text-xs text-muted-foreground font-mono">{stockTx.warehouse.code}</span>
            </div>
          );
        }
        return <span className="font-mono text-sm text-muted-foreground">{stockTx.warehouseId}</span>;
      },
    },
    {
      id: "inventoryItem",
      header: "Inventory Item",
      cell: ({ row }) => {
        const stockTx = row.original;
        if (stockTx.inventoryItem) {
          return (
            <div className="flex flex-col">
              <span className="font-medium">{stockTx.inventoryItem.name}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{stockTx.inventoryItem.sku}</span>
                {stockTx.inventoryItem.category && (
                  <>
                    <span>•</span>
                    <span>{stockTx.inventoryItem.category}</span>
                  </>
                )}
              </div>
            </div>
          );
        }
        return <span className="font-mono text-sm text-muted-foreground">{stockTx.inventoryItemId}</span>;
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity Change",
      cell: ({ row }) => {
        const qty = row.getValue("quantity") as number;
        const type = row.original.type;
        const unit = row.original.inventoryItem?.unit || "units";

        let colorClass = "text-muted-foreground";
        let sign = "";

        if (type === StockTransactionType.IN || type === StockTransactionType.TRANSFER_IN) {
          colorClass = "text-green-600 dark:text-green-500";
          sign = "+";
        } else if (type === StockTransactionType.OUT || type === StockTransactionType.TRANSFER_OUT) {
          colorClass = "text-red-600 dark:text-red-500";
          sign = "-";
        } else if (type === StockTransactionType.ADJUSTMENT) {
          colorClass = "text-blue-600 dark:text-blue-500";
        }

        return (
          <div className="flex items-baseline gap-1">
            <span className={`font-mono font-bold ${colorClass}`}>
              {sign}
              {qty.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{new Date(date).toLocaleDateString()}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(row.original.id)}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
};

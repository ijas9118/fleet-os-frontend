import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Package } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { inventoryService } from "@/services/inventoryService";
import type { Stock } from "@/types/stock";

import { AddStockDialog } from "./components/AddStockDialog";
import { AdjustStockDialog } from "./components/AdjustStockDialog";
import { RemoveStockDialog } from "./components/RemoveStockDialog";
import { TransferStockDialog } from "./components/TransferStockDialog";

const getQuantityStatus = (quantity: number): { variant: "default" | "destructive" | "secondary"; label: string } => {
  if (quantity === 0) {
    return { variant: "destructive", label: "Out of Stock" };
  }
  if (quantity < 50) {
    return { variant: "secondary", label: "Low Stock" };
  }
  return { variant: "default", label: "In Stock" };
};

export default function StockDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await inventoryService.getStock(id);
      setStock(response.data.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load stock details";
      setError(errorMessage);
      console.error("Failed to fetch stock:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStockDetails();
  }, [fetchStockDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/tenant/stocks")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Stock List
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error || "Stock record not found"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quantityStatus = getQuantityStatus(stock.quantity);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => navigate("/tenant/stocks")}
            className="mb-2 pl-0 hover:pl-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stock List
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Stock Details</h2>
            <Badge variant={quantityStatus.variant} className="mt-1">
              {quantityStatus.label}
            </Badge>
          </div>
          {stock.warehouse && stock.inventoryItem && (
            <p className="text-muted-foreground text-sm">
              {stock.inventoryItem.name} at {stock.warehouse.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TransferStockDialog
            sourceWarehouseId={stock.warehouseId}
            sourceWarehouseName={stock.warehouse?.name}
            inventoryItemId={stock.inventoryItemId}
            currentQuantity={stock.quantity}
            onStockTransfer={fetchStockDetails}
          />
          <AddStockDialog
            stockId={stock.id}
            warehouseId={stock.warehouseId}
            inventoryItemId={stock.inventoryItemId}
            onStockAdded={fetchStockDetails}
          />
          <RemoveStockDialog
            stockId={stock.id}
            warehouseId={stock.warehouseId}
            inventoryItemId={stock.inventoryItemId}
            currentQuantity={stock.quantity}
            onStockRemoved={fetchStockDetails}
          />
          <AdjustStockDialog
            stockId={stock.id}
            warehouseId={stock.warehouseId}
            inventoryItemId={stock.inventoryItemId}
            currentQuantity={stock.quantity}
            onStockAdjusted={fetchStockDetails}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Stock Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Information</CardTitle>
              <CardDescription>Current stock details and identifiers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Warehouse & Item Section */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Warehouse</h4>
                  {stock.warehouse ? (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{stock.warehouse.name}</h3>
                        <Badge variant={stock.warehouse.status === "ACTIVE" ? "default" : "secondary"}>
                          {stock.warehouse.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-mono text-muted-foreground">{stock.warehouse.code}</p>
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Warehouse information not available</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Inventory Item</h4>
                  {stock.inventoryItem ? (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <h3 className="text-lg font-semibold">{stock.inventoryItem.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-mono">{stock.inventoryItem.sku}</span>
                        <span>•</span>
                        <span>{stock.inventoryItem.category}</span>
                        <span>•</span>
                        <span>Unit: {stock.inventoryItem.unit}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Item information not available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Current Quantity</h4>
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-muted-foreground" />
                    <span className="text-4xl font-bold">{stock.quantity.toLocaleString()}</span>
                    <span className="text-muted-foreground">{stock.inventoryItem?.unit.toLowerCase() || "units"}</span>
                  </div>
                </div>
              </div>

              {/* Metadata Section */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Created</h4>
                  <p className="text-sm font-medium">
                    {stock.createdAt && formatDistanceToNow(new Date(stock.createdAt), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stock.createdAt && new Date(stock.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Last Updated</h4>
                  <p className="text-sm font-medium">
                    {stock.updatedAt && formatDistanceToNow(new Date(stock.updatedAt), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stock.updatedAt && new Date(stock.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Column for quick stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Manage stock levels for this item using the action buttons above.
                </p>
                <div className="pt-4 space-y-2 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Add Stock</span>
                    <span className="text-green-600 font-medium">Increase (+)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Remove Stock</span>
                    <span className="text-red-600 font-medium">Decrease (-)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Adjust Stock</span>
                    <span className="text-blue-600 font-medium">±Adjust</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                <p className="text-sm font-medium">Coming Soon</p>
                <p className="text-xs text-muted-foreground">View all stock movements and transactions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

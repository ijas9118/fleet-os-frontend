import { InventoryItemStatus } from "@ahammedijas/fleet-os-shared";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Package2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { inventoryService } from "@/services/inventoryService";
import type { InventoryItem } from "@/types/inventoryItem";

import { ArchiveInventoryItemButton } from "./components/ArchiveInventoryItemButton";
import { EditInventoryItemDialog } from "./components/EditInventoryItemDialog";

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

export default function InventoryItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItemDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await inventoryService.getInventoryItemById(id);
      setItem(response.data.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load inventory item details";
      setError(errorMessage);
      console.error("Failed to fetch inventory item:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItemDetails();
  }, [fetchItemDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/tenant/inventory-items")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inventory Items
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error || "Inventory item not found"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => navigate("/tenant/inventory-items")}
            className="mb-2 pl-0 hover:pl-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory Items
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{item.name}</h2>
            <Badge variant={getStatusVariant(item.status)} className="mt-1">
              {item.status}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono flex items-center gap-2">
            <Package2 className="w-4 h-4" />
            {item.sku}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {item.status !== InventoryItemStatus.ARCHIVED && (
            <>
              <EditInventoryItemDialog item={item} onItemUpdated={fetchItemDetails} />
              <ArchiveInventoryItemButton
                itemId={item.id}
                itemName={item.name}
                onArchived={() => navigate("/tenant/inventory-items")}
              />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Item Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Item Information</CardTitle>
              <CardDescription>Basic details and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase">Basic Details</h4>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">SKU</p>
                    <p className="text-base font-medium font-mono">{item.sku}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="text-base font-medium">
                      {item.category ? (
                        <Badge variant="secondary">{item.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Unit of Measurement</p>
                    <p className="text-base font-medium">{item.unit}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                  </div>
                </div>

                {item.description && (
                  <div className="space-y-1 pt-2">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-base leading-relaxed">{item.description}</p>
                  </div>
                )}
              </div>

              {/* Stock Levels Section */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase">Stock Level Configuration</h4>

                <div className="grid grid-cols-3 gap-6">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Minimum</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{item.minStockLevel ?? "—"}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Maximum</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      {item.maxStockLevel ?? "—"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Reorder Point</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                      {item.reorderPoint ?? "—"}
                    </p>
                  </div>
                </div>

                {!item.minStockLevel && !item.maxStockLevel && !item.reorderPoint && (
                  <p className="text-sm text-muted-foreground text-center py-2">No stock level configuration set</p>
                )}
              </div>

              {/* Metadata Section */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Created</h4>
                  <p className="text-sm font-medium">
                    {item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.createdAt && new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Last Updated</h4>
                  <p className="text-sm font-medium">
                    {item.updatedAt && formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.updatedAt && new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Column for stats/future widgets */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stock Across Warehouses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                  <h3 className="text-3xl font-bold text-primary">0</h3>
                  <p className="text-xs text-muted-foreground uppercase font-medium mt-1">Total Stock</p>
                </div>
                <p className="text-sm text-muted-foreground text-center">Stock tracking coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Package2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No transactions yet</p>
                <p className="text-xs text-muted-foreground">Transaction history will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

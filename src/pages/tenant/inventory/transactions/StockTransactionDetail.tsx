import { StockTransactionType } from "@ahammedijas/fleet-os-shared";
import { formatDistanceToNow } from "date-fns";
import { ArrowDownCircle, ArrowLeft, ArrowRightCircle, ArrowUpCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { inventoryService } from "@/services/inventoryService";
import type { StockTransaction } from "@/types/stockTransaction";

export default function StockTransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<StockTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await inventoryService.getStockTransaction(id);
      setTransaction(response.data.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load transaction details";
      setError(errorMessage);
      console.error("Failed to fetch transaction:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTransactionDetails();
  }, [fetchTransactionDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/tenant/stock-transactions")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Transaction List
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error || "Transaction record not found"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTypeMetadata = (type: StockTransactionType) => {
    switch (type) {
      case StockTransactionType.IN:
        return { icon: ArrowDownCircle, label: "IN (Add)", variant: "default" as const, color: "text-green-600" };
      case StockTransactionType.OUT:
        return {
          icon: ArrowUpCircle,
          label: "OUT (Remove)",
          variant: "destructive" as const,
          color: "text-red-600",
        };
      case StockTransactionType.ADJUSTMENT:
        return { icon: RefreshCw, label: "ADJUSTMENT", variant: "secondary" as const, color: "text-blue-600" };
      case StockTransactionType.TRANSFER_IN:
        return {
          icon: ArrowRightCircle,
          label: "TRANSFER IN",
          variant: "default" as const,
          color: "text-green-600",
        };
      case StockTransactionType.TRANSFER_OUT:
        return {
          icon: ArrowRightCircle,
          label: "TRANSFER OUT",
          variant: "outline" as const,
          color: "text-red-600",
        };
      default:
        return {
          icon: ArrowDownCircle,
          label: type,
          variant: "default" as const,
          color: "text-muted-foreground",
        };
    }
  };

  const typeMeta = getTypeMetadata(transaction.type);
  const TypeIcon = typeMeta.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => navigate("/tenant/stock-transactions")}
            className="mb-2 pl-0 hover:pl-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Transaction List
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Transaction Details</h2>
            <div className="flex items-center gap-2 mt-1 px-2.5 py-0.5 rounded-full border bg-card shadow-sm">
              <TypeIcon className={`w-4 h-4 ${typeMeta.color}`} />
              <span className="text-sm font-medium">{typeMeta.label}</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-mono">ID: {transaction.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Information</CardTitle>
              <CardDescription>Details of the inventory movement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quantity Section */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Quantity Change
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${typeMeta.color}`}>
                      {transaction.type === StockTransactionType.OUT ||
                      transaction.type === StockTransactionType.TRANSFER_OUT
                        ? "-"
                        : "+"}
                      {transaction.quantity.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {transaction.inventoryItem?.unit.toLowerCase() || "units"}
                    </span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Date</span>
                  <div className="font-medium">{new Date(transaction.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Warehouse & Item Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase">Context</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Warehouse */}
                  {transaction.warehouse ? (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2 border">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase">Warehouse</h4>
                      <div>
                        <div className="font-semibold text-lg">{transaction.warehouse.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{transaction.warehouse.code}</div>
                      </div>
                      <Badge variant={transaction.warehouse.status === "ACTIVE" ? "default" : "secondary"}>
                        {transaction.warehouse.status}
                      </Badge>
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4 border flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Warehouse info unavailable</span>
                    </div>
                  )}

                  {/* Item */}
                  {transaction.inventoryItem ? (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2 border">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase">Inventory Item</h4>
                      <div>
                        <div className="font-semibold text-lg">{transaction.inventoryItem.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{transaction.inventoryItem.sku}</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{transaction.inventoryItem.category}</span>
                        <span>•</span>
                        <span>{transaction.inventoryItem.unit}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4 border flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Item info unavailable</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes & Reference */}
              {(transaction.notes || transaction.referenceId) && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Additional Details</h4>
                  <div className="grid gap-4">
                    {transaction.referenceId && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Reference ID</span>
                        <div className="p-2 bg-muted rounded border font-mono text-sm">{transaction.referenceId}</div>
                      </div>
                    )}
                    {transaction.notes && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Notes</span>
                        <div className="p-3 bg-muted rounded border text-sm italic">{transaction.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase">Created</span>
                <div className="font-medium">
                  {transaction.createdAt && formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase">Transaction ID</span>
                <div className="font-mono text-xs text-muted-foreground break-all">{transaction.id}</div>
              </div>

              {transaction.relatedTransactionId && (
                <div className="space-y-1 pt-4 border-t">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Related Transaction</span>
                  <div className="font-mono text-xs text-blue-600 break-all">{transaction.relatedTransactionId}</div>
                  <p className="text-[10px] text-muted-foreground">Linked transfer record</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

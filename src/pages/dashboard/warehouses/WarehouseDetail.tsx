import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, MapPin } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { inventoryService } from "@/services/inventoryService";
import type { Warehouse } from "@/types/warehouse";

import { ArchiveWarehouseButton } from "./components/ArchiveWarehouseButton";
import { EditWarehouseDialog } from "./components/EditWarehouseDialog";
import { WarehouseMap } from "./components/WarehouseMap";

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

export default function WarehouseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWarehouseDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await inventoryService.getWarehouseById(id);
      setWarehouse(response.data.data);
    }
    catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load warehouse details";
      setError(errorMessage);
      console.error("Failed to fetch warehouse:", err);
    }
    finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWarehouseDetails();
  }, [fetchWarehouseDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/tenant/warehouses")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Warehouses
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error || "Warehouse not found"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullAddress = `${warehouse.address.line1}, ${warehouse.address.city}, ${warehouse.address.country}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button variant="ghost" onClick={() => navigate("/tenant/warehouses")} className="mb-2 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Warehouses
          </Button>
          <div className="flex items-center gap-3">
             <h2 className="text-3xl font-bold tracking-tight">{warehouse.name}</h2>
             <Badge variant={getStatusVariant(warehouse.status)} className="mt-1">
              {warehouse.status}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono">{warehouse.code}</p>
        </div>
        <div className="flex items-center gap-2">
          {warehouse.status !== "ARCHIVED" && (
            <>
              <EditWarehouseDialog warehouse={warehouse} onWarehouseUpdated={fetchWarehouseDetails} />
              <ArchiveWarehouseButton 
                warehouseId={warehouse.id} 
                warehouseName={warehouse.name}
                onArchived={() => navigate("/tenant/warehouses")}
              />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="md:col-span-2 space-y-6">
           {/* Warehouse Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Information</CardTitle>
              <CardDescription>Basic details and location information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Address Section */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase">Location</h4>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-1 border">
                   {warehouse.address.coordinates ? (
                      <WarehouseMap 
                        lat={warehouse.address.coordinates.lat} 
                        lng={warehouse.address.coordinates.lng} 
                        name={warehouse.name}
                        address={fullAddress}
                      />
                   ) : (
                     <div className="h-[200px] flex items-center justify-center bg-muted/50 text-muted-foreground text-sm">
                       No coordinates available for map
                     </div>
                   )}
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <MapPin className="w-5 h-5 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{warehouse.address.line1}</p>
                    <p className="text-muted-foreground">
                      {warehouse.address.city}
                      {warehouse.address.state && `, ${warehouse.address.state}`}
                      {warehouse.address.postalCode && ` ${warehouse.address.postalCode}`}
                    </p>
                    <p className="text-muted-foreground">{warehouse.address.country}</p>
                    {warehouse.address.coordinates && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {warehouse.address.coordinates.lat.toFixed(6)}, {warehouse.address.coordinates.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

               {/* Metadata Section */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Created</h4>
                  <p className="text-sm font-medium">
                    {warehouse.createdAt && formatDistanceToNow(new Date(warehouse.createdAt), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {warehouse.createdAt && new Date(warehouse.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase">Last Updated</h4>
                  <p className="text-sm font-medium">
                    {warehouse.updatedAt && formatDistanceToNow(new Date(warehouse.updatedAt), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {warehouse.updatedAt && new Date(warehouse.updatedAt).toLocaleDateString()}
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
              <CardTitle className="text-base">Inventory Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                    <h3 className="text-3xl font-bold text-primary">0</h3>
                    <p className="text-xs text-muted-foreground uppercase font-medium mt-1">Total Items</p>
                 </div>
                 <p className="text-sm text-muted-foreground text-center">
                   Inventory tracking coming soon
                 </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                 <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 </div>
                 <p className="text-sm font-medium">All systems normal</p>
                 <p className="text-xs text-muted-foreground">No low stock alerts</p>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


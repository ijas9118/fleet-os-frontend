import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { shipmentService } from "@/services/shipmentService";
import type { ShipmentListItem } from "@/types/shipment";

import { getDriverShipmentColumns } from "./components/DriverShipmentColumns";
import { UpdateStatusDialog } from "./components/UpdateStatusDialog";

export default function DriverShipments() {
  const [shipments, setShipments] = useState<ShipmentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  const [selectedShipment, setSelectedShipment] = useState<{ id: string; status: string } | null>(null);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };

      const response = await shipmentService.listShipments(params);
      const { data, meta } = response.data.result;

      // Backend filters by authenticated driver automatically
      setShipments(data);
      setPageCount(meta.totalPages);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load shipments";
      setError(errorMessage);
      console.error("Failed to fetch shipments:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handleUpdateStatus = (shipmentId: string, currentStatus: string) => {
    setSelectedShipment({ id: shipmentId, status: currentStatus });
  };

  const handleStatusUpdated = () => {
    setSelectedShipment(null);
    fetchShipments();
    toast.success("Shipment status updated successfully");
  };

  const columns = useMemo(
    () =>
      getDriverShipmentColumns({
        onUpdateStatus: handleUpdateStatus,
      }),
    [],
  );

  // Calculate stats
  const stats = useMemo(() => {
    const confirmed = shipments.filter((s) => s.status === "CONFIRMED").length;
    const picked = shipments.filter((s) => s.status === "PICKED").length;
    const inTransit = shipments.filter((s) => s.status === "IN_TRANSIT").length;
    const delivered = shipments.filter((s) => s.status === "DELIVERED").length;

    return {
      confirmed,
      picked,
      inTransit,
      delivered,
      total: shipments.length,
    };
  }, [shipments]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Shipments</h2>
        <p className="text-muted-foreground">View and manage your assigned deliveries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Picked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.picked}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransit}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
          </CardContent>
        </Card>
      </div>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Deliveries</CardTitle>
          <CardDescription>Shipments assigned to you for delivery</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {loading && (
            <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && <div className="mb-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

          {!loading && shipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium text-muted-foreground">No shipments assigned yet</p>
              <p className="text-sm text-muted-foreground mt-2">Check back later for new assignments</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={shipments}
              pagination={pagination}
              pageCount={pageCount}
              onPaginationChange={setPagination}
            />
          )}
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      {selectedShipment && (
        <UpdateStatusDialog
          shipmentId={selectedShipment.id}
          currentStatus={selectedShipment.status}
          onSuccess={handleStatusUpdated}
          onClose={() => setSelectedShipment(null)}
        />
      )}
    </div>
  );
}

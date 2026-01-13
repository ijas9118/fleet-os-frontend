import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { Search, ShieldCheck, Users, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Driver } from "../../../tenant/team/drivers/components/DriverColumns";
import { getDriverColumns } from "../../../tenant/team/drivers/components/DriverColumns";

interface OpsManagerDriverListPresenterProps {
  drivers: Driver[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  pageCount: number;
  onPaginationChange: OnChangeFn<PaginationState>;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export function OpsManagerDriverListPresenter({
  drivers,
  loading,
  error,
  pagination,
  pageCount,
  onPaginationChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
}: OpsManagerDriverListPresenterProps) {
  // Show error toast when error state changes
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Pass undefined handlers for block/unblock to get read-only columns
  const columns = useMemo(
    () =>
      getDriverColumns({
        onBlockDriver: undefined,
        onUnblockDriver: undefined,
        readOnly: true,
      }),
    [],
  );

  const hasActiveFilters = statusFilter !== "all" || search !== "";

  const stats = useMemo(() => {
    const total = drivers.length;
    const active = drivers.filter((d) => d.isActive).length;
    const blocked = drivers.filter((d) => !d.isActive).length;
    return { total, active, blocked };
  }, [drivers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
        <p className="text-muted-foreground">View driver information and status</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <ShieldCheck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Drivers</CardTitle>
          <CardDescription>
            {drivers.length} driver{drivers.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {loading && (
            <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          <DataTable
            columns={columns}
            data={drivers}
            pagination={pagination}
            pageCount={pageCount}
            onPaginationChange={onPaginationChange}
            searchElement={
              <div className="flex items-center gap-3 flex-1">
                {/* Search Input */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={onSearchChange}
                    className="pl-9"
                  />
                </div>

                <div className="h-8 w-px bg-border" />

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium">Filter:</span>

                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-background hover:bg-accent/50 transition-colors">
                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                      <SelectTrigger className="h-8 border-0 bg-transparent px-2 hover:bg-transparent focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8">
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

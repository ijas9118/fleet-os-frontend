import type { OnChangeFn,PaginationState } from "@tanstack/react-table";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

import type { Tenant } from "./TenantColumns";
import { getTenantListColumns } from "./TenantColumns";

interface TenantListPresenterProps {
  tenants: Tenant[];
  loading: boolean;
  pagination: PaginationState;
  pageCount: number;
  onPaginationChange: OnChangeFn<PaginationState>;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


export function TenantListPresenter({
  tenants,
  loading,
  pagination,
  pageCount,
  onPaginationChange,
  search,
  onSearchChange,
}: TenantListPresenterProps) {
  const columns = useMemo(() => getTenantListColumns(), []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">Manage all registered businesses.</p>
        </div>
        <Button>Add Tenant</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>
            List of all businesses registered on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {loading && (
            <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          <DataTable 
            columns={columns} 
            data={tenants} 
            pagination={pagination}
            pageCount={pageCount}
            onPaginationChange={onPaginationChange}
            searchElement={
              <Input
                placeholder="Search tenants..."
                value={search}
                onChange={onSearchChange}
                className="max-w-sm mr-4"
              />
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

import type { OnChangeFn,PaginationState } from "@tanstack/react-table";
import { useMemo } from "react";

import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

import type { PendingTenant } from "./TenantColumns";
import { getTenantVerifyColumns } from "./TenantColumns";

interface TenantVerifyPresenterProps {
  tenants: PendingTenant[];
  loading: boolean;
  activeTab: "pending" | "rejected";
  onTabChange: (tab: "pending" | "rejected") => void;
  pagination: PaginationState;
  pageCount: number;
  onPaginationChange: OnChangeFn<PaginationState>;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  rejectId: string | null;
  onRejectConfirm: () => void;
  onRejectCancel: (open: boolean) => void;
}

export function TenantVerifyPresenter({
  tenants,
  loading,
  activeTab,
  onTabChange,
  pagination,
  pageCount,
  onPaginationChange,
  search,
  onSearchChange,
  onApprove,
  onReject,
  rejectId,
  onRejectConfirm,
  onRejectCancel,
}: TenantVerifyPresenterProps) {
  const columns = useMemo(() => getTenantVerifyColumns({
    activeTab,
    onApprove,
    onReject,
  }), [activeTab, onApprove, onReject]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenant Verification</h2>
          <p className="text-muted-foreground">Manage tenant registration requests.</p>
        </div>
      </div>

      <div className="flex space-x-1 rounded-xl bg-muted p-1 w-fit">
        <button
          onClick={() => onTabChange("pending")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "pending"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => onTabChange("rejected")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "rejected"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
          }`}
        >
          Rejected
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeTab === "pending" ? "Pending Requests" : "Rejected Tenants"}</CardTitle>
          <CardDescription>
            {activeTab === "pending" 
              ? "These businesses are waiting for platform approval." 
              : "List of rejected tenant applications."}
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
                placeholder="Search..."
                value={search}
                onChange={onSearchChange}
                className="max-w-sm mr-4"
              />
            }
          />
        </CardContent>
      </Card>

      <ConfirmationModal
        open={!!rejectId}
        onOpenChange={onRejectCancel}
        title="Reject Tenant Application"
        description="Are you sure you want to reject this tenant? This action cannot be undone."
        confirmText="Reject"
        variant="destructive"
        onConfirm={onRejectConfirm}
      />
    </div>
  );
}

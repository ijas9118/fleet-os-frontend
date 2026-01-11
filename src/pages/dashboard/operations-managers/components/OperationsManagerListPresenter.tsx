import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { Search, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { OperationsManager } from "./OperationsManagerColumns";
import { getOperationsManagerColumns } from "./OperationsManagerColumns";

interface OperationsManagerListPresenterProps {
  users: OperationsManager[];
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
  onBlockUser: (user: OperationsManager) => void;
  onUnblockUser: (user: OperationsManager) => void;
  confirmModal: {
    open: boolean;
    type: "block" | "unblock";
    user: OperationsManager | null;
    loading: boolean;
  };
  onConfirmModalChange: (open: boolean) => void;
  onConfirmAction: () => Promise<{ success: boolean; userName?: string; action?: string; error?: string }>;
}

export function OperationsManagerListPresenter({
  users,
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
  onBlockUser,
  onUnblockUser,
  confirmModal,
  onConfirmModalChange,
  onConfirmAction,
}: OperationsManagerListPresenterProps) {
  // Show error toast when error state changes
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Wrap confirm action to show toasts
  const handleConfirmWithToast = async () => {
    const result = await onConfirmAction();
    if (result.success) {
      toast.success(`${result.userName} has been ${result.action}ed successfully`);
    } else {
      toast.error(result.error || "Failed to complete action");
    }
  };

  const columns = useMemo(() => getOperationsManagerColumns({ onBlockUser, onUnblockUser }), [onBlockUser, onUnblockUser]);

  const hasActiveFilters = statusFilter !== "all" || search !== "";

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Operations Managers</h2>
            <p className="text-muted-foreground">Manage operations managers and their access.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Operations Managers</CardTitle>
            <CardDescription>
              {users.length} operations manager{users.length !== 1 ? "s" : ""} found
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
              data={users}
              pagination={pagination}
              pageCount={pageCount}
              onPaginationChange={onPaginationChange}
              searchElement={
                <div className="flex items-center gap-3 flex-1">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name or email..." value={search} onChange={onSearchChange} className="pl-9" />
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

      <ConfirmationModal
        open={confirmModal.open}
        onOpenChange={onConfirmModalChange}
        title={confirmModal.type === "block" ? "Block Operations Manager" : "Unblock Operations Manager"}
        description={
          confirmModal.type === "block" ? (
            <>
              Are you sure you want to block <strong>{confirmModal.user?.name}</strong>?
              <br />
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              They will be immediately logged out and won't be able to access the system.
            </>
          ) : (
            <>
              Are you sure you want to unblock <strong>{confirmModal.user?.name}</strong>?
              <br />
              They will be able to access the system again.
            </>
          )
        }
        confirmText={confirmModal.type === "block" ? "Block User" : "Unblock User"}
        variant={confirmModal.type === "block" ? "destructive" : "default"}
        onConfirm={handleConfirmWithToast}
        loading={confirmModal.loading}
      />
    </>
  );
}

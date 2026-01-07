import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { Building2, Search, ShieldCheck, UserCog, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { User } from "./UserColumns";
import { getUserListColumns } from "./UserColumns";

interface Tenant {
  id: string;
  name: string;
}

interface UserListPresenterProps {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  pageCount: number;
  onPaginationChange: OnChangeFn<PaginationState>;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  tenantFilter: string;
  onTenantFilterChange: (value: string) => void;
  tenants: Tenant[];
  onClearFilters: () => void;
  onBlockUser: (user: User) => void;
  onUnblockUser: (user: User) => void;
  confirmModal: {
    open: boolean;
    type: "block" | "unblock";
    user: User | null;
    loading: boolean;
  };
  onConfirmModalChange: (open: boolean) => void;
  onConfirmAction: () => Promise<{ success: boolean; userName?: string; action?: string; error?: string }>;
}

export function UserListPresenter({
  users,
  loading,
  error,
  pagination,
  pageCount,
  onPaginationChange,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  tenantFilter,
  onTenantFilterChange,
  tenants,
  onClearFilters,
  onBlockUser,
  onUnblockUser,
  confirmModal,
  onConfirmModalChange,
  onConfirmAction,
}: UserListPresenterProps) {
  
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

  const columns = useMemo(() => getUserListColumns({ onBlockUser, onUnblockUser }), [onBlockUser, onUnblockUser]);

  const hasActiveFilters = 
    roleFilter !== "all" || 
    statusFilter !== "all" || 
    tenantFilter !== "all" || 
    search !== "";

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Users</h2>
            <p className="text-muted-foreground">Manage all platform users and their access.</p>
          </div>
          <Button>Invite User</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {users.length} user{users.length !== 1 ? 's' : ''} found
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
                    <Input
                      placeholder="Search users..."
                      value={search}
                      onChange={onSearchChange}
                      className="pl-9"
                    />
                  </div>

                  <div className="h-8 w-px bg-border" />

                  {/* Filter Dropdowns */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-medium">Filters:</span>
                    
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-background hover:bg-accent/50 transition-colors">
                      <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
                      <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                        <SelectTrigger className="h-8 border-0 bg-transparent px-2 hover:bg-transparent focus:ring-0 focus:ring-offset-0">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="TENANT_ADMIN">Tenant Admin</SelectItem>
                          <SelectItem value="OPERATIONS_MANAGER">Operations Manager</SelectItem>
                          <SelectItem value="WAREHOUSE_MANAGER">Warehouse Manager</SelectItem>
                          <SelectItem value="DRIVER">Driver</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-background hover:bg-accent/50 transition-colors">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <Select value={tenantFilter} onValueChange={onTenantFilterChange}>
                        <SelectTrigger className="h-8 border-0 bg-transparent px-2 hover:bg-transparent focus:ring-0 focus:ring-offset-0">
                          <SelectValue placeholder="Tenant" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tenants</SelectItem>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearFilters}
                      className="h-8"
                    >
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
        title={confirmModal.type === "block" ? "Block User" : "Unblock User"}
        description={
          confirmModal.type === "block" ? (
            <>
              Are you sure you want to block <strong>{confirmModal.user?.name}</strong>?
              <br />
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

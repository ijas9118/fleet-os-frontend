import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { InventoryItem } from "@/types/inventoryItem";

import { CreateInventoryItemDialog } from "./CreateInventoryItemDialog";
import { getInventoryItemColumns } from "./InventoryItemColumns";

interface InventoryItemListPresenterProps {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  pageCount: number;
  onPaginationChange: OnChangeFn<PaginationState>;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categories: string[];
  includeArchived: boolean;
  onToggleArchived: () => void;
  onClearFilters: () => void;
  onStatusUpdate: (itemId: string, newStatus: string) => Promise<{ success: boolean; error?: string }>;
  onItemCreated: () => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "DISCONTINUED", label: "Discontinued" },
];

export function InventoryItemListPresenter({
  items,
  loading,
  error,
  pagination,
  pageCount,
  onPaginationChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  includeArchived,
  onToggleArchived,
  onClearFilters,
  onStatusUpdate,
  onItemCreated,
}: InventoryItemListPresenterProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    item: InventoryItem | null;
    newStatus: string;
  }>({
    open: false,
    item: null,
    newStatus: "",
  });

  const navigate = useNavigate();

  const handleStatusChange = (item: InventoryItem, newStatus: string) => {
    setConfirmDialog({
      open: true,
      item,
      newStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmDialog.item) return { success: false };

    const result = await onStatusUpdate(confirmDialog.item.id, confirmDialog.newStatus);

    if (result.success) {
      toast.success(`Item status updated to ${confirmDialog.newStatus}`);
      setConfirmDialog({ open: false, item: null, newStatus: "" });
    } else {
      toast.error(result.error || "Failed to update item status");
    }

    return result;
  };

  const getStatusChangeMessage = () => {
    if (!confirmDialog.item) return "";

    const { name, sku } = confirmDialog.item;
    const status = confirmDialog.newStatus;

    if (status === "DISCONTINUED") {
      return `Are you sure you want to discontinue "${name}" (${sku})? This item will no longer be available for new orders.`;
    }
    return `Set "${name}" (${sku}) to active status?`;
  };

  const columns = useMemo(
    () =>
      getInventoryItemColumns({
        onStatusChange: handleStatusChange,
        onViewDetails: (id) => navigate(`/tenant/inventory-items/${id}`),
      }),
    [navigate],
  );

  const hasActiveFilters = search || statusFilter !== "all" || categoryFilter !== "all" || includeArchived;

  // Create category options from available categories
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Inventory Items</h2>
            <p className="text-muted-foreground">Manage your inventory items and stock levels.</p>
          </div>
          <CreateInventoryItemDialog onItemCreated={onItemCreated} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Items</CardTitle>
            <CardDescription>View and manage all inventory items across your organization.</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {error && <div className="mb-4 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

            <DataTable
              columns={columns}
              data={items}
              pagination={pagination}
              pageCount={pageCount}
              onPaginationChange={onPaginationChange}
              searchElement={
                <div className="flex items-center gap-4 flex-1 flex-wrap">
                  <Input
                    placeholder="Search by SKU, name or description..."
                    value={search}
                    onChange={onSearchChange}
                    className="max-w-sm"
                  />
                  <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeArchived}
                      onChange={onToggleArchived}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-muted-foreground">Include Archived</span>
                  </label>
                  {hasActiveFilters && (
                    <button
                      onClick={onClearFilters}
                      className="text-sm text-muted-foreground hover:text-foreground underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmationModal
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        onConfirm={handleConfirmStatusChange}
        title="Confirm Status Change"
        description={getStatusChangeMessage()}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </>
  );
}

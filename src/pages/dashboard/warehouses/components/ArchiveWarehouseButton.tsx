import { Archive } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { inventoryService } from "@/services/inventoryService";

interface ArchiveWarehouseButtonProps {
  warehouseId: string;
  warehouseName: string;
  onArchived: () => void;
}

export function ArchiveWarehouseButton({ warehouseId, warehouseName, onArchived }: ArchiveWarehouseButtonProps) {
  const [open, setOpen] = useState(false);

  const handleArchive = async () => {
    try {
      await inventoryService.archiveWarehouse(warehouseId);
      toast.success(`${warehouseName} has been archived successfully`);
      setOpen(false);
      onArchived();
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to archive warehouse";
      toast.error(message);
      return { success: false };
    }
  };

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Archive className="w-4 h-4 mr-2" />
        Archive Warehouse
      </Button>

      <ConfirmationModal
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleArchive}
        title="Archive Warehouse?"
        description={`Are you sure you want to archive "${warehouseName}"? This warehouse will be removed from active listings but data will be preserved for records. You can view archived warehouses by using the filter on the warehouses list page.`}
        confirmText="Archive"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}

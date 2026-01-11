import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { inventoryService } from "@/services/inventoryService";

interface ArchiveInventoryItemButtonProps {
  itemId: string;
  itemName: string;
  onArchived: () => void;
}

export function ArchiveInventoryItemButton({ itemId, itemName, onArchived }: ArchiveInventoryItemButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await inventoryService.archiveInventoryItem(itemId);
      toast.success("Inventory item archived successfully");
      setConfirmOpen(false);
      onArchived();
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to archive inventory item";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
        <Trash2 className="w-4 h-4 mr-2" />
        Archive Item
      </Button>

      <ConfirmationModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleArchive}
        title="Archive Inventory Item"
        description={`Are you sure you want to archive "${itemName}"? This item will be discontinued and no longer available for new orders. This action can be reversed by reactivating the item.`}
        confirmText={isArchiving ? "Archiving..." : "Archive Item"}
        cancelText="Cancel"
      />
    </>
  );
}

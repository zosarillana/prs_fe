import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePurchaseReports } from "../../hooks/usePurchaseReports";
import { toast } from "sonner";

interface SetSapIdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number | null;
  onSuccess?: () => void;
}

export function SetSapDialog({
  open,
  onOpenChange,
  reportId,
  onSuccess,
}: SetSapIdDialogProps) {
  const [sapId, setSapId] = useState("");
  const { updateSapId } = usePurchaseReports();

  // Reset input when dialog closes
  useEffect(() => {
    if (!open) setSapId("");
  }, [open]);

  const handleSave = () => {
    if (!reportId || !sapId.trim()) return;

    const cleanedSapId = sapId.trim();

    toast.promise(
      new Promise<void>((resolve, reject) => {
        updateSapId(
          { id: reportId, sap_id: cleanedSapId },
          {
            onSuccess: () => {
              onOpenChange(false);
              setSapId("");
              onSuccess?.();
              resolve();
            },
            onError: () => reject(),
          }
        );
      }),
      {
        loading: "Updating SAP ID...",
        success: "SAP ID updated successfully 🎉",
        error: "Failed to update SAP ID ❌",
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set SAP PR</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Input
            type="text"
            placeholder="Enter SAP ID"
            value={sapId}
            onChange={(e) => setSapId(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!sapId.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

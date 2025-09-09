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
import { usePurchaseReports } from "../hooks/usePurchaseReports"; // ✅ adjust path
import { toast } from "sonner";

interface SetPoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: number | null;
  onSuccess?: () => void;
}

export function SetPoDialog({
  open,
  onOpenChange,
  reportId,
  onSuccess,
}: SetPoDialogProps) {
  const [poNo, setPoNo] = useState("");
  const { updatePo } = usePurchaseReports();

  // Reset input when dialog closes
  useEffect(() => {
    if (!open) setPoNo("");
  }, [open]);

  const handleSave = () => {
    if (!reportId || !poNo) return;

    toast.promise(
      new Promise<void>((resolve, reject) => {
        updatePo(
          { id: reportId, po_no: Number(poNo) },
          {
            onSuccess: () => {
              onOpenChange(false);
              setPoNo("");
              onSuccess?.();
              resolve();
            },
            onError: () => reject(),
          }
        );
      }),
      {
        loading: "Updating PO number...",
        success: "PO number updated successfully 🎉",
        error: "Failed to update PO number ❌",
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set PO Number</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="number"
            placeholder="Enter PO number"
            value={poNo}
            onChange={(e) => setPoNo(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!poNo}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

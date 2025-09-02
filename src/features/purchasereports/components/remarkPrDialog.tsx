import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RemarkPrDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (remark: string) => void;
  action: "approve" | "reject";
}

export function RemarkPrDialog({ open, onClose, onConfirm, action }: RemarkPrDialogProps) {
  const [remark, setRemark] = useState("");

  const handleConfirm = () => {
    onConfirm(remark);
    setRemark(""); // reset after confirm
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {action === "approve" ? "Approve Item" : "Reject Item"}
          </DialogTitle>
          <DialogDescription>
            Please provide a remark before you {action} this item.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="Enter your remark..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            {action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

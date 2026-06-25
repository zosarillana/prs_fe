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
  action: "approve" | "reject" | "approve_to_review";
}

export function RemarkPrDialog({
  open,
  onClose,
  onConfirm,
  action,
}: RemarkPrDialogProps) {
  const [remark, setRemark] = useState("");

  const handleConfirm = () => {
    onConfirm(remark);
    setRemark(""); // reset after confirm
    onClose();
  };

  // ✅ Helper function to get the title based on action
  const getTitle = () => {
    switch (action) {
      case "approve":
        return "Approve Item";
      case "reject":
        return "Reject Item";
      case "approve_to_review":
        return "Approve To Review";
      default:
        return "Item Action";
    }
  };

  // ✅ Helper function to get the description based on action
  const getDescription = () => {
    switch (action) {
      case "approve":
        return "Please provide a remark before you approve this item.";
      case "reject":
        return "Please provide a remark before you reject this item.";
      case "approve_to_review":
        return "Add optional notes for the technical reviewer before sending this item for review.";
      default:
        return "Please provide a remark.";
    }
  };

  // ✅ Helper function to get the button text based on action
  const getButtonText = () => {
    switch (action) {
      case "approve":
        return "Approve";
      case "reject":
        return "Reject";
      case "approve_to_review":
        return "Send to Review";
      default:
        return "Confirm";
    }
  };

  // ✅ Helper function to get the placeholder text
  const getPlaceholder = () => {
    switch (action) {
      case "approve_to_review":
        return "Add any notes for the technical reviewer...";
      case "reject":
        return "Please provide a reason for rejection...";
      default:
        return "Enter your remark...";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder={getPlaceholder()}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={action === "reject" && !remark.trim()}
          >
            {getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

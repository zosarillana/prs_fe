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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DrApproveDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { date: string; status: "approved" | "canceled" }) => void;
}

export function DrApproveDialog({ open, onClose, onConfirm }: DrApproveDialogProps) {
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"approved" | "canceled">("approved");

  const handleConfirm = () => {
    onConfirm({ date, status });
    setDate(""); // reset after confirm
    setStatus("approved");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve or Cancel</DialogTitle>
          <DialogDescription>
            Please select a date and status before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Date-time input */}
          <div>
            <label className="block mb-1 text-sm font-medium">Date & Time</label>
            <Input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Status select */}
          <div>
            <label className="block mb-1 text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(value) => setStatus(value as "approved" | "canceled")}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approve</SelectItem>
                <SelectItem value="canceled">Cancel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

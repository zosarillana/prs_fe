"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, isAfter } from "date-fns";
import { cn } from "@/lib/utils";

interface DrApproveDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { date: string; status: "approved" | "canceled" }) => void;
}

export function DrApproveDialog({
  open,
  onClose,
  onConfirm,
}: DrApproveDialogProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<"approved" | "canceled">("approved");

  const today = new Date();

  const handleConfirm = () => {
    if (!date) return;

    // ✅ Fix: Format date without timezone shift
    const formattedDate = format(date, "yyyy-MM-dd");

    onConfirm({
      date: formattedDate,
      status,
    });

    setDate(undefined);
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
          {/* Date Picker */}
          <div>
            <label className="block mb-1 text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(day) => isAfter(day, today)} // ✅ Only today & past selectable
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status Select */}
          <div>
            <label className="block mb-1 text-sm font-medium">Status</label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as "approved" | "canceled")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approve</SelectItem>
                <SelectItem value="canceled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!date}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

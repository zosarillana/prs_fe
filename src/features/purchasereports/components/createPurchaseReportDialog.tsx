"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth/authStore";
import { useCreatePurchaseReport } from "../hooks/useCreatePurchaseReport";
import { purchaseReportService } from "../purchaseReportService";
export function CreatePurchaseReportDialog({
  onSubmit,
}: {
  onSubmit: (data: {
    amount: number;
    purpose: string;
    user_id: number;
    department: string;
    date_submitted?: Date;
    date_needed?: Date;
    series_no: string;
  }) => void;
}) {
  const user = useAuthStore((state) => state.user);

  const isAdmin = user?.role?.includes("admin");
  const isUser = user?.role?.includes("user");

  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<string>("1");
  const [purpose, setPurpose] = React.useState<string>("");

  // Date can be Date OR undefined
  const [date, setDate] = React.useState<Date | undefined>(
    isUser ? new Date() : undefined
  );
  const [dateNeeded, setDateNeeded] = React.useState<Date | undefined>();

  const generateUniqueSeriesNo = async (): Promise<string> => {
    // Fetch all existing series numbers
    const res = await purchaseReportService.getAll({
      pageNumber: 1,
      pageSize: 9999,
    });
    const existingSeries = res.items.map((r) => Number(r.series_no));

    // Start from 11000
    let candidate = 11000;

    // Increment until unique
    while (existingSeries.includes(candidate)) {
      candidate += 1;
    }

    return candidate.toString();
  };

  const handleCreate = async () => {
    const trimmedPurpose = purpose.trim();
    const itemCount = Number(items);

    if (!trimmedPurpose) {
      toast.error("Purpose is required.");
      return;
    }
    if (!itemCount || itemCount < 1) {
      toast.error("Please enter a valid amount of items (minimum 1).");
      return;
    }
    if (isAdmin && !date) {
      toast.error("Please select a Date Submitted.");
      return;
    }
    if (!dateNeeded) {
      toast.error("Please select a Date Needed.");
      return;
    }

    // ✅ Generate unique series number
    const series_no = await generateUniqueSeriesNo();

    onSubmit({
      amount: itemCount,
      purpose: trimmedPurpose,
      user_id: user!.id,
      department: user?.department ? user.department.join(", ") : "",
      date_submitted: date,
      date_needed: dateNeeded,
      series_no,
    });

    toast.success("Purchase Request created!");

    // Reset fields
    setPurpose("");
    setItems("1");
    setDate(isUser ? new Date() : undefined);
    setDateNeeded(undefined);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Requests
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Purchase Requests</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new purchase request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Purpose */}
          <Input
            placeholder="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          {/* Department auto-filled */}
          <Input disabled placeholder="Department" value={user?.department} />

          {/* Date Pickers */}
          <div className="flex flex-row gap-4">
            {/* Date Submitted */}
            {isAdmin ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Date Submitted</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(value) => setDate(value)}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date ?? new Date(), "PPP")}
              </Button>
            )}

            {/* Date Needed */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateNeeded ? (
                    format(dateNeeded, "PPP")
                  ) : (
                    <span>Date Needed</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateNeeded}
                  onSelect={(value) => setDateNeeded(value)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

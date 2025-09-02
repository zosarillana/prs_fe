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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth/authStore";

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

  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<string>("");
  const [purpose, setPurpose] = React.useState<string>("");
  const [date, setDate] = React.useState<Date>();
  const [dateNeeded, setDateNeeded] = React.useState<Date>();

  function formatDepartment(dep: string) {
    return dep
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // ✅ Generate a unique series number
  function generateSeriesNo() {
    const timestamp = Date.now().toString().slice(-5); // last 5 digits of timestamp
    const random = Math.floor(100 + Math.random() * 900); // random 3-digit number
    return `${timestamp}${random}`;
  }

  const handleCreate = () => {
    if (items && purpose) {
      const series_no = generateSeriesNo(); // generate on submit

      onSubmit({
        amount: Number(items),
        purpose,
        user_id: user!.id, // force non-null, since user must exist
        department: user?.department
          ? user.department.join(", ") // no formatDepartment
          : "",
        date_submitted: date,
        date_needed: dateNeeded,
        series_no,
      });
      toast.success("Purchase report created!");
      setOpen(false);
    } else {
      // optional: toast error if required fields missing
      toast.error("Please fill in purpose and amount of items.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Issue Purchase Report
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Purchase Report</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new purchase report.
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Date Submitted</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>

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
                  onSelect={setDateNeeded}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Item Count */}
          <Select onValueChange={(value) => setItems(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Amount of items" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

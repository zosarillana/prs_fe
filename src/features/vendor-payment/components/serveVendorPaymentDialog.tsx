import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import logo from "@/assets/images/logosidebar.png";
import { Separator } from "@/components/ui/separator";

interface ServeVendorPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string; // <- replaces initialDate
  setDate: (date: string) => void; // <- replaces onDateSelect
  onConfirm: () => Promise<void>; // <- triggers API call
  loading: boolean;
  onSuccess?: () => void; // loading state
}

export function ServeVendorPaymentDialog({
  open,
  onOpenChange,
  selectedDate,
  setDate,
  onConfirm,
  loading,
}: ServeVendorPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex flex-col items-center">
            <img src={logo} className="h-32 -mb-10" crossOrigin="anonymous" />
            <p className="text-sm font-light mt-3 text-center">
              Select a date for vendor payment
            </p>
            <DialogTitle className="text-sm font-light mt-2">
              Date Selection
            </DialogTitle>
            <p className="text-sm font-light mt-0 text-center">
              Pick a date below
            </p>
          </div>
        </DialogHeader>

        <Separator></Separator>

        <div className="flex flex-col gap-4 mt-4">
          <label className="text-sm font-medium text-muted-foreground">
            Choose Date:
          </label>
          <input
            type="date"
            className="border rounded p-2"
            value={selectedDate}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={onConfirm}
            disabled={!selectedDate || loading}
          >
            {loading ? "Serving..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

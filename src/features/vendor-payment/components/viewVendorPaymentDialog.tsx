import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VendorPayment } from "../types/vendorPaymentTypes";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/images/logosidebar.png";

interface ViewVendorPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: VendorPayment | null; // ✅ accept null
}

export function ViewVendorPaymentDialog({
  open,
  onOpenChange,
  payment,
}: ViewVendorPaymentDialogProps) {
  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex flex-col items-center">
            <img src={logo} className="h-32 -mb-10" crossOrigin="anonymous" />
            <p className="text-sm font-light mt-3">
              Upper Quinokol, Brgy. Darong, Sta. Cruz, Davao Del Sur.
            </p>
            <DialogTitle className="text-sm font-light mt-2">
              Vendor Payment
            </DialogTitle>
            <p className="text-sm font-light mt-0">
              Payment details (read only)
            </p>
          </div>
        </DialogHeader>
        <Separator></Separator>
        <div className="space-y-4 text-sm">
          <div className="flex gap-2">
            <p className="text-muted-foreground">Vendor:</p>
            <p className="font-bold">{payment.vendor_name}</p>
          </div>

          <div className="flex gap-2">
            <p className="text-muted-foreground">Date Created:</p>
            <p className="font-medium">
              {payment.created_at
                ? new Date(payment.created_at).toLocaleDateString()
                : "-"}
            </p>
          </div>

          <Separator></Separator>
          <div className="flex gap-12">
            <div className="flex gap-2">
              <p className="text-muted-foreground">SL #:</p>
              <p className="font-medium">{payment.srl_no}</p>
            </div>

            <div className="flex gap-2">
              <p className="text-muted-foreground">PO Number:</p>
              <p className="font-medium">{payment.po_no}</p>
            </div>
          </div>

          <Separator></Separator>
          <div className="flex gap-2">
            <p className="text-muted-foreground">Invoice Number:</p>
            <p className="font-medium">{payment.inv_no || "—"}</p>
          </div>

          <Separator></Separator>
          <div className="flex gap-12">
            <div className="flex gap-2">
              <p className="text-muted-foreground">Cheque Status:</p>
              <p className="font-medium">
                {payment.status
                  ? payment.status
                      .replace(/_/g, " ")
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")
                  : "-"}
              </p>
            </div>

            <div className="flex gap-2">
              <p className="text-muted-foreground">Cheque number:</p>
              <p className="font-medium">{payment.cheque_number}</p>
            </div>
          </div>

          <Separator></Separator>
          <div className="flex gap-12">
            <div className="flex gap-2">
              <p className="text-muted-foreground">Amount:</p>
              <p className="font-medium">
                {" "}
                ₱{" "}
                {Number(payment.amount).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <p className="text-muted-foreground">Payment Date:</p>
              <p className="font-medium">
                {payment.date_served
                  ? new Date(payment.date_served).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>
        <Button
          className="mt-6 w-full"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

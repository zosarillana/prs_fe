import { useState, useCallback } from "react";
import { vendorPaymentService } from "../vendorPaymentService";
import { VendorPayment } from "../types/vendorPaymentTypes";
import { toast } from "sonner"; // ✅ import Sonner toast

interface UseServeVendorPaymentReturn {
  open: boolean;
  selectedPayment?: VendorPayment;
  selectedDate: string;
  openDialog: (payment: VendorPayment) => void;
  closeDialog: () => void;
  setDate: (date: string) => void;
  confirmServe: () => Promise<void>;
  loading: boolean;
}

// ✅ Accept refresh function as optional
export function useServeVendorPayment(
  onSuccess?: () => void
): UseServeVendorPaymentReturn {
  const [open, setOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<VendorPayment | undefined>();
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);

  const openDialog = useCallback((payment: VendorPayment) => {
    setSelectedPayment(payment);
    setSelectedDate(payment.date_served || "");
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setSelectedPayment(undefined);
    setSelectedDate("");
  }, []);

  const confirmServe = useCallback(async () => {
    if (!selectedPayment) return;

    setLoading(true);
    try {
      await vendorPaymentService.serve(
        selectedPayment.id,
        selectedDate || undefined
      );

      // ✅ Show success toast
      toast.success("Vendor payment served successfully!");

      // ✅ Refresh table if provided
      if (onSuccess) onSuccess();

      closeDialog();
    } catch (error) {
      toast.error("Failed to serve vendor payment.");
    } finally {
      setLoading(false);
    }
  }, [selectedPayment, selectedDate, closeDialog, onSuccess]);

  return {
    open,
    selectedPayment,
    selectedDate,
    openDialog,
    closeDialog,
    setDate: setSelectedDate,
    confirmServe,
    loading,
  };
}

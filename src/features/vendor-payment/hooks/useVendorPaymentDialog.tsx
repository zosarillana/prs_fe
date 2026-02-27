import { useState } from "react";
import { VendorPayment } from "../types/vendorPaymentTypes";

export function useVendorPaymentDialogs() {
  // View dialog
  const [viewPayment, setViewPayment] = useState<VendorPayment | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);

  // Edit dialog
  const [editPayment, setEditPayment] = useState<VendorPayment | null>(null);

  return {
    // states
    viewPayment,
    createOpen,
    editPayment, // ✅ return edit payment state

    // handlers
    openViewDialog: (payment: VendorPayment) => setViewPayment(payment),
    closeViewDialog: () => setViewPayment(null),

    openCreateDialog: () => setCreateOpen(true),
    closeCreateDialog: () => setCreateOpen(false),

    openEditDialog: (payment: VendorPayment) => setEditPayment(payment), // set selected payment
    closeEditDialog: () => setEditPayment(null),
  };
}

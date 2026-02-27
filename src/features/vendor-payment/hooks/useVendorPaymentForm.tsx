import { useState, useEffect } from "react";
import { toast } from "sonner";
import { vendorPaymentService } from "../vendorPaymentService";

interface UseVendorPaymentFormProps {
  onSuccess?: () => void;
  onClose: () => void;
  initialData?: any;
  isEdit?: boolean;
}

export function useVendorPaymentForm({
  onSuccess,
  onClose,
  initialData,
  isEdit = false,
}: UseVendorPaymentFormProps) {
  const [vendor_id, setVendorId] = useState<number | null>(null);
  const [prs_id, setPrsId] = useState<number | null>(null);
  const [po_number, setPoNumber] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [cheque_number, setChequeNumber] = useState("");
  const [inv_no, setInvNumber] = useState("");
  const [date_served, setDateServed] = useState<string | null>(null);
  const [cheque_status, setChequeStatus] = useState<string>("on_process");
  const [loading, setLoading] = useState(false);

  // ✅ Populate form when editing
  useEffect(() => {
    if (initialData) {
      setVendorId(initialData.vendor_id ?? null);
      setPrsId(initialData.prs_id ?? null);
      setPoNumber(initialData.po_number ?? null);
      setAmount(initialData.amount ? String(initialData.amount) : "");
      setChequeNumber(initialData.cheque_number ?? "");
      setInvNumber(initialData.inv_no ?? "");
      setDateServed(initialData.date_served ?? null);
      setChequeStatus(initialData.cheque_status ?? "on_process");
      
    }
  }, [initialData]);

  const resetForm = () => {
    setVendorId(null);
    setPrsId(null);
    setPoNumber(null);
    setAmount("");
    setChequeNumber("");
    setInvNumber("");
    setDateServed(null);
    setChequeStatus("on_process");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendor_id || !prs_id || !amount || !po_number) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vendor_id,
        prs_id,
        po_number,
        inv_number: inv_no || undefined,
        amount: Number(amount),
        cheque_number: cheque_number || undefined,
        date_served: date_served || undefined,
        cheque_status: cheque_status || undefined,
      };

      if (isEdit && initialData?.id) {
        // ✅ UPDATE
        await vendorPaymentService.update(initialData.id, payload);
        toast.success("Payment updated successfully");
      } else {
        // ✅ CREATE
        await vendorPaymentService.create(payload);
        toast.success("Payment created successfully");
      }

      onSuccess?.();
      onClose();
      resetForm();
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return {
    vendor_id,
    setVendorId,
    prs_id,
    setPrsId,
    po_number,
    setPoNumber,
    amount,
    setAmount,
    inv_no,
    setInvNumber,
    cheque_number,
    setChequeNumber,
    date_served,
    setDateServed,
    cheque_status,
    setChequeStatus,
    loading,
    handleSubmit,
  };
}

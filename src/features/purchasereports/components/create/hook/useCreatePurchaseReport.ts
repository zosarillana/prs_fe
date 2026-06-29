import * as React from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth/authStore";
import { purchaseReportService } from "@/features/purchasereports/purchaseReportService";

export function useCreatePurchaseReport(onSubmit: any) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role?.includes("admin");
  const isUser = user?.role?.includes("user");

  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState("1");
  const [purpose, setPurpose] = React.useState("");
  const [previewSeries, setPreviewSeries] = React.useState("Loading...");
  const [date, setDate] = React.useState<Date | undefined>(
    isUser ? new Date() : undefined
  );
  const [dateNeeded, setDateNeeded] = React.useState<Date | undefined>();

  React.useEffect(() => {
    if (open) {
      purchaseReportService
        .getNextSeriesNo()
        .then((num) => setPreviewSeries(num.toString()));
    }
  }, [open]);

  const handleCreate = () => {
    if (!purpose.trim()) return toast.error("Purpose is required.");
    if (+items < 1) return toast.error("Invalid item amount.");
    if (isAdmin && !date) return toast.error("Date Submitted required.");
    if (!dateNeeded) return toast.error("Date Needed required.");

    onSubmit({
      amount: +items,
      purpose: purpose.trim(),
      user_id: user!.id,
      department: user?.department?.join(", ") ?? "",
      date_submitted: date,
      date_needed: dateNeeded,
      series_no: previewSeries,
    });

    toast.success("Purchase Request created!");
    setOpen(false);
  };

  return {
    user,
    isAdmin,
    isUser,
    open,
    setOpen,
    purpose,
    setPurpose,
    previewSeries,
    date,
    setDate,
    dateNeeded,
    setDateNeeded,
    handleCreate,
  };
}

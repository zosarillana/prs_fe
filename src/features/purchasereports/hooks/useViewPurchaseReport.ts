import { useEffect, useState } from "react";
import { PurchaseReport } from "../types";
import { purchaseReportService } from "../purchaseReportService";
import { toast } from "sonner";

export function useViewPurchaseReport(prId: number | null, open: boolean) {
  const [report, setReport] = useState<PurchaseReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);

  useEffect(() => {
    if (open && prId) {
      setLoading(true);
      purchaseReportService
        .getById(prId)
        .then(setReport)
        .catch((err) => {
          console.error("Failed to fetch purchase report", err);
          setReport(null);
        })
        .finally(() => setLoading(false));
    } else {
      setReport(null);
    }
  }, [prId, open]);

  const handleItemAction = (index: number, action: "approve" | "reject") => {
    setCurrentItemIndex(index);
    setActionType(action);
    setOpenModal(true);
  };

  const confirmItemAction = async (remark: string) => {
    if (!report) return;

    toast.promise(
      purchaseReportService.updateItemStatus(
        report.id,
        currentItemIndex,
        actionType === "approve" ? "approved" : "rejected",
        remark
      ),
      {
        loading: "Updating item...",
        success: (updated) => {
          setReport(updated);
          setOpenModal(false);
          return `Item ${currentItemIndex + 1} ${actionType === "approve" ? "approved" : "rejected"} successfully`;
        },
        error: "Failed to update item status. Please try again.",
      }
    );
  };

  return {
    report,
    loading,
    openModal,
    setOpenModal,
    actionType,
    handleItemAction,
    confirmItemAction,
  };
}
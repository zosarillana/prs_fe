import { useEffect, useState } from "react";
import { PurchaseReport } from "../types";
import { purchaseReportService } from "../purchaseReportService";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth/authStore";

export function useViewPurchaseReport(
  prId: number | null,
  open: boolean,
  onSuccess?: () => void
) {
  const [report, setReport] = useState<PurchaseReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const user = useAuthStore((state) => state.user);

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

  const fetchReport = async () => {
    if (!prId) return;
    setLoading(true);
    try {
      const data = await purchaseReportService.getById(prId);
      setReport(data);
    } catch (err) {
      console.error("Failed to refetch purchase report", err);
      toast.error("Failed to fetch updated report");
    } finally {
      setLoading(false);
    }
  };

  const handleItemAction = (index: number, action: "approve" | "reject") => {
    setCurrentItemIndex(index);
    setActionType(action);
    setOpenModal(true);
  };

  const confirmItemAction = async (
    remark: string,
    asRole?: "technical_reviewer" | "hod" | "both"
  ) => {
    if (!report) return;

    toast.promise(
      purchaseReportService.updateItemStatus(
        report.id,
        currentItemIndex,
        actionType === "approve" ? "approved" : "rejected",
        remark,
        asRole,
        user?.id
      ),
      {
        loading: "Updating item...",
        success: (updated) => {
          setReport(updated);
          setOpenModal(false);
          fetchReport(); // refetch full report including signatures
          // ✅ Call the success callback to refresh parent data
          if (onSuccess) {
            onSuccess();
          }

          return `Item ${currentItemIndex + 1} ${
            actionType === "approve" ? "approved" : "rejected"
          } successfully`;
        },
        error: "Failed to update item status. Please try again.",
      }
    );
  };

  // Helper function to check if an item is already processed (approved/rejected)
  const isItemProcessed = (idx: number) => {
    const status = report?.item_status?.[idx];
    return (
      status === "approved" ||
      status === "rejected" ||
      status === "approved_tr" ||
      status === "rejected_tr"
    );
  };

  // Helper function to check if dropdown should be disabled entirely
  const isDropdownDisabled = (idx: number) => {
    const userRole = user?.role ?? [];
    const itemStatus = report?.item_status?.[idx];
    const itemTag = report?.tag?.[idx];

    // If item is already processed (approved/rejected), disable dropdown
    if (isItemProcessed(idx)) {
      return true;
    }

    // If user doesn't have required roles, disable dropdown
    if (
      !userRole.includes("hod") &&
      !userRole.includes("technical_reviewer") &&
      !userRole.includes("admin")
    ) {
      return true;
    }

    // For technical reviewers (non-admin), only enable for items with _tr tags and pending_tr status
    if (
      userRole.includes("technical_reviewer") &&
      !userRole.includes("admin")
    ) {
      return !itemTag?.endsWith("_tr") || itemStatus !== "pending_tr";
    }

    // For HOD (non-admin), only enable for items without _tr tags and pending status
    if (userRole.includes("hod") && !userRole.includes("admin")) {
      return itemTag?.endsWith("_tr") || itemStatus !== "pending";
    }

    // For admin, can act on any pending item
    if (userRole.includes("admin")) {
      return itemStatus !== "pending" && itemStatus !== "pending_tr";
    }

    return true; // Default to disabled
  };

  return {
    report,
    loading,
    openModal,
    setOpenModal,
    actionType,
    handleItemAction,
    confirmItemAction,
    isItemProcessed,
    isDropdownDisabled,
    fetchReport,
  };
}

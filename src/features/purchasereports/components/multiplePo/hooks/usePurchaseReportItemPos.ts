// In useSetMultiplePurchaseReportDialog.ts
import { useState } from "react";
import { useRef } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { useViewPurchaseReport } from "@/features/purchasereports/hooks/viewhook/useViewPurchaseReport";
import { PurchaseReport } from "@/features/purchasereports/types";
import { useMutation } from "@tanstack/react-query"; // Add if using react-query

export function useSetMultiplePurchaseReportDialog(
  prId: number | null,
  open: boolean,
) {
  const user = useAuthStore((state) => state.user);
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const printRef = useRef<HTMLDivElement>(null);

  // ✅ Add these states for DrApproveDialog
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveTargetId, setApproveTargetId] = useState<number | null>(null);

  const {
    report,
    setReport,
    loading,
    openModal,
    setOpenModal,
    actionType,
    handleItemAction,
    handleHodTrAction,
    confirmItemAction,
    isItemProcessed,
    isDropdownDisabled,
    downloadPDF,
    downloadPDFSimple,
    downloadPaginatedPDF,
    selectedItems,
    toggleItem,
    toggleAll,
    isIndeterminate,
    allSelected,
    canSelectItem,
    bulkAction,
    isExporting,
    isAdmin,
    isHod,
    isTechnicalReviewer,
    hasBothRoles,
    tagDescription,
  } = useViewPurchaseReport(prId, open);

  // ✅ Add mutation for approving PO
  const approvePoMutation = useMutation({
    mutationFn: async ({ id, date, status }: { id: number; date: string; status: string }) => {
      // Replace with your actual API call
      // Example: return purchaseReportService.approvePo(id, { date, status });
      return fetch(`${API_BASE_URL}/api/po/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, status }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      setApproveDialogOpen(false);
      // Optionally refresh the report
      if (prId) {
        // refreshReport(prId);
      }
    },
  });

  const canSelectItemMultipleLocal = (idx: number) => {
    const status = report?.item_status?.[idx];
    const itemTag = report?.tag?.[idx];
    const itemDepartment = itemTag?.department as unknown as string;
    const itemPoNumber = report?.item_pos?.find(
      (po) => po.item_index === idx,
    )?.po_number;

    if (!status) return false;
    if (itemPoNumber) return false;
    if (itemTag?.description?.endsWith("_tr")) return false;
    if (status === "pending_tr") return false;

    const isAdmin = user?.role?.includes("admin");
    const isHOD = user?.role?.includes("hod");
    const isTechnicalReviewer = user?.role?.includes("technical_reviewer");
    const isOfficeItems = itemDepartment === "office_items";

    const hodCanAccess =
      !isHOD ||
      isOfficeItems ||
      (itemDepartment && user?.department?.includes(itemDepartment));
    const trCanAccess =
      !isTechnicalReviewer ||
      isOfficeItems ||
      (itemDepartment && user?.department?.includes(itemDepartment));

    const canAccessItem = hodCanAccess && trCanAccess;
    if (!canAccessItem) return false;

    if (status === "pending" && (isHOD || isAdmin)) return true;
    if (status === "returned" && (isAdmin || isHOD || isTechnicalReviewer))
      return true;

    return false;
  };

  const truncate = (text: string, length = 40) => {
    if (!text) return "none";
    return text.length > length ? text.slice(0, length) + "…" : text;
  };

  const handleReportUpdate = (updatedReport: PurchaseReport) => {
    setReport(updatedReport);
  };

  return {
    user,
    API_BASE_URL,
    printRef,
    report,
    loading,
    openModal,
    setOpenModal,
    actionType,
    handleItemAction,
    handleHodTrAction,
    confirmItemAction,
    isItemProcessed,
    isDropdownDisabled,
    downloadPDF,
    downloadPDFSimple,
    downloadPaginatedPDF,
    selectedItems,
    toggleItem,
    toggleAll,
    isIndeterminate,
    allSelected,
    canSelectItem,
    canSelectItemMultiple: canSelectItemMultipleLocal,
    bulkAction,
    isExporting,
    isAdmin,
    isHod,
    isTechnicalReviewer,
    hasBothRoles,
    tagDescription,
    truncate,
    setReport,
    // ✅ Add these new returns
    approveDialogOpen,
    setApproveDialogOpen,
    approveTargetId,
    setApproveTargetId,
    approvePoMutation,
  };
}
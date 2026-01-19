import { useRef } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { useViewPurchaseReport } from "@/features/purchasereports/hooks/useViewPurchaseReport";

export function useViewPurchaseReportDialog(prId: number | null, open: boolean) {
  const user = useAuthStore((state) => state.user);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const printRef = useRef<HTMLDivElement>(null);

  const {
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
    bulkAction,
    isExporting,
    isAdmin,
    isHod,
    isTechnicalReviewer,
    hasBothRoles,
    tagDescription,
  } = useViewPurchaseReport(prId, open);

  const truncate = (text: string, length = 40) => {
    if (!text) return "none";
    return text.length > length ? text.slice(0, length) + "…" : text;
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
    bulkAction,
    isExporting,
    isAdmin,
    isHod,
    isTechnicalReviewer,
    hasBothRoles,
    tagDescription,
    truncate,
  };
}

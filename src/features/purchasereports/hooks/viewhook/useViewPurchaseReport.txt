import { useEffect, useState } from "react";
import { authRoles } from "@/store/auth/authRoles";

// Import modularized hooks and utilities
import { useBulkSelection } from "./actionhooks/useBulkSelection";
import { useGetPurchaseReport } from "./actionhooks/useGetPurchaseReport";
import { confirmItemAction } from "./actions/itemActionHandlers";
import { canSelectItem } from "./actions/itemPermission";
import { isItemProcessed, isDropdownDisabled } from "./actions/permission";
import { exportStandardPdf } from "./pdf/exportStandardPdf";
import { exportPaginatedPdf } from "./pdf/exportPaginatedPdf";
import { exportSimplePdf } from "./pdf/exportSimplePdf";
import { bulkUpdateItems } from "./actions/bulkActions";

export function useViewPurchaseReport(
  prId: number | null,
  open: boolean,
  onSuccess?: () => void
) {
  // Auth & User
  const { user, isAdmin, isHod, isTechnicalReviewer, hasBothRoles } = authRoles();

  // Report data management
  const { report, setReport, loading, fetchReport } = useGetPurchaseReport(prId, open);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "approve_to_review" | "return"
  >("approve");
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);

  // PDF export state
  const [isExporting, setIsExporting] = useState(false);

  // Calculate selectable indexes based on permissions
  const selectableIndexes = (report?.item_status ?? [])
    .map((status, idx) => {
      const itemTag = report?.tag?.[idx];
      const itemDepartment = itemTag?.department as unknown as string;
      const tagDescription = itemTag?.description ?? "";

      // Skip _tr items that aren't pending_tr
      if (tagDescription.endsWith("_tr") && status !== "pending_tr") {
        return null;
      }

      if (!user) return null;

      const isOfficeItems = itemDepartment === "office_items";

      if (
        canSelectItem({
          user,
          status,
          itemDepartment,
          tagDescription,
        })
      ) {
        return idx;
      }

      return null;
    })
    .filter((idx): idx is number => idx !== null);

  // Bulk selection management
  const {
    selectedItems,
    setSelectedItems,
    toggleItem,
    toggleAll,
    allSelected,
    isIndeterminate,
  } = useBulkSelection(selectableIndexes);

  // Clear selections when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedItems([]);
    }
  }, [open, setSelectedItems]);

  // Helper to check if an item can be selected
  const canSelectItemWrapper = (idx: number) => {
    if (!report || !user) return false;

    const status = report.item_status?.[idx];
    const itemTag = report.tag?.[idx];
    const itemDepartment = itemTag?.department as unknown as string;
    const tagDescription = itemTag?.description ?? "";

    if (!status) return false;

    // _tr items that aren't pending_tr are not selectable
    if (tagDescription.endsWith("_tr") && status !== "pending_tr") {
      return false;
    }

    const isOfficeItems = itemDepartment === "office_items";

    return canSelectItem({
      user,
      status,
      itemDepartment,
      tagDescription,
    });
  };

  // Bulk action handler
  const bulkAction = async (
    action: "approve" | "reject",
    remark: string = ""
  ) => {
    if (!report || selectedItems.length === 0 || !user?.id) return;

    await bulkUpdateItems({
      report,
      user,
      selectedItems,
      action,
      remark,
      fetchReport,
      setSelectedItems,
    });
  };

  // PDF Export Functions
  const downloadPDF = async (ref: React.RefObject<HTMLElement | null>) => {
    await exportStandardPdf({ ref, report, setIsExporting });
  };

  const downloadPDFSimple = async (ref: React.RefObject<HTMLElement | null>) => {
    await exportSimplePdf({ ref, report, setIsExporting });
  };

  const downloadPaginatedPDF = async (
    ref: React.RefObject<HTMLDivElement | null>
  ) => {
    await exportPaginatedPdf({ ref, report, setIsExporting });
  };

  // Item action handlers
  const handleItemAction = (
    index: number,
    action: "approve" | "reject" | "return"
  ) => {
    setCurrentItemIndex(index);
    setActionType(action);
    setOpenModal(true);
  };

  const handleHodTrAction = (index: number) => {
    setCurrentItemIndex(index);
    setActionType("approve_to_review");
    setOpenModal(true);
  };

  const confirmItemActionWrapper = async (newRemark: string) => {
    if (!report) return;

    await confirmItemAction({
      report,
      user,
      index: currentItemIndex,
      actionType,
      newRemark,
      setReport,
      setOpenModal,
      fetchReport,
      onSuccess,
    });
  };

  // Helper wrappers
  const isItemProcessedWrapper = (idx: number) => {
    return isItemProcessed(report, idx);
  };

  const isDropdownDisabledWrapper = (idx: number) => {
    return isDropdownDisabled(report, user, idx);
  };

  const tagDescription =
    Array.isArray(report?.tag) && report?.tag[0]?.description
      ? report.tag[0].description
      : "";

  return {
    // Report data
    report,
    loading,
    tagDescription,

    // Modal state
    openModal,
    setOpenModal,
    actionType,

    // Item actions
    handleItemAction,
    handleHodTrAction,
    confirmItemAction: confirmItemActionWrapper,
    isItemProcessed: isItemProcessedWrapper,
    isDropdownDisabled: isDropdownDisabledWrapper,

    // Bulk selection
    selectedItems,
    toggleItem,
    toggleAll,
    allSelected,
    isIndeterminate,
    canSelectItem: canSelectItemWrapper,
    bulkAction,

    // PDF export
    downloadPDF,
    downloadPDFSimple,
    downloadPaginatedPDF,
    isExporting,

    // User/auth info
    isAdmin,
    isHod,
    isTechnicalReviewer,
    hasBothRoles,
    user,

    // Utilities
    fetchReport,
  };
}
import { useState, useRef } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { useViewPurchaseReport } from "@/features/purchasereports/hooks/viewhook/useViewPurchaseReport";
import { PurchaseReport } from "@/features/purchasereports/types";
import { useMutation } from "@tanstack/react-query";
import { purchaseReportService } from "@/features/purchasereports/purchaseReportService";
import { toast } from "sonner";

export function useSetMultiplePurchaseReportDialog(
  prId: number | null,
  open: boolean
) {
  const user = useAuthStore((state) => state.user);
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const printRef = useRef<HTMLDivElement>(null);

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveTargetId, setApproveTargetId] = useState<number | null>(null);
  const [bulkApproveIndices, setBulkApproveIndices] = useState<number[]>([]); // ✅ Add this

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

  // ✅ Per-item PO approval mutation (uses item_index internally)
  const approveItemPoMutation = useMutation({
    mutationFn: async ({
      item_index,
      status,
      date,
    }: {
      item_index: number;
      status: "approved" | "canceled";
      date: string;
    }) => {
      if (!prId) throw new Error("No report selected");

      return await purchaseReportService.approvePerItemPoDate(prId, {
        item_index,
        status,
        date,
      });
    },
    onSuccess: async (updatedItemPo) => {
      setApproveDialogOpen(false);
      setApproveTargetId(null);

      if (updatedItemPo && report) {
        setReport({
          ...report,
          item_pos: report.item_pos?.map((po) =>
            po.item_index === updatedItemPo.item_index ? updatedItemPo : po
          ),
        });
      }

      toast.success("Item PO approved successfully!");
    },
    onError: (error: any) => {
      console.error("Failed to approve item PO:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to approve item PO"
      );
    },
  });

  // ✅ Bulk approval mutation
  const approveBulkItemPoMutation = useMutation({
    mutationFn: async ({
      item_indices,
      status,
      date,
    }: {
      item_indices: number[];
      status: "approved" | "canceled";
      date: string;
    }) => {
      if (!prId) throw new Error("No report selected");

      const results = [];
      for (const item_index of item_indices) {
        const result = await purchaseReportService.approvePerItemPoDate(prId, {
          item_index,
          status,
          date,
        });
        results.push(result);
      }
      return results;
    },
    onSuccess: async (updatedItemPos) => {
      setApproveDialogOpen(false);
      setApproveTargetId(null);
      setBulkApproveIndices([]); // ✅ Clear bulk indices

      if (updatedItemPos && report) {
        const updatedPosMap = new Map(
          updatedItemPos.map((po) => [po.item_index, po])
        );

        setReport({
          ...report,
          item_pos: report.item_pos?.map((po) =>
            updatedPosMap.has(po.item_index)
              ? updatedPosMap.get(po.item_index)!
              : po
          ),
        });
      }

      toast.success(`${updatedItemPos.length} item(s) approved successfully!`);
    },
    onError: (error: any) => {
      console.error("Failed to approve items:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to approve items"
      );
    },
  });

  // ✅ Helper to approve an item by its database ID (single item)
  const approveItemPoById = (
    itemId: number,
    date: string,
    status: "approved" | "canceled"
  ) => {
    if (!report) return;

    const item = report.item_pos?.find((po) => po.id === itemId);
    if (!item) {
      toast.error("Item not found in report");
      return;
    }

    approveItemPoMutation.mutate({
      item_index: item.item_index,
      status,
      date,
    });
  };

  // ✅ Helper to approve multiple items by their indices (bulk)
  const approveBulkItemPoByIndices = (
    itemIndices: number[],
    date: string,
    status: "approved" | "canceled"
  ) => {
    if (!report) return;

    approveBulkItemPoMutation.mutate({
      item_indices: itemIndices,
      status,
      date,
    });
  };

  const canSelectItemMultipleLocal = (idx: number) => {
    const status = report?.item_status?.[idx];
    const itemTag = report?.tag?.[idx];
    const itemDepartment = itemTag?.department as unknown as string;
    const itemPoNumber = report?.item_pos?.find(
      (po) => po.item_index === idx
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

  // ✅ Helper to open approve dialog for single item
  const openApproveDialog = (itemId: number) => {
    setApproveTargetId(itemId);
    setBulkApproveIndices([]); // Clear bulk mode
    setApproveDialogOpen(true);
  };

  // ✅ Helper to open approve dialog for bulk items
  const openBulkApproveDialog = (itemIndices: number[]) => {
    setBulkApproveIndices(itemIndices);
    setApproveTargetId(null); // Clear single mode
    setApproveDialogOpen(true);
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
    approveDialogOpen,
    setApproveDialogOpen,
    approveTargetId,
    setApproveTargetId,
    approveItemPoMutation,
    approveItemPoById,
    approveBulkItemPoMutation, // ✅ Add this
    approveBulkItemPoByIndices, // ✅ Add this
    bulkApproveIndices, // ✅ Add this
    handleReportUpdate,
    openApproveDialog,
    openBulkApproveDialog, // ✅ Add this
  };
}
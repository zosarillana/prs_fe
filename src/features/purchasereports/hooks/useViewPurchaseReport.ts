import { useEffect, useState } from "react";
import { PurchaseReport } from "../types";
import { purchaseReportService } from "../purchaseReportService";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth/authStore";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
  const [isExporting, setIsExporting] = useState(false);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const toggleItem = (idx: number, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, idx] : prev.filter((i) => i !== idx)
    );
  };

  const selectableIndexes = (report?.item_status ?? [])
    .map((status, idx) => {
      // ✅ Admin or Technical Reviewer can select technical review items
      if (
        status === "pending_tr" &&
        (user?.role?.includes("technical_reviewer") ||
          user?.role?.includes("admin"))
      ) {
        return idx;
      }

      // ✅ Admin or HOD can select normal approval items
      if (
        status === "pending" &&
        (user?.role?.includes("hod") || user?.role?.includes("admin"))
      ) {
        return idx;
      }

      return null;
    })
    .filter((idx): idx is number => idx !== null);

  const allSelected =
    selectableIndexes.length > 0 &&
    selectedItems.length === selectableIndexes.length;

  const isIndeterminate =
    selectedItems.length > 0 && selectedItems.length < selectableIndexes.length;

  const toggleAll = (checked: boolean) => {
    setSelectedItems(checked ? selectableIndexes : []);
  };

  const canSelectItem = (idx: number) => {
    const status = report?.item_status?.[idx];

    if (!status) return false;

    // ✅ Admin can also select items waiting for technical review
    if (
      status === "pending_tr" &&
      (user?.role?.includes("technical_reviewer") ||
        user?.role?.includes("admin"))
    ) {
      return true;
    }

    // ✅ Admin can also select items waiting for HOD approval
    if (
      status === "pending" &&
      (user?.role?.includes("hod") || user?.role?.includes("admin"))
    ) {
      return true;
    }

    return false;
  };

  const bulkAction = async (
    action: "approve" | "reject",
    remark: string = ""
  ) => {
    if (!report || selectedItems.length === 0 || !user?.id) return;

    toast.promise(
      Promise.all(
        selectedItems.map(async (idx) => {
          const status = report.item_status?.[idx];
          const tag = report.tag?.[idx] ?? "";

          // ✅ Skip if already processed (approved/rejected)
          if (status === "approved" || status === "rejected") return;

          if (action === "approve") {
            // --- Technical reviewer final approval ---
            if (
              user?.role?.includes("technical_reviewer") &&
              status === "pending_tr"
            ) {
              await purchaseReportService.updateItemStatus(
                report.id,
                idx,
                "approved",
                remark,
                "technical_reviewer",
                user.id
              );
            }

            // --- HOD/Admin first approval for a _tr item ---
            else if (tag.endsWith("_tr")) {
              // ✅ Always store HOD id even if status is already pending_tr
              const newStatus =
                status === "pending_tr" ? "pending_tr" : "pending_tr";

              await purchaseReportService.updateItemStatus(
                report.id,
                idx,
                newStatus,
                remark,
                "hod",
                user.id
              );
            }

            // --- Normal approval (no technical review) ---
            else {
              await purchaseReportService.updateItemStatus(
                report.id,
                idx,
                "approved",
                remark,
                user?.role?.includes("hod") ? "hod" : undefined,
                user.id
              );
            }
          } else {
            // --- Rejection flow ---
            await purchaseReportService.updateItemStatus(
              report.id,
              idx,
              "rejected",
              remark,
              user?.role?.includes("hod") ? "hod" : undefined,
              user.id
            );
          }
        })
      ),
      {
        loading: "Processing selected items...",
        success: async () => {
          await fetchReport();
          setSelectedItems([]);
          return `Bulk ${action} completed successfully`;
        },
        error: "One or more updates failed",
      }
    );
  };

  useEffect(() => {
    if (open && prId) {
      setLoading(true);
      purchaseReportService
        .getById(prId)
        .then(setReport)
        .catch((err) => {
          console.error("Failed to fetch Purchase Request", err);
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
      console.error("Failed to refetch Purchase Request", err);
      toast.error("Failed to fetch updated report");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced PDF export with better image handling
  const downloadPDF = async (ref: React.RefObject<HTMLElement | null>) => {
    if (!ref.current) return;

    try {
      setIsExporting(true); // ⬅️ hide column
      await new Promise((r) => setTimeout(r, 50)); // allow a repaint

      // ⬇️ keep all your existing signature-image logic unchanged
      const signatureImages = ref.current.querySelectorAll(
        'img[alt*="signature"]'
      ) as NodeListOf<HTMLImageElement>;
      const imagePromises = Array.from(signatureImages).map(async (img) => {
        // … your existing conversion code …
      });

      await Promise.all(imagePromises);
      await new Promise((r) => setTimeout(r, 1000));

      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: false,
        imageTimeout: 0,
        removeContainer: true,
        ignoreElements: (el) =>
          el.tagName === "SCRIPT" || el.tagName === "NOSCRIPT",
        onclone: (doc) => {
          doc.querySelectorAll("img").forEach((img: HTMLImageElement) => {
            img.style.maxWidth = "none";
            img.style.maxHeight = "none";
            img.style.objectFit = "contain";
          });
        },
      });

      const imgData = canvas.toDataURL("image/png", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

      if (imgHeight > contentHeight) {
        const totalPages = Math.ceil(imgHeight / contentHeight);
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) pdf.addPage();
          const yOffset = -(page * contentHeight);
          pdf.addImage(
            imgData,
            "PNG",
            margin,
            margin + yOffset,
            contentWidth,
            imgHeight
          );
        }
      } else {
        pdf.addImage(imgData, "PNG", margin, margin, contentWidth, imgHeight);
      }

      pdf.save(`Purchase_Requisition_${prId}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false); // ⬅️ restore column
    }
  };

  // Alternative simpler method - sometimes less is more
  const downloadPDFSimple = async (
    ref: React.RefObject<HTMLElement | null>
  ) => {
    if (!ref.current) return;

    try {
      // Just ensure all images are loaded before capturing
      const images = ref.current.querySelectorAll(
        "img"
      ) as NodeListOf<HTMLImageElement>;

      const imageLoadPromises = Array.from(images).map((img) => {
        return new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Continue even if image fails
            // Timeout after 5 seconds
            setTimeout(() => resolve(), 5000);
          }
        });
      });

      await Promise.all(imageLoadPromises);

      // Simple html2canvas with minimal options
      const canvas = await html2canvas(ref.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const contentWidth = pageWidth - margin * 2;
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", margin, margin, contentWidth, imgHeight);
      pdf.save(`Purchase_Requisition_${prId}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  // --- existing action handlers ---
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

    const pendingCount =
      report.item_status?.filter(
        (s: string) => s === "pending" || s === "pending_tr"
      ).length ?? 0;

    const effectiveRole = pendingCount === 1 ? asRole : undefined;

    toast.promise(
      purchaseReportService.updateItemStatus(
        report.id,
        currentItemIndex,
        actionType === "approve" ? "approved" : "rejected",
        remark,
        effectiveRole,
        user?.id
      ),
      {
        loading: "Updating item...",
        success: (updated) => {
          setReport(updated);
          setOpenModal(false);
          fetchReport();
          onSuccess?.();
          return `Item ${currentItemIndex + 1} ${
            actionType === "approve" ? "approved" : "rejected"
          } successfully`;
        },
        error: "Failed to update item status. Please try again.",
      }
    );
  };

  const isItemProcessed = (idx: number) => {
    const status = report?.item_status?.[idx];
    return (
      status === "approved" ||
      status === "rejected" ||
      status === "approved_tr" ||
      status === "rejected_tr"
    );
  };

  const handleHodTrAction = async (idx: number) => {
    if (!report) return;
    try {
      await purchaseReportService.updateItemStatusOnly(
        report.id,
        idx,
        "pending_tr"
      );
      fetchReport();
      toast.success(`Item ${idx + 1} marked as pending_tr successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update item status.");
    }
  };

  const isDropdownDisabled = (idx: number) => {
    const userRole = user?.role ?? [];
    const itemStatus = report?.item_status?.[idx];
    const itemTag = report?.tag?.[idx];

    if (isItemProcessed(idx)) {
      return true;
    }

    if (
      !userRole.includes("hod") &&
      !userRole.includes("technical_reviewer") &&
      !userRole.includes("admin")
    ) {
      return true;
    }

    if (
      userRole.includes("technical_reviewer") &&
      !userRole.includes("admin")
    ) {
      return !itemTag?.endsWith("_tr") || itemStatus !== "pending_tr";
    }

    if (userRole.includes("hod") && !userRole.includes("admin")) {
      return itemTag?.endsWith("_tr") || itemStatus !== "pending";
    }

    if (userRole.includes("admin")) {
      return itemStatus !== "pending" && itemStatus !== "pending_tr";
    }

    return true;
  };

  useEffect(() => {
    // whenever the dialog closes, remove all selected items
    if (!open) {
      setSelectedItems([]);
    }
  }, [open]);

  return {
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
    fetchReport,
    downloadPDF,
    downloadPDFSimple,
    selectedItems,
    toggleItem,
    toggleAll,
    allSelected,
    isIndeterminate,
    canSelectItem,
    bulkAction,
    isExporting,
  };
}

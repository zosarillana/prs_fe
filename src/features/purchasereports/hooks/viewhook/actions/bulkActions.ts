import { toast } from "sonner";
import { purchaseReportService } from "@/features/purchasereports/purchaseReportService";
import { PurchaseReport } from "@/features/purchasereports/types";
import { User } from "@/types/users";

type BulkUpdateParams = {
  report: PurchaseReport;
  user: User;
  selectedItems: number[];
  action: "approve" | "reject";
  remark: string;
  fetchReport: () => Promise<void>;
  setSelectedItems: (items: number[]) => void;
};

export async function bulkUpdateItems({
  report,
  user,
  selectedItems,
  action,
  remark,
  fetchReport,
  setSelectedItems,
}: BulkUpdateParams) {
  toast.promise(
    Promise.all(
      selectedItems.map(async (idx) => {
        const status = report.item_status?.[idx];
        const tagDescription = report.tag?.[idx]?.description ?? "";

        const isAdmin = user.role.includes("admin");
        const isHod = user.role.includes("hod");
        const isTechnicalReviewer = user.role.includes("technical_reviewer");

        // Skip already processed items
        if (status === "approved" || status === "rejected") return;

        // Determine effective role
        let effectiveRole: "technical_reviewer" | "hod" | "both" | undefined;

        if (isAdmin) {
          if (status === "pending_tr" && tagDescription.endsWith("_tr")) {
            effectiveRole = "technical_reviewer";
          } else if (status === "pending" && tagDescription.endsWith("_tr")) {
            effectiveRole = "hod";
          } else {
            effectiveRole = "hod";
          }
        } else if (isHod && isTechnicalReviewer) {
          if (status === "pending_tr") {
            effectiveRole = "technical_reviewer";
          } else {
            effectiveRole = "hod";
          }
        } else if (isHod) {
          effectiveRole = "hod";
        } else if (isTechnicalReviewer) {
          effectiveRole = "technical_reviewer";
        }

        // Determine status to set
        let newStatus: "approved" | "rejected" | "pending_tr";

        if (action === "approve") {
          if (status === "pending_tr" && (isTechnicalReviewer || isAdmin)) {
            newStatus = "approved";
          } else if (
            tagDescription.endsWith("_tr") &&
            status === "pending" &&
            (isHod || isAdmin)
          ) {
            newStatus = "pending_tr";
          } else {
            newStatus = "approved";
          }
        } else {
          newStatus = "rejected";
        }

        await purchaseReportService.updateItemStatus(
          report.id,
          idx,
          newStatus,
          remark,
          effectiveRole,
          user.id
        );
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
}
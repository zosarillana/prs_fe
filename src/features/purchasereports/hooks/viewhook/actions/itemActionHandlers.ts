import { toast } from "sonner";
import { purchaseReportService } from "@/features/purchasereports/purchaseReportService";
import { mapActionToStatus, resolveEffectiveRole } from "./statusMapping";
import { PurchaseReport } from "@/features/purchasereports/types";
import { User } from "@/types/users";

type ConfirmItemParams = {
  report: PurchaseReport;
  user: User | null;
  index: number;
  actionType: "approve" | "reject" | "return" | "approve_to_review";
  newRemark: string;
  setReport: (r: PurchaseReport) => void;
  setOpenModal: (v: boolean) => void;
  fetchReport: () => Promise<void>;
  onSuccess?: () => void;
};

export async function confirmItemAction({
  report,
  user,
  index,
  actionType,
  newRemark,
  setReport,
  setOpenModal,
  fetchReport,
  onSuccess,
}: ConfirmItemParams) {
  if (!user) return;

  const tagDescription = report.tag?.[index]?.description ?? "";
  const oldRemark = report.remarks?.[index] ?? "";

  const combinedRemark =
    newRemark.trim() === ""
      ? oldRemark
      : oldRemark
      ? `${oldRemark}, ${newRemark}`
      : newRemark;

  // ✅ Special case: approve to review
  if (actionType === "approve_to_review") {
    toast.promise(
      purchaseReportService.updateItemStatus(
        report.id,
        index,
        "pending_tr",
        combinedRemark,
        "hod",
        user.id
      ),
      {
        loading: "Updating item...",
        success: async (updated) => {
          setReport(updated);
          setOpenModal(false);
          await fetchReport();
          onSuccess?.();
          return `Item ${index + 1} approved for technical review successfully`;
        },
        error: "Failed to update item status. Please try again.",
      }
    );
    return;
  }

  const newStatus = mapActionToStatus(actionType);
  const effectiveRole = resolveEffectiveRole(tagDescription);

  toast.promise(
    purchaseReportService.updateItemStatus(
      report.id,
      index,
      newStatus,
      combinedRemark,
      effectiveRole,
      user.id
    ),
    {
      loading: "Updating item...",
      success: async (updated) => {
        setReport(updated);
        setOpenModal(false);
        await fetchReport();
        onSuccess?.();

        return `Item ${index + 1} ${
          actionType === "approve"
            ? "approved"
            : actionType === "return"
            ? "returned"
            : "rejected"
        } successfully`;
      },
      error: "Failed to update item status. Please try again.",
    }
  );
}

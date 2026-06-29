import { PurchaseReport } from "@/features/purchasereports/types";
import { User } from "@/types/users";

export const isItemProcessed = (
  report: PurchaseReport | null,
  idx: number
) => {
  const status = report?.item_status?.[idx];
  return (
    status === "approved" ||
    status === "rejected" ||
    status === "approved_tr" ||
    status === "rejected_tr"
  );
};

export const isDropdownDisabled = (
  report: PurchaseReport | null,
  user: User | null,
  idx: number
) => {
  if (!report || !user) return true;

  const userRole = user.role ?? [];
  const itemStatus = report.item_status?.[idx];
  const itemTag = report.tag?.[idx];
  const itemTagDescription = itemTag?.description;

  const itemDepartment =
    typeof itemTag?.department === "string"
      ? itemTag.department
      : (itemTag?.department as unknown as string) ?? "";

  if (isItemProcessed(report, idx)) return true;

  const isAdmin = userRole.includes("admin");
  const isHod = userRole.includes("hod");
  const isTechnicalReviewer = userRole.includes("technical_reviewer");

  if (!isAdmin && !isHod && !isTechnicalReviewer) return true;

  const userDepartments = (user.department as unknown as string[]) ?? [];
  const isOfficeItems = itemDepartment === "office_items";

  const departmentMismatch =
    !isAdmin &&
    !isOfficeItems &&
    itemDepartment &&
    !userDepartments.includes(itemDepartment);

  if (departmentMismatch) return true;

  if (isTechnicalReviewer && !isAdmin) {
    return (
      !itemTagDescription?.endsWith("_tr") || itemStatus !== "pending_tr"
    );
  }

  if (isHod && !isAdmin) {
    return itemTagDescription?.endsWith("_tr") || itemStatus !== "pending";
  }

  if (isAdmin) {
    return itemStatus !== "pending" && itemStatus !== "pending_tr";
  }

  return true;
};

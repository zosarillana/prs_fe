import { User } from "@/types/users";

export function canAccessItem(
  user: User,
  itemDepartment: string,
  isOfficeItems: boolean
) {
  const isAdmin = user.role.includes("admin");
  if (isAdmin || isOfficeItems) return true;

  return user.department?.includes(itemDepartment);
}

export function canSelectItem({
  user,
  status,
  itemDepartment,
  tagDescription,
}: {
  user: User;
  status: string;
  itemDepartment: string;
  tagDescription?: string;
}) {
  const isAdmin = user.role.includes("admin");
  const isHod = user.role.includes("hod");
  const isTR = user.role.includes("technical_reviewer");
  const isOfficeItems = itemDepartment === "office_items";

  // ❌ _tr items blocked unless pending_tr
  if (tagDescription?.endsWith("_tr") && status !== "pending_tr") {
    return false;
  }

  if (!canAccessItem(user, itemDepartment, isOfficeItems)) {
    return false;
  }

  if (status === "pending" && (isHod || isAdmin)) return true;
  if (status === "pending_tr" && (isTR || isAdmin)) return true;
  if (status === "returned" && (isAdmin || isHod || isTR)) return true;

  return false;
}

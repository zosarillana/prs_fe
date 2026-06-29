export type ItemAction =
  | "approve"
  | "reject"
  | "return"
  | "approve_to_review";

export const mapActionToStatus = (
  action: ItemAction
): "approved" | "rejected" | "return" => {
  switch (action) {
    case "approve":
      return "approved";
    case "return":
      return "return";
    case "reject":
    default:
      return "rejected";
  }
};

export const resolveEffectiveRole = (
  tagDescription: string
): "hod" | "technical_reviewer" => {
  return tagDescription.endsWith("_tr")
    ? "technical_reviewer"
    : "hod";
};

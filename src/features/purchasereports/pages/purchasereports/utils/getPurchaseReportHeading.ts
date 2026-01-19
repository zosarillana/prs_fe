type Args = {
  prStatusTerm: string;
  statusTerm: string;
  completedTr: boolean;
  ownDepartment: boolean;
  forCeoApproval: boolean;
  forPoApproval: boolean;
  approvedPo: boolean;
  user: any;
};

export function getPurchaseReportHeading({
  prStatusTerm,
  statusTerm,
  completedTr,
  ownDepartment,
  forCeoApproval,
  forPoApproval,
  approvedPo,
  user,
}: Args): string {
  if (prStatusTerm === "on_hold") return "For HOD Approval";
  if (prStatusTerm === "on_hold_tr") return "For TR Approval";
  if (prStatusTerm === "returned") return "Returned PR";
  if (prStatusTerm === "Rejected") return "Rejected PR";
  if (statusTerm === "approved") return "Approved Purchase Orders";
  if (completedTr) return "Completed TR";
  if (ownDepartment) return "Department Total PRs";
  if (prStatusTerm === "closed") return "Closed PRs";
  if (prStatusTerm === "drafted") return "Drafted PRs";
  if (prStatusTerm === "on_hold_return") return "On Hold For Edit PRs";
  if (statusTerm === "for_approval" || prStatusTerm === "for_approval")
    return "For Purchase Order Creation";
  if (forCeoApproval) return "For PO Approval";
  if (forPoApproval) return "For Purchase Order Creation";
  if (approvedPo) return "Approved POs";
  if (user?.role?.includes("hod")) return "Purchase Requests";
  if (user?.role?.includes("technical_reviewer")) return "Review Items";

  return "Purchase Requests";
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  X,
  MoreVertical,
  ArrowDownRight,
  ArrowLeftFromLine,
} from "lucide-react";
import type { User } from "@/types/users";
import type { PurchaseReport } from "@/features/purchasereports/types";


interface PurchaseReportItemsTableProps {
  report: PurchaseReport;
  user: User | null;
  isExporting?: boolean;
  selectedItems: number[];
  allSelected: boolean;
  isIndeterminate: boolean;
  onToggleItem: (idx: number, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onBulkAction: (action: "approve" | "reject") => void;
  onItemAction: (idx: number, action: "approve" | "reject" | "return") => void;
  onHodTrAction: (idx: number) => void;
  canSelectItem: (idx: number) => boolean;
  isAdmin?: boolean;
  isHod?: boolean;
  isTechnicalReviewer?: boolean;
  hasBothRoles?: boolean;
}

export function PurchaseReportItemsTable({
  report,
  user,
  isExporting = false,
  selectedItems,
  allSelected,
  isIndeterminate,
  onToggleItem,
  onToggleAll,
  onBulkAction,
  onItemAction,
  onHodTrAction,
  canSelectItem,
  isAdmin = false,
  isHod = false,
  isTechnicalReviewer = false,
  hasBothRoles = false,
}: PurchaseReportItemsTableProps) {
  const shouldDisableApproveForHod = false;

  const truncate = (text: string | undefined, length = 40) => {
    if (!text) return "none";
    return text.length > length ? text.slice(0, length) + "…" : text;
  };

  /* 🔥 THIS LINE IS NOW TYPE-SAFE */
  const getActionMenuDisabled = (idx: number) => {
    const itemStatus = report.item_status?.[idx];
    const tagDept = report.tag?.[idx]?.department ?? "";

    return (
      (user?.role?.includes("technical_reviewer") &&
        !user?.role?.includes("hod") &&
        itemStatus === "pending" &&
        tagDept !== "office_items" &&
        !(user?.department ?? []).some((dept) => dept === tagDept)) ||
      (user?.role?.includes("hod") &&
        user?.role?.includes("purchasing") &&
        !user?.role?.includes("admin") &&
        (report.department ?? "") !== "office_items" &&
        !(user?.department ?? []).includes(report.department ?? "")) ||
      (user?.role?.includes("hod") &&
        report.po_status === "approved" &&
        !user?.role?.includes("purchasing") &&
        !user?.role?.includes("admin")) ||
      (user?.role?.includes("hod") &&
        user?.role?.includes("technical_reviewer") &&
        !user?.role?.includes("admin") &&
        report.user?.id !== user?.id && // ✅ number vs number
        (itemStatus === "pending" || itemStatus === "pending_tr") &&
        !(user?.department ?? []).some(
          (d) => d === (report.department ?? ""),
        ) &&
        !(
          itemStatus === "pending_tr" &&
          (user?.department ?? []).some((d) => d === tagDept)
        ))
    );
  };

  const isDropdownTriggerDisabled = () => {
    return (
      (user?.role?.includes("technical_reviewer") &&
        !user?.role?.includes("hod") &&
        !(user?.department ?? []).some(
          (dept) => dept === (report.department ?? ""),
        )) ||
      (user?.role?.includes("hod") &&
        user?.role?.includes("purchasing") &&
        !user?.role?.includes("admin") &&
        (report.department ?? "") !== "office_items" &&
        !(user?.department ?? []).includes(report.department ?? "")) ||
      (user?.role?.includes("hod") &&
        report.po_status === "approved" &&
        !user?.role?.includes("purchasing") &&
        !user?.role?.includes("admin"))
    );
  };

  const getApproveDisabled = (idx: number) => {
    if (isAdmin) return false;

    const tagDept = report.tag?.[idx]?.department;
    const itemStatus = report.item_status?.[idx];
    const isOfficeItems = tagDept === "office_items";

    // HOD + TR wrong department
    if (
      user?.role?.includes("hod") &&
      user?.role?.includes("technical_reviewer") &&
      !user?.role?.includes("admin") &&
      !(isOfficeItems || (user?.department ?? []).some((d) => d === tagDept))
    ) {
      return true;
    }

    // HOD + TR acts as TR only for non-office items
    if (isHod && isTechnicalReviewer && !isOfficeItems) {
      return itemStatus !== "pending_tr";
    }

    // HOD cannot approve _tr items
    if (isHod && report.tag?.[idx]?.description?.endsWith("_tr")) {
      return true;
    }

    // Technical Reviewer approves pending_tr
    if (isTechnicalReviewer && itemStatus === "pending_tr") {
      return false;
    }

    return (
      !(isTechnicalReviewer || isHod) ||
      shouldDisableApproveForHod ||
      (report.tag?.[idx]?.description?.endsWith("_tr") &&
        itemStatus !== "pending_tr")
    );
  };

  const getApproveToReviewDisabled = (idx: number) => {
    const itemStatus = report.item_status?.[idx];

    // Disable for HOD if status is pending_tr (only Admin can approve)
    if (itemStatus === "pending_tr" && !isAdmin) {
      return true;
    }

    // Disable for HOD if there are any non-_tr pending items
    if (
      !isAdmin &&
      itemStatus === "pending" &&
      !report.item_status?.every(
        (status, i) =>
          status !== "pending" || report.tag?.[i]?.description?.endsWith("_tr"),
      )
    ) {
      return true;
    }

    return false;
  };

  const showActionColumn =
    (user?.role?.includes("hod") ||
      user?.role?.includes("technical_reviewer") ||
      user?.role?.includes("admin")) &&
    !isExporting;

  return (
    <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
      <Table className="border-separate border-spacing-0 w-full">
        <TableHeader>
          <TableRow>
            {!isExporting && (
              <TableHead className="border-b w-10 items-center gap-1 print:hidden">
                <div className="flex items-center">
                  <Checkbox
                    checked={
                      allSelected
                        ? true
                        : isIndeterminate
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) => onToggleAll(checked === true)}
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="mt-2 rounded hover:bg-muted transition"
                        disabled={isDropdownTriggerDisabled()}
                      >
                        <ArrowDownRight className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="start" className="w-40">
                      <DropdownMenuItem
                        onClick={() => onBulkAction("approve")}
                        disabled={
                          selectedItems.length === 0 ||
                          isDropdownTriggerDisabled()
                        }
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Selected
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onBulkAction("reject")}
                        disabled={
                          selectedItems.length === 0 ||
                          isDropdownTriggerDisabled()
                        }
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableHead>
            )}

            <TableHead className="border-b">Item</TableHead>
            <TableHead className="border-b">Description</TableHead>
            <TableHead className="border-b">Quantity</TableHead>
            <TableHead className="border-b">Unit</TableHead>
            <TableHead className={`border-b ${isExporting ? "hidden" : ""}`}>
              Tags
            </TableHead>
            <TableHead className="border-b">Remarks</TableHead>
            <TableHead className="border-b">Status</TableHead>

            {showActionColumn && (
              <TableHead className="border-b">Action</TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {report.item_description?.map((desc, idx) => (
            <TableRow
              key={idx}
              className={
                report.item_status?.[idx] === "rejected"
                  ? "line-through opacity-60"
                  : ""
              }
            >
              {!isExporting && (
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(idx)}
                    disabled={!canSelectItem(idx)}
                    onCheckedChange={(checked) => {
                      if (canSelectItem(idx)) onToggleItem(idx, !!checked);
                    }}
                  />
                </TableCell>
              )}

              <TableCell className="font-semibold">
                <div className="flex items-center gap-1"># {idx + 1}</div>
              </TableCell>

              <TableCell className="w-96">{desc}</TableCell>
              <TableCell>{report.quantity?.[idx] ?? ""}</TableCell>
              <TableCell>{report.unit?.[idx] ?? ""}</TableCell>

              <TableCell className={isExporting ? "hidden" : ""}>
                {Array.isArray(report.tag) && report.tag[idx]?.description
                  ? report.tag[idx].description
                  : ""}
              </TableCell>

              <TableCell className="max-w-[180px]">
                {isExporting ? (
                  <span className="whitespace-pre-wrap">
                    {truncate(report.remarks?.[idx], 40)}
                  </span>
                ) : (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <span className="cursor-pointer line-clamp-1">
                        {report.remarks?.[idx] ?? "none"}
                      </span>
                    </HoverCardTrigger>
                    <HoverCardContent
                      side="bottom"
                      align="start"
                      className="max-w-xs p-3 text-sm whitespace-pre-wrap"
                      sideOffset={4}
                    >
                      {report.remarks?.[idx] ?? "none"}
                    </HoverCardContent>
                  </HoverCard>
                )}
              </TableCell>

              <TableCell>
                <span
                  className={`font-bold text-xs capitalize print:text-black print:opacity-90 ${
                    report.item_status?.[idx] === "approved" ||
                    report.item_status?.[idx] === "approved_tr"
                      ? "text-green-800"
                      : report.item_status?.[idx] === "rejected" ||
                          report.item_status?.[idx] === "cancelled" ||
                          report.item_status?.[idx] === "rejected_tr"
                        ? "text-red-800"
                        : "text-yellow-800"
                  }`}
                >
                  {report.item_status?.[idx] || "pending"}
                </span>
              </TableCell>

              {showActionColumn && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={getActionMenuDisabled(idx)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="start"
                      className="w-34 animate-in fade-in-0 zoom-in-95"
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      {[
                        "rejected",
                        "cancelled",
                        "approved",
                        "drafted",
                      ].includes(report.item_status?.[idx] || "") ? (
                        <DropdownMenuItem disabled>
                          <span className="text-gray-400">
                            {report.item_status?.[idx]} – Actions Disabled
                          </span>
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <HoverCard openDelay={200} closeDelay={100}>
                            <HoverCardTrigger asChild>
                              <DropdownMenuItem
                                disabled={getApproveDisabled(idx)}
                                onSelect={(e) => {
                                  e.preventDefault();
                                  onItemAction(idx, "approve");
                                }}
                              >
                                <CheckCircle />
                                <span>Approve</span>
                              </DropdownMenuItem>
                            </HoverCardTrigger>

                            {isHod &&
                              report.item_status?.filter((s) => s === "pending")
                                .length === 1 && (
                                <HoverCardContent
                                  side="right"
                                  align="start"
                                  className="w-64 text-sm"
                                >
                                  Approving this final pending item will{" "}
                                  <span className="font-semibold">
                                    sign the document with your signature.
                                  </span>
                                </HoverCardContent>
                              )}

                            {isTechnicalReviewer &&
                              report.item_status?.filter(
                                (s) => s === "pending_tr",
                              ).length === 1 && (
                                <HoverCardContent
                                  side="right"
                                  align="start"
                                  className="w-64 text-sm"
                                >
                                  Approving this final pending technical review
                                  will{" "}
                                  <span className="font-semibold">
                                    sign the document with your review.
                                  </span>
                                </HoverCardContent>
                              )}
                          </HoverCard>

                          {(isHod || isAdmin || hasBothRoles) &&
                            report.tag?.[idx]?.description?.endsWith("_tr") && (
                              <DropdownMenuItem
                                disabled={getApproveToReviewDisabled(idx)}
                                onSelect={(e) => {
                                  e.preventDefault();
                                  if (!getApproveToReviewDisabled(idx)) {
                                    onHodTrAction(idx);
                                  }
                                }}
                              >
                                <CheckCircle />
                                <span>Approve To Review</span>
                              </DropdownMenuItem>
                            )}

                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              onItemAction(idx, "return");
                            }}
                          >
                            <ArrowLeftFromLine className="h-4 w-4" />
                            <span>Return</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              onItemAction(idx, "reject");
                            }}
                          >
                            <X className="h-4 w-4" />
                            <span>Reject</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

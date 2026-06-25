"use client";

import * as React from "react";
import logo from "@/assets/images/logosidebar.png"; // ✅ import your logo
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth/authStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeletonPrInput } from "@/components/ui/skeletons/purchasereports/tableSkeletonPrInput";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  X,
  MoreVertical,
  ArrowDownRight,
  HashIcon,
  File,
} from "lucide-react";
import { RemarkPrDialog } from "./remarkPrDialog";
import { useViewPurchaseReport } from "../hooks/useViewPurchaseReport";
import { useRef } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface ViewPurchaseReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prId: number | null;
  onSuccess?: () => void; // ✅ Add this
}

export function ViewPurchaseReportDialog({
  open,
  onOpenChange,
  prId,
  onSuccess,
}: ViewPurchaseReportDialogProps) {
  const user = useAuthStore((state) => state.user);
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const printRef = useRef<HTMLDivElement>(null);
  const {
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
    bulkAction,
    isExporting,
    // user,
    isAdmin,
    isHod,
    isTechnicalReviewer,
    hasBothRoles,
    tagDescription,
  } = useViewPurchaseReport(prId, open);
  const shouldDisableApproveForHod = false;

  const truncate = (text: string, length = 40) => {
    if (!text) return "none";
    return text.length > length ? text.slice(0, length) + "…" : text;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] overflow-auto">
        <div className="max-h-[80vh] overflow-y-auto pr-2">
          <div ref={printRef}>
            {/* Company header */}
            <div className="flex flex-col items-center mb-5">
              <img src={logo} className="h-32 -mb-10" crossOrigin="anonymous" />
              <p className="text-sm font-light mt-3">
                Upper Quinokol, Brgy. Darong, Sta. Cruz, Davao Del Sur.
              </p>
            </div>

            <p className="mt-3 text-lg text-center font-semibold mb-2">
              PURCHASE REQUISITION SLIP
            </p>

            {loading ? (
              <TableSkeletonPrInput rows={3} />
            ) : report ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-row justify-between w-full">
                    <p>
                      <strong>Purpose:</strong> {report.pr_purpose}
                    </p>
                    <div className="flex flex-col gap-4 -mt-9">
                      <p>
                        <strong className="ml-6">Series No:</strong>{" "}
                        {report.series_no}
                      </p>
                      <p>
                        <strong className="ml-12">Date:</strong>{" "}
                        {report.date_submitted}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row justify-between w-full">
                    <p>
                      <strong>Department:</strong>{" "}
                      {report.user?.department || ""}
                    </p>
                    <p>
                      <strong>Date Needed:</strong> {report.date_needed}
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
                  <Table className="border-separate border-spacing-0 w-full">
                    <TableHeader>
                      <TableRow>
                        {!isExporting && (
                          <TableHead className="border-b w-10 items-center gap-1 print:hidden">
                            <div className="flex items-center">
                              {/* --- Select All Checkbox --- */}
                              <Checkbox
                                checked={
                                  allSelected
                                    ? true
                                    : isIndeterminate
                                    ? "indeterminate"
                                    : false
                                }
                                onCheckedChange={(checked) =>
                                  toggleAll(checked === true)
                                }
                              />

                              {/* --- Dropdown beside checkbox --- */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className="mt-2 rounded hover:bg-muted transition"
                                    disabled={
                                      user?.role?.includes("hod") &&
                                      user?.role?.includes("purchasing") &&
                                      !(user?.department ?? []).includes(
                                        report?.department
                                      )
                                    }
                                  >
                                    <ArrowDownRight className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                  align="start"
                                  className="w-40"
                                >
                                  <DropdownMenuItem
                                    onClick={() => bulkAction("approve")}
                                    disabled={
                                      selectedItems.length === 0 ||
                                      (user?.role?.includes("hod") &&
                                        user?.role?.includes("purchasing") &&
                                        !(user?.department ?? []).includes(
                                          report?.department
                                        ))
                                    }
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve Selected
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => bulkAction("reject")}
                                    disabled={
                                      selectedItems.length === 0 ||
                                      (user?.role?.includes("hod") &&
                                        user?.role?.includes("purchasing") &&
                                        !(user?.department ?? []).includes(
                                          report?.department
                                        ))
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
                        <TableHead
                          className={`border-b ${isExporting ? "hidden" : ""}`}
                        >
                          Tags
                        </TableHead>
                        <TableHead className="border-b">Remarks</TableHead>
                        <TableHead className="border-b">Status</TableHead>

                        {(user?.role?.includes("hod") ||
                          user?.role?.includes("technical_reviewer") ||
                          user?.role?.includes("admin")) &&
                          !isExporting && (
                            <TableHead className="border-b">Action</TableHead>
                          )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.item_description?.map((desc, idx) => (
                        <TableRow key={idx}>
                          {!isExporting && (
                            <TableCell>
                              <Checkbox
                                checked={selectedItems.includes(idx)}
                                disabled={!canSelectItem(idx)}
                                onCheckedChange={(checked) => {
                                  if (canSelectItem(idx))
                                    toggleItem(idx, !!checked);
                                }}
                              />
                            </TableCell>
                          )}
                          <TableCell className="font-semibold">
                            <div className="flex items-center gap-1">
                              # {idx + 1}
                            </div>
                          </TableCell>
                          <TableCell className="w-96">{desc}</TableCell>
                          <TableCell>{report.quantity?.[idx] ?? ""}</TableCell>
                          <TableCell>{report.unit?.[idx] ?? ""}</TableCell>
                          <TableCell className={isExporting ? "hidden" : ""}>
                            {Array.isArray(report.tag) &&
                            report.tag[idx]?.description
                              ? report.tag[idx].description
                              : ""}
                          </TableCell>

                          <TableCell className="max-w-[180px]">
                            {isExporting ? (
                              // 👇 SAFE FOR HTML2CANVAS — manual truncation
                              <span className="whitespace-pre-wrap">
                                {truncate(report.remarks?.[idx], 40)}
                              </span>
                            ) : (
                              // 👇 INTERACTIVE VERSION
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
                              className={`font-bold text-xs capitalize
                              print:text-black print:opacity-90
                              ${
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

                          {(user?.role?.includes("hod") ||
                            user?.role?.includes("technical_reviewer") ||
                            user?.role?.includes("admin")) &&
                            !isExporting && (
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={
                                        // 1) Disable for technical_reviewer-only (exclude users who are also HOD)
                                        (user?.role?.includes(
                                          "technical_reviewer"
                                        ) &&
                                          !user?.role?.includes("hod") &&
                                          report.item_status?.[idx] ===
                                            "pending" &&
                                          (report.tag?.[idx]?.department ??
                                            "") !== "office_items" &&
                                          !(user?.department ?? []).some(
                                            (dept) =>
                                              dept ===
                                              (report.tag?.[idx]?.department ??
                                                "")
                                          )) ||
                                        // 2) Disable for users with ONLY hod AND purchasing (not admin) if department doesn't match report department AND NOT office_items
                                        (user?.role?.includes("hod") &&
                                          user?.role?.includes("purchasing") &&
                                          !user?.role?.includes("admin") &&
                                          report.department !==
                                            "office_items" &&
                                          !(user?.department ?? []).includes(
                                            report.department
                                          )) ||
                                        // 3) Disable for HOD if po_status is approved (but NOT if they also have purchasing or admin role)
                                        (user?.role?.includes("hod") &&
                                          report.po_status === "approved" &&
                                          !user?.role?.includes("purchasing") &&
                                          !user?.role?.includes("admin")) ||
                                        // 4) Disable for users with BOTH HOD AND TR roles (non-admin) if they didn't create the data
                                        //    UNLESS it's pending_tr AND tag department matches their department
                                        (user?.role?.includes("hod") &&
                                          user?.role?.includes(
                                            "technical_reviewer"
                                          ) &&
                                          !user?.role?.includes("admin") &&
                                          report.user?.id !== user?.id &&
                                          (report.item_status?.[idx] ===
                                            "pending" ||
                                            report.item_status?.[idx] ===
                                              "pending_tr") &&
                                          // Disable ONLY when:
                                          // - Report department doesn't match user's departments
                                          // - AND (if pending_tr, tag department also doesn't match)
                                          !(user?.department ?? []).some(
                                            (d) => d === report.department
                                          ) &&
                                          !(
                                            report.item_status?.[idx] ===
                                              "pending_tr" &&
                                            (user?.department ?? []).some(
                                              (d) =>
                                                d ===
                                                report.tag?.[idx]?.department
                                            )
                                          ))
                                      }
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="start"
                                    className="w-34 animate-in fade-in-0 zoom-in-95"
                                    onCloseAutoFocus={(e) => e.preventDefault()}
                                  >
                                    {/* Disable all buttons if item is not actionable */}
                                    {user?.role?.includes(
                                      "technical_reviewer"
                                    ) &&
                                    !user?.role?.includes("hod") &&
                                    !user?.role?.includes("admin") &&
                                    report.item_status?.[idx] === "pending" ? (
                                      <DropdownMenuItem disabled>
                                        <span className="text-gray-400">
                                          Pending PR – Actions Disabled
                                        </span>
                                      </DropdownMenuItem>
                                    ) : report.item_status?.[idx] ===
                                      "cancelled" ? (
                                      <DropdownMenuItem disabled>
                                        <span className="text-gray-400">
                                          Cancelled – Actions Disabled
                                        </span>
                                      </DropdownMenuItem>
                                    ) : report.item_status?.[idx] ===
                                      "approved" ? (
                                      <DropdownMenuItem disabled>
                                        <span className="text-gray-400">
                                          Approved – Actions Disabled
                                        </span>
                                      </DropdownMenuItem>
                                    ) : report.item_status?.[idx] ===
                                      "drafted" ? (
                                      <DropdownMenuItem disabled>
                                        <span className="text-gray-400">
                                          Drafted – Actions Disabled
                                        </span>
                                      </DropdownMenuItem>
                                    ) : (
                                      <>
                                        {/* ✅ Approve */}
                                        <HoverCard
                                          openDelay={200}
                                          closeDelay={100}
                                        >
                                          <HoverCardTrigger asChild>
                                            <DropdownMenuItem
                                              disabled={
                                                // Admin can always approve
                                                isAdmin
                                                  ? false
                                                  : // If user has both roles, treat them as Technical Reviewer
                                                  isHod && isTechnicalReviewer
                                                  ? report.item_status?.[
                                                      idx
                                                    ] !== "pending_tr"
                                                  : // HOD should not approve if the tag ends with _tr
                                                  isHod &&
                                                    report.tag?.[
                                                      idx
                                                    ]?.description?.endsWith(
                                                      "_tr"
                                                    )
                                                  ? true
                                                  : // Technical Reviewer can approve if status is pending_tr
                                                  isTechnicalReviewer &&
                                                    report.item_status?.[
                                                      idx
                                                    ] === "pending_tr"
                                                  ? false
                                                  : // Otherwise, check normal conditions
                                                    !(
                                                      isTechnicalReviewer ||
                                                      isHod
                                                    ) ||
                                                    shouldDisableApproveForHod ||
                                                    // Disable Approve if tag description ends with _tr and status is NOT pending_tr
                                                    (report.tag?.[
                                                      idx
                                                    ]?.description?.endsWith(
                                                      "_tr"
                                                    ) &&
                                                      report.item_status?.[
                                                        idx
                                                      ] !== "pending_tr")
                                              }
                                              onSelect={(e) => {
                                                e.preventDefault();
                                                handleItemAction(
                                                  idx,
                                                  "approve"
                                                );
                                              }}
                                            >
                                              <CheckCircle />
                                              <span>Approve</span>
                                            </DropdownMenuItem>
                                          </HoverCardTrigger>

                                          {/* Hover warnings */}
                                          {isHod &&
                                            report.item_status?.filter(
                                              (s) => s === "pending"
                                            ).length === 1 && (
                                              <HoverCardContent
                                                side="right"
                                                align="start"
                                                className="w-64 text-sm"
                                              >
                                                Approving this final pending
                                                item will{" "}
                                                <span className="font-semibold">
                                                  sign the document with your
                                                  signature.
                                                </span>
                                              </HoverCardContent>
                                            )}

                                          {isTechnicalReviewer &&
                                            report.item_status?.filter(
                                              (s) => s === "pending_tr"
                                            ).length === 1 && (
                                              <HoverCardContent
                                                side="right"
                                                align="start"
                                                className="w-64 text-sm"
                                              >
                                                Approving this final pending
                                                technical review will{" "}
                                                <span className="font-semibold">
                                                  sign the document with your
                                                  review.
                                                </span>
                                              </HoverCardContent>
                                            )}
                                        </HoverCard>

                                        {/* ✅ HOD/Admin/HOD+TR can Approve To Review for _tr items */}
                                        {(isHod || isAdmin || hasBothRoles) &&
                                          report.tag?.[
                                            idx
                                          ]?.description?.endsWith("_tr") && (
                                            <DropdownMenuItem
                                              disabled={
                                                // Disable for HOD if status is pending_tr (only Admin can approve pending_tr)
                                                (report.item_status?.[idx] ===
                                                  "pending_tr" &&
                                                  !isAdmin) ||
                                                // Disable for HOD if there are any non-_tr pending items
                                                (!isAdmin &&
                                                  report.item_status?.[idx] ===
                                                    "pending" &&
                                                  !report.item_status?.every(
                                                    (status, i) =>
                                                      status !== "pending" ||
                                                      report.tag?.[
                                                        i
                                                      ]?.description?.endsWith(
                                                        "_tr"
                                                      )
                                                  ))
                                              }
                                              onSelect={(e) => {
                                                e.preventDefault();
                                                // Defensive check: only proceed when not disabled
                                                if (
                                                  (report.item_status?.[idx] ===
                                                    "pending_tr" &&
                                                    !isAdmin) ||
                                                  (!isAdmin &&
                                                    report.item_status?.[
                                                      idx
                                                    ] === "pending" &&
                                                    !report.item_status?.every(
                                                      (status, i) =>
                                                        status !== "pending" ||
                                                        report.tag?.[
                                                          i
                                                        ]?.description?.endsWith(
                                                          "_tr"
                                                        )
                                                    ))
                                                ) {
                                                  return;
                                                }
                                                handleHodTrAction(idx);
                                              }}
                                            >
                                              <CheckCircle />
                                              <span>Approve To Review</span>
                                            </DropdownMenuItem>
                                          )}

                                        {/* ✅ Reject */}
                                        <DropdownMenuItem
                                          onSelect={(e) => {
                                            e.preventDefault();
                                            handleItemAction(idx, "reject");
                                          }}
                                        >
                                          <X className="mr-2 h-4 w-4" />
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

                {/* Signature Section */}
                <div id="signature-section" className="grid grid-cols-1 h-48">
                  <div className="flex flex-row justify-between w-full">
                    {/* <div className="flex flex-col gap-6 w-1/4">
                    <p className="flex justify-start w-full">
                      <strong>Requested by:</strong>
                    </p>
                    <p className="capitalize">{report.user?.name}</p>
                    
                    <div className="w-120 border-t border-black border-t -mt-5" />
                  </div> */}
                    {/* CREATED BY SIGNATURE SECTION */}
                    <div>
                      <p className="text-sm tracking-tight font-bold uppercase">
                        Created By:
                      </p>

                      {/* Signature Image */}
                      <div className="flex-grow text-start">
                        <div className="flex justify-start items-start">
                          {report.user ? (
                            <>
                              {report.user?.signature ? (
                                <img
                                  src={`${API_BASE_URL}/files/signatures/${report.user?.signature.replace(
                                    /^\/?storage\/signatures\//,
                                    ""
                                  )}`}
                                  alt="User Signature"
                                  className="mt-4 h-20 w-48 opacity-100"
                                  crossOrigin="anonymous"
                                  style={{
                                    objectFit: "contain",
                                  }}
                                  onLoad={() =>
                                    console.log("User signature loaded")
                                  }
                                  onError={(e) =>
                                    console.error(
                                      "User signature:",
                                      report.user?.signature,
                                      e
                                    )
                                  }
                                />
                              ) : (
                                // Default Signature Placeholder
                                <img
                                  src="assets/images/logo/signature.png"
                                  alt="Default Signature"
                                  className="mt-4 w-48 opacity-100"
                                />
                              )}
                            </>
                          ) : (
                            // Blank Signature Placeholder
                            <img
                              src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                              alt="Blank Signature"
                              className="mt-4 w-20 opacity-0"
                            />
                          )}
                        </div>

                        {/* Show Name & Role */}
                        <div
                          className="flex flex-row 
                       uppercase"
                        >
                          <div className="flex flex-col w-48">
                            <p className="text-md border-t m-1 text-center items-center">
                              {report.user?.name || "NOT AVAILABLE"}
                            </p>

                            <span className="text-sm text-gray-600 text-center items-center">
                              {report.user?.department || "IT/OT OPERATIONS"}
                            </span>

                            {/* Date in a separate element */}
                            <div className="text-xs tracking-tight font-bold uppercase text-center ">
                              Date
                              <span className="ml-2 font-medium">
                                {report.created_at
                                  ? new Date(
                                      report.created_at
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* <!-- HOD SIGNATURE SECTION --> */}
                    <div>
                      <p className="text-sm tracking-tight font-bold uppercase">
                        Approved By:
                      </p>

                      {/* Signature Image */}
                      <div className="flex-grow text-start">
                        <div className="flex justify-start items-start">
                          {report.hod_user_id ? (
                            <>
                              {report.hod_user_id?.signature ? (
                                <img
                                  src={`${API_BASE_URL}/files/signatures/${report.hod_user_id?.signature.replace(
                                    /^\/?storage\/signatures\//,
                                    ""
                                  )}`}
                                  alt="HOD Signature"
                                  className="mt-4 h-20 w-48 opacity-100"
                                  crossOrigin="anonymous"
                                  style={{
                                    objectFit: "contain",
                                  }}
                                  onLoad={() =>
                                    console.log("HOD signature loaded")
                                  }
                                  onError={(e) =>
                                    console.error(
                                      "HOD signature:",
                                      report.hod_user_id?.signature,
                                      e
                                    )
                                  }
                                />
                              ) : (
                                // Default Signature Placeholder
                                <img
                                  src="assets/images/logo/signature.png"
                                  alt="Default Signature"
                                  className="mt-4 w-48 opacity-50"
                                />
                              )}
                            </>
                          ) : (
                            // Blank Signature Placeholder
                            <img
                              src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                              alt="Blank Signature"
                              className="mt-4 w-20 opacity-0"
                            />
                          )}
                        </div>

                        {/* Show Name & Role */}
                        <div className="flex flex-row gap-8 uppercase">
                          <div className="flex flex-col w-48">
                            <p className="text-md border-t m-1 text-center items-center">
                              {report.hod_user_id?.name || "NOT AVAILABLE"}
                            </p>

                            <span className="text-sm text-gray-600 text-center items-center">
                              {report.hod_user_id?.department ||
                                "HEAD OF DEPARTMENT"}
                            </span>

                            {/* Date in a separate element */}
                            <div className="text-xs tracking-tight font-bold uppercase text-center">
                              Date
                              <span className="ml-2 font-medium">
                                {report.hod_signed_at
                                  ? new Date(
                                      report.hod_signed_at
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* REVIEWED BY SIGNATURE SECTION */}
                    <div>
                      <p className="text-sm tracking-tight font-bold uppercase">
                        Reviewed By:
                      </p>

                      {/* Signature Image */}
                      <div className="flex-grow text-start">
                        <div className="flex justify-start items-start">
                          {report.tr_user_id ? (
                            <>
                              {report.tr_user_id?.signature ? (
                                <img
                                  src={`${API_BASE_URL}/files/signatures/${report.tr_user_id?.signature.replace(
                                    /^\/?storage\/signatures\//,
                                    ""
                                  )}`}
                                  alt="Technical Reviewer Signature"
                                  className="mt-4 h-20 w-48 opacity-50"
                                  crossOrigin="anonymous"
                                  style={{
                                    objectFit: "contain",
                                  }}
                                  onLoad={() =>
                                    console.log("TR signature loaded")
                                  }
                                  onError={(e) =>
                                    console.error(
                                      "TR signature:",
                                      report.tr_user_id?.signature,
                                      e
                                    )
                                  }
                                />
                              ) : (
                                // Default Signature Placeholder
                                <img
                                  src="assets/images/logo/signature.png"
                                  alt="Default Signature"
                                  className="mt-4 w-48 opacity-50"
                                />
                              )}
                            </>
                          ) : (
                            // Blank Signature Placeholder
                            <img
                              src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                              alt="Blank Signature"
                              className="mt-4 w-20 opacity-0"
                            />
                          )}
                        </div>

                        {/* Show Name & Role */}
                        <div className="flex flex-row gap-8 uppercase">
                          <div className="flex flex-col w-48">
                            <p className="text-md border-t m-1 text-center items-center">
                              {report.tr_user_id?.name || "NOT AVAILABLE"}
                            </p>

                            <span className="text-sm text-gray-600 text-center items-center">
                              {report.tr_user_id?.department ||
                                "TECHNICAL REVIEWER"}
                            </span>

                            {/* Date in a separate element */}
                            <div className="text-xs tracking-tight font-bold uppercase text-center ">
                              Date
                              <span className="ml-2 font-medium">
                                {report.tr_signed_at
                                  ? new Date(
                                      report.tr_signed_at
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p>No data found.</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <div className="flex flex-row gap-4">
              {!(
                user?.role?.includes("hod") ||
                user?.role?.includes("technical_reviewer") ||
                user?.role?.includes("user")
              ) && (
                <div className="flex flex-row gap-4">
                  {" "}
                  {/* <Button onClick={() => downloadPDF(printRef)}>
                    Download PDF
                  </Button> */}
                  <Button
                    onClick={() => downloadPaginatedPDF(printRef)}
                    disabled={isExporting}
                  >
                    <div className="flex items-center gap-2">
                      {isExporting ? (
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 018 8h-4l3.5 3.5L24 12h-4a8 8 0 01-8 8v-4l-3.5 3.5L12 24v-4a8 8 0 01-8-8z"
                          ></path>
                        </svg>
                      ) : (
                        <File />
                      )}

                      <p>{isExporting ? "Generating..." : "Generate PDF"}</p>
                    </div>
                  </Button>
                  {/* <Button onClick={() => downloadPDFSimple(printRef)}>
                    <div className="flex gap-2">
                      <File></File> <p>Generate PDF</p>
                    </div>
                  </Button> */}
                </div>
              )}

              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>

      {/* Move RemarkPrDialog outside the table loop */}
      <RemarkPrDialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        action={actionType}
        onConfirm={async (remark) => {
          if (!report) return; // <-- stop if null

          // count how many items are still pending or pending_tr
          const pendingCount =
            report.item_status?.filter(
              (s: string) => s === "pending" || s === "pending_tr"
            ).length ?? 0;

          // ✅ If it's the last pending item, include the role
          const asRole: "technical_reviewer" | "hod" | "both" | undefined =
            pendingCount === 1
              ? user?.role?.includes("hod")
                ? "hod"
                : user?.role?.includes("technical_reviewer")
                ? "technical_reviewer"
                : user?.role?.includes("admin")
                ? "both"
                : undefined
              : undefined; // ✅ no role if not last pending

          await confirmItemAction(remark, asRole);

          if (onSuccess) {
            onSuccess();
          }
        }}
      />
    </Dialog>
  );
}

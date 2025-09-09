"use client";

import * as React from "react";
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
import { CheckCircle, X, MoreVertical } from "lucide-react";
import { RemarkPrDialog } from "./remarkPrDialog";
import { useViewPurchaseReport } from "../hooks/useViewPurchaseReport";
import { useRef } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
  } = useViewPurchaseReport(prId, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <div ref={printRef}>
          <DialogHeader>
            <DialogTitle>
              <p hidden>Purchase Requisition Slip</p>
            </DialogTitle>
            <DialogDescription hidden>
              View details of the purchase requisition report including items,
              quantities, and submission information.
            </DialogDescription>

            {/* Company header */}
            <div className="flex flex-col items-center mb-5">
              {/* <p className="text-4xl font-semibold tracking-widest">
                AGRI EXIM
              </p> */}
              <img src="src\assets\images\logo.png" className="h-16"></img>
              {/* <img src="src\assets\images\logo-blck.png" className="h-32"></img> */}
              {/* <p className="text-lg font-semibold tracking-wider">
                GLOBAL PHILIPPINES, INC.
              </p> */}
              <p className="text-sm font-light mt-3">
                Upper Quinokol, Brgy. Darong, Sta. Cruz, Davao Del Sur.
              </p>
            </div>

            <p className="mt-3 text-lg text-center font-semibold mb-2">
              PURCHASE REQUISITION SLIP
            </p>
          </DialogHeader>

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
                    <strong>Department:</strong> {report.user?.department || ""}
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
                      <TableHead className="border-b">Item</TableHead>
                      <TableHead className="border-b">Description</TableHead>
                      <TableHead className="border-b">Quantity</TableHead>
                      <TableHead className="border-b">Unit</TableHead>
                      <TableHead className="border-b">Tags</TableHead>
                      <TableHead className="border-b">Remarks</TableHead>
                      <TableHead className="border-b">Status</TableHead>
                      {(user?.role?.includes("hod") ||
                        user?.role?.includes("technical_reviewer") ||
                        user?.role?.includes("admin")) && (
                        <TableHead className="border-b">Action</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.item_description?.map((desc, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{desc}</TableCell>
                        <TableCell>{report.quantity?.[idx] ?? ""}</TableCell>
                        <TableCell>{report.unit?.[idx] ?? ""}</TableCell>
                        <TableCell>
                          {Array.isArray(report.tag) && report.tag[idx]
                            ? report.tag[idx]
                            : ""}
                        </TableCell>
                        <TableCell>{report.remarks?.[idx] ?? "none"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs capitalize ${
                              report.item_status?.[idx] === "approved" ||
                              report.item_status?.[idx] === "approved_tr"
                                ? "bg-green-100 text-green-800"
                                : report.item_status?.[idx] === "rejected" ||
                                  report.item_status?.[idx] === "rejected_tr"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {report.item_status?.[idx] || "pending"}
                          </span>
                        </TableCell>
                        {(user?.role?.includes("hod") ||
                          user?.role?.includes("technical_reviewer") ||
                          user?.role?.includes("admin")) && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={
                                    !(
                                      user?.role?.includes("hod") &&
                                      report.tag?.[idx]?.endsWith("_tr") &&
                                      report.item_status?.[idx] !==
                                        "approved" &&
                                      report.item_status?.[idx] !== "rejected"
                                    )
                                      ? isDropdownDisabled(idx)
                                      : false
                                  }
                                  className={
                                    !(
                                      user?.role?.includes("hod") &&
                                      report.tag?.[idx]?.endsWith("_tr")
                                    )
                                      ? isDropdownDisabled(idx)
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                      : ""
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
                                {/* Normal Approve (hidden for HOD on _tr items) */}
                                {!(
                                  user?.role?.includes("hod") &&
                                  report.tag?.[idx]?.endsWith("_tr")
                                ) && (
                                  <HoverCard openDelay={200} closeDelay={100}>
                                    <HoverCardTrigger asChild>
                                      <DropdownMenuItem
                                        disabled={
                                          isItemProcessed(idx) ||
                                          (user?.role?.includes(
                                            "technical_reviewer"
                                          ) &&
                                            !report.tag?.[idx]?.endsWith("_tr"))
                                        }
                                        onSelect={(e) => {
                                          e.preventDefault();
                                          handleItemAction(idx, "approve");
                                        }}
                                      >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve
                                      </DropdownMenuItem>
                                    </HoverCardTrigger>

                                    {/* Hover warnings */}
                                    {user?.role?.includes("hod") &&
                                      report.item_status?.filter(
                                        (s: string) => s === "pending"
                                      ).length === 1 && (
                                        <HoverCardContent
                                          side="right"
                                          align="start"
                                          className="w-64 text-sm"
                                        >
                                          Approving this final pending will{" "}
                                          <span className="font-semibold">
                                            sign the document with your
                                            signature.
                                          </span>
                                        </HoverCardContent>
                                      )}

                                    {user?.role?.includes(
                                      "technical_reviewer"
                                    ) &&
                                      report.item_status?.filter(
                                        (s: string) => s === "pending_tr"
                                      ).length === 1 && (
                                        <HoverCardContent
                                          side="right"
                                          align="start"
                                          className="w-64 text-sm"
                                        >
                                          Approving this final pending technical
                                          review will{" "}
                                          <span className="font-semibold">
                                            sign the document with your review.
                                          </span>
                                        </HoverCardContent>
                                      )}
                                  </HoverCard>
                                )}

                                {/* HOD-specific actions for _tr items */}
                                {user?.role?.includes("hod") &&
                                  report.tag?.[idx]?.endsWith("_tr") && (
                                    <>
                                      <DropdownMenuItem
                                        disabled={
                                          report.item_status?.[idx] ===
                                            "pending_tr" ||
                                          report.item_status?.[idx] ===
                                            "approved" ||
                                          report.item_status?.[idx] ===
                                            "rejected"
                                        }
                                        onSelect={(e) => {
                                          e.preventDefault();
                                          handleHodTrAction(idx); // separate function for HOD approving _tr
                                        }}
                                        className={
                                          report.item_status?.[idx] ===
                                            "pending_tr" ||
                                          report.item_status?.[idx] ===
                                            "approved"
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                        }
                                      >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve To Review
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                {/* Normal Reject */}
                                <DropdownMenuItem
                                  disabled={
                                    isItemProcessed(idx) ||
                                    (user?.role?.includes(
                                      "technical_reviewer"
                                    ) &&
                                      !report.tag?.[idx]?.endsWith("_tr"))
                                  }
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    handleItemAction(idx, "reject");
                                  }}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
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
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-row justify-between mt-6 w-full">
                  {/* <div className="flex flex-col gap-6 w-1/4">
                    <p className="flex justify-start w-full">
                      <strong>Requested by:</strong>
                    </p>
                    <p className="capitalize">{report.user?.name}</p>
                    
                    <div className="w-120 border-t border-black border-t -mt-5" />
                  </div> */}
                  <div className="flex flex-col gap-6 w-1/4">
                    <p className="flex justify-start w-full">
                      <strong>Created By:</strong>
                    </p>
                    <div className="flex flex-row">
                      <div>
                        <p className="capitalize whitespace-nowrap">
                          {report.user?.name}
                        </p>
                      </div>
                      <div className="signature-container">
                        {report.user?.signature && (
                          <img
                            src={`${API_BASE_URL}/files/signatures/${report.user?.signature.replace(
                              /^\/?storage\/signatures\//,
                              ""
                            )}`}
                            alt="User signature"
                            className="h-34 w-64 z-50 rounded -mt-24 -mb-12 items-start"
                            crossOrigin="anonymous"
                            style={{
                              maxWidth: "none",
                              maxHeight: "none",
                              objectFit: "contain",
                            }}
                            onLoad={() => console.log("User signature loaded")}
                            onError={(e) =>
                              console.error(
                                "User signature:",
                                report.tr_user_id?.signature,
                                e
                              )
                            }
                          />
                        )}
                      </div>
                    </div>
                    <div className="w-120 border-t border-black border-t -mt-5" />
                  </div>

                  <div className="flex flex-col gap-6 w-1/4">
                    <p className="flex justify-start w-full">
                      <strong>Reviewed By:</strong>
                    </p>
                    <div className="flex flex-row">
                      <div>
                        <p className="capitalize whitespace-nowrap">
                          {report.tr_user_id?.name || "n/a"}
                        </p>
                      </div>
                      <div className="signature-container">
                        {report.tr_user_id?.signature && (
                          <img
                            src={`${API_BASE_URL}/files/signatures/${report.tr_user_id?.signature.replace(
                              /^\/?storage\/signatures\//,
                              ""
                            )}`}
                            alt="Technical Reviewer signature"
                            className="h-34 w-64 z-50 rounded -mt-24 -mb-12 items-start"
                            crossOrigin="anonymous"
                            style={{
                              maxWidth: "none",
                              maxHeight: "none",
                              objectFit: "contain",
                            }}
                            onLoad={() => console.log("TR signature loaded")}
                            onError={(e) =>
                              console.error(
                                "TR signature:",
                                report.tr_user_id?.signature,
                                e
                              )
                            }
                          />
                        )}
                      </div>
                    </div>
                    <div className="w-120 border-t border-black border-t -mt-5" />
                  </div>

                  <div className="flex flex-col gap-6 w-1/4">
                    <p className="flex justify-start w-full">
                      <strong>Approved By:</strong>
                    </p>
                    <div className="flex flex-row">
                      <div>
                        <p className="capitalize whitespace-nowrap">
                          {report.hod_user_id?.name || "n/a"}
                        </p>
                      </div>
                      <div className="signature-container">
                        {report.hod_user_id?.signature && (
                          <img
                            src={`${API_BASE_URL}/files/signatures/${report.hod_user_id?.signature.replace(
                              /^\/?storage\/signatures\//,
                              ""
                            )}`}
                            alt="HOD signature"
                            className="h-34 w-64 z-50 rounded -mt-24 -mb-12 items-start"
                            crossOrigin="anonymous"
                            style={{
                              maxWidth: "none",
                              maxHeight: "none",
                              objectFit: "contain",
                            }}
                            onLoad={() => console.log("HOD signature loaded")}
                            onError={(e) =>
                              console.error(
                                "HOD signature:",
                                report.hod_user_id?.signature,
                                e
                              )
                            }
                          />
                        )}
                      </div>
                    </div>
                    <div className="w-120 border-t border-black -mt-5" />
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
                <Button onClick={() => downloadPDF(printRef)}>
                  Download PDF
                </Button>
                <Button onClick={() => downloadPDFSimple(printRef)}>
                  Download Simple
                </Button>
              </div>
            )}

            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogFooter>
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

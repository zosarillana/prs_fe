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

interface ViewPurchaseReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prId: number | null;
}

export function ViewPurchaseReportDialog({
  open,
  onOpenChange,
  prId,
}: ViewPurchaseReportDialogProps) {
  const user = useAuthStore((state) => state.user);
  const {
    report,
    loading,
    openModal,
    setOpenModal,
    actionType,
    handleItemAction,
    confirmItemAction,
  } = useViewPurchaseReport(prId, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
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
            <p className="text-4xl font-semibold tracking-widest">AGRI EXIM</p>
            <p className="text-lg font-semibold tracking-wider">
              GLOBAL PHILIPPINES, INC.
            </p>
            <p className="text-md font-light tracking-wide">
              Upper Quinokol, Brgy. Darong, Sta. Cruz, Davao Del Sur.
            </p>
          </div>

          <p className="mt-3 text-lg text-center font-semibold tracking-wider italic mb-2">
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
                    <TableHead className="border-b">Action</TableHead>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="start"
                            className="w-34 animate-in fade-in-0 zoom-in-95"
                            onCloseAutoFocus={(e) => e.preventDefault()}
                          >
                            <DropdownMenuItem
                              disabled={
                                !user?.department?.includes(
                                  report.tag?.[idx] ?? ""
                                )
                              }
                              onClick={() => handleItemAction(idx, "approve")}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              disabled={
                                !user?.department?.includes(
                                  report.tag?.[idx] ?? ""
                                )
                              }
                              onClick={() => handleItemAction(idx, "reject")}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Signature Section */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-row justify-between mt-6 w-full">
                <div className="flex flex-col gap-6 w-1/4">
                  <p className="flex justify-start w-full">
                    <strong>Requested by:</strong>
                  </p>
                  <p className="capitalize">{report.user?.name}</p>
                  <div className="w-120 border-t border-black border-t -mt-5" />
                </div>

                <div className="flex flex-col gap-6 w-1/4">
                  <p className="flex justify-start w-full">
                    <strong>Approved By:</strong>
                  </p>
                  <p className="capitalize">{user?.name ?? ""}</p>
                  <div className="w-120 border-t border-black border-t -mt-5" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>No data found.</p>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Move RemarkPrDialog outside the table loop */}
      <RemarkPrDialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        action={actionType}
        onConfirm={confirmItemAction}
      />
    </Dialog>
  );
}
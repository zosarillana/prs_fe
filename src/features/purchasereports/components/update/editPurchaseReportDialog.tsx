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
import { TableSkeletonPrInput } from "@/components/ui/skeletons/purchasereports/tableSkeletonPrInput";
import { useEditPurchaseReport } from "../../hooks/useEditPurcasheReport";
import { useUoms } from "@/features/users/hooks/useUom";
import { useTags } from "@/features/users/hooks/useTags"; // ✅ Import useTags
import { EditPurchaseReportDialogTable } from "./table/editPurchaseReportDialogTable";
import { useEditPurchaseReportDialog } from "./hooks/usePurchaseReortDialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prId: number | null;
}

export function EditPurchaseReportDialog({ open, onOpenChange, prId }: Props) {
  const { report, loading } = useEditPurchaseReport(prId, open);
  const { uoms } = useUoms();
  const { tags, loading: tagsLoading } = useTags(); // ✅ Fetch tags

  const {
    items,
    canAddRow,
    handleChange,
    handleApproveEdit,
    handleRemoveRow,
    handleAddDB,
  } = useEditPurchaseReportDialog(report, prId);

  // ✅ Define user (replace with your actual user object from context/auth)
  const user = report?.user ?? { role: [], department: [] };

  // ✅ Define bulkAction function
  const bulkAction = async (
    action: "approve" | "remove",
    indices: number[]
  ) => {
    if (!items || indices.length === 0) return;

    for (const idx of indices) {
      if (action === "approve") {
        await handleApproveEdit(idx);
      } else if (action === "remove") {
        await handleRemoveRow(idx);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit Purchase Report</DialogTitle>
          <DialogDescription>
            View and approve edits for rejected items.
          </DialogDescription>
        </DialogHeader>

        {loading || tagsLoading ? ( // ✅ Also check tagsLoading
          <TableSkeletonPrInput rows={3} />
        ) : items ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-row justify-between w-full">
              <p>
                <strong>Purpose:</strong> {items.pr_purpose}
              </p>
              <p>
                <strong>Series No:</strong> {items.series_no}
              </p>
              <p>
                <strong>Date:</strong> {items.date_submitted}
              </p>
            </div>
            <div className="flex flex-row justify-between w-full">
              <p>
                <strong>Department:</strong> {items.user?.department || ""}
              </p>
              <p>
                <strong>Date Needed:</strong> {items.date_needed}
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border shadow">
              <EditPurchaseReportDialogTable
                items={items}
                uoms={uoms}
                tags={tags} // ✅ Pass fetched tags
                user={user}
                report={report}
                bulkAction={bulkAction}
                onChange={handleChange}
                onApproveEdit={handleApproveEdit}
                onRemoveRow={handleRemoveRow}
              />
            </div>
          </div>
        ) : (
          <p>No data found.</p>
        )}

        <DialogFooter className="mt-4 flex justify-between">
          <Button onClick={handleAddDB} disabled={canAddRow}>
            Add Row
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
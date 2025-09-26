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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Edit, MoreVertical } from "lucide-react";
import { TableSkeletonPrInput } from "@/components/ui/skeletons/purchasereports/tableSkeletonPrInput";
import { useEditPurchaseReport } from "../hooks/useEditPurcasheReport";
import type { PurchaseReport, PurchaseReportInput } from "../types";
import { purchaseReportService } from "../purchaseReportService";
import { useUoms } from "@/features/users/hooks/useUom";
import { useTags } from "@/features/users/hooks/useTags";

interface EditPurchaseReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prId: number | null;
}

export function EditPurchaseReportDialog({
  open,
  onOpenChange,
  prId,
}: EditPurchaseReportDialogProps) {
  const { report, loading } = useEditPurchaseReport(prId, open);
  const { uoms, loading: uomsLoading } = useUoms(); // ✅ Global UOMs
  const { tags, loading: tagsLoading } = useTags();
  const [items, setItems] = React.useState<PurchaseReport | null>(null);

  React.useEffect(() => {
    if (report) {
      setItems({
        ...report,
        quantity: [...(report.quantity ?? [])],
        unit: [...(report.unit ?? [])],
        item_description: [...(report.item_description ?? [])],
        tag: [...(report.tag ?? [])],
      });
    }
  }, [report]);

  const handleChange = (
    index: number,
    field: "quantity" | "unit" | "item_description" | "tag",
    value: string
  ) => {
    if (!items) return;
    const updated = { ...items };
    (updated as any)[field][index] = value;
    setItems(updated);
  };

  const handleApproveEdit = async (idx: number) => {
    if (!items || !prId) return;

    const newStatus = items.item_status.map((status, i) => {
      if (i === idx) {
        return items.tag?.[i]?.endsWith("_tr") ? "pending_tr" : "pending";
      }
      return status;
    });

    const payload: PurchaseReportInput = {
      user_id: items.user.id,
      series_no: items.series_no,
      pr_purpose: items.pr_purpose,
      department: items.department,
      date_submitted: items.date_submitted,
      date_needed: items.date_needed,
      quantity: items.quantity,
      unit: items.unit,
      item_description: items.item_description,
      tag: items.tag,
      item_status: newStatus,
      remarks: items.remarks,
    };

    try {
      await purchaseReportService.update(prId, payload);
      setItems({ ...items, item_status: newStatus });
    } catch (err) {
      console.error("Approve edit failed:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Edit Purchase Report</DialogTitle>
          <DialogDescription>
            View and approve edits for rejected items.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
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
              <Table className="border-separate border-spacing-0 w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.item_description?.map((_, idx) => {
                    const status = items.item_status?.[idx] ?? "pending";
                    const isRejected =
                      status === "rejected" || status === "rejected_tr";

                    return (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>

                        {/* Editable fields if rejected */}
                        <TableCell>
                          {isRejected ? (
                            <Input
                              type="number"
                              min={1}
                              className="w-[70px]"
                              value={items.quantity?.[idx] ?? ""}
                              onChange={(e) =>
                                handleChange(idx, "quantity", e.target.value)
                              }
                            />
                          ) : (
                            items.quantity?.[idx] ?? ""
                          )}
                        </TableCell>

                        <TableCell>
                          {isRejected ? (
                            <Select
                              value={items.unit?.[idx] ?? ""}
                              onValueChange={(val) =>
                                handleChange(idx, "unit", val)
                              }
                            >
                          <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {uoms.map((uom) => (
                                  <SelectItem
                                    key={uom.id}
                                    value={uom.description}
                                  >
                                    {uom.description}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            items.unit?.[idx] ?? ""
                          )}
                        </TableCell>

                        <TableCell>
                          {isRejected ? (
                            <Input
                              placeholder="Enter description"
                              value={items.item_description?.[idx] ?? ""}
                              onChange={(e) =>
                                handleChange(
                                  idx,
                                  "item_description",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            items.item_description?.[idx] ?? ""
                          )}
                        </TableCell>

                        <TableCell>
                          {isRejected ? (
                            <Select
                              value={items.tag?.[idx]?.toString() ?? ""} // ✅ ensure it's a string
                              onValueChange={(val) =>
                                handleChange(idx, "tag", val)
                              }
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Select tag" />
                              </SelectTrigger>
                              <SelectContent>
                                {tags.map((tag) => (
                                  <SelectItem
                                    key={tag.id}
                                    value={String(tag.id)}
                                  >
                                    {tag.description}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            items.tag?.[idx] ?? ""
                          )}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs capitalize ${
                              status === "approved" || status === "approved_tr"
                                ? "bg-green-100 text-green-800"
                                : isRejected
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {status}
                          </span>
                        </TableCell>

                        <TableCell>{items.remarks?.[idx] ?? "none"}</TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="w-34"
                              onCloseAutoFocus={(e) => e.preventDefault()}
                            >
                              <HoverCard openDelay={200} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                  <DropdownMenuItem
                                    disabled={!isRejected}
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      if (!isRejected) return;
                                      handleApproveEdit(idx);
                                    }}
                                    className={
                                      !isRejected
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Approve Edit
                                  </DropdownMenuItem>
                                </HoverCardTrigger>
                                <HoverCardContent
                                  side="right"
                                  align="start"
                                  className="w-64 text-sm"
                                >
                                  Approve this item’s changes and move it back
                                  to pending status.
                                </HoverCardContent>
                              </HoverCard>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
    </Dialog>
  );
}

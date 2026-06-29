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
  FileDigitIcon,
  Calendar,
} from "lucide-react";
import type { User } from "@/types/users";
import type { PurchaseReport } from "@/features/purchasereports/types";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { purchaseReportService } from "@/features/purchasereports/purchaseReportService";

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
  onApprovePoClick?: (itemIndex: number) => void;
  onBulkApprovePoClick?: (itemIndices: number[]) => void; // ✅ Add this
  onReportUpdate?: (updatedReport: PurchaseReport) => void;
}

export function SetMultiplePurchaseReportTable({
  report,
  user,
  isExporting = false,
  selectedItems,
  allSelected,
  isIndeterminate,
  onToggleItem,
  onToggleAll,
  onBulkAction,
  canSelectItem,
  onReportUpdate,
  onApprovePoClick,
  onBulkApprovePoClick,
}: PurchaseReportItemsTableProps) {
  const [poInputValues, setPoInputValues] = useState<Map<number, string>>(
    new Map(),
  );
  const [isCreatingPo, setIsCreatingPo] = useState<Set<number>>(new Set());
  const [isCreatingBulk, setIsCreatingBulk] = useState(false);
  const [isApprovingBulk, setIsApprovingBulk] = useState(false);

  const truncate = (text: string | undefined, length = 40) => {
    if (!text) return "none";
    return text.length > length ? text.slice(0, length) + "…" : text;
  };

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
        report.user?.id !== user?.id &&
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

  const showActionColumn =
    (user?.role?.includes("purchasing") || user?.role?.includes("admin")) &&
    !isExporting;

  const itemPoMap = React.useMemo(() => {
    return new Map((report.item_pos ?? []).map((po) => [po.item_index, po]));
  }, [report.item_pos]);

  const handlePoInputChange = (idx: number, value: string) => {
    setPoInputValues((prev) => {
      const newMap = new Map(prev);
      newMap.set(idx, value);
      return newMap;
    });
  };

  // ✅ Bulk creation handler
  const handleCreatePoForSelected = async () => {
    if (!selectedItems.length) return;

    setIsCreatingBulk(true);
    try {
      for (const idx of selectedItems) {
        await handleCreatePo(idx); // this function is already defined inside the component
      }
    } finally {
      setIsCreatingBulk(false);
    }
  };

  // ✅ FIXED: Changed 'index' to 'item_index' to match backend expectations
  const handleCreatePo = async (idx: number) => {
    const itemPo = itemPoMap.get(idx);
    const poNumber = poInputValues.get(idx)?.trim();

    if (!poNumber) {
      alert("Please enter a PO number before creating.");
      return;
    }

    if (itemPo?.po_number) {
      alert("PO number already exists for this item.");
      return;
    }

    try {
      setIsCreatingPo((prev) => new Set(prev).add(idx));

      // ✅ FIXED: Using 'item_index' instead of 'index'
      const updatedReport = await purchaseReportService.updatePerItemPoNo(
        report.id,
        {
          item_index: idx, // Changed from 'index' to 'item_index'
          po_no: poNumber,
        },
      );

      setPoInputValues((prev) => {
        const newMap = new Map(prev);
        newMap.delete(idx);
        return newMap;
      });

      if (onReportUpdate && updatedReport) {
        onReportUpdate(updatedReport);
      }

      alert("PO number created successfully!");
    } catch (error: any) {
      console.error("Failed to create PO:", error);

      // Better error handling
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create PO number. Please try again.";
      alert(errorMessage);
    } finally {
      setIsCreatingPo((prev) => {
        const newSet = new Set(prev);
        newSet.delete(idx);
        return newSet;
      });
    }
  };

  // Updated: Row is selectable unless both po_number and po_approved_at exist
  const isRowSelectable = (idx: number) => {
    const po = itemPoMap.get(idx);
    if (!po) return true; // no PO info → selectable
    return !(po.po_number && po.po_approved_at); // not selectable if both exist
  };

  // Get all selectable row indices
  const selectableRows =
    report.item_description
      ?.map((_, idx) => idx)
      .filter((idx) => isRowSelectable(idx)) ?? [];

  // Are all selectable rows currently selected?
  const allSelectableSelected =
    selectableRows.length > 0 &&
    selectableRows.every((idx) => selectedItems.includes(idx));

  // Are some but not all selectable rows selected?
  const someSelectableSelected =
    selectableRows.some((idx) => selectedItems.includes(idx)) &&
    !allSelectableSelected;

  // ✅ Add bulk approve handler
  const handleApprovePoForSelected = async () => {
    if (!selectedItems.length || !onApprovePoClick) return;

    setIsApprovingBulk(true);
    try {
      for (const idx of selectedItems) {
        await onApprovePoClick(idx); // This will open dialog for each
      }
    } finally {
      setIsApprovingBulk(false);
    }
  };
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
                      allSelectableSelected
                        ? true
                        : someSelectableSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) => {
                      selectableRows.forEach((idx) =>
                        onToggleItem(idx, checked === true),
                      );
                    }}
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="mt-2 rounded hover:bg-muted transition"
                        disabled={
                          isDropdownTriggerDisabled() ||
                          selectedItems.length === 0
                        }
                      >
                        <ArrowDownRight className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="start"
                      className="w-40 animate-in fade-in-0 zoom-in-95"
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      <DropdownMenuItem
                        onClick={() => handleCreatePoForSelected()}
                        disabled={
                          selectedItems.length === 0 ||
                          isDropdownTriggerDisabled()
                        }
                        className="cursor-pointer"
                      >
                        <FileDigitIcon className="mr-2 h-4 w-4" />
                        <span>
                          {isCreatingBulk ? "Creating..." : "Create PO Number"}
                        </span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          if (
                            onBulkApprovePoClick &&
                            selectedItems.length > 0
                          ) {
                            onBulkApprovePoClick(selectedItems); // ✅ Use bulk handler
                          }
                        }}
                        disabled={selectedItems.every((idx) => {
                          const itemPo = itemPoMap.get(idx);
                          return (
                            !itemPo?.po_number ||
                            itemPo?.status === "approved" ||
                            !onBulkApprovePoClick
                          );
                        })}
                        className="cursor-pointer"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>
                          {selectedItems.length > 1
                            ? `Approve ${selectedItems.length} Items`
                            : "Date Approve"}
                        </span>
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
            <TableHead className="border-b">PO #</TableHead>
            <TableHead className="border-b">PO Status</TableHead>
            <TableHead className="border-b">PO Create Date</TableHead>
            <TableHead className="border-b">PO Approve Date</TableHead>

            {showActionColumn && (
              <TableHead className="border-b">Action</TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {report.item_description?.map((desc, idx) => {
            const itemPo = itemPoMap.get(idx);
            const currentPoInput = poInputValues.get(idx) ?? "";
            const isCreating = isCreatingPo.has(idx);

            return (
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
                      disabled={!isRowSelectable(idx)} // <-- match your selectableRows logic
                      onCheckedChange={(checked) => {
                        if (!isRowSelectable(idx)) return;
                        onToggleItem(idx, !!checked);
                      }}
                    />
                  </TableCell>
                )}

                <TableCell className="font-semibold">
                  <div className="flex items-center gap-1"># {idx + 1}</div>
                </TableCell>

                <TableCell className="w-72">{desc}</TableCell>
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

                <TableCell>
                  <Input
                    className="w-32"
                    placeholder="Enter PO #"
                    value={itemPo?.po_number ?? currentPoInput}
                    onChange={(e) => handlePoInputChange(idx, e.target.value)}
                    disabled={
                      itemPo?.status === "approved" || !!itemPo?.po_number
                    }
                  />
                </TableCell>

                <TableCell className="font-bold text-xs capitalize">
                  {itemPo?.status || "—"}
                </TableCell>
                <TableCell>
                  {itemPo?.po_created_at
                    ? new Date(itemPo.po_created_at).toISOString().split("T")[0]
                    : "—"}
                </TableCell>
                <TableCell>
                  {itemPo?.po_approved_at
                    ? new Date(itemPo.po_approved_at)
                        .toISOString()
                        .split("T")[0]
                    : "—"}
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
                        <DropdownMenuItem
                          onClick={() => handleCreatePo(idx)}
                          disabled={
                            !!itemPo?.po_number ||
                            !currentPoInput.trim() ||
                            isCreating
                          }
                          className="cursor-pointer"
                        >
                          <FileDigitIcon className="mr-2 h-4 w-4" />
                          <span>
                            {isCreating ? "Creating..." : "Create PO Number"}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (onApprovePoClick && itemPo?.id) {
                              onApprovePoClick(idx);
                            }
                          }}
                          disabled={
                            !itemPo?.po_number || // no PO yet
                            itemPo?.status === "approved" || // already approved
                            !onApprovePoClick
                          }
                          className="cursor-pointer"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Date Approve</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

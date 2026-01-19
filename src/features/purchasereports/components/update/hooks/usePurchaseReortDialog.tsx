"use client";

import { useEffect, useMemo, useState } from "react";
import { purchaseReportService } from "@/features/purchasereports/purchaseReportService";
import type { PurchaseReport } from "@/features/purchasereports/types";
import { useTags } from "@/features/users/hooks/useTags";

export function useEditPurchaseReportDialog(
  report: PurchaseReport | null,
  prId: number | null
) {
  const { tags } = useTags();
  const [items, setItems] = useState<PurchaseReport | null>(null);

  useEffect(() => {
    if (!report) return;

    setItems({
      ...report,
      quantity: [...(report.quantity ?? [])],
      unit: [...(report.unit ?? [])],
      item_description: [...(report.item_description ?? [])],
      tag: [...(report.tag ?? [])],
    });
  }, [report]);

  const canAddRow = useMemo(() => {
    if (!items?.item_status) return true;
    return !items.item_status.some((s) => s === "return" || s === "returned");
  }, [items]);

  const handleChange = (
    index: number,
    field: "quantity" | "unit" | "item_description" | "tag",
    value: string
  ) => {
    if (!items) return;
    const updated = { ...items };

    if (field === "tag") {
      const tagObj = tags.find((t) => String(t.id) === value);
      if (tagObj) updated.tag[index] = tagObj;
    } else {
      (updated as any)[field][index] = value;
    }

    setItems(updated);
  };

  // ✅ Single item approve
  const handleApproveEdit = async (idx: number) => {
    if (!prId || !items) return;

    const response = await purchaseReportService.approveEdit(prId, idx, {
      quantity: items.quantity[idx],
      unit: items.unit[idx],
      item_description: items.item_description[idx],
      tag: items.tag[idx],
      remarks: items.remarks[idx],
    });

    setItems(response.data); // ✅ pick only the PurchaseReport data
  };

  // ✅ Single item remove
  const handleRemoveRow = async (idx: number) => {
    if (!prId) return;
    const updated = await purchaseReportService.removeRow(prId, idx);
    setItems({ ...updated });
  };

  // ✅ Add new row
  const handleAddDB = async () => {
    if (!prId) return;
    const updated = await purchaseReportService.addItem(prId);
    setItems({ ...updated });
  };

  // ----------------------
  // ✅ Bulk operations
  // ----------------------

  const handleBulkRemove = async (indices: number[]) => {
    if (!prId || !indices.length) return;
    const updated = await purchaseReportService.removeRows(prId, indices);
    setItems({ ...updated });
  };

  const handleBulkApprove = async (
    itemsData: Array<{
      index: number;
      quantity?: string | number;
      unit?: string;
      item_description?: string;
      tag?: any;
      remarks?: string;
    }>
  ) => {
    if (!prId || !itemsData.length) return;
    const updated = await purchaseReportService.approveEdits(prId, itemsData);
    setItems({ ...updated });
  };

  return {
    items,
    canAddRow,
    handleChange,
    handleApproveEdit,
    handleRemoveRow,
    handleAddDB,
    handleBulkRemove,
    handleBulkApprove,
  };
}

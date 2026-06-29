import { PurchaseReport, PurchaseReportCleanItem } from "@/features/purchasereports/types";
import { Tag } from "@/features/tags/types";

// ✅ Type guard to check if report is clean type
export function isCleanReport(
  report: PurchaseReport | PurchaseReportCleanItem | null
): report is PurchaseReportCleanItem {
  return report !== null && "items" in report;
}

// ✅ Unified interface for accessing report data
export interface UnifiedReportAccess {
  getItemStatus: (idx: number) => string | undefined;
  getTag: (idx: number) => Tag | undefined;
  getRemark: (idx: number) => string | undefined;
  getItemDescription: (idx: number) => string | undefined;
  getItemCount: () => number;
  getAllItemStatuses: () => string[];
  getAllTags: () => Tag[];
  getAllRemarks: () => string[];
}

// ✅ Create unified accessor for any report type
export function createReportAccessor(
  report: PurchaseReport | PurchaseReportCleanItem | null
): UnifiedReportAccess {
  if (!report) {
    return {
      getItemStatus: () => undefined,
      getTag: () => undefined,
      getRemark: () => undefined,
      getItemDescription: () => undefined,
      getItemCount: () => 0,
      getAllItemStatuses: () => [],
      getAllTags: () => [],
      getAllRemarks: () => [],
    };
  }

  if (isCleanReport(report)) {
    // Clean report accessor
    return {
      getItemStatus: (idx) => report.items[idx]?.status,
      getTag: (idx) => report.items[idx]?.tag as unknown as Tag,
      getRemark: (idx) => report.items[idx]?.remarks ?? "",
      getItemDescription: (idx) => report.items[idx]?.description,
      getItemCount: () => report.items.length,
      getAllItemStatuses: () => report.items.map((item) => item.status),
      getAllTags: () => report.items.map((item) => item.tag as unknown as Tag),
      getAllRemarks: () => report.items.map((item) => item.remarks ?? ""),
    };
  } else {
    // Regular report accessor
    return {
      getItemStatus: (idx) => report.item_status?.[idx],
      getTag: (idx) => report.tag?.[idx],
      getRemark: (idx) => report.remarks?.[idx] ?? "",
      getItemDescription: (idx) => report.item_description?.[idx],
      getItemCount: () => report.item_status?.length ?? 0,
      getAllItemStatuses: () => report.item_status ?? [],
      getAllTags: () => report.tag ?? [],
      getAllRemarks: () => report.remarks ?? [],
    };
  }
}

// ✅ Helper to get item status safely
export function getItemStatus(
  report: PurchaseReport | PurchaseReportCleanItem | null,
  idx: number
): string | undefined {
  return createReportAccessor(report).getItemStatus(idx);
}

// ✅ Helper to get tag safely
export function getItemTag(
  report: PurchaseReport | PurchaseReportCleanItem | null,
  idx: number
): Tag | undefined {
  return createReportAccessor(report).getTag(idx);
}

// ✅ Helper to get all item statuses
export function getAllItemStatuses(
  report: PurchaseReport | PurchaseReportCleanItem | null
): string[] {
  return createReportAccessor(report).getAllItemStatuses();
}
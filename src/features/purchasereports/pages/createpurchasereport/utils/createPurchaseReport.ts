// utils/purchaseReport.ts
import { toast } from "sonner";

/**
 * Initialize report data from copy or draft
 */
export function initializeReportData({
  copyFromData,
  editDraft,
  draftData,
  user,
  setReportData,
  setItems,
  setRows,
}: {
  copyFromData?: any;
  editDraft?: boolean;
  draftData?: any;
  user?: any;
  setReportData: Function;
  setItems: Function;
  setRows: Function;
}) {
  if (copyFromData) {
    const dateSubmitted = copyFromData.date_submitted
      ? new Date(copyFromData.date_submitted + "T00:00:00")
      : undefined;

    const dateNeeded = copyFromData.date_needed
      ? new Date(copyFromData.date_needed + "T00:00:00")
      : undefined;

    setReportData({
      purpose: copyFromData.pr_purpose,
      department: user?.department?.[0] ?? copyFromData.department,
      date_submitted: dateSubmitted,
      date_needed: dateNeeded,
      amount: copyFromData.quantity.length,
      series_no: copyFromData.series_no ?? "",
      user_id: user?.id ?? copyFromData.user.id,
    });

    const copiedItems = copyFromData.quantity.map(
      (_: any, index: number) => ({
        quantity: copyFromData.quantity[index]?.toString() || "",
        unit: copyFromData.unit[index] || "",
        description: copyFromData.item_description[index] || "",
        tag:
          typeof copyFromData.tag[index] === "object"
            ? copyFromData.tag[index]?.id?.toString() || ""
            : copyFromData.tag[index]?.toString() || "",
        remarks: copyFromData.remarks[index] || "",
      })
    );

    setItems(copiedItems);
    setRows(copiedItems.length);

    toast.info(`Copied to new request (Series #${copyFromData.series_no})`);
    window.history.replaceState({}, document.title);

  } else if (editDraft && draftData) {
    const dateSubmitted = draftData.date_submitted
      ? new Date(draftData.date_submitted + "T00:00:00")
      : undefined;

    const dateNeeded = draftData.date_needed
      ? new Date(draftData.date_needed + "T00:00:00")
      : undefined;

    setReportData({
      user_id: user?.id ?? draftData.user.id,
      series_no: draftData.series_no,
      purpose: draftData.pr_purpose,
      department: user?.department?.[0] ?? draftData.department,
      date_submitted: dateSubmitted,
      date_needed: dateNeeded,
      amount: draftData.quantity.length,
    });

    const items = draftData.item_description.map((desc: string, i: number) => ({
      quantity: draftData.quantity[i]?.toString() || "",
      unit: draftData.unit[i] || "",
      description: desc || "",
      tag:
        typeof draftData.tag[i] === "object"
          ? draftData.tag[i].id?.toString() || ""
          : draftData.tag[i]?.toString() || "",
      remarks: draftData.remarks[i] || "",
    }));

    setItems(items);
    setRows(items.length);

    toast.info(`Loaded draft: ${draftData.series_no}`);
    window.history.replaceState({}, document.title);
  }
}

/**
 * Add a blank row
 */
export function addBlankRow(setItems: Function, setRows: Function) {
  setItems((prev: any[]) => [
    ...prev,
    { quantity: "", unit: "", description: "", tag: "", remarks: "" },
  ]);
  setRows((r: number) => r + 1);
}

/**
 * Remove a row by index
 */
export function removeRowByIndex(index: number, setItems: Function, setRows: Function) {
  setItems((prev: any[]) => prev.filter((_, i) => i !== index));
  setRows((r: number) => (r > 0 ? r - 1 : 0));
}

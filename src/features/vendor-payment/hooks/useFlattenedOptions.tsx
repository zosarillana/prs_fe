import { useMemo } from "react";

export function useFlattenedPoOptions(purchaseReports: any[]) {
  const allPoOptions = useMemo(() => {
    return purchaseReports.flatMap((pr: any) => {
      const approvedItemPos = pr.item_pos?.filter(
        (item: any) => item.status === "approved"
      ) || [];

      // If root PR is approved, use all PO numbers
      if (pr.po_status === "approved") {
        return pr.po_no
          .split(" ")
          .filter(Boolean)
          .map((po: string) => ({
            po,
            prId: pr.id,
            seriesNo: pr.series_no,
            fullPr: pr,
          }));
      }
  
      // Otherwise, include only individual approved POs from item_pos
      if (approvedItemPos.length > 0) {
        return approvedItemPos.map((item: any) => ({
          po: item.po_number,
          prId: pr.id,
          seriesNo: pr.series_no,
          fullPr: pr,
        }));
      }

      // Nothing approved, skip this PR
      return [];
    });
  }, [purchaseReports]);

  return allPoOptions;
}

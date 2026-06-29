import { useMemo } from "react";

export function useFlattenedPoOptions(purchaseReports: any[]) {
  const allPoOptions = useMemo(() => {
    return purchaseReports.flatMap((pr: any) => {
      const approvedItemPos = pr.item_pos?.filter(
        (item: any) => item.status === "approved"
      ) || [];

      if (pr.po_status === "approved") {
        // 🔍 LOG: catch what's null
        if (!pr.po_no) {
          // console.warn("⚠️ Skipping PR with approved status but null po_no:", {
          //   id: pr.id,
          //   series_no: pr.series_no,
          //   po_status: pr.po_status,
          //   po_no: pr.po_no,
          // });
          return [];
        }

        // console.log("✅ PR with approved po_no:", {
        //   id: pr.id,
        //   po_no: pr.po_no,
        //   series_no: pr.series_no,
        // });

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

      if (approvedItemPos.length > 0) {
        // console.log("✅ PR with approved item_pos:", {
        //   id: pr.id,
        //   series_no: pr.series_no,
        //   approvedCount: approvedItemPos.length,
        // });

        return approvedItemPos.map((item: any) => {
          // 🔍 LOG: catch null po_number inside item_pos too
          if (!item.po_number) {
            // console.warn("⚠️ Skipping approved item_pos with null po_number:", {
            //   prId: pr.id,
            //   series_no: pr.series_no,
            //   item,
            // });
            return null;
          }

          return {
            po: item.po_number,
            prId: pr.id,
            seriesNo: pr.series_no,
            fullPr: pr,
          };
        }).filter(Boolean);
      }

      return [];
    });
  }, [purchaseReports]);

  // console.log("📦 useFlattenedPoOptions result count:", allPoOptions.length);

  return allPoOptions;
}
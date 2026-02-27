import { useQuery } from "@tanstack/react-query";
import { purchaseReportService } from "@/features/purchasereports/purchaseReportService";

export function usePurchaseReportOptions() {
  return useQuery({
    queryKey: ["purchaseReportOptions"],
    queryFn: async () => {
      const res = await purchaseReportService.getTable({
        pageNumber: 1,
        pageSize: 1000,
      });

      return res.items; // adjust to your paginator
    },
    staleTime: 1000 * 60 * 10,
  });
}

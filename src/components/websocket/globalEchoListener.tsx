// components/websocket/globalEchoListener.tsx
import { useEffect } from "react";
import { echo } from "@/lib/echo";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function GlobalEchoListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = echo.channel("purchase-report");

    channel.listen(".PurchaseReportCreated", (event: any) => {
      toast.success(`New report: ${event.series_no}`);

      // ✅ tell React Query to refetch the summary
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    });

    return () => {
      channel.stopListening(".PurchaseReportCreated");
    };
  }, [queryClient]);

  return null;
}

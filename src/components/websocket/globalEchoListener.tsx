// components/websocket/globalEchoListener.tsx
import { useEffect } from "react";
import { echo } from "@/lib/echo";
import { toast } from "sonner";

export function GlobalEchoListener() {
  useEffect(() => {
    const channel = echo.channel("purchase-report");

    channel.listen(".PurchaseReportCreated", (event: any) => {
      toast.success(`New report: ${event.series_no}`);
    });

    return () => {
      channel.stopListening(".PurchaseReportCreated");
    };
  }, []);

  return null;
}

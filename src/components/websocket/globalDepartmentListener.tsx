import { useEffect } from "react";
import { echo } from "@/lib/echo";
import { useQueryClient } from "@tanstack/react-query";

export function GlobalDepartmentListener({ refreshDepartments }: { refreshDepartments: () => void }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Setting up global department listener");

    const globalChannel = echo.channel("purchase-report-global");

    const handleDepartmentEvent = (event: any) => {
      console.log("Global department event received:", event);

      if (event.type === "global_notification") {
        // Refresh your department table
        refreshDepartments();

        // Optionally refresh other global queries
        queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
        queryClient.invalidateQueries({ queryKey: ["systemStats"] });
        queryClient.invalidateQueries({ queryKey: ["globalCounters"] });
      }
    };

    globalChannel.listen(".GlobalDepartmentCreated", handleDepartmentEvent);

    return () => {
      console.log("Cleaning up global department listener");
      globalChannel.stopListening(".GlobalDepartmentCreated");
    };
  }, [queryClient, refreshDepartments]);

  return null;
}

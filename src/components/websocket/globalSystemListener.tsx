import { useEffect, useRef } from "react";
import { echo } from "@/lib/echo";
import { useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notification/notificationStore";

export function GlobalSystemListener() {
  const queryClient = useQueryClient();
  const { fetchNotifications, fetchCounts } = useNotificationStore();

  // 🔔 prepare bell sound
  const bellSound = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const sound = new Audio("/bell.mp3");
    sound.preload = "auto";
    sound.volume = 0.7;
    bellSound.current = sound;

    const prime = () => {
      sound.play().catch(() => {});
      sound.pause();
      sound.currentTime = 0;
      document.removeEventListener("click", prime);
    };
    document.addEventListener("click", prime);
    return () => document.removeEventListener("click", prime);
  }, []);

  useEffect(() => {
    console.log("Setting up silent global system listener");

    // ✅ Existing global channel for PR creation
    const globalChannel = echo.channel("purchase-report-global");

    // ✅ New global channel for approvals
    const approvalChannel = echo.channel("purchase-report-approval-global");

    const handleGlobalEvent = async (event: any) => {
      console.log("Global system event received (silent update):", event);

      // Play bell only for notifications intended for users
      if (
        event.type === "global_notification" ||
        event.type === "global_approval_notification"
      ) {
        bellSound.current?.play().catch(() => {});
      }

      // 1. Invalidate & refetch dashboard summary immediately
      await queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      await queryClient.refetchQueries({ queryKey: ["dashboardSummary"] });

      // 2. Update notification counts
      fetchCounts();

      // 3. Refresh notifications if relevant
      if (
        event.type === "global_notification" ||
        event.type === "global_approval_notification" ||
        event.affects_all_users
      ) {
        fetchNotifications();
      }

      // 4. Update other global queries
      queryClient.invalidateQueries({ queryKey: ["systemStats"] });
      queryClient.invalidateQueries({ queryKey: ["activityFeed"] });
      queryClient.invalidateQueries({ queryKey: ["globalCounters"] });

      // 5. Purchase report lists
      queryClient.invalidateQueries({ queryKey: ["purchaseReports"] });
      queryClient.invalidateQueries({ queryKey: ["recentReports"] });
    };

    // 🔹 Listen to PR creation
    globalChannel.listen(".GlobalPurchaseReportCreated", handleGlobalEvent);

    // 🔹 Listen to approval-related updates
    approvalChannel.listen(
      ".GlobalPurchaseReportApprovalUpdated",
      handleGlobalEvent
    );

    return () => {
      console.log("Cleaning up silent global system listener");
      globalChannel.stopListening(".GlobalPurchaseReportCreated");
      approvalChannel.stopListening(".GlobalPurchaseReportApprovalUpdated");
    };
  }, [queryClient, fetchNotifications, fetchCounts]);

  return null;
}

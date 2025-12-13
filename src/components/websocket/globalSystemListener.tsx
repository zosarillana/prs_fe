import { useEffect, useRef } from "react";
import { echo } from "@/lib/echo";
import { useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notification/notificationStore";
import bellSoundFile from "@/assets/bell.mp3"; // ✅ imported sound asset

export function GlobalSystemListener() {
  const queryClient = useQueryClient();
  const { fetchNotifications, fetchCounts } = useNotificationStore();

  // 🔔 Prepare bell sound
  const bellSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const sound = new Audio(bellSoundFile); // ✅ use imported URL
    sound.preload = "auto";
    sound.volume = 0.7;
    bellSound.current = sound;

    const prime = () => {
      sound.play().catch(() => {});
      sound.pause();
      sound.currentTime = 0;
      ["click", "keydown", "touchstart"].forEach((evt) =>
        document.removeEventListener(evt, prime)
      );
    };

    ["click", "keydown", "touchstart"].forEach((evt) =>
      document.addEventListener(evt, prime)
    );

    return () => {
      ["click", "keydown", "touchstart"].forEach((evt) =>
        document.removeEventListener(evt, prime)
      );
    };
  }, []);

  useEffect(() => {
    console.log("Setting up silent global system listener");

    // ✅ Global channels
    const globalChannel = echo.channel("purchase-report-global");
    const approvalChannel = echo.channel("purchase-report-approval-global");

    const handleGlobalEvent = async (event: any) => {
      console.log("Global system event received (silent update):", event);

      // 🔔 Play bell for user notifications
      if (
        event.type === "global_notification" ||
        event.type === "global_approval_notification"
      ) {
        bellSound.current?.play().catch((err) => {
          console.warn("Bell sound playback blocked:", err);
        });
      }

      // 1. Refresh dashboard data
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

      // 4. Invalidate other relevant queries
      queryClient.invalidateQueries({ queryKey: ["systemStats"] });
      queryClient.invalidateQueries({ queryKey: ["activityFeed"] });
      queryClient.invalidateQueries({ queryKey: ["globalCounters"] });

      // 5. Refresh purchase report lists
      queryClient.invalidateQueries({ queryKey: ["purchaseReports"] });
      queryClient.invalidateQueries({ queryKey: ["recentReports"] });
    };

    // 🔹 Listen to broadcasted events
    globalChannel.listen(".GlobalPurchaseReportCreated", handleGlobalEvent);
    approvalChannel.listen(".GlobalPurchaseReportApprovalUpdated", handleGlobalEvent);

    return () => {
      console.log("Cleaning up silent global system listener");
      globalChannel.stopListening(".GlobalPurchaseReportCreated");
      approvalChannel.stopListening(".GlobalPurchaseReportApprovalUpdated");
    };
  }, [queryClient, fetchNotifications, fetchCounts]);

  return null;
}

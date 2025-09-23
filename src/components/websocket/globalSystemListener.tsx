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
    const sound = new Audio("/bell.mp3"); // place bell.mp3 in /public
    sound.preload = "auto";
    sound.volume = 0.7;
    bellSound.current = sound;

    // 👇 prime audio on first user interaction (for iOS/Chrome autoplay)
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

    const globalChannel = echo.channel("purchase-report-global");

    const handleGlobalEvent = (event: any) => {
      console.log("Global system event received (silent update):", event);

      // ✅ Play sound ONLY if this is a real notification event
      if (event.type === "global_notification") {
        bellSound.current?.play().catch(() => {
          // ignore autoplay restriction errors
        });
      }

      // 1. Update dashboard summary data
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });

      // 2. Update notification counts
      fetchCounts();

      // 3. Refresh notifications only if this event could affect the user
      if (event.type === "global_notification" || event.affects_all_users) {
        fetchNotifications();
      }

      // 4. Update other global queries that might be affected
      queryClient.invalidateQueries({ queryKey: ["systemStats"] });
      queryClient.invalidateQueries({ queryKey: ["activityFeed"] });
      queryClient.invalidateQueries({ queryKey: ["globalCounters"] });

      // 5. Purchase report lists that should be updated
      queryClient.invalidateQueries({ queryKey: ["purchaseReports"] });
      queryClient.invalidateQueries({ queryKey: ["recentReports"] });
    };

    globalChannel.listen(".GlobalPurchaseReportCreated", handleGlobalEvent);

    return () => {
      console.log("Cleaning up silent global system listener");
      globalChannel.stopListening(".GlobalPurchaseReportCreated");
    };
  }, [queryClient, fetchNotifications, fetchCounts]);

  
  return null;
}

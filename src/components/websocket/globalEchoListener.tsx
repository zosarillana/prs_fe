import { useEffect } from "react";
import { echo } from "@/lib/echo";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth/authStore";
import { useNotificationStore } from "@/store/notification/notificationStore";

export function GlobalEchoListener() {
  const { user } = useAuthStore();
  const { addNotification, fetchCounts } = useNotificationStore();

  useEffect(() => {
    if (!user) return;

    console.log("Setting up notification channels for user:", user);

    let channels: any[] = [];

    // User-specific channel
    const userChannel = echo.channel(`purchase-report-user-${user.id}`);
    channels.push(userChannel);

    // Admin channel
    if (user.role.includes("admin")) {
      const adminChannel = echo.channel("purchase-report-admin");
      channels.push(adminChannel);
    }

    // HOD channels
    if (user.role.includes("hod")) {
      user.department.forEach((dept: string) => {
        const deptChannel = echo.channel(`purchase-report-dept-${dept}`);
        channels.push(deptChannel);
      });
    }

    const handleEvent = (event: any) => {
      console.log("Notification event received:", event);

      // Show toast for new report
      toast.success(`New report: ${event.series_no}`);

      // Backend event signals a new notification
      if (event.type === "notification_created") {
        addNotification({
          id: event.id,
          type: event.type,
          notifiable_type: event.notifiable_type,
          notifiable_id: event.notifiable_id,
          data: event.data,
          read_at: null,
          created_at: event.created_at,
          updated_at: event.updated_at,
        });

        // Update unread counts
        fetchCounts();
      }

      // Optional: if backend pushes full updated list
      if (event.type === "notifications_updated") {
        fetchCounts();
      }
    };

    channels.forEach(channel => {
      channel.listen(".PurchaseReportCreated", handleEvent);
    });

    return () => {
      channels.forEach(channel => {
        channel.stopListening(".PurchaseReportCreated");
      });
    };
  }, [user, addNotification, fetchCounts]);

  return null;
}

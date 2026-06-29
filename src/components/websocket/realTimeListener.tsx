import { useEffect, useRef } from "react";
import { echo } from "@/lib/echo";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth/authStore";
import { useNotificationStore } from "@/store/notification/notificationStore";
import bellSoundFile from "@/assets/bell.mp3";

// ---- Type Definitions ----
type PrStatus =
  | "for_approval"
  | "on_hold_tr"
  | "closed"
  | "on_hold"
  | "returned"
  | "rejected";

interface PurchaseReportEvent {
  pr_status?: PrStatus;
  department?: string;
  series_no?: string | number;
  id?: string | number;
  type?: string;
  name?: string;
  old_pr_status?: string;
  po_status?: string;
  po_no?: string;
  created_by?: string;
  user_id?: string | number;
  created_at?: string;
  event?: string;
  notifiable_type?: string;
  notifiable_id?: string | number;
  data?: any;
  read_at?: string | null;
  updated_at?: string;
}

interface PurchaseReportsCache {
  items: any[];
  totalItems?: number;
}

interface DashboardSummaryCache {
  [key: string]: number | undefined;
  total_prs?: number;
}

export function RealtimeListener() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { addNotification, fetchCounts } = useNotificationStore();
  const bellSound = useRef<HTMLAudioElement | null>(null);

  // ---- Bell Sound Setup ----
  useEffect(() => {
    const sound = new Audio(bellSoundFile);
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

  // ---- Helper Functions ----
  function normalize(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]/gi, "_");
  }

  const isEventRelevant = (event: PurchaseReportEvent): boolean => {
    if (!user) return false;

    // Admins see everything
    if (user.role?.includes("admin")) return true;

    // Department match (normalize/slugify)
    if (event.department && Array.isArray(user.department)) {
      if (
        user.department.map(normalize).includes(normalize(event.department))
      ) {
        return true;
      }
    }

    // Role-based check (optional)
    const statusRoles: Record<PrStatus, string[]> = {
      for_approval: ["admin", "purchasing", "hod"],
      on_hold_tr: ["admin", "technical_reviewer", "hod"],
      closed: ["admin", "purchasing", "user"],
      on_hold: ["admin", "hod", "user"],
      returned: ["admin", "hod", "user"],
      rejected: ["admin", "hod", "user"],
    };
    const prStatus = event.pr_status as PrStatus;
    const relevantRoles = statusRoles[prStatus] || ["admin"];
    return relevantRoles.some((role) => user.role?.includes(role));
  };

  const updateCaches = (event: PurchaseReportEvent): void => {
    const isPurchaseReportEvent = !!(event.series_no && event.id);
    const isDepartmentEvent = !!(event.name && !event.series_no && event.id);

    // ✅ FIXED: Detect new PR vs approval update by checking old_pr_status
    const isNewPR = isPurchaseReportEvent && !event.old_pr_status;
    const isApprovalUpdate = isPurchaseReportEvent && !!event.old_pr_status;

    // New Purchase Report (department isolated)
    if (isNewPR) {
      const reportData = event;
      // console.log(
      //   "➕ Adding new purchase report to cache:",
      //   reportData.series_no
      // );

      queryClient.setQueryData<PurchaseReportsCache>(
        ["purchaseReports"],
        (old) => {
          if (!old?.items) return old;
          const exists = old.items.some((item) => item.id === reportData.id);
          if (exists) return old;
          return {
            ...old,
            items: [reportData, ...old.items],
            totalItems: (old.totalItems ?? 0) + 1,
          };
        }
      );

      queryClient.setQueryData<any[]>(["recentReports"], (old) => {
        if (!old) return [reportData];
        const exists = old.some((item) => item.id === reportData.id);
        if (exists) return old;
        return [reportData, ...old].slice(0, 10);
      });

      queryClient.setQueryData<DashboardSummaryCache>(
        ["dashboardSummary"],
        (old) => {
          if (!old) return old;
          const updated: DashboardSummaryCache = { ...old };
          if (event.pr_status && updated[event.pr_status] !== undefined) {
            updated[event.pr_status] = (updated[event.pr_status] || 0) + 1;
          }
          updated.total_prs = (old.total_prs || 0) + 1;
          // console.log("📊 Updated dashboard summary:", updated);
          return updated;
        }
      );

      // ✅ FIXED: Force refetch dashboard summary for new PR
      // console.log("🔄 Force refetching dashboard summary after new PR");
      queryClient.refetchQueries({ 
        queryKey: ["dashboardSummary"],
        type: "all"
      });

      return;
    }

    // Approval Status Updated
    if (isApprovalUpdate) {
      const reportData = event;

      // console.log("🔄 Approval status update detected:", {
      //   id: reportData.id,
      //   old: reportData.old_pr_status,
      //   new: reportData.pr_status,
      // });

      queryClient.setQueryData<PurchaseReportsCache>(
        ["purchaseReports"],
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === reportData.id ? { ...item, ...reportData } : item
            ),
          };
        }
      );

      queryClient.setQueryData<any[]>(["recentReports"], (old) => {
        if (!old) return old;
        return old.map((item) =>
          item.id === reportData.id ? { ...item, ...reportData } : item
        );
      });

      // FIXED: Force refetch dashboard summary with type: "all"
      // This bypasses the refetchOnMount: false setting in Dashboard
      // console.log("🔄 Force refetching dashboard summary after approval update");
      queryClient.refetchQueries({ 
        queryKey: ["dashboardSummary"],
        type: "all" // Force refetch even with refetchOnMount: false
      });

      return;
    }

    // Department Created
    if (isDepartmentEvent && event.type === "global_notification") {
      const deptData = event;
      queryClient.setQueryData<any[]>(["departments"], (old) => {
        if (!old) return [deptData];
        const exists = old.some((dept) => dept.id === deptData.id);
        if (exists) return old;
        return [...old, deptData].sort((a, b) =>
          String(a.name).localeCompare(String(b.name))
        );
      });
      return;
    }
  };

  // ---- Main Event Handler ----
  const handleEvent = async (event: PurchaseReportEvent) => {
    // console.log("📡 Realtime event received:", event);

    // ✅ FIXED: Ring bell for ALL purchase report events
    // Check if it's a PR event (has series_no and id)
    const isPREvent = !!(event.series_no && event.id);
    
    if (
      isPREvent ||
      event.type === "global_notification" ||
      event.type === "global_approval_notification" ||
      event.type === "notification_created" ||
      (typeof event.event === "string" &&
        event.event.includes("PurchaseReport")) ||
      (typeof event.event === "string" && event.event.includes("Department"))
    ) {
      // console.log("🔔 Ringing bell for event");
      bellSound.current?.play().catch(() => {});
    }

    if (event.type === "notification_created") {
      addNotification({
        id: String(event.id),
        type: String(event.type),
        notifiable_type: String(event.notifiable_type),
        notifiable_id: Number(event.notifiable_id),
        data: event.data!,
        read_at: null,
        created_at: String(event.created_at),
        updated_at: String(event.updated_at),
      });

      fetchCounts();
      const isApprovalNotification =
        event.notifiable_type === "App\\Models\\PurchaseReport" &&
        event.data?.pr_status;

      if (isApprovalNotification) {
        // console.log(
        //   "✅ Approval notification received, force refetching summary and table"
        // );
        // FIXED: Use refetchQueries with type: "all"
        queryClient.refetchQueries({ 
          queryKey: ["dashboardSummary"],
          type: "all"
        });
        queryClient.invalidateQueries({ queryKey: ["purchaseReports"] });
      }

      return;
    }

    if (event.type === "notifications_updated") {
      fetchCounts();
      return;
    }

    if (!isEventRelevant(event)) {
      // console.log("👻 Ignoring irrelevant broadcast event for user");
      return;
    }

    updateCaches(event);
    queryClient.invalidateQueries({ queryKey: ["purchaseReports"] });
  };

  // ---- Subscribe to Realtime Channels ----
  useEffect(() => {
    if (!user) return;

    // console.log("🔌 Realtime listener initialized for user:", user);

    const channels: any[] = [];

    // User-specific channel
    channels.push(echo.channel(`purchase-report-user-${user.id}`));

    // Department channels
    if (Array.isArray(user.department) && user.department.length > 0) {
      user.department.forEach((dept: string) => {
        const deptSlug = normalize(dept);
        const deptChannelName = `purchase-report-dept-${deptSlug}`;
        // console.log(`📢 Subscribing to department channel: ${deptChannelName}`);
        channels.push(echo.channel(deptChannelName));
      });
    }

    // Admins and optionally special roles
    if (user.role.includes("admin")) {
      channels.push(echo.channel("purchase-report-admin"));
      channels.push(echo.channel("purchase-report-purchasing"));
      channels.push(echo.channel("purchase-report-approval-global"));
    }

    channels.forEach((ch) => {
      ch.listen(".PurchaseReportCreated", handleEvent);
      ch.listen(".GlobalPurchaseReportCreated", handleEvent);
      ch.listen(".GlobalPurchaseReportApprovalUpdated", handleEvent);
      ch.listen(".GlobalDepartmentCreated", handleEvent);
    });

    return () => {
      // console.log("🔌 Cleaning up realtime listener");
      channels.forEach((ch) => {
        ch.stopListening(".PurchaseReportCreated");
        ch.stopListening(".GlobalPurchaseReportCreated");
        ch.stopListening(".GlobalPurchaseReportApprovalUpdated");
        ch.stopListening(".GlobalDepartmentCreated");
      });
    };
  }, [user, queryClient, addNotification, fetchCounts]);

  return null;
}
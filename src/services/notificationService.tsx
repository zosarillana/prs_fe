import api from "@/lib/api";
import type {
  Notification,
  NotificationCounts,
  NotificationSummary,
} from "@/types/notification";

export const notificationService = {
  /**
   * Get all notifications for the authenticated user
   */
  getAll: async (): Promise<Notification[]> => {
    const res = await api.get("api/notifications");

    return res.data.map((notification: any) => ({
      ...notification,
      data: typeof notification.data === "string"
        ? JSON.parse(notification.data)
        : notification.data,
    }));
  },

  /**
   * Get counts (total, unread, read)
   */
  getCounts: async (): Promise<NotificationCounts> => {
    const res = await api.get("api/notifications/counts");
    return res.data;
  },

  /**
   * Get role/department/status summary
   */
  getSummary: async (params?: {
    role?: string;
    department?: string;
    pr_status?: string;
    po_status?: string;
  }): Promise<NotificationSummary> => {
    const res = await api.get("api/notifications/summary", { params });
    return res.data;
  },

  /**
   * Mark one notification as read
   */
  markAsRead: async (id: string): Promise<Notification> => {
    const res = await api.post(`api/notifications/${id}/read`);

    return {
      ...res.data,
      data: typeof res.data.data === "string"
        ? JSON.parse(res.data.data)
        : res.data.data,
    };
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ message: string }> => {
    const res = await api.post("api/notifications/read-all");
    return res.data;
  },
};

import { create } from "zustand";
import { notificationService } from "@/services/notificationService";
import type {
  Notification,
  NotificationBackendResponse,
  NotificationCounts,
} from "@/types/notification";

// Define a type for the raw notification that might have string data
interface RawNotification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: any; // Could be string or object
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

interface NotificationState {
  notifications: Notification[];
  counts: NotificationCounts | null;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  fetchCounts: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  counts: null,
  unreadCount: 0,
  isLoading: false,
  error: null,
  fetchNotifications: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await notificationService.getAll();

      let notifications: Notification[] = [];

      if (response) {
        // If response has 'personal', use it
        if ("personal" in response && Array.isArray(response.personal)) {
          notifications = response.personal.map((n) => ({
            ...n,
            data: typeof n.data === "string" ? JSON.parse(n.data) : n.data,
          }));
        } else if (Array.isArray(response)) {
          // Otherwise assume response is already array
          notifications = response.map((n: RawNotification) => ({
            ...n,
            data: typeof n.data === "string" ? JSON.parse(n.data) : n.data,
          }));
        }
      }

      set({ notifications, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch notifications",
        isLoading: false,
      });
    }
  },

  fetchCounts: async () => {
    try {
      const counts = await notificationService.getCounts();
      set({
        counts,
        unreadCount: counts.unread,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch counts",
      });
    }
  },

  addNotification: (notification: Notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      counts: state.counts
        ? {
            ...state.counts,
            total: state.counts.total + 1,
            unread: notification.read_at
              ? state.counts.unread
              : state.counts.unread + 1,
            read: notification.read_at
              ? state.counts.read + 1
              : state.counts.read,
          }
        : null,
      unreadCount: notification.read_at
        ? state.unreadCount
        : state.unreadCount + 1,
    })),

  markAsRead: async (id: string) => {
    try {
      const currentNotification = get().notifications.find((n) => n.id === id);
      if (!currentNotification || currentNotification.read_at) return;

      await notificationService.markAsRead(id);

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        ),
        counts: state.counts
          ? {
              ...state.counts,
              unread: Math.max(0, state.counts.unread - 1),
              read: state.counts.read + 1,
            }
          : null,
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark notification as read",
      });
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.read_at ? n : { ...n, read_at: new Date().toISOString() }
        ),
        counts: state.counts
          ? { ...state.counts, unread: 0, read: state.counts.total }
          : null,
        unreadCount: 0,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark all notifications as read",
      });
    }
  },
}));

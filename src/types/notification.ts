export interface NotificationData {
  title: string;
  report_id: number;
  created_by: string;
  pr_status?: string;
  po_status?: string;
  user_id?: number;
  department?: string | null;
  role?: string[] | null;
}

export interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

// Raw notification from backend (before processing)
export interface RawNotification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: NotificationData | string; // Can be either parsed object or JSON string
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  read: number;
}

export interface NotificationSummary extends NotificationCounts {
  filters: {
    role?: string | null;
    department?: string | null;
    pr_status?: string | null;
    po_status?: string | null;
  };
}

export interface NotificationBackendResponse {
  personal?: Notification[];
//   global?: RawNotification[]; // Global notifications might have string data
}
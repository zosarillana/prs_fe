import { User } from "@/types/users";

export interface PurchaseReport {
  id: number;
  series_no: string;
  pr_purpose: string;
  department: string;
  date_submitted: string;
  date_needed: string;
  date_created?: string;
  quantity: number[];
  unit: string[];
  hod_user_id: User | null; // can be null
  tr_user_id: User | null; // can be null
  item_description: string[];
  tag: string[];
  item_status: string[];
  pr_status: string;
  remarks: string[];
  user: User;
}

export interface PurchaseReportInput {
  series_no: string;
  pr_purpose: string;
  department: string;
  date_submitted?: string; // ✅ optional
  date_needed?: string; // ✅ optional
  quantity: number[];
  unit: string[];
  item_description: string[];
  tag: string[];
  remarks: string[];
  user_id: number;
}

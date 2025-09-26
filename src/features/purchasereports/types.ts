import { User } from "@/types/users";

export interface PurchaseReport {
  id: number;
  series_no: string;
  pr_created  : string;
  pr_purpose: string;
  department: string;
  po_no: string;
  po_created_date?: string;
  po_status: string;
  po_approved_date?: string;
  purchaser_id: User | null; // can be null
  date_submitted: string;
  date_needed: string;
  created_at?: string;
  quantity: number[];
  unit: string[];
  hod_user_id: User | null; // can be null
  hod_signed_at: string;
  tr_user_id: User | null; // can be null
  tr_signed_at: string;
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
  item_status?: string[];
  item_description: string[];
  tag: string[];
  remarks: string[];
  user_id: number;
}

type PurchaseItem = {
  quantity: string;
  unit: string;
  description: string;
  tag: string;
  remarks: string;
};

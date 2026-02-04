import { User } from "@/types/users";
import { Tag } from "../tags/types";

export interface PurchaseReport {
  id: number;
  series_no: string;
  sap_id: string | null;
  pr_created: string;
  pr_purpose: string;
  department: string;

  po_no: string;
  po_created_date?: string;
  po_status: string;
  po_approved_date?: string;

  purchaser_id: User | null;

  date_submitted: string;
  date_needed: string;

  quantity: number[];
  unit: string[];
  item_description: string[];
  item_status: string[];
  remarks: string[];
  tag: Tag[];

  /** 🔥 ADD THIS */
  item_pos: PurchaseReportItemPo[];

  created_at?: string;
  hod_user_id: User | null; // can be null
  hod_signed_at: string;
  tr_user_id: User | null; // can be null
  tr_signed_at: string;

  pr_status: string;
  delivery_status: string[];
  user: User;
}

export interface PurchaseReportItemPo {
  id: number;
  item_index: number;
  po_number: string;
  status: "created" | "approved" | "cancelled";
  po_created_at: string | null;
  po_approved_at: string | null;
  purchaser: User | null;
}

export interface PurchaseReportInput {
  series_no: string;
  pr_purpose: string;
  department: string;
  date_submitted?: string | null; // 👈 allow null
  date_needed?: string | null; // 👈 allow null
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

// services/purchase-reports/types-clean.ts

export interface PurchaseReportCleanItem {
  id: number;
  series_no: string;
  pr_purpose: string;
  department: string;
  created_at: string;

  purchaser: {
    id: number;
    name: string;
    email: string;
    department: string[];
    role: string[];
    signature?: string | null;
  } | null;

  user: {
    id: number;
    name: string;
    email: string;
    department: string[];
    role: string[];
    signature?: string | null;
  } | null;

  items: Array<{
    quantity: number | string;
    unit: string;
    description: string;
    tag: {
      id: number | null;
      description: string;
      department: string | null;
    };
    status: string;
    remarks: string;
  }>;

  date_submitted: string | null;
  date_needed: string | null;
  delivery_status: string | null;
}

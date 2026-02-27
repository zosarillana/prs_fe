import { User } from "@/types/users";
import { Dispatch, SetStateAction } from "react";

export type VendorPayment = {
  id: number;
  srl_no: string;
  po_no: string;
  prs_id: number;
  vendor_name: string;
  created_at: string;
  inv_no: string | null;
  cheque_number: string | null;
  amount: number;
  date_served: string;
  status: string;
};

export type VendorPaymentTableProps = {
  payments: VendorPayment[]; // ✅ MUST be plural
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
  totalPages: number;
  getVisiblePages: () => (number | string)[];
  onView: (payment: VendorPayment) => void;
  // ✅ Add this new callback for PR-PO dialog
  onViewPrPo?: (prsId: number) => void;
  onEdit?: (payment: VendorPayment) => void;
  onServeDate?: (payment: VendorPayment) => void;
  deletePayment: (id: number) => void;
  user?: User | null;
};

export interface VendorPaymentPayload {
  vendor_id: number; // required
  prs_id: number; // required
  po_number: string; // required
  amount: number; // required
  cheque_status?: string; // optional, defaults to 'on_process'
  cheque_number?: string; // optional
  date_served?: string | null; // optional, YYYY-MM-DD
}

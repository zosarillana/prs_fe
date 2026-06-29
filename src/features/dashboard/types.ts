// types/dashboard.ts (or at the top of your Dashboard component)
export interface DashboardData {
  users: number;
  revenue: number;
  orders: number;
  feedback: number;
}

export interface SummaryCounts {
  on_hold?: number;
  closed?: number;
  closed_pr?: number;
  approved_po?: number;
  for_approval?: number;
  partial_po?: number;
  for_ceo_approval?: number;
  on_hold_tr?: number;
  completed_hod_review?: number;
  completed_tr_review?: number;
  own_created?: number;
  department_total?: number;
  total_prs?: number;
  completed_tr?: number;
  returned?: number;
  rejected?: number;
  on_hold_return?: number;
  drafted?: number;
  total_vendor_payments?: number;
}

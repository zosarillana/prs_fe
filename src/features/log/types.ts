import { User } from "@/types/users";

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  model_type: string | null;
  model_id: number | null;
  user_name: string | null;
  user_email: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  user: User | null;
}

export interface UserLog {
  id: number;
  user_id: number;
  user_name: string | null;
  user_email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  logged_in_at: string;
  logged_out_at: string | null;
  created_at: string;
  updated_at: string;
  user: User | null;
  
}

export interface User {
  id: number;
  name: string;
  email: string;
  department: string[];
  role: string[];
  signature?: string;
  created_at?: string;
  updated_at?: string;
}

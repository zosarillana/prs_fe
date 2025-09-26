import { Department } from "../department/types";

export interface Tag {
  id: number;
  department_id: number;
  name: string | null;
  description?: string | null;
  department?: Department; // when loaded with relationship
  created_at?: string;
  updated_at?: string;
}
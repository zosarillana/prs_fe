import { User } from "./users";

export interface UserPrivilege {
  id: number;
  user_id: number;
  tag_ids: number[];
  module_ids: number[];
  created_at: string;
  updated_at: string;
  user?: User | null;
}
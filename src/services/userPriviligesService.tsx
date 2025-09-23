import api from "@/lib/api";
import { UserPrivilege } from "@/types/userPriviliges";

export const userPrivilegesService = {
  /**
   * Get all UserPrivilege records (paginated or not)
   */
 /**
   * Get all UserPrivilege records
   */
  getAll: async (): Promise<UserPrivilege[]> => {
    const res = await api.get("api/user-privileges");
    return res.data;
  },

  /**
   * Get a single UserPrivilege by id
   */
  getById: async (id: number | string): Promise<UserPrivilege> => {
    const res = await api.get(`api/user-privileges/${id}`);
    return res.data;
  },

  /**
   * Create a new UserPrivilege
   */
  create: async (payload: {
    user_id: number;
    tag_ids?: number[];
    module_ids?: number[];
  }): Promise<UserPrivilege> => {
    const res = await api.post("api/user-privileges", payload);
    return res.data;
  },

  /**
   * Update a UserPrivilege by id
   */
  update: async (
    id: number | string,
    payload: {
      tag_ids?: number[];
      module_ids?: number[];
    }
  ): Promise<UserPrivilege> => {
    const res = await api.put(`api/user-privileges/${id}`, payload);
    return res.data;
  },

  /**
   * Delete a UserPrivilege by id
   */
  delete: async (id: number | string): Promise<{ message: string }> => {
    const res = await api.delete(`api/user-privileges/${id}`);
    return res.data;
  },
};
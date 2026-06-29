import { useEffect, useState, useCallback } from "react";
import { userPrivilegesService, UserPrivilegeFilters } from "@/services/userPriviligesService";
import { userService } from "@/features/users/userService";
import { tagsService, TagFilters } from "@/features/tags/tagsService";
import { departmentService } from "@/features/department/departmentService";
import { moduleService } from "@/services/modulesService";
import type { UserPrivilege } from "@/types/userPriviliges";
import type { User } from "@/types/users";
import type { Department } from "@/features/department/types";
import type { Tag } from "@/features/tags/types";
import type { Module } from "@/types/modules";
import { toast } from "sonner";

interface UseSettingsReturn {
  // Data
  privileges: UserPrivilege[];
  users: User[];
  tags: Tag[];
  departments: Department[];
  modules: Module[];
  
  // Loading states
  loading: boolean;
  submitting: boolean;
  error: string | null;
  
  // Form state
  editing: UserPrivilege | null;
  userId: string;
  selectedTags: number[];
  selectedDepartments: number[];
  selectedModules: number[];
  tagSearchQuery: string;
  filterByDepartment: string;
  
  // Form setters
  setUserId: (id: string) => void;
  setSelectedTags: React.Dispatch<React.SetStateAction<number[]>>;
  setSelectedDepartments: React.Dispatch<React.SetStateAction<number[]>>;
  setSelectedModules: React.Dispatch<React.SetStateAction<number[]>>;
  setTagSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setFilterByDepartment: React.Dispatch<React.SetStateAction<string>>;
  
  // Actions
  resetForm: () => void;
  loadData: (filters?: UserPrivilegeFilters) => Promise<void>;
  loadTags: (filters?: TagFilters) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
  handleEdit: (priv: UserPrivilege) => void;
  toggleSelection: (
    id: number,
    selected: number[],
    setter: React.Dispatch<React.SetStateAction<number[]>>
  ) => void;
  
  // Computed
  availableUsers: User[];
  filteredTags: Tag[];
}

export function useSettings(): UseSettingsReturn {
  // State
  const [privileges, setPrivileges] = useState<UserPrivilege[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editing, setEditing] = useState<UserPrivilege | null>(null);
  const [userId, setUserId] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  
  // Tag filter state
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [filterByDepartment, setFilterByDepartment] = useState("");

  // Reset form
  const resetForm = useCallback(() => {
    setEditing(null);
    setUserId("");
    setSelectedTags([]);
    setSelectedDepartments([]);
    setSelectedModules([]);
  }, []);

  // Load tags with optional filters
  const loadTags = useCallback(async (filters?: TagFilters) => {
    try {
      const tagsRes = await tagsService.getAll(filters);
      setTags(tagsRes);
    } catch (err) {
      console.error("Failed to load tags:", err);
      toast.error("Failed to load tags");
    }
  }, []);

  // Load data with optional filters
  const loadData = useCallback(async (filters?: UserPrivilegeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const [privs, usersRes, tagsRes, deptRes, modulesRes] = await Promise.all(
        [
          userPrivilegesService.getAll(filters),
          userService.getAll({ pageSize: 9999 }),
          tagsService.getAll(),
          departmentService.getAll({ pageSize: 9999 }),
          moduleService.getAll(),
        ]
      );

      setPrivileges(privs);
      setUsers(usersRes.items);
      setTags(tagsRes);
      setDepartments(deptRes.items);
      setModules(modulesRes);
    } catch (err) {
      console.error(err);
      const errorMsg = "Failed to load data. Please refresh.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle selection helper
  const toggleSelection = useCallback(
    (
      id: number,
      selected: number[],
      setter: React.Dispatch<React.SetStateAction<number[]>>
    ) => {
      setter(
        selected.includes(id)
          ? selected.filter((x) => x !== id)
          : [...selected, id]
      );
    },
    []
  );

  // CREATE or UPDATE
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!userId && !editing) {
        toast.error("Please select a user");
        return;
      }

      setSubmitting(true);
      const t = toast.loading(
        editing ? "Updating privilege..." : "Creating privilege..."
      );

      try {
        if (editing) {
          await userPrivilegesService.update(editing.id, {
            tag_ids: selectedTags,
            module_ids: selectedModules,
          });
          toast.success("Privilege updated successfully", { id: t });
        } else {
          await userPrivilegesService.create({
            user_id: Number(userId),
            tag_ids: selectedTags,
            module_ids: selectedModules,
          });
          toast.success("Privilege created successfully", { id: t });
        }
        resetForm();
        await loadData();
      } catch (err) {
        console.error(err);
        toast.error("Failed to save privilege", { id: t });
      } finally {
        setSubmitting(false);
      }
    },
    [editing, userId, selectedTags, selectedModules, resetForm, loadData]
  );

  // DELETE
  const handleDelete = useCallback(
    async (id: number) => {
      const t = toast.loading("Deleting privilege...");
      try {
        await userPrivilegesService.delete(id);
        toast.success("Privilege deleted successfully", { id: t });
        await loadData();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete privilege", { id: t });
      }
    },
    [loadData]
  );

  // EDIT
  const handleEdit = useCallback((priv: UserPrivilege) => {
    setEditing(priv);
    setUserId(String(priv.user_id));
    setSelectedTags(priv.tag_ids || []);
    setSelectedDepartments(priv.module_ids || []);
    setSelectedModules(priv.module_ids || []);
  }, []);

  // Computed values
  const availableUsers = users.filter(
    (u) => !privileges.some((p) => p.user_id === u.id)
  );

  // Filter tags based on search query and department
  const filteredTags = tags.filter((tag) => {
    const matchesSearch = tagSearchQuery
      ? tag.description?.toLowerCase().includes(tagSearchQuery.toLowerCase())
      : true;
    
    const matchesDepartment = filterByDepartment && filterByDepartment !== "all"
      ? tag.department_id === parseInt(filterByDepartment)
      : true;

    return matchesSearch && matchesDepartment;
  });

  return {
    // Data
    privileges,
    users,
    tags,
    departments,
    modules,
    
    // Loading states
    loading,
    submitting,
    error,
    
    // Form state
    editing,
    userId,
    selectedTags,
    selectedDepartments,
    selectedModules,
    tagSearchQuery,
    filterByDepartment,
    
    // Form setters
    setUserId,
    setSelectedTags,
    setSelectedDepartments,
    setSelectedModules,
    setTagSearchQuery,
    setFilterByDepartment,
    
    // Actions
    resetForm,
    loadData,
    loadTags,
    handleSubmit,
    handleDelete,
    handleEdit,
    toggleSelection,
    
    // Computed
    availableUsers,
    filteredTags,
  };
}
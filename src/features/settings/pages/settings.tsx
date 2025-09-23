import { useEffect, useState } from "react";
import { userPrivilegesService } from "@/services/userPriviligesService";
import { userService } from "@/features/users/userService";
import { tagsService } from "@/features/tags/tagsService";
import { departmentService } from "@/features/department/departmentService";
import { moduleService } from "@/services/modulesService";
import type { UserPrivilege } from "@/types/userPriviliges";
import type { User } from "@/types/users";
import type { Department } from "@/features/department/types";
import type { Tag } from "@/features/tags/types";
import type { Module } from "@/types/modules";
import { toast } from "sonner"; // ✅ Sonner toast

export default function Settings() {
  const [privileges, setPrivileges] = useState<UserPrivilege[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editing, setEditing] = useState<UserPrivilege | null>(null);
  const [userId, setUserId] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);

  const resetForm = () => {
    setEditing(null);
    setUserId("");
    setSelectedTags([]);
    setSelectedDepartments([]);
    setSelectedModules([]);
  };

  const loadData = async () => {
    try {
      const [privs, usersRes, tagsRes, deptRes, modulesRes] = await Promise.all(
        [
          userPrivilegesService.getAll(),
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
      setError("Failed to load data.");
      toast.error("Failed to load data. Please refresh."); // ✅ toast for load failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleSelection = (
    id: number,
    selected: number[],
    setter: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    setter(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );
  };

  // CREATE or UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await userPrivilegesService.update(editing.id, {
          tag_ids: selectedTags,
          module_ids: selectedModules,
        });
        toast.success("Privilege updated successfully."); // ✅
      } else {
        await userPrivilegesService.create({
          user_id: Number(userId),
          tag_ids: selectedTags,
          module_ids: selectedModules,
        });
        toast.success("Privilege created successfully."); // ✅
      }
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save privilege."); // ✅
    }
  };

  // DELETE
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this privilege?")) return;
    try {
      await userPrivilegesService.delete(id);
      toast.success("Privilege deleted successfully."); // ✅
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete privilege."); // ✅
    }
  };

  // EDIT
  const handleEdit = (priv: UserPrivilege) => {
    setEditing(priv);
    setUserId(String(priv.user_id));
    setSelectedTags(priv.tag_ids || []);
    setSelectedDepartments(priv.module_ids || []); // keep if needed
    setSelectedModules(priv.module_ids || []);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="border p-4 rounded-md space-y-4 max-w-lg"
      >
        <h2 className="text-xl font-semibold">
          {editing ? "Edit Privilege" : "Add New Privilege"}
        </h2>

        {!editing && (
          <div>
            <label className="block text-sm font-medium mb-1">User</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Select a user</option>
              {users
                // ✅ filter out users that already have privileges
                .filter((u) => !privileges.some((p) => p.user_id === u.id))
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* TAG CHECKBOXES */}
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <div className="grid grid-cols-2 gap-2">
            {tags.map((t) => (
              <label key={t.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(t.id)}
                  onChange={() =>
                    toggleSelection(t.id, selectedTags, setSelectedTags)
                  }
                />
                <span>{t.description || `Tag ${t.id}`}</span>
              </label>
            ))}
          </div>
        </div>

        {/* DEPARTMENT CHECKBOXES */}
        <div>
          <label className="block text-sm font-medium mb-1">Departments</label>
          {/* <div className="grid grid-cols-2 gap-2">
            {departments.map((d) => (
              <label key={d.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedDepartments.includes(d.id)}
                  onChange={() =>
                    toggleSelection(
                      d.id,
                      selectedDepartments,
                      setSelectedDepartments
                    )
                  }
                />
                <span>{d.name}</span>
              </label>
            ))}
          </div> */}
        </div>

        {/* MODULE CHECKBOXES */}
        <div>
          <label className="block text-sm font-medium mb-1">Modules</label>
          <div className="grid grid-cols-2 gap-2">
            {modules.map((m) => (
              <label key={m.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedModules.includes(m.id)}
                  onChange={() =>
                    toggleSelection(m.id, selectedModules, setSelectedModules)
                  }
                />
                <span>{m.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1 rounded"
          >
            {editing ? "Update" : "Create"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-1 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* LIST */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Existing Privileges</h2>
        {privileges.length === 0 ? (
          <p className="text-muted-foreground">No privileges found.</p>
        ) : (
          <ul className="space-y-2">
            {privileges.map((priv) => (
              <li
                key={priv.id}
                className="border p-3 rounded-md flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {priv.user?.name ?? `User #${priv.user_id}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tags: {priv.tag_ids?.join(", ") || "None"} |
                    {/* Departments: {priv.module_ids?.join(", ") || "None"} | */}
                    Modules: {priv.module_ids?.join(", ") || "None"}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(priv)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(priv.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

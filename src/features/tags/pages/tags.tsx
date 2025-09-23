import { useEffect, useState } from "react";
import { tagsService } from "../tagsService";
import type { Tag } from "../types";
import { departmentService } from "@/features/department/departmentService";
import type { Department } from "@/features/department/types";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Tags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const [selectedDept, setSelectedDept] = useState<string>(""); // department_id as string for <Select>
  const [description, setDescription] = useState("");

  /** 🔹 Load all tags */
  const fetchTags = async () => {
    setLoadingTags(true);
    try {
      const data = await tagsService.getAll();
      setTags(data);
    } finally {
      setLoadingTags(false);
    }
  };

  /** 🔹 Load all departments (loop through paginated results) */
  const fetchDepartments = async () => {
    setLoadingDepts(true);
    let all: Department[] = [];
    let page = 1;
    const pageSize = 50;

    try {
      while (true) {
        const res = await departmentService.getAll({ pageNumber: page, pageSize });
        all = [...all, ...res.items];
        if (res.items.length < pageSize) break;
        page++;
      }
      setDepartments(all);
    } finally {
      setLoadingDepts(false);
    }
  };

  /** 🔹 Create new tag */
  const handleCreate = async () => {
    if (!selectedDept) return alert("Please select a department");
    await tagsService.create({
      department_id: Number(selectedDept),
      description,
    });
    setSelectedDept("");
    setDescription("");
    fetchTags();
  };

  /** 🔹 Delete a tag */
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this tag?")) return;
    await tagsService.delete(id);
    fetchTags();
  };

  useEffect(() => {
    fetchTags();
    fetchDepartments();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Tags</h1>

      {/* ➕ Create Form */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="w-64 space-y-1">
          <label className="text-sm font-medium">Department</label>
          <Select
            value={selectedDept}
            onValueChange={setSelectedDept}
            disabled={loadingDepts}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loadingDepts ? "Loading departments..." : "Select department"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={String(dept.id)}>
                  {dept.description ?? dept.name ?? `Department ${dept.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-64 space-y-1">
          <label className="text-sm font-medium">Description</label>
          <Input
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button onClick={handleCreate} className="self-start">
          Add Tag
        </Button>
      </div>

      {/* 📋 Tag List */}
      {loadingTags ? (
        <p>Loading tags...</p>
      ) : (
        <table className="border-collapse border w-full text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Department</th>
              <th className="border px-2 py-1">Description</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id}>
                <td className="border px-2 py-1">{tag.id}</td>
                <td className="border px-2 py-1">
                  {
                    departments.find((d) => d.id === tag.department_id)?.description ??
                    tag.department_id
                  }
                </td>
                <td className="border px-2 py-1">{tag.description || "-"}</td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

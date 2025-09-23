import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { GlobalDepartmentListener } from "@/components/websocket/globalDepartmentListener";
import { departmentService } from "@/features/department/departmentService";
import type { Department } from "@/features/department/types";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";

export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ✅ Fetch departments (no Sonner toast here)
  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await departmentService.getAll({
        pageNumber: page,
        pageSize: pageSize,
      });
      setDepartments(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, [page, pageSize]);

  // ✅ Create Department (Sonner kept)
  const handleAddDepartment = async () => {
    if (!newName.trim() && !newDesc.trim()) return;
    const t = toast.loading("Creating department...");
    try {
      await departmentService.create({
        name: newName.trim(),
        description: newDesc.trim(),
      });
      await loadDepartments();
      setNewName("");
      setNewDesc("");
      toast.success("Department created successfully", { id: t });
    } catch (err) {
      toast.error("Failed to create department", { id: t });
      console.error(err);
    }
  };

  const startEdit = (dep: Department) => {
    setEditingId(dep.id);
    setEditName(dep.name ?? "");
    setEditDesc(dep.description ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDesc("");
  };

  // ✅ Update Department (Sonner kept)
  const handleUpdateDepartment = async (id: number) => {
    if (!editName.trim() && !editDesc.trim()) return;
    const t = toast.loading("Updating department...");
    try {
      const updated = await departmentService.update(id, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, name: updated.name, description: updated.description }
            : d
        )
      );
      cancelEdit();
      toast.success("Department updated successfully", { id: t });
    } catch (err) {
      toast.error("Failed to update department", { id: t });
      console.error(err);
    }
  };

  // ✅ Delete Department (Sonner kept)
  const handleDeleteDepartment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    const t = toast.loading("Deleting department...");
    try {
      await departmentService.delete(id);
      await loadDepartments();
      toast.success("Department deleted successfully", { id: t });
    } catch (err) {
      toast.error("Failed to delete department", { id: t });
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col p-6 max-w-full gap-4">
        <h1 className="text-3xl font-bold mb-6">Departments</h1>

        <GlobalDepartmentListener refreshDepartments={loadDepartments} />
        <Card className="max-w-4xl rounded-2xl shadow">
          <CardHeader>
            <CardTitle>Manage Departments</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create, edit or delete departments here.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4}>Loading...</TableCell>
                  </TableRow>
                ) : departments.length ? (
                  departments.map((dep) => (
                    <TableRow key={dep.id}>
                      <TableCell>{dep.id}</TableCell>
                      <TableCell>
                        {editingId === dep.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Department name"
                          />
                        ) : (
                          dep.name ?? "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === dep.id ? (
                          <Input
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Description"
                          />
                        ) : (
                          dep.description ?? "—"
                        )}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        {editingId === dep.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateDepartment(dep.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => startEdit(dep)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteDepartment(dep.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>No departments found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Add Department */}
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Department Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Input
                placeholder="Department Description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <Button onClick={handleAddDepartment}>Add Department</Button>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => page > 1 && setPage(page - 1)}
                      className={
                        page === 1 ? "opacity-50 pointer-events-none" : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === i + 1}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => page < totalPages && setPage(page + 1)}
                      className={
                        page === totalPages
                          ? "opacity-50 pointer-events-none"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page:
                </span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(val) => {
                    setPageSize(Number(val));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 30].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

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
  const loadDepartments = useCallback(async () => {
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
  }, [page, pageSize]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  // ✅ Create Department (Sonner kept)
  const handleAddDepartment = useCallback(async () => {
    if (!newName.trim() && !newDesc.trim()) {
      toast.error("Please provide at least a name or description");
      return;
    }
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
  }, [newName, newDesc, loadDepartments]);

  const startEdit = useCallback((dep: Department) => {
    setEditingId(dep.id);
    setEditName(dep.name ?? "");
    setEditDesc(dep.description ?? "");
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName("");
    setEditDesc("");
  }, []);

  // ✅ Update Department (Sonner kept)
  const handleUpdateDepartment = useCallback(async (id: number) => {
    if (!editName.trim() && !editDesc.trim()) {
      toast.error("Please provide at least a name or description");
      return;
    }
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
  }, [editName, editDesc, cancelEdit]);

  // ✅ Delete Department (Sonner kept)
  const handleDeleteDepartment = useCallback(async (id: number) => {
    const t = toast.loading("Deleting department...");
    try {
      await departmentService.delete(id);
      await loadDepartments();
      toast.success("Department deleted successfully", { id: t });
    } catch (err) {
      toast.error("Failed to delete department", { id: t });
      console.error(err);
    }
  }, [loadDepartments]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setPage(1);
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Departments Management</h1>
        <Badge variant="secondary" className="text-sm">
          {totalItems} departments
        </Badge>
      </div>

      <GlobalDepartmentListener refreshDepartments={loadDepartments} />

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Department Name</Label>
              <Input
                id="dept-name"
                placeholder="Department Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-desc">Description</Label>
              <Input
                id="dept-desc"
                placeholder="Department Description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleAddDepartment}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create, edit or delete departments here.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: pageSize }, (_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                <Plus className="h-6 w-6" />
              </div>
              <p className="text-lg font-medium">No departments found</p>
              <p className="text-sm">Create your first department to get started</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-32 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dep) => (
                    <TableRow key={dep.id}>
                      <TableCell className="font-mono text-sm">
                        <Badge variant="outline">{dep.id}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {editingId === dep.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Department name"
                            className="max-w-xs"
                          />
                        ) : (
                          dep.name || <span className="italic text-muted-foreground/70">No name</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {editingId === dep.id ? (
                          <Input
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Description"
                            className="max-w-sm"
                          />
                        ) : (
                          dep.description || <span className="italic text-muted-foreground/70">No description</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {editingId === dep.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleUpdateDepartment(dep.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEdit}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEdit(dep)}
                                className="h-8 w-8 p-0 hover:bg-muted"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Department</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{dep.name || `Department ${dep.id}`}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteDepartment(dep.id)}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && departments.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => page > 1 && handlePageChange(page - 1)}
                      className={
                        page === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => page < totalPages && handlePageChange(page + 1)}
                      className={
                        page === totalPages
                          ? "opacity-50 pointer-events-none"
                          : "cursor-pointer"
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
                  onValueChange={handlePageSizeChange}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
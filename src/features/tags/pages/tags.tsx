import { useEffect, useState, useCallback } from "react";
import { tagsService } from "../tagsService";
import type { Tag } from "../types";
import { departmentService } from "@/features/department/departmentService";
import type { Department } from "@/features/department/types";
import { Trash2, Plus, Loader2 } from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Tags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [selectedDept, setSelectedDept] = useState<string>(""); // department_id as string for <Select>
  const [description, setDescription] = useState("");

  /** 🔹 Load all tags */
  const fetchTags = useCallback(async () => {
    setLoadingTags(true);
    try {
      const data = await tagsService.getAll();
      setTags(data);
    } catch (error) {
      toast.error("Failed to load tags");
    } finally {
      setLoadingTags(false);
    }
  }, []);

  /** 🔹 Load all departments (loop through paginated results) */
  const fetchDepartments = useCallback(async () => {
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
    } catch (error) {
      toast.error("Failed to load departments");
    } finally {
      setLoadingDepts(false);
    }
  }, []);

  /** 🔹 Create new tag */
  const handleCreate = useCallback(async () => {
    if (!selectedDept) {
      toast.error("Please select a department");
      return;
    }

    setCreating(true);
    try {
      await tagsService.create({
        department_id: Number(selectedDept),
        description,
      });
      setSelectedDept("");
      setDescription("");
      await fetchTags();
      toast.success("Tag created successfully");
    } catch (error) {
      toast.error("Failed to create tag");
    } finally {
      setCreating(false);
    }
  }, [selectedDept, description, fetchTags]);

  /** 🔹 Delete a tag */
  const handleDelete = useCallback(async (id: number) => {
    setDeletingId(id);
    try {
      await tagsService.delete(id);
      await fetchTags();
      toast.success("Tag deleted successfully");
    } catch (error) {
      toast.error("Failed to delete tag");
    } finally {
      setDeletingId(null);
    }
  }, [fetchTags]);

  useEffect(() => {
    fetchTags();
    fetchDepartments();
  }, [fetchTags, fetchDepartments]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tags Management</h1>
        <Badge variant="secondary" className="text-sm">
          {tags.length} tags
        </Badge>
      </div>

      {/* ➕ Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Tag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="department-select">Department</Label>
              <Select
                value={selectedDept}
                onValueChange={setSelectedDept}
                disabled={loadingDepts}
              >
                <SelectTrigger id="department-select">
                  <SelectValue
                    placeholder={
                      loadingDepts ? "Loading departments..." : "Select department"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>
                      {dept.description ?? dept.name ?? `Department ${dept.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description-input">Description</Label>
              <Input
                id="description-input"
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleCreate} 
              disabled={creating || !selectedDept}
              className="flex items-center gap-2"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {creating ? "Creating..." : "Add Tag"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 📋 Tag List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTags ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                <Plus className="h-6 w-6" />
              </div>
              <p className="text-lg font-medium">No tags found</p>
              <p className="text-sm">Create your first tag to get started</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-mono text-sm">
                        <Badge variant="outline">{tag.id}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {departments.find((d) => d.id === tag.department_id)?.description ??
                          `Department ${tag.department_id}`}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tag.description || (
                          <span className="italic text-muted-foreground/70">No description</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deletingId === tag.id}
                            >
                              {deletingId === tag.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this tag? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(tag.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
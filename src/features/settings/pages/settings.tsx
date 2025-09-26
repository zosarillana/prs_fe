import { useEffect, useState, useCallback } from "react";
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
import { toast } from "sonner";
import { 
  Settings as SettingsIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  User as UserIcon,
  Tag as TagIcon,
  Package,
  Shield,
  Loader2,
  AlertTriangle
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Separator } from "@/components/ui/separator";

export default function Settings() {
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

  const resetForm = useCallback(() => {
    setEditing(null);
    setUserId("");
    setSelectedTags([]);
    setSelectedDepartments([]);
    setSelectedModules([]);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [privs, usersRes, tagsRes, deptRes, modulesRes] = await Promise.all([
        userPrivilegesService.getAll(),
        userService.getAll({ pageSize: 9999 }),
        tagsService.getAll(),
        departmentService.getAll({ pageSize: 9999 }),
        moduleService.getAll(),
      ]);

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

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSelection = useCallback((
    id: number,
    selected: number[],
    setter: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    setter(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );
  }, []);

  // CREATE or UPDATE
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId && !editing) {
      toast.error("Please select a user");
      return;
    }

    setSubmitting(true);
    const t = toast.loading(editing ? "Updating privilege..." : "Creating privilege...");
    
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
  }, [editing, userId, selectedTags, selectedModules, resetForm, loadData]);

  // DELETE
  const handleDelete = useCallback(async (id: number) => {
    const t = toast.loading("Deleting privilege...");
    try {
      await userPrivilegesService.delete(id);
      toast.success("Privilege deleted successfully", { id: t });
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete privilege", { id: t });
    }
  }, [loadData]);

  // EDIT
  const handleEdit = useCallback((priv: UserPrivilege) => {
    setEditing(priv);
    setUserId(String(priv.user_id));
    setSelectedTags(priv.tag_ids || []);
    setSelectedDepartments(priv.module_ids || []);
    setSelectedModules(priv.module_ids || []);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button onClick={loadData} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableUsers = users.filter((u) => !privileges.some((p) => p.user_id === u.id));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <Badge variant="secondary" className="text-sm">
          {privileges.length} privileges
        </Badge>
      </div>

      <div className="flex flex-col gap-6">
        {/* FORM */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editing ? "Edit Privilege" : "Add New Privilege"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!editing && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    User
                  </Label>
                  <Select value={userId} onValueChange={setUserId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No users available (all users have privileges)
                        </div>
                      ) : (
                        availableUsers.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            <div>
                              <div className="font-medium">{u.name}</div>
                              <div className="text-xs text-muted-foreground">{u.email}</div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* TAG CHECKBOXES */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4" />
                  Tags ({selectedTags.length} selected)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border rounded-md">
                  {tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-2">No tags available</p>
                  ) : (
                    tags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={() =>
                            toggleSelection(tag.id, selectedTags, setSelectedTags)
                          }
                        />
                        <Label 
                          htmlFor={`tag-${tag.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {tag.description || `Tag ${tag.id}`}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* MODULE CHECKBOXES */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Modules ({selectedModules.length} selected)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border rounded-md">
                  {modules.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-2">No modules available</p>
                  ) : (
                    modules.map((module) => (
                      <div key={module.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`module-${module.id}`}
                          checked={selectedModules.includes(module.id)}
                          onCheckedChange={() =>
                            toggleSelection(module.id, selectedModules, setSelectedModules)
                          }
                        />
                        <Label 
                          htmlFor={`module-${module.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {module.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={submitting || (!userId && !editing)}
                  className="flex items-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editing ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {submitting ? "Saving..." : editing ? "Update" : "Create"}
                </Button>
                {editing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* LIST */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Existing Privileges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {privileges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                  <Shield className="h-6 w-6" />
                </div>
                <p className="text-lg font-medium">No privileges found</p>
                <p className="text-sm">Create your first user privilege to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {privileges.map((priv) => (
                  <Card key={priv.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <p className="font-medium">
                              {priv.user?.name ?? `User #${priv.user_id}`}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <TagIcon className="h-3 w-3" />
                              <span>Tags:</span>
                              {priv.tag_ids?.length ? (
                                priv.tag_ids.map(id => (
                                  <Badge key={id} variant="secondary" className="text-xs">
                                    {tags.find(t => t.id === id)?.description || `Tag ${id}`}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground">None</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              <span>Modules:</span>
                              {priv.module_ids?.length ? (
                                priv.module_ids.map(id => (
                                  <Badge key={id} variant="outline" className="text-xs">
                                    {modules.find(m => m.id === id)?.name || `Module ${id}`}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground">None</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(priv)}
                            className="h-8 w-8 p-0"
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
                                <AlertDialogTitle>Delete Privilege</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete privileges for "{priv.user?.name || `User #${priv.user_id}`}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(priv.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
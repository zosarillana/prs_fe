import { useState } from "react";
import { useSettings } from "../hooks/useSettings";
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
  AlertTriangle,
  Search,
  Filter,
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
import { Input } from "@/components/ui/input";
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

function TagList({ tagIds, tags }: { tagIds: number[]; tags: any[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? tagIds : tagIds.slice(0, 6);
  const hiddenCount = tagIds.length - visible.length;

  if (!tagIds?.length) {
    return <span className="text-muted-foreground">None</span>;
  }

  return (
    <>
      {visible.map((id) => (
        <Badge key={id} variant="secondary" className="text-xs">
          {tags.find((t) => t.id === id)?.description || `Tag ${id}`}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-blue-500 hover:underline"
        >
          {showAll ? "See less" : `+${hiddenCount} more`}
        </button>
      )}
    </>
  );
}

function ModuleList({
  moduleIds,
  modules,
}: {
  moduleIds: number[];
  modules: any[];
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? moduleIds : moduleIds.slice(0, 6);
  const hiddenCount = moduleIds.length - visible.length;

  if (!moduleIds?.length) {
    return <span className="text-muted-foreground">None</span>;
  }

  return (
    <>
      {visible.map((id) => (
        <Badge key={id} variant="outline" className="text-xs">
          {modules.find((m) => m.id === id)?.name || `Module ${id}`}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-blue-500 hover:underline"
        >
          {showAll ? "See less" : `+${hiddenCount} more`}
        </button>
      )}
    </>
  );
}

function PrivilegeFilters({
  users,
  tags,
  modules,
  onFilterChange,
}: {
  users: any[];
  tags: any[];
  modules: any[];
  onFilterChange: (filters: any) => void;
}) {
  const [searchUser, setSearchUser] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = () => {
    const filters: any = {};

    if (searchUser) {
      const user = users.find((u) =>
        u.name.toLowerCase().includes(searchUser.toLowerCase())
      );
      if (user) filters.user_id = user.id;
    }

    if (selectedTag && selectedTag !== "all") {
      filters.tag_ids = [parseInt(selectedTag)];
    }

    if (selectedModule && selectedModule !== "all") {
      filters.module_ids = [parseInt(selectedModule)];
    }

    onFilterChange(filters);
  };

  const handleReset = () => {
    setSearchUser("");
    setSelectedTag("");
    setSelectedModule("");
    onFilterChange({});
  };

  const hasActiveFilters = searchUser || selectedTag || selectedModule;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {[searchUser, selectedTag, selectedModule].filter(Boolean).length}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs text-blue-500 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {showFilters && (
        <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Search className="h-4 w-4" />
            Filter Privileges
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search by User */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">User</label>
              <Input
                placeholder="Search user..."
                value={searchUser}
                onChange={(e) => {
                  setSearchUser(e.target.value);
                  setTimeout(handleFilterChange, 300);
                }}
                className="h-9"
              />
            </div>

            {/* Filter by Tag */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tag</label>
              <Select
                value={selectedTag}
                onValueChange={(val) => {
                  setSelectedTag(val);
                  setTimeout(handleFilterChange, 100);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={String(tag.id)}>
                      {tag.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter by Module */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Module</label>
              <Select
                value={selectedModule}
                onValueChange={(val) => {
                  setSelectedModule(val);
                  setTimeout(handleFilterChange, 100);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modules</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={String(module.id)}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const {
    privileges,
    users,
    tags,
    modules,
    departments,
    loading,
    submitting,
    error,
    editing,
    userId,
    selectedTags,
    selectedModules,
    tagSearchQuery,
    setTagSearchQuery,
    filterByDepartment,
    setFilterByDepartment,
    setUserId,
    setSelectedTags,
    setSelectedModules,
    resetForm,
    loadData,
    handleSubmit,
    handleDelete,
    handleEdit,
    toggleSelection,
    availableUsers,
    filteredTags, // ✅ add this
  } = useSettings();

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
            <Button onClick={() => loadData()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      <div className="flex flex-row gap-6 h-[calc(90vh-10rem)]">
        {/* FORM */}
        <Card className="flex flex-col w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editing ? (
                <Edit className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
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
                              <div className="text-xs text-muted-foreground">
                                {u.email}
                              </div>
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

                {/* Search + Filter */}
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Search tags..."
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    className="h-8 w-full"
                  />
                  <Select
                    value={filterByDepartment}
                    onValueChange={setFilterByDepartment}
                  >
                    <SelectTrigger className="h-8 w-[160px]">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtered Tag List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border rounded-md">
                  {filteredTags.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-2">
                      No matching tags
                    </p>
                  ) : (
                    filteredTags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={() =>
                            toggleSelection(
                              tag.id,
                              selectedTags,
                              setSelectedTags
                            )
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
                    <p className="text-sm text-muted-foreground col-span-2">
                      No modules available
                    </p>
                  ) : (
                    modules.map((module) => (
                      <div
                        key={module.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`module-${module.id}`}
                          checked={selectedModules.includes(module.id)}
                          onCheckedChange={() =>
                            toggleSelection(
                              module.id,
                              selectedModules,
                              setSelectedModules
                            )
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
        <Card className="flex flex-col h-full w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Existing Privileges
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto pr-2 space-y-4">
            {/* Filters */}
            <PrivilegeFilters
              users={users}
              tags={tags}
              modules={modules}
              onFilterChange={(filters) => loadData(filters)}
            />

            {privileges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                  <Shield className="h-6 w-6" />
                </div>
                <p className="text-lg font-medium">No privileges found</p>
                <p className="text-sm">
                  Create your first user privilege to get started
                </p>
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

                          {/* TAGS */}
                          <div className="flex flex-wrap gap-2 text-sm">
                            <div className="flex items-center gap-1 flex-wrap">
                              <TagIcon className="h-3 w-3" />
                              <span>Tags:</span>
                              <TagList
                                tagIds={priv.tag_ids || []}
                                tags={tags}
                              />
                            </div>
                          </div>

                          {/* MODULES */}
                          <div className="flex flex-wrap gap-2 text-sm">
                            <div className="flex items-center gap-1 flex-wrap">
                              <Package className="h-3 w-3" />
                              <span>Modules:</span>
                              <ModuleList
                                moduleIds={priv.module_ids || []}
                                modules={modules}
                              />
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
                                <AlertDialogTitle>
                                  Delete Privilege
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete privileges for
                                  "{priv.user?.name || `User #${priv.user_id}`}
                                  "? This action cannot be undone.
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

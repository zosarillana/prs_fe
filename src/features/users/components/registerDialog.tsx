import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { useEffect, useState } from "react";
import { departmentService } from "@/features/department/departmentService";
import type { Department } from "@/features/department/types";
import { toast } from "sonner";

// ✅ Cache departments globally to avoid refetching
let cachedDepartments: Department[] | null = null;

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegisterDialog({ open, onOpenChange }: RegisterDialogProps) {
  const {
    department,
    setDepartment,
    role,
    setRole,
    handleSubmit,
    isPending,
    isError,
    error,
  } = useRegisterForm(onOpenChange);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  // ✅ Fetch all departments (paginated) when dialog opens
  const fetchAllDepartments = async () => {
    if (cachedDepartments) {
      setDepartments(cachedDepartments);
      return;
    }

    setLoadingDepts(true);
    // const toastId = toast.loading("Loading departments...");
    let allDepartments: Department[] = [];
    let page = 1;
    const pageSize = 50; // adjust page size as needed

    try {
      while (true) {
        const res = await departmentService.getAll({ pageNumber: page, pageSize });
        allDepartments = [...allDepartments, ...res.items];
        if (res.items.length < pageSize) break; // last page
        page++;
      }
      setDepartments(allDepartments);
      cachedDepartments = allDepartments; // cache globally
      // toast.success("Departments loaded", { id: toastId });
    } catch (err) {
      // toast.error("Failed to load departments", { id: toastId });
    } finally {
      setLoadingDepts(false);
    }
  };

  useEffect(() => {
    if (open) fetchAllDepartments();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new account</DialogTitle>
          <DialogDescription>Enter user details to register.</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          {/* ✅ Department Select (dynamic & scrollable) */}
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={department}
              onValueChange={setDepartment}
              disabled={loadingDepts || departments.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingDepts
                      ? "Loading..."
                      : departments.length
                      ? "Select department"
                      : "No departments found"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name ?? ""}>
                    {dept.description ?? dept.name ?? "Unnamed Department"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Select */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Maker</SelectItem>
                <SelectItem value="hod">Head of Department</SelectItem>
                <SelectItem value="technical_reviewer">
                  Technical Reviewer
                </SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="purchasing">Purchasing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            Sign Up
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

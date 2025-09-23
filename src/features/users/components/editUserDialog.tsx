// Updated EditUserDialog.tsx
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditUserForm } from "../hooks/useEditUser";
import type { User } from "../types";
import { useEffect, useState } from "react";
import { departmentService } from "@/features/department/departmentService";
import type { Department } from "@/features/department/types";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, User as UserIcon } from "lucide-react";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function EditUserDialog({ open, onOpenChange, user }: EditDialogProps) {
  const {
    // Profile form states
    name,
    setName,
    email,
    setEmail,
    department,
    setDepartment,
    role,
    setRole,
    isPending,
    handleSubmit,
    // Password form states
    password,
    setPassword,
    passwordConfirmation,
    setPasswordConfirmation,
    showPasswords,
    togglePasswordVisibility,
    isPasswordPending,
    handlePasswordSubmit,
  } = useEditUserForm({
    user,
    onSuccess: () => onOpenChange(false),
  });

  // Local state for departments
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  // Fetch all departments (paginated) when dialog opens
  const fetchAllDepartments = async () => {
    setLoadingDepts(true);
    let allDepartments: Department[] = [];
    let page = 1;
    const pageSize = 50;

    try {
      while (true) {
        const res = await departmentService.getAll({ pageNumber: page, pageSize });
        allDepartments = [...allDepartments, ...res.items];
        if (res.items.length < pageSize) break;
        page++;
      }
      setDepartments(allDepartments);
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setLoadingDepts(false);
    }
  };

  useEffect(() => {
    if (open) fetchAllDepartments();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user details and manage password.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

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
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="password" className="space-y-4">
            <form className="space-y-5" onSubmit={handlePasswordSubmit}>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPasswords.password ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPasswordPending}
                    className="pr-10"
                    placeholder="Enter new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('password')}
                    disabled={isPasswordPending}
                  >
                    {showPasswords.password ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    disabled={isPasswordPending}
                    className="pr-10"
                    placeholder="Confirm new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                    disabled={isPasswordPending}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This will update the user's password. They will need to use the new password for future logins.
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={isPasswordPending || !password || !passwordConfirmation} 
                className="w-full"
                variant="secondary"
              >
                {isPasswordPending ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

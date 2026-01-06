// Updated EditUserDialog.tsx with multi-role selection
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
import { Eye, EyeOff, Lock, User as UserIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

const ROLE_OPTIONS = [
  { value: "user", label: "Maker" },
  { value: "hod", label: "Head of Department" },
  { value: "technical_reviewer", label: "Technical Reviewer" },
  { value: "admin", label: "Admin" },
  { value: "ovs", label: "Overseeing" },
  { value: "purchasing", label: "Purchasing" },
];

export function EditUserDialog({ open, onOpenChange, user }: EditDialogProps) {
  const {
    // Profile form states
    name,
    setName,
    email,
    setEmail,
    department,
    setDepartment,
    roles,
    setRoles,
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

  // Role management functions
  const handleRoleSelect = (roleValue: string) => {
    if (!roles.includes(roleValue)) {
      setRoles([...roles, roleValue]);
    }
  };

  const handleRoleRemove = (roleValue: string) => {
    setRoles(roles.filter(r => r !== roleValue));
  };

  const getRoleLabel = (roleValue: string) => {
    return ROLE_OPTIONS.find(r => r.value === roleValue)?.label || roleValue;
  };

  const availableRoles = ROLE_OPTIONS.filter(
    role => !roles.includes(role.value)
  );

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
                <Label>Roles</Label>
                
                {/* Display selected roles as badges */}
                {roles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {roles.map((roleValue) => (
                      <Badge
                        key={roleValue}
                        variant="secondary"
                        className="flex items-center gap-1 pl-2 pr-1"
                      >
                        {getRoleLabel(roleValue)}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleRoleRemove(roleValue)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Select dropdown to add more roles */}
                <Select
                  value=""
                  onValueChange={handleRoleSelect}
                  disabled={availableRoles.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        availableRoles.length === 0
                          ? "All roles selected"
                          : "Add a role"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
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
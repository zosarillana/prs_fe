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

          {/* Department Select */}
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it_department">
                  Information Technology Department
                </SelectItem>
                <SelectItem value="hr_department">
                  Human Resources Department
                </SelectItem>
                <SelectItem value="planning_department">
                  Planning Department
                </SelectItem>
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
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="hod">Head of Department</SelectItem>
                <SelectItem value="technical_reviewer">
                  Techinical Reviewer
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

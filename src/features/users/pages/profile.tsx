import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { userService } from "../userService";
import { authService } from "@/features/auth/authService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function Profile() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const initialized = useAuthStore((s) => s.initialized);
  const loading = useAuthStore((s) => s.loading);

  // run only once on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleSignatureUpdate = async () => {
    if (!selectedFile || !user) return;

    // show loading, success, error automatically with sonner
    await toast.promise(
      (async () => {
        const updatedUser = await userService.updateSignature(
          user.id,
          selectedFile
        );

        // if API returns updated user
        useAuthStore.setState({ user: updatedUser });

        setSelectedFile(null);
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        return updatedUser;
      })(),
      {
        loading: "Updating signature...",
        success: "Signature updated successfully!",
        error: "Failed to update signature. Please try again.",
      }
    );
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current_password || !passwordForm.password || !passwordForm.password_confirmation) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast.error("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    await toast.promise(
      (async () => {
        await authService.changePassword(passwordForm);
        
        // Reset form
        setPasswordForm({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
        
        // Reset password visibility
        setShowPasswords({
          current: false,
          new: false,
          confirm: false,
        });

        return true;
      })(),
      {
        loading: "Changing password...",
        success: "Password changed successfully!",
        error: (err) => {
          console.error("Password change error:", err);
          return err?.response?.data?.message || "Failed to change password. Please try again.";
        },
      }
    );

    setIsChangingPassword(false);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading && !initialized) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Loading profile...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">
          No user data found. Please log in again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 max-w-full gap-4 ">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <Card className="max-w-2xl rounded-2xl shadow ">
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="font-medium">Department</dt>
            <dd className="capitalize">{user.department?.join(", ") || "-"}</dd>

            <dt className="font-medium">Role</dt>
            <dd className="capitalize">{user.role?.join(", ") || "-"}</dd>

            <dt className="font-medium">Joined</dt>
            <dd>
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "-"}
            </dd>
          </dl>

          <div className="mt-6 flex justify-end">
            <Button variant="destructive" onClick={clearAuth}>
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 🆕 Change Password Card */}
      <Card className="max-w-2xl rounded-2xl shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your password to keep your account secure
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <div className="relative">
              <Input
                id="current_password"
                type={showPasswords.current ? "text" : "password"}
                value={passwordForm.current_password}
                onChange={(e) => 
                  setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))
                }
                disabled={isChangingPassword}
                className="pr-10"
                placeholder="Enter your current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
                disabled={isChangingPassword}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showPasswords.new ? "text" : "password"}
                value={passwordForm.password}
                onChange={(e) => 
                  setPasswordForm(prev => ({ ...prev, password: e.target.value }))
                }
                disabled={isChangingPassword}
                className="pr-10"
                placeholder="Enter your new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
                disabled={isChangingPassword}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordForm.password_confirmation}
                onChange={(e) => 
                  setPasswordForm(prev => ({ ...prev, password_confirmation: e.target.value }))
                }
                disabled={isChangingPassword}
                className="pr-10"
                placeholder="Confirm your new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={isChangingPassword}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handlePasswordChange}
              disabled={
                isChangingPassword || 
                !passwordForm.current_password || 
                !passwordForm.password || 
                !passwordForm.password_confirmation
              }
            >
              {isChangingPassword ? "Changing Password..." : "Change Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl rounded-2xl shadow">
        <CardHeader>
          <CardTitle>Signature Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm items-center">
            <dt className="font-medium">Current Signature</dt>
            <dd>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="bg-white p-2 rounded border border-muted inline-block cursor-pointer">
                    <img
                      src={
                        user.signature
                          ? `${API_BASE_URL}${user.signature}`
                          : "https://www.freepnglogos.com/uploads/signature-png/gary-vaynerchuk-signature-0.png"
                      }
                      alt="Current signature"
                      className="h-24 w-auto rounded"
                    />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto p-3 bg-white rounded shadow transform transition-all duration-200 ease-out data-[state=closed]:opacity-0 data-[state=closed]:scale-95 data-[state=open]:opacity-100 data-[state=open]:scale-100">
                  <img
                    src={
                      user.signature
                        ? `${API_BASE_URL}${user.signature}`
                        : "https://www.freepnglogos.com/uploads/signature-png/gary-vaynerchuk-signature-0.png"
                    }
                    alt="Current signature"
                    className="max-h-64 w-auto rounded"
                  />
                </HoverCardContent>
              </HoverCard>
            </dd>

            <dt className="font-medium">Upload New Signature</dt>
            <dd>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Input
                    type="file"
                    accept="image/*"
                    className="max-w-xs cursor-pointer"
                    disabled={isUpdating}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedFile(file);
                    }}
                  />
                </HoverCardTrigger>
                <HoverCardContent className="w-auto p-3 bg-white rounded shadow transform transition-all duration-200 ease-out data-[state=closed]:opacity-0 data-[state=closed]:scale-95 data-[state=open]:opacity-100 data-[state=open]:scale-100">
                  {selectedFile ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview of new signature"
                      className="max-h-64 w-auto rounded"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No file selected
                    </p>
                  )}
                </HoverCardContent>
              </HoverCard>
            </dd>
          </dl>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSignatureUpdate}
              disabled={!selectedFile || isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Signature"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
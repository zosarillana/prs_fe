import bgImage from "@/assets/images/bg3.jpg"; // ✅ import your background
import bgImage2 from "@/assets/images/bg2.png"; // ✅ import your background
import logo from "@/assets/images/logosidebar.png"; // ✅ import your logo
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLogin } from "../hooks/useLogin";
import { useAuthStore } from "@/store/auth/authStore";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { mutate, isPending, isError, error } = useLogin();
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    mutate(
      { email, password },
      {
        onSuccess: (data) => {
          setAuth(data.access_token, data.user);
          toast.success("Welcome back 👋");
          navigate("/dashboard");
        },
        onError: (err: any) =>
          toast.error(
            err?.response?.data?.message ||
              err?.message ||
              "Invalid email or password"
          ),
      }
    );
  };

  return (
    <div
      className="flex flex-col gap-8 h-screen items-center justify-center bg-cover bg-center bg-black/70 bg-blend-overlay"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <img src={logo} className="h-36 -mb-12" />
      <Card className="w-[350px] shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email and password to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="username/you@agrieximfze.com"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" />
            </div>

            <p className="text-sm text-gray-600">
              Don’t have an account? Contact Admin.
            </p>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
            {isError && (
              <p className="text-red-500">
                {/*
      Try to read the API error message first, fallback to generic message
      Works for Axios or similar fetch wrappers
    */}
                {(error as any)?.response?.data?.message ||
                  (error as any)?.message ||
                  "Login failed"}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

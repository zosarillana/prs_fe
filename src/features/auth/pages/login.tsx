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

export default function LoginPage() {
  const loginMutation = useLogin();
  const { mutate, isPending, isError, error } = loginMutation;
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
          setAuth(data.access_token, data.user); // update Zustand store
          navigate("/dashboard");
        },
      }
    );
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px] shadow-lg">
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
              <Input
                id="password"
                name="password"
                type="password"
                placeholder=""
              />
            </div>
            <p className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <a
                href="/register"
                className="font-medium text-blue-600 hover:underline"
              >
                Sign up
              </a>
            </p>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Logging in..." : "Sign In"}
            </Button>

            {isError && (
              <p className="text-red-500">
                {(error as any)?.message || "Login failed"}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
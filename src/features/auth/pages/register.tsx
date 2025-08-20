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
import { useRegister } from "../hooks/useRegister";
import { useAuthStore } from "@/store/auth/authStore";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const registerMutation = useRegister();
  const { mutate, isPending, isError, error } = registerMutation;
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const password_confirmation = formData.get("confirm-password") as string;

    mutate(
      { name, email, password, password_confirmation },
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
          <CardTitle>Create a new account</CardTitle>
          <CardDescription>Enter your details to sign up</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                autoFocus
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@agrixemfze.com"
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

            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:underline"
              >
                Sign in
              </Link>
            </p>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Creating account..." : "Sign Up"}
            </Button>

            {isError && (
              <p className="text-red-500">
                {(error as any)?.message || "Registration failed"}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
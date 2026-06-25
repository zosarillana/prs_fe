// src/routes/guestRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";

interface GuestRouteProps {
  children: React.ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, loading, initialized } = useAuthStore();

  // wait until auth is initialized
  if (!initialized && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ If user is already logged in, redirect to /prs or /dashboard
  if (initialized && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

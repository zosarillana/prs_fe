// src/routes/ProtectedRoute.tsx
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/features/auth/authService";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    authService
      .me()
      .then(() => setAuthorized(true))
      .catch(() => {
        setAuthorized(false);
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <FullScreenLoader />;
  if (!authorized) return null;

  return <>{children}</>;
}

// Full-screen loading component with dimmed overlay
function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        
        {/* Optional text */}
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
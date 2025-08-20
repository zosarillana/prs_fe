import { authService } from "@/features/auth/authService";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./button";
import { useAuthStore } from "@/store/auth/authStore";

export default function Navbar() {
const navigate = useNavigate();
const user = useAuthStore((state) => state.user);
const clearAuth = useAuthStore((state) => state.clearAuth);

const handleLogout = async () => {
  await authService.logout();
  clearAuth();
  navigate("/login");
};

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="text-xl font-bold">
        <Link to="/" className="flex flex-row gap-2">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8fssEwyy16ieSoPo_62lEqyx0meFbsagCsg&s"
            alt="MyApp Logo"
            className="h-8 w-auto"
          />
          <p className="text-green-700">agrieximfze</p>
        </Link>
      </div>

      <div className="space-x-4 flex items-center">
        {user ? (
          <>
            <span className="text-gray-700">Hello, {user.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">
              Login
            </Link>
            <Link to="/register" className="text-gray-700 hover:text-blue-600">
              Signup
            </Link>
          </>
        )}
        <Button variant="outline" size="sm">
          Contact
        </Button>
      </div>
    </nav>
  );
}

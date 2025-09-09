import Dashboard from "@/features/dashboard/pages/dashboard";
import PurchaseReport from "@/features/purchasereports/pages/purchaseReport";
import CreatePurchaseReport from "@/features/purchasereports/pages/createPurchaseReport";
import ProtectedRoute from "./protectedRoute";
import { LayoutDashboard, Receipt } from "lucide-react";
import Users from "@/features/users/pages/users";
import AdminProtectedRoute from "./adminProtectedRoute";
import Profile from "@/features/users/pages/profile";

export const appRoutes = [
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    label: "Dashboard",
    icon: LayoutDashboard,
    showInSidebar: true,
  },
  {
    path: "/purchase-reports",
    element: (
      <ProtectedRoute>
        <PurchaseReport />
      </ProtectedRoute>
    ),
    label: "Purchase Requests",
    icon: Receipt,
    showInSidebar: true,
  },
  {
    path: "/purchase-reports/create",
    element: (
      <ProtectedRoute>
        <CreatePurchaseReport />
      </ProtectedRoute>
    ),
    showInSidebar: false, // hide from sidebar
  },

  // profile
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
    showInSidebar: false, // hide from sidebar
  },
  {
    path: "/users",
    element: (
      <AdminProtectedRoute fallbackPath="/dashboard" showUnauthorized={true}>
        <Users />
      </AdminProtectedRoute>
    ),
    showInSidebar: false, // hide from sidebar
  },
];

// appRoutes.ts
import Dashboard from "@/features/dashboard/pages/dashboard";
import PurchaseReport from "@/features/purchasereports/pages/purchaseReport";
import CreatePurchaseReport from "@/features/purchasereports/pages/createPurchaseReport";
import ProtectedRoute from "./protectedRoute";
import { LayoutDashboard, Receipt } from "lucide-react";
import Users from "@/features/users/pages/users";
import Profile from "@/features/users/pages/profile";
import PurchaseOrder from "@/features/purchasereports/pages/purchaseOrder";
import Settings from "@/features/settings/pages/settings";
import UserLogs from "@/features/log/pages/userLogs";
import AuditLogs from "@/features/log/pages/auditLogs";
import UomPage from "@/features/uom/pages/uom";
import Department from "@/features/department/pages/department";
import Tags from "@/features/tags/pages/tags";
import NotFound from "@/features/misc/pages/notFound";

export const appRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
    label: "Dashboard",
    icon: LayoutDashboard,
    showInSidebar: true,
    moduleId: 1,   // ✅ privilege mapping
  },
  {
    path: "/purchase-reports",
    element: <PurchaseReport />,
    label: "Purchase Requests",
    icon: Receipt,
    showInSidebar: true,
    moduleId: 2,
  },
  {
    path: "/purchase-order",
    element: <PurchaseOrder />,
    moduleId: 3,
  },
  {
    path: "/users",
    element: <Users />,
    moduleId: 4,
  },
  {
    path: "/uom",
    element: <UomPage />,
    moduleId: 5,
  },
  {
    path: "/department",
    element: <Department />,
    moduleId: 6,
  },
  {
    path: "/tags",
    element: <Tags />,
    moduleId: 7,
  },
  {
    path: "/user-logs",
    element: <UserLogs />,
    moduleId: 8,
  },
  {
    path: "/audit-logs",
    element: <AuditLogs />,
    moduleId: 9,
  },
  // free routes
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/purchase-reports/create",
    element: <CreatePurchaseReport />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

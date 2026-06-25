import { useAuthStore } from "@/store/auth/authStore";

export function authRoles() {
  const user = useAuthStore((state) => state.user);

  // Safely handle user being null or undefined
  const roles = Array.isArray(user?.role)
    ? user.role.map((r: string) => r.toLowerCase())
    : [];

  const isAdmin = roles.includes("admin");
  const isHod = roles.includes("hod");
  const isTechnicalReviewer = roles.includes("technical_reviewer");
  const hasBothRoles = isHod && isTechnicalReviewer;
  const isTechnicalReviewerOnly =
    isTechnicalReviewer && !isHod && !isAdmin && !hasBothRoles;

  return {
    user,
    roles,
    isAdmin,
    isHod,
    isTechnicalReviewer,
    isTechnicalReviewerOnly,
    hasBothRoles,
  };
}

export const ROLE_DASHBOARD_ROUTES = {
  student: "/student/dashboard",
  security: "/security/dashboard",
  warden: "/warden/dashboard",
  finance: "/finance/dashboard",
  admin: "/admin/dashboard"
};

export function getDefaultDashboardRoute(role) {
  return ROLE_DASHBOARD_ROUTES[role] || "/login";
}

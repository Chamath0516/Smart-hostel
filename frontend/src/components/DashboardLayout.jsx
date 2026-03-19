import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDefaultDashboardRoute } from "../routes/roleRoutes";
import "../styles/dashboard.css";

export default function DashboardLayout({ title, children }) {
  const { user, logout } = useAuth();
  const roleHome = getDefaultDashboardRoute(user?.role);

  return (
    <div className="dashboard-shell">
      <header className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <div className="dashboard-brand">
            <strong>Smart Hostel</strong>
            <span>{title}</span>
          </div>

          <nav className="dashboard-links">
            <NavLink to={roleHome} className="dashboard-link">
              Dashboard
            </NavLink>
            <NavLink to="/qr" className="dashboard-link">
              Public QR
            </NavLink>
            <button type="button" onClick={logout} className="dashboard-logout">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-container">{children}</div>
      </main>
    </div>
  );
}

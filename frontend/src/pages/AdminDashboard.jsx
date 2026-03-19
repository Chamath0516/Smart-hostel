import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Admin Dashboard">
      <section className="dashboard-card">
        <h2>Welcome, {user?.name || "Admin"}</h2>
        <p className="dashboard-small-text">Role: {user?.role}</p>
        <p>This is a temporary admin dashboard for role-based access demo.</p>
        <div className="dashboard-action-row">
          <Link to="/admin/add-student" className="dashboard-cta-link">
            Add New Student
          </Link>
        </div>
      </section>
    </DashboardLayout>
  );
}

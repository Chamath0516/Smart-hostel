import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Student Dashboard">
      <section className="dashboard-card">
        <h2>Welcome, {user?.name || "Student"}</h2>
        <p className="dashboard-small-text">Role: {user?.role}</p>
        <p>This is a temporary student dashboard for role-based access demo.</p>
      </section>
    </DashboardLayout>
  );
}

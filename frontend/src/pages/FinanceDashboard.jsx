import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

export default function FinanceDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Finance Manager Dashboard">
      <section className="dashboard-card">
        <h2>Welcome, {user?.name || "Finance Manager"}</h2>
        <p className="dashboard-small-text">Role: {user?.role}</p>
        <p>This is a temporary finance dashboard for role-based access demo.</p>
      </section>
    </DashboardLayout>
  );
}

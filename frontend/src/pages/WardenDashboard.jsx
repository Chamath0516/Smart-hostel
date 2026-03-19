import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import OutsideMonitor from "../components/OutsideMonitor";

export default function WardenDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Warden Dashboard">
      <section className="dashboard-card">
        <h2>Welcome, {user?.name || "Warden"}</h2>
        <p className="dashboard-small-text">Outside and late student tracking with live refresh.</p>
      </section>
      <OutsideMonitor />
    </DashboardLayout>
  );
}

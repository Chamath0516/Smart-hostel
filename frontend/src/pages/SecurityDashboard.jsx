import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import OutsideMonitor from "../components/OutsideMonitor";
import SecurityPinCard from "../components/SecurityPinCard";

export default function SecurityDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Security Dashboard">
      <section className="dashboard-card">
        <h2>Welcome, {user?.name || "Security Officer"}</h2>
        <p className="dashboard-small-text">Monitor outside students and gate scan flow.</p>
      </section>
      <SecurityPinCard />
      <OutsideMonitor />
    </DashboardLayout>
  );
}

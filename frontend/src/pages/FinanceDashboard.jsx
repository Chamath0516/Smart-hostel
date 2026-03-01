import { useAuth } from "../context/AuthContext";

export default function FinanceDashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 20 }}>
      <h2>Finance Dashboard</h2>
      <p>Welcome: {user?.name} ({user?.role})</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
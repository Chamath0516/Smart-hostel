import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { getDefaultDashboardRoute } from "../routes/roleRoutes";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const data = await login(email, password);
      nav(getDefaultDashboardRoute(data?.user?.role), { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    }
  };

  return (
    <Layout narrow>
      <div className="auth-page">
        <Card className="auth-card">
          <h2>Smart Hostel Login</h2>
          <p className="auth-subtitle">Sign in to continue</p>

          {err ? <div className="alert alert-error">{err}</div> : null}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                className="text-input"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                className="text-input"
                placeholder="Enter password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="btn-primary" type="submit">
              Login
            </button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

      // role redirect
      const role = data.user.role;
      if (role === "student") nav("/student");
      else if (role === "warden") nav("/warden");
      else if (role === "security") nav("/security");
      else if (role === "finance") nav("/finance");
      else nav("/admin");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: 20 }}>
      <h2>Smart Hostel - Login</h2>
      {err && <p style={{ color: "tomato" }}>{err}</p>}
      <form onSubmit={handleSubmit}>
        <input
          style={{ width: "100%", padding: 10, marginTop: 10 }}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={{ width: "100%", padding: 10, marginTop: 10 }}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button style={{ width: "100%", padding: 10, marginTop: 12 }}>
          Login
        </button>
      </form>
    </div>
  );
}
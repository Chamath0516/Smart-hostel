import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api/axios";
import "../styles/dashboard.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  studentId: "",
};

export default function AddStudent() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdStudent, setCreatedStudent] = useState(null);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setCreatedStudent(null);

    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/admin/create-student", form, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      setCreatedStudent(res.data?.user || null);
      setForm(initialForm);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add Student">
      <section className="dashboard-card add-student-card">
        <h2>Add New Student</h2>
        <p className="dashboard-small-text">Create a student account manually from the admin panel.</p>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {createdStudent ? (
          <div className="alert alert-success">
            Created student <strong>{createdStudent.name}</strong> with Student ID{" "}
            <span className="dashboard-break-all">{createdStudent.studentId}</span>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="add-student-form">
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="text-input"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="text-input"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              className="text-input"
              value={form.phone}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="text-input"
              value={form.password}
              onChange={onChange}
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="studentId">
              Student ID
            </label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              className="text-input"
              value={form.studentId}
              onChange={onChange}
              placeholder="e.g. IT24102141"
              required
            />
          </div>

          <button type="submit" className="btn-primary add-student-submit" disabled={loading}>
            {loading ? "Creating..." : "Create Student"}
          </button>
        </form>
      </section>
    </DashboardLayout>
  );
}

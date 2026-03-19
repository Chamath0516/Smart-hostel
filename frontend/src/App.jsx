import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { getDefaultDashboardRoute } from "./routes/roleRoutes";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import WardenDashboard from "./pages/WardenDashboard";
import SecurityDashboard from "./pages/SecurityDashboard";
import FinanceDashboard from "./pages/FinanceDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddStudent from "./pages/AddStudent";
import QrPublicPage from "./pages/QrPublicPage";
import QrGeneratorPage from "./pages/QrGeneratorPage";
import OutsideStudentsPage from "./pages/OutsideStudentsPage";

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultDashboardRoute(user.role)} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/qr" element={<QrPublicPage />} />
          <Route
            path="/gate-qr"
            element={
              <ProtectedRoute allowedRoles={["warden", "security", "admin"]}>
                <QrGeneratorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qr/outside"
            element={
              <ProtectedRoute allowedRoles={["warden", "security", "admin"]}>
                <OutsideStudentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warden/dashboard"
            element={
              <ProtectedRoute allowedRoles={["warden"]}>
                <WardenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security/dashboard"
            element={
              <ProtectedRoute allowedRoles={["security"]}>
                <SecurityDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/dashboard"
            element={
              <ProtectedRoute allowedRoles={["finance"]}>
                <FinanceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-student"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddStudent />
              </ProtectedRoute>
            }
          />

          <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/warden" element={<Navigate to="/warden/dashboard" replace />} />
          <Route path="/security" element={<Navigate to="/security/dashboard" replace />} />
          <Route path="/finance" element={<Navigate to="/finance/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

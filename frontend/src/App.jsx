import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import Login from "./components/auth/Login";
import UserHome from "./pages/UserHome";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/common/ProtectedRoute";
import UserLayout from "./components/layout/UserLayout";
import AdminLayout from "./components/layout/AdminLayout";
import Room from "./components/frontend/Room/Room";
HomeRedirect;
// Root redirect based on role
function HomeRedirect() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "superadmin") return <Navigate to="/superadmin" replace />;
  if (user.role === "user") return <Navigate to="/user" replace />;
  return <Navigate to="/login" replace />;
}

// Prevent logged-in users from seeing login page
function LoginRedirect() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "superadmin")
      return <Navigate to="/superadmin" replace />;
    if (user.role === "user") return <Navigate to="/user" replace />;
    return <Navigate to="/" replace />;
  }

  return <Login />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />

          {/* Public route (blocked for logged-in users) */}
          <Route path="/login" element={<LoginRedirect />} />

          {/* User routes */}
          <Route element={<ProtectedRoute roles={["user"]} />}>
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserHome />} /> 
              <Route path="rooms" element={<Room />} />
            </Route>
          </Route>
          {/* Admin routes */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
          {/* SuperAdmin routes */}
          <Route element={<ProtectedRoute roles={["superadmin"]} />}>
            <Route path="/superadmin" element={<SuperAdminDashboard />} />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
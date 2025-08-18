// src/App.jsx
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

import UserHome from "./pages/UserHome";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Login from "./components/auth/Login";
import NotFound from "./pages/NotFound";
import UserLayout from "./components/layout/UserLayout";
import AdminLayout from "./components/layout/AdminLayout";
import Room from "./components/frontend/Room/Room";
import CreateHotel from "./components/admin/createhotel/CreateHotel";

import useAdminHotelCheck from "./hooks/useAdminHotelCheck";
import AddRoom from "./components/admin/addroom/AddRoom";
import ListRoom from "./components/admin/listRoom/ListRoom";

// --- Role-based redirect after login ---
function HomeRedirect() {
  const { user, loading } = useContext(AuthContext);
  const { loading: hotelLoading, hasHotel } = useAdminHotelCheck(user?.token);

  if (loading || (user?.role === "admin" && hotelLoading)) {
    return <div>Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "admin":
      return hasHotel ? <Navigate to="/admin" replace /> : <Navigate to="/admin/create-hotel" replace />;
    case "superadmin":
      return <Navigate to="/superadmin" replace />;
    case "user":
      return <Navigate to="/user" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

// --- Block login page for logged-in users ---
function LoginRedirect() {
  const { user, loading } = useContext(AuthContext);
  const { loading: hotelLoading, hasHotel } = useAdminHotelCheck(user?.token);

  if (loading || (user?.role === "admin" && hotelLoading)) {
    return <div>Loading...</div>;
  }

  if (!user) return <Login />;

  switch (user.role) {
    case "admin":
      return hasHotel ? <Navigate to="/admin" replace /> : <Navigate to="/admin/create-hotel" replace />;
    case "superadmin":
      return <Navigate to="/superadmin" replace />;
    case "user":
      return <Navigate to="/user" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginRedirect />} />

          {/* User */}
          <Route element={<ProtectedRoute roles={["user"]} />}>
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserHome />} />
              <Route path="/user/rooms" element={<Room />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/create-hotel" element={<CreateHotel />} />
              <Route path="/add-room" element={<AddRoom />} />
              <Route path="/list-rooms" element={<ListRoom />} />
            </Route>
          </Route>

          {/* SuperAdmin */}
          <Route element={<ProtectedRoute roles={["superadmin"]} />}>
            <Route path="/superadmin" element={<SuperAdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

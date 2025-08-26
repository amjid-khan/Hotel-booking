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
import User from "./components/admin/createUser/User";
import Setting from "./components/admin/setting/Setting";

// --- After login, redirect based on role + hotel status ---
function HomeRedirect() {
  const { user, loading } = useContext(AuthContext);
  const { loading: hotelLoading, hasHotel, hotels } = useAdminHotelCheck(user?.token);

  if (loading || (user?.role === "admin" && hotelLoading)) {
    return <div>Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "admin":
      if (hasHotel) {
        const firstHotelId = hotels?.[0]?._id;
        return firstHotelId ? <Navigate to={`/admin/hotel/${firstHotelId}`} replace /> : <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/admin/create-hotel" replace />;
      }
    case "superadmin":
      return <Navigate to="/superadmin" replace />;
    case "user":
      return <Navigate to="/user" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

// --- Block login page if user already logged in ---
function LoginRedirect() {
  const { user, loading } = useContext(AuthContext);
  const { loading: hotelLoading, hasHotel, hotels } = useAdminHotelCheck(user?.token);

  if (loading || (user?.role === "admin" && hotelLoading)) {
    return <div>Loading...</div>;
  }

  if (!user) return <Login />;

  switch (user.role) {
    case "admin":
      if (hasHotel) {
        const firstHotelId = hotels?.[0]?._id;
        return firstHotelId ? <Navigate to={`/admin/hotel/${firstHotelId}`} replace /> : <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/admin/create-hotel" replace />;
      }
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

          {/* Admin: create hotel page (manual access allowed) */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin/create-hotel" element={<CreateHotel />} />
          </Route>

          {/* Admin: main dashboard */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              {/* Route for specific hotel dashboard */}
              <Route path="/admin/hotel/:hotelId" element={<AdminDashboard />} />

              {/* Default admin dashboard (redirects handled in HomeRedirect) */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/add-room" element={<AddRoom />} />
              <Route path="/users" element={<User />} />
              <Route path="/settings" element={<Setting />} />
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
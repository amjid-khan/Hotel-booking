import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Login from "./components/auth/Login";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/layout/AdminLayout";
import CreateHotel from "./components/admin/createhotel/CreateHotel";
import useAdminHotelCheck from "./hooks/useAdminHotelCheck";
import AddRoom from "./components/admin/addroom/AddRoom";
import User from "./components/admin/createUser/User";
import Setting from "./components/admin/setting/Setting";
import Reports from "./components/admin/report/Report";
import SuperAdminLayout from "./components/layout/SuperAdminLayout";
import SuperAdminHotel from "./components/SuperAdmin/SuperAdminHotel";
import UserList from "./components/SuperAdmin/UserList";
import BookingOrders from "./components/admin/bookinorder/BookingOrders";
import RoomBookimg from "./components/admin/roombooking/RoomBookimg";
import MyBooking from "./components/admin/Mybooking/MyBooking";

// --- After login, redirect based on role + hotel status ---
function HomeRedirect() {
  const { user, loading } = useContext(AuthContext);
  const {
    loading: hotelLoading,
    hasHotel,
    hotels,
  } = useAdminHotelCheck(user?.token);

  if (loading || (user?.role === "admin" && hotelLoading)) {
    return <div>Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "admin":
      if (hasHotel) {
        const firstHotelId = hotels?.[0]?._id;
        return firstHotelId ? (
          <Navigate to={`/admin/hotel/${firstHotelId}`} replace />
        ) : (
          <Navigate to="/admin" replace />
        );
      } else {
        return <Navigate to="/admin/create-hotel" replace />;
      }
    case "superadmin":
      return <Navigate to="/superadmin" replace />;
    default:
      // ✅ Any dynamic role (staff, manager, receptionist, etc.) with hotelId
      return user.hotelId ? (
        <Navigate to={`/admin/hotel/${user.hotelId}`} replace />
      ) : (
        <Navigate to="/login" replace />
      );
  }
}

// Updated LoginRedirect function in App.jsx
function LoginRedirect() {
  const { user, loading } = useContext(AuthContext);
  const {
    loading: hotelLoading,
    hasHotel,
    hotels,
  } = useAdminHotelCheck(user?.token);

  if (loading || (user?.role === "admin" && hotelLoading)) {
    return <div>Loading...</div>;
  }

  if (!user) return <Login />;

  switch (user.role) {
    case "admin":
      if (user.hotelId) {
        return <Navigate to={`/admin/hotel/${user.hotelId}`} replace />;
      } else {
        if (hasHotel) {
          const firstHotelId = hotels?.[0]?._id;
          return firstHotelId ? (
            <Navigate to={`/admin/hotel/${firstHotelId}`} replace />
          ) : (
            <Navigate to="/admin" replace />
          );
        } else {
          return <Navigate to="/admin/create-hotel" replace />;
        }
      }
    case "superadmin":
      return <Navigate to="/superadmin" replace />;
    default:
      // ✅ Any dynamic role (staff, manager, etc.) redirect to their assigned hotel
      return user.hotelId ? (
        <Navigate to={`/admin/hotel/${user.hotelId}`} replace />
      ) : (
        <Navigate to="/login" replace />
      );
  }
}

export default function App() {
  return (
    <Routes>
      {/* Home / Redirect */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Login */}
      <Route path="/login" element={<LoginRedirect />} />

      {/* Admin Create Hotel (only admins allowed) */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin/create-hotel" element={<CreateHotel />} />
      </Route>

      {/* All Hotel Roles - Admin + Dynamic Roles (staff, manager, receptionist, etc.) */}
      <Route element={<ProtectedRoute allowHotelRoles={true} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/hotel/:hotelId" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/add-room" element={<AddRoom />} />
          <Route path="/users" element={<User />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/bookings" element={<BookingOrders />} />
          <Route path="/room-booking" element={<RoomBookimg />} />
          <Route path="/my-bookings" element={<MyBooking />} />
        </Route>
      </Route>

      {/* SuperAdmin Routes */}
      <Route element={<ProtectedRoute roles={["superadmin"]} />}>
        <Route element={<SuperAdminLayout />}>
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/Hotels" element={<SuperAdminHotel />} />
          <Route path="/superadminusers" element={<UserList />} />
        </Route>
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
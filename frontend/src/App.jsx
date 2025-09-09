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
    case "user":
      return <Navigate to="/userdashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

// --- Block login page if user already logged in ---
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
    case "user":
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}

export default function App() {
  return (
    <Routes>
      {/* Home / Redirect */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Login */}
      <Route path="/login" element={<LoginRedirect />} />

      {/* User Routes - Fixed Structure */}
      {/* <Route element={<ProtectedRoute roles={["user"]} />}>
        <Route element={<UserLayout />}>
          <Route path="/browserooms" element={<BrowseRoom />} />
          <Route path="/userdashboard" element={<UserDashbaord />} />
        </Route>
      </Route> */}

      {/* Admin Routes */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin/create-hotel" element={<CreateHotel />} />
      </Route>

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/hotel/:hotelId" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/add-room" element={<AddRoom />} />
          <Route path="/users" element={<User />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/bookings" element={<BookingOrders />} />
          <Route path="/room-booking" element={<RoomBookimg />} />
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
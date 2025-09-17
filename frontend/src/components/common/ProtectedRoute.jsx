import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

function ProtectedRoute({ roles, allowHotelRoles = false, permissions = [] }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Role check (if roles prop given)
  if (roles && roles.length > 0) {
    if (!roles.includes(user.role)) {
      return <Navigate to="/login" replace />;
    }
  }

  // ✅ Permission check (if permissions prop given)
  if (permissions && permissions.length > 0) {
    const userPermissions = user.permissions || [];
    const hasRequiredPermissions = permissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasRequiredPermissions) {
      return <div>🚫 Unauthorized - You don’t have permission</div>;
    }
  }

  // ✅ allowHotelRoles = admin + any user with hotelId (staff, manager, etc.)
  if (allowHotelRoles) {
    const isAdmin = user.role === "admin";
    const hasHotelRole = !!user.hotelId;

    if (!isAdmin && !hasHotelRole) {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;

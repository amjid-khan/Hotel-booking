// src/pages/AdminDashboard.jsx
import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import useAdminHotelCheck from "../hooks/useAdminHotelCheck";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { token, hotelName } = useContext(AuthContext);
  const { loading } = useAdminHotelCheck(token);

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2 className="dashboard-title">Dashboard</h2>
        <h2 className="hotel-name">{hotelName || "Unnamed Hotel"}</h2>
      </header>
      <div className="dashboard-content">
        {/* Future dashboard content */}
      </div>
    </div>
  );
};

export default AdminDashboard;


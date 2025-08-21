import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useAdminHotelCheck from "../hooks/useAdminHotelCheck";
import { FaPlus, FaChevronDown, FaHotel, FaBed, FaUsers, FaDollarSign, FaCalendarAlt } from "react-icons/fa";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { token, hotelName, rooms, users } = useContext(AuthContext);
  const { loading } = useAdminHotelCheck(token);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  // Example revenue & monthly bookings (you can replace with API data)
  const totalRevenue = 125000; // monthly revenue
  const monthlyBookings = rooms.length ? rooms.length * 5 : 0; // dummy calculation

  const handleCreateHotel = () => {
    setDropdownOpen(false);
    navigate("/admin/create-hotel");
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2 className="dashboard-title">Dashboard</h2>
        <div className="hotel-dropdown">
          <h2 className="hotel-name">
            <FaHotel style={{ marginRight: "8px", color: "#3498db" }} />
            {hotelName || "Unnamed Hotel"}
          </h2>
          <button
            className="hotel-dropdown-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FaChevronDown />
          </button>
          {dropdownOpen && (
            <div className="hotel-dropdown-menu">
              <button onClick={handleCreateHotel}>
                <FaPlus /> Create New Hotel
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-content">
        {/* Top Stats Cards */}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <FaBed className="card-icon" />
            <div>
              <h3>{rooms.length}</h3>
              <p>Rooms</p>
            </div>
          </div>

          <div className="dashboard-card">
            <FaUsers className="card-icon" />
            <div>
              <h3>{users.length}</h3>
              <p>Users</p>
            </div>
          </div>

          <div className="dashboard-card">
            <FaDollarSign className="card-icon" />
            <div>
              <h3>${totalRevenue.toLocaleString()}</h3>
              <p>Revenue</p>
            </div>
          </div>

          <div className="dashboard-card">
            <FaCalendarAlt className="card-icon" />
            <div>
              <h3>{monthlyBookings}</h3>
              <p>Monthly Bookings</p>
            </div>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="rooms-table-container">
          <h3>Rooms Overview</h3>
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Room Type</th>
                <th>Capacity</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.type}</td>
                  <td>{room.capacity}</td>
                  <td>${room.price}</td>
                  <td>{room.isAvailable ? "Available" : "Booked"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
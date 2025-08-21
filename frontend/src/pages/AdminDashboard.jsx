import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useAdminHotelCheck from "../hooks/useAdminHotelCheck";
import {
  FaPlus,
  FaChevronDown,
  FaHotel,
  FaBed,
  FaUsers,
  FaDollarSign,
  FaCalendarAlt,
  FaArrowUp,
  FaCog,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { token, hotelName, rooms } = useContext(AuthContext);
  const { loading } = useAdminHotelCheck(token);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  // Revenue and booking dummy data
  const revenueData = [
    { month: "Jan", revenue: 85000, bookings: 120 },
    { month: "Feb", revenue: 92000, bookings: 135 },
    { month: "Mar", revenue: 108000, bookings: 155 },
    { month: "Apr", revenue: 115000, bookings: 170 },
    { month: "May", revenue: 125000, bookings: 185 },
    { month: "Jun", revenue: 135000, bookings: 195 },
    { month: "Jul", revenue: 135000, bookings: 195 },
    { month: "Aug", revenue: 135000, bookings: 195 },
    { month: "Sep", revenue: 135000, bookings: 195 },
    { month: "Oct", revenue: 135000, bookings: 195 },
    { month: "Nov", revenue: 135000, bookings: 195 },
    { month: "Dec", revenue: 135000, bookings: 195 },
  ];

  const roomTypeData = [
    {
      name: "Single",
      value: rooms.filter((r) => r.type === "Single").length,
      color: "#3b82f6",
    },
    {
      name: "Double",
      value: rooms.filter((r) => r.type === "Double").length,
      color: "#10b981",
    },
    {
      name: "Suite",
      value: rooms.filter((r) => r.type === "Suite").length,
      color: "#f59e0b",
    },
    {
      name: "Deluxe",
      value: rooms.filter((r) => r.type === "Deluxe").length,
      color: "#ef4444",
    },
  ];

  // --- NEW dynamic calculations ---
  const availableCount = rooms.filter((r) => r.isAvailable).length;
  const occupiedCount = rooms.length - availableCount;

  const occupancyData = [
    { day: "Mon", occupied: occupiedCount, available: availableCount },
    { day: "Tue", occupied: occupiedCount, available: availableCount },
    { day: "Wed", occupied: occupiedCount, available: availableCount },
    { day: "Thu", occupied: occupiedCount, available: availableCount },
    { day: "Fri", occupied: occupiedCount, available: availableCount },
    { day: "Sat", occupied: occupiedCount, available: availableCount },
    { day: "Sun", occupied: occupiedCount, available: availableCount },
  ];

  const occupancyRate =
    rooms.length > 0 ? Math.round((occupiedCount / rooms.length) * 100) : 0;

  const availableRooms = availableCount;

  // Static placeholders for now (no backend yet)
  const totalRevenue = 0;
  const monthlyBookings = 0;

  const handleCreateHotel = () => {
    setDropdownOpen(false);
    navigate("/admin/create-hotel");
  };

  const handleManageHotel = () => {
    setDropdownOpen(false);
    navigate("/admin/manage-hotel");
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Dashboard Overview</h1>
          <p className="dashboard-subtitle">
            Welcome back, Admin – manage your hotel operations
          </p>
        </div>

        <div className="header-right">
          <div className="hotel-selector">
            <div className="current-hotel">
              <FaHotel className="hotel-icon" />
              <span className="hotel-name">{hotelName || "Select Hotel"}</span>
              <button
                className="dropdown-toggle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <FaChevronDown
                  className={`chevron ${dropdownOpen ? "open" : ""}`}
                />
              </button>
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={handleCreateHotel} className="dropdown-item">
                  <FaPlus /> Create New Hotel
                </button>
                <button onClick={handleManageHotel} className="dropdown-item">
                  <FaCog /> Manage Current Hotel
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-icon">
              <FaDollarSign />
            </div>
            <div className="stat-content">
              <h3>${totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
              <span className="stat-change positive">
                <FaArrowUp /> +0%
              </span>
            </div>
          </div>

          <div className="stat-card bookings">
            <div className="stat-icon">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <h3>{monthlyBookings}</h3>
              <p>Monthly Bookings</p>
              <span className="stat-change positive">
                <FaArrowUp /> +0%
              </span>
            </div>
          </div>

          <div className="stat-card rooms">
            <div className="stat-icon">
              <FaBed />
            </div>
            <div className="stat-content">
              <h3>{rooms.length}</h3>
              <p>Total Rooms</p>
              <span className="stat-detail">{availableRooms} Available</span>
            </div>
          </div>

          <div className="stat-card occupancy">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{occupancyRate}%</h3>
              <p>Occupancy Rate</p>
              <span className="stat-change positive">
                <FaArrowUp /> +0%
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Revenue Chart */}
          <div className="chart-card large">
            <div className="chart-header">
              <h3>Revenue Overview</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Room Types Distribution */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Room Types</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={roomTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {roomTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Occupancy */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Weekly Occupancy</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar
                    dataKey="occupied"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="available"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Trends */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Booking Trends</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

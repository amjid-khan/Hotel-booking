import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import useAdminHotelCheck from "../hooks/useAdminHotelCheck";
import {
  FaBed, FaUsers, FaDollarSign, FaCalendarAlt, FaArrowUp,
  FaUserCheck, FaUserTimes
} from "react-icons/fa";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { token, hotelName, rooms = [], users = [] } = useContext(AuthContext);
  const { loading } = useAdminHotelCheck(token);

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  // ----- Dynamic calculations with safe defaults
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.isAvailable).length;
  const occupiedRooms = totalRooms - availableRooms;
  const occupancyRate = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const inactiveUsers = totalUsers - activeUsers;

  // Revenue & bookings (default to 0 if rooms are empty)
  const totalRevenue = 0
  const monthlyBookings = rooms.reduce((sum, r) => sum + (r.bookingsCount || 0), 0) || 0;

  // Revenue data for charts (default values 0 if no rooms)
  const revenueData = [
    { month: "Jan", revenue: totalRevenue ? totalRevenue / 6 : 0, bookings: monthlyBookings ? monthlyBookings / 6 : 0 },
    { month: "Feb", revenue: totalRevenue ? totalRevenue / 6 : 0, bookings: monthlyBookings ? monthlyBookings / 6 : 0 },
    { month: "Mar", revenue: totalRevenue ? totalRevenue / 6 : 0, bookings: monthlyBookings ? monthlyBookings / 6 : 0 },
    { month: "Apr", revenue: totalRevenue ? totalRevenue / 6 : 0, bookings: monthlyBookings ? monthlyBookings / 6 : 0 },
    { month: "May", revenue: totalRevenue ? totalRevenue / 6 : 0, bookings: monthlyBookings ? monthlyBookings / 6 : 0 },
    { month: "Jun", revenue: totalRevenue ? totalRevenue / 6 : 0, bookings: monthlyBookings ? monthlyBookings / 6 : 0 },
  ];

  // Room type distribution with safe defaults
  const roomTypeData = [
    { name: "Single", value: rooms.filter(r => r.type === "Single").length, color: "#3b82f6" },
    { name: "Double", value: rooms.filter(r => r.type === "Double").length, color: "#10b981" },
    { name: "Suite", value: rooms.filter(r => r.type === "Suite").length, color: "#f59e0b" },
    { name: "Deluxe", value: rooms.filter(r => r.type === "Deluxe").length, color: "#ef4444" },
  ].filter(r => r.value > 0); // remove types with 0

  // Weekly occupancy (dummy example)
  const occupancyData = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => ({
    day,
    occupied: occupiedRooms,
    available: availableRooms,
  }));

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
          <div className="current-hotel">
            <span className="hotel-name">{hotelName || "No Hotel Linked"}</span>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-icon"><FaDollarSign size={24} /></div>
            <div className="stat-content">
              <h3>${totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
              <span className="stat-change positive"><FaArrowUp /> +0%</span>
            </div>
          </div>

          <div className="stat-card bookings">
            <div className="stat-icon"><FaCalendarAlt size={24} /></div>
            <div className="stat-content">
              <h3>{monthlyBookings}</h3>
              <p>Monthly Bookings</p>
              <span className="stat-change positive"><FaArrowUp /> +0%</span>
            </div>
          </div>

          <div className="stat-card rooms">
            <div className="stat-icon"><FaBed size={24} /></div>
            <div className="stat-content">
              <h3>{totalRooms}</h3>
              <p>Total Rooms</p>
              <span className="stat-detail">{availableRooms} Available</span>
            </div>
          </div>

          <div className="stat-card occupancy">
            <div className="stat-icon"><FaUsers size={24} /></div>
            <div className="stat-content">
              <h3>{occupancyRate}%</h3>
              <p>Occupancy Rate</p>
              <span className="stat-change positive"><FaArrowUp /> +0%</span>
            </div>
          </div>

          <div className="stat-card users">
            <div className="stat-icon"><FaUsers size={24} /></div>
            <div className="stat-content">
              <h3>{totalUsers}</h3>
              <p>Total Users</p>
              <span className="stat-detail">
                <FaUserCheck /> {activeUsers} Active &nbsp;|&nbsp;
                <FaUserTimes /> {inactiveUsers} Inactive
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-grid">
          {/* Revenue Chart */}
          <div className="chart-card large">
            <div className="chart-header"><h3>Revenue Overview</h3></div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="month" stroke="#64748b"/>
                  <YAxis stroke="#64748b"/>
                  <Tooltip/>
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Room Types Pie Chart */}
          <div className="chart-card">
            <div className="chart-header"><h3>Room Types</h3></div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={roomTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {roomTypeData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Occupancy */}
          <div className="chart-card">
            <div className="chart-header"><h3>Weekly Occupancy</h3></div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="day" stroke="#64748b"/>
                  <YAxis stroke="#64748b"/>
                  <Tooltip/>
                  <Bar dataKey="occupied" fill="#10b981" radius={[4,4,0,0]}/>
                  <Bar dataKey="available" fill="#f59e0b" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Trends */}
          <div className="chart-card">
            <div className="chart-header"><h3>Booking Trends</h3></div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="month" stroke="#64748b"/>
                  <YAxis stroke="#64748b"/>
                  <Tooltip/>
                  <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={3} dot={{ fill:"#8b5cf6", strokeWidth:2, r:4 }}/>
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
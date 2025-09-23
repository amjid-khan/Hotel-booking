import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  FaHotel,
  FaUsers,
  FaCalendarAlt,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaMapMarkerAlt,
  FaStar,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";

const SuperAdminDashboard = () => {
  const { user, allHotels, allUsers, allBookings } = useContext(AuthContext);
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");

  // ----- Use real data from context -----
  const hotels = allHotels || [];
  const users = allUsers || [];
  const bookings = allBookings || [];

  // ----- Derived stats -----
  const totalHotels = hotels.length;
  // Filter out superadmins
  const filteredUsers = users.filter((u) => u.role !== "superadmin");
  const totalUsers = filteredUsers.length;

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);

  const dashboardStats = [
    {
      title: "Total Hotels",
      value: totalHotels,
      change: "+0%",
      trend: "up",
      icon: <FaHotel className="w-6 h-6" />,
      color: "blue",
      description: "Active properties",
    },
    {
      title: "Total Users",
      value: totalUsers,
      change: "+0%",
      trend: "up",
      icon: <FaUsers className="w-6 h-6" />,
      color: "green",
      description: "Registered customers",
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      change: "+0%",
      trend: "up",
      icon: <FaCalendarAlt className="w-6 h-6" />,
      color: "purple",
      description: "This month",
    },
    {
      title: "Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      change: "+0%",
      trend: "up",
      icon: <FaDollarSign className="w-6 h-6" />,
      color: "orange",
      description: "Total earnings",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: "bg-blue-100", text: "text-blue-600" },
      green: { bg: "bg-green-100", text: "text-green-600" },
      purple: { bg: "bg-purple-100", text: "text-purple-600" },
      orange: { bg: "bg-orange-100", text: "text-orange-600" },
    };
    return colors[color] || colors.blue;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "user":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "manager":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "superadmin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "manager":
        return "Manager";
      case "user":
        return "User";
      default:
        return role || "N/A";
    }
  };

  const formatDate = (value) => {
    const raw = value || null;
    if (!raw) return "N/A";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50/30 md:ml-64">
      <div className="h-16 md:hidden"></div>
      <div className="p-4 md:p-6 lg:p-8">
        {/* ---- Header ---- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Super Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back,{" "}
              <span className="font-medium text-purple-600">
                {user?.full_name || user?.name || "Super Administrator"}
              </span>
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
        </div>

        {/* ---- Stats Grid ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {dashboardStats.map((stat, index) => {
            const color = getColorClasses(stat.color);
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${color.bg} flex items-center justify-center`}
                  >
                    <div className={color.text}>{stat.icon}</div>
                  </div>
                  <div
                    className={`flex items-center text-sm font-medium ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <FaArrowUp className="w-3 h-3 mr-1" />
                    ) : (
                      <FaArrowDown className="w-3 h-3 mr-1" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mb-1">
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{stat.title}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---- All Hotels ---- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Hotels</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage all registered hotels in the system
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {hotels.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      <FaHotel className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No hotels registered yet</p>
                    </td>
                  </tr>
                ) : (
                  hotels.map((hotel) => (
                    <tr key={hotel.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{hotel.name}</div>
                        <div className="text-sm text-gray-500">ID: {hotel.id}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="w-3 h-3 mr-1 text-gray-400" />
                          {hotel.location || hotel.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center">
                          <FaPhone className="w-3 h-3 mr-1 text-gray-400" />
                          {hotel.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center">
                          <FaEnvelope className="w-3 h-3 mr-1 text-gray-400" />
                          {hotel.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(hotel.createdAt || hotel.created_at)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor("Active")}`}>
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---- All Users ---- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage all registered users across all hotels
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      <FaUsers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No users registered yet</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{user.full_name || user.name}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-600">
                          <FaEnvelope className="w-3 h-3 mr-1 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.hotelId}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(user.createdAt || user.created_at)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor("Active")}`}>
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

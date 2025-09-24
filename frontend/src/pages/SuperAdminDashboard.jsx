import React, { useContext, useState, useMemo } from "react";
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
  FaChartLine,
  FaChartBar,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

const SuperAdminDashboard = () => {
  const { user, allHotels, allUsers, allBookings } = useContext(AuthContext);
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [userFilter, setUserFilter] = useState("all");
  const [hotelSearchTerm, setHotelSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");

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

  // Chart data preparation with real data
  const chartData = useMemo(() => {
    // Revenue by month (real data from bookings)
    const revenueByMonth = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyRevenue = months.map(month => ({ month, revenue: 0 }));
      
      bookings.forEach(booking => {
        if (booking.createdAt || booking.created_at) {
          const date = new Date(booking.createdAt || booking.created_at);
          const monthIndex = date.getMonth();
          monthlyRevenue[monthIndex].revenue += parseFloat(booking.totalAmount || 0);
        }
      });
      
      // Return last 6 months with data
      return monthlyRevenue.slice(-6);
    };

    // Hotel performance (real data)
    const hotelPerformance = hotels.map((hotel) => {
      const hotelBookings = bookings.filter(b => b.hotelId === hotel.id);
      const hotelRevenue = hotelBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
      
      return {
        name: hotel.name?.length > 15 ? hotel.name.substring(0, 15) + '...' : hotel.name || `Hotel ${hotel.id}`,
        bookings: hotelBookings.length,
        revenue: hotelRevenue,
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // User roles distribution (real data)
    const roleDistribution = [
      { 
        name: 'Users', 
        value: users.filter(u => u.role === 'user').length, 
        color: '#3B82F6' 
      },
      { 
        name: 'Admins', 
        value: users.filter(u => u.role === 'admin').length, 
        color: '#8B5CF6' 
      },
      { 
        name: 'Managers', 
        value: users.filter(u => u.role === 'manager').length, 
        color: '#F59E0B' 
      },
    ].filter(item => item.value > 0);

    // Booking trends (real data from last 4 weeks)
    const bookingTrends = () => {
      const weeks = [];
      const now = new Date();
      
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7 + 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt || booking.created_at);
          return bookingDate >= weekStart && bookingDate <= weekEnd;
        });
        
        weeks.push({
          date: `Week ${4 - i}`,
          bookings: weekBookings.length,
        });
      }
      
      return weeks;
    };

    return {
      revenueByMonth: revenueByMonth(),
      hotelPerformance,
      roleDistribution,
      bookingTrends: bookingTrends(),
    };
  }, [hotels, users, bookings]);

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
      description: "All time",
    },
    {
      title: "Revenue",
      value: `PKR ${totalRevenue.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+0%",
      trend: "up",
      icon: <FaDollarSign className="w-6 h-6" />,
      color: "orange",
      description: "Total earnings",
    },
  ];

  // Filter functions
  const filteredHotels = hotels.filter(hotel =>
    hotel.name?.toLowerCase().includes(hotelSearchTerm.toLowerCase()) ||
    hotel.location?.toLowerCase().includes(hotelSearchTerm.toLowerCase()) ||
    hotel.email?.toLowerCase().includes(hotelSearchTerm.toLowerCase())
  );

  const filteredAndSearchedUsers = filteredUsers.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase());
    
    const matchesFilter = userFilter === "all" || user.role === userFilter;
    
    return matchesSearch && matchesFilter;
  });

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

  const formatCurrency = (value) => {
    return `PKR ${value?.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`;
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
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${color.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
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

        {/* ---- Charts Section ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
                <p className="text-sm text-gray-500">Monthly revenue overview (Real Data)</p>
              </div>
              <FaChartLine className="text-green-500 w-5 h-5" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.revenueByMonth}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickFormatter={(value) => `PKR ${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* User Role Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
                <p className="text-sm text-gray-500">Users by role (Real Data)</p>
              </div>
              <FaUsers className="text-purple-500 w-5 h-5" />
            </div>
            {chartData.roleDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <FaUsers className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No user data available</p>
                </div>
              </div>
            )}
            <div className="flex justify-center space-x-6 mt-4">
              {chartData.roleDistribution.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Hotel Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hotel Performance</h3>
                <p className="text-sm text-gray-500">Top performing hotels (Real Data)</p>
              </div>
              <FaChartBar className="text-orange-500 w-5 h-5" />
            </div>
            {chartData.hotelPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.hotelPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6B7280" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#6B7280" 
                    fontSize={12}
                    tickFormatter={(value) => `PKR ${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Revenue' : 'Bookings'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <FaChartBar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No hotel performance data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Booking Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Booking Trends</h3>
                <p className="text-sm text-gray-500">Weekly booking overview (Real Data)</p>
              </div>
              <FaCalendarAlt className="text-blue-500 w-5 h-5" />
            </div>
            {chartData.bookingTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.bookingTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [value, 'Bookings']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: '#8B5CF6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No booking trend data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---- Modern Hotels Table ---- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">All Hotels</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage all registered hotels in the system
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search hotels..."
                    value={hotelSearchTerm}
                    onChange={(e) => setHotelSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                  {filteredHotels.length} of {totalHotels} hotels
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHotels.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      <FaHotel className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">
                        {hotelSearchTerm ? "No hotels match your search" : "No hotels registered yet"}
                      </p>
                      <p className="text-sm">
                        {hotelSearchTerm ? "Try adjusting your search terms" : "Hotels will appear here once they register"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredHotels.map((hotel) => {
                    const hotelBookings = bookings.filter(b => b.hotelId === hotel.id);
                    const hotelRevenue = hotelBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
                    
                    return (
                      <tr key={hotel.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <FaHotel className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{hotel.name || 'Unnamed Hotel'}</div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                                <span className="truncate max-w-[200px]">{hotel.location || hotel.address || 'Location not specified'}</span>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">ID: {hotel.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <FaPhone className="w-3 h-3 mr-2 text-gray-400" />
                              {hotel.phone || 'Not provided'}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <FaEnvelope className="w-3 h-3 mr-2 text-gray-400" />
                              <span className="truncate max-w-[180px]">{hotel.email || 'Not provided'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">{hotelBookings.length} bookings</div>
                            <div className="text-sm text-gray-600">{formatCurrency(hotelRevenue)}</div>
                            <div className="flex items-center">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar key={i} className="w-3 h-3" />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 ml-2">5.0</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium border rounded-full ${getStatusColor("Active")}`}>
                            Active
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            Joined {formatDate(hotel.createdAt || hotel.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200">
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200">
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---- Modern Users Table ---- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage all registered users across all hotels
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins</option>
                    <option value="manager">Managers</option>
                    <option value="user">Users</option>
                  </select>
                </div>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                  {filteredAndSearchedUsers.length} of {totalUsers} users
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact & Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSearchedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      <FaUsers className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">
                        {userSearchTerm || userFilter !== "all" ? "No users match your criteria" : "No users registered yet"}
                      </p>
                      <p className="text-sm">
                        {userSearchTerm || userFilter !== "all" ? "Try adjusting your search or filter" : "Users will appear here once they register"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAndSearchedUsers.map((user) => {
                    const userBookings = bookings.filter(b => b.userId === user.id);
                    const userHotel = hotels.find(h => h.id === user.hotelId);
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                              user.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                              user.role === 'manager' ? 'bg-gradient-to-br from-orange-500 to-orange-700' :
                              'bg-gradient-to-br from-blue-500 to-blue-700'
                            }`}>
                              {(user.full_name || user.name || user.email)?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {user.full_name || user.name || 'Unnamed User'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user.id}
                              </div>
                              {user.hotelId && (
                                <div className="text-xs text-purple-600 mt-1">
                                  {userHotel?.name || `Hotel ID: ${user.hotelId}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <FaEnvelope className="w-3 h-3 mr-2 text-gray-400" />
                              <span className="truncate max-w-[180px]">{user.email}</span>
                            </div>
                            <span className={`inline-flex px-3 py-1 text-xs font-medium border rounded-full ${getStatusColor(user.role)}`}>
                              {getRoleDisplayName(user.role)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {userBookings.length} bookings
                            </div>
                            <div className="text-sm text-gray-600">
                              {userBookings.length > 0 ? (
                                `Last active: ${formatDate(userBookings[userBookings.length - 1]?.createdAt)}`
                              ) : (
                                'No bookings yet'
                              )}
                            </div>
                            {user.role !== 'user' && (
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                <span className="text-xs text-gray-500">Staff Member</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium border rounded-full ${getStatusColor("Active")}`}>
                            Active
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            Joined {formatDate(user.createdAt || user.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                              title="View Details"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                              title="Edit User"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                              title="Delete User"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
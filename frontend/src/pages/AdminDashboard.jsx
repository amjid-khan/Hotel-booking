import React, { useContext, useMemo, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  FaBed, FaUsers, FaCalendarAlt, FaArrowUp, FaArrowDown,
  FaUserCheck, FaUserTimes, FaHotel, FaChartLine, FaPercentage, FaClock,
  FaCheckCircle, FaTimesCircle, FaKey, FaCog
} from "react-icons/fa";
import { MdCurrencyRupee } from "react-icons/md";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar
} from "recharts";

const AdminDashboard = () => {
  const { token, hotelName, rooms = [], users = [], hotelBookings = [] } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  // Simple loading state management
  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [token, rooms, users, hotelBookings]);

  // Calculate real metrics from actual booking data
  const metrics = useMemo(() => {
    const totalRooms = rooms.length;
    
    // Get current date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter active bookings (confirmed and within current dates)
    const activeBookings = hotelBookings.filter(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      
      return (
        booking.status === 'confirmed' &&
        checkIn <= today &&
        checkOut > today
      );
    });

    const occupiedRooms = activeBookings.length;
    const availableRooms = totalRooms - occupiedRooms;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === "active").length;
    const inactiveUsers = totalUsers - activeUsers;

    // Calculate actual revenue from active bookings
    const totalRevenue = activeBookings.reduce((sum, booking) => {
      return sum + (Number(booking.totalAmount) || 0);
    }, 0);

    // Calculate average booking amount
    const avgBookingAmount = activeBookings.length > 0 
      ? Math.round(totalRevenue / activeBookings.length) 
      : 0;

    // Total bookings count
    const totalBookings = hotelBookings.length;
    const confirmedBookings = hotelBookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = hotelBookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = hotelBookings.filter(b => b.status === 'cancelled').length;

    return {
      totalRooms,
      availableRooms,
      occupiedRooms,
      occupancyRate,
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalRevenue,
      avgBookingAmount,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      activeBookings: activeBookings.length
    };
  }, [rooms, users, hotelBookings]);

  // Generate monthly data based on actual bookings
  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      // Filter bookings for each month
      const monthBookings = hotelBookings.filter(booking => {
        const bookingDate = new Date(booking.checkIn);
        return (
          bookingDate.getFullYear() === currentYear &&
          bookingDate.getMonth() === index &&
          booking.status === 'confirmed'
        );
      });

      // Calculate monthly revenue
      const monthlyRevenue = monthBookings.reduce((sum, booking) => {
        return sum + (Number(booking.totalAmount) || 0);
      }, 0);

      // Calculate monthly occupancy based on bookings
      const monthlyOccupancy = metrics.totalRooms > 0 
        ? Math.min(100, Math.round((monthBookings.length / metrics.totalRooms) * 100))
        : 0;
      
      return {
        month,
        occupancy: monthlyOccupancy,
        revenue: monthlyRevenue,
        bookings: monthBookings.length
      };
    });
  }, [hotelBookings, metrics.totalRooms]);

  // Real room type distribution from bookings
  const roomTypeData = useMemo(() => {
    const types = {};
    
    // Count room types from active bookings
    const activeBookings = hotelBookings.filter(booking => {
      const today = new Date();
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return (
        booking.status === 'confirmed' &&
        checkIn <= today &&
        checkOut > today
      );
    });

    activeBookings.forEach(booking => {
      if (booking.Room && booking.Room.type) {
        const type = booking.Room.type;
        types[type] = (types[type] || 0) + 1;
      }
    });
    
    // If no active bookings, use room inventory
    if (Object.keys(types).length === 0) {
      rooms.forEach(room => {
        const type = room.type || 'Standard';
        types[type] = (types[type] || 0) + 1;
      });
    }
    
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return Object.entries(types).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  }, [hotelBookings, rooms]);

  // Weekly occupancy based on actual bookings
  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    
    return days.map((day, index) => {
      // Get date for each day of current week
      const dayDate = new Date(today);
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculate offset to Monday
      dayDate.setDate(today.getDate() + mondayOffset + index);
      
      // Count bookings for this specific day
      const dayBookings = hotelBookings.filter(booking => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        
        return (
          booking.status === 'confirmed' &&
          checkIn <= dayDate &&
          checkOut > dayDate
        );
      });
      
      const occupied = dayBookings.length;
      const available = Math.max(0, metrics.totalRooms - occupied);
      
      return {
        day,
        occupied,
        available
      };
    });
  }, [hotelBookings, metrics.totalRooms]);

  if (loading) {
    return (
      <div className="md:pl-64 pt-16 md:pt-0 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">Loading Dashboard</h3>
            <p className="text-gray-600">Fetching hotel data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:pl-64 pt-16 md:pt-0 min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaHotel className="text-white text-lg md:text-xl" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Hotel Management Dashboard</h1>
                <p className="text-gray-600 mt-1 flex items-center text-sm md:text-base">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {hotelName || "Hotel Dashboard"} - Admin Portal
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 md:px-6 py-3 rounded-xl border border-blue-100">
              <div className="flex items-center space-x-3">
                <FaHotel className="text-blue-600 text-lg" />
                <div>
                  <p className="text-sm font-medium text-blue-800">{hotelName || "My Hotel"}</p>
                  <p className="text-xs text-blue-600">Currently Managing</p>
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500 hidden md:block">
              <p>Last Updated</p>
              <p className="font-medium text-gray-700">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8">
        {/* Main KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Total Revenue from Bookings */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <MdCurrencyRupee className="text-green-600 text-sm md:text-base" />
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-gray-600">Booking Revenue</p>
                </div>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
                  PKR {metrics.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center">
                  {metrics.activeBookings > 0 ? (
                    <>
                      <FaArrowUp className="text-green-500 text-xs md:text-sm mr-2" />
                      <span className="text-green-600 text-xs md:text-sm font-medium">{metrics.activeBookings} active bookings</span>
                    </>
                  ) : (
                    <span className="text-gray-500 text-xs md:text-sm">No active bookings</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Room Occupancy from Bookings */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaPercentage className="text-blue-600 text-sm md:text-base" />
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-gray-600">Occupancy Rate</p>
                </div>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mb-2">{metrics.occupancyRate}%</p>
                <div className="flex items-center">
                  {metrics.occupancyRate >= 75 ? (
                    <>
                      <FaArrowUp className="text-green-500 text-xs md:text-sm mr-2" />
                      <span className="text-green-600 text-xs md:text-sm font-medium">Excellent rate</span>
                    </>
                  ) : metrics.occupancyRate >= 50 ? (
                    <span className="text-blue-600 text-xs md:text-sm font-medium">Good performance</span>
                  ) : (
                    <>
                      <FaArrowDown className="text-orange-500 text-xs md:text-sm mr-2" />
                      <span className="text-orange-600 text-xs md:text-sm font-medium">Room for growth</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Room Status */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaBed className="text-purple-600 text-sm md:text-base" />
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-gray-600">Room Status</p>
                </div>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mb-2">{metrics.totalRooms}</p>
                <div className="flex items-center space-x-2 md:space-x-4">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-green-500 text-xs mr-1" />
                    <span className="text-green-600 text-xs md:text-sm font-medium">{metrics.availableRooms}</span>
                  </div>
                  <div className="flex items-center">
                    <FaTimesCircle className="text-red-500 text-xs mr-1" />
                    <span className="text-red-600 text-xs md:text-sm font-medium">{metrics.occupiedRooms}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Statistics */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FaCalendarAlt className="text-indigo-600 text-sm md:text-base" />
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-gray-600">Total Bookings</p>
                </div>
                <p className="text-xl md:text-3xl font-bold text-gray-900 mb-2">{metrics.totalBookings}</p>
                <div className="flex items-center space-x-2 md:space-x-4">
                  <div className="flex items-center">
                    <FaUserCheck className="text-green-500 text-xs mr-1" />
                    <span className="text-green-600 text-xs md:text-sm font-medium">{metrics.confirmedBookings}</span>
                  </div>
                  {metrics.pendingBookings > 0 && (
                    <div className="flex items-center">
                      <FaClock className="text-orange-400 text-xs mr-1" />
                      <span className="text-orange-500 text-xs md:text-sm">{metrics.pendingBookings}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Performance Summary */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg font-bold text-gray-900">Booking Overview</h3>
              <FaChartLine className="text-gray-400" />
            </div>
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-700 font-medium text-sm">Average Booking</span>
                <span className="font-bold text-gray-900 text-sm">PKR {metrics.avgBookingAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="text-gray-700 font-medium text-sm">Revenue per Room</span>
                <span className="font-bold text-blue-600 text-sm">
                  PKR {metrics.totalRooms > 0 ? Math.round(metrics.totalRevenue / metrics.totalRooms).toLocaleString() : 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-gray-700 font-medium text-sm">Active Bookings</span>
                <span className="font-bold text-green-600 text-sm">
                  {metrics.activeBookings} current
                </span>
              </div>
            </div>
          </div>

          {/* Occupancy Gauge */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg font-bold text-gray-900">Occupancy Status</h3>
              <FaKey className="text-gray-400" />
            </div>
            <div className="h-24 md:h-32 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart data={[{ value: metrics.occupancyRate }]} startAngle={180} endAngle={0}>
                  <RadialBar dataKey="value" cornerRadius={10} fill="#3b82f6" />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xl md:text-2xl font-bold fill-gray-900">
                    {metrics.occupancyRate}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <p className="text-xs md:text-sm text-gray-600">Based on confirmed bookings</p>
            </div>
          </div>

          {/* Booking Status */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg font-bold text-gray-900">Booking Status</h3>
              <FaCog className="text-gray-400" />
            </div>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 text-sm">Confirmed</span>
                </div>
                <span className="font-bold text-green-600 text-sm">{metrics.confirmedBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 text-sm">Pending</span>
                </div>
                <span className="font-bold text-orange-600 text-sm">{metrics.pendingBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 text-sm">Cancelled</span>
                </div>
                <span className="font-bold text-red-600 text-sm">{metrics.cancelledBookings}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Revenue Trend from Bookings */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">Monthly Booking Performance</h3>
              <div className="flex flex-wrap items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-xs md:text-sm text-gray-600">Revenue (PKR)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs md:text-sm text-gray-600">Bookings Count</span>
                </div>
              </div>
            </div>
            <div className="h-60 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10}/>
                  <YAxis stroke="#64748b" fontSize={10}/>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [
                      name === 'revenue' ? `PKR ${value.toLocaleString()}` : `${value} bookings`,
                      name === 'revenue' ? 'Revenue' : 'Bookings'
                    ]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#colorRevenue)" />
                  <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Room Types from Bookings */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Booked Room Types</h3>
            {roomTypeData.length > 0 ? (
              <div className="h-48 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={roomTypeData} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={60} 
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {roomTypeData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Bookings']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 md:h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FaBed className="text-2xl md:text-4xl mb-4 mx-auto" />
                  <p className="text-sm">No booking data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Weekly Occupancy from Bookings */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Weekly Occupancy (Bookings)</h3>
            <div className="h-48 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10}/>
                  <YAxis stroke="#64748b" fontSize={10}/>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="occupied" fill="#ef4444" radius={[4,4,0,0]} name="Booked"/>
                  <Bar dataKey="available" fill="#10b981" radius={[4,4,0,0]} name="Available"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">Booking Activity Summary</h3>
            <div className="text-sm text-gray-500">
              Real booking data
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Bookings</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">{metrics.totalBookings}</p>
                </div>
                <FaCalendarAlt className="text-blue-500 text-xl md:text-2xl" />
              </div>
              <p className="text-xs text-blue-600 mt-2">All time bookings</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Booking Revenue</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">PKR {(metrics.totalRevenue / 1000).toFixed(0)}K</p>
                </div>
                <MdCurrencyRupee className="text-green-500 text-xl md:text-2xl" />
              </div>
              <p className="text-xs text-green-600 mt-2">From confirmed bookings</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Active Bookings</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-600">{metrics.activeBookings}</p>
                </div>
                <FaBed className="text-purple-500 text-xl md:text-2xl" />
              </div>
              <p className="text-xs text-purple-600 mt-2">Currently occupied</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
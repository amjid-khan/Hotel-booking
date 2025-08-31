import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaHotel, FaUsers, FaCalendarAlt, FaDollarSign, FaArrowUp, FaArrowDown,
  FaMapMarkerAlt, FaStar 
} from 'react-icons/fa';

const SuperAdminDashboard = () => {
  const { user } = useContext(AuthContext);

  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  // ----- Dummy Data -----
  const hotels = [
    { id: 1, name: 'Hotel Sunrise', location: 'New York', rooms: 120, rating: 4.5, status: 'Active', revenue: '$12,000' },
    { id: 2, name: 'Grand Palace', location: 'Los Angeles', rooms: 90, rating: 4.2, status: 'Pending', revenue: '$8,400' },
    { id: 3, name: 'Sea View Resort', location: 'Miami', rooms: 75, rating: 4.7, status: 'Confirmed', revenue: '$10,200' },
  ];

  const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'David Johnson' },
  ];

  const bookings = [
    { id: 1, hotelName: 'Hotel Sunrise', customerName: 'John Doe', checkIn: '2025-08-01', checkOut: '2025-08-05', amount: 1200, status: 'Confirmed' },
    { id: 2, hotelName: 'Grand Palace', customerName: 'Jane Smith', checkIn: '2025-08-10', checkOut: '2025-08-12', amount: 800, status: 'Pending' },
    { id: 3, hotelName: 'Sea View Resort', customerName: 'David Johnson', checkIn: '2025-08-15', checkOut: '2025-08-20', amount: 1500, status: 'Active' },
  ];

  // ----- Derived stats -----
  const totalHotels = hotels.length;
  const totalUsers = users.length;
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);

  const dashboardStats = [
    {
      title: 'Total Hotels',
      value: totalHotels,
      change: '+0%',
      trend: 'up',
      icon: <FaHotel className="w-6 h-6" />,
      color: 'blue',
      description: 'Active properties'
    },
    {
      title: 'Total Users',
      value: totalUsers,
      change: '+0%',
      trend: 'up',
      icon: <FaUsers className="w-6 h-6" />,
      color: 'green',
      description: 'Registered customers'
    },
    {
      title: 'Total Bookings',
      value: totalBookings,
      change: '+0%',
      trend: 'up',
      icon: <FaCalendarAlt className="w-6 h-6" />,
      color: 'purple',
      description: 'This month'
    },
    {
      title: 'Revenue',
      value: `$${totalRevenue}`,
      change: '+0%',
      trend: 'up',
      icon: <FaDollarSign className="w-6 h-6" />,
      color: 'orange',
      description: 'Total earnings'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600' }
    };
    return colors[color] || colors.blue;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
              Welcome back, <span className="font-medium text-purple-600">{user?.full_name || user?.name || 'Super Administrator'}</span>
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
                  <div className={`w-12 h-12 rounded-lg ${color.bg} flex items-center justify-center`}>
                    <div className={color.text}>{stat.icon}</div>
                  </div>
                  <div className={`flex items-center text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' 
                      ? <FaArrowUp className="w-3 h-3 mr-1" /> 
                      : <FaArrowDown className="w-3 h-3 mr-1" />}
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

        {/* ---- Recent Hotels ---- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Hotels</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {hotels.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4 text-gray-500">No hotels available</td></tr>
                ) : hotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{hotel.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="w-3 h-3 mr-1" />{hotel.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{hotel.rooms}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaStar className="w-4 h-4 text-yellow-400 mr-1" />{hotel.rating}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(hotel.status)}`}>
                        {hotel.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{hotel.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---- Recent Bookings ---- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4 text-gray-500">No bookings available</td></tr>
                ) : bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{b.hotelName}</td>
                    <td className="px-6 py-4 text-gray-900">{b.customerName}</td>
                    <td className="px-6 py-4 text-gray-600">{b.checkIn}</td>
                    <td className="px-6 py-4 text-gray-600">{b.checkOut}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">${b.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminDashboard;

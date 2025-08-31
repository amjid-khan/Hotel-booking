import React, { useContext, useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  Users, 
  Bed, 
  DollarSign,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../../contexts/AuthContext';

const Reports = () => {
  const { hotelName, selectedHotelId, rooms, users, token } = useContext(AuthContext);
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('this-month');
  const [loading, setLoading] = useState(false);
  const [bookingsData, setBookingsData] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [guestData, setGuestData] = useState([]);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Fetch real booking data
  useEffect(() => {
    if (selectedHotelId && token) {
      fetchBookingsData();
      fetchRevenueData();
      fetchGuestData();
    }
  }, [selectedHotelId, token, dateRange]);

  const fetchBookingsData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/bookings?hotelId=${selectedHotelId}&range=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookingsData(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookingsData([]);
    }
  };

  const fetchRevenueData = async () => {
    try {
      // const response = await axios.get(`${BASE_URL}/api/analytics/revenue?hotelId=${selectedHotelId}&range=${dateRange}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      setRevenueData(response.data);
    } catch (error) {
      console.error('Error fetching revenue:', error);
      setRevenueData(null);
    }
  };

  const fetchGuestData = async () => {
    try {
      // const response = await axios.get(`${BASE_URL}/api/guests?hotelId=${selectedHotelId}&range=${dateRange}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      setGuestData(response.data.guests || []);
    } catch (error) {
      console.error('Error fetching guests:', error);
      setGuestData([]);
    }
  };

  const reportTypes = [
    {
      id: 'overview',
      title: 'Hotel Overview',
      icon: BarChart3,
      description: 'General hotel performance metrics'
    },
    {
      id: 'occupancy',
      title: 'Occupancy Report',
      icon: Bed,
      description: 'Room occupancy and availability'
    },
    {
      id: 'revenue',
      title: 'Revenue Report',
      icon: DollarSign,
      description: 'Financial performance analysis'
    },
    {
      id: 'guests',
      title: 'Guest Analytics',
      icon: Users,
      description: 'Guest demographics and behavior'
    },
    {
      id: 'performance',
      title: 'Staff Performance',
      icon: Activity,
      description: 'Employee productivity metrics'
    }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Calculate real occupancy rate
  const calculateOccupancyRate = () => {
    if (!rooms.length) return 0;
    const occupiedRooms = bookingsData.filter(booking => 
      booking.status === 'checked-in' || booking.status === 'confirmed'
    ).length;
    return Math.round((occupiedRooms / rooms.length) * 100);
  };

  // Calculate total revenue
  const calculateTotalRevenue = () => {
    return bookingsData.reduce((total, booking) => {
      return total + (booking.totalAmount || 0);
    }, 0);
  };

  // Get active staff count
  const getActiveStaffCount = () => {
    return users.filter(user => user.status === 'active' && user.role !== 'admin').length;
  };

  // Get checked-in guests
  const getCheckedInGuests = () => {
    return bookingsData.filter(booking => booking.status === 'checked-in').length;
  };

  // Get today's check-ins and check-outs
  const getTodayActivity = () => {
    const today = new Date().toDateString();
    const todayBookings = bookingsData.filter(booking => 
      new Date(booking.checkIn).toDateString() === today ||
      new Date(booking.checkOut).toDateString() === today
    );

    const checkIns = todayBookings.filter(booking => 
      new Date(booking.checkIn).toDateString() === today
    ).length;

    const checkOuts = todayBookings.filter(booking => 
      new Date(booking.checkOut).toDateString() === today
    ).length;

    return { checkIns, checkOuts };
  };

  const overviewCards = [
    {
      title: 'Total Rooms',
      value: rooms.length,
      icon: Bed,
      color: 'from-blue-500 to-blue-600',
      change: `${rooms.length} Available`
    },
    {
      title: 'Occupancy Rate',
      value: `${calculateOccupancyRate()}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      change: `${bookingsData.filter(b => b.status === 'checked-in').length} Occupied`
    },
    {
      title: 'Total Revenue',
      value: `$${calculateTotalRevenue().toLocaleString()}`,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      change: `${bookingsData.length} Bookings`
    },
    {
      title: 'Active Staff',
      value: getActiveStaffCount(),
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      change: `${users.length} Total Staff`
    }
  ];

  const handleExportReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/reports/export?hotelId=${selectedHotelId}&type=${selectedReport}&range=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedReport}-report-${dateRange}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewReport = () => {
    const { checkIns, checkOuts } = getTodayActivity();
    
    return (
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                    {card.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{card.value}</h3>
                <p className="text-gray-600 text-sm">{card.title}</p>
              </div>
            );
          })}
        </div>

        {/* Today's Activity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{checkIns}</h3>
                <p className="text-gray-600 text-sm">Today's Check-ins</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <UserX className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{checkOuts}</h3>
                <p className="text-gray-600 text-sm">Today's Check-outs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{getCheckedInGuests()}</h3>
                <p className="text-gray-600 text-sm">Current Guests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Recent Bookings</h3>
          </div>
          <div className="p-6">
            {bookingsData.length > 0 ? (
              <div className="space-y-4">
                {bookingsData.slice(0, 5).map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                        booking.status === 'checked-in' ? 'bg-green-100 text-green-600' :
                        booking.status === 'checked-out' ? 'bg-gray-100 text-gray-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {booking.guestName || 'Guest'} - Room {booking.roomNumber || booking.roomId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">${booking.totalAmount || 0}</p>
                      <p className={`text-xs capitalize px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                        booking.status === 'checked-in' ? 'bg-green-50 text-green-600' :
                        booking.status === 'checked-out' ? 'bg-gray-50 text-gray-600' :
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {booking.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent bookings found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderOccupancyReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Status Overview */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Room Status</h3>
          <div className="space-y-4">
            {rooms.map((room, index) => {
              const booking = bookingsData.find(b => b.roomId === room.id && b.status === 'checked-in');
              const isOccupied = !!booking;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isOccupied ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      <Bed className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Room {room.number}</p>
                      <p className="text-sm text-gray-600">{room.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium px-2 py-1 rounded-full ${
                      isOccupied ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {isOccupied ? 'Occupied' : 'Available'}
                    </p>
                    {booking && (
                      <p className="text-xs text-gray-500 mt-1">
                        Until {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Occupancy Statistics */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Occupancy Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Total Rooms</span>
              <span className="font-bold text-blue-600">{rooms.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-gray-700">Available Rooms</span>
              <span className="font-bold text-green-600">
                {rooms.length - bookingsData.filter(b => b.status === 'checked-in').length}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <span className="text-gray-700">Occupied Rooms</span>
              <span className="font-bold text-red-600">
                {bookingsData.filter(b => b.status === 'checked-in').length}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
              <span className="text-gray-700">Occupancy Rate</span>
              <span className="font-bold text-purple-600">{calculateOccupancyRate()}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRevenueReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Total Revenue</h4>
          <p className="text-3xl font-bold text-green-600">${calculateTotalRevenue().toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Average Booking Value</h4>
          <p className="text-3xl font-bold text-blue-600">
            ${bookingsData.length > 0 ? Math.round(calculateTotalRevenue() / bookingsData.length) : 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Total Bookings</h4>
          <p className="text-3xl font-bold text-purple-600">{bookingsData.length}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Breakdown by Booking</h3>
        <div className="space-y-3">
          {bookingsData.map((booking, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{booking.guestName || `Booking #${booking.id}`}</p>
                <p className="text-sm text-gray-600">Room {booking.roomNumber || booking.roomId}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">${booking.totalAmount || 0}</p>
                <p className="text-sm text-gray-500">{new Date(booking.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGuestAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Guest Information</h3>
        <div className="space-y-4">
          {bookingsData.map((booking, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{booking.guestName || 'Guest Name'}</p>
                <p className="text-sm text-gray-600">{booking.guestEmail || 'No email provided'}</p>
                <p className="text-sm text-gray-600">{booking.guestPhone || 'No phone provided'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Room {booking.roomNumber || booking.roomId}</p>
                <p className="text-sm text-gray-600">
                  {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStaffPerformance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Staff Overview</h3>
        <div className="space-y-4">
          {users.filter(user => user.role !== 'admin').map((staff, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  staff.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{staff.full_name}</p>
                  <p className="text-sm text-gray-600">{staff.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium px-2 py-1 rounded-full capitalize ${
                  staff.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {staff.status}
                </p>
                <p className="text-xs text-gray-500 mt-1">{staff.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview':
        return renderOverviewReport();
      case 'occupancy':
        return renderOccupancyReport();
      case 'revenue':
        return renderRevenueReport();
      case 'guests':
        return renderGuestAnalytics();
      case 'performance':
        return renderStaffPerformance();
      default:
        return renderOverviewReport();
    }
  };

  if (!selectedHotelId) {
    return (
      <div className="min-h-screen bg-gray-50 pl-64 p-8 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">No Hotel Selected</h2>
          <p className="text-gray-500">Please select a hotel to view reports</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pl-64">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
                <p className="text-gray-600 mt-1">
                  {hotelName ? `${hotelName} - Hotel Performance Dashboard` : 'Hotel Performance Dashboard'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportReport}
                disabled={loading}
                className="px-6 py-3 bg-blue-600  disabled:bg-gray-400 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {loading ? 'Exporting...' : 'Export Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Filters:</span>
              </div>
              
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.title}</option>
                ))}
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Report Types Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {reportTypes.map((type) => {
            const IconComponent = type.icon;
            const isSelected = selectedReport === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className={`font-semibold mb-1 ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                  {type.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">{type.description}</p>
              </button>
            );
          })}
        </div>

        {/* Report Content */}
        <div className="mb-8">
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};

export default Reports;
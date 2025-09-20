import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Calendar, User, Building2, Phone, Mail, CreditCard, Clock, Filter, RefreshCw, Search, MapPin, Users } from 'lucide-react';

const SuperBooking = () => {
  const { token } = useContext(AuthContext);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 30;

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchAllBookings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/bookings/hotel/all`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const result = await res.json();
      const data = Array.isArray(result) ? result : result.bookings || [];

      const mappedData = data.map((booking) => ({
        ...booking,
        roomName: booking.room
          ? `${booking.room.type} (#${booking.room.roomNumber})`
          : booking.roomId,
        hotelName: booking.hotelName || 'Unknown Hotel',
        guestName: booking.guestName || 'N/A',
        status: booking.status || 'pending',
        totalAmount: booking.totalAmount || (booking.room?.price || '0')
      }));

      setAllBookings(mappedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching all bookings:', err);
      setError('Failed to load bookings');
      setAllBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, [token]);

  // Filter bookings based on status and search
  const filteredBookings = allBookings.filter(booking => {
    const matchesFilter = activeFilter === 'all' || booking.status.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const indexOfLast = currentPage * bookingsPerPage;
  const indexOfFirst = indexOfLast - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirst, indexOfLast);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCardClick = (status) => {
    setActiveFilter(status);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isMobile ? 'pl-0 pt-16' : 'pl-64'} flex items-center justify-center`}>
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Bookings...</h3>
          <p className="text-gray-600 text-center">Please wait while we fetch all hotel bookings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isMobile ? 'pl-0 pt-16' : 'pl-64'}`}>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">All Hotel Bookings</h1>
          <p className="text-gray-600">Manage bookings across all hotels in your system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {[ 
            { 
              label: 'Total Bookings', 
              status: 'all', 
              count: allBookings.length, 
              revenue: allBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0).toFixed(2),
              icon: <Calendar className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />, 
              bg: 'bg-blue-100',
              color: 'text-blue-600'
            },
            { 
              label: 'Confirmed', 
              status: 'confirmed', 
              count: allBookings.filter(b => b.status === 'confirmed').length, 
              revenue: allBookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0).toFixed(2),
              icon: <Building2 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />, 
              bg: 'bg-green-100',
              color: 'text-green-600'
            },
            { 
              label: 'Pending', 
              status: 'pending', 
              count: allBookings.filter(b => b.status === 'pending').length, 
              revenue: allBookings.filter(b => b.status === 'pending').reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0).toFixed(2),
              icon: <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />, 
              bg: 'bg-yellow-100',
              color: 'text-yellow-600'
            },
            { 
              label: 'Cancelled', 
              status: 'cancelled', 
              count: allBookings.filter(b => b.status === 'cancelled').length, 
              revenue: allBookings.filter(b => b.status === 'cancelled').reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0).toFixed(2),
              icon: <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-red-600" />, 
              bg: 'bg-red-100',
              color: 'text-red-600'
            },
          ].map((card) => (
            <div
              key={card.status}
              className={`bg-white rounded-lg md:rounded-xl shadow-sm border p-4 md:p-6 cursor-pointer transition-all duration-300 h-28 md:h-32 flex flex-col justify-between hover:shadow-lg ${
                activeFilter === card.status ? 'border-2 border-blue-500 shadow-lg transform scale-105' : 'border border-gray-200'
              }`}
              onClick={() => handleCardClick(card.status)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">{card.label}</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{card.count}</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">Revenue: PKR {card.revenue}</p>
                </div>
                <div className={`p-2 md:p-3 ${card.bg} rounded-lg transition-transform duration-300 ${activeFilter === card.status ? 'scale-110' : ''}`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search, Filter and Refresh */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by guest name, hotel, or email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchAllBookings}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 border border-blue-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
                <Filter className="h-4 w-4" />
                <span>Showing: {filteredBookings.length} bookings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <div className="flex-shrink-0 mr-3">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Error occurred</h4>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              {activeFilter === 'all' 
                ? 'All Bookings' 
                : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Bookings`}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest Details
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel & Room
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in / Check-out
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 md:px-6 py-8 md:py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Calendar className="w-8 h-8 md:h-12 md:w-12 text-gray-400 mb-2 md:mb-4" />
                        <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2">
                          {searchTerm ? 'No matching bookings found' : 'No bookings found'}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500">
                          {searchTerm 
                            ? 'Try adjusting your search terms or filters' 
                            : 'There are no bookings to display at the moment.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-200">
                      {/* Guest Details */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs md:text-base">
                              {booking.guestName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-3 md:ml-4">
                            <div className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[120px] md:max-w-none">
                              {booking.guestName}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-[100px] md:max-w-none">{booking.guestEmail}</span>
                            </div>
                            {booking.guestPhone && (
                              <div className="text-xs text-gray-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {booking.guestPhone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Hotel & Room */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center">
                            <Building2 className="h-3 w-3 md:h-4 md:w-4 text-gray-400 mr-1 md:mr-2" />
                            <div className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[100px] md:max-w-none">
                              {booking.hotelName}
                            </div>
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-3 w-3 md:h-4 md:w-4 text-gray-400 mr-1 md:mr-2" />
                            <div className="text-xs text-gray-500 truncate max-w-[100px] md:max-w-none">
                              {booking.roomName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Check-in / Check-out */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center text-xs md:text-sm text-gray-900">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-green-500 mr-1 md:mr-2" />
                            <span className="font-medium">In:</span>
                            <span className="ml-1">{formatDate(booking.checkIn)}</span>
                          </div>
                          <div className="flex items-center text-xs md:text-sm text-gray-900 mt-1">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-red-500 mr-1 md:mr-2" />
                            <span className="font-medium">Out:</span>
                            <span className="ml-1">{formatDate(booking.checkOut)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Guests */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs md:text-sm text-gray-900">
                          <Users className="h-3 w-3 md:h-4 md:w-4 text-blue-500 mr-1 md:mr-2" />
                          {booking.guests || 1}
                        </div>
                      </td>

                      {/* Amount in PKR */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs md:text-sm font-medium text-gray-900">
                          <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-green-500 mr-1 md:mr-2" />
                          PKR {booking.totalAmount}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(booking.status)}`}>
                          {booking.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-end items-center space-x-2 p-4 border-t border-gray-200">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg border ${currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-blue-600 border-blue-200 hover:bg-blue-50'}`}>
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page 
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1));
                    setCurrentPage(page);
                  }}
                  className="w-12 mx-1 px-1 py-0.5 border rounded text-center text-sm"
                />
                of {totalPages}
              </span>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg border ${currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-blue-600 border-blue-200 hover:bg-blue-50'}`}>
                Next
              </button>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {filteredBookings.length > 0 && (
          <div className="mt-4 md:mt-6 flex flex-col md:flex-row justify-between items-center text-xs md:text-sm text-gray-600 space-y-2 md:space-y-0">
            <span>
              Showing {currentBookings.length} of {filteredBookings.length} filtered bookings
            </span>
            <div className="flex items-center space-x-4 bg-white px-4 py-2 rounded-lg border border-gray-200">
              <span>
                Total Revenue: PKR {currentBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SuperBooking;

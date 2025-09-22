import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  Eye, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Users,
  Bed,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

const SuperAdminHotel = () => {
  const { 
    token, 
    user, 
    allHotels, 
    fetchAllHotels, 
    allBookings, 
    fetchAllBookings,
    updateHotelSuperAdmin, 
    deleteHotelSuperAdmin, 
    getHotelByIdSuperAdmin 
  } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: ''
  });

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch data
  const fetchData = async () => {
    if (!token || user?.role !== "superadmin") return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchAllHotels(),
        fetchAllBookings()
      ]);
      setError(null);
    } catch (err) {
      console.error('Error fetching hotel data:', err);
      setError('Failed to load hotel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === "superadmin") {
      fetchData();
    }
  }, [token, user?.role]);

  // Calculate hotel statistics
  const calculateHotelStats = (hotel) => {
    const hotelBookings = allBookings?.filter(booking => 
      booking.hotelId === hotel.id || booking.hotelName === hotel.name
    ) || [];

    const totalBookings = hotelBookings.length;
    const confirmedBookings = hotelBookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = hotelBookings.filter(b => b.status === 'pending').length;
    const revenue = hotelBookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
    
    // Get total rooms from hotel.Rooms or hotel.rooms array
    const totalRooms = hotel.Rooms?.length || hotel.rooms?.length || hotel.totalRooms || 0;
    const occupancyRate = totalRooms > 0 ? (confirmedBookings / totalRooms) * 100 : 0;

    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      revenue,
      occupancyRate,
      totalRooms
    };
  };

  // Enhanced hotel data with statistics
  const enhancedHotels = allHotels.map(hotel => ({
    ...hotel,
    ...calculateHotelStats(hotel)
  }));

  // Filter hotels
  const filteredHotels = enhancedHotels.filter(hotel => {
    const matchesSearch = searchTerm === '' || 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && hotel.totalBookings > 0) ||
      (statusFilter === 'inactive' && hotel.totalBookings === 0) ||
      (statusFilter === 'high-revenue' && hotel.revenue > 50000) ||
      (statusFilter === 'low-revenue' && hotel.revenue <= 50000);
    
    return matchesSearch && matchesStatus;
  });

  // Overall statistics
  const totalStats = {
    totalHotels: allHotels.length,
    activeHotels: enhancedHotels.filter(h => h.totalBookings > 0).length,
    totalRooms: enhancedHotels.reduce((sum, h) => sum + h.totalRooms, 0),
    totalRevenue: enhancedHotels.reduce((sum, h) => sum + h.revenue, 0),
    totalBookings: enhancedHotels.reduce((sum, h) => sum + h.totalBookings, 0)
  };

  // Handle edit
  const handleEdit = async (hotel) => {
    try {
      const hotelDetails = await getHotelByIdSuperAdmin(hotel.id);
      setSelectedHotel(hotel);
      setEditFormData({
        name: hotelDetails.name || '',
        address: hotelDetails.address || '',
        phone: hotelDetails.phone || '',
        email: hotelDetails.email || '',
        description: hotelDetails.description || ''
      });
      setShowEditModal(true);
    } catch (err) {
      setError('Failed to fetch hotel details');
    }
  };

  // Handle update
  const handleUpdate = async () => {
    try {
      await updateHotelSuperAdmin(selectedHotel.id, editFormData);
      setShowEditModal(false);
      setSelectedHotel(null);
      fetchData();
    } catch (err) {
      setError('Failed to update hotel');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteHotelSuperAdmin(selectedHotel.id);
      setShowDeleteModal(false);
      setSelectedHotel(null);
      fetchData();
    } catch (err) {
      setError('Failed to delete hotel');
    }
  };

  // Handle view details
  const handleViewDetails = (hotel) => {
    setSelectedHotel(hotel);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isMobile ? 'pl-0 pt-16' : 'pl-64'} flex items-center justify-center`}>
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Hotels...</h3>
          <p className="text-gray-600 text-center">Please wait while we fetch hotel data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isMobile ? 'pl-0 pt-16' : 'pl-64'}`}>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Hotel Management</h1>
            <p className="text-gray-600">Manage all hotels in your system</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
          {[
            {
              label: 'Total Hotels',
              value: totalStats.totalHotels,
              icon: <Building2 className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />,
              bg: 'bg-blue-100',
              subtitle: `${totalStats.activeHotels} active`
            },
            {
              label: 'Total Rooms',
              value: totalStats.totalRooms,
              icon: <Bed className="h-5 w-5 md:h-6 md:w-6 text-green-600" />,
              bg: 'bg-green-100',
              subtitle: 'Across all hotels'
            },
            {
              label: 'Total Bookings',
              value: totalStats.totalBookings,
              icon: <Calendar className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />,
              bg: 'bg-purple-100',
              subtitle: 'All time'
            },
            {
              label: 'Total Revenue',
              value: `PKR ${totalStats.totalRevenue.toLocaleString()}`,
              icon: <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />,
              bg: 'bg-emerald-100'
            },
            {
              label: 'Active Hotels',
              value: `${((totalStats.activeHotels / totalStats.totalHotels) * 100 || 0).toFixed(0)}%`,
              icon: <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />,
              bg: 'bg-orange-100',
              subtitle: 'With bookings'
            }
          ].map((card, index) => (
            <div key={index} className="bg-white rounded-lg md:rounded-xl shadow-sm border p-4 md:p-6 h-28 md:h-32 flex flex-col justify-between border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">{card.label}</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                  {card.subtitle && (
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                  )}
                </div>
                <div className={`p-2 md:p-3 ${card.bg} rounded-lg flex-shrink-0`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search hotels by name, address, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Hotels</option>
                <option value="active">Active Hotels</option>
                <option value="inactive">Inactive Hotels</option>
                <option value="high-revenue">High Revenue (&gt;50K)</option>
                <option value="low-revenue">Low Revenue (≤50K)</option>
              </select>
              <button
                onClick={fetchData}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 border border-blue-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h4 className="font-medium">Error occurred</h4>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHotels.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <Building2 className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                {searchTerm ? 'Try adjusting your search terms or filters' : 'Get started by adding your first hotel'}
              </p>
            </div>
          ) : (
            filteredHotels.map((hotel) => (
              <div key={hotel.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                {/* Hotel Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {hotel.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[200px]">{hotel.address || 'No address'}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${hotel.totalBookings > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {hotel.totalBookings > 0 ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {hotel.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-2" />
                        <span className="truncate">{hotel.email}</span>
                      </div>
                    )}
                    {hotel.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3 w-3 mr-2" />
                        <span>{hotel.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Bed className="h-4 w-4 text-blue-600 mr-1" />
                        <span className="text-sm font-medium text-blue-600">Rooms</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{hotel.totalRooms}</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="h-4 w-4 text-purple-600 mr-1" />
                        <span className="text-sm font-medium text-purple-600">Bookings</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{hotel.totalBookings}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium text-green-600">Revenue</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900">PKR {hotel.revenue.toLocaleString()}</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-orange-600 mr-1" />
                        <span className="text-sm font-medium text-orange-600">Occupancy</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900">{hotel.occupancyRate.toFixed(0)}%</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {hotel.confirmedBookings} confirmed • {hotel.pendingBookings} pending
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(hotel)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(hotel)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="Edit Hotel"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedHotel(hotel);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete Hotel"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Footer */}
        {filteredHotels.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-600">
              <span>
                Showing {filteredHotels.length} of {allHotels.length} hotels
              </span>
              <span>
                Combined Revenue: PKR {filteredHotels.reduce((sum, h) => sum + h.revenue, 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedHotel && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold mr-3">
                    {selectedHotel.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Edit Hotel</h3>
                    <p className="text-sm text-gray-500">Update hotel information</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-50 rounded-full p-2 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-blue-500" />
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    placeholder="Enter hotel name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-green-500" />
                    Address
                  </label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                    placeholder="Enter hotel address"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-orange-500" />
                      Phone
                    </label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                      placeholder="Phone number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-purple-500" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      placeholder="Email address"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    rows={3}
                    placeholder="Enter hotel description..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Edit2 className="h-4 w-4 mr-2 inline" />
                  Update Hotel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedHotel && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Delete Hotel</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{selectedHotel.name}</strong>? 
                This will permanently remove the hotel and all associated data.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200"
                >
                  Delete Hotel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedHotel && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">{selectedHotel.name}</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{selectedHotel.address || 'No address provided'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{selectedHotel.email || 'No email provided'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{selectedHotel.phone || 'No phone provided'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">
                      {selectedHotel.description || 'No description available'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Statistics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-blue-600">{selectedHotel.totalRooms}</div>
                        <div className="text-xs text-blue-600">Total Rooms</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-purple-600">{selectedHotel.totalBookings}</div>
                        <div className="text-xs text-purple-600">Bookings</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-green-600">{selectedHotel.confirmedBookings}</div>
                        <div className="text-xs text-green-600">Confirmed</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-yellow-600">{selectedHotel.pendingBookings}</div>
                        <div className="text-xs text-yellow-600">Pending</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Revenue</h4>
                    <div className="bg-emerald-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-emerald-600">
                        PKR {selectedHotel.revenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-emerald-600">Total Revenue</div>
                      <div className="text-xs text-gray-500 mt-1">
                        From confirmed bookings
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Occupancy Rate Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Occupancy Rate</h4>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedHotel.occupancyRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(selectedHotel.occupancyRate, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Based on confirmed bookings vs total rooms
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Metrics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-semibold text-gray-900">
                      PKR {selectedHotel.totalBookings > 0 ? (selectedHotel.revenue / selectedHotel.confirmedBookings).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
                    </div>
                    <div className="text-xs text-gray-600">Avg. Booking Value</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedHotel.totalRooms > 0 ? (selectedHotel.revenue / selectedHotel.totalRooms).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
                    </div>
                    <div className="text-xs text-gray-600">Revenue per Room</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-semibold text-gray-900">
                      {selectedHotel.totalBookings > 0 ? ((selectedHotel.confirmedBookings / selectedHotel.totalBookings) * 100).toFixed(0) : 0}%
                    </div>
                    <div className="text-xs text-gray-600">Confirmation Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminHotel;
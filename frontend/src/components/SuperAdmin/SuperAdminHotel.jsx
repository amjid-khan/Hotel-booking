import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  FaHotel, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaStar,
  FaBed,
  FaUsers,
  FaDollarSign,
  FaCalendarAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSort,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartLine,
  FaWifi,
  FaCar,
  FaSwimmingPool,
  FaDumbbell,
  FaCoffee,
  FaConciergeBell
} from 'react-icons/fa';
import { HiDotsVertical } from 'react-icons/hi';
import { MdLocationOn, MdEmail, MdPhone, MdPeople, MdBed, MdAttachMoney } from 'react-icons/md';

const SuperAdminHotels = () => {
  const { hotels = [], token, user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Dummy data for demonstration when no real hotels
  const dummyHotels = [
    {
      id: 1,
      name: 'Grand Plaza Hotel',
      description: 'Luxury hotel in the heart of downtown with premium amenities and exceptional service.',
      address: '123 Main Street, Downtown',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      phone: '+1 (555) 123-4567',
      email: 'contact@grandplaza.com',
      website: 'www.grandplaza.com',
      rating: 4.8,
      total_rooms: 150,
      available_rooms: 23,
      occupied_rooms: 127,
      status: 'Active',
      created_at: '2024-01-15',
      monthly_revenue: 125000,
      total_bookings: 342,
      amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Parking'],
      images: ['hotel1.jpg', 'hotel1-2.jpg']
    },
    {
      id: 2,
      name: 'Ocean View Resort',
      description: 'Beachfront resort with stunning ocean views and world-class facilities.',
      address: '456 Ocean Drive, Beachfront',
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      phone: '+1 (555) 987-6543',
      email: 'info@oceanview.com',
      website: 'www.oceanviewresort.com',
      rating: 4.7,
      total_rooms: 200,
      available_rooms: 45,
      occupied_rooms: 155,
      status: 'Active',
      created_at: '2024-02-20',
      monthly_revenue: 180000,
      total_bookings: 428,
      amenities: ['WiFi', 'Beach Access', 'Pool', 'Spa', 'Restaurant', 'Bar'],
      images: ['hotel2.jpg']
    },
    {
      id: 3,
      name: 'Mountain Peak Lodge',
      description: 'Cozy mountain retreat perfect for nature lovers and adventure seekers.',
      address: '789 Mountain Trail, Alpine',
      city: 'Aspen',
      state: 'CO',
      country: 'USA',
      phone: '+1 (555) 456-7890',
      email: 'reservations@mountainpeak.com',
      website: 'www.mountainpeaklodge.com',
      rating: 4.9,
      total_rooms: 85,
      available_rooms: 12,
      occupied_rooms: 73,
      status: 'Active',
      created_at: '2024-03-10',
      monthly_revenue: 95000,
      total_bookings: 256,
      amenities: ['WiFi', 'Fireplace', 'Hiking Trails', 'Restaurant', 'Parking'],
      images: ['hotel3.jpg']
    },
    {
      id: 4,
      name: 'City Center Inn',
      description: 'Modern business hotel with excellent connectivity and professional services.',
      address: '321 Business District, Center',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      phone: '+1 (555) 789-0123',
      email: 'business@citycenter.com',
      website: 'www.citycenterinn.com',
      rating: 4.6,
      total_rooms: 120,
      available_rooms: 8,
      occupied_rooms: 112,
      status: 'Pending',
      created_at: '2024-04-05',
      monthly_revenue: 85000,
      total_bookings: 189,
      amenities: ['WiFi', 'Business Center', 'Gym', 'Restaurant', 'Conference Rooms'],
      images: ['hotel4.jpg']
    },
    {
      id: 5,
      name: 'Luxury Suites',
      description: 'Premium accommodation with spacious suites and personalized service.',
      address: '654 Elite Avenue, Uptown',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      phone: '+1 (555) 321-6547',
      email: 'concierge@luxurysuites.com',
      website: 'www.luxurysuites.com',
      rating: 4.8,
      total_rooms: 180,
      available_rooms: 32,
      occupied_rooms: 148,
      status: 'Active',
      created_at: '2024-01-28',
      monthly_revenue: 220000,
      total_bookings: 398,
      amenities: ['WiFi', 'Concierge', 'Spa', 'Fine Dining', 'Valet Parking', 'Butler Service'],
      images: ['hotel5.jpg']
    }
  ];

  // Use real hotels if available, otherwise use dummy data
  const displayHotels = hotels.length > 0 ? hotels.map(hotel => ({
    ...hotel,
    // Add dummy data for missing fields
    description: hotel.description || 'Premium hotel with excellent service and modern amenities.',
    rating: hotel.rating || (4.5 + Math.random() * 0.4).toFixed(1),
    available_rooms: hotel.available_rooms || Math.floor(Math.random() * 50) + 5,
    occupied_rooms: hotel.occupied_rooms || hotel.total_rooms - (Math.floor(Math.random() * 50) + 5),
    monthly_revenue: hotel.monthly_revenue || Math.floor(Math.random() * 150000) + 50000,
    total_bookings: hotel.total_bookings || Math.floor(Math.random() * 300) + 100,
    amenities: hotel.amenities || ['WiFi', 'Restaurant', 'Parking', 'Gym'],
    status: hotel.status || 'Active'
  })) : dummyHotels;

  // Filter and search logic
  const filteredHotels = displayHotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hotel.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hotel.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || hotel.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort logic
  const sortedHotels = [...filteredHotels].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return parseFloat(b.rating) - parseFloat(a.rating);
      case 'revenue':
        return (b.monthly_revenue || 0) - (a.monthly_revenue || 0);
      case 'rooms':
        return (b.total_rooms || 0) - (a.total_rooms || 0);
      case 'date':
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <FaCheckCircle className="w-3 h-3" />;
      case 'Pending': return <FaClock className="w-3 h-3" />;
      case 'Inactive': return <FaTimesCircle className="w-3 h-3" />;
      default: return <FaClock className="w-3 h-3" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      'WiFi': <FaWifi />,
      'Pool': <FaSwimmingPool />,
      'Gym': <FaDumbbell />,
      'Parking': <FaCar />,
      'Restaurant': <FaCoffee />,
      'Spa': <FaConciergeBell />,
      'Bar': <FaCoffee />,
      'Business Center': <FaUsers />,
      'Conference Rooms': <FaUsers />,
      'Concierge': <FaConciergeBell />,
      'Valet Parking': <FaCar />,
      'Butler Service': <FaConciergeBell />,
      'Fine Dining': <FaCoffee />,
      'Beach Access': <FaSwimmingPool />,
      'Fireplace': <FaCoffee />,
      'Hiking Trails': <FaDumbbell />
    };
    return icons[amenity] || <FaCheckCircle />;
  };

  const openHotelDetails = (hotel) => {
    setSelectedHotel(hotel);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 md:ml-64">
      {/* Mobile Top Spacing */}
      <div className="h-16 md:hidden"></div>
      
      {/* Main Content */}
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Hotel Management
            </h1>
            <p className="text-gray-600">
              Manage all hotels across your platform • {sortedHotels.length} hotels total
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2">
              <FaPlus className="w-4 h-4" />
              Add Hotel
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search hotels, cities, addresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="revenue">Sort by Revenue</option>
                <option value="rooms">Sort by Rooms</option>
                <option value="date">Sort by Date</option>
              </select>

              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hotels Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedHotels.map((hotel) => (
              <div key={hotel.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                {/* Hotel Image */}
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-t-xl relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaHotel className="w-12 h-12 text-purple-400" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(hotel.status)}`}>
                      {getStatusIcon(hotel.status)}
                      {hotel.status}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                      <FaStar className="w-3 h-3 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900">{hotel.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Hotel Info */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{hotel.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{hotel.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                      {hotel.address || `${hotel.city}, ${hotel.state}`}
                    </div>

                    {hotel.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                        {hotel.phone}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{hotel.total_rooms || 0}</div>
                      <div className="text-xs text-gray-500">Total Rooms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{hotel.available_rooms || 0}</div>
                      <div className="text-xs text-gray-500">Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{formatCurrency(hotel.monthly_revenue || 0)}</div>
                      <div className="text-xs text-gray-500">Monthly Revenue</div>
                    </div>
                  </div>

                  {/* Amenities */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {hotel.amenities.slice(0, 4).map((amenity, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                            <span className="text-gray-500">{getAmenityIcon(amenity)}</span>
                            {amenity}
                          </span>
                        ))}
                        {hotel.amenities.length > 4 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                            +{hotel.amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openHotelDetails(hotel)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <FaEye className="w-4 h-4" />
                      View Details
                    </button>
                    <button className="p-2 border border-gray-300 hover:border-gray-400 rounded-lg text-gray-600 hover:text-gray-900 transition-colors duration-200">
                      <FaEdit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedHotels.map((hotel) => (
                    <tr key={hotel.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                            <FaHotel className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                            <div className="text-sm text-gray-500">{hotel.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{hotel.city}, {hotel.state}</div>
                        <div className="text-sm text-gray-500">{hotel.country}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{hotel.total_rooms || 0}</div>
                        <div className="text-sm text-green-600">{hotel.available_rooms || 0} available</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FaStar className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">{hotel.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(hotel.monthly_revenue || 0)}</div>
                        <div className="text-sm text-gray-500">per month</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(hotel.status)}`}>
                          {getStatusIcon(hotel.status)}
                          {hotel.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openHotelDetails(hotel)}
                            className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200">
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results */}
        {sortedHotels.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaHotel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first hotel'}
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
              Add Hotel
            </button>
          </div>
        )}
      </div>

      {/* Hotel Details Modal */}
      {showModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FaHotel className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedHotel.name}</h2>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <FaMapMarkerAlt className="w-4 h-4" />
                      {selectedHotel.address || `${selectedHotel.city}, ${selectedHotel.state}`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Basic Info */}
                <div className="bg-gray-50/70 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FaPhone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{selectedHotel.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaEnvelope className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{selectedHotel.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaStar className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-700">{selectedHotel.rating} Rating</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(selectedHotel.status)}`}>
                        {getStatusIcon(selectedHotel.status)}
                        {selectedHotel.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-gray-50/70 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{selectedHotel.total_rooms || 0}</div>
                      <div className="text-sm text-gray-600">Total Rooms</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedHotel.available_rooms || 0}</div>
                      <div className="text-sm text-gray-600">Available</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedHotel.occupied_rooms || 0}</div>
                      <div className="text-sm text-gray-600">Occupied</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{selectedHotel.total_bookings || 0}</div>
                      <div className="text-sm text-gray-600">Bookings</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50/70 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedHotel.description}</p>
              </div>

              {/* Amenities */}
              {selectedHotel.amenities && selectedHotel.amenities.length > 0 && (
                <div className="bg-gray-50/70 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {selectedHotel.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">
                        <div className="text-purple-600">{getAmenityIcon(amenity)}</div>
                        <span className="text-sm font-medium text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revenue Information */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/70 rounded-lg p-4 text-center">
                    <FaDollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(selectedHotel.monthly_revenue || 0)}</div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-4 text-center">
                    <FaChartLine className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency((selectedHotel.monthly_revenue || 0) * 12)}</div>
                    <div className="text-sm text-gray-600">Annual Projection</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-4 text-center">
                    <FaCalendarAlt className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{Math.round((selectedHotel.monthly_revenue || 0) / (selectedHotel.total_bookings || 1))}</div>
                    <div className="text-sm text-gray-600">Avg Booking Value</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                  <FaEdit className="w-4 h-4" />
                  Edit Hotel
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                  <FaChartLine className="w-4 h-4" />
                  View Analytics
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                  <FaUsers className="w-4 h-4" />
                  Manage Users
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                  <FaTrash className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminHotels;
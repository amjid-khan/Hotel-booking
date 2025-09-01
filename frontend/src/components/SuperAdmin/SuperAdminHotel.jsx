import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import axios from "axios";
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
  FaConciergeBell,
  FaSave,
  FaTimes,
} from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SuperAdminHotels = () => {
  const { 
    token, 
    user, 
    allHotels, 
    fetchAllHotels,
    updateHotelSuperAdmin,
    deleteHotelSuperAdmin,
    getHotelByIdSuperAdmin
  } = useContext(AuthContext);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hotelDetails, setHotelDetails] = useState({});
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch detailed hotel information including rooms count
  const fetchHotelDetails = async (hotelId) => {
    if (!token || hotelDetails[hotelId]) return hotelDetails[hotelId];

    try {
      const [hotelRes, roomsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/hotels/${hotelId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/rooms?hotelId=${hotelId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const hotel = hotelRes.data.hotel || hotelRes.data;
      const rooms = Array.isArray(roomsRes.data)
        ? roomsRes.data
        : roomsRes.data.rooms || [];

      const details = {
        ...hotel,
        total_rooms: rooms.length,
        available_rooms: rooms.filter(
          (room) => room.status === "available" || room.available
        ).length,
        occupied_rooms: rooms.filter(
          (room) => room.status === "occupied" || !room.available
        ).length,
        rooms: rooms,
      };

      setHotelDetails((prev) => ({
        ...prev,
        [hotelId]: details,
      }));

      return details;
    } catch (error) {
      console.error(`Error fetching hotel details for ${hotelId}:`, error);
      return null;
    }
  };

  // Handle Edit Hotel
  const handleEditHotel = async (hotel) => {
    try {
      const hotelData = await getHotelByIdSuperAdmin(hotel.id);
      setEditFormData({
        name: hotelData.name || '',
        address: hotelData.address || '',
        description: hotelData.description || '',
        email: hotelData.email || '',
        city: hotelData.city || '',
        state: hotelData.state || '',
        country: hotelData.country || '',
        zip: hotelData.zip || '',
        phone: hotelData.phone || '',
        starRating: hotelData.starRating || 1,
      });
      setSelectedHotel(hotel);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching hotel data for edit:', error);
      alert('Error loading hotel data for editing');
    }
  };

  // Handle Update Hotel
  const handleUpdateHotel = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await updateHotelSuperAdmin(selectedHotel.id, editFormData);
      setShowEditModal(false);
      setSelectedHotel(null);
      setEditFormData({});
      
      // Show success message
      alert('Hotel updated successfully!');
      
      // Refresh hotel details if modal is open
      if (showModal && selectedHotel) {
        setHotelDetails(prev => {
          const updated = { ...prev };
          delete updated[selectedHotel.id];
          return updated;
        });
        await fetchHotelDetails(selectedHotel.id);
      }
    } catch (error) {
      console.error('Error updating hotel:', error);
      alert('Error updating hotel. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete Hotel
  const handleDeleteHotel = async () => {
    setIsDeleting(true);

    try {
      await deleteHotelSuperAdmin(selectedHotel.id);
      setShowDeleteModal(false);
      setShowModal(false);
      setSelectedHotel(null);
      
      // Show success message
      alert('Hotel deleted successfully!');
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Error deleting hotel. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirm Delete Modal
  const confirmDelete = (hotel) => {
    setSelectedHotel(hotel);
    setShowDeleteModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch all hotel details when component mounts
  useEffect(() => {
    const loadHotelDetails = async () => {
      if (!token || !allHotels || allHotels.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Fetch details for all hotels
      const detailsPromises = allHotels.map((hotel) =>
        fetchHotelDetails(hotel.id)
      );
      await Promise.all(detailsPromises);

      setLoading(false);
    };

    loadHotelDetails();
  }, [allHotels, token]);

  // Load hotels on component mount
  useEffect(() => {
    if (token && user?.role === "superadmin") {
      fetchAllHotels();
    }
  }, [token, user]);

  // Merge hotel data with details
  const getEnrichedHotels = () => {
    return allHotels.map((hotel) => {
      const details = hotelDetails[hotel.id] || {};
      return {
        ...hotel,
        ...details,
        // Add defaults for missing fields
        description:
          hotel.description ||
          details.description ||
          "Premium hotel with excellent service and modern amenities.",
        rating:
          hotel.rating ||
          details.rating ||
          (4.5 + Math.random() * 0.4).toFixed(1),
        status: hotel.status || details.status || "Active",
        amenities: hotel.amenities ||
          details.amenities || ["WiFi", "Restaurant", "Parking"],
        total_rooms: details.total_rooms || hotel.total_rooms || 0,
        available_rooms: details.available_rooms || hotel.available_rooms || 0,
        occupied_rooms: details.occupied_rooms || hotel.occupied_rooms || 0,
        monthly_revenue:
          hotel.monthly_revenue || Math.floor(Math.random() * 150000) + 50000,
        total_bookings:
          hotel.total_bookings || Math.floor(Math.random() * 300) + 100,
        created_at:
          hotel.created_at || hotel.createdAt || new Date().toISOString(),
      };
    });
  };

  const displayHotels = getEnrichedHotels();

  // Filter and search logic
  const filteredHotels = displayHotels.filter((hotel) => {
    const matchesSearch =
      hotel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.address?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || hotel.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort logic
  const sortedHotels = [...filteredHotels].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "rating":
        return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
      case "revenue":
        return (b.monthly_revenue || 0) - (a.monthly_revenue || 0);
      case "rooms":
        return (b.total_rooms || 0) - (a.total_rooms || 0);
      case "date":
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Inactive":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <FaCheckCircle className="w-3 h-3" />;
      case "Pending":
        return <FaClock className="w-3 h-3" />;
      case "Inactive":
        return <FaTimesCircle className="w-3 h-3" />;
      default:
        return <FaClock className="w-3 h-3" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      WiFi: <FaWifi />,
      Pool: <FaSwimmingPool />,
      Gym: <FaDumbbell />,
      Parking: <FaCar />,
      Restaurant: <FaCoffee />,
      Spa: <FaConciergeBell />,
      Bar: <FaCoffee />,
      "Business Center": <FaUsers />,
      "Conference Rooms": <FaUsers />,
      Concierge: <FaConciergeBell />,
      "Valet Parking": <FaCar />,
      "Butler Service": <FaConciergeBell />,
      "Fine Dining": <FaCoffee />,
      "Beach Access": <FaSwimmingPool />,
      Fireplace: <FaCoffee />,
      "Hiking Trails": <FaDumbbell />,
    };
    return icons[amenity] || <FaCheckCircle />;
  };

  const openHotelDetails = async (hotel) => {
    // Fetch fresh details when opening modal
    const details = await fetchHotelDetails(hotel.id);
    setSelectedHotel({ ...hotel, ...details });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 md:ml-64 flex items-center justify-center">
        <div className="text-center">
          <FaHotel className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading hotels data...</p>
        </div>
      </div>
    );
  }

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
              Manage all hotels across your platform • {sortedHotels.length}{" "}
              hotels total
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
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === "grid"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === "list"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hotels Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                {/* Hotel Image */}
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-t-xl relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaHotel className="w-12 h-12 text-purple-400" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(
                        hotel.status
                      )}`}
                    >
                      {getStatusIcon(hotel.status)}
                      {hotel.status}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                      <FaStar className="w-3 h-3 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {hotel.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hotel Info */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {hotel.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {hotel.description}
                    </p>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                      {hotel.address ||
                        `${hotel.city || ""}, ${hotel.state || ""}`}
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
                      <div className="text-lg font-semibold text-gray-900">
                        {hotel.total_rooms}
                      </div>
                      <div className="text-xs text-gray-500">Total Rooms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {hotel.available_rooms}
                      </div>
                      <div className="text-xs text-gray-500">Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(hotel.monthly_revenue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Monthly Revenue
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {hotel.amenities.slice(0, 4).map((amenity, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                          >
                            <span className="text-gray-500">
                              {getAmenityIcon(amenity)}
                            </span>
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
                    <button 
                      onClick={() => handleEditHotel(hotel)}
                      className="p-2 border border-gray-300 hover:border-gray-400 rounded-lg text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => confirmDelete(hotel)}
                      className="p-2 border border-red-300 hover:border-red-400 rounded-lg text-red-600 hover:text-red-700 transition-colors duration-200"
                    >
                      <FaTrash className="w-4 h-4" />
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hotel
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rooms
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
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
                            <div className="text-sm font-medium text-gray-900">
                              {hotel.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {hotel.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {hotel.city}, {hotel.state}
                        </div>
                        <div className="text-sm text-gray-500">
                          {hotel.country}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {hotel.total_rooms}
                        </div>
                        <div className="text-sm text-green-600">
                          {hotel.available_rooms} available
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FaStar className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {hotel.rating}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(hotel.monthly_revenue)}
                        </div>
                        <div className="text-sm text-gray-500">per month</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(
                            hotel.status
                          )}`}
                        >
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
                          <button 
                            onClick={() => handleEditHotel(hotel)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => confirmDelete(hotel)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hotels found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Get started by adding your first hotel"}
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
              Add Hotel
            </button>
          </div>
        )}
      </div>

      {/* Edit Hotel Modal */}
      {showEditModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleUpdateHotel}>
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Edit Hotel</h2>
                    <p className="text-gray-600">Update hotel information</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hotel Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={editFormData.phone || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Star Rating
                    </label>
                    <select
                      name="starRating"
                      value={editFormData.starRating || 1}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5].map(rating => (
                        <option key={rating} value={rating}>{rating} Star</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={editFormData.address || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={editFormData.city || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={editFormData.state || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={editFormData.country || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={editFormData.zip || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editFormData.description || ''}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4" />
                        Update Hotel
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTrash className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Hotel
                  </h3>
                  <p className="text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete <strong>{selectedHotel.name}</strong>? 
                  This will permanently remove the hotel and all associated data.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteHotel}
                  disabled={isDeleting}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="w-4 h-4" />
                      Delete Hotel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedHotel.name}
                    </h2>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <FaMapMarkerAlt className="w-4 h-4" />
                      {selectedHotel.address ||
                        `${selectedHotel.city}, ${selectedHotel.state}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Basic Info */}
                <div className="bg-gray-50/70 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Hotel Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FaPhone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {selectedHotel.phone || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaEnvelope className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {selectedHotel.email || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaStar className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-700">
                        {selectedHotel.rating} Rating
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(
                          selectedHotel.status
                        )}`}
                      >
                        {getStatusIcon(selectedHotel.status)}
                        {selectedHotel.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-gray-50/70 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Real-time Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedHotel.total_rooms}
                      </div>
                      <div className="text-sm text-gray-600">Total Rooms</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedHotel.available_rooms}
                      </div>
                      <div className="text-sm text-gray-600">Available</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedHotel.occupied_rooms}
                      </div>
                      <div className="text-sm text-gray-600">Occupied</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedHotel.total_bookings || 0}
                      </div>
                      <div className="text-sm text-gray-600">Bookings</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Details */}
              {selectedHotel.rooms && selectedHotel.rooms.length > 0 && (
                <div className="bg-gray-50/70 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Room Breakdown
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(
                      selectedHotel.rooms.reduce((acc, room) => {
                        const type = room.type || room.room_type || "Standard";
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([type, count]) => (
                      <div
                        key={type}
                        className="bg-white/50 rounded-lg p-3 text-center"
                      >
                        <div className="text-lg font-semibold text-gray-900">
                          {count}
                        </div>
                        <div className="text-sm text-gray-600">
                          {type} Rooms
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-gray-50/70 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedHotel.description}
                </p>
              </div>

              {/* Amenities */}
              {selectedHotel.amenities &&
                selectedHotel.amenities.length > 0 && (
                  <div className="bg-gray-50/70 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Amenities
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {selectedHotel.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-white/50 rounded-lg"
                        >
                          <div className="text-purple-600">
                            {getAmenityIcon(amenity)}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {amenity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Revenue Information */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Revenue Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/70 rounded-lg p-4 text-center">
                    <FaDollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedHotel.monthly_revenue)}
                    </div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-4 text-center">
                    <FaChartLine className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(
                        (selectedHotel.monthly_revenue || 0) * 12
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Annual Projection
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-4 text-center">
                    <FaCalendarAlt className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(
                        (selectedHotel.monthly_revenue || 0) /
                          (selectedHotel.total_bookings || 1)
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg Booking Value
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => {
                    setShowModal(false);
                    handleEditHotel(selectedHotel);
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
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
                <button
                  onClick={() => {
                    setShowModal(false);
                    confirmDelete(selectedHotel);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
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
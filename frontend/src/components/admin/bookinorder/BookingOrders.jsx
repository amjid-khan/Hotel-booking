import React, { useContext, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  Calendar,
  Users,
  Mail,
  Phone,
  Hotel,
  Bed,
  Trash2,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ArrowUpDown,
  Star,
  TrendingUp,
  DollarSign,
} from "lucide-react";

const BookingOrders = () => {
  const {
    user,
    selectedHotelId,
    hotelBookings,
    myBookings,
    fetchHotelBookings,
    fetchMyBookings,
    cancelBooking,
    updateBookingStatus,
    token,
  } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewingBooking, setViewingBooking] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Decide which bookings to show
  const bookingsToShow = user?.role === "user" ? myBookings : hotelBookings;

  // Filter and search bookings
  // const filteredBookings = bookingsToShow?.filter((booking) => {
  //   const matchesSearch =
  //     (booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     booking.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     (booking.roomName || `Room ${booking.roomId}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     booking.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()));

  //   const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

  //   return matchesSearch && matchesStatus;
  // }) || [];

  // Add this function at the top of your BookingOrders component
  const mapBookingData = (booking) => {
    return {
      ...booking,
      roomName:
        booking.roomName || // already mapped
        (booking.Room
          ? `${booking.Room.type} (#${booking.Room.roomNumber})`
          : null) ||
        (booking.room
          ? `${booking.room.type} (#${booking.room.roomNumber})`
          : null) ||
        `Room ${booking.roomId}`, // fallback
      hotelName:
        booking.hotelName || // already mapped
        (booking.Hotel ? booking.Hotel.name : null) ||
        (booking.hotel ? booking.hotel.name : null) ||
        "Unknown Hotel", // fallback
    };
  };

  // Update your filteredBookings useMemo
  const filteredBookings = useMemo(
    () =>
      (bookingsToShow || []).map(mapBookingData).filter((booking) => {
        const matchesSearch =
          booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.guestEmail
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.hotelName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [bookingsToShow, searchTerm, statusFilter]
  );

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case "date":
        aVal = new Date(a.checkIn);
        bVal = new Date(b.checkIn);
        break;
      case "amount":
        aVal = a.totalAmount;
        bVal = b.totalAmount;
        break;
      case "guest":
        aVal = a.guestName;
        bVal = b.guestName;
        break;
      default:
        return 0;
    }

    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Statistics
// Statistics (only confirmed bookings)
const confirmedBookings = filteredBookings.filter(
  (b) => b.status === "confirmed"
);

const stats = {
  total: confirmedBookings.length,
  totalRevenue: confirmedBookings.reduce(
    (sum, b) => sum + (parseFloat(b.totalAmount) || 0),
    0
  ),
  avgAmount: confirmedBookings.length
    ? confirmedBookings.reduce(
        (sum, b) => sum + (parseFloat(b.totalAmount) || 0),
        0
      ) / confirmedBookings.length
    : 0,
  thisMonth: confirmedBookings.filter((b) => {
    const bookingDate = new Date(b.checkIn);
    const now = new Date();
    return (
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear()
    );
  }).length,
};

  // Fetch bookings on mount / hotel change / token change
  useEffect(() => {
    if (!token) return;
    setLoading(true);

    const fetchData = async () => {
      if (user?.role === "user") {
        await fetchMyBookings();
      } else if (selectedHotelId) {
        await fetchHotelBookings(selectedHotelId);
      }
      setLoading(false);
    };

    fetchData();
  }, [token, user, selectedHotelId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleCancel = async (bookingId) => {
    if (!token) {
      alert("No token found — please log in first.");
      return;
    }
    try {
      await cancelBooking(bookingId);
      alert("Booking cancelled successfully!");
    } catch (err) {
      console.error(err.response || err);
      alert(err.response?.data?.message || "Error cancelling booking");
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    if (!token) {
      alert("No token found — please log in first.");
      return;
    }

    setUpdatingStatus(bookingId);
    try {
      await updateBookingStatus(bookingId, newStatus);
      setActiveDropdown(null);
    } catch (err) {
      console.error(err.response || err);
      alert(err.response?.data?.message || "Error updating booking status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const toggleDropdown = (bookingId, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === bookingId ? null : bookingId);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `Rs ${new Intl.NumberFormat("en-PK", {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const getStatusBadge = (status = "confirmed") => {
    const statusConfig = {
      confirmed: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
      },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
      cancelled: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.confirmed;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleViewBooking = (booking) => {
    setViewingBooking(booking);
  };

  const closeViewModal = () => {
    setViewingBooking(null);
  };

  const StatusDropdown = ({ booking }) => {
    const statusOptions = [
      {
        value: "pending",
        label: "Pending",
        icon: Clock,
        color: "text-yellow-600",
      },
      {
        value: "confirmed",
        label: "Confirmed",
        icon: CheckCircle,
        color: "text-green-600",
      },
      {
        value: "cancelled",
        label: "Cancelled",
        icon: XCircle,
        color: "text-red-600",
      },
    ];

    return (
      <div className="dropdown-container relative inline-flex items-center">
        {getStatusBadge(booking.status)}
        {user?.role !== "user" && (
          <>
            <button
              onClick={(e) => toggleDropdown(booking.id, e)}
              className="ml-2 p-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
              title="Change Status"
              disabled={updatingStatus === booking.id}
            >
              {updatingStatus === booking.id ? (
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <MoreHorizontal className="w-3 h-3" />
              )}
            </button>

            {activeDropdown === booking.id && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const isCurrentStatus = booking.status === option.value;

                    return (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleStatusChange(booking.id, option.value)
                        }
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                          isCurrentStatus ? "bg-gray-50 font-medium" : ""
                        }`}
                        disabled={isCurrentStatus}
                      >
                        <Icon className={`w-4 h-4 ${option.color}`} />
                        {option.label}
                        {isCurrentStatus && (
                          <span className="ml-auto text-xs text-gray-500">
                            Current
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 md:pl-64 pt-16 md:pt-0">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 md:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Booking Management
                </h1>
                <p className="text-gray-600 mt-1">
                  {user?.role === "user"
                    ? "Track your reservations"
                    : "Manage hotel bookings"}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Bookings
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Revenue
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm sm:text-base">
                    ₨
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Average Booking
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.avgAmount)}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    This Month
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    {stats.thisMonth}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="guest">Sort by Guest</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={`p-4 md:p-8 transition-all duration-300 ${
          viewingBooking ? "blur-sm" : ""
        }`}
      >
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 sm:p-20">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Loading bookings...
              </h3>
              <p className="text-gray-600">
                Please wait while we fetch your data
              </p>
            </div>
          </div>
        ) : sortedBookings.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {sortedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm sm:text-base">
                            {booking.guestName?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {booking.guestName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {booking.guestEmail}
                          </p>
                        </div>
                      </div>
                      <StatusDropdown booking={booking} />
                    </div>

                    <div className="space-y-2 sm:space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Bed className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="truncate">
                          {booking.roomName || `Room ${booking.roomId}`}
                        </span>
                      </div>
                      {booking.hotelName && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Hotel className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          <span className="truncate">{booking.hotelName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>
                          {formatDate(booking.checkIn)} -{" "}
                          {formatDate(booking.checkOut)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Users className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span>
                          {booking.guests} Guest{booking.guests > 1 ? "s" : ""}
                        </span>
                      </div>
                      {booking.guestPhone && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{booking.guestPhone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-lg sm:text-xl font-bold text-green-600">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Cancel Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 sm:p-20">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters to see more results"
                  : "Bookings will appear here once created"}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Booking Details
                </h2>
                <button
                  onClick={closeViewModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">
                    {viewingBooking.guestName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {viewingBooking.guestName}
                  </h3>
                  <p className="text-gray-600">{viewingBooking.guestEmail}</p>
                  {viewingBooking.guestPhone && (
                    <p className="text-gray-600">{viewingBooking.guestPhone}</p>
                  )}
                </div>
                <div className="ml-auto">
                  {getStatusBadge(viewingBooking.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Accommodation</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-blue-500" />
                      <span>
                        {viewingBooking.roomName ||
                          `Room ${viewingBooking.roomId}`}
                      </span>
                    </div>
                    {viewingBooking.hotelName && (
                      <div className="flex items-center gap-2">
                        <Hotel className="w-4 h-4 text-purple-500" />
                        <span>{viewingBooking.hotelName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-500" />
                      <span>
                        {viewingBooking.guests} Guest
                        {viewingBooking.guests > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Dates</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span>
                        Check-in: {formatDate(viewingBooking.checkIn)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-500" />
                      <span>
                        Check-out: {formatDate(viewingBooking.checkOut)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Total Amount</h4>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(viewingBooking.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingOrders;

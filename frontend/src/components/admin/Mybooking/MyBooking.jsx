import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import useUserPermissions from "../../../contexts/useUserPermissions";
import {
  Calendar,
  Users,
  Phone,
  Hotel,
  Bed,
  Trash2,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ArrowUpDown,
  Star,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

const MyBooking = () => {
  const perms = useUserPermissions();
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
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Decide which bookings to show
  // const bookingsToShow = user?.role === "user" ? myBookings : hotelBookings;
  const bookingsToShow = myBookings;

  // Filter and search bookings
  const filteredBookings =
    bookingsToShow?.filter((booking) => {
      const matchesSearch =
        booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.Hotel?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    }) || [];

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case "date":
        aVal = new Date(a.checkIn);
        bVal = new Date(b.checkIn);
        break;
      case "amount":
        aVal = parseFloat(a.totalAmount) || 0;
        bVal = parseFloat(b.totalAmount) || 0;
        break;
      case "guest":
        aVal = a.guestName || "";
        bVal = b.guestName || "";
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

  // Statistics with real data from actual bookings
  const stats = {
    total: bookingsToShow?.length || 0,
    totalRevenue:
      bookingsToShow?.reduce(
        (sum, b) => sum + (parseFloat(b.totalAmount) || 0),
        0
      ) || 0,
    avgAmount: bookingsToShow?.length
      ? bookingsToShow.reduce(
          (sum, b) => sum + (parseFloat(b.totalAmount) || 0),
          0
        ) / bookingsToShow.length
      : 0,
    thisMonth:
      bookingsToShow?.filter((b) => {
        const bookingDate = new Date(b.checkIn);
        const now = new Date();
        return (
          bookingDate.getMonth() === now.getMonth() &&
          bookingDate.getFullYear() === now.getFullYear()
        );
      }).length || 0,
    confirmed:
      bookingsToShow?.filter((b) => b.status === "confirmed").length || 0,
    pending: bookingsToShow?.filter((b) => b.status === "pending").length || 0,
    cancelled:
      bookingsToShow?.filter((b) => b.status === "cancelled").length || 0,
  };

  // Fetch bookings on mount / hotel change / token change
  // useEffect(() => {
  //   if (!token) return;
  //   setLoading(true);

  //   const fetchData = async () => {
  //     if (user?.role === "user") {
  //       await fetchMyBookings();
  //     } else if (selectedHotelId) {
  //       await fetchHotelBookings(selectedHotelId);
  //     }
  //     setLoading(false);
  //   };

  //   fetchData();
  // }, [token, user, selectedHotelId]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    const fetchData = async () => {
      // ✅ Fetch bookings for the currently selected hotel
      await fetchMyBookings(selectedHotelId);
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
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      // ✅ Refetch data after cancellation for the selected hotel
      if (selectedHotelId) {
        await fetchMyBookings(selectedHotelId);
        await fetchHotelBookings(selectedHotelId);
      }
    } catch (err) {
      console.error(err.response || err);
      alert(err.response?.data?.message || "Error cancelling booking");
    } finally {
      setCancellingId(null);
    }
  };

  // const handleStatusChange = async (bookingId, newStatus) => {
  //   if (!token) {
  //     alert("No token found — please log in first.");
  //     return;
  //   }

  //   setUpdatingStatus(bookingId);
  //   try {
  //     await updateBookingStatus(bookingId, newStatus);
  //     alert(`Booking status updated to ${newStatus} successfully!`);
  //     setActiveDropdown(null);
  //   } catch (err) {
  //     console.error(err.response || err);
  //     alert(err.response?.data?.message || "Error updating booking status");
  //   } finally {
  //     setUpdatingStatus(null);
  //   }
  // };

  // const toggleDropdown = (bookingId, e) => {
  //   e.stopPropagation();
  //   setActiveDropdown(activeDropdown === bookingId ? null : bookingId);
  // };

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

  const StatusDropdown = ({ booking }) => {
    return (
      <div className="dropdown-container relative inline-flex items-center">
        {getStatusBadge(booking.status)}
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
                  My Bookings
                </h1>
                <p className="text-gray-600 mt-1">
                  View and manage your reservations
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total</p>
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
                  <p className="text-gray-600 text-sm font-medium">Confirmed</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    {stats.confirmed}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Cancelled</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    {stats.cancelled}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
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

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="guest">Sort by Guest</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

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
      <div className="p-4 md:p-8">
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
                {sortedBookings.map((booking) => {
                  const hotelName = booking.Hotel?.name || booking.hotelName;
                  const roomName =
                    booking.Room?.type ||
                    booking.roomName ||
                    `Room ${booking.roomId}`;

                  return (
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
                          <span className="truncate">{roomName}</span>
                        </div>
                        {hotelName && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <Hotel className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            <span className="truncate">{hotelName}</span>
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
                            {booking.guests} Guest
                            {booking.guests > 1 ? "s" : ""}
                          </span>
                        </div>
                        {booking.guestPhone && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {booking.guestPhone}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-lg sm:text-xl font-bold text-green-600">
                          {formatCurrency(booking.totalAmount)}
                        </span>
                        <div className="flex items-center gap-2">
                          {booking.status !== "cancelled" &&
                            (user?.role === "admin" ||
                              user?.role === "superadmin" ||
                              perms?.booking?.delete) && (
                              <button
                                onClick={() => handleCancel(booking.id)}
                                className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                                title="Cancel Booking"
                              >
                                <Trash2 className="w-4 h-4" />
                                Cancel Booking
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  : user?.role === "user"
                  ? "You haven't made any bookings yet"
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
    </div>
  );
};

export default MyBooking;
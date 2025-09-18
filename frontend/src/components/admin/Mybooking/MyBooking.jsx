import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  Calendar,
  Users,
  Phone,
  Hotel,
  Bed,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ChevronDown,
  Download,
  Share2
} from "lucide-react";

const MyBooking = () => {
  const { myBookings, fetchMyBookings, cancelBooking, token } =
    useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      await fetchMyBookings();
      setLoading(false);
    };
    fetchData();
  }, [token]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      await fetchMyBookings(); // reload after delete
    } catch (err) {
      console.error(err);
      alert("Error deleting booking");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatCurrency = (amount) =>
    `Rs ${new Intl.NumberFormat("en-PK", {
      maximumFractionDigits: 0,
    }).format(amount)}`;

  // Status badge config
  const getStatusConfig = (status = "pending") => {
    const configs = {
      confirmed: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        icon: CheckCircle,
        dot: "bg-green-500"
      },
      pending: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        icon: Clock,
        dot: "bg-amber-500"
      },
      cancelled: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        icon: XCircle,
        dot: "bg-red-500"
      },
    };
    return configs[status] || configs.pending;
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.border} ${config.text}`}>
        <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
        <Icon className="w-3.5 h-3.5" />
        <span className="text-sm font-medium">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    );
  };

  // Filter and sort bookings
  const filteredBookings = myBookings
    ?.filter((booking) => {
      const hotelName = booking.Hotel?.name || booking.hotelName || "";
      const matchesSearch =
        hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.checkIn) - new Date(a.checkIn);
        case "oldest":
          return new Date(a.checkIn) - new Date(b.checkIn);
        case "amount-high":
          return b.totalAmount - a.totalAmount;
        case "amount-low":
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    }) || [];

  // Stats count
  const stats = {
    total: myBookings?.length || 0,
    confirmed: myBookings?.filter(b => b.status === "confirmed").length || 0,
    pending: myBookings?.filter(b => b.status === "pending").length || 0,
    cancelled: myBookings?.filter(b => b.status === "cancelled").length || 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 md:pl-64 pt-16 md:pt-0 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="mt-6 h-10 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-8 md:pl-64">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
              <p className="text-gray-600">Manage and track your reservations</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Hotel className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
                  <p className="text-sm text-gray-600">Confirmed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
                  <p className="text-sm text-gray-600">Cancelled</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by hotel name or guest name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
                    className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="amount-high">Amount: High to Low</option>
                    <option value="amount-low">Amount: Low to High</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {filteredBookings.map((booking) => {
              const hotelName = booking.Hotel?.name || booking.hotelName;
              const roomName =
                booking.Room?.type ||
                booking.roomName ||
                `Room ${booking.roomId}`;

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 group"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {hotelName}
                        </h3>
                        <p className="text-sm text-gray-600">{booking.guestName}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Bed className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{roomName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-green-600" />
                          </div>
                          <span>
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-orange-600" />
                          </div>
                          <span className="text-gray-700">{booking.guests} Guest(s)</span>
                        </div>
                        {booking.guestPhone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span className="text-xs">{booking.guestPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(booking.totalAmount)}
                      </div>
                      {booking.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {cancellingId === booking.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Hotel className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters to see more results"
                : "You haven't made any bookings yet"}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooking;

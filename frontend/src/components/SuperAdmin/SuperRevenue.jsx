import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import {
  DollarSign,
  TrendingUp,
  Building2,
  Calendar,
  RefreshCw,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from "lucide-react";

const SuperRevenue = () => {
  const {
    token,
    user,
    revenue,
    fetchRevenue,
    allBookings,
    fetchAllBookings,
    allHotels,
    fetchAllHotels,
  } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month, year

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!token || user?.role !== "superadmin") return;

    setLoading(true);
    try {
      await Promise.all([fetchRevenue(), fetchAllBookings(), fetchAllHotels()]);
      setError(null);
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  }, [token, user?.role, fetchRevenue, fetchAllBookings, fetchAllHotels]);

  useEffect(() => {
    if (token && user?.role === "superadmin") {
      fetchAllData();
    }
  }, [token, user?.role]);

  // Calculate revenue statistics
  const calculateRevenueStats = () => {
    if (!allBookings || allBookings.length === 0) {
      return {
        totalRevenue: 0,
        confirmedRevenue: 0,
        pendingRevenue: 0,
        cancelledRevenue: 0,
        hotelRevenueData: [],
        monthlyRevenue: [],
        revenueGrowth: 0,
      };
    }

    const confirmedBookings = allBookings.filter(
      (b) => b.status === "confirmed"
    );
    const pendingBookings = allBookings.filter((b) => b.status === "pending");
    const cancelledBookings = allBookings.filter(
      (b) => b.status === "cancelled"
    );

    const totalRevenue = allBookings.reduce(
      (sum, b) => sum + parseFloat(b.totalAmount || 0),
      0
    );
    const confirmedRevenue = confirmedBookings.reduce(
      (sum, b) => sum + parseFloat(b.totalAmount || 0),
      0
    );
    const pendingRevenue = pendingBookings.reduce(
      (sum, b) => sum + parseFloat(b.totalAmount || 0),
      0
    );
    const cancelledRevenue = cancelledBookings.reduce(
      (sum, b) => sum + parseFloat(b.totalAmount || 0),
      0
    );

    // Group revenue by hotel
    const hotelRevenue = {};
    allBookings.forEach((booking) => {
      const hotelName = booking.hotelName || "Unknown Hotel";
      if (!hotelRevenue[hotelName]) {
        hotelRevenue[hotelName] = {
          total: 0,
          confirmed: 0,
          pending: 0,
          cancelled: 0,
          bookings: 0,
        };
      }
      const amount = parseFloat(booking.totalAmount || 0);
      hotelRevenue[hotelName].total += amount;
      hotelRevenue[hotelName].bookings += 1;

      if (booking.status === "confirmed")
        hotelRevenue[hotelName].confirmed += amount;
      else if (booking.status === "pending")
        hotelRevenue[hotelName].pending += amount;
      else if (booking.status === "cancelled")
        hotelRevenue[hotelName].cancelled += amount;
    });

    const hotelRevenueData = Object.entries(hotelRevenue)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);

    // Calculate monthly revenue for trend
    const monthlyRevenue = {};
    allBookings.forEach((booking) => {
      const date = new Date(booking.createdAt || booking.checkIn);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      if (!monthlyRevenue[monthKey]) monthlyRevenue[monthKey] = 0;
      if (booking.status === "confirmed") {
        monthlyRevenue[monthKey] += parseFloat(booking.totalAmount || 0);
      }
    });

    const monthlyData = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue }));

    // Calculate growth (simple month-over-month)
    let revenueGrowth = 0;
    if (monthlyData.length >= 2) {
      const current = monthlyData[monthlyData.length - 1].revenue;
      const previous = monthlyData[monthlyData.length - 2].revenue;
      revenueGrowth =
        previous > 0 ? ((current - previous) / previous) * 100 : 0;
    }

    return {
      totalRevenue,
      confirmedRevenue,
      pendingRevenue,
      cancelledRevenue,
      hotelRevenueData,
      monthlyRevenue: monthlyData,
      revenueGrowth,
    };
  };

  const stats = calculateRevenueStats();

  // Filter hotels based on search
  const filteredHotels = stats.hotelRevenueData.filter((hotel) => {
    const matchesSearch =
      searchTerm === "" ||
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "high" && hotel.total > 50000) ||
      (activeFilter === "medium" &&
        hotel.total > 10000 &&
        hotel.total <= 50000) ||
      (activeFilter === "low" && hotel.total <= 10000);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-gray-50 transition-all duration-300 ${
          isMobile ? "pl-0 pt-16" : "pl-64"
        } flex items-center justify-center`}
      >
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Loading Revenue Data...
          </h3>
          <p className="text-gray-600 text-center">
            Please wait while we calculate revenue statistics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gray-50 transition-all duration-300 ${
        isMobile ? "pl-0 pt-16" : "pl-64"
      }`}
    >
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Revenue Dashboard
              </h1>
              <p className="text-gray-600">
                Track revenue performance across all hotels
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {stats.revenueGrowth !== 0 && (
                <div
                  className={`flex items-center px-3 py-2 rounded-lg ${
                    stats.revenueGrowth > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {stats.revenueGrowth > 0 ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-sm font-medium">
                    {Math.abs(stats.revenueGrowth).toFixed(1)}% vs last month
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {[
            {
              label: "Total Revenue",
              value: `PKR ${stats.totalRevenue.toLocaleString()}`,
              icon: (
                <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              ),
              bg: "bg-blue-100",
              color: "text-blue-600",
              change:
                stats.revenueGrowth > 0
                  ? `+${stats.revenueGrowth.toFixed(1)}%`
                  : stats.revenueGrowth < 0
                  ? `${stats.revenueGrowth.toFixed(1)}%`
                  : null,
            },
            {
              label: "Confirmed Revenue",
              value: `PKR ${stats.confirmedRevenue.toLocaleString()}`,
              icon: (
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              ),
              bg: "bg-green-100",
              color: "text-green-600",
              subtitle: `${(
                (stats.confirmedRevenue / stats.totalRevenue) * 100 || 0
              ).toFixed(1)}% of total`,
            },
            {
              label: "Pending Revenue",
              value: `PKR ${stats.pendingRevenue.toLocaleString()}`,
              icon: (
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
              ),
              bg: "bg-yellow-100",
              color: "text-yellow-600",
              subtitle: `${(
                (stats.pendingRevenue / stats.totalRevenue) * 100 || 0
              ).toFixed(1)}% of total`,
            },
            {
              label: "Active Hotels",
              value: stats.hotelRevenueData.length,
              icon: (
                <Building2 className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
              ),
              bg: "bg-purple-100",
              color: "text-purple-600",
              subtitle: `Generating revenue`,
            },
          ].map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-lg md:rounded-xl shadow-sm border p-4 md:p-6 h-32 md:h-36 flex flex-col justify-between border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    {card.label}
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
                    {card.value}
                  </p>
                  {card.subtitle && (
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                  )}
                  {card.change && (
                    <p
                      className={`text-xs font-medium mt-1 ${
                        stats.revenueGrowth > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {card.change}
                    </p>
                  )}
                </div>
                <div
                  className={`p-2 md:p-3 ${card.bg} rounded-lg flex-shrink-0`}
                >
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
                placeholder="Search hotels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Hotels</option>
                <option value="high">High Revenue (&gt;50K)</option>
                <option value="medium">Medium Revenue (10K-50K)</option>
                <option value="low">Low Revenue (&lt;10K)</option>
              </select>
              <button
                onClick={fetchAllData}
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
            <div className="flex-shrink-0 mr-3">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Error occurred</h4>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Hotel Revenue Table */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Hotel Revenue Breakdown
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel Name
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confirmed
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Booking
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHotels.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 md:px-6 py-8 md:py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <Building2 className="w-8 h-8 md:h-12 md:w-12 text-gray-400 mb-2 md:mb-4" />
                        <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2">
                          No hotels found
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500">
                          Try adjusting your search terms or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredHotels.map((hotel, index) => (
                    <tr
                      key={hotel.name}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      {/* Hotel Name */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs md:text-base">
                              {hotel.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-3 md:ml-4">
                            <div className="text-xs md:text-sm font-medium text-gray-900">
                              {hotel.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Rank #{index + 1}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total Revenue */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                          <div>
                            <div className="text-xs md:text-sm font-bold text-gray-900">
                              PKR {hotel.total.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(
                                (hotel.total / stats.totalRevenue) *
                                100
                              ).toFixed(1)}
                              % of total
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Confirmed Revenue */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                          <div>
                            <div className="text-xs md:text-sm font-medium text-green-600">
                              PKR {hotel.confirmed.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {hotel.total > 0
                                ? (
                                    (hotel.confirmed / hotel.total) *
                                    100
                                  ).toFixed(1)
                                : 0}
                              % confirmed
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Pending Revenue */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-yellow-500 mr-2" />
                          <div>
                            <div className="text-xs md:text-sm font-medium text-yellow-600">
                              PKR {hotel.pending.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {hotel.total > 0
                                ? ((hotel.pending / hotel.total) * 100).toFixed(
                                    1
                                  )
                                : 0}
                              % pending
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Bookings Count */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-blue-500 mr-2" />
                          <div className="text-xs md:text-sm font-medium text-gray-900">
                            {hotel.bookings}
                          </div>
                        </div>
                      </td>

                      {/* Average Booking Value */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 text-purple-500 mr-2" />
                          <div className="text-xs md:text-sm font-medium text-gray-900">
                            PKR{" "}
                            {hotel.bookings > 0
                              ? (hotel.total / hotel.bookings).toLocaleString(
                                  undefined,
                                  { maximumFractionDigits: 0 }
                                )
                              : 0}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        {filteredHotels.length > 0 && (
          <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm">
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-lg md:text-xl font-bold text-blue-600">
                {filteredHotels.length}
              </div>
              <div className="text-gray-600">Hotels Displayed</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-lg md:text-xl font-bold text-green-600">
                PKR{" "}
                {filteredHotels
                  .reduce((sum, h) => sum + h.total, 0)
                  .toLocaleString()}
              </div>
              <div className="text-gray-600">Combined Revenue</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-lg md:text-xl font-bold text-purple-600">
                PKR{" "}
                {filteredHotels.length > 0
                  ? (
                      filteredHotels.reduce((sum, h) => sum + h.total, 0) /
                      filteredHotels.length
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : 0}
              </div>
              <div className="text-gray-600">Average per Hotel</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperRevenue;

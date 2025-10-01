import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import {
  FileText,
  TrendingUp,
  Building2,
  Users,
  Calendar,
  RefreshCw,
  Search,
  BarChart3,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Eye,
  BedDouble,
  UserCheck,
} from "lucide-react";

const SuperReports = () => {
  const {
    token,
    user,
    allHotels,
    allUsers,
    allBookings,
    revenue,
    fetchAllHotels,
    fetchAllUsers,
    fetchAllBookings,
    fetchRevenue,
    analyticsRevenue,
    monthlyRevenue,
    occupancy,
    fetchAnalyticsRevenue,
    fetchMonthlyRevenue,
    fetchOccupancy,
  } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

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
      await Promise.all([
        fetchAllHotels(),
        fetchAllUsers(),
        fetchAllBookings(),
        fetchRevenue(),
        fetchAnalyticsRevenue(),
        fetchMonthlyRevenue(),
        fetchOccupancy(),
      ]);
      setError(null);
    } catch (err) {
      console.error("Error fetching reports data:", err);
      setError("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  }, [
    token,
    user?.role,
    fetchAllHotels,
    fetchAllUsers,
    fetchAllBookings,
    fetchRevenue,
    fetchAnalyticsRevenue,
    fetchMonthlyRevenue,
    fetchOccupancy,
  ]);

  useEffect(() => {
    if (token && user?.role === "superadmin") {
      fetchAllData();
    }
  }, [token, user?.role]);

  // Calculate comprehensive statistics
  const calculateStats = () => {
    const totalHotels = allHotels?.length || 0;
    const totalUsers = allUsers?.length || 0;
    const totalBookings = allBookings?.length || 0;

    const confirmedBookings =
      allBookings?.filter((b) => b.status === "confirmed").length || 0;
    const pendingBookings =
      allBookings?.filter((b) => b.status === "pending").length || 0;
    const cancelledBookings =
      allBookings?.filter((b) => b.status === "cancelled").length || 0;

    const totalRevenue =
      allBookings?.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0) || 0;
    const confirmedRevenue =
      allBookings
        ?.filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0) || 0;

    // Calculate month-over-month growth
    let revenueGrowth = 0;
    if (monthlyRevenue && monthlyRevenue.length >= 2) {
      const current = parseFloat(monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0);
      const previous = parseFloat(monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0);
      revenueGrowth = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    }

    // Hotel-wise breakdown
    const hotelStats = {};
    allBookings?.forEach((booking) => {
      const hotelName = booking.hotelName || "Unknown";
      if (!hotelStats[hotelName]) {
        hotelStats[hotelName] = {
          bookings: 0,
          revenue: 0,
          confirmed: 0,
          pending: 0,
          cancelled: 0,
        };
      }
      hotelStats[hotelName].bookings += 1;
      hotelStats[hotelName].revenue += parseFloat(booking.totalAmount || 0);
      if (booking.status === "confirmed") hotelStats[hotelName].confirmed += 1;
      if (booking.status === "pending") hotelStats[hotelName].pending += 1;
      if (booking.status === "cancelled") hotelStats[hotelName].cancelled += 1;
    });

    const topHotels = Object.entries(hotelStats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalHotels,
      totalUsers,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue,
      confirmedRevenue,
      revenueGrowth,
      topHotels,
      hotelStats,
    };
  };

  const stats = calculateStats();

  // Filter data based on search
  const filteredHotels = allHotels?.filter((hotel) =>
    hotel.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = allUsers?.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = allBookings?.filter(
    (booking) =>
      booking.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PDF Export Function
  const handleExportPDF = () => {
    setExportLoading(true);
    try {
      const printWindow = window.open('', '_blank');
      
      let reportContent = '';
      
      if (activeTab === 'overview') {
        reportContent = `
          <div class="section">
            <h2>System Overview</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <h3>Total Revenue</h3>
                <p class="metric-value">PKR ${stats.totalRevenue.toLocaleString()}</p>
                <p class="metric-label">${stats.confirmedBookings} confirmed bookings</p>
              </div>
              <div class="metric-card">
                <h3>Active Hotels</h3>
                <p class="metric-value">${stats.totalHotels}</p>
                <p class="metric-label">Properties listed</p>
              </div>
              <div class="metric-card">
                <h3>Total Users</h3>
                <p class="metric-value">${stats.totalUsers}</p>
                <p class="metric-label">Registered users</p>
              </div>
              <div class="metric-card">
                <h3>Total Bookings</h3>
                <p class="metric-value">${stats.totalBookings}</p>
                <p class="metric-label">${stats.pendingBookings} pending</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Booking Status Breakdown</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <strong>Confirmed Bookings:</strong> ${stats.confirmedBookings} (${stats.totalBookings > 0 ? ((stats.confirmedBookings / stats.totalBookings) * 100).toFixed(1) : 0}%)
                <br><small>Revenue: PKR ${stats.confirmedRevenue.toLocaleString()}</small>
              </div>
              <div class="stat-item">
                <strong>Pending Bookings:</strong> ${stats.pendingBookings} (${stats.totalBookings > 0 ? ((stats.pendingBookings / stats.totalBookings) * 100).toFixed(1) : 0}%)
              </div>
              <div class="stat-item">
                <strong>Cancelled Bookings:</strong> ${stats.cancelledBookings} (${stats.totalBookings > 0 ? ((stats.cancelledBookings / stats.totalBookings) * 100).toFixed(1) : 0}%)
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Top 5 Hotels by Revenue</h2>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Hotel Name</th>
                  <th>Total Bookings</th>
                  <th>Confirmed</th>
                  <th>Revenue</th>
                  <th>Avg Booking Value</th>
                </tr>
              </thead>
              <tbody>
                ${stats.topHotels.map((hotel, idx) => `
                  <tr>
                    <td><strong>${idx + 1}</strong></td>
                    <td>${hotel.name}</td>
                    <td>${hotel.bookings}</td>
                    <td>${hotel.confirmed}</td>
                    <td><strong>PKR ${hotel.revenue.toLocaleString()}</strong></td>
                    <td>PKR ${hotel.bookings > 0 ? (hotel.revenue / hotel.bookings).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Monthly Revenue Trend</h2>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Percentage of Max</th>
                </tr>
              </thead>
              <tbody>
                ${monthlyRevenue && monthlyRevenue.length > 0 ? monthlyRevenue.slice(-6).map(item => {
                  const revenue = parseFloat(item.revenue || 0);
                  const maxRevenue = Math.max(...monthlyRevenue.map(d => parseFloat(d.revenue || 0)));
                  const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                  return `
                    <tr>
                      <td>${item.month || 'N/A'}</td>
                      <td><strong>PKR ${revenue.toLocaleString()}</strong></td>
                      <td>${percentage.toFixed(1)}%</td>
                    </tr>
                  `;
                }).join('') : '<tr><td colspan="3" style="text-align: center;">No revenue data available</td></tr>'}
              </tbody>
            </table>
          </div>
        `;
      } else if (activeTab === 'hotels') {
        reportContent = `
          <div class="section">
            <h2>Hotels Directory (${filteredHotels?.length || 0} hotels)</h2>
            <table>
              <thead>
                <tr>
                  <th>Hotel Name</th>
                  <th>Location</th>
                  <th>Total Bookings</th>
                  <th>Confirmed</th>
                  <th>Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredHotels?.map(hotel => {
                  const hotelData = stats.hotelStats[hotel.name] || { bookings: 0, revenue: 0, confirmed: 0 };
                  return `
                    <tr>
                      <td><strong>${hotel.name}</strong></td>
                      <td>${hotel.address || 'N/A'}</td>
                      <td>${hotelData.bookings}</td>
                      <td>${hotelData.confirmed}</td>
                      <td><strong>PKR ${hotelData.revenue.toLocaleString()}</strong></td>
                      <td><span class="status-active">Active</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Summary Statistics</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <strong>Total Hotels:</strong> ${filteredHotels?.length || 0}
              </div>
              <div class="stat-item">
                <strong>Combined Revenue:</strong> PKR ${Object.values(stats.hotelStats).reduce((sum, h) => sum + h.revenue, 0).toLocaleString()}
              </div>
              <div class="stat-item">
                <strong>Total Bookings:</strong> ${Object.values(stats.hotelStats).reduce((sum, h) => sum + h.bookings, 0)}
              </div>
            </div>
          </div>
        `;
      } else if (activeTab === 'bookings') {
        reportContent = `
          <div class="section">
            <h2>All Bookings (${filteredBookings?.length || 0} bookings)</h2>
            <table>
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Email</th>
                  <th>Hotel</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredBookings?.slice(0, 100).map(booking => `
                  <tr>
                    <td><strong>${booking.guestName}</strong></td>
                    <td>${booking.guestEmail || 'N/A'}</td>
                    <td>${booking.hotelName}</td>
                    <td>${booking.roomName}</td>
                    <td>${new Date(booking.checkIn).toLocaleDateString()}</td>
                    <td>${new Date(booking.checkOut).toLocaleDateString()}</td>
                    <td><strong>PKR ${parseFloat(booking.totalAmount || 0).toLocaleString()}</strong></td>
                    <td><span class="status-${booking.status}">${booking.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Booking Summary</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <strong>Total Bookings:</strong> ${filteredBookings?.length || 0}
              </div>
              <div class="stat-item">
                <strong>Combined Revenue:</strong> PKR ${filteredBookings?.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0).toLocaleString()}
              </div>
              <div class="stat-item">
                <strong>Confirmed:</strong> ${filteredBookings?.filter(b => b.status === 'confirmed').length || 0}
              </div>
            </div>
          </div>
        `;
      } else if (activeTab === 'users') {
        reportContent = `
          <div class="section">
            <h2>All Users (${filteredUsers?.length || 0} users)</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Hotel</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredUsers?.map(userData => {
                  const userHotel = allHotels?.find(h => h.id === userData.hotelId);
                  return `
                    <tr>
                      <td><strong>${userData.full_name}</strong></td>
                      <td>${userData.email}</td>
                      <td><span class="status-role">${userData.role}</span></td>
                      <td>${userHotel?.name || 'N/A'}</td>
                      <td><span class="status-active">Active</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>User Statistics</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <strong>Total Users:</strong> ${filteredUsers?.length || 0}
              </div>
              <div class="stat-item">
                <strong>Admins:</strong> ${filteredUsers?.filter(u => u.role === 'admin').length || 0}
              </div>
              <div class="stat-item">
                <strong>Regular Users:</strong> ${filteredUsers?.filter(u => u.role === 'user').length || 0}
              </div>
            </div>
          </div>
        `;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>System Reports - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              background: white;
              color: #1f2937;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #2563eb;
            }
            .header h1 {
              color: #1e40af;
              font-size: 28px;
              margin-bottom: 10px;
            }
            .header .subtitle {
              color: #6b7280;
              font-size: 16px;
              margin-bottom: 5px;
            }
            .header .meta {
              color: #9ca3af;
              font-size: 14px;
              margin-top: 10px;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section h2 {
              color: #1f2937;
              font-size: 20px;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 2px solid #e5e7eb;
            }
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .metric-card {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .metric-card h3 {
              color: #6b7280;
              font-size: 13px;
              margin-bottom: 8px;
            }
            .metric-value {
              color: #1f2937;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .metric-label {
              color: #9ca3af;
              font-size: 12px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .stat-item {
              background: #f9fafb;
              padding: 12px;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              font-size: 13px;
            }
            th {
              background: #f3f4f6;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
            }
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #e5e7eb;
              color: #4b5563;
            }
            tr:hover {
              background: #f9fafb;
            }
            .status-confirmed, .status-active {
              background: #dcfce7;
              color: #166534;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
            }
            .status-pending {
              background: #fef3c7;
              color: #92400e;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
            }
            .status-cancelled {
              background: #fee2e2;
              color: #991b1b;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
            }
            .status-role {
              background: #dbeafe;
              color: #1e40af;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
              text-transform: capitalize;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #9ca3af;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>System Reports - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <div class="subtitle">Hotel Management System - Super Admin Dashboard</div>
            <div class="meta">
              <strong>Generated:</strong> ${new Date().toLocaleString()} | 
              <strong>Generated By:</strong> ${user?.full_name || 'Super Admin'}
              ${stats.revenueGrowth !== 0 ? ` | <strong>MoM Growth:</strong> ${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth.toFixed(1)}%` : ''}
            </div>
          </div>
          
          ${reportContent}
          
          <div class="footer">
            <p>This report was automatically generated by the Hotel Management System</p>
            <p>© ${new Date().getFullYear()} Hotel Management System. All rights reserved.</p>
            <p style="margin-top: 5px;">Confidential - For Internal Use Only</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-gray-50 transition-all duration-300 ${
          isMobile ? "pl-0 pt-16" : "pl-64"
        } flex items-center justify-center`}
      >
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Loading Reports...
          </h3>
          <p className="text-gray-600 text-center">
            Generating comprehensive system reports
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                System Reports
              </h1>
              <p className="text-gray-600">
                Comprehensive analytics and performance insights
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
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
                    {Math.abs(stats.revenueGrowth).toFixed(1)}% MoM
                  </span>
                </div>
              )}
              <button
                onClick={handleExportPDF}
                disabled={exportLoading}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                {exportLoading ? 'Exporting...' : 'Export PDF'}
              </button>
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

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {[
            {
              label: "Total Revenue",
              value: `PKR ${stats.totalRevenue.toLocaleString()}`,
              icon: <DollarSign className="h-5 w-5 md:h-6 md:w-6" />,
              bg: "bg-blue-100",
              color: "text-blue-600",
              subtitle: `${stats.confirmedBookings} confirmed`,
            },
            {
              label: "Active Hotels",
              value: stats.totalHotels,
              icon: <Building2 className="h-5 w-5 md:h-6 md:w-6" />,
              bg: "bg-purple-100",
              color: "text-purple-600",
              subtitle: "Properties listed",
            },
            {
              label: "Total Users",
              value: stats.totalUsers,
              icon: <Users className="h-5 w-5 md:h-6 md:w-6" />,
              bg: "bg-green-100",
              color: "text-green-600",
              subtitle: "Registered users",
            },
            {
              label: "Total Bookings",
              value: stats.totalBookings,
              icon: <Calendar className="h-5 w-5 md:h-6 md:w-6" />,
              bg: "bg-yellow-100",
              color: "text-yellow-600",
              subtitle: `${stats.pendingBookings} pending`,
            },
          ].map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-lg md:rounded-xl shadow-sm border p-4 md:p-6 border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    {card.label}
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500">{card.subtitle}</p>
                </div>
                <div className={`p-2 md:p-3 ${card.bg} rounded-lg flex-shrink-0`}>
                  <span className={card.color}>{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {[
            {
              label: "Confirmed Bookings",
              value: stats.confirmedBookings,
              icon: <CheckCircle className="h-5 w-5" />,
              color: "text-green-600",
              bg: "bg-green-50",
              border: "border-green-200",
              revenue: stats.confirmedRevenue,
            },
            {
              label: "Pending Bookings",
              value: stats.pendingBookings,
              icon: <Clock className="h-5 w-5" />,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
              border: "border-yellow-200",
            },
            {
              label: "Cancelled Bookings",
              value: stats.cancelledBookings,
              icon: <XCircle className="h-5 w-5" />,
              color: "text-red-600",
              bg: "bg-red-50",
              border: "border-red-200",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className={`${card.bg} rounded-lg md:rounded-xl p-4 md:p-6 border ${card.border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.color} p-2 rounded-lg bg-white`}>
                  {card.icon}
                </div>
                <span className={`text-xs md:text-sm font-medium ${card.color}`}>
                  {stats.totalBookings > 0
                    ? ((card.value / stats.totalBookings) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                {card.label}
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {card.value}
              </p>
              {card.revenue && (
                <p className="text-xs text-gray-600 mt-2">
                  Revenue: PKR {card.revenue.toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 mb-6 md:mb-8 overflow-x-auto">
          <div className="flex space-x-2 p-2">
            {[
              { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
              { id: "hotels", label: "Hotels", icon: <Building2 className="h-4 w-4" /> },
              { id: "bookings", label: "Bookings", icon: <Calendar className="h-4 w-4" /> },
              { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        {activeTab !== "overview" && (
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6 md:space-y-8">
            {/* Top Hotels */}
            <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Top 5 Hotels by Revenue
              </h2>
              <div className="space-y-3">
                {stats.topHotels.map((hotel, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center flex-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-full flex items-center justify-center font-bold mr-3 text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm md:text-base">
                          {hotel.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {hotel.bookings} bookings • {hotel.confirmed} confirmed
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-900 text-sm md:text-base">
                        PKR {hotel.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Avg: PKR{" "}
                        {hotel.bookings > 0
                          ? (hotel.revenue / hotel.bookings).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })
                          : 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Monthly Revenue Trend
              </h2>
              {monthlyRevenue && monthlyRevenue.length > 0 ? (
                <div className="space-y-4">
                  {monthlyRevenue.slice(-6).map((item, idx) => {
                    const revenue = parseFloat(item.revenue || 0);
                    const maxRevenue = Math.max(
                      ...monthlyRevenue.map((d) => parseFloat(d.revenue || 0))
                    );
                    const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs md:text-sm font-medium text-gray-700">
                            {item.month || `Month ${idx + 1}`}
                          </span>
                          <span className="text-xs md:text-sm font-bold text-gray-900">
                            PKR {revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 md:h-4">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 md:h-4 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No revenue data available
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "hotels" && (
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                Hotels Directory ({filteredHotels?.length || 0})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hotel Name
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Location
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Bookings
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Revenue
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHotels?.map((hotel) => {
                    const hotelData = stats.hotelStats[hotel.name] || {
                      bookings: 0,
                      revenue: 0,
                    };
                    return (
                      <tr
                        key={hotel.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs md:text-sm">
                              {hotel.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-xs md:text-sm font-medium text-gray-900">
                                {hotel.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs md:text-sm text-gray-600">
                            {hotel.address || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs md:text-sm font-medium text-gray-900">
                            {hotelData.bookings}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs md:text-sm font-bold text-gray-900">
                            PKR {hotelData.revenue.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                All Bookings ({filteredBookings?.length || 0})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Guest Name
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hotel
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Room
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Check-in
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings?.slice(0, 50).map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm font-medium text-gray-900">
                          {booking.guestName}
                        </div>
                        <div className="text-xs text-gray-500">{booking.guestEmail}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm text-gray-900">
                          {booking.hotelName}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm text-gray-900">
                          {booking.roomName}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm text-gray-600">
                          {new Date(booking.checkIn).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm font-bold text-gray-900">
                          PKR {parseFloat(booking.totalAmount || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                All Users ({filteredUsers?.length || 0})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hotel
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers?.map((userData) => {
                    const userHotel = allHotels?.find((h) => h.id === userData.hotelId);
                    return (
                      <tr
                        key={userData.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-xs md:text-sm">
                              {userData.full_name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="ml-3">
                              <div className="text-xs md:text-sm font-medium text-gray-900">
                                {userData.full_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs md:text-sm text-gray-600">
                            {userData.email}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                            {userData.role}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs md:text-sm text-gray-600">
                            {userHotel?.name || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Footer for filtered data */}
        {activeTab !== "overview" && (
          <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <div className="text-lg md:text-xl font-bold text-blue-600">
                {activeTab === "hotels"
                  ? filteredHotels?.length || 0
                  : activeTab === "bookings"
                  ? filteredBookings?.length || 0
                  : filteredUsers?.length || 0}
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Total {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </div>
            </div>
            {activeTab === "bookings" && (
              <>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div className="text-lg md:text-xl font-bold text-green-600">
                    PKR{" "}
                    {filteredBookings
                      ?.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Combined Revenue</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div className="text-lg md:text-xl font-bold text-purple-600">
                    {filteredBookings?.filter((b) => b.status === "confirmed").length || 0}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Confirmed Bookings
                  </div>
                </div>
              </>
            )}
            {activeTab === "hotels" && (
              <>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div className="text-lg md:text-xl font-bold text-green-600">
                    PKR{" "}
                    {Object.values(stats.hotelStats)
                      .reduce((sum, h) => sum + h.revenue, 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div className="text-lg md:text-xl font-bold text-purple-600">
                    {Object.values(stats.hotelStats).reduce(
                      (sum, h) => sum + h.bookings,
                      0
                    )}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Total Bookings</div>
                </div>
              </>
            )}
            {activeTab === "users" && (
              <>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div className="text-lg md:text-xl font-bold text-green-600">
                    {filteredUsers?.filter((u) => u.role === "admin").length || 0}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Admins</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div className="text-lg md:text-xl font-bold text-purple-600">
                    {filteredUsers?.filter((u) => u.role === "user").length || 0}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Regular Users</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
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
      </div>
    </div>
  );
};

export default SuperReports;
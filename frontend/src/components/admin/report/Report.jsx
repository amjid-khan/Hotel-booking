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
  const { 
    hotelName, 
    selectedHotelId, 
    rooms, 
    users, 
    token,
    hotelBookings, // Use hotelBookings from AuthContext
    fetchHotelBookings // Function to refresh bookings
  } = useContext(AuthContext);
  
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('this-month');
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Use hotelBookings from AuthContext instead of separate state
  const bookingsData = hotelBookings || [];

  // Refresh data when component mounts or filters change
  useEffect(() => {
    if (selectedHotelId && token && fetchHotelBookings) {
      fetchHotelBookings(selectedHotelId);
    }
  }, [selectedHotelId, token, dateRange, fetchHotelBookings]);

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

  // Calculate real occupancy rate from actual bookings
  const calculateOccupancyRate = () => {
    if (!rooms.length) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count active bookings (confirmed and within current dates)
    const activeBookings = bookingsData.filter(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      
      return (
        booking.status === 'confirmed' &&
        checkIn <= today &&
        checkOut > today
      );
    });

    return Math.round((activeBookings.length / rooms.length) * 100);
  };

  // Calculate total revenue from actual bookings
  const calculateTotalRevenue = () => {
    return bookingsData
      .filter(booking => booking.status === 'confirmed')
      .reduce((total, booking) => {
        return total + (Number(booking.totalAmount) || 0);
      }, 0);
  };

  // Get active staff count
  const getActiveStaffCount = () => {
    return users.filter(user => user.status === 'active' && user.role !== 'admin').length;
  };

  // Get currently checked-in guests from real bookings
  const getCheckedInGuests = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookingsData.filter(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      
      return (
        booking.status === 'confirmed' &&
        checkIn <= today &&
        checkOut > today
      );
    }).length;
  };

  // Get today's check-ins and check-outs from real data
  const getTodayActivity = () => {
    const today = new Date().toDateString();
    
    const checkIns = bookingsData.filter(booking => {
      const checkInDate = new Date(booking.checkIn).toDateString();
      return checkInDate === today && booking.status === 'confirmed';
    }).length;

    const checkOuts = bookingsData.filter(booking => {
      const checkOutDate = new Date(booking.checkOut).toDateString();
      return checkOutDate === today && booking.status === 'confirmed';
    }).length;

    return { checkIns, checkOuts };
  };

  // Get occupied rooms count
  const getOccupiedRooms = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookingsData.filter(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      
      return (
        booking.status === 'confirmed' &&
        checkIn <= today &&
        checkOut > today
      );
    }).length;
  };

  const overviewCards = [
    {
      title: 'Total Rooms',
      value: rooms.length,
      icon: Bed,
      color: 'from-blue-500 to-blue-600',
      change: `${rooms.length - getOccupiedRooms()} Available`
    },
    {
      title: 'Occupancy Rate',
      value: `${calculateOccupancyRate()}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      change: `${getOccupiedRooms()} Occupied`
    },
    {
      title: 'Total Revenue',
      value: `PKR ${calculateTotalRevenue().toLocaleString()}`,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      change: `${bookingsData.filter(b => b.status === 'confirmed').length} Bookings`
    },
    {
      title: 'Active Staff',
      value: getActiveStaffCount(),
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      change: `${users.length} Total Staff`
    }
  ];

  // const handleExportReport = async () => {
  //   setLoading(true);
  //   try {
  //     // Create export data from real booking data
  //     const exportData = {
  //       hotel: hotelName,
  //       reportType: selectedReport,
  //       dateRange: dateRange,
  //       totalRooms: rooms.length,
  //       occupancyRate: calculateOccupancyRate(),
  //       totalRevenue: calculateTotalRevenue(),
  //       totalBookings: bookingsData.length,
  //       confirmedBookings: bookingsData.filter(b => b.status === 'confirmed').length,
  //       bookings: bookingsData.map(booking => ({
  //         guestName: booking.guestName,
  //         checkIn: booking.checkIn,
  //         checkOut: booking.checkOut,
  //         totalAmount: booking.totalAmount,
  //         status: booking.status
  //       }))
  //     };
      
  //     // For now, create a downloadable JSON file
  //     const dataStr = JSON.stringify(exportData, null, 2);
  //     const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
  //     const exportFileDefaultName = `${selectedReport}-report-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
      
  //     const linkElement = document.createElement('a');
  //     linkElement.setAttribute('href', dataUri);
  //     linkElement.setAttribute('download', exportFileDefaultName);
  //     linkElement.click();
      
  //   } catch (error) {
  //     console.error('Export failed:', error);
  //     alert('Export failed. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleExportReport = async () => {
    setLoading(true);
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      const { checkIns, checkOuts } = getTodayActivity();
      const occupancyRate = calculateOccupancyRate();
      const totalRevenue = calculateTotalRevenue();
      const confirmedBookings = bookingsData.filter(b => b.status === 'confirmed');
      
      // Generate PDF content based on report type
      let reportContent = '';
      
      if (selectedReport === 'overview') {
        reportContent = `
          <div class="section">
            <h2>Key Metrics</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <h3>Total Rooms</h3>
                <p class="metric-value">${rooms.length}</p>
                <p class="metric-label">${rooms.length - getOccupiedRooms()} Available</p>
              </div>
              <div class="metric-card">
                <h3>Occupancy Rate</h3>
                <p class="metric-value">${occupancyRate}%</p>
                <p class="metric-label">${getOccupiedRooms()} Occupied</p>
              </div>
              <div class="metric-card">
                <h3>Total Revenue</h3>
                <p class="metric-value">PKR ${totalRevenue.toLocaleString()}</p>
                <p class="metric-label">${confirmedBookings.length} Bookings</p>
              </div>
              <div class="metric-card">
                <h3>Active Staff</h3>
                <p class="metric-value">${getActiveStaffCount()}</p>
                <p class="metric-label">${users.length} Total Staff</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Today's Activity</h2>
            <div class="activity-grid">
              <div class="activity-item">
                <strong>Check-ins:</strong> ${checkIns}
              </div>
              <div class="activity-item">
                <strong>Check-outs:</strong> ${checkOuts}
              </div>
              <div class="activity-item">
                <strong>Current Guests:</strong> ${getCheckedInGuests()}
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Recent Bookings</h2>
            <table>
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${bookingsData.slice(0, 10).map(booking => `
                  <tr>
                    <td>${booking.guestName || 'Guest'}</td>
                    <td>${booking.roomName || `Room ${booking.roomId}`}</td>
                    <td>${new Date(booking.checkIn).toLocaleDateString()}</td>
                    <td>${new Date(booking.checkOut).toLocaleDateString()}</td>
                    <td>PKR ${Number(booking.totalAmount || 0).toLocaleString()}</td>
                    <td><span class="status-${booking.status}">${booking.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (selectedReport === 'occupancy') {
        reportContent = `
          <div class="section">
            <h2>Occupancy Statistics</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <strong>Total Rooms:</strong> ${rooms.length}
              </div>
              <div class="stat-item">
                <strong>Available Rooms:</strong> ${rooms.length - getOccupiedRooms()}
              </div>
              <div class="stat-item">
                <strong>Occupied Rooms:</strong> ${getOccupiedRooms()}
              </div>
              <div class="stat-item">
                <strong>Occupancy Rate:</strong> ${occupancyRate}%
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Room Status Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Room Type</th>
                  <th>Status</th>
                  <th>Guest</th>
                  <th>Check-out Date</th>
                </tr>
              </thead>
              <tbody>
                ${rooms.map(room => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const booking = bookingsData.find(b => {
                    const checkIn = new Date(b.checkIn);
                    const checkOut = new Date(b.checkOut);
                    checkIn.setHours(0, 0, 0, 0);
                    checkOut.setHours(0, 0, 0, 0);
                    return b.roomId === room.id && b.status === 'confirmed' && checkIn <= today && checkOut > today;
                  });
                  return `
                    <tr>
                      <td>${room.roomNumber || room.id}</td>
                      <td>${room.type}</td>
                      <td><span class="status-${booking ? 'occupied' : 'available'}">${booking ? 'Occupied' : 'Available'}</span></td>
                      <td>${booking ? booking.guestName : '-'}</td>
                      <td>${booking ? new Date(booking.checkOut).toLocaleDateString() : '-'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (selectedReport === 'revenue') {
        const avgBookingValue = confirmedBookings.length > 0 ? Math.round(totalRevenue / confirmedBookings.length) : 0;
        reportContent = `
          <div class="section">
            <h2>Revenue Summary</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <h3>Total Revenue</h3>
                <p class="metric-value">PKR ${totalRevenue.toLocaleString()}</p>
              </div>
              <div class="metric-card">
                <h3>Average Booking Value</h3>
                <p class="metric-value">PKR ${avgBookingValue.toLocaleString()}</p>
              </div>
              <div class="metric-card">
                <h3>Total Bookings</h3>
                <p class="metric-value">${bookingsData.length}</p>
              </div>
              <div class="metric-card">
                <h3>Confirmed Bookings</h3>
                <p class="metric-value">${confirmedBookings.length}</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Revenue Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${confirmedBookings.map(booking => `
                  <tr>
                    <td>${booking.guestName || `Booking #${booking.id}`}</td>
                    <td>${booking.roomName || `Room ${booking.roomId}`}</td>
                    <td>${new Date(booking.checkIn).toLocaleDateString()}</td>
                    <td>${new Date(booking.checkOut).toLocaleDateString()}</td>
                    <td><strong>PKR ${Number(booking.totalAmount || 0).toLocaleString()}</strong></td>
                    <td>${new Date(booking.createdAt || booking.checkIn).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (selectedReport === 'guests') {
        reportContent = `
          <div class="section">
            <h2>Guest Information</h2>
            <table>
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${bookingsData.map(booking => `
                  <tr>
                    <td>${booking.guestName || 'Guest'}</td>
                    <td>${booking.guestEmail || '-'}</td>
                    <td>${booking.guestPhone || '-'}</td>
                    <td>${booking.roomName || `Room ${booking.roomId}`}</td>
                    <td>${new Date(booking.checkIn).toLocaleDateString()}</td>
                    <td>${new Date(booking.checkOut).toLocaleDateString()}</td>
                    <td><span class="status-${booking.status}">${booking.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (selectedReport === 'performance') {
        reportContent = `
          <div class="section">
            <h2>Staff Overview</h2>
            <table>
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${users.filter(user => user.role !== 'admin').map(staff => `
                  <tr>
                    <td>${staff.full_name}</td>
                    <td>${staff.email}</td>
                    <td>${staff.role}</td>
                    <td><span class="status-${staff.status}">${staff.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${reportTypes.find(r => r.id === selectedReport)?.title} - ${hotelName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              background: white;
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
            .header .hotel-name {
              color: #6b7280;
              font-size: 18px;
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
            .activity-grid, .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .activity-item, .stat-item {
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
            .status-confirmed, .status-active, .status-available {
              background: #dbeafe;
              color: #1e40af;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
            }
            .status-pending {
              background: #fed7aa;
              color: #c2410c;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
            }
            .status-cancelled, .status-inactive {
              background: #fecaca;
              color: #991b1b;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
            }
            .status-occupied {
              background: #fecaca;
              color: #991b1b;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
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
            <h1>${reportTypes.find(r => r.id === selectedReport)?.title}</h1>
            <div class="hotel-name">${hotelName || 'Hotel Management System'}</div>
            <div class="meta">
              <strong>Date Range:</strong> ${dateRanges.find(r => r.value === dateRange)?.label} | 
              <strong>Generated:</strong> ${new Date().toLocaleString()}
            </div>
          </div>
          
          ${reportContent}
          
          <div class="footer">
            <p>This report was automatically generated by the Hotel Management System</p>
            <p>© ${new Date().getFullYear()} ${hotelName || 'Hotel Management System'}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
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
                        booking.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {booking.guestName || 'Guest'} - {booking.roomName || `Room ${booking.roomId}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">PKR {Number(booking.totalAmount || 0).toLocaleString()}</p>
                      <p className={`text-xs capitalize px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                        booking.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                        booking.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-gray-50 text-gray-600'
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

  const renderOccupancyReport = () => {
    const occupiedRooms = getOccupiedRooms();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Status Overview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Room Status</h3>
            <div className="space-y-4">
              {rooms.map((room, index) => {
                // Find booking for this room
                const booking = bookingsData.find(b => {
                  const checkIn = new Date(b.checkIn);
                  const checkOut = new Date(b.checkOut);
                  checkIn.setHours(0, 0, 0, 0);
                  checkOut.setHours(0, 0, 0, 0);
                  
                  return (
                    b.roomId === room.id && 
                    b.status === 'confirmed' &&
                    checkIn <= today &&
                    checkOut > today
                  );
                });
                
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
                        <p className="font-medium text-gray-800">Room {room.roomNumber || room.id}</p>
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
                <span className="font-bold text-green-600">{rooms.length - occupiedRooms}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <span className="text-gray-700">Occupied Rooms</span>
                <span className="font-bold text-red-600">{occupiedRooms}</span>
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
  };

  const renderRevenueReport = () => {
    const confirmedBookings = bookingsData.filter(b => b.status === 'confirmed');
    const totalRevenue = calculateTotalRevenue();
    const avgBookingValue = confirmedBookings.length > 0 ? Math.round(totalRevenue / confirmedBookings.length) : 0;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Total Revenue</h4>
            <p className="text-3xl font-bold text-green-600">PKR {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Average Booking Value</h4>
            <p className="text-3xl font-bold text-blue-600">PKR {avgBookingValue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Total Bookings</h4>
            <p className="text-3xl font-bold text-purple-600">{bookingsData.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Breakdown by Booking</h3>
          <div className="space-y-3">
            {confirmedBookings.map((booking, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{booking.guestName || `Booking #${booking.id}`}</p>
                  <p className="text-sm text-gray-600">{booking.roomName || `Room ${booking.roomId}`}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">PKR {Number(booking.totalAmount || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{new Date(booking.createdAt || booking.checkIn).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

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
                <p className="text-sm text-gray-600">{booking.roomName || `Room ${booking.roomId}`}</p>
                <p className="text-sm text-gray-600">
                  {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                </p>
                <p className={`text-xs capitalize px-2 py-1 rounded-full mt-1 ${
                  booking.status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                  booking.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {booking.status}
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
      <div className="min-h-screen bg-gray-50 md:pl-64 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">No Hotel Selected</h2>
          <p className="text-gray-500">Please select a hotel to view reports</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:pl-64 pt-[80px] md:pt-0">
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
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
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
            <div className="flex items-center gap-4 flex-wrap">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
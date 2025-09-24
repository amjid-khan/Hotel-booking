import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building2, 
  CalendarDays,
  Bed,
  Activity,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Filter,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const SuperAnalytics = () => {
  const {
    analyticsRevenue,
    monthlyRevenue,
    occupancy,
    fetchAnalyticsRevenue,
    fetchMonthlyRevenue,
    fetchOccupancy,
    allHotels,
    allUsers,
    allBookings,
    fetchAllBookings,
    revenue
  } = useContext(AuthContext);

  const [timeFilter, setTimeFilter] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAnalyticsRevenue(),
          fetchMonthlyRevenue(),
          fetchOccupancy(),
          fetchAllBookings()
        ]);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeFilter]);

  // Calculate metrics safely
  const totalRevenue = typeof revenue === 'number' ? revenue : 
    (allBookings?.filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0) || 0);

  const totalHotels = allHotels?.length || 0;
  const totalUsers = allUsers?.length || 0;
  const totalBookings = allBookings?.length || 0;

  // Calculate occupancy percentage safely
  const occupancyRate = occupancy && occupancy.total > 0 ? 
    ((occupancy.occupied / occupancy.total) * 100).toFixed(1) : '0';

  // Process booking status data
  const bookingStatusData = [
    { 
      name: 'Confirmed', 
      value: allBookings?.filter(b => b.status === 'confirmed').length || 0, 
      color: '#10B981' 
    },
    { 
      name: 'Pending', 
      value: allBookings?.filter(b => b.status === 'pending').length || 0, 
      color: '#F59E0B' 
    },
    { 
      name: 'Cancelled', 
      value: allBookings?.filter(b => b.status === 'cancelled').length || 0, 
      color: '#EF4444' 
    },
    { 
      name: 'Completed', 
      value: allBookings?.filter(b => b.status === 'completed').length || 0, 
      color: '#8B5CF6' 
    }
  ];

  // Generate realistic monthly revenue data based on bookings
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const monthBookings = allBookings?.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate.getMonth() === index && bookingDate.getFullYear() === new Date().getFullYear();
      }) || [];
      
      const monthRevenue = monthBookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
      
      return {
        month,
        revenue: monthRevenue,
        bookings: monthBookings.length
      };
    }).slice(0, currentMonth + 1);
  };

  const chartData = generateMonthlyData();

  // Hotel performance data
  const hotelPerformanceData = allHotels?.map(hotel => {
    const hotelBookings = allBookings?.filter(b => 
      b.hotelName?.toLowerCase().includes(hotel.name?.toLowerCase())
    ) || [];
    
    const hotelRevenue = hotelBookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
    
    const hotelOccupancy = Math.min(100, Math.max(0, 
      hotelBookings.length > 0 ? (hotelBookings.filter(b => b.status === 'confirmed').length / hotelBookings.length) * 100 : 0
    ));

    return {
      name: hotel.name || 'Unnamed Hotel',
      revenue: hotelRevenue,
      occupancy: hotelOccupancy.toFixed(1),
      totalBookings: hotelBookings.length
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5) || [];

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }) => (
    <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-gray-600 text-xs lg:text-sm font-medium truncate">{title}</p>
          <p className="text-xl lg:text-3xl font-bold text-gray-900 mt-1 lg:mt-2 truncate">{value}</p>
          {trend && (
            <div className={`flex items-center mt-1 lg:mt-2 text-xs lg:text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              <span className="ml-1 truncate">{trendValue}% vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-2 lg:p-3 rounded-lg lg:rounded-xl bg-${color}-50 flex-shrink-0 ml-3`}>
          <Icon className={`text-${color}-600`} size={isMobile ? 20 : 24} />
        </div>
      </div>
    </div>
  );

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAnalyticsRevenue(),
        fetchMonthlyRevenue(),
        fetchOccupancy(),
        fetchAllBookings()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isMobile ? 'pl-0 pt-16' : 'pl-64'} flex items-center justify-center`}>
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-lg border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Analytics...</h3>
          <p className="text-gray-600 text-center">Fetching comprehensive hotel data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isMobile ? 'pl-0 pt-16' : 'pl-64'}`}>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive overview of all hotels performance</p>
            </div>
            <button
              onClick={refreshData}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 border border-blue-200 self-start lg:self-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 lg:mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
            {['daily', 'weekly', 'monthly', 'yearly'].map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 lg:px-4 py-2 rounded-md text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${
                  timeFilter === filter
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <StatCard
            title="Total Revenue"
            value={`PKR ${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend="up"
            trendValue="12.5"
            color="green"
          />
          <StatCard
            title="Total Hotels"
            value={totalHotels.toString()}
            icon={Building2}
            trend="up"
            trendValue="8.2"
            color="blue"
          />
          <StatCard
            title="Total Users"
            value={totalUsers.toString()}
            icon={Users}
            trend="up"
            trendValue="15.3"
            color="purple"
          />
          <StatCard
            title="Occupancy Rate"
            value={`${occupancyRate}%`}
            icon={Bed}
            trend={parseFloat(occupancyRate) > 70 ? 'up' : 'down'}
            trendValue="2.1"
            color="orange"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Revenue Trend */}
          <div className="lg:col-span-2 bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6 space-y-2 lg:space-y-0">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">Revenue Trend</h3>
              <div className="flex items-center space-x-2">
                <Activity className="text-green-500" size={18} />
                <span className="text-green-500 font-medium text-sm">+{((chartData.reduce((sum, item) => sum + item.revenue, 0) / 1000000) * 12.5).toFixed(1)}%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" fontSize={isMobile ? 12 : 14} />
                <YAxis stroke="#666" fontSize={isMobile ? 12 : 14} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: isMobile ? '12px' : '14px'
                  }}
                  formatter={(value, name) => [
                    `PKR ${value.toLocaleString()}`,
                    name === 'revenue' ? 'Revenue' : 'Bookings'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={isMobile ? 2 : 3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: isMobile ? 4 : 6 }}
                  activeDot={{ r: isMobile ? 6 : 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Status */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">Booking Status</h3>
              <PieChart className="text-blue-500" size={18} />
            </div>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
              <RechartsPieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 40 : 50}
                  outerRadius={isMobile ? 70 : 90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {bookingStatusData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-xs lg:text-sm text-gray-600">{entry.name}</span>
                  </div>
                  <span className="text-xs lg:text-sm font-medium">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hotel Performance Table */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 mb-6 lg:mb-8">
          <div className="p-4 lg:p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">Top Performing Hotels</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <BarChart3 className="text-blue-500" size={18} />
                <span>Last 30 days</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 lg:py-4 px-4 lg:px-6 text-xs lg:text-sm font-semibold text-gray-900">Hotel Name</th>
                  <th className="text-left py-3 lg:py-4 px-4 lg:px-6 text-xs lg:text-sm font-semibold text-gray-900">Revenue</th>
                  <th className="text-left py-3 lg:py-4 px-4 lg:px-6 text-xs lg:text-sm font-semibold text-gray-900">Occupancy</th>
                  <th className="text-left py-3 lg:py-4 px-4 lg:px-6 text-xs lg:text-sm font-semibold text-gray-900">Bookings</th>
                  <th className="text-left py-3 lg:py-4 px-4 lg:px-6 text-xs lg:text-sm font-semibold text-gray-900">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hotelPerformanceData.length > 0 ? hotelPerformanceData.map((hotel, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 lg:py-4 px-4 lg:px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center text-white font-bold text-xs lg:text-sm mr-3 flex-shrink-0">
                          {hotel.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 text-sm lg:text-base truncate">{hotel.name}</span>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-4 lg:px-6 text-gray-900 font-medium text-sm lg:text-base">
                      PKR {hotel.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 lg:py-4 px-4 lg:px-6">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[60px] lg:max-w-none">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, hotel.occupancy)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs lg:text-sm font-medium text-gray-900 whitespace-nowrap">{hotel.occupancy}%</span>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-4 lg:px-6 text-gray-900 text-sm lg:text-base">{hotel.totalBookings}</td>
                    <td className="py-3 lg:py-4 px-4 lg:px-6">
                      <div className="flex items-center">
                        {parseFloat(hotel.occupancy) > 70 ? (
                          <>
                            <TrendingUp className="text-green-500 mr-1" size={14} />
                            <span className="text-green-600 font-medium text-xs lg:text-sm">Excellent</span>
                          </>
                        ) : parseFloat(hotel.occupancy) > 50 ? (
                          <>
                            <TrendingUp className="text-yellow-500 mr-1" size={14} />
                            <span className="text-yellow-600 font-medium text-xs lg:text-sm">Good</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="text-red-500 mr-1" size={14} />
                            <span className="text-red-600 font-medium text-xs lg:text-sm">Needs Attention</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="py-8 px-4 lg:px-6 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Building2 className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400 mb-2 lg:mb-4" />
                        <p className="text-sm lg:text-base">No hotel data available</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 lg:p-6 border-b border-gray-100">
            <h3 className="text-lg lg:text-xl font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              {allBookings?.slice(0, 5).map((booking, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 font-medium text-sm lg:text-base truncate">
                        New booking by {booking.guestName}
                      </p>
                      <p className="text-gray-500 text-xs lg:text-sm truncate">
                        {booking.hotelName} • {booking.roomName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-gray-900 font-medium text-sm lg:text-base">
                      PKR {parseFloat(booking.totalAmount || 0).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs lg:text-sm">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400 mb-2 lg:mb-4 mx-auto" />
                  <p className="text-sm lg:text-base">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAnalytics;
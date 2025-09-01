import React, { useState, useContext, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { MdDashboard, MdAnalytics, MdSettings } from "react-icons/md";
import { HiUsers, HiOfficeBuilding, HiCurrencyDollar } from "react-icons/hi";
import { GiModernCity } from "react-icons/gi";
import { FaCalendarAlt, FaFileAlt, FaChartBar, FaUserShield } from "react-icons/fa";
import { AuthContext } from "../../contexts/AuthContext";

const SuperAdminNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileActive, setMobileActive] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/login", { replace: true });
  };

  const links = [
    { name: "Dashboard", path: "/superadmin", icon: <MdDashboard /> },
    { name: "Hotels", path: "/hotels", icon: <HiOfficeBuilding /> },
    { name: "Users", path: "/superadminusers", icon: <HiUsers /> },
    { name: "Bookings", path: "/superadmin/bookings", icon: <FaCalendarAlt /> },
    { name: "Revenue", path: "/superadmin/revenue", icon: <HiCurrencyDollar /> },
    { name: "Analytics", path: "/superadmin/analytics", icon: <FaChartBar /> },
    { name: "Reports", path: "/superadmin/reports", icon: <FaFileAlt /> },
    { name: "Settings", path: "/superadmin/settings", icon: <MdSettings /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileActive && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileActive(false)}
        />
      )}

      {/* Top Navbar for Mobile */}
      <nav className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileActive(true)}
          className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <FaBars className="w-5 h-5 text-gray-700" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <GiModernCity className="text-white text-sm" />
          </div>
          <div className="font-bold text-gray-900">LuxStay</div>
          <div className="text-xs text-blue-600 font-medium">Super Admin</div>
        </div>

        <div className="w-10"></div> {/* Spacer for centering */}
      </nav>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-white/95 backdrop-blur-md border-r border-gray-200/50 z-50 transform transition-transform duration-300 ease-in-out ${
        mobileActive ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:z-30 md:bg-white md:backdrop-blur-none flex flex-col`}>
        
        {/* Header - Hidden on Mobile */}
        <div className="hidden md:block h-16 flex-shrink-0 border-b border-gray-200 bg-gray-50/50">
          <div className="h-full flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GiModernCity className="text-white text-lg" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">LuxStay</div>
                <div className="text-xs text-purple-600 font-medium">Super Admin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        <div className="md:hidden h-16 flex-shrink-0 flex items-center justify-between px-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <GiModernCity className="text-white text-lg" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">LuxStay</div>
              <div className="text-xs text-purple-600 font-medium">Super Admin</div>
            </div>
          </div>
          
          <button
            onClick={() => setMobileActive(false)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* User Section */}
        {user && (
          <div className="flex-shrink-0 p-6 border-b border-gray-200/50 bg-gray-50/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                {user?.profile_image ? (
                  <img 
                    src={`${import.meta.env.VITE_BASE_URL}/uploads/${user.profile_image}`} 
                    alt={user.full_name || user.name} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" 
                  />
                ) : (
                  <FaUserCircle className="w-10 h-10 text-gray-400" />
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  {user.full_name || user.name || "Super Administrator"}
                </div>
                <div className="text-xs text-purple-600 font-medium">Super Admin</div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">System Status</div>
                  <div className="text-sm font-semibold text-green-700 mt-1">All Systems Operational</div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Management
          </div>
          <div className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMobileActive(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100/70 hover:text-gray-900"
                  }`
                }
              >
                <span className="w-5 h-5 flex items-center justify-center">
                  {link.icon}
                </span>
                {link.name}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout Section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200/50">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50/70 border border-red-300/50 hover:border-red-400 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            <FaSignOutAlt className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileActive(true)}
        className="fixed top-4 left-4 z-40 md:hidden bg-white border border-gray-300 p-2.5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <FaBars className="w-5 h-5 text-gray-600" />
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl max-w-md w-full border border-gray-200/50">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100/80 rounded-full flex items-center justify-center">
                  <FaSignOutAlt className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Sign Out</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to sign out? You'll need to authenticate again.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50/70 backdrop-blur-sm rounded-b-lg flex gap-3 border-t border-gray-200/50">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-white/80 backdrop-blur-sm hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium border border-gray-300/70 hover:border-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuperAdminNavbar;
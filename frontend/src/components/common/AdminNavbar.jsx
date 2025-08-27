// src/components/admin/AdminNavbar.jsx
import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes, FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { MdDashboard, MdBookOnline, MdAnalytics } from "react-icons/md";
import { HiPlus, HiUsers, HiCog } from "react-icons/hi";
import { GiModernCity } from "react-icons/gi";
import { AuthContext } from "../../contexts/AuthContext";

const AdminNavbar = () => {
  const { user, logout, hotels = [], selectedHotelId, selectHotel } = useContext(AuthContext);
  const [mobileActive, setMobileActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/login", { replace: true });
  };

  const handleCreateHotel = () => {
    navigate("/admin/create-hotel?new=true");
    setShowDropdown(false);
  };

  const handleSwitchHotel = (hotel) => {
    selectHotel(hotel.id);
    setShowDropdown(false);
    navigate(`/admin/hotel/${hotel.id}`);
  };

  const links = [
    { name: "Dashboard", path: "/admin", icon: <MdDashboard /> },
    { name: "Add Room", path: "/add-room", icon: <HiPlus /> },
    { name: "Booking Orders", path: "/bookings", icon: <MdBookOnline /> },
    { name: "Users", path: "/users", icon: <HiUsers /> },
    { name: "Settings", path: "/settings", icon: <HiCog /> },
    { name: "Reports", path: "/reports", icon: <MdAnalytics /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-all duration-300 ${
          mobileActive ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMobileActive(false)}
      ></div>

      <aside
        className={`fixed top-0 left-0 h-screen bg-white shadow-2xl border-r border-gray-200 z-40 w-64 transform transition-all duration-300 ease-out ${
          mobileActive ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 flex flex-col`}
      >
        {/* Mobile close button */}
        <div className="md:hidden flex justify-end p-4">
          <button 
            onClick={() => setMobileActive(false)} 
            className="group text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-xl transition-all duration-200 transform hover:scale-110"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300">
              <GiModernCity className="text-xl text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              LuxStay
            </span>
            <span className="text-xs text-gray-500 font-medium">Admin Panel</span>
          </div>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative">
                  <FaUserCircle className="text-3xl text-gray-500 group-hover:text-gray-600 transition-colors duration-300" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 text-sm">
                  {user.name || user.username}
                </span>
                <span className="text-gray-500 text-xs">Administrator</span>
              </div>
            </div>

            {/* Hotel Management Section */}
            <div className="space-y-3">
              {/* Create Hotel Button */}
              <button
                className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
                onClick={handleCreateHotel}
              >
                <HiPlus className="text-base" />
                <span className="text-sm">Create Hotel</span>
              </button>

              {/* Hotel Selector Dropdown */}
              {hotels.length > 0 && (
                <div className="relative">
                  <button
                    className="group w-full flex justify-between items-center px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <span className="text-sm font-medium truncate">
                      {selectedHotelId
                        ? hotels.find((h) => h.id === selectedHotelId)?.name
                        : "Select Hotel"}
                    </span>
                    <FaChevronDown 
                      className={`text-gray-400 group-hover:text-gray-600 transition-all duration-200 ${
                        showDropdown ? "rotate-180 text-blue-500" : ""
                      }`} 
                    />
                  </button>

                  {showDropdown && (
                    <div className="absolute mt-2 w-full max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                      {hotels.map((hotel, index) => (
                        <button
                          key={hotel.id}
                          className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 text-sm font-medium group"
                          onClick={() => handleSwitchHotel(hotel)}
                        >
                          <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                            {hotel.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Links - Scrollable */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-6 mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Navigation
            </span>
          </div>
          <nav className="space-y-1 px-3">
            {links.map((link, index) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 mx-3 rounded-lg transition-all duration-200 relative ${
                    isActive 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25" 
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`
                }
                onClick={() => setMobileActive(false)}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                    )}
                    <span className={`text-lg transition-all duration-200 ${
                      isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                    }`}>
                      {link.icon}
                    </span>
                    <span className="font-medium text-sm group-hover:translate-x-0.5 transition-transform duration-200">
                      {link.name}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout Button - Fixed at Bottom */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/30 mt-auto">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="group w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 font-medium"
          >
            <FaSignOutAlt className="text-base group-hover:rotate-12 transition-transform duration-200" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile hamburger/close toggle button */}
      <button
        className="group fixed top-4 left-4 z-50 md:hidden bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-800 p-3 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 transform hover:scale-110"
        onClick={() => setMobileActive(!mobileActive)}
      >
        <div className="relative w-5 h-5">
          <FaBars 
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-base transition-all duration-300 ${
              mobileActive ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
            }`} 
          />
          <FaTimes 
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-base transition-all duration-300 ${
              mobileActive ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-75"
            }`} 
          />
        </div>
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setShowLogoutConfirm(false)}
          ></div>
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="bg-red-50 p-4 rounded-full border border-red-100">
                <FaSignOutAlt className="text-3xl text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-800">Confirm Logout</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Are you sure you want to logout? You'll need to sign in again to access the admin panel.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
                  onClick={handleLogout}
                >
                  Yes, Logout
                </button>
                <button
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-800 py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 border border-gray-200 hover:border-gray-300"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;
// src/components/admin/AdminNavbar.jsx
import React, { useState, useContext, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaSignOutAlt,
  FaCheck,
} from "react-icons/fa";
import { MdDashboard, MdBookOnline, MdAnalytics } from "react-icons/md";
import { HiPlus, HiUsers, HiCog } from "react-icons/hi";
import { GiModernCity } from "react-icons/gi";
import { AuthContext } from "../../contexts/AuthContext";

const AdminNavbar = () => {
  const { user, logout, hotels = [], selectedHotelId, selectHotel } =
    useContext(AuthContext);
  const [mobileActive, setMobileActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loadingHotel, setLoadingHotel] = useState(false);
  const [switchingHotelName, setSwitchingHotelName] = useState("");
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/login", { replace: true });
  };

  const handleCreateHotel = () => {
    navigate("/admin/create-hotel?new=true");
    setShowDropdown(false);
  };

  const handleSwitchHotel = async (hotel) => {
    if (hotel.id === selectedHotelId) return;
    setSwitchingHotelName(hotel.name);
    setLoadingHotel(true);
    selectHotel(hotel.id);
    setShowDropdown(false);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    navigate(`/admin/hotel/${hotel.id}`);
    setLoadingHotel(false);
  };

  const links = [
    { name: "Dashboard", path: "/admin", icon: <MdDashboard /> },
    { name: "Add Room", path: "/add-room", icon: <HiPlus /> },
    { name: "Booking Orders", path: "/bookings", icon: <MdBookOnline /> },
    { name: "Users", path: "/users", icon: <HiUsers /> },
    { name: "Settings", path: "/settings", icon: <HiCog /> },
    { name: "Reports", path: "/reports", icon: <MdAnalytics /> },
  ];

  // --- For USER ROLE: Find the hotel name assigned ---
  const assignedHotelName =
    user?.role === "user"
      ? hotels.find((h) => h.id === user.hotelId)?.name || "Assigned Hotel"
      : null;

  return (
    <>
      {/* Hotel Switching Loader */}
      {loadingHotel && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-600 font-medium">
              Switching to:{" "}
              <span className="text-blue-600 font-semibold">
                {switchingHotelName}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 py-3 md:hidden z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <GiModernCity className="text-white text-lg" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg">LuxStay</div>
            <div className="text-xs text-gray-500">
              {user?.role === "user" ? assignedHotelName : "Admin"}
            </div>
          </div>
        </div>
        <button
          onClick={() => setMobileActive(true)}
          className="bg-white border border-gray-300 p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <FaBars className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileActive && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileActive(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          mobileActive ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:z-30`}
      >
        {/* Header (Visible on Desktop) */}
        <div className="hidden md:flex h-16 items-center justify-between px-6 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GiModernCity className="text-white text-lg" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">LuxStay</div>
              <div className="text-xs text-gray-500">
                {user?.role === "user" ? assignedHotelName : "Admin Panel"}
              </div>
            </div>
          </div>
        </div>

        {/* Close button for mobile */}
        <div className="absolute top-4 right-4 md:hidden">
          <button
            onClick={() => setMobileActive(false)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* User Section */}
        {user && (
          <div className="p-6 border-b border-gray-200 bg-gray-50/30 mt-16 md:mt-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <FaUserCircle className="w-10 h-10 text-gray-400" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  {user.full_name || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {user.role === "user" ? assignedHotelName : "Administrator"}
                </div>
              </div>
            </div>

            {/* Only show Create Hotel + Dropdown if NOT normal user */}
            {user.role !== "user" && (
              <>
                <button
                  onClick={handleCreateHotel}
                  className="w-full mb-3 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <HiPlus className="w-4 h-4" />
                  Create Hotel
                </button>

                {hotels.length > 0 && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors duration-200"
                    >
                      <span className="truncate">
                        {selectedHotelId
                          ? hotels.find((h) => h.id === selectedHotelId)?.name ||
                            "Select Hotel"
                          : "Select Hotel"}
                      </span>
                      <FaChevronDown
                        className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                          showDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                          Available Hotels
                        </div>
                        {hotels.map((hotel) => {
                          const isSelected = selectedHotelId === hotel.id;
                          return (
                            <button
                              key={hotel.id}
                              onClick={() => handleSwitchHotel(hotel)}
                              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between ${
                                isSelected
                                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                                  : "text-gray-700"
                              }`}
                            >
                              <span className="truncate">{hotel.name}</span>
                              {isSelected && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <FaCheck className="w-3 h-3" />
                                  <span className="text-xs font-medium">
                                    Active
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Navigation
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
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-300 hover:border-red-400 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            <FaSignOutAlt className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaSignOutAlt className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirm Sign Out
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to sign out? You'll need to
                    authenticate again.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium border border-gray-300 hover:border-gray-400 transition-colors duration-200"
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

export default AdminNavbar;

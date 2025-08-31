import React, { useState, useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  FaUserCircle, FaBars, FaTimes, FaSignOutAlt, 
  FaHome, FaBed, FaTags, FaClipboardList, FaUserCog, FaHeadset 
} from "react-icons/fa";
import { GiModernCity } from "react-icons/gi";
import { AuthContext } from "../../contexts/AuthContext";

const Navbar = () => {
  const { user, logout, hotelName, selectedHotelId, fetchHotelName, token } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setOpen(!open);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/login", { replace: true });
  };

  const getProfileImage = () => {
    if (user?.profile_image) {
      return `${import.meta.env.VITE_BASE_URL}/uploads/${user.profile_image}`;
    }
    return null;
  };

  // ---------------- Ensure hotelName is fetched ----------------
  useEffect(() => {
    if (selectedHotelId && !hotelName && token) {
      fetchHotelName(selectedHotelId);
    }
  }, [selectedHotelId, hotelName, fetchHotelName, token]);

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <GiModernCity className="w-6 h-6" />
          <span>{hotelName || "Loading Hotel..."}</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {open ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r shadow-lg z-50 transform transition-transform duration-300 
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo / Hotel Name */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
            <GiModernCity className="w-6 h-6" />
            <span>{hotelName || "Loading Hotel..."}</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-4 border-b text-gray-700">
          {getProfileImage() ? (
            <img 
              src={getProfileImage()} 
              alt={user.full_name || user.name} 
              className="w-10 h-10 rounded-full object-cover border"
            />
          ) : (
            <FaUserCircle className="w-10 h-10 text-gray-400" />
          )}
          <div>
            <p className="font-medium">{user?.full_name || user?.name || "Guest"}</p>
            <p className="text-sm text-gray-500">{user?.role === "admin" ? "Admin Panel" : "User Panel"}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4 flex flex-col gap-2 text-gray-700 font-medium">
          <NavLink to="/user" className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 hover:text-blue-600 ${isActive ? "bg-blue-100 text-blue-600" : ""}`
            } onClick={() => setOpen(false)}>
            <FaHome className="w-4 h-4" /> Dashboard
          </NavLink>
          <NavLink to="/user/rooms" className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 hover:text-blue-600 ${isActive ? "bg-blue-100 text-blue-600" : ""}`
            } onClick={() => setOpen(false)}>
            <FaBed className="w-4 h-4" /> Browse Rooms
          </NavLink>
          <NavLink to="/user/bookings" className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 hover:text-blue-600 ${isActive ? "bg-blue-100 text-blue-600" : ""}`
            } onClick={() => setOpen(false)}>
            <FaClipboardList className="w-4 h-4" /> My Bookings
          </NavLink>
          <NavLink to="/user/offers" className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 hover:text-blue-600 ${isActive ? "bg-blue-100 text-blue-600" : ""}`
            } onClick={() => setOpen(false)}>
            <FaTags className="w-4 h-4" /> Offers
          </NavLink>
          <NavLink to="/user/profile" className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 hover:text-blue-600 ${isActive ? "bg-blue-100 text-blue-600" : ""}`
            } onClick={() => setOpen(false)}>
            <FaUserCog className="w-4 h-4" /> Profile
          </NavLink>
          <NavLink to="/user/support" className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 hover:text-blue-600 ${isActive ? "bg-blue-100 text-blue-600" : ""}`
            } onClick={() => setOpen(false)}>
            <FaHeadset className="w-4 h-4" /> Support
          </NavLink>
        </nav>

        {/* Logout button */}
        <div className="px-4 mt-auto pb-4">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 w-full text-red-600 py-2 px-3 rounded hover:bg-red-50"
          >
            <FaSignOutAlt className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <p className="text-gray-800 font-medium mb-4">
                Are you sure you want to logout?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop spacing */}
      <div className="hidden md:block w-64 flex-shrink-0"></div>
    </>
  );
};

export default Navbar;

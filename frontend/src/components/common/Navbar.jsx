import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaBars, FaTimes, FaHome, FaBed, FaClipboardList, FaTags, FaUserCog, FaHeadset } from 'react-icons/fa';
import { GiModernCity } from 'react-icons/gi';
import { AuthContext } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getProfileImage = () => {
    if (user?.profile_image) {
      if (user.profile_image.startsWith('http')) return user.profile_image;
      return `${import.meta.env.VITE_BASE_URL}/uploads/${user.profile_image}`;
    }
    return null;
  };

  const getHotelName = () => user?.hotel?.name || user?.hotelName || user?.assignedHotelName || 'LuxStay';

  const navigationItems = [
    { name: 'Dashboard', path: '/userdashboard', icon: <FaHome /> },
    { name: 'Browse Rooms', path: '/browserooms', icon: <FaBed /> },
    { name: 'My Bookings', path: '/user/bookings', icon: <FaClipboardList /> },
    { name: 'Special Offers', path: '/user/offers', icon: <FaTags /> },
    { name: 'My Profile', path: '/user/profile', icon: <FaUserCog /> },
    { name: 'Support Center', path: '/user/support', icon: <FaHeadset /> },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <GiModernCity className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">LuxStay</h1>
            <p className="text-xs text-gray-600">{getHotelName()}</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-5 left-0 h-full w-72 bg-white border-r border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo/Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <GiModernCity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">LuxStay</h1>
            <p className="text-sm text-gray-600">{getHotelName()}</p>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4 bg-gray-50">
          <div className="relative">
            {getProfileImage() ? (
              <img
                src={getProfileImage()}
                alt={user?.full_name || user?.name || 'User'}
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-200 shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center border-2 border-blue-200 shadow-md">
                <FaUserCircle className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{user?.full_name || user?.name || 'Guest User'}</h3>
            <p className="text-sm text-gray-600 capitalize">
              {user?.role === 'admin' ? 'Administrator' : user?.role === 'manager' ? 'Manager' : 'User'}
            </p>
            <div className="flex items-center mt-1 gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-red-600 py-3 px-4 rounded-xl hover:bg-red-50 transition-all duration-200 font-medium"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Desktop Spacer */}
      <div className="hidden lg:block w-72 flex-shrink-0"></div>
    </>
  );
};

export default Navbar;

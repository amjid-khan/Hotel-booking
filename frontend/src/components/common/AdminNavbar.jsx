// src/components/admin/AdminNavbar.jsx
import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaPlus,
} from "react-icons/fa";
import { MdDashboard, MdBookOnline, MdAnalytics } from "react-icons/md";
import { HiPlus, HiUsers, HiCog } from "react-icons/hi";
import { GiModernCity } from "react-icons/gi";
import { AuthContext } from "../../contexts/AuthContext";
import "./AdminNavbar.css";

const AdminNavbar = () => {
  const { user, logout, hotels = [], fetchHotels } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileActive, setMobileActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/login", { replace: true });
  };

  const toggleCollapse = () => setCollapsed(!collapsed);
  const toggleMobile = () => setMobileActive(!mobileActive);

  const handleCreateHotel = () => {
    navigate("/admin/create-hotel?new=true");
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
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileActive ? "active" : ""}`}>
        <button className="sidebar-toggle" onClick={toggleCollapse}>
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>

        <div className="sidebar-logo">
          <GiModernCity className="logo-icon" />
          {!collapsed && <span>LuxStay Admin</span>}
        </div>

        {!collapsed && user && (
          <div className="admin-name">
            <FaUserCircle />
            <span>{user.name || user.username}</span>

            <div className="hotel-actions">
              {hotels.length === 0 ? (
                <button
                  className="create-hotel-btn"
                  onClick={handleCreateHotel}
                  title="Create New Hotel"
                >
                  <FaPlus />
                </button>
              ) : (
                <div className="hotel-dropdown-wrapper">
                  <button
                    className="hotel-dropdown-btn"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    Hotels <FaPlus title="Create New Hotel" />
                  </button>
                  {showDropdown && (
                    <ul className="hotel-dropdown">
                      {hotels.map((hotel) => (
                        <li
                          key={hotel.id}
                          onClick={() => navigate(`/admin/hotel/${hotel.id}`)}
                        >
                          {hotel.name}
                        </li>
                      ))}
                      <li
                        className="create-hotel-item"
                        onClick={handleCreateHotel}
                      >
                        + Create New Hotel
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <ul className="sidebar-links">
          {links.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setMobileActive(false)}
              >
                {link.icon}
                <span className="label">{!collapsed && link.name}</span>
              </NavLink>
            </li>
          ))}

          <li>
            <button
              className="sidebar-link logout-link"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <FaSignOutAlt />
              {!collapsed && <span className="label">Logout</span>}
            </button>
          </li>
        </ul>
      </aside>

      {showLogoutConfirm && (
        <div className="logout-popup">
          <div className="popup-card">
            <div className="popup-icon">
              <FaSignOutAlt />
            </div>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="popup-actions">
              <button className="confirm-btn" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowLogoutConfirm(false)}
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
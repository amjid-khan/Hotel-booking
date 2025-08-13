import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { GiModernCity } from 'react-icons/gi';
import { AuthContext } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    logout(); // remove user & token
    setShowLogoutConfirm(false);
    navigate('/login', { replace: true }); // redirect
  };

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <div className="navbar-logo">
          <GiModernCity className="logo-icon" />
          <span>LuxStay</span>
        </div>

        {/* Links */}
        <ul className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <li><NavLink to="/user" onClick={toggleMenu}>Home</NavLink></li>
          <li><NavLink to="/user/rooms" onClick={toggleMenu}>Rooms</NavLink></li>
          <li><NavLink to="/user/bookings" onClick={toggleMenu}>Bookings</NavLink></li>
          <li><NavLink to="/user/offers" onClick={toggleMenu}>Offers</NavLink></li>
          <li><NavLink to="/user/about" onClick={toggleMenu}>About</NavLink></li>
          <li><NavLink to="/user/contact" onClick={toggleMenu}>Contact</NavLink></li>

          {/* Mobile logout */}
          <li className="logout-mobile">
            <button onClick={() => setShowLogoutConfirm(true)}>
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>

        {/* User info + Desktop logout */}
        <div className="navbar-actions">
          <div className="user-info">
            <FaUserCircle size={26} />
            <span>{user?.name || 'Guest'}</span>
          </div>

          <button className="logout-desktop" onClick={() => setShowLogoutConfirm(true)}>
            <FaSignOutAlt />
          </button>

          <button className="menu-toggle" onClick={toggleMenu}>
            {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </nav>

      {/* Logout Popup */}
      {showLogoutConfirm && (
        <div className="logout-popup">
          <div className="popup-card">
            <p>Are you sure you want to logout?</p>
            <div className="popup-actions">
              <button className="confirm-btn" onClick={handleLogout}>Yes</button>
              <button className="cancel-btn" onClick={() => setShowLogoutConfirm(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

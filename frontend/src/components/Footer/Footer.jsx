import React from "react";
import "./Footer.css";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-logo">LuxStay</div>
      <p className="footer-desc">Luxury stays, unforgettable experiences.</p>

      <div className="footer-links">
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Rooms</a></li>
          <li><a href="#">Booking</a></li>
          <li><a href="#">Amenities</a></li>
          <li><a href="#">Contact</a></li>
          <li><a href="#">About Us</a></li>
        </ul>
      </div>

      <div className="footer-social">
        <a href="#"><FaFacebookF /></a>
        <a href="#"><FaTwitter /></a>
        <a href="#"><FaInstagram /></a>
        <a href="#"><FaLinkedinIn /></a>
      </div>

      <div className="footer-bottom">
        &copy; 2025 LuxStay. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

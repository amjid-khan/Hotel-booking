import React from "react";
import "./UserHome.css";
import { 
  FaWifi, FaSwimmingPool, FaConciergeBell, FaSpa, FaDumbbell, 
  FaDoorOpen, FaCocktail, FaTv, FaCoffee, FaUtensils 
} from "react-icons/fa";

const rooms = [
  {
    id: 1,
    name: "Deluxe Room",
    description: "Spacious room with sea view, king-size bed and balcony.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 2,
    name: "Suite",
    description: "Luxurious suite with living area, modern amenities, and jacuzzi.",
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 3,
    name: "Standard Room",
    description: "Cozy room with essentials, perfect for solo travelers.",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Alice Johnson",
    message: "Amazing stay! The staff was friendly and rooms top-notch.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: 2,
    name: "Mark Robinson",
    message: "Beautiful hotel with stunning views. Highly recommend the suite!",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    name: "Sophia Lee",
    message: "Comfortable, clean, and luxurious. Perfect for a weekend getaway.",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    id: 4,
    name: "John Doe",
    message: "Excellent service and very cozy rooms. Will visit again!",
    image: "https://randomuser.me/api/portraits/men/77.jpg",
  },
];

const amenities = [
  { id: 1, title: "Free Wi-Fi", icon: <FaWifi size={26} /> },
  { id: 2, title: "Swimming Pool", icon: <FaSwimmingPool size={26} /> },
  { id: 3, title: "24/7 Room Service", icon: <FaConciergeBell size={26} /> },
  { id: 4, title: "Spa & Wellness", icon: <FaSpa size={26} /> },
  { id: 5, title: "Gym & Fitness", icon: <FaDumbbell size={26} /> },
  { id: 6, title: "Conference Hall", icon: <FaDoorOpen size={26} /> },
  { id: 7, title: "Bar & Lounge", icon: <FaCocktail size={26} /> },
  { id: 8, title: "Smart TV", icon: <FaTv size={26} /> },
  { id: 9, title: "Coffee & Tea", icon: <FaCoffee size={26} /> },
  { id: 10, title: "Restaurant & Dining", icon: <FaUtensils size={26} /> },
];

const offers = [
  {
    id: 1,
    title: "Summer Special",
    desc: "Get 20% off on all deluxe rooms this summer.",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: 2,
    title: "Couple Package",
    desc: "Romantic getaway with complimentary wine and dinner.",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: 3,
    title: "Business Stay",
    desc: "Special rates for corporate bookings and events.",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80"
  }
];

const UserHome = () => {
  return (
    <section className="home-container">
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Refined Luxury, Modern Comfort</h1>
          <p>Stay in style with premium rooms and world-class amenities.</p>
          <button className="hero-btn">Book Now</button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card">
          <h2>10k+</h2>
          <p>Happy Guests</p>
        </div>
        <div className="stat-card">
          <h2>150+</h2>
          <p>Luxury Rooms</p>
        </div>
        <div className="stat-card">
          <h2>50+</h2>
          <p>Staff Members</p>
        </div>
        <div className="stat-card">
          <h2>5-Star</h2>
          <p>Service Quality</p>
        </div>
      </div>

      {/* Featured Rooms */}
      <div className="rooms-section">
        <h2>Our Rooms</h2>
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div className="room-card" key={room.id} onClick={() => alert(`Clicked ${room.name}`)}>
              <img src={room.image} alt={room.name} />
              <div className="room-info">
                <h3>{room.name}</h3>
                <p>{room.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Offers Section */}
      <div className="offers-section">
        <h2>Special Offers</h2>
        <div className="offers-grid">
          {offers.map((offer) => (
            <div className="offer-card" key={offer.id}>
              <img src={offer.image} alt={offer.title} />
              <div className="offer-info">
                <h3>{offer.title}</h3>
                <p>{offer.desc}</p>
                <button className="white-btn">View Offer</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities Section */}
      <div className="amenities-section">
        <h2>Our Amenities</h2>
        <div className="scroll-container">
          <div className="scroll-track scroll-left">
            {amenities.concat(amenities).map((amenity, index) => (
              <div className="amenity-card" key={index}>
                <span>{amenity.icon}</span>
                <p>{amenity.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <h2>Guest Testimonials</h2>
        <div className="scroll-container">
          <div className="scroll-track scroll-right">
            {testimonials.concat(testimonials).map((testimonial, index) => (
              <div className="testimonial-card" key={index}>
                <img src={testimonial.image} alt={testimonial.name} />
                <p>"{testimonial.message}"</p>
                <h4>{testimonial.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="newsletter-section">
        <h2>Subscribe for Exclusive Deals</h2>
        <p>Be the first to receive our latest offers and news.</p>
        <div className="newsletter-input">
          <input type="email" placeholder="Enter your email" />
          <button className="white-btn">Subscribe</button>
        </div>
      </div>

    </section>
  );
};

export default UserHome;

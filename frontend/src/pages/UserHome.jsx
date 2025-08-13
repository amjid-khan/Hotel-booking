import React from "react";
import "./UserHome.css";
import { 
  FaWifi, 
  FaSwimmingPool, 
  FaConciergeBell, 
  FaSpa, 
  FaDumbbell, 
  FaDoorOpen, 
  FaCocktail, 
  FaTv, 
  FaCoffee, 
  FaUtensils 
} from "react-icons/fa";
const rooms = [
  {
    id: 1,
    name: "Deluxe Room",
    description: "Spacious room with sea view, king-size bed and balcony.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 2,
    name: "Suite",
    description: "Luxurious suite with living area, modern amenities, and jacuzzi.",
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 3,
    name: "Standard Room",
    description: "Cozy room with all essentials, ideal for solo travelers.",
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Alice Johnson",
    message: "Amazing stay! The staff was friendly and the rooms were top-notch.",
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
  {
    id: 5,
    name: "Emily Clark",
    message: "Loved the spa and pool facilities. Truly a relaxing stay.",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
  },
];

const amenities = [
  { id: 1, title: "Free Wi-Fi", icon: <FaWifi size={32} color="white" /> },
  { id: 2, title: "Swimming Pool", icon: <FaSwimmingPool size={32} color="white" /> },
  { id: 3, title: "24/7 Room Service", icon: <FaConciergeBell size={32} color="white" /> },
  { id: 4, title: "Spa & Wellness", icon: <FaSpa size={32} color="white" /> },
  { id: 5, title: "Gym & Fitness", icon: <FaDumbbell size={32} color="white" /> },
  { id: 6, title: "Conference Hall", icon: <FaDoorOpen size={32} color="white" /> },
  { id: 7, title: "Bar & Lounge", icon: <FaCocktail size={32} color="white" /> },
  { id: 8, title: "Smart TV", icon: <FaTv size={32} color="white" /> },
  { id: 9, title: "Coffee & Tea", icon: <FaCoffee size={32} color="white" /> },
  { id: 10, title: "Restaurant & Dining", icon: <FaUtensils size={32} color="white" /> },
];

const UserHome = () => {
  return (
    <section className="home-container" id="home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay">
          <h1>Welcome to Your Dream Stay</h1>
          <p>
            Experience luxury and comfort at our exclusive hotel. Book your perfect room with us today!
          </p>
          <button className="book-now-btn">Book Now</button>
        </div>
      </div>

      {/* Featured Rooms */}
      <div className="rooms-section">
        <div className="rooms-overlay">
          <h2>Featured Rooms</h2>
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div className="room-card" key={room.id}>
                <img src={room.image} alt={room.name} />
                <div className="room-info-glass">
                  <h3>{room.name}</h3>
                  <p>{room.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Amenities Section */}
      <div className="amenities-section">
        <h2>Our Amenities</h2>
        <div className="amenities-carousel">
          <div className="amenities-track">
            {amenities.map((amenity) => (
              <div className="amenity-card" key={amenity.id}>
                <span className="amenity-icon">{amenity.icon}</span>
                <h4>{amenity.title}</h4>
              </div>
            ))}
            {/* Duplicate for seamless scroll */}
            {amenities.map((amenity) => (
              <div className="amenity-card" key={`dup-${amenity.id}`}>
                <span className="amenity-icon">{amenity.icon}</span>
                <h4>{amenity.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <h2>What Our Guests Say</h2>
        <div className="testimonials-carousel">
          {testimonials.concat(testimonials).map((testimonial, index) => (
            <div className="testimonial-card" key={index}>
              <img src={testimonial.image} alt={testimonial.name} />
              <p>"{testimonial.message}"</p>
              <h4>- {testimonial.name}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Banner */}
      <div className="booking-banner">
        <div className="booking-overlay">
          <h2>Your Next Getaway Awaits</h2>
          <p>Book now and enjoy exclusive offers & unforgettable experiences.</p>
          <button className="book-now-btn">Book Your Stay</button>
        </div>
      </div>
    </section>
  );
};

export default UserHome;

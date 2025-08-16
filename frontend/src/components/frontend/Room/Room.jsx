import React, { useState } from 'react';
import './Room.css';

const roomsData = [
  {
    type: 'Single Room',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
    description: 'Cozy single room ideal for solo travelers. Comes with a comfortable bed, study table, and attached bathroom.',
    capacity: '1 Adult',
    facilities: 'Free WiFi, Air Conditioning, Breakfast Included',
    price: '$50 per night',
  },
  {
    type: 'Double Room',
    image: 'https://images.unsplash.com/photo-1600585154356-596af9009e6f',
    description: 'Spacious double room perfect for couples or friends. Modern interiors with excellent lighting.',
    capacity: '2 Adults',
    facilities: 'Free WiFi, Air Conditioning, TV, Mini Fridge',
    price: '$80 per night',
  },
  {
    type: 'Deluxe Suite',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
    description: 'Luxury suite with king-size bed, balcony, and premium facilities. Perfect for business travelers and families.',
    capacity: '3 Adults',
    facilities: 'Free WiFi, AC, 24/7 Room Service, Jacuzzi',
    price: '$120 per night',
  },
  {
    type: 'Family Room',
    image: 'https://images.unsplash.com/photo-1600585154601-38fd1df6d5d4',
    description: 'Large family room with two queen beds and extra space for kids. Comfort and convenience guaranteed.',
    capacity: '4 Adults',
    facilities: 'Free WiFi, AC, Kitchenette, Extra Sofa Bed',
    price: '$150 per night',
  },
];

const Room = () => {
  const [activeRoom, setActiveRoom] = useState(roomsData[0]); // default first room

  return (
    <div className="room-container">
      {/* Hero Section */}
      <section className="room-hero">
        <h1>Find Your Perfect Stay</h1>
        <p>Choose from our range of rooms designed for comfort and convenience.</p>
        <button className="explore-btn">Explore Now</button>
      </section>

      {/* Room Models Section */}
      <section className="room-models">
        <h2>Available Room Models</h2>
        <div className="models-grid">
          {roomsData.map((room, index) => (
            <div 
              key={index} 
              className={`model-card ${activeRoom.type === room.type ? 'active' : ''}`}
              onClick={() => setActiveRoom(room)}
            >
              {room.type}
            </div>
          ))}
        </div>
      </section>

      {/* Room Detail Section */}
      <section className="room-detail">
        <div className="room-image">
          <img src={activeRoom.image} alt={activeRoom.type} />
        </div>
        <div className="room-info">
          <h2>{activeRoom.type}</h2>
          <p>{activeRoom.description}</p>
          <ul>
            <li>Capacity: {activeRoom.capacity}</li>
            <li>Facilities: {activeRoom.facilities}</li>
            <li>Price: {activeRoom.price}</li>
          </ul>
          <button className="book-btn">Book Now</button>
        </div>
      </section>
    </div>
  );
};

export default Room;

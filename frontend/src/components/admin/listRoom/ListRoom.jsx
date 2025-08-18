import React, { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import './ListRoom.css';

const ListRoom = () => {
  const { rooms, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;

  return (
    <div className='roomlist-container'>
      <h1>Room List</h1>
      {rooms.length === 0 ? (
        <p>No rooms available.</p>
      ) : (
        <div className='room-cards'>
          {rooms.map((room) => (
            <div key={room.id} className='room-card'>
              <div className='room-image'>
                <img
                  src={room.image ? `http://localhost:5000${room.image}` : '/placeholder.png'}
                  alt={`Room ${room.roomNumber}`}
                  style={{ width: '200px', height: '150px', objectFit: 'cover' }}
                />
              </div>
              <div className='room-details'>
                <h2>Room {room.roomNumber}</h2>
                <p><strong>Type:</strong> {room.type}</p>
                <p><strong>Price:</strong> {room.price} ₹</p>
                <p><strong>Capacity:</strong> {room.capacity} persons</p>
                {room.description && <p><strong>Description:</strong> {room.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListRoom;

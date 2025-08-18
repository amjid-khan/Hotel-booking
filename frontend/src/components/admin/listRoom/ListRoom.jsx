import React, { useContext } from 'react';
import { AuthContext } from '../../../contexts/AuthContext';
import './ListRoom.css';

const ListRoom = () => {
  const { rooms, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="roomlist-container">
      <h1>Room List</h1>
      {rooms.length === 0 ? (
        <p>No rooms available.</p>
      ) : (
        <div className="table-wrapper">
          <table className="room-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Room Number</th>
                <th>Type</th>
                <th>Price (PKR)</th>
                <th>Capacity</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>
                    <img
                      src={room.image ? `http://localhost:5000${room.image}` : '/placeholder.png'}
                      alt={`Room ${room.roomNumber}`}
                      className="room-table-img"
                    />
                  </td>
                  <td>{room.roomNumber}</td>
                  <td>{room.type}</td>
                  <td>{room.price}</td>
                  <td>{room.capacity}</td>
                  <td className="description">{room.description || '-'}</td>
                  <td>
                    <button className="update-btn">Update</button>
                    <button className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListRoom;

import React, { useContext, useState } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import AddRoom from "../addroom/AddRoom";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./ListRoom.css";

const ListRoom = () => {
  const { rooms, loading, token, fetchRooms, user } = useContext(AuthContext);
  const [editRoom, setEditRoom] = useState(null); // store room being edited
  const [showList, setShowList] = useState(true); // toggle between list and form

  if (loading) return <p>Loading...</p>;

  const handleDelete = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (user?.hotelId) fetchRooms(user.hotelId);
      alert("Room deleted successfully!");
    } catch (error) {
      console.error("Error deleting room:", error);
      alert(error.response?.data?.message || "Failed to delete room.");
    }
  };

  const handleEdit = (room) => {
    setEditRoom(room);
    setShowList(false); // hide list and show form
  };

  const handleEditComplete = () => {
    setEditRoom(null);
    setShowList(true); // go back to list after editing
  };

  return (
    <div className="roomlist-container">
      {showList ? (
        <>
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
                          src={room.image ? `http://localhost:5000${room.image}` : "/placeholder.png"}
                          alt={`Room ${room.roomNumber}`}
                          className="room-table-img"
                        />
                      </td>
                      <td>{room.roomNumber}</td>
                      <td>{room.type}</td>
                      <td>{room.price}</td>
                      <td>{room.capacity}</td>
                      <td className="description">{room.description || "-"}</td>
                      <td>
                        <button className="update-btn" onClick={() => handleEdit(room)}>
                          <FaEdit /> Update
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(room.id)}>
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <AddRoom editRoom={editRoom} onEditComplete={handleEditComplete} />
      )}
    </div>
  );
};

export default ListRoom;

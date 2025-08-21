// src/components/rooms/AddRoom.jsx
import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { FaUpload } from "react-icons/fa";
import { AuthContext } from "../../../contexts/AuthContext";
import "./AddRoom.css";
import { useNavigate } from "react-router-dom";

const AddRoom = ({ editRoom, onEditComplete }) => {
  const { token, user, fetchRooms } = useContext(AuthContext);
  const navigate = useNavigate()
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [room, setRoom] = useState({
    roomNumber: "",
    type: "",
    price: "",
    capacity: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (editRoom) {
      setRoom({
        roomNumber: editRoom.roomNumber,
        type: editRoom.type,
        price: editRoom.price,
        capacity: editRoom.capacity,
        description: editRoom.description,
      });
      setImage(editRoom.image ? null : null); // reset image to allow change
    }
  }, [editRoom]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoom((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.hotelId) {
      alert("Hotel ID missing! Please login as a hotel admin.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("roomNumber", room.roomNumber);
      formData.append("type", room.type);
      formData.append("price", room.price);
      formData.append("capacity", room.capacity);
      formData.append("description", room.description);
      formData.append("hotelId", user.hotelId);

      if (image) formData.append("image", image);

      let res;

    if (editRoom) {
  // Update existing room
  res = await axios.put(`${BASE_URL}/api/rooms/${editRoom.id}`, formData, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
  });
  alert("Room updated successfully!");
} else {
  // Add new room
  res = await axios.post(`${BASE_URL}/api/rooms`, formData, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
  });
  alert("Room added successfully!");
  navigate("/list-rooms");
}

      // Refresh room list
      fetchRooms(user.hotelId);

      // Reset form
      setRoom({
        roomNumber: "",
        type: "",
        price: "",
        capacity: "",
        description: "",
      });
      setImage(null);

      if (onEditComplete) onEditComplete(); // notify parent that edit is complete
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Failed to save room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-room-container">
      <h2>{editRoom ? "Edit Room" : "Add New Room"}</h2>
      <form className="room-form" onSubmit={handleSubmit}>
        <div className="form-left">
          <label className="image-upload">
            <div className="upload-placeholder">
              <FaUpload size={40} />
              <span>{image ? "Change image" : "Click to upload image"}</span>
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
          </label>
          {image && (
            <div className="image-preview">
              <img src={URL.createObjectURL(image)} alt="preview" style={{ maxWidth: "100%", height: "auto" }} />
            </div>
          )}
        </div>

        <div className="form-right">
          <div className="form-group">
            <label>Room Number</label>
            <input type="text" name="roomNumber" value={room.roomNumber} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label>Room Type</label>
            <input type="text" name="type" value={room.type} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label>Price per Night</label>
            <input type="number" name="price" value={room.price} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input type="number" name="capacity" value={room.capacity} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={room.description} onChange={handleInputChange} rows="4" />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (editRoom ? "Updating..." : "Adding...") : editRoom ? "Update Room" : "Add Room"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRoom;
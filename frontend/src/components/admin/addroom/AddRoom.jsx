// src/components/admin/rooms/AddRoom.jsx
import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { FaUpload, FaEllipsisV, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { AuthContext } from "../../../contexts/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddRoom.css";

const AddRoom = () => {
  const { token, selectedHotelId, fetchRooms, rooms: contextRooms, loading } = useContext(AuthContext);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [room, setRoom] = useState({
    roomNumber: "",
    type: "",
    price: "",
    capacity: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);

  const rooms = Array.isArray(contextRooms) ? contextRooms : [];

  // ---------------- Fetch rooms when hotel changes ----------------
  useEffect(() => {
    if (selectedHotelId) fetchRooms(selectedHotelId);
  }, [selectedHotelId, fetchRooms]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoom((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => setImage(e.target.files[0]);

  const resetForm = () => {
    setRoom({
      roomNumber: "",
      type: "",
      price: "",
      capacity: "",
      description: "",
    });
    setImage(null);
    setEditRoom(null);
    setShowModal(false);
  };

  // ---------------- Create / Update Room ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("No token found — please log in first.");
    if (!selectedHotelId) return toast.error("Please select a hotel first!");

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(room).forEach(([key, value]) => formData.append(key, value));
      formData.append("hotelId", selectedHotelId); // ✅ match backend field name
      if (image) formData.append("image", image);

      if (editRoom) {
        await axios.put(`${BASE_URL}/api/rooms/${editRoom.id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Room updated successfully!");
      } else {
        await axios.post(`${BASE_URL}/api/rooms`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        toast.success("Room added successfully!");
      }

      fetchRooms(selectedHotelId); // refresh rooms list
      resetForm();
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to save room. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- Edit Room ----------------
  const handleEdit = (room) => {
    setEditRoom(room);
    setRoom({
      roomNumber: room.roomNumber,
      type: room.type,
      price: room.price,
      capacity: room.capacity,
      description: room.description,
    });
    setImage(null);
    setShowModal(true);
    setMenuOpen(null);
  };

  // ---------------- Delete Room ----------------
  const handleDelete = async (roomId) => {
    if (!selectedHotelId) return;

    try {
      await axios.delete(`${BASE_URL}/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Room deleted successfully!");
      fetchRooms(selectedHotelId);
      setMenuOpen(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete room.");
    }
  };

  return (
    <div className="add-room-page" style={{ paddingLeft: "258px" }}>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="header-section modern-header">
        <div className="room-highlight">
          <h2>Manage Your Rooms</h2>
          <p>Add, edit, or remove rooms anytime. All updates appear instantly.</p>
        </div>
        <div className="room-action">
          <button className="open-modal-btn" onClick={() => setShowModal(true)}>Add Room</button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-modal" onClick={resetForm}>&times;</span>
            <form className="room-form" onSubmit={handleSubmit}>
              <div className="form-left">
                <label className="image-upload">
                  <div className="upload-placeholder">
                    <FaUpload size={40} />
                    <span>{image || editRoom?.image ? "Change image" : "Click to upload image"}</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                </label>
                {(image || editRoom?.image) && (
                  <div className="image-preview">
                    <img
                      src={image ? URL.createObjectURL(image) : `${BASE_URL}${editRoom.image}`}
                      alt="preview"
                    />
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
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? (editRoom ? "Updating..." : "Adding...") : editRoom ? "Update Room" : "Add Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room List */}
      <div className="list-section modern-table">
        {loading ? (
          <p>Loading...</p>
        ) : rooms.length === 0 ? (
          <p>No rooms available for this hotel.</p>
        ) : (
          <div className="table-wrapper">
            <table className="room-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Room #</th>
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
                        src={room.image ? `${BASE_URL}${room.image}` : "/placeholder.png"}
                        alt={`Room ${room.roomNumber}`}
                        className="room-table-img"
                      />
                    </td>
                    <td>{room.roomNumber}</td>
                    <td>{room.type}</td>
                    <td>{room.price}</td>
                    <td>{room.capacity}</td>
                    <td className="description">{room.description || "-"}</td>
                    <td className="actions">
                      <button className="view-btn" title="View Details"><FaEye /></button>
                      <div className="menu-wrapper">
                        <button
                          className="menu-btn"
                          onClick={() => setMenuOpen(menuOpen === room.id ? null : room.id)}
                        >
                          <FaEllipsisV />
                        </button>
                        {menuOpen === room.id && (
                          <div className="dropdown-menu">
                            <button onClick={() => handleEdit(room)}><FaEdit /> Edit</button>
                            <button onClick={() => handleDelete(room.id)}><FaTrash /> Delete</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddRoom;

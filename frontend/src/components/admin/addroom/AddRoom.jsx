import React, { useState, useContext } from "react";
import axios from "axios";
import { FaUpload } from "react-icons/fa";
import { AuthContext } from "../../../contexts/AuthContext";
import "./AddRoom.css";

const AddRoom = () => {
  const { token, user } = useContext(AuthContext);

  const [room, setRoom] = useState({
    roomNumber: "",
    type: "",
    price: "",
    capacity: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

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
      formData.append("hotelId", user.hotelId); // <-- hotelId send karo

      if (image) {
        formData.append("image", image);
      }

      const res = await axios.post(
        "http://localhost:5000/api/rooms",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Room added successfully!");
      console.log("Room added:", res.data);

      // Reset form
      setRoom({
        roomNumber: "",
        type: "",
        price: "",
        capacity: "",
        description: "",
      });
      setImage(null);
    } catch (error) {
      console.error("Error adding room:", error);
      alert(error.response?.data?.message || "Failed to add room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-room-container">
      <h2>Add New Room</h2>
      <form className="room-form" onSubmit={handleSubmit}>
        <div className="form-left">
          <label className="image-upload">
            <div className="upload-placeholder">
              <FaUpload size={40} />
              <span>{image ? "Change image" : "Click to upload image"}</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>
          {image && (
            <div className="image-preview">
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
          )}
        </div>

        <div className="form-right">
          <div className="form-group">
            <label>Room Number</label>
            <input
              type="text"
              name="roomNumber"
              value={room.roomNumber}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Room Type</label>
            <input
              type="text"
              name="type"
              value={room.type}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Price per Night</label>
            <input
              type="number"
              name="price"
              value={room.price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              name="capacity"
              value={room.capacity}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={room.description}
              onChange={handleInputChange}
              rows="4"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Adding..." : "Add Room"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRoom;

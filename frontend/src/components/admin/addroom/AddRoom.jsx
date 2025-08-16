import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";
import "./AddRoom.css";

const AddRoom = () => {
  const [room, setRoom] = useState({
    name: "",
    type: "",
    price: "",
    capacity: "",
    description: "",
  });

  const [images, setImages] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoom({ ...room, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previewFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(previewFiles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Room Details:", room);
    console.log("Selected Images:", images);
    alert("Room added successfully!");
  };

  return (
    <div className="add-room-container">
      <h2>Add New Room</h2>
      <form className="room-form" onSubmit={handleSubmit}>
        <div className="form-left">
          <label className="image-upload">
            <div className="upload-placeholder">
              <FaUpload size={40} />
              <span>Click to upload images</span>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>
          <div className="image-preview">
            {images.map((img, index) => (
              <div key={index} className="preview-item">
                <img src={img.preview} alt={`preview-${index}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="form-right">
          <div className="form-group">
            <label>Room Name</label>
            <input
              type="text"
              name="name"
              value={room.name}
              onChange={handleInputChange}
              placeholder="Enter room name"
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
              placeholder="Deluxe, Suite, etc."
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
              placeholder="Enter price"
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
              placeholder="Number of guests"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={room.description}
              onChange={handleInputChange}
              placeholder="Enter room description"
              rows="4"
            />
          </div>

          <button type="submit" className="submit-btn">
            Add Room
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRoom;

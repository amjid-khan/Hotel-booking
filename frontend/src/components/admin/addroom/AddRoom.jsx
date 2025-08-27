// src/components/admin/rooms/AddRoom.jsx
import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { FaUpload, FaEdit, FaTrash, FaEye, FaTimes, FaPlus } from "react-icons/fa";
import { AuthContext } from "../../../contexts/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      formData.append("hotelId", selectedHotelId); 
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

      fetchRooms(selectedHotelId); 
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
  };

  // ---------------- Delete Room ----------------
  const handleDelete = async (roomId) => {
    if (!selectedHotelId) return;

    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Room deleted successfully!");
      fetchRooms(selectedHotelId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete room.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pl-60">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Management</h1>
            <p className="text-gray-600">Add, edit, or remove rooms anytime. All updates appear instantly.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm"
          >
            <FaPlus className="text-sm" />
            Add Room
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
<div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editRoom ? "Update Room" : "Add New Room"}
              </h2>
              <button 
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Image Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Image</h3>
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                      <FaUpload className="mx-auto text-gray-400 mb-4" size={40} />
                      <p className="text-gray-600 font-medium">
                        {image || editRoom?.image ? "Change image" : "Click to upload image"}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                  </label>
                  {(image || editRoom?.image) && (
                    <div className="mt-4">
                      <div className="relative rounded-lg overflow-hidden shadow-md">
                        <img
                          src={image ? URL.createObjectURL(image) : `${BASE_URL}${editRoom.image}`}
                          alt="preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Form Fields */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Details</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Number
                      </label>
                      <input
                        type="text"
                        name="roomNumber"
                        value={room.roomNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., 101"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Type
                      </label>
                      <input
                        type="text"
                        name="type"
                        value={room.type}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., Deluxe, Suite"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Night (PKR)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={room.price}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., 5000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity (Guests)
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={room.capacity}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., 2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={room.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Brief description of the room..."
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {submitting 
                    ? (editRoom ? "Updating..." : "Adding...") 
                    : (editRoom ? "Update Room" : "Add Room")
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room List */}
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading rooms...</p>
              </div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <FaPlus size={48} className="mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No rooms available</h3>
              <p className="text-gray-600">Start by adding your first room for this hotel.</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Rooms ({rooms.length})
                </h3>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Image</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Room #</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Type</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Price (PKR)</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Capacity</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Description</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rooms.map((roomItem) => (
                      <tr key={roomItem.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="w-16 h-16 rounded-lg overflow-hidden shadow-sm">
                            <img
                              src={roomItem.image ? `${BASE_URL}${roomItem.image}` : "/placeholder.png"}
                              alt={`Room ${roomItem.roomNumber}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-gray-900">{roomItem.roomNumber}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {roomItem.type}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-gray-900">₨{roomItem.price.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-700">{roomItem.capacity} guests</span>
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <p className="text-gray-600 truncate">
                            {roomItem.description || "-"}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye size={16} />
                            </button>
                            <button 
                              onClick={() => handleEdit(roomItem)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Edit Room"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(roomItem.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete Room"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-200">
                {rooms.map((roomItem) => (
                  <div key={roomItem.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                        <img
                          src={roomItem.image ? `${BASE_URL}${roomItem.image}` : "/placeholder.png"}
                          alt={`Room ${roomItem.roomNumber}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">Room {roomItem.roomNumber}</h4>
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {roomItem.type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-medium">Price:</span> ₨{roomItem.price.toLocaleString()}/night</p>
                          <p><span className="font-medium">Capacity:</span> {roomItem.capacity} guests</p>
                          {roomItem.description && (
                            <p><span className="font-medium">Description:</span> {roomItem.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <button 
                            className="px-3 py-1 text-blue-600 border border-blue-600 rounded text-sm hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <FaEye className="inline mr-1" size={12} />
                            View
                          </button>
                          <button 
                            onClick={() => handleEdit(roomItem)}
                            className="px-3 py-1 text-green-600 border border-green-600 rounded text-sm hover:bg-green-50 transition-colors"
                            title="Edit Room"
                          >
                            <FaEdit className="inline mr-1" size={12} />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(roomItem.id)}
                            className="px-3 py-1 text-red-600 border border-red-600 rounded text-sm hover:bg-red-50 transition-colors"
                            title="Delete Room"
                          >
                            <FaTrash className="inline mr-1" size={12} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddRoom;

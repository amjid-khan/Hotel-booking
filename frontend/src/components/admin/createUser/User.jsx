// src/components/admin/User.jsx
import React, { useState, useContext, useEffect } from "react";
import { FaUser, FaEdit, FaTrash, FaTimes, FaUserPlus, FaSync } from "react-icons/fa";
import { AuthContext } from "../../../contexts/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const User = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { token, users, fetchUsers, selectedHotelId, createUser, updateUser, deleteUser } = useContext(AuthContext);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    status: "active",
    profile_image: null,
    profile_image_url: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (selectedHotelId) fetchUsers(selectedHotelId);
  }, [selectedHotelId, fetchUsers]);

  const handleOpenModal = () => setShowModal(true);

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      id: null,
      full_name: "",
      email: "",
      phone: "",
      password: "",
      role: "user",
      status: "active",
      profile_image: null,
      profile_image_url: null,
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_image") {
      setFormData({
        ...formData,
        profile_image: files[0],
        profile_image_url: files[0] ? URL.createObjectURL(files[0]) : formData.profile_image_url,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("No token found — please log in first.");
    if (!selectedHotelId) return toast.error("Select a hotel first!");

    setSubmitting(true);
    try {
      const data = { ...formData, hotelId: selectedHotelId };

      if (formData.id) {
        await updateUser(formData.id, data);
        toast.success("User updated successfully!");
      } else {
        await createUser(data);
        toast.success("User created successfully!");
      }

      fetchUsers(selectedHotelId);
      handleCloseModal();
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Error saving user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      id: user.id,
      full_name: user.full_name || user.name,
      email: user.email,
      phone: user.phone || "",
      password: "",
      role: user.role,
      status: user.status,
      profile_image: null,
      profile_image_url: user.profile_image ? `${BASE_URL}/uploads/${user.profile_image}` : null,
    });
    handleOpenModal();
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    toast.info(
      <div>
        <p className="mb-2">Are you sure you want to delete this user?</p>
        <div className="flex gap-3">
          <button
            onClick={() => handleDelete(id)}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => setDeleteId(null)}
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false }
    );
  };

  const handleDelete = async (id) => {
    if (!token) return toast.error("No token found — please log in first.");
    try {
      await deleteUser(selectedHotelId, id);
      setDeleteId(null);
      toast.dismiss();
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error("Error deleting user");
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      manager: "bg-purple-100 text-purple-800",
      staff: "bg-blue-100 text-blue-800",
      user: "bg-green-100 text-green-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status) =>
    status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";

  return (
    <div className="min-h-screen bg-gray-50 pl-60">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage hotel staff and user accounts efficiently.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm"
        >
          <FaUserPlus className="text-sm" /> Create User
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {formData.id ? "Update User" : "Create New User"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Profile Image */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-4">Profile Picture</label>
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-md border-2 border-gray-200">
                    {formData.profile_image_url ? (
                      <img
                        src={formData.profile_image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <FaUser className="text-gray-400" size={40} />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700">
                      <FaSync className="text-white" size={14} />
                      <input
                        type="file"
                        name="profile_image"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {!formData.id && "*"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!formData.id}
                    placeholder={formData.id ? "Leave blank to keep current password" : "Enter password"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {submitting
                    ? formData.id ? "Updating..." : "Creating..."
                    : formData.id ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {Array.isArray(users) && users.length > 0 ? (
            <table className="w-full hidden lg:table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6">Profile</th>
                  <th className="py-4 px-6">Full Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm">
                        {user.profile_image ? (
                          <img
                            src={`${BASE_URL}/uploads/${user.profile_image}`}
                            alt={user.full_name || user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <FaUser className="text-gray-500" size={20} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold">{user.full_name || user.name}</td>
                    <td className="py-4 px-6 text-gray-600">{user.email}</td>
                    <td className="py-4 px-6 text-gray-600">{user.phone || "-"}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center flex justify-center gap-2">
                      <button onClick={() => handleEdit(user)} className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                        <FaEdit size={16} />
                      </button>
                      <button onClick={() => confirmDelete(user.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <FaUserPlus size={48} className="mx-auto opacity-50 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Start by creating your first user for this hotel.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default User;

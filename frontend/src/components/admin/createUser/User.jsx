// src/components/admin/User.jsx
import React, { useState, useContext, useEffect } from "react";
import { FaUser, FaEdit, FaTrash, FaTimes, FaUserPlus, FaSync } from "react-icons/fa";
import { AuthContext } from "../../../contexts/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useUserPermissions from "../../../contexts/useUserPermissions";

const User = () => {
  const { user } = useContext(AuthContext); // logged-in user
  const perms = useUserPermissions(); // logged-in user's permissions

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { token, users, fetchUsers, selectedHotelId, createUser, updateUser, deleteUser, roles, fetchRoles } = useContext(AuthContext);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    hotel_role: "",
    status: "active",
    profile_image: null,
    profile_image_url: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (selectedHotelId) fetchUsers(selectedHotelId);
  }, [selectedHotelId, fetchUsers]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

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
      hotel_role: "",
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
      const formDataToSend = new FormData();
      formDataToSend.append("full_name", formData.full_name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone || "");
      formDataToSend.append("status", formData.status);
      formDataToSend.append("hotelId", selectedHotelId);

      if (formData.password) formDataToSend.append("password", formData.password);
      if (formData.hotel_role) formDataToSend.append("hotel_role", formData.hotel_role);
      if (formData.profile_image) formDataToSend.append("profile_image", formData.profile_image);

      if (formData.id) {
        await updateUser(formData.id, formDataToSend);
        toast.success("User updated successfully!");
      } else {
        await createUser(formDataToSend);
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

  const handleEdit = (userItem) => {
    setFormData({
      id: userItem.id,
      full_name: userItem.full_name || userItem.name,
      email: userItem.email,
      phone: userItem.phone || "",
      password: "",
      role: userItem.role || "user",
      hotel_role: userItem.hotel_role || userItem.role || "admin",
      status: userItem.status || "active",
      profile_image: null,
      profile_image_url: userItem.profile_image
        ? (userItem.profile_image.startsWith('http')
            ? userItem.profile_image
            : (userItem.profile_image.startsWith('/')
                ? `${BASE_URL}${userItem.profile_image}`
                : `${BASE_URL}/uploads/${userItem.profile_image}`))
        : null,
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
      await deleteUser(id);
      setDeleteId(null);
      toast.dismiss();
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Error deleting user");
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

  // Strictly scope roles to the currently selected hotel only (no global/other hotels)
  // Also remove 'superadmin' and deduplicate by role name
  const availableRoles = Array.from(
    new Map(
      roles
        .filter((role) => role && role.name)
        .filter((role) => role.name.toLowerCase() !== "superadmin")
        .filter((role) => String(role.hotelId) === String(selectedHotelId))
        .map((role) => [role.name.toLowerCase(), role])
    ).values()
  ).filter((role) => role.name.toLowerCase() !== "admin");

  return (
    <div className="min-h-screen bg-gray-50 md:pl-64 pt-16 md:pt-0">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600 text-sm md:text-base">Manage hotel staff and user accounts efficiently.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {(user?.role === "admin" || user?.role === "superadmin" || perms?.user?.create) && (
              <button
                onClick={handleOpenModal}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                <FaUserPlus className="text-sm" /> Create User
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {formData.id ? "Update User" : "Create New User"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Profile Image */}
              <div className="text-center relative z-0">
                <label className="block text-sm font-medium text-gray-700 mb-4">Profile Picture</label>
                <div className="flex flex-col items-center">
                  <div className="relative w-20 md:w-24 h-20 md:h-24 rounded-full overflow-hidden shadow-md border-2 border-gray-200">
                    {formData.profile_image_url ? (
                      <img
                        src={formData.profile_image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <FaUser className="text-gray-400" size={32} />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-blue-600 p-1.5 md:p-2 rounded-full cursor-pointer hover:bg-blue-700">
                      <FaSync className="text-white" size={12} />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
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
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
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
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Role *</label>
                  <select
                    name="hotel_role"
                    value={formData.hotel_role}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                  >
                    <option value="">Select Role</option>
                    {/* Ensure Admin appears only once */}
                    <option value="admin">Admin</option>
                    {availableRoles.map((role) => (
                      <option key={role.id || role.name} value={role.name}>
                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm md:text-base"
                >
                  {submitting ? (formData.id ? "Updating..." : "Creating...") : (formData.id ? "Update User" : "Create User")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table/Cards */}
      <div className="p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {Array.isArray(users) && users.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="py-4 px-6 text-left font-semibold text-gray-900">Profile</th>
                      <th className="py-4 px-6 text-left font-semibold text-gray-900">Full Name</th>
                      <th className="py-4 px-6 text-left font-semibold text-gray-900">Email</th>
                      <th className="py-4 px-6 text-left font-semibold text-gray-900">Phone</th>
                      <th className="py-4 px-6 text-left font-semibold text-gray-900">Role</th>
                      <th className="py-4 px-6 text-left font-semibold text-gray-900">Status</th>
                      <th className="py-4 px-6 text-center font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm">
                            {u.profile_image ? (
                              <img src={(u.profile_image.startsWith('http') ? u.profile_image : (u.profile_image.startsWith('/') ? `${BASE_URL}${u.profile_image}` : `${BASE_URL}/uploads/${u.profile_image}`))} alt={u.full_name || u.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <FaUser className="text-gray-500" size={20} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold">{u.full_name || u.name}</td>
                        <td className="py-4 px-6 text-gray-600">{u.email}</td>
                        <td className="py-4 px-6 text-gray-600">{u.phone || "-"}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(u.hotel_role || u.role)}`}>
                            {(u.hotel_role || u.role)?.charAt(0).toUpperCase() + (u.hotel_role || u.role)?.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(u.status)}`}>
                            {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center gap-2">
                            {(user?.role === "admin" || user?.role === "superadmin" || perms?.user?.updateAny) && (
                              <button
                                onClick={() => handleEdit(u)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Edit User"
                              >
                                <FaEdit size={16} />
                              </button>
                            )}
                            {(user?.role === "admin" || user?.role === "superadmin" || perms?.user?.deleteAny) && (
                              <button
                                onClick={() => confirmDelete(u.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <FaTrash size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-200">
                {users.map((u) => (
                  <div key={u.id} className="p-4 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-16 md:w-20 h-16 md:h-20 rounded-full overflow-hidden shadow-sm flex-shrink-0">
                        {u.profile_image ? (
                          <img src={(u.profile_image.startsWith('http') ? u.profile_image : (u.profile_image.startsWith('/') ? `${BASE_URL}${u.profile_image}` : `${BASE_URL}/uploads/${u.profile_image}`))} alt={u.full_name || u.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <FaUser className="text-gray-500" size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm md:text-base">{u.full_name || u.name}</h4>
                            <p className="text-xs md:text-sm text-gray-600">{u.email}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(u.hotel_role || u.role)}`}>
                              {(u.hotel_role || u.role)?.charAt(0).toUpperCase() + (u.hotel_role || u.role)?.slice(1)}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(u.status)}`}>
                              {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs md:text-sm text-gray-600 mb-3">
                          <p><span className="font-medium">Phone:</span> {u.phone || "Not provided"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {(user?.role === "admin" || user?.role === "superadmin" || perms?.user?.updateAny) && (
                            <button onClick={() => handleEdit(u)} className="flex-1 sm:flex-none px-3 py-1.5 text-green-600 border border-green-600 rounded text-xs md:text-sm hover:bg-green-50 transition-colors" title="Edit User">
                              <FaEdit className="inline mr-1" size={12} /> Edit
                            </button>
                          )}
                          {(user?.role === "admin" || user?.role === "superadmin" || perms?.user?.deleteAny) && (
                            <button onClick={() => confirmDelete(u.id)} className="flex-1 sm:flex-none px-3 py-1.5 text-red-600 border border-red-600 rounded text-xs md:text-sm hover:bg-red-50 transition-colors" title="Delete User">
                              <FaTrash className="inline mr-1" size={12} /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 md:py-16 px-4">
              <FaUserPlus size={32} className="mx-auto opacity-50 mb-4 md:w-12 md:h-12" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 text-sm md:text-base">Start by creating your first user for this hotel.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default User;

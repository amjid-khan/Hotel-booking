import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../contexts/AuthContext";
import "./User.css";

const User = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { token, users, fetchUsers } = useContext(AuthContext);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    status: "active",
    profile_image: null,
  });

  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_image") {
      setFormData({ ...formData, profile_image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("No token found — please log in first.");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      await axios.post(`${BASE_URL}/api/hotel-users`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      fetchUsers();
      handleCloseModal();
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        role: "user",
        status: "active",
        profile_image: null,
      });
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Error creating user");
    }
  };

  const handleDelete = async (id) => {
    if (!token) return alert("No token found — please log in first.");
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/hotel-users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Error deleting user");
    }
  };

  const handleEdit = (user) => {
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      password: "",
      role: user.role,
      status: user.status,
      profile_image: null,
    });
    handleOpenModal();
  };

  return (
    <div className="user">
      <div className="top-section">
        <h3>User Overview</h3>
        <button className="create-btn" onClick={handleOpenModal}>
          Create User
        </button>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h4>{formData.id ? "Edit User" : "Create New User"}</h4>
              <button className="close-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <form className="user-form" onSubmit={handleSubmit}>
                <label>
                  Full Name
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />
                </label>
                <label>
                  Phone
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required={!formData.id}
                  />
                </label>
                <label>
                  Role
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="user">User</option>
                  </select>
                </label>
                <label>
                  Status
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <label>
                  Profile Picture
                  <input type="file" name="profile_image" accept="image/*" onChange={handleChange} />
                </label>
                <button type="submit" className="submit-btn">
                  {formData.id ? "Update User" : "Create User"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="user-table">
        <div className="table-header">
          <span>Profile</span>
          <span>Full Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Role</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {Array.isArray(users) && users.length > 0 ? (
          users.map((u) => (
            <div className="table-row" key={u.id}>
              <div className="profile-cell">
                {u.profile_image && (
                  <img
                    src={`${BASE_URL}/uploads/${u.profile_image}`}
                    alt={u.full_name}
                    className="user-avatar"
                  />
                )}
              </div>
              <span>{u.full_name}</span>
              <span>{u.email}</span>
              <span>{u.phone}</span>
              <span>{u.role}</span>
              <span>{u.status}</span>
              <span className="action-cell">
                <button
                  className="action-btn"
                  onClick={() => setActionMenuOpen(actionMenuOpen === u.id ? null : u.id)}
                >
                  &#x22EE;
                </button>
                {actionMenuOpen === u.id && (
                  <div className="action-menu">
                    <button onClick={() => handleEdit(u)}>Edit</button>
                    <button onClick={() => handleDelete(u.id)}>Delete</button>
                  </div>
                )}
              </span>
            </div>
          ))
        ) : (
          <p className="no-users">No users yet.</p>
        )}
      </div>
    </div>
  );
};

export default User;
